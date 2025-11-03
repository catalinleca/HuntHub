# Asset Management Flow - Complete Guide

**Last updated:** 2025-10-31

**Purpose:** Comprehensive guide to understanding and implementing the asset upload/serving flow for HuntHub. This document explains the concepts, patterns, and implementation details you need to know.

---

## 🎯 What Problem Are We Solving?

### **The Challenge:**

Users need to upload files (images, videos) for:
- Mission challenge reference images (what players should photograph)
- Hunt thumbnails
- User profile pictures

**Requirements:**
- ✅ Users can upload 2-10MB files
- ✅ Files served globally with low latency (< 200ms)
- ✅ Secure (users can only manage their own files)
- ✅ Scalable (works for 10 users or 100,000 users)
- ✅ Cost-effective (< $1/month for portfolio, < 1% of revenue at scale)
- ✅ Production-grade architecture (portfolio quality)

---

## 📊 High-Level Architecture

### **The Pattern: Presigned URLs + CDN**

```
┌─────────────────────────────────────────────────────────────────┐
│                    Asset Upload Flow                             │
└─────────────────────────────────────────────────────────────────┘

1. REQUEST PERMISSION
   Client → Backend API: "I want to upload fountain.jpg"

2. GENERATE URLS
   Backend → AWS SDK: Generate presigned S3 URL
   Backend → Client: Returns { signedUrl, publicUrl }

3. DIRECT UPLOAD
   Client → S3 (Transfer Accelerate): Upload file directly
   (Backend is NOT involved - offloads server!)

4. CONFIRM UPLOAD
   Client → Backend API: "Upload complete, create Asset record"
   Backend → Database: Create Asset { url: publicUrl }

┌─────────────────────────────────────────────────────────────────┐
│                    Asset Serving Flow                            │
└─────────────────────────────────────────────────────────────────┘

Client requests: https://cdn.hunthub.com/456/fountain.jpg
        ↓
CloudFront Edge (closest to user, e.g., Frankfurt)
        ↓ (cache MISS - first time)
CloudFront fetches from S3 origin
        ↓
CloudFront caches at edge for 1 year
        ↓ (cache HIT - subsequent requests)
Returns from edge cache (< 50ms) ✅
```

---

## 🔄 Complete Flow Diagram

