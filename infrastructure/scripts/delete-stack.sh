#!/bin/bash

################################################################################
# HuntHub Asset Infrastructure Deletion Script
################################################################################
#
# Usage: ./delete-stack.sh [dev|staging|production]
#
# This script deletes the HuntHub asset storage infrastructure.
#
# WARNING: This will permanently delete:
#   - S3 bucket and ALL files
#   - CloudFront distribution
#   - IAM roles and policies
#
# Prerequisites:
#   - AWS CLI installed and configured
#   - AWS credentials with CloudFormation, S3, CloudFront, IAM permissions
#
################################################################################

set -e  # Exit immediately if a command exits with a non-zero status
set -u  # Treat unset variables as an error
set -o pipefail  # Exit if any command in a pipeline fails

################################################################################
# Configuration
################################################################################

ENVIRONMENT=${1:-dev}
STACK_NAME="hunthub-assets-${ENVIRONMENT}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

################################################################################
# Functions
################################################################################

print_header() {
  echo ""
  echo "================================================================================"
  echo "$1"
  echo "================================================================================"
  echo ""
}

print_success() {
  echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
  echo -e "${RED}❌ $1${NC}"
}

print_warning() {
  echo -e "${YELLOW}⚠️  $1${NC}"
}

print_info() {
  echo -e "${BLUE}ℹ️  $1${NC}"
}

check_prerequisites() {
  # Check if AWS CLI is installed
  if ! command -v aws &> /dev/null; then
    print_error "AWS CLI is not installed"
    exit 1
  fi

  # Check if AWS credentials are configured
  if ! aws sts get-caller-identity &> /dev/null; then
    print_error "AWS credentials are not configured or invalid"
    exit 1
  fi
}

check_stack_exists() {
  if aws cloudformation describe-stacks --stack-name ${STACK_NAME} &> /dev/null; then
    return 0  # Stack exists
  else
    return 1  # Stack doesn't exist
  fi
}

get_stack_resources() {
  print_header "Stack Resources to be Deleted"

  if ! check_stack_exists; then
    print_error "Stack does not exist: ${STACK_NAME}"
    exit 1
  fi

  # Get S3 bucket name
  S3_BUCKET=$(aws cloudformation describe-stacks \
    --stack-name ${STACK_NAME} \
    --query 'Stacks[0].Outputs[?OutputKey==`S3BucketName`].OutputValue' \
    --output text 2>/dev/null || echo "N/A")

  # Get CloudFront distribution ID
  DIST_ID=$(aws cloudformation describe-stacks \
    --stack-name ${STACK_NAME} \
    --query 'Stacks[0].Outputs[?OutputKey==`CDNDistributionId`].OutputValue' \
    --output text 2>/dev/null || echo "N/A")

  echo "Resources that will be deleted:"
  echo ""
  echo "  Stack Name: ${STACK_NAME}"
  echo "  S3 Bucket: ${S3_BUCKET}"
  echo "  CloudFront Distribution: ${DIST_ID}"
  echo "  IAM Roles and Policies"
  echo ""
}

confirm_deletion() {
  print_warning "⚠️  WARNING: THIS IS DESTRUCTIVE AND IRREVERSIBLE ⚠️"
  echo ""
  echo "This will permanently delete:"
  echo "  - S3 bucket and ALL files inside it"
  echo "  - CloudFront distribution"
  echo "  - All IAM roles and policies"
  echo ""
  print_warning "All uploaded assets will be lost!"
  echo ""

  read -p "Are you absolutely sure? Type 'yes' to confirm: " CONFIRMATION

  if [ "$CONFIRMATION" != "yes" ]; then
    print_info "Deletion cancelled"
    exit 0
  fi

  echo ""
  read -p "Type the stack name '${STACK_NAME}' to confirm: " STACK_NAME_CONFIRM

  if [ "$STACK_NAME_CONFIRM" != "$STACK_NAME" ]; then
    print_error "Stack name doesn't match. Deletion cancelled."
    exit 0
  fi
}

