# HuntHub Infrastructure - CloudFormation

**Purpose:** Infrastructure as Code for HuntHub asset storage (S3 + CloudFront CDN)

**Last updated:** 2025-10-31

---

## Quick Start

### Prerequisites

- AWS CLI installed and configured
- AWS credentials with S3, CloudFront, IAM, and CloudFormation permissions
- Review `.claude/deployment/aws-setup-guide.md` for detailed setup

### Deploy Development Environment

```bash
cd /Users/catalinleca/leca/HuntHub/infrastructure/scripts

# Validate template first
./validate-template.sh

# Deploy dev stack
./deploy-stack.sh dev

# Wait 10-15 minutes for CloudFront distribution to deploy
# Stack outputs will show CDN domain and S3 bucket name
```

### Deploy Production Environment

```bash
# Deploy production stack
./deploy-stack.sh production
```

---

## What Gets Created

**This CloudFormation template creates:**

1. **S3 Bucket** (`hunthub-assets-{environment}-catalin`)
   - Private bucket (no public access)
   - Versioning enabled (recovery from accidental deletion)
   - Server-side encryption (AES256)
   - CORS configured for browser uploads
   - Lifecycle rules for cost optimization

2. **CloudFront Distribution**
   - Global CDN for fast asset delivery
   - Origin Access Identity (OAI) for S3 access
   - HTTPS only (HTTP redirects to HTTPS)
   - HTTP/2 and HTTP/3 enabled
   - Compression enabled
   - CORS headers forwarded

3. **IAM Role** (`hunthub-backend-asset-role-{environment}`)
   - For backend to generate presigned URLs
   - S3 PutObject, GetObject, DeleteObject permissions
   - CloudFront cache invalidation permissions

4. **IAM Instance Profile** (for EC2/ECS deployment)
   - Attaches IAM role to EC2 instances or ECS tasks

---

## Stack Outputs

**After deployment, the stack provides these outputs:**

| Output | Description | Usage |
|--------|-------------|-------|
| `S3BucketName` | S3 bucket name | Add to `.env.local` as `S3_BUCKET_NAME` |
| `CDNDomain` | CloudFront domain | Add to `.env.local` as `CDN_DOMAIN` |
| `CDNDistributionId` | CloudFront ID | For cache invalidation commands |
| `BackendRoleArn` | IAM role ARN | Attach to EC2/ECS for permissions |

**View outputs:**
```bash
aws cloudformation describe-stacks \
  --stack-name hunthub-assets-dev \
  --query 'Stacks[0].Outputs' \
  --output table
```

---

## File Structure

```
infrastructure/
├── cloudformation/
│   ├── hunthub-assets.yaml          # CloudFormation template
│   ├── parameters/
│   │   ├── dev.json                 # Development parameters
│   │   └── production.json          # Production parameters
│   └── README.md                    # This file
└── scripts/
    ├── deploy-stack.sh              # Deployment script
    ├── delete-stack.sh              # Cleanup script
    └── validate-template.sh         # Template validation
```

---

## Parameters

**Environment-specific parameters are in `parameters/{environment}.json`:**

| Parameter | Description | Example |
|-----------|-------------|---------|
| `Environment` | Environment name | `dev`, `staging`, `production` |
| `BucketName` | S3 bucket name (globally unique) | `hunthub-assets-dev-catalin` |

**Customize parameters:**
```bash
# Edit parameter file
vim cloudformation/parameters/dev.json

# Update bucket name to ensure global uniqueness
{
  "ParameterKey": "BucketName",
  "ParameterValue": "hunthub-assets-dev-your-name-x7k2"
}
```

---

## Stack Management

### Create Stack

```bash
./deploy-stack.sh dev
```