```
┌─────────────┐
│   Frontend  │
│   (React)   │
└──────┬──────┘
       │
       │ 1️⃣ POST /api/assets/request-upload?extension=jpeg
       │    Body: (empty - just requesting permission)
       │
       ▼
┌─────────────────────┐
│   Backend API       │
│   (Express)         │
└──────┬──────────────┘
       │
       │ Generates unique filename: {userId}/{assetId}.jpeg
       │ Constructs S3 key: "456/8bea8ffc-0592-42b6.jpeg"
       │
       │ ┌─────────────────────────────────────┐
       │ │ AWS SDK: Generate Presigned URL     │
       │ │                                      │
       │ │ PutObjectCommand({                  │
       │ │   Bucket: 'hunthub-assets',         │
       │ │   Key: '456/8bea8ffc.jpeg',        │
       │ │   ContentType: 'image/jpeg'        │
       │ │ })                                  │
       │ │                                      │
       │ │ getSignedUrl(command, {             │
       │ │   expiresIn: 900  // 15 minutes    │
       │ │ })                                  │
       │ └─────────────────────────────────────┘
       │
       │ Constructs public CDN URL:
       │ publicUrl = "https://cdn.hunthub.com/456/8bea8ffc.jpeg"
       │
       ▼
Response: {
  "signedUrl": "https://hunthub-assets.s3-accelerate.amazonaws.com/456/8bea8ffc.jpeg?X-Amz-Algorithm=...",
  "publicUrl": "https://cdn.hunthub.com/456/8bea8ffc.jpeg",
  "assetId": 8765
}
       │
       ▼
┌─────────────┐
│   Frontend  │
│   (React)   │
└──────┬──────┘
       │
       │ 2️⃣ PUT {signedUrl}
       │    Body: <File blob>
       │    Headers: { 'Content-Type': 'image/jpeg' }
       │
       │ Note: Direct upload to S3!
       │ Backend server is NOT involved!
       │
       ▼
┌──────────────────────────┐
│   AWS S3 Bucket          │
│   (Transfer Accelerate)  │
└──────┬───────────────────┘
       │
       │ File stored at:
       │ s3://hunthub-assets/456/8bea8ffc.jpeg
       │
       │ ✅ Upload complete (200 OK)
       │
       ▼
┌─────────────┐
│   Frontend  │
│   (React)   │
└──────┬──────┘
       │
       │ 3️⃣ POST /api/assets
       │    Body: {
       │      "name": "fountain.jpg",
       │      "mime": "image/jpeg",
       │      "sizeBytes": 2048576,
       │      "url": "https://cdn.hunthub.com/456/8bea8ffc.jpeg"
       │    }
       │
       ▼
┌─────────────────────┐
│   Backend API       │
│   (Express)         │
└──────┬──────────────┘
       │
       │ Validate:
       │ - MIME type allowed
       │ - File size within limits
       │ - User owns this asset (userId in URL)
       │
       ▼
┌─────────────────────┐
│   Database          │
│   (MongoDB)         │
└─────────────────────┘

Asset {
  assetId: 8765,
  ownerId: 456,
  url: "https://cdn.hunthub.com/456/8bea8ffc.jpeg",
  s3Key: "456/8bea8ffc.jpeg",
  mimeType: "image/jpeg",
  originalFilename: "fountain.jpg",
  size: 2048576,
  createdAt: "2025-10-31T12:00:00Z"
}
       │
       ▼
Response to Frontend: Asset object
       │
       ▼
┌─────────────┐
│   Frontend  │
│   (React)   │
└─────────────┘

✅ Upload complete!
✅ Asset record saved in DB
✅ User can now use asset in missions


┌─────────────────────────────────────────────────────────────────┐
│                    SERVING FLOW (Later)                          │
└─────────────────────────────────────────────────────────────────┘

User views mission with reference image:

Frontend renders: <img src="https://cdn.hunthub.com/456/8bea8ffc.jpeg" />
        │
        ▼
DNS lookup: cdn.hunthub.com → d123456abcdef8.cloudfront.net
        │
        ▼
┌────────────────────────┐
│  CloudFront Edge       │
│  (e.g., Frankfurt)     │
└────────┬───────────────┘
         │
         │ Check cache: Do I have this file?
         │
         ├─ CACHE HIT (subsequent requests) ✅
         │  └─ Return immediately (< 50ms)
         │
         └─ CACHE MISS (first request)
            │
            ▼
     ┌─────────────────────┐
     │   S3 Bucket Origin  │
     │   (us-east-1)       │
     └─────────┬───────────┘
               │
               │ Fetch: s3://hunthub-assets/456/8bea8ffc.jpeg
               │
               ▼
     ┌─────────────────────┐
     │  CloudFront Edge    │
     │  Caches file        │
     │  TTL: 1 year        │
     └─────────┬───────────┘
               │
               ▼
     Return to client (first time: ~500ms)
     Next 1000+ requests: < 50ms (cached) ✅
```

---

## 💡 Key Concepts Explained

### **1. Presigned URLs**

**What:** Temporary URL that grants upload permission to S3

**Why:**
- ✅ Client uploads directly to S3 (no server bandwidth)
- ✅ Server controls who can upload (generates URL)
- ✅ Short-lived (15 minutes) for security

**Analogy:** Like a temporary parking pass. You ask security (backend), they give you a pass (presigned URL), you park directly (upload to S3). Pass expires after 15 minutes.

**Example:**
```
Regular S3 URL (doesn't work - bucket is private):
https://hunthub-assets.s3.amazonaws.com/456/fountain.jpg
❌ 403 Forbidden

Presigned URL (works for 15 minutes):
https://hunthub-assets.s3.amazonaws.com/456/fountain.jpg?
  X-Amz-Algorithm=AWS4-HMAC-SHA256&
  X-Amz-Credential=AKIA...&
  X-Amz-Date=20251031T120000Z&
  X-Amz-Expires=900&
  X-Amz-Signature=abc123...
✅ 200 OK (for 15 minutes)
```

---

### **2. publicUrl vs signedUrl**

**Two URLs, Different Purposes:**

```typescript
{
  // Temporary upload permission (15 minutes)
  "signedUrl": "https://hunthub-assets.s3-accelerate.amazonaws.com/456/asset.jpg?X-Amz-...",

  // Permanent CDN URL (stored in database)
  "publicUrl": "https://cdn.hunthub.com/456/asset.jpg"
}
```

