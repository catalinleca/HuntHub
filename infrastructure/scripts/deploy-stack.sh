#!/bin/bash

################################################################################
# HuntHub Asset Infrastructure Deployment Script
################################################################################
#
# Usage: ./deploy-stack.sh [dev|staging|production]
#
# This script deploys the HuntHub asset storage infrastructure using CloudFormation.
# It creates or updates:
#   - S3 bucket for asset storage
#   - CloudFront CDN distribution
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
TEMPLATE_FILE="../cloudformation/hunthub-assets.yaml"
PARAMETERS_FILE="../cloudformation/parameters/${ENVIRONMENT}.json"

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
  print_header "Checking Prerequisites"

  # Check if AWS CLI is installed
  if ! command -v aws &> /dev/null; then
    print_error "AWS CLI is not installed"
    print_info "Install it with: brew install awscli"
    exit 1
  fi
  print_success "AWS CLI is installed"

  # Check if AWS credentials are configured
  if ! aws sts get-caller-identity &> /dev/null; then
    print_error "AWS credentials are not configured or invalid"
    print_info "Run: aws configure"
    exit 1
  fi
  print_success "AWS credentials are valid"

  # Show current AWS identity
  ACCOUNT_ID=$(aws sts get-caller-identity --query 'Account' --output text)
  USER_ARN=$(aws sts get-caller-identity --query 'Arn' --output text)
  print_info "AWS Account: ${ACCOUNT_ID}"
  print_info "AWS User: ${USER_ARN}"
}

validate_template() {
  print_header "Validating CloudFormation Template"

  if aws cloudformation validate-template --template-body file://${TEMPLATE_FILE} &> /dev/null; then
    print_success "Template is valid"
  else
    print_error "Template validation failed"
    aws cloudformation validate-template --template-body file://${TEMPLATE_FILE}
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

deploy_stack() {
  print_header "Deploying Stack: ${STACK_NAME}"

  print_info "Template: ${TEMPLATE_FILE}"
  print_info "Parameters: ${PARAMETERS_FILE}"
  print_info "Environment: ${ENVIRONMENT}"
  echo ""

  # Check if stack exists
  if check_stack_exists; then
    print_warning "Stack already exists, updating..."
    COMMAND="update-stack"
    WAIT_COMMAND="stack-update-complete"
  else
    print_info "Stack doesn't exist, creating new stack..."
    COMMAND="create-stack"
    WAIT_COMMAND="stack-create-complete"
  fi

  # Deploy stack
  print_info "Running: aws cloudformation ${COMMAND} --stack-name ${STACK_NAME}"

  aws cloudformation ${COMMAND} \
    --stack-name ${STACK_NAME} \
    --template-body file://${TEMPLATE_FILE} \
    --parameters file://${PARAMETERS_FILE} \
    --capabilities CAPABILITY_IAM CAPABILITY_NAMED_IAM \
    --tags \
      Key=Project,Value=HuntHub \
      Key=Environment,Value=${ENVIRONMENT} \
      Key=ManagedBy,Value=CloudFormation

  print_success "CloudFormation ${COMMAND} initiated"

  # Wait for completion
  print_header "Waiting for ${COMMAND} to complete"
  print_warning "This typically takes 10-15 minutes (CloudFront distribution is slow)"
  print_info "You can safely Ctrl+C to background this - stack will continue deploying"
  print_info "Check status with: aws cloudformation describe-stacks --stack-name ${STACK_NAME}"
  echo ""

  # Show progress
  aws cloudformation wait ${WAIT_COMMAND} --stack-name ${STACK_NAME}

  print_success "Stack ${COMMAND} completed successfully!"
}

show_outputs() {
  print_header "Stack Outputs"

  aws cloudformation describe-stacks \
    --stack-name ${STACK_NAME} \
    --query 'Stacks[0].Outputs' \
    --output table

  print_header "Next Steps"

  # Extract outputs
  CDN_DOMAIN=$(aws cloudformation describe-stacks \
    --stack-name ${STACK_NAME} \
    --query 'Stacks[0].Outputs[?OutputKey==`CDNDomain`].OutputValue' \
    --output text)

  S3_BUCKET=$(aws cloudformation describe-stacks \
    --stack-name ${STACK_NAME} \
    --query 'Stacks[0].Outputs[?OutputKey==`S3BucketName`].OutputValue' \
    --output text)

  DIST_ID=$(aws cloudformation describe-stacks \
    --stack-name ${STACK_NAME} \
    --query 'Stacks[0].Outputs[?OutputKey==`CDNDistributionId`].OutputValue' \
    --output text)

  echo ""
  print_info "1. Add these environment variables to your backend .env.local:"
  echo ""
  echo "   # AWS S3 & CloudFront"
  echo "   S3_BUCKET_NAME=${S3_BUCKET}"
  echo "   CDN_DOMAIN=${CDN_DOMAIN}"
  echo ""
  print_info "2. Test upload presigned URL generation:"
  echo ""
  echo "   curl -X POST http://localhost:3000/api/assets/upload/url \\"
  echo "     -H \"Authorization: Bearer YOUR_TOKEN\" \\"
  echo "     -d '{\"filename\":\"test.jpg\",\"mimeType\":\"image/jpeg\",\"sizeBytes\":500000}'"
  echo ""
  print_info "3. Invalidate CloudFront cache (after updating files):"
  echo ""
  echo "   aws cloudfront create-invalidation --distribution-id ${DIST_ID} --paths \"/*\""
  echo ""
  print_success "Deployment complete! 🎉"
}

################################################################################
# Main Execution
################################################################################

main() {
  print_header "HuntHub Asset Infrastructure Deployment"

  # Validate environment parameter
  if [[ ! "$ENVIRONMENT" =~ ^(dev|staging|production)$ ]]; then
    print_error "Invalid environment: ${ENVIRONMENT}"
    print_info "Usage: ./deploy-stack.sh [dev|staging|production]"
    exit 1
  fi

  # Check if files exist
  if [ ! -f "${TEMPLATE_FILE}" ]; then
    print_error "Template file not found: ${TEMPLATE_FILE}"
    exit 1
  fi

  if [ ! -f "${PARAMETERS_FILE}" ]; then
    print_error "Parameters file not found: ${PARAMETERS_FILE}"
    exit 1
  fi

  # Run deployment steps
  check_prerequisites
  validate_template
  deploy_stack
  show_outputs
}

# Run main function
main