**What it does:**
1. Checks if stack exists
2. Creates new stack (if doesn't exist) or updates existing
3. Waits for completion
4. Shows stack outputs

### Update Stack

**Same command as create:**
```bash
# Modify template (hunthub-assets.yaml)
# Then update stack:
./deploy-stack.sh dev
```

**CloudFormation automatically:**
- Detects changes
- Plans updates
- Applies changes with minimal disruption
- Rolls back if errors occur

### Delete Stack

```bash
./delete-stack.sh dev
```

**⚠️ WARNING:** This deletes:
- S3 bucket (and all files)
- CloudFront distribution
- IAM roles
- All associated resources

**The script will:**
1. Ask for confirmation
2. Empty S3 bucket first (required)
3. Delete CloudFormation stack
4. Wait for deletion to complete

---

## Common Operations

### View Stack Events (Logs)

```bash
# See what's happening during deployment
aws cloudformation describe-stack-events \
  --stack-name hunthub-assets-dev \
  --max-items 20
```

### Check Stack Status

```bash
aws cloudformation describe-stacks \
  --stack-name hunthub-assets-dev \
  --query 'Stacks[0].StackStatus'
```

**Possible statuses:**
- `CREATE_IN_PROGRESS` - Creating resources
- `CREATE_COMPLETE` - Successfully created
- `UPDATE_IN_PROGRESS` - Updating resources
- `UPDATE_COMPLETE` - Successfully updated
- `DELETE_IN_PROGRESS` - Deleting resources
- `DELETE_COMPLETE` - Deleted
- `ROLLBACK_IN_PROGRESS` - Error occurred, rolling back
- `ROLLBACK_COMPLETE` - Rolled back to previous state

### Invalidate CloudFront Cache

**After updating S3 files:**
```bash
# Get distribution ID from outputs
DIST_ID=$(aws cloudformation describe-stacks \
  --stack-name hunthub-assets-dev \
  --query 'Stacks[0].Outputs[?OutputKey==`CDNDistributionId`].OutputValue' \
  --output text)

# Invalidate all files
aws cloudfront create-invalidation \
  --distribution-id $DIST_ID \
  --paths "/*"

# Invalidate specific path
aws cloudfront create-invalidation \
  --distribution-id $DIST_ID \
  --paths "/user-123/*"
```

### Empty S3 Bucket (Without Deleting)

```bash
# Empty entire bucket
aws s3 rm s3://hunthub-assets-dev-catalin --recursive

# Empty specific folder
aws s3 rm s3://hunthub-assets-dev-catalin/test-uploads/ --recursive
```

---

## Cost Optimization

**Built-in cost optimizations:**

1. **S3 Lifecycle Rules:**
   - Test uploads automatically deleted after 180 days
   - Old files moved to cheaper storage (STANDARD_IA → GLACIER)
   - Incomplete multipart uploads cleaned up after 7 days

2. **CloudFront Caching:**
   - Uses CachingOptimized policy (long cache duration)
   - Reduces S3 GET requests (costs money)
   - Files cached at edge locations globally

3. **S3 Bucket Key:**
   - Reduces encryption costs by ~99%
   - Enabled by default in template

4. **Compression:**
   - CloudFront automatically compresses files
   - Reduces bandwidth costs

**Expected monthly cost:**
- Free tier (first 12 months): **$0**
- After free tier: **$0.50-1.00/month** (5GB storage, light usage)

---

## Troubleshooting

### Stack Creation Fails

**Check events:**
```bash
aws cloudformation describe-stack-events \
  --stack-name hunthub-assets-dev \
  --query 'StackEvents[?ResourceStatus==`CREATE_FAILED`]'
```

**Common issues:**
- **Bucket name already exists**: S3 bucket names are globally unique. Change `BucketName` parameter to add random suffix.
- **Missing IAM permissions**: Add `CAPABILITY_IAM` flag (script does this automatically).
- **CloudFormation timeout**: CloudFront takes 15-20 minutes. Wait longer.

### Stack Update Fails

**Rollback automatically happens:**
```bash
# Check rollback reason
aws cloudformation describe-stack-events \
  --stack-name hunthub-assets-dev \
  --query 'StackEvents[?ResourceStatus==`UPDATE_ROLLBACK_COMPLETE`]'
```

**Fix and retry:**
```bash
# Fix template or parameters
# Then run again
./deploy-stack.sh dev
```

### Stack Deletion Fails

**Usually because S3 bucket not empty:**
```bash
# Empty bucket manually
aws s3 rm s3://hunthub-assets-dev-catalin --recursive

# Retry deletion
aws cloudformation delete-stack --stack-name hunthub-assets-dev
```

---

## Security Notes

**Security features in this template:**

1. **No Public Access:**
   - S3 bucket blocks all public access
   - Only CloudFront can read from bucket (via OAI)

2. **HTTPS Only:**
   - CloudFront redirects HTTP to HTTPS
   - TLS 1.2+ required

3. **IAM Least Privilege:**
   - Backend role has minimal permissions
   - Only access to specific bucket
   - Cannot access other AWS resources

4. **Encryption:**
   - All S3 objects encrypted at rest (AES256)
   - Data in transit encrypted (HTTPS/TLS)

5. **Versioning Enabled:**
   - Accidental deletions can be recovered
   - Previous versions retained

**Best practices:**
- ✅ Never commit AWS credentials to git
- ✅ Use IAM roles instead of access keys when possible
- ✅ Enable CloudTrail for audit logging (optional, costs $$$)
- ✅ Enable S3 access logging for compliance (optional)

---

## Extending the Template

### Add Custom Domain (assets.hunthub.com)

**1. Request ACM certificate:**
```bash
aws acm request-certificate \
  --domain-name assets.hunthub.com \
  --validation-method DNS \
  --region us-east-1  # Must be us-east-1 for CloudFront
```

**2. Add to CloudFormation template:**
```yaml
ViewerCertificate:
  AcmCertificateArn: arn:aws:acm:us-east-1:123456789012:certificate/abc-123
  SslSupportMethod: sni-only
  MinimumProtocolVersion: TLSv1.2_2021

Aliases:
  - assets.hunthub.com
```

**3. Update DNS:**
```
CNAME assets.hunthub.com → d111111abcdef8.cloudfront.net
```

### Add S3 Access Logging

**1. Create logging bucket:**
```yaml
LoggingBucket:
  Type: AWS::S3::Bucket
  Properties:
    BucketName: !Sub '${BucketName}-logs'
```

**2. Enable logging on asset bucket:**
```yaml
LoggingConfiguration:
  DestinationBucketName: !Ref LoggingBucket
  LogFilePrefix: 's3-access-logs/'
```

### Add CloudWatch Alarms

**Monitor S3 usage:**
```yaml
S3HighUsageAlarm:
  Type: AWS::CloudWatch::Alarm
  Properties:
    AlarmName: !Sub '${AWS::StackName}-high-usage'
    MetricName: BucketSizeBytes
    Namespace: AWS/S3
    Statistic: Average
    Period: 86400  # 1 day
    EvaluationPeriods: 1
    Threshold: 10737418240  # 10 GB
    ComparisonOperator: GreaterThanThreshold
    AlarmActions:
      - !Ref SNSTopic  # Send notification
```

---

## Migration & Backup

### Backup S3 Bucket

**Sync to local:**
```bash
aws s3 sync s3://hunthub-assets-dev-catalin /backup/hunthub-assets/
```

**Sync to another bucket:**
```bash
aws s3 sync \
  s3://hunthub-assets-dev-catalin \
  s3://hunthub-assets-backup-catalin
```

### Restore from Backup

```bash
aws s3 sync /backup/hunthub-assets/ s3://hunthub-assets-dev-catalin
```

### Cross-Region Replication

**For disaster recovery:**
```yaml
ReplicationConfiguration:
  Role: !GetAtt ReplicationRole.Arn
  Rules:
    - Id: ReplicateToEU
      Status: Enabled
      Destination:
        Bucket: arn:aws:s3:::hunthub-assets-eu-backup
        StorageClass: STANDARD_IA
```

---

## References

**CloudFormation Resources:**
- [AWS::S3::Bucket](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-s3-bucket.html)
- [AWS::CloudFront::Distribution](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-cloudfront-distribution.html)
- [AWS::IAM::Role](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-iam-role.html)

**Best Practices:**
- [S3 Security Best Practices](https://docs.aws.amazon.com/AmazonS3/latest/userguide/security-best-practices.html)
- [CloudFront Best Practices](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/best-practices.html)

**Setup Guide:**
- See `.claude/deployment/aws-setup-guide.md` for complete setup instructions

---

**Last updated:** 2025-10-31