**signedUrl:**
- ⏱️ Expires in 15 minutes
- 🔓 Grants upload permission
- 🎯 Used once (for upload)
- 🚫 Never stored in database
- 📝 Generated by AWS SDK

**publicUrl:**
- ♾️ Permanent (never expires)
- 🔒 Read-only (via CloudFront)
- 🎯 Used many times (for viewing)
- 💾 Stored in database
- 📝 Generated by YOUR backend (string manipulation)

**How publicUrl is constructed:**
```typescript
// Backend generates this (NOT AWS!)
const s3Key = `${userId}/${assetId}.${extension}`;
const publicUrl = `https://${CDN_DOMAIN}/${s3Key}`;

// Example:
// s3Key = "456/8bea8ffc-0592-42b6.jpeg"
// publicUrl = "https://cdn.hunthub.com/456/8bea8ffc-0592-42b6.jpeg"
```

---

### **3. CloudFront CDN (Content Delivery Network)**

**What:** Global network of servers that cache your files close to users

**Why:**
- 🌍 Global edge locations (200+ cities worldwide)
- ⚡ Fast delivery (< 50ms vs 500ms direct from S3)
- 💰 Cheaper than EC2 bandwidth ($0.085/GB vs $0.09/GB)
- 🛡️ DDoS protection
- 🗜️ Automatic compression (saves bandwidth)

**How it works:**

```
User in Tokyo requests: https://cdn.hunthub.com/456/fountain.jpg

Without CDN:
Tokyo → S3 us-east-1 (Virginia) → 12,000 km → 500ms ❌

With CDN:
Tokyo → CloudFront Tokyo Edge → 0 km → 50ms ✅
(First request fetches from S3, subsequent requests cached)
```

**CloudFront Configuration:**
```yaml
Origin: S3 bucket (hunthub-assets)
Custom Domain: cdn.hunthub.com
Cache TTL: 1 year (assets are immutable)
Compression: Enabled (gzip/brotli)
HTTPS: Required (redirect HTTP → HTTPS)
Security: Origin Access Identity (S3 is private)
```

---

### **4. S3 Transfer Acceleration**

**What:** Routes uploads through AWS edge locations (faster)

**Why:**
- ⚡ 50-500% faster uploads for global users
- 🌐 Uses AWS backbone network (optimized routes)
- 💰 Costs $0.04/GB extra (worth it!)

**How it works:**

```
Without Acceleration:
User in Berlin → S3 us-east-1 → Public internet → 150ms upload ❌

With Acceleration:
User in Berlin → CloudFront Berlin Edge → AWS backbone → S3 us-east-1 → 50ms upload ✅
```

**Enable in S3 bucket:**
```bash
aws s3api put-bucket-accelerate-configuration \
  --bucket hunthub-assets \
  --accelerate-configuration Status=Enabled
```

**URLs change:**
```typescript
// Regular S3 endpoint:
hunthub-assets.s3.amazonaws.com

// Accelerated endpoint:
hunthub-assets.s3-accelerate.amazonaws.com  // ← Use this!
```

---

### **5. Origin Access Identity (OAI)**

**What:** Special CloudFront identity that can read from private S3

**Why:** S3 bucket should be private, only CloudFront can access

**Security Model:**

```
Direct S3 URL (blocked):
https://hunthub-assets.s3.amazonaws.com/456/fountain.jpg
❌ 403 Forbidden

CloudFront URL (works):
https://cdn.hunthub.com/456/fountain.jpg
✅ 200 OK

Why: S3 bucket policy only allows CloudFront OAI
```

**S3 Bucket Policy:**
```json
{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Principal": {
      "AWS": "arn:aws:iam::cloudfront:user/CloudFront Origin Access Identity E123ABC"
    },
    "Action": "s3:GetObject",
    "Resource": "arn:aws:s3:::hunthub-assets/*"
  }]
}
```

**Result:** Files can ONLY be accessed via CloudFront (not directly from S3).

---

## 🏗️ HuntHub Implementation

### **Backend Architecture**

```
src/
├── modules/
│   └── assets/
│       ├── asset.controller.ts    # HTTP endpoints
│       ├── asset.service.ts       # Business logic
│       ├── asset.routes.ts        # Route definitions
│       └── asset.validation.ts    # Request validation
├── services/
│   └── storage.service.ts         # AWS S3 integration (presigned URLs)
├── database/
│   ├── models/
│   │   └── Asset.ts               # Mongoose model
│   └── types/
│       └── Asset.ts               # TypeScript interfaces
└── shared/
    └── mappers/
        └── asset.mapper.ts        # DB ↔ API transformation