empty_s3_bucket() {
  print_header "Emptying S3 Bucket"

  # Get bucket name from stack outputs
  S3_BUCKET=$(aws cloudformation describe-stacks \
    --stack-name ${STACK_NAME} \
    --query 'Stacks[0].Outputs[?OutputKey==`S3BucketName`].OutputValue' \
    --output text 2>/dev/null)

  if [ -z "$S3_BUCKET" ] || [ "$S3_BUCKET" = "None" ]; then
    print_warning "Could not determine S3 bucket name from stack outputs"
    print_info "Stack may not have S3 bucket or outputs not available"
    return 0
  fi

  print_info "Bucket: ${S3_BUCKET}"

  # Check if bucket exists
  if ! aws s3 ls "s3://${S3_BUCKET}" &> /dev/null; then
    print_warning "Bucket does not exist or is already empty: ${S3_BUCKET}"
    return 0
  fi

  # Count objects
  OBJECT_COUNT=$(aws s3 ls "s3://${S3_BUCKET}" --recursive --summarize 2>/dev/null | grep "Total Objects:" | awk '{print $3}')

  if [ -z "$OBJECT_COUNT" ] || [ "$OBJECT_COUNT" = "0" ]; then
    print_info "Bucket is already empty"
    return 0
  fi

  print_warning "Found ${OBJECT_COUNT} objects in bucket"
  print_info "Deleting all objects..."

  # Delete all objects (including versioned objects)
  aws s3 rm "s3://${S3_BUCKET}" --recursive

  # Delete all object versions (if versioning enabled)
  aws s3api list-object-versions \
    --bucket "${S3_BUCKET}" \
    --query '{Objects: Versions[].{Key:Key,VersionId:VersionId}}' \
    --output json \
    2>/dev/null | \
    jq -r '.Objects[] | "--key \(.Key) --version-id \(.VersionId)"' | \
    xargs -I {} aws s3api delete-object --bucket "${S3_BUCKET}" {} 2>/dev/null || true

  # Delete all delete markers (if versioning enabled)
  aws s3api list-object-versions \
    --bucket "${S3_BUCKET}" \
    --query '{Objects: DeleteMarkers[].{Key:Key,VersionId:VersionId}}' \
    --output json \
    2>/dev/null | \
    jq -r '.Objects[] | "--key \(.Key) --version-id \(.VersionId)"' | \
    xargs -I {} aws s3api delete-object --bucket "${S3_BUCKET}" {} 2>/dev/null || true

  print_success "Bucket emptied successfully"
}

disable_cloudfront() {
  print_header "Disabling CloudFront Distribution"

  # Get distribution ID
  DIST_ID=$(aws cloudformation describe-stacks \
    --stack-name ${STACK_NAME} \
    --query 'Stacks[0].Outputs[?OutputKey==`CDNDistributionId`].OutputValue' \
    --output text 2>/dev/null)

  if [ -z "$DIST_ID" ] || [ "$DIST_ID" = "None" ]; then
    print_info "No CloudFront distribution to disable"
    return 0
  fi

  print_info "Distribution: ${DIST_ID}"

  # Get current config
  aws cloudfront get-distribution-config --id ${DIST_ID} > /tmp/cf-config.json 2>/dev/null || {
    print_warning "Could not get CloudFront config (may already be deleted)"
    return 0
  }

  ETAG=$(cat /tmp/cf-config.json | jq -r '.ETag')

  # Check if already disabled
  ENABLED=$(cat /tmp/cf-config.json | jq -r '.DistributionConfig.Enabled')

  if [ "$ENABLED" = "false" ]; then
    print_info "CloudFront distribution already disabled"
    return 0
  fi

  # Disable distribution
  print_info "Disabling distribution..."
  cat /tmp/cf-config.json | \
    jq '.DistributionConfig.Enabled = false | .DistributionConfig' > /tmp/cf-config-updated.json

  aws cloudfront update-distribution \
    --id ${DIST_ID} \
    --distribution-config file:///tmp/cf-config-updated.json \
    --if-match ${ETAG} &> /dev/null || {
      print_warning "Could not disable CloudFront distribution"
      return 0
    }

  print_success "CloudFront distribution disabled"
  print_warning "CloudFront must be fully disabled before stack can be deleted"
  print_info "This takes 15-30 minutes..."
}

delete_stack() {
  print_header "Deleting CloudFormation Stack"

  print_info "Stack: ${STACK_NAME}"

  aws cloudformation delete-stack --stack-name ${STACK_NAME}

  print_success "Stack deletion initiated"

  # Wait for completion
  print_info "Waiting for stack deletion to complete..."
  print_warning "This may take 20-40 minutes (CloudFront deletion is very slow)"
  print_info "You can safely Ctrl+C to background this"
  echo ""

  aws cloudformation wait stack-delete-complete --stack-name ${STACK_NAME}

  print_success "Stack deleted successfully!"
}

cleanup_temp_files() {
  rm -f /tmp/cf-config.json /tmp/cf-config-updated.json 2>/dev/null || true
}

################################################################################
# Main Execution
################################################################################

main() {
  print_header "HuntHub Asset Infrastructure Deletion"

  # Validate environment parameter
  if [[ ! "$ENVIRONMENT" =~ ^(dev|staging|production)$ ]]; then
    print_error "Invalid environment: ${ENVIRONMENT}"
    print_info "Usage: ./delete-stack.sh [dev|staging|production]"
    exit 1
  fi

  check_prerequisites

  # Check if stack exists
  if ! check_stack_exists; then
    print_error "Stack does not exist: ${STACK_NAME}"
    print_info "Nothing to delete"
    exit 0
  fi

  get_stack_resources
  confirm_deletion

  # Delete resources
  empty_s3_bucket
  # disable_cloudfront  # Optional - comment out if you want faster deletion
  delete_stack
  cleanup_temp_files

  print_header "Deletion Complete"
  print_success "All resources have been deleted"
  print_info "You can verify by running:"
  echo "    aws cloudformation list-stacks --stack-status-filter DELETE_COMPLETE | grep ${STACK_NAME}"
}

# Trap errors
trap cleanup_temp_files EXIT

# Run main function
main
