# AWS Setup Guide - From Zero to CloudFormation

**Last updated:** 2025-10-31

**Purpose:** Step-by-step guide to set up AWS infrastructure for HuntHub asset management. Assumes you remember NOTHING about AWS.

**What you'll set up:**
- AWS account and credentials
- S3 bucket for storing files
- CloudFront CDN for serving files
- IAM roles and policies for security
- CloudFormation for infrastructure as code

**Time required:** 2-4 hours (first time)

---

## Table of Contents

1. [Part 1: AWS Account & Credentials Setup](#part-1-aws-account--credentials-setup)
2. [Part 2: Understanding CloudFormation (Conceptual)](#part-2-understanding-cloudformation-conceptual)
3. [Part 3: Manual Console Setup (Learning Path)](#part-3-manual-console-setup-learning-path)
4. [Part 4: CloudFormation Deployment (Production Path)](#part-4-cloudformation-deployment-production-path)
5. [Part 5: Backend Integration](#part-5-backend-integration)
6. [Part 6: Testing & Validation](#part-6-testing--validation)
7. [Part 7: Troubleshooting](#part-7-troubleshooting)
8. [Part 8: Cost Monitoring & Cleanup](#part-8-cost-monitoring--cleanup)

---

# Part 1: AWS Account & Credentials Setup

## Step 1.1: Create AWS Account (If You Don't Have One)

**If you already have an AWS account, skip to Step 1.2**

1. Go to https://aws.amazon.com
2. Click "Create an AWS Account"
3. Enter your email address
4. Choose "Personal" account type
5. Fill in contact information
6. **Payment Method:**
   - You MUST enter a credit card
   - AWS won't charge you for free tier usage
   - They may charge $1 temporarily to verify the card (refunded)
7. **Phone Verification:**
   - AWS will call/text you a code
   - Enter the code to verify
8. **Support Plan:**
   - Choose "Basic Support - Free"
   - Don't pay for support plans

**⏰ Wait time:** 5-10 minutes for account activation

---

## Step 1.2: Sign In to AWS Console

1. Go to https://console.aws.amazon.com
2. Click "Sign in to the Console"
3. Enter your root account email
4. Enter your password
5. **YOU ARE NOW IN THE AWS CONSOLE**

**What you should see:**
- Orange navigation bar at top
- "AWS Management Console" heading
- Search bar saying "Search for services, features..."
- Grid of service icons (EC2, S3, RDS, etc.)

**⚠️ IMPORTANT - Region Selection:**
- Look at top-right corner, next to your account name
- You'll see something like "N. Virginia" or "US East (N. Virginia)"
- **Click on it and select your preferred region**
- For this guide, we'll use **us-east-1 (N. Virginia)** - it's the cheapest and most feature-complete
- **REMEMBER YOUR REGION** - all resources must be in the same region

---

## Step 1.3: Create IAM User (CRITICAL - Don't Use Root Account)

**Why:** Root account has unlimited power. You should create an IAM user with limited permissions.

### 1.3.1: Navigate to IAM

1. In AWS Console search bar (top), type "IAM"
2. Click "IAM" (Identity and Access Management)
3. You should see the IAM Dashboard

**What you should see:**
- Left sidebar with menu items (Users, Groups, Roles, Policies)
- Summary showing 0 users, 0 groups, etc.

### 1.3.2: Create IAM User

1. Click "Users" in left sidebar
2. Click orange "Create user" button (top right)
3. **User details:**
   - User name: `hunthub-developer` (or your name)
   - ✅ Check "Provide user access to the AWS Management Console"
   - Choose "I want to create an IAM user"
   - ✅ Check "Custom password"
   - Enter a strong password (you'll use this to log in)
   - ❌ Uncheck "Users must create a new password at next sign-in"
4. Click "Next"

### 1.3.3: Set Permissions

1. **Permissions options:**
   - Select "Attach policies directly"
2. **Search for and select these policies:**
   - Type "S3Full" → Check ✅ **AmazonS3FullAccess**
   - Type "CloudFront" → Check ✅ **CloudFrontFullAccess**
   - Type "IAMFull" → Check ✅ **IAMFullAccess**
   - Type "CloudFormation" → Check ✅ **AWSCloudFormationFullAccess**

   **⚠️ WARNING:** These are powerful permissions. Only use this user for development.

3. Click "Next"

### 1.3.4: Review and Create

1. Review the user details
2. Click "Create user"
3. **CRITICAL:** You'll see a success message with:
   - Console sign-in URL (e.g., `https://123456789012.signin.aws.amazon.com/console`)
   - User name: `hunthub-developer`
   - Console password: `[your password]`

4. **SAVE THESE CREDENTIALS:**
   ```
   Console URL: https://123456789012.signin.aws.amazon.com/console
   Username: hunthub-developer
   Password: [your password]
   ```

5. Click "Return to users list"

---

## Step 1.4: Create Access Keys (For AWS CLI / SDK)

**Why:** Your Node.js backend needs programmatic access to AWS.

### 1.4.1: Navigate to User

1. You should be on the "Users" page
2. Click on `hunthub-developer` (the user you just created)
3. You'll see tabs: Permissions, Groups, Tags, Security credentials, Access Advisor

### 1.4.2: Create Access Key

1. Click "Security credentials" tab
2. Scroll down to "Access keys" section
3. Click "Create access key" button
4. **Use case:** Select "Command Line Interface (CLI)"
5. ✅ Check the box "I understand the above recommendation..."
6. Click "Next"
7. **Description (optional):** `HuntHub Backend Development`
8. Click "Create access key"

### 1.4.3: SAVE YOUR CREDENTIALS (CRITICAL)

**⚠️ THIS IS THE ONLY TIME YOU'LL SEE THE SECRET KEY**

You'll see:
```
Access key ID: AKIAIOSFODNN7EXAMPLE
Secret access key: wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
```

**DO THIS NOW:**

1. Click "Download .csv file" button (saves both keys)
2. **ALSO** copy both values to a secure location:
   ```bash
   # Save these somewhere safe (NOT in your git repo!)
   AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE
   AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
   AWS_REGION=us-east-1
   ```

3. Click "Done"

**⚠️ SECURITY WARNING:**
- Never commit these keys to git
- Never share them publicly
- If exposed, delete them immediately and create new ones

---

## Step 1.5: Install AWS CLI (Optional but Recommended)

**Why:** Easier to test and debug. CloudFormation can be deployed via CLI or Console.

### 1.5.1: Install AWS CLI

**macOS:**
```bash
# Option 1: Homebrew
brew install awscli

# Option 2: Download installer
curl "https://awscli.amazonaws.com/AWSCLIV2.pkg" -o "AWSCLIV2.pkg"
sudo installer -pkg AWSCLIV2.pkg -target /
```

**Verify installation:**
```bash
aws --version
# Should show: aws-cli/2.x.x Python/3.x.x Darwin/...
```

### 1.5.2: Configure AWS CLI

```bash
aws configure
```

**It will prompt you for:**
```
AWS Access Key ID [None]: AKIAIOSFODNN7EXAMPLE
AWS Secret Access Key [None]: wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
Default region name [None]: us-east-1
Default output format [None]: json
```

**Test it works:**
```bash
aws sts get-caller-identity
```

**Expected output:**
```json
{
    "UserId": "AIDAI...",
    "Account": "123456789012",
    "Arn": "arn:aws:iam::123456789012:user/hunthub-developer"
}
```

**✅ If you see this, AWS CLI is configured correctly!**

---

# Part 2: Understanding CloudFormation (Conceptual)

## What is CloudFormation?

**Simple explanation:** CloudFormation is like a recipe for your AWS infrastructure.

**Without CloudFormation:**
```
1. Click in Console → Create S3 bucket
2. Click → Configure bucket settings
3. Click → Create CloudFront distribution
4. Click → Link CloudFront to S3
5. Click → Configure security settings
... 20 more clicks ...

⚠️ Next time you need to recreate this:
- Try to remember all settings
- Probably miss something
- Takes 1-2 hours
```

**With CloudFormation:**
```yaml
# hunthub-assets.yaml
Resources:
  AssetBucket:
    Type: AWS::S3::Bucket
    Properties:
      BucketName: hunthub-assets

  CloudFrontDistribution:
    Type: AWS::CloudFront::Distribution
    Properties:
      # ... all settings here

# Deploy with one command:
aws cloudformation create-stack --stack-name hunthub-assets --template-body file://hunthub-assets.yaml

⏰ Takes 5 minutes, always identical
```

## Key CloudFormation Concepts

### Stack
A "stack" is a collection of AWS resources managed as a single unit.

**Example:**
- Stack name: `hunthub-assets-production`
- Contains: S3 bucket + CloudFront distribution + IAM roles

**Stack operations:**
- `create-stack` - Creates all resources
- `update-stack` - Updates resources (add/modify)
- `delete-stack` - Deletes all resources

### Template
A YAML (or JSON) file defining what resources to create.

```yaml
Resources:
  MyBucket:
    Type: AWS::S3::Bucket
    Properties:
      BucketName: my-bucket-name
```

### Parameters
Variables you pass when creating stack.

```yaml
Parameters:
  BucketName:
    Type: String
    Description: Name of the S3 bucket

Resources:
  MyBucket:
    Type: AWS::S3::Bucket
    Properties:
      BucketName: !Ref BucketName  # Uses parameter
```

**Deploy with:**
```bash
aws cloudformation create-stack \
  --stack-name my-stack \
  --template-body file://template.yaml \
  --parameters ParameterKey=BucketName,ParameterValue=hunthub-assets
```

### Outputs
Values exported after stack creation.

```yaml
Outputs:
  BucketURL:
    Value: !GetAtt MyBucket.DomainName
    Description: S3 bucket URL
```

**After stack creates, you can see:**
```bash
aws cloudformation describe-stacks --stack-name my-stack
# Shows: BucketURL = hunthub-assets.s3.amazonaws.com
```

---

## CloudFormation Workflow

```
1. Write YAML template (defines infrastructure)
2. Validate template (check syntax)
3. Create stack (AWS creates resources)
4. Wait for completion (5-10 minutes)
5. Check outputs (get URLs, IDs)
6. Use in your app!

Later:
7. Modify template (change settings)
8. Update stack (AWS updates resources)
9. Or delete stack (clean up everything)
```

---

# Part 3: Manual Console Setup (Learning Path)

**Why do this:** Understand what each resource does before automating.

**You'll learn:**
- How S3 buckets work
- How CloudFront distributions work
- How they connect together

**Time:** 1-2 hours

**After this, you'll create CloudFormation template to automate it.**

---

## Step 3.1: Create S3 Bucket

### 3.1.1: Navigate to S3

1. In AWS Console search bar, type "S3"
2. Click "S3" (Scalable Storage in the Cloud)
3. You should see "Amazon S3" dashboard
4. Click orange "Create bucket" button

### 3.1.2: Configure Bucket Settings

**Bucket Settings Page 1 - General:**

1. **Bucket name:**
   - Must be globally unique across ALL AWS
   - Use: `hunthub-assets-[your-name]-[random]`
   - Example: `hunthub-assets-catalin-7x9k2`
   - **IMPORTANT:** Write this down! You'll need it everywhere.

2. **AWS Region:**
   - Select `US East (N. Virginia) us-east-1`
   - ⚠️ Must match where your app is deployed

3. **Object Ownership:**
   - Leave as "ACLs disabled (recommended)"

4. **Block Public Access settings:**
   - ✅ **CHECK "Block all public access"**
   - **Why:** We'll use CloudFront to serve files, not direct S3 access
   - **Security:** Only CloudFront can read from bucket

5. **Bucket Versioning:**
   - Leave "Disable" (for now - enable later if needed)

6. **Tags (optional):**
   - Add if you want: Key=`Project` Value=`HuntHub`

7. **Default encryption:**
   - Leave as "Server-side encryption with Amazon S3 managed keys (SSE-S3)"

8. **Bucket Key:**
   - ✅ Enable (reduces encryption costs)

9. Click "Create bucket"

**✅ SUCCESS:** You'll see your bucket in the list!

### 3.1.3: Configure CORS (For Browser Uploads)

**Why:** Browsers need permission to upload files to S3 from your frontend domain.

1. Click on your bucket name
2. Click "Permissions" tab
3. Scroll to "Cross-origin resource sharing (CORS)"
4. Click "Edit"
5. Paste this configuration:

```json
[
    {
        "AllowedHeaders": [
            "*"
        ],
        "AllowedMethods": [
            "PUT",
            "POST"
        ],
        "AllowedOrigins": [
            "http://localhost:3000",
            "http://localhost:5173",
            "https://hunthub.com",
            "https://www.hunthub.com"
        ],
        "ExposeHeaders": [
            "ETag"
        ],
        "MaxAgeSeconds": 3000
    }
]
```

**Explanation:**
- `AllowedMethods`: PUT (presigned upload), POST (multipart)
- `AllowedOrigins`: Your frontend domains (localhost for dev, production domain)
- `ExposeHeaders`: ETag (needed for multipart uploads)
- `MaxAgeSeconds`: Browser caches CORS preflight for 50 minutes

6. Click "Save changes"

---

## Step 3.2: Create CloudFront Distribution

**Why:** CloudFront = global CDN (Content Delivery Network)
- Caches files at edge locations worldwide
- Faster access for users
- Reduces S3 costs (less S3 data transfer)

### 3.2.1: Navigate to CloudFront

1. In AWS Console search bar, type "CloudFront"
2. Click "CloudFront"
3. You should see "CloudFront Distributions" page
4. Click orange "Create distribution" button

### 3.2.2: Configure Distribution Settings

**⚠️ THIS IS LONG - FOLLOW CAREFULLY**

**Origin Settings:**

1. **Origin domain:**
   - Click the dropdown
   - **DO NOT select the autocomplete suggestion**
   - Instead, manually type: `hunthub-assets-catalin-7x9k2.s3.us-east-1.amazonaws.com`
   - Format: `[bucket-name].s3.[region].amazonaws.com`
   - **Why manual:** Autocomplete uses wrong format for OAI

2. **Origin path:**
   - Leave empty

3. **Name:**
   - Auto-filled (leave as is)

4. **Enable Origin Shield:**
   - Leave "No" (costs extra, not needed for portfolio)

5. **Origin access:**
   - Select "Legacy access identities"
   - **Why:** We need Origin Access Identity (OAI) to restrict S3 access

6. **Origin access identity:**
   - Click "Create new OAI"
   - Name: `hunthub-assets-oai`
   - Click "Create"

7. **Bucket policy:**
   - Select "Yes, update the bucket policy"
   - **Why:** This allows CloudFront to read from S3

**Default Cache Behavior Settings:**

8. **Path pattern:**
   - Default (*)

9. **Compress objects automatically:**
   - Select "Yes"
   - **Why:** Reduces bandwidth, faster loading

10. **Viewer protocol policy:**
    - Select "Redirect HTTP to HTTPS"
    - **Why:** Security, SEO

11. **Allowed HTTP methods:**
    - Select "GET, HEAD, OPTIONS, PUT, POST, PATCH, DELETE"
    - **Why:** Need PUT for presigned uploads

12. **Restrict viewer access:**
    - Select "No"
    - **Why:** Public assets, no signed URLs needed

13. **Cache key and origin requests:**
    - Select "Cache policy and origin request policy (recommended)"

14. **Cache policy:**
    - Select "CachingOptimized"

15. **Origin request policy:**
    - Select "CORS-CustomOrigin"
    - **Why:** Forwards CORS headers to S3

16. **Response headers policy (optional):**
    - Select "SimpleCORS"

**Function Associations (optional):**
- Leave all blank for now

**Settings:**

17. **Price class:**
    - Select "Use all edge locations (best performance)"
    - **For cost savings:** Choose "Use only North America and Europe"

18. **AWS WAF web ACL (optional):**
    - Leave "Do not enable security protections"

19. **Alternate domain names (CNAMEs) (optional):**
    - Leave empty for now
    - **Later:** Add `assets.hunthub.com` if you want custom domain

20. **Custom SSL certificate:**
    - Leave "Default CloudFront Certificate"
    - **Later:** Request ACM certificate for custom domain

21. **Supported HTTP versions:**
    - Check both "HTTP/2" and "HTTP/3"

22. **Default root object (optional):**
    - Leave empty

23. **Standard logging:**
    - Select "Off" (costs $$$)
    - **For debugging:** Enable and select a logging bucket

24. **IPv6:**
    - Leave "On"

25. Click "Create distribution"

**⏰ WAIT TIME: 10-15 minutes for distribution to deploy**

### 3.2.3: Get CloudFront Domain

1. You'll be redirected to distributions list
2. Wait for "Status" to change from "Deploying" to "Enabled"
3. Refresh page every minute to check
4. When enabled, click on your distribution
5. **Find "Distribution domain name":**
   - Example: `d111111abcdef8.cloudfront.net`
   - **SAVE THIS - You need it in your backend!**

```bash
# Add to your .env.local
CDN_DOMAIN=d111111abcdef8.cloudfront.net
```

---

## Step 3.3: Test S3 + CloudFront Setup

### 3.3.1: Upload Test File to S3

1. Go back to S3 console
2. Click on your bucket
3. Click "Upload" button
4. Click "Add files"
5. Select any image from your computer
6. Click "Upload"
7. After upload, click on the file name
8. Copy the "S3 URI": `s3://hunthub-assets-catalin-7x9k2/test-image.jpg`
9. Also note the "Object URL" (won't work - bucket is private)

### 3.3.2: Access via CloudFront

**Build CloudFront URL:**
```
https://[distribution-domain]/[object-key]
https://d111111abcdef8.cloudfront.net/test-image.jpg
```

**Test:**
1. Open browser
2. Paste CloudFront URL
3. **✅ SUCCESS:** Image loads!
4. **❌ FAIL:** "Access Denied" → OAI not configured correctly

**Test S3 direct URL (should fail):**
```
https://hunthub-assets-catalin-7x9k2.s3.us-east-1.amazonaws.com/test-image.jpg
```

**Expected:** `<Error><Code>AccessDenied</Code>` (bucket is private)

**✅ If CloudFront works but S3 direct fails, your setup is correct!**

---

## Step 3.4: Test Presigned URL Upload

**Now let's test the 3-step upload flow.**

### 3.4.1: Generate Presigned URL (Node.js Script)

Create a test script in your HuntHub project:

```bash
cd /Users/catalinleca/leca/HuntHub
mkdir -p scripts/aws-tests
touch scripts/aws-tests/test-presigned-upload.ts
```

**scripts/aws-tests/test-presigned-upload.ts:**
```typescript
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import * as fs from 'fs';
import * as path from 'path';

const s3Client = new S3Client({
  region: 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

const BUCKET_NAME = 'hunthub-assets-catalin-7x9k2'; // Your bucket
const CDN_DOMAIN = 'd111111abcdef8.cloudfront.net'; // Your CloudFront domain

async function testPresignedUpload() {
  const testUserId = 'test-user-123';
  const testFileName = 'test-image.jpg';
  const s3Key = `${testUserId}/${Date.now()}-${testFileName}`;

  console.log('1. Generating presigned URL...');

  // Step 1: Generate presigned URL
  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: s3Key,
    ContentType: 'image/jpeg',
  });

  const signedUrl = await getSignedUrl(s3Client, command, {
    expiresIn: 900, // 15 minutes
  });

  const publicUrl = `https://${CDN_DOMAIN}/${s3Key}`;

  console.log('✅ Generated URLs:');
  console.log('   Signed URL:', signedUrl);
  console.log('   Public URL:', publicUrl);

  // Step 2: Upload file using presigned URL
  console.log('\n2. Uploading file to S3...');

  // Read test image (use any image on your machine)
  const testImagePath = '/path/to/test-image.jpg'; // Change this!
  const fileBuffer = fs.readFileSync(testImagePath);

  const uploadResponse = await fetch(signedUrl, {
    method: 'PUT',
    body: fileBuffer,
    headers: {
      'Content-Type': 'image/jpeg',
    },
  });

  if (uploadResponse.ok) {
    console.log('✅ Upload successful!');
  } else {
    console.error('❌ Upload failed:', await uploadResponse.text());
    return;
  }

  // Step 3: Test accessing via CloudFront
  console.log('\n3. Testing CloudFront access...');
  console.log('   Wait 30 seconds for S3 to finalize...');

  await new Promise(resolve => setTimeout(resolve, 30000));

  const cdnResponse = await fetch(publicUrl);

  if (cdnResponse.ok) {
    console.log('✅ CloudFront access successful!');
    console.log('   File available at:', publicUrl);
  } else {
    console.error('❌ CloudFront access failed:', cdnResponse.status);
  }
}

testPresignedUpload().catch(console.error);
```

### 3.4.2: Run Test Script

**Set environment variables:**
```bash
export AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE
export AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
export AWS_REGION=us-east-1
```

**Install dependencies:**
```bash
cd /Users/catalinleca/leca/HuntHub
npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner
```

**Run script:**
```bash
npx ts-node scripts/aws-tests/test-presigned-upload.ts
```

**Expected output:**
```
1. Generating presigned URL...
✅ Generated URLs:
   Signed URL: https://hunthub-assets-catalin-7x9k2.s3.us-east-1.amazonaws.com/test-user-123/1234567890-test-image.jpg?X-Amz-Algorithm=...
   Public URL: https://d111111abcdef8.cloudfront.net/test-user-123/1234567890-test-image.jpg

2. Uploading file to S3...
✅ Upload successful!

3. Testing CloudFront access...
   Wait 30 seconds for S3 to finalize...
✅ CloudFront access successful!
   File available at: https://d111111abcdef8.cloudfront.net/test-user-123/1234567890-test-image.jpg
```

**✅ If you see all green checkmarks, presigned upload is working!**

---

# Part 4: CloudFormation Deployment (Production Path)

**Now that you understand what each resource does, let's automate it with CloudFormation.**

**Why CloudFormation:**
- ✅ Reproducible (same setup every time)
- ✅ Version controlled (track changes in git)
- ✅ Easy to delete (clean up all resources at once)
- ✅ Multiple environments (dev, staging, prod stacks)

---

## Step 4.1: CloudFormation Template Structure

**We'll create:**
```
/Users/catalinleca/leca/HuntHub/infrastructure/
├── cloudformation/
│   ├── hunthub-assets.yaml          # Main template
│   ├── parameters/
│   │   ├── dev.json                 # Dev environment params
│   │   └── production.json          # Production params
│   └── README.md                    # Infrastructure docs
└── scripts/
    ├── deploy-stack.sh              # Deploy script
    ├── delete-stack.sh              # Cleanup script
    └── validate-template.sh         # Validation script
```

---

## Step 4.2: Create CloudFormation Template

**File:** `/Users/catalinleca/leca/HuntHub/infrastructure/cloudformation/hunthub-assets.yaml`

**(This will be created in the next message with the template content)**

---

## Step 4.3: Create Parameter Files

**File:** `/Users/catalinleca/leca/HuntHub/infrastructure/cloudformation/parameters/dev.json`

```json
[
  {
    "ParameterKey": "Environment",
    "ParameterValue": "dev"
  },
  {
    "ParameterKey": "BucketName",
    "ParameterValue": "hunthub-assets-dev-catalin"
  }
]
```

**File:** `/Users/catalinleca/leca/HuntHub/infrastructure/cloudformation/parameters/production.json`

```json
[
  {
    "ParameterKey": "Environment",
    "ParameterValue": "production"
  },
  {
    "ParameterKey": "BucketName",
    "ParameterValue": "hunthub-assets-production-catalin"
  }
]
```

---

## Step 4.4: Create Deployment Scripts

**File:** `/Users/catalinleca/leca/HuntHub/infrastructure/scripts/deploy-stack.sh`

```bash
#!/bin/bash

# HuntHub Asset Infrastructure Deployment Script
# Usage: ./deploy-stack.sh [dev|production]

set -e  # Exit on error

ENVIRONMENT=${1:-dev}
STACK_NAME="hunthub-assets-${ENVIRONMENT}"
TEMPLATE_FILE="../cloudformation/hunthub-assets.yaml"
PARAMETERS_FILE="../cloudformation/parameters/${ENVIRONMENT}.json"

echo "🚀 Deploying HuntHub Assets Stack: ${STACK_NAME}"
echo "📁 Template: ${TEMPLATE_FILE}"
echo "⚙️  Parameters: ${PARAMETERS_FILE}"
echo ""

# Check if stack exists
if aws cloudformation describe-stacks --stack-name ${STACK_NAME} &> /dev/null; then
  echo "📦 Stack exists, updating..."
  COMMAND="update-stack"
else
  echo "🆕 Stack doesn't exist, creating..."
  COMMAND="create-stack"
fi

# Deploy stack
aws cloudformation ${COMMAND} \
  --stack-name ${STACK_NAME} \
  --template-body file://${TEMPLATE_FILE} \
  --parameters file://${PARAMETERS_FILE} \
  --capabilities CAPABILITY_IAM \
  --tags Key=Project,Value=HuntHub Key=Environment,Value=${ENVIRONMENT}

echo ""
echo "⏳ Waiting for stack ${COMMAND} to complete..."
echo "   This typically takes 10-15 minutes..."
echo ""

aws cloudformation wait stack-${COMMAND}-complete --stack-name ${STACK_NAME}

echo ""
echo "✅ Stack deployment complete!"
echo ""
echo "📊 Stack Outputs:"
aws cloudformation describe-stacks \
  --stack-name ${STACK_NAME} \
  --query 'Stacks[0].Outputs' \
  --output table

echo ""
echo "💡 Next steps:"
echo "   1. Copy CDN domain from outputs above"
echo "   2. Add to your .env.local:"
echo "      CDN_DOMAIN=dxxxxxxxxxxxxx.cloudfront.net"
echo "   3. Add S3 bucket name:"
echo "      S3_BUCKET_NAME=hunthub-assets-${ENVIRONMENT}-catalin"
```

**Make executable:**
```bash
chmod +x infrastructure/scripts/deploy-stack.sh
```

---

**File:** `/Users/catalinleca/leca/HuntHub/infrastructure/scripts/delete-stack.sh`

```bash
#!/bin/bash

# HuntHub Asset Infrastructure Deletion Script
# Usage: ./delete-stack.sh [dev|production]

set -e

ENVIRONMENT=${1:-dev}
STACK_NAME="hunthub-assets-${ENVIRONMENT}"

echo "⚠️  WARNING: This will delete the entire ${STACK_NAME} stack!"
echo "   Including:"
echo "   - S3 bucket (all files will be deleted)"
echo "   - CloudFront distribution"
echo "   - All associated resources"
echo ""
read -p "Are you sure? Type 'yes' to confirm: " CONFIRMATION

if [ "$CONFIRMATION" != "yes" ]; then
  echo "❌ Deletion cancelled"
  exit 0
fi

# Empty S3 bucket first (required before deletion)
BUCKET_NAME=$(aws cloudformation describe-stacks \
  --stack-name ${STACK_NAME} \
  --query 'Stacks[0].Outputs[?OutputKey==`S3BucketName`].OutputValue' \
  --output text)

echo ""
echo "🗑️  Emptying S3 bucket: ${BUCKET_NAME}..."
aws s3 rm s3://${BUCKET_NAME} --recursive

echo ""
echo "🗑️  Deleting CloudFormation stack: ${STACK_NAME}..."
aws cloudformation delete-stack --stack-name ${STACK_NAME}

echo ""
echo "⏳ Waiting for stack deletion..."
aws cloudformation wait stack-delete-complete --stack-name ${STACK_NAME}

echo ""
echo "✅ Stack deleted successfully!"
```

**Make executable:**
```bash
chmod +x infrastructure/scripts/delete-stack.sh
```

---

**File:** `/Users/catalinleca/leca/HuntHub/infrastructure/scripts/validate-template.sh`

```bash
#!/bin/bash

# Validate CloudFormation template syntax

TEMPLATE_FILE="../cloudformation/hunthub-assets.yaml"

echo "🔍 Validating CloudFormation template..."
echo "📁 Template: ${TEMPLATE_FILE}"
echo ""

aws cloudformation validate-template --template-body file://${TEMPLATE_FILE}

if [ $? -eq 0 ]; then
  echo ""
  echo "✅ Template is valid!"
else
  echo ""
  echo "❌ Template validation failed!"
  exit 1
fi
```

**Make executable:**
```bash
chmod +x infrastructure/scripts/validate-template.sh
```

---

## Step 4.5: Deploy Your Stack

### 4.5.1: Validate Template First

```bash
cd /Users/catalinleca/leca/HuntHub/infrastructure/scripts
./validate-template.sh
```

**Expected output:**
```
🔍 Validating CloudFormation template...
📁 Template: ../cloudformation/hunthub-assets.yaml

✅ Template is valid!
```

### 4.5.2: Deploy Dev Stack

```bash
./deploy-stack.sh dev
```

**What happens:**
1. Script checks if stack exists
2. Creates/updates stack
3. Waits for completion (10-15 minutes)
4. Shows outputs (CDN domain, bucket name, etc.)

**Expected output:**
```
🚀 Deploying HuntHub Assets Stack: hunthub-assets-dev
📁 Template: ../cloudformation/hunthub-assets.yaml
⚙️  Parameters: ../cloudformation/parameters/dev.json

🆕 Stack doesn't exist, creating...

⏳ Waiting for stack create to complete...
   This typically takes 10-15 minutes...

✅ Stack deployment complete!

📊 Stack Outputs:
--------------------------------------------------------------------
|                         DescribeStacks                          |
+------------------+----------------------------------------------+
|  OutputKey       |  OutputValue                                 |
+------------------+----------------------------------------------+
|  CDNDomain       |  d111111abcdef8.cloudfront.net               |
|  CDNDistributionId |  E1234ABCDEFGH                            |
|  S3BucketName    |  hunthub-assets-dev-catalin                  |
|  S3BucketArn     |  arn:aws:s3:::hunthub-assets-dev-catalin     |
+------------------+----------------------------------------------+

💡 Next steps:
   1. Copy CDN domain from outputs above
   2. Add to your .env.local:
      CDN_DOMAIN=d111111abcdef8.cloudfront.net
   3. Add S3 bucket name:
      S3_BUCKET_NAME=hunthub-assets-dev-catalin
```

### 4.5.3: Save Outputs to .env

```bash
# /Users/catalinleca/leca/HuntHub/apps/backend/api/.env.local

# AWS Configuration
AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE
AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
AWS_REGION=us-east-1

# S3 & CloudFront (from stack outputs)
S3_BUCKET_NAME=hunthub-assets-dev-catalin
CDN_DOMAIN=d111111abcdef8.cloudfront.net

# Upload Settings
PRESIGNED_URL_EXPIRY=900  # 15 minutes
MAX_FILE_SIZE_MB=10
```

**✅ Your infrastructure is now deployed!**

---

# Part 5: Backend Integration

Now let's integrate AWS with your HuntHub backend.

## Step 5.1: Install AWS SDK

```bash
cd /Users/catalinleca/leca/HuntHub/apps/backend/api
npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner
```

## Step 5.2: Create StorageService

**File:** `/Users/catalinleca/leca/HuntHub/apps/backend/api/src/services/storage.service.ts`

See the complete implementation in `.claude/backend/asset-management-flow.md` - Section "Backend Implementation > StorageService"

## Step 5.3: Create AssetService

**File:** `/Users/catalinleca/leca/HuntHub/apps/backend/api/src/services/asset.service.ts`

See the complete implementation in `.claude/backend/asset-management-flow.md` - Section "Backend Implementation > AssetService"

## Step 5.4: Create AssetController

**File:** `/Users/catalinleca/leca/HuntHub/apps/backend/api/src/controllers/asset.controller.ts`

See the complete implementation in `.claude/backend/asset-management-flow.md` - Section "Backend Implementation > AssetController"

## Step 5.5: Create Routes

**File:** `/Users/catalinleca/leca/HuntHub/apps/backend/api/src/routes/asset.routes.ts`

See the complete implementation in `.claude/backend/asset-management-flow.md` - Section "Backend Implementation > Routes"

## Step 5.6: Update DI Container

**File:** `/Users/catalinleca/leca/HuntHub/apps/backend/api/src/config/inversify.ts`

```typescript
import { StorageService } from '@/services/storage.service';
import { AssetService } from '@/services/asset.service';
import { AssetController } from '@/controllers/asset.controller';

// Add to TYPES
export const TYPES = {
  // ... existing
  StorageService: Symbol.for('StorageService'),
  AssetService: Symbol.for('AssetService'),
  AssetController: Symbol.for('AssetController'),
};

// Bind services
container.bind<StorageService>(TYPES.StorageService).to(StorageService);
container.bind<AssetService>(TYPES.AssetService).to(AssetService);
container.bind<AssetController>(TYPES.AssetController).to(AssetController);
```

---

# Part 6: Testing & Validation

## Step 6.1: Test Backend Endpoints

### 6.1.1: Request Upload URLs

```bash
# Request presigned URLs
curl -X POST http://localhost:3000/api/assets/upload/url \
  -H "Authorization: Bearer YOUR_AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "filename": "test.jpg",
    "mimeType": "image/jpeg",
    "sizeBytes": 500000
  }'
```

**Expected response:**
```json
{
  "signedUrl": "https://hunthub-assets-dev-catalin.s3.us-east-1.amazonaws.com/user-123/uuid-test.jpg?X-Amz-Algorithm=...",
  "publicUrl": "https://d111111abcdef8.cloudfront.net/user-123/uuid-test.jpg",
  "s3Key": "user-123/uuid-test.jpg",
  "expiresIn": 900
}
```

### 6.1.2: Upload File to S3

```bash
# Upload file using signedUrl
curl -X PUT "SIGNED_URL_FROM_ABOVE" \
  -H "Content-Type: image/jpeg" \
  --data-binary @/path/to/test.jpg
```

**Expected:** Empty response with 200 status

### 6.1.3: Confirm Asset in DB

```bash
curl -X POST http://localhost:3000/api/assets \
  -H "Authorization: Bearer YOUR_AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://d111111abcdef8.cloudfront.net/user-123/uuid-test.jpg",
    "mimeType": "image/jpeg",
    "originalFilename": "test.jpg",
    "sizeBytes": 500000,
    "s3Key": "user-123/uuid-test.jpg"
  }'
```

**Expected response:**
```json
{
  "id": "asset-uuid",
  "url": "https://d111111abcdef8.cloudfront.net/user-123/uuid-test.jpg",
  "mimeType": "image/jpeg",
  "originalFilename": "test.jpg",
  "sizeBytes": 500000,
  "createdAt": "2025-10-31T10:00:00Z"
}
```

### 6.1.4: Access via CloudFront

```bash
# Test public URL
curl -I "https://d111111abcdef8.cloudfront.net/user-123/uuid-test.jpg"
```

**Expected:** 200 OK

---

## Step 6.2: Test Error Cases

### 6.2.1: Invalid MIME Type

```bash
curl -X POST http://localhost:3000/api/assets/upload/url \
  -H "Authorization: Bearer YOUR_AUTH_TOKEN" \
  -d '{"filename": "test.exe", "mimeType": "application/x-msdownload", "sizeBytes": 1000}'
```

**Expected:** 400 Bad Request - "Unsupported file type"

### 6.2.2: File Too Large

```bash
curl -X POST http://localhost:3000/api/assets/upload/url \
  -H "Authorization: Bearer YOUR_AUTH_TOKEN" \
  -d '{"filename": "huge.jpg", "mimeType": "image/jpeg", "sizeBytes": 50000000}'
```

**Expected:** 400 Bad Request - "File size exceeds 10MB limit"

### 6.2.3: Expired Presigned URL

1. Request presigned URL
2. Wait 16 minutes
3. Try to upload

**Expected:** 403 Forbidden from S3

---

# Part 7: Troubleshooting

## Common Issues & Solutions

### Issue 1: "Access Denied" when uploading to S3

**Symptoms:**
```xml
<Error>
  <Code>AccessDenied</Code>
  <Message>Request has expired</Message>
</Error>
```

**Causes & Solutions:**

**Cause A: Presigned URL expired**
- Presigned URLs expire after 15 minutes
- Solution: Request a new presigned URL

**Cause B: Wrong Content-Type header**
- Content-Type in upload must match what was signed
- Solution: Ensure `Content-Type: image/jpeg` matches `mimeType: "image/jpeg"`

**Cause C: IAM permissions missing**
- IAM user doesn't have S3 PutObject permission
- Solution: Add AmazonS3FullAccess policy to IAM user

**Cause D: Bucket doesn't exist**
- S3 bucket name typo in environment variables
- Solution: Verify `S3_BUCKET_NAME` matches actual bucket

---

### Issue 2: "NoSuchBucket" error

**Symptoms:**
```xml
<Error>
  <Code>NoSuchBucket</Code>
  <Message>The specified bucket does not exist</Message>
</Error>
```

**Solution:**
```bash
# Check if bucket exists
aws s3 ls | grep hunthub

# If not found, check bucket name in .env
echo $S3_BUCKET_NAME

# Verify bucket exists in correct region
aws s3api head-bucket --bucket hunthub-assets-dev-catalin
```

---

### Issue 3: CloudFront returns "Access Denied"

**Symptoms:**
- File uploaded successfully to S3
- Direct S3 URL returns "Access Denied" (expected)
- CloudFront URL also returns "Access Denied" (unexpected)

**Causes & Solutions:**

**Cause A: OAI not configured**
- Origin Access Identity missing or misconfigured
- Solution: Check CloudFront distribution settings, ensure OAI is attached

**Cause B: S3 bucket policy missing**
- Bucket policy doesn't allow CloudFront access
- Solution:
  ```bash
  # Check bucket policy
  aws s3api get-bucket-policy --bucket hunthub-assets-dev-catalin

  # Should include CloudFront OAI principal
  ```

**Cause C: CloudFront cache**
- File path changed but CloudFront cached old response
- Solution:
  ```bash
  # Invalidate CloudFront cache
  aws cloudfront create-invalidation \
    --distribution-id E1234ABCDEFGH \
    --paths "/user-123/*"
  ```

---

### Issue 4: CORS errors in browser

**Symptoms:**
```
Access to fetch at 'https://hunthub-assets-dev.s3.amazonaws.com/...'
from origin 'http://localhost:3000' has been blocked by CORS policy
```

**Solutions:**

**Solution A: Update S3 CORS**
```bash
# Get current CORS config
aws s3api get-bucket-cors --bucket hunthub-assets-dev-catalin

# Update CORS (add your frontend domain)
aws s3api put-bucket-cors \
  --bucket hunthub-assets-dev-catalin \
  --cors-configuration file://cors.json
```

**cors.json:**
```json
{
  "CORSRules": [
    {
      "AllowedHeaders": ["*"],
      "AllowedMethods": ["PUT", "POST", "GET"],
      "AllowedOrigins": [
        "http://localhost:3000",
        "https://hunthub.com"
      ],
      "ExposeHeaders": ["ETag"],
      "MaxAgeSeconds": 3000
    }
  ]
}
```

**Solution B: Check CloudFront cache policy**
- CloudFront must forward CORS headers
- Ensure CORS-CustomOrigin origin request policy is attached

---

### Issue 5: "SignatureDoesNotMatch" error

**Symptoms:**
```xml
<Error>
  <Code>SignatureDoesNotMatch</Code>
  <Message>The request signature we calculated does not match...</Message>
</Error>
```

**Causes:**

**Cause A: Wrong AWS credentials**
- `AWS_SECRET_ACCESS_KEY` is incorrect
- Solution: Verify credentials in `.env.local`

**Cause B: Region mismatch**
- S3 client region doesn't match bucket region
- Solution: Ensure `AWS_REGION=us-east-1` matches bucket region

**Cause C: System clock skew**
- Computer clock is off by more than 15 minutes
- Solution:
  ```bash
  # Check system time
  date

  # Sync time (macOS)
  sudo sntp -sS time.apple.com
  ```

---

### Issue 6: CloudFormation stack stuck in "CREATE_IN_PROGRESS"

**Symptoms:**
- Stack creation running for more than 30 minutes
- No error messages

**Solutions:**

**Solution A: Check CloudFormation events**
```bash
aws cloudformation describe-stack-events \
  --stack-name hunthub-assets-dev \
  --query 'StackEvents[?ResourceStatus==`CREATE_FAILED`]'
```

**Solution B: Common causes**
- CloudFront distribution takes 15-20 minutes (normal)
- Resource name conflict (bucket name already exists globally)
- IAM permissions issue (add CAPABILITY_IAM flag)

**Solution C: Cancel and retry**
```bash
# Cancel stuck stack
aws cloudformation cancel-update-stack --stack-name hunthub-assets-dev

# Or delete and recreate
aws cloudformation delete-stack --stack-name hunthub-assets-dev
aws cloudformation wait stack-delete-complete --stack-name hunthub-assets-dev

# Then deploy again
./deploy-stack.sh dev
```

---

### Issue 7: "Bucket name already exists" error

**Symptoms:**
```
S3 bucket name 'hunthub-assets-dev' is already taken
```

**Cause:**
- S3 bucket names are globally unique across ALL AWS accounts
- Someone else (or you in another account) already has this bucket

**Solution:**
```bash
# Change bucket name to something unique
# Edit infrastructure/cloudformation/parameters/dev.json

{
  "ParameterKey": "BucketName",
  "ParameterValue": "hunthub-assets-dev-catalin-x7k2"  # Add random suffix
}

# Redeploy
./deploy-stack.sh dev
```

---

### Issue 8: Cannot delete stack - "Bucket not empty"

**Symptoms:**
```
Cannot delete bucket 'hunthub-assets-dev' because it contains files
```

**Solution:**
```bash
# Empty bucket first
aws s3 rm s3://hunthub-assets-dev-catalin --recursive

# Then delete stack
./delete-stack.sh dev
```

---

### Issue 9: File uploads succeed but files are 0 bytes

**Cause:**
- Not sending file content in PUT request
- Or sending wrong body format

**Solution:**
```typescript
// ❌ Wrong
await fetch(signedUrl, {
  method: 'PUT',
  body: file.name  // Just the name!
});

// ✅ Correct
await fetch(signedUrl, {
  method: 'PUT',
  body: file,  // File object or ArrayBuffer
  headers: {
    'Content-Type': file.type
  }
});
```

---

## Debugging Tools

### Tool 1: AWS CLI S3 Commands

```bash
# List all files in bucket
aws s3 ls s3://hunthub-assets-dev-catalin --recursive

# Get file metadata
aws s3api head-object \
  --bucket hunthub-assets-dev-catalin \
  --key user-123/test.jpg

# Download file for inspection
aws s3 cp s3://hunthub-assets-dev-catalin/user-123/test.jpg /tmp/test.jpg
```

### Tool 2: CloudFront CLI Commands

```bash
# Get distribution details
aws cloudfront get-distribution --id E1234ABCDEFGH

# List distributions
aws cloudfront list-distributions

# Invalidate cache
aws cloudfront create-invalidation \
  --distribution-id E1234ABCDEFGH \
  --paths "/*"
```

### Tool 3: CloudFormation CLI Commands

```bash
# Get stack status
aws cloudformation describe-stacks --stack-name hunthub-assets-dev

# Get stack events (logs)
aws cloudformation describe-stack-events \
  --stack-name hunthub-assets-dev \
  --max-items 20

# Get stack resources
aws cloudformation list-stack-resources --stack-name hunthub-assets-dev
```

### Tool 4: S3 Presigner Test

```bash
# Generate presigned URL via CLI
aws s3 presign s3://hunthub-assets-dev-catalin/test.jpg --expires-in 900

# Test upload with curl
curl -X PUT "PRESIGNED_URL" \
  --data-binary @test.jpg \
  -H "Content-Type: image/jpeg" \
  -v  # Verbose mode shows headers
```

---

# Part 8: Cost Monitoring & Cleanup

## Cost Breakdown

**Monthly costs for portfolio usage (0-10 users):**

### Free Tier (First 12 months)
- S3: 5GB storage, 20,000 GET, 2,000 PUT requests → **$0**
- CloudFront: 1TB data transfer, 10M HTTP requests → **$0**
- Lambda@Edge: Not using → **$0**

### After Free Tier
- **S3 Storage:** $0.023/GB × 5GB = **$0.12/month**
- **S3 Requests:** $0.0004/1000 PUT × 1000 = **$0.0004**
- **CloudFront:** $0.085/GB × 5GB transferred = **$0.43/month**
- **Total:** **~$0.50-1.00/month**

### What costs money?
✅ **S3 storage** (per GB stored)
✅ **S3 requests** (PUT, GET, DELETE)
✅ **CloudFront data transfer** (outbound data)
✅ **CloudFormation** (free - no charge for service itself)

### What's free?
✅ **CloudFront distributions** (no charge for having a distribution)
✅ **IAM users/roles** (free)
✅ **CloudWatch basic monitoring** (free - 10 metrics, 1M API requests)

---

## Monitor Costs

### Step 8.1: Set Up Billing Alerts

1. Go to AWS Console
2. Search "Billing" → Click "Billing and Cost Management"
3. Left sidebar → Click "Billing preferences"
4. ✅ Check "Receive Billing Alerts"
5. Click "Save preferences"

6. Left sidebar → Click "Budgets"
7. Click "Create budget"
8. **Budget setup:**
   - Template: Zero spend budget
   - Name: `hunthub-portfolio-budget`
   - Amount: $5/month
   - Email: your-email@example.com
9. Click "Create budget"

**You'll get email alerts if spending exceeds $5/month.**

---

### Step 8.2: Check Current Costs

```bash
# Get cost estimate for current month
aws ce get-cost-and-usage \
  --time-period Start=2025-10-01,End=2025-10-31 \
  --granularity MONTHLY \
  --metrics UnblendedCost \
  --group-by Type=SERVICE

# Get S3 costs specifically
aws ce get-cost-and-usage \
  --time-period Start=2025-10-01,End=2025-10-31 \
  --granularity MONTHLY \
  --metrics UnblendedCost \
  --filter file://filter.json
```

**filter.json:**
```json
{
  "Dimensions": {
    "Key": "SERVICE",
    "Values": ["Amazon Simple Storage Service"]
  }
}
```

---

### Step 8.3: S3 Storage Analysis

```bash
# Get bucket size
aws s3 ls s3://hunthub-assets-dev-catalin --recursive --human-readable --summarize

# Output shows:
# Total Objects: 47
# Total Size: 125.3 MiB
```

**Cost calculation:**
```
125.3 MB = 0.12 GB
0.12 GB × $0.023/GB = $0.00276/month (~$0.003)
```

---

## Clean Up Resources

### Option A: Delete Entire Stack

**⚠️ WARNING: This deletes EVERYTHING (bucket + files + CloudFront)**

```bash
cd /Users/catalinleca/leca/HuntHub/infrastructure/scripts
./delete-stack.sh dev
```

**What it does:**
1. Empties S3 bucket (deletes all files)
2. Deletes CloudFormation stack
3. Deletes all resources (S3, CloudFront, IAM roles)

**Time:** 15-20 minutes

---

### Option B: Keep Infrastructure, Delete Files

**If you want to keep infrastructure but remove files:**

```bash
# Delete all files in bucket
aws s3 rm s3://hunthub-assets-dev-catalin --recursive

# Or delete specific folder
aws s3 rm s3://hunthub-assets-dev-catalin/test-uploads/ --recursive
```

**This stops storage costs but keeps infrastructure ready.**

---

### Option C: Disable CloudFront (Reduce Costs)

**If not using for a while:**

```bash
# Disable distribution (stops data transfer costs)
aws cloudfront get-distribution-config --id E1234ABCDEFGH > config.json

# Edit config.json: Set "Enabled": false

aws cloudfront update-distribution \
  --id E1234ABCDEFGH \
  --if-match ETAG_FROM_GET_COMMAND \
  --distribution-config file://config.json

# Re-enable later by setting "Enabled": true
```

---

## Best Practices for Cost Optimization

### 1. Use S3 Lifecycle Policies

**Automatically delete old files:**

```json
{
  "Rules": [
    {
      "Id": "Delete test uploads after 30 days",
      "Status": "Enabled",
      "Filter": {
        "Prefix": "test-uploads/"
      },
      "Expiration": {
        "Days": 30
      }
    }
  ]
}
```

**Apply via CLI:**
```bash
aws s3api put-bucket-lifecycle-configuration \
  --bucket hunthub-assets-dev-catalin \
  --lifecycle-configuration file://lifecycle.json
```

---

### 2. Enable S3 Intelligent-Tiering

**Automatically moves files to cheaper storage tiers:**

```bash
aws s3api put-bucket-intelligent-tiering-configuration \
  --bucket hunthub-assets-dev-catalin \
  --id intelligent-tiering-rule \
  --intelligent-tiering-configuration file://intelligent-tiering.json
```

**intelligent-tiering.json:**
```json
{
  "Id": "intelligent-tiering-rule",
  "Status": "Enabled",
  "Tierings": [
    {
      "Days": 90,
      "AccessTier": "ARCHIVE_ACCESS"
    },
    {
      "Days": 180,
      "AccessTier": "DEEP_ARCHIVE_ACCESS"
    }
  ]
}
```

**Savings:**
- Standard: $0.023/GB
- Infrequent Access: $0.0125/GB (after 30 days)
- Archive: $0.004/GB (after 90 days)

---

### 3. Compress Assets Before Upload

**Frontend optimization:**
```typescript
// Compress images before upload
import imageCompression from 'browser-image-compression';

const compressedFile = await imageCompression(file, {
  maxSizeMB: 1,
  maxWidthOrHeight: 1920,
  useWebWorker: true
});

// Upload compressed version (saves storage + bandwidth)
```

---

### 4. Use CloudFront Cache Effectively

**Longer cache = fewer S3 requests:**

- Cache-Control headers: `max-age=31536000` (1 year)
- CloudFront cache policy: CachingOptimized
- Result: File fetched from S3 once, then served from edge cache

**Cost impact:**
- 1000 users view same image
- Without cache: 1000 S3 GET requests ($0.0004)
- With cache: 1 S3 GET request ($0.0000004) + CloudFront serving (cheaper)

---

## Free Tier Limits (Reminder)

**First 12 months:**
- S3: 5GB storage, 20,000 GET, 2,000 PUT requests/month
- CloudFront: 1TB data transfer, 10M requests/month

**After 12 months:**
- S3: Only storage + requests (no free tier)
- CloudFront: 1TB free data transfer per month (always free tier)

**Monitor usage:**
```bash
# Check S3 metrics
aws cloudwatch get-metric-statistics \
  --namespace AWS/S3 \
  --metric-name NumberOfObjects \
  --dimensions Name=BucketName,Value=hunthub-assets-dev-catalin \
  --start-time 2025-10-01T00:00:00Z \
  --end-time 2025-10-31T23:59:59Z \
  --period 86400 \
  --statistics Average
```

---

# Summary & Next Steps

## What You've Accomplished

✅ Created AWS account and IAM user
✅ Configured AWS credentials for CLI and SDK
✅ Manually set up S3 bucket with CORS
✅ Manually set up CloudFront distribution with OAI
✅ Tested presigned URL upload flow
✅ Created CloudFormation template for infrastructure as code
✅ Deployed stack via CloudFormation
✅ Integrated AWS SDK in backend
✅ Set up billing alerts
✅ Learned troubleshooting techniques

## Quick Reference Commands

```bash
# Deploy infrastructure
cd /Users/catalinleca/leca/HuntHub/infrastructure/scripts
./deploy-stack.sh dev

# Get stack outputs
aws cloudformation describe-stacks --stack-name hunthub-assets-dev \
  --query 'Stacks[0].Outputs' --output table

# Test file upload
curl -X POST http://localhost:3000/api/assets/upload/url \
  -H "Authorization: Bearer TOKEN" \
  -d '{"filename":"test.jpg","mimeType":"image/jpeg","sizeBytes":500000}'

# Check costs
aws ce get-cost-and-usage \
  --time-period Start=2025-10-01,End=2025-10-31 \
  --granularity MONTHLY \
  --metrics UnblendedCost

# Delete everything
./delete-stack.sh dev
```

## Files Created

```
/Users/catalinleca/leca/HuntHub/
├── .claude/
│   ├── backend/
│   │   └── asset-management-flow.md          # Architecture docs
│   └── deployment/
│       └── aws-setup-guide.md                # This file
├── infrastructure/
│   ├── cloudformation/
│   │   ├── hunthub-assets.yaml               # CF template
│   │   ├── parameters/
│   │   │   ├── dev.json                      # Dev params
│   │   │   └── production.json               # Prod params
│   │   └── README.md                         # Infrastructure docs
│   └── scripts/
│       ├── deploy-stack.sh                   # Deploy script
│       ├── delete-stack.sh                   # Cleanup script
│       └── validate-template.sh              # Validation
└── apps/backend/api/
    ├── .env.local                            # AWS credentials
    └── src/
        ├── services/
        │   ├── storage.service.ts            # AWS SDK wrapper
        │   └── asset.service.ts              # Asset logic
        └── controllers/
            └── asset.controller.ts           # HTTP endpoints
```

## Environment Variables Needed

```bash
# apps/backend/api/.env.local
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=wJal...
AWS_REGION=us-east-1
S3_BUCKET_NAME=hunthub-assets-dev-catalin
CDN_DOMAIN=d111111abcdef8.cloudfront.net
PRESIGNED_URL_EXPIRY=900
MAX_FILE_SIZE_MB=10
```

## Resources

**AWS Documentation:**
- S3: https://docs.aws.amazon.com/s3/
- CloudFront: https://docs.aws.amazon.com/cloudfront/
- CloudFormation: https://docs.aws.amazon.com/cloudformation/
- IAM: https://docs.aws.amazon.com/iam/

**AWS Free Tier:**
- https://aws.amazon.com/free/

**Cost Calculator:**
- https://calculator.aws/

**Support:**
- AWS Support Center: https://console.aws.amazon.com/support/

---

**🎉 Congratulations! You've set up production-grade asset storage infrastructure.**

**Next:** Continue with frontend implementation (see asset-management-flow.md)