```

---

### **Backend: StorageService (AWS Integration)**

```typescript
// src/services/storage.service.ts

import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { injectable } from 'inversify';
import crypto from 'crypto';

@injectable()
export class StorageService {
  private s3Client: S3Client;
  private bucketName = process.env.S3_BUCKET_NAME!;        // 'hunthub-assets'
  private cdnDomain = process.env.CDN_DOMAIN!;             // 'cdn.hunthub.com'
  private useAcceleration = process.env.S3_USE_ACCELERATION === 'true';

  constructor() {
    this.s3Client = new S3Client({
      region: process.env.AWS_REGION!,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
      },
    });
  }

  /**
   * Generate presigned URL for client-side S3 upload
   *
   * @param userId - User ID (for S3 key structure)
   * @param extension - File extension (jpeg, png, mp4)
   * @returns Object with signedUrl (upload) and publicUrl (serving)
   */
  async generateUploadUrls(
    userId: string,
    extension: string
  ): Promise<{ signedUrl: string; publicUrl: string; s3Key: string }> {
    // 1. Generate unique filename
    const assetId = crypto.randomUUID();
    const filename = `${assetId}.${extension}`;

    // 2. Construct S3 key (path in bucket)
    // Structure: {userId}/{assetId}.{extension}
    const s3Key = `${userId}/${filename}`;

    // 3. Generate presigned URL for S3 upload
    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: s3Key,
      ContentType: this.getMimeType(extension),
    });

    // Use Transfer Acceleration endpoint if enabled
    const clientConfig = this.useAcceleration
      ? { ...this.s3Client.config, useAccelerateEndpoint: true }
      : this.s3Client.config;

    const acceleratedClient = new S3Client(clientConfig);

    const signedUrl = await getSignedUrl(acceleratedClient, command, {
      expiresIn: 900, // 15 minutes
    });

    // 4. Construct public CDN URL (for serving)
    // This is just string manipulation - CloudFront maps it to S3
    const publicUrl = `https://${this.cdnDomain}/${s3Key}`;

    return {
      signedUrl,   // Client uploads here (temporary)
      publicUrl,   // Client saves this in DB (permanent)
      s3Key,       // Backend saves this for reference
    };
  }

  private getMimeType(extension: string): string {
    const mimeTypes: Record<string, string> = {
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      png: 'image/png',
      webp: 'image/webp',
      gif: 'image/gif',
      mp4: 'video/mp4',
      webm: 'video/webm',
      mp3: 'audio/mp3',
      wav: 'audio/wav',
    };
    return mimeTypes[extension.toLowerCase()] || 'application/octet-stream';
  }
}
```

---

### **Backend: AssetService (Business Logic)**

```typescript
// src/modules/assets/asset.service.ts

import { injectable, inject } from 'inversify';
import { StorageService } from '@/services/storage.service';
import AssetModel from '@/database/models/Asset';
import { AssetMapper } from '@/shared/mappers/asset.mapper';
import { ValidationError, NotFoundError } from '@/shared/errors';

export interface AssetCreate {
  name: string;
  mime: string;
  sizeBytes: number;
  url: string;  // publicUrl from step 1
}

@injectable()
export class AssetService {
  constructor(
    @inject(StorageService) private storageService: StorageService
  ) {}

  /**
   * Step 1: Request upload permission
   * Generate presigned URL for client to upload directly to S3
   */
  async requestUpload(
    userId: string,
    extension: string
  ): Promise<{ signedUrl: string; publicUrl: string }> {
    // Validate extension
    const allowedExtensions = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'mp4', 'webm'];
    if (!allowedExtensions.includes(extension.toLowerCase())) {
      throw new ValidationError(`Extension '${extension}' not allowed`);
    }

    // Generate presigned URL
    const { signedUrl, publicUrl } = await this.storageService.generateUploadUrls(
      userId,
      extension
    );

    return { signedUrl, publicUrl };
  }

  /**
   * Step 2: Create asset record after upload
   * Client has already uploaded to S3, now we save metadata
   */
  async createAsset(
    userId: string,
    assetData: AssetCreate
  ): Promise<Asset> {
    // Validate MIME type (don't trust client!)
    const allowedMimeTypes = [
      'image/jpeg', 'image/png', 'image/webp', 'image/gif',
      'video/mp4', 'video/webm',
      'audio/mp3', 'audio/wav',
    ];

    if (!allowedMimeTypes.includes(assetData.mime)) {
      throw new ValidationError(`MIME type '${assetData.mime}' not allowed`);
    }

    // Validate file size (10MB limit)
    const maxSizeBytes = 10 * 1024 * 1024; // 10MB
    if (assetData.sizeBytes > maxSizeBytes) {
      throw new ValidationError(`File size exceeds ${maxSizeBytes} bytes`);
    }

    // Create asset record
    const asset = await AssetModel.create({
      ownerId: userId,
      url: assetData.url,          // CDN URL
      mimeType: assetData.mime,
      originalFilename: assetData.name,
      size: assetData.sizeBytes,
    });

    return AssetMapper.fromDocument(asset);
  }

  /**
   * Get user's media library
   */
  async getUserAssets(userId: string, mimeType?: string): Promise<Asset[]> {
    const assets = mimeType
      ? await AssetModel.findByOwnerAndType(userId, mimeType)
      : await AssetModel.findByOwner(userId);

    return AssetMapper.fromDocuments(assets);
  }

  /**
   * Get single asset
   */
  async getAssetById(assetId: number, userId: string): Promise<Asset> {
    const asset = await AssetModel.findOne({ assetId, ownerId: userId });

    if (!asset) {
      throw new NotFoundError('Asset not found');
    }

    return AssetMapper.fromDocument(asset);
  }

  /**
   * Delete asset
   * Note: For MVP, we don't delete from S3 (keep files for safety)
   * In production, you might want to delete from S3 or move to "deleted" folder
   */
  async deleteAsset(assetId: number, userId: string): Promise<void> {
    const asset = await AssetModel.findOne({ assetId, ownerId: userId });

    if (!asset) {
      throw new NotFoundError('Asset not found');
    }

    await asset.deleteOne();
  }
}
```

---

### **Backend: AssetController (HTTP Handlers)**

```typescript
// src/modules/assets/asset.controller.ts

import { Request, Response } from 'express';
import { injectable, inject } from 'inversify';
import { AssetService } from './asset.service';

@injectable()
export class AssetController {
  constructor(
    @inject(AssetService) private assetService: AssetService
  ) {}

  /**
   * POST /api/assets/request-upload?extension=jpeg
   * Step 1: Request upload permission
   */
  requestUpload = async (req: Request, res: Response) => {
    const { extension } = req.query;
    const userId = req.user.id;

    if (!extension || typeof extension !== 'string') {
      return res.status(400).json({
        message: 'extension query parameter required'
      });
    }

    const urls = await this.assetService.requestUpload(userId, extension);

    res.status(200).json(urls);
  };

  /**
   * POST /api/assets
   * Step 2: Create asset record after upload
   */
  createAsset = async (req: Request, res: Response) => {
    const userId = req.user.id;
    const assetData = req.body;

    const asset = await this.assetService.createAsset(userId, assetData);

    res.status(201).json(asset);
  };

  /**
   * GET /api/assets
   * Get user's media library
   */
  getAssets = async (req: Request, res: Response) => {
    const userId = req.user.id;
    const { type } = req.query;

    const assets = await this.assetService.getUserAssets(
      userId,
      type as string
    );

    res.status(200).json(assets);
  };

  /**
   * GET /api/assets/:id
   * Get single asset
   */
  getAsset = async (req: Request, res: Response) => {
    const userId = req.user.id;
    const { id } = req.params;

    const asset = await this.assetService.getAssetById(
      Number(id),
      userId
    );

    res.status(200).json(asset);
  };

  /**
   * DELETE /api/assets/:id
   * Delete asset
   */
  deleteAsset = async (req: Request, res: Response) => {
    const userId = req.user.id;
    const { id } = req.params;

    await this.assetService.deleteAsset(Number(id), userId);

    res.status(204).send();
  };
}
```

---

### **Backend: Routes**

```typescript
// src/modules/assets/asset.routes.ts

import { Router } from 'express';
import { authMiddleware } from '@/shared/middlewares/auth.middleware';
import { validateRequest } from '@/shared/middlewares/validation.middleware';
import { container } from '@/config/inversify';
import { AssetController } from './asset.controller';
import { createAssetSchema } from './asset.validation';

const router = Router();
const controller = container.get<AssetController>(AssetController);

// All routes require authentication
router.use(authMiddleware);

// Step 1: Request upload permission
router.post(
  '/request-upload',
  controller.requestUpload
);

// Step 2: Create asset record
router.post(
  '/',
  validateRequest(createAssetSchema),
  controller.createAsset
);

// Get media library
router.get('/', controller.getAssets);

// Get single asset
router.get('/:id', controller.getAsset);

// Delete asset
router.delete('/:id', controller.deleteAsset);

export default router;
```

---

### **Frontend: useAssetUpload Hook**

```typescript
// frontend/src/hooks/useAssetUpload.ts

import { useState } from 'react';
import axios from 'axios';
import { api } from '@/services/api';
import type { Asset } from '@hunthub/shared';

interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

export function useAssetUpload() {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState<UploadProgress>({
    loaded: 0,
    total: 0,
    percentage: 0,
  });

  const uploadAsset = async (file: File): Promise<Asset> => {
    try {
      setUploading(true);

      // Get file extension
      const extension = file.name.split('.').pop() || '';

      // Step 1: Request upload permission
      const { data: urls } = await api.post(
        `/assets/request-upload?extension=${extension}`
      );

      const { signedUrl, publicUrl } = urls;

      // Step 2: Upload directly to S3 (no server involved!)
      await axios.put(signedUrl, file, {
        headers: {
          'Content-Type': file.type,
        },
        onUploadProgress: (progressEvent) => {
          const loaded = progressEvent.loaded || 0;
          const total = progressEvent.total || 0;
          const percentage = total > 0 ? Math.round((loaded * 100) / total) : 0;

          setProgress({ loaded, total, percentage });
        },
      });

      // Step 3: Create asset record in database
      const { data: asset } = await api.post('/assets', {
        name: file.name,
        mime: file.type,
        sizeBytes: file.size,
        url: publicUrl,  // Store CDN URL
      });

      return asset;
    } finally {
      setUploading(false);
      setProgress({ loaded: 0, total: 0, percentage: 0 });
    }
  };

  return {
    uploadAsset,
    uploading,
    progress,
  };
}
```

---

### **Frontend: MediaLibrary Component**

```typescript
// frontend/src/components/MediaLibrary.tsx

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/services/api';
import { useAssetUpload } from '@/hooks/useAssetUpload';
import type { Asset } from '@hunthub/shared';

export function MediaLibrary() {
  const queryClient = useQueryClient();
  const { uploadAsset, uploading, progress } = useAssetUpload();

  // Fetch user's assets
  const { data: assets, isLoading } = useQuery<Asset[]>({
    queryKey: ['assets'],
    queryFn: () => api.get('/assets').then(res => res.data),
  });

  // Delete asset
  const deleteMutation = useMutation({
    mutationFn: (assetId: number) => api.delete(`/assets/${assetId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assets'] });
    },
  });

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      await uploadAsset(file);

      // Refresh asset list
      queryClient.invalidateQueries({ queryKey: ['assets'] });

      alert('Upload successful!');
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Upload failed. Please try again.');
    }
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="media-library">
      <h2>Media Library</h2>

      {/* Upload Area */}
      <div className="upload-area">
        <input
          type="file"
          accept="image/*,video/*"
          onChange={handleFileSelect}
          disabled={uploading}
        />

        {uploading && (
          <div className="progress">
            <div
              className="progress-bar"
              style={{ width: `${progress.percentage}%` }}
            />
            <span>{progress.percentage}%</span>
          </div>
        )}
      </div>

      {/* Asset Grid */}
      <div className="asset-grid">
        {assets?.map((asset) => (
          <div key={asset.assetId} className="asset-card">
            {asset.mimeType.startsWith('image/') ? (
              <img
                src={asset.url}  // ← CloudFront CDN URL, cached!
                alt={asset.originalFilename}
                loading="lazy"
              />
            ) : (
              <video src={asset.url} controls />
            )}

            <div className="asset-info">
              <span>{asset.originalFilename}</span>
              <button
                onClick={() => deleteMutation.mutate(asset.assetId)}
                disabled={deleteMutation.isPending}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

## 🔒 Security Considerations

### **1. Presigned URL Expiration**

```typescript
// ✅ Good: Short expiration (15 minutes)
expiresIn: 900

// ❌ Bad: Long expiration (24 hours)
expiresIn: 86400  // Attacker has 24 hours to abuse URL
```

### **2. Filename Sanitization**

```typescript
// ❌ Bad: Use user's filename directly
const s3Key = `${userId}/${userFilename}`;
// User could upload: "../../../etc/passwd" (path traversal!)

// ✅ Good: Generate your own filename
const s3Key = `${userId}/${crypto.randomUUID()}.${extension}`;
```

### **3. MIME Type Validation**

```typescript
// ❌ Bad: Trust client's MIME type
await AssetModel.create({ mime: req.body.mime });

// ✅ Good: Validate against allowed types
const allowedMimeTypes = ['image/jpeg', 'image/png'];
if (!allowedMimeTypes.includes(req.body.mime)) {
  throw new ValidationError('Invalid MIME type');
}
```

### **4. File Size Limits**

```typescript
// In presigned URL
const command = new PutObjectCommand({
  Bucket: bucket,
  Key: key,
  ContentType: mimeType,
  ContentLength: 10 * 1024 * 1024,  // ✅ Enforce 10MB limit
});

// In asset creation
if (assetData.sizeBytes > 10 * 1024 * 1024) {
  throw new ValidationError('File too large');
}
```

### **5. Ownership Verification**

```typescript
// ✅ Always verify user owns the asset
const asset = await AssetModel.findOne({
  assetId,
  ownerId: userId  // ← Critical!
});

if (!asset) {
  throw new NotFoundError('Asset not found');
}
```

---

## 📊 Cost Optimization

### **1. CloudFront Cache Policy**

```typescript
// Immutable assets (never change)
Cache-Control: public, max-age=31536000, immutable  // 1 year

// Results:
// - First request: 500ms (fetch from S3)
// - Next 1 million requests: 50ms (edge cache)
// - Saves 99.9% of S3 GET requests
```

### **2. Lifecycle Policies**

```yaml
# Delete incomplete uploads after 1 day
LifecycleConfiguration:
  Rules:
    - Id: DeleteIncompleteUploads
      Status: Enabled
      AbortIncompleteMultipartUpload:
        DaysAfterInitiation: 1

# Archive old assets to Glacier (optional)
# Useful if users upload but rarely view old content
LifecycleConfiguration:
  Rules:
    - Id: ArchiveOldAssets
      Status: Enabled
      Transitions:
        - TransitionInDays: 90
          StorageClass: GLACIER  # $0.004/GB vs $0.023/GB
```

### **3. S3 Storage Classes**

```
Standard: $0.023/GB/month (frequent access)
Standard-IA: $0.0125/GB/month (infrequent access, >30 days)
Glacier: $0.004/GB/month (archive, retrieval takes hours)
Intelligent-Tiering: Auto-optimizes (worth it at scale)
```

---

## 🧪 Testing Strategy

### **1. Test Presigned URL Generation**

```typescript
// tests/modules/assets/asset.service.test.ts

describe('AssetService - requestUpload', () => {
  it('should generate presigned URL with correct expiration', async () => {
    const { signedUrl, publicUrl } = await assetService.requestUpload(
      'user-123',
      'jpeg'
    );

    // signedUrl should contain AWS signature
    expect(signedUrl).toContain('X-Amz-Signature');
    expect(signedUrl).toContain('X-Amz-Expires=900');

    // publicUrl should use CDN domain
    expect(publicUrl).toContain('cdn.hunthub.com');
    expect(publicUrl).toContain('user-123');
  });

  it('should reject invalid extensions', async () => {
    await expect(
      assetService.requestUpload('user-123', 'exe')
    ).rejects.toThrow('Extension \'exe\' not allowed');
  });
});
```

### **2. Test Direct S3 Upload**

```typescript
// tests/integration/s3-upload.test.ts

describe('S3 Direct Upload', () => {
  it('should upload file using presigned URL', async () => {
    // 1. Request presigned URL
    const response = await request(app)
      .post('/api/assets/request-upload?extension=jpeg')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    const { signedUrl, publicUrl } = response.body;

    // 2. Upload file directly to S3
    const file = Buffer.from('fake image data');
    const uploadResponse = await axios.put(signedUrl, file, {
      headers: { 'Content-Type': 'image/jpeg' },
    });

    expect(uploadResponse.status).toBe(200);

    // 3. Verify file is accessible via CloudFront
    const cdnResponse = await axios.get(publicUrl);
    expect(cdnResponse.status).toBe(200);
  });
});
```

### **3. Test Asset Creation**

```typescript
describe('AssetController - createAsset', () => {
  it('should create asset record with valid data', async () => {
    const response = await request(app)
      .post('/api/assets')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'fountain.jpg',
        mime: 'image/jpeg',
        sizeBytes: 2048576,
        url: 'https://cdn.hunthub.com/123/asset.jpg',
      })
      .expect(201);

    expect(response.body).toMatchObject({
      assetId: expect.any(Number),
      ownerId: 'user-123',
      url: 'https://cdn.hunthub.com/123/asset.jpg',
      mimeType: 'image/jpeg',
    });
  });

  it('should reject file size over limit', async () => {
    await request(app)
      .post('/api/assets')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'huge.jpg',
        mime: 'image/jpeg',
        sizeBytes: 20 * 1024 * 1024, // 20MB
        url: 'https://cdn.hunthub.com/123/huge.jpg',
      })
      .expect(400);
  });
});
```

---

## 🐛 Common Issues & Troubleshooting

### **1. CORS Errors**

**Problem:**
```
Access to fetch at 'https://hunthub-assets.s3.amazonaws.com/...'
has been blocked by CORS policy
```

**Solution:** Add CORS configuration to S3 bucket
```json
[
  {
    "AllowedOrigins": ["http://localhost:3000", "https://hunthub.com"],
    "AllowedMethods": ["PUT", "POST", "GET"],
    "AllowedHeaders": ["*"],
    "ExposeHeaders": ["ETag"],
    "MaxAge": 3000
  }
]
```

---

### **2. 403 Forbidden from S3**

**Problem:** Presigned URL returns 403

**Solutions:**
- Check IAM user has `s3:PutObject` permission
- Check bucket name is correct
- Check region matches
- Check presigned URL hasn't expired (15 min)

---

### **3. CloudFront Returns 404**

**Problem:** `https://cdn.hunthub.com/test.jpg` returns 404

**Solutions:**
- Wait 15-20 minutes after creating CloudFront distribution
- Check distribution status is "Deployed"
- Check S3 file exists at correct path
- Check OAI has permission to read from S3

---

### **4. Upload Succeeds but File Not Visible**

**Problem:** Upload completes, but file doesn't appear

**Solutions:**
- Check S3 key structure matches what you expect
- Check CloudFront origin path configuration
- Try direct S3 URL first (if public) to verify file exists
- Check CloudFront cache (might need invalidation)

---

## 📚 Further Reading

**AWS Documentation:**
- [S3 Presigned URLs](https://docs.aws.amazon.com/AmazonS3/latest/userguide/using-presigned-url.html)
- [CloudFront with S3](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/GettingStarted.SimpleDistribution.html)
- [S3 Transfer Acceleration](https://docs.aws.amazon.com/AmazonS3/latest/userguide/transfer-acceleration.html)

**Best Practices:**
- [AWS Well-Architected Framework - Performance Efficiency](https://docs.aws.amazon.com/wellarchitected/latest/performance-efficiency-pillar/welcome.html)
- [S3 Security Best Practices](https://docs.aws.amazon.com/AmazonS3/latest/userguide/security-best-practices.html)

**Production Examples:**
- EF Studio (your reference implementation)
- Airbnb (property photos)
- Dropbox (file uploads)
- Figma (design assets)

---

## ✅ Summary

**Key Takeaways:**

1. **3-Step Flow:** Request permission → Upload to S3 → Confirm in DB
2. **Two URLs:** signedUrl (temporary upload) + publicUrl (permanent CDN)
3. **Direct Upload:** Client uploads to S3 directly (no server bandwidth)
4. **CloudFront CDN:** Global caching (fast + cheap)
5. **S3 Transfer Acceleration:** Faster uploads via edge locations
6. **Security:** Private S3 bucket, only CloudFront can access
7. **Cost:** ~$0-1/month for portfolio, < 1% revenue at scale

**This pattern is used by:**
- ✅ Airbnb
- ✅ Dropbox
- ✅ Figma
- ✅ Notion
- ✅ Every modern SaaS application

**You're building production-grade infrastructure!** 🚀

---

**Last updated:** 2025-10-31
**Next:** See `aws-setup-guide.md` for step-by-step AWS configuration