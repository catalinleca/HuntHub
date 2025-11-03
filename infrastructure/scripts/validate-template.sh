#!/bin/bash

################################################################################
# CloudFormation Template Validation Script
################################################################################
#
# Usage: ./validate-template.sh
#
# This script validates the CloudFormation template syntax and structure.
# Run this before deploying to catch errors early.
#
################################################################################

set -e  # Exit immediately if a command exits with a non-zero status

################################################################################
# Configuration
################################################################################

TEMPLATE_FILE="../cloudformation/hunthub-assets.yaml"

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
    print_info "Install it with: brew install awscli"
    exit 1
  fi

  # Check if AWS credentials are configured
  if ! aws sts get-caller-identity &> /dev/null; then
    print_error "AWS credentials are not configured or invalid"
    print_info "Run: aws configure"
    exit 1
  fi
}

validate_yaml_syntax() {
  print_header "Step 1: Validating YAML Syntax"

  # Check if yq is installed (optional)
  if command -v yq &> /dev/null; then
    print_info "Using yq for YAML validation"
    if yq eval '.' ${TEMPLATE_FILE} > /dev/null 2>&1; then
      print_success "YAML syntax is valid"
    else
      print_error "YAML syntax is invalid"
      yq eval '.' ${TEMPLATE_FILE}
      exit 1
    fi
  else
    print_warning "yq not installed, skipping YAML syntax check"
    print_info "Install with: brew install yq"
  fi
}

validate_cloudformation() {
  print_header "Step 2: Validating CloudFormation Template"

  print_info "Template: ${TEMPLATE_FILE}"
  echo ""

  # Validate with AWS
  VALIDATION_OUTPUT=$(aws cloudformation validate-template --template-body file://${TEMPLATE_FILE} 2>&1)

  if [ $? -eq 0 ]; then
    print_success "CloudFormation template is valid!"
    echo ""

    # Show template details
    print_info "Template Details:"
    echo ""
    echo "$VALIDATION_OUTPUT" | jq -r '
      "  Description: \(.Description)",
      "  Parameters: \(.Parameters | length)",
      "  Capabilities Required: \(.Capabilities // [] | join(", "))"
    '

    echo ""
    print_info "Parameters:"
    echo "$VALIDATION_OUTPUT" | jq -r '.Parameters[] | "  - \(.ParameterKey) (\(.ParameterType)): \(.Description)"'

    echo ""
  else
    print_error "CloudFormation template validation failed!"
    echo ""
    echo "$VALIDATION_OUTPUT"
    exit 1
  fi
}

lint_template() {
  print_header "Step 3: Linting Template (cfn-lint)"

  # Check if cfn-lint is installed
  if ! command -v cfn-lint &> /dev/null; then
    print_warning "cfn-lint not installed, skipping linting"
    print_info "Install with: pip install cfn-lint"
    return 0
  fi

  print_info "Running cfn-lint..."
  echo ""

  if cfn-lint ${TEMPLATE_FILE}; then
    print_success "No linting issues found"
  else
    print_warning "Linting found issues (not blocking)"
  fi
}

check_best_practices() {
  print_header "Step 4: Checking Best Practices"

  # Check for common issues
  ISSUES_FOUND=0

  # Check 1: DeletionPolicy on important resources
  if ! grep -q "DeletionPolicy: Retain" ${TEMPLATE_FILE}; then
    print_warning "Consider adding DeletionPolicy: Retain to critical resources (S3 bucket)"
    ISSUES_FOUND=$((ISSUES_FOUND + 1))
  else
    print_success "DeletionPolicy found on resources"
  fi

  # Check 2: Tags on resources
  TAG_COUNT=$(grep -c "Tags:" ${TEMPLATE_FILE} || echo "0")
  if [ "$TAG_COUNT" -lt 3 ]; then
    print_warning "Consider adding more tags for better organization"
    ISSUES_FOUND=$((ISSUES_FOUND + 1))
  else
    print_success "Resources have tags"
  fi

  # Check 3: Outputs defined
  if ! grep -q "^Outputs:" ${TEMPLATE_FILE}; then
    print_warning "No outputs defined - consider adding outputs for important values"
    ISSUES_FOUND=$((ISSUES_FOUND + 1))
  else
    print_success "Outputs section found"
  fi

  # Check 4: Description present
  if ! grep -q "^Description:" ${TEMPLATE_FILE}; then
    print_warning "No description found"
    ISSUES_FOUND=$((ISSUES_FOUND + 1))
  else
    print_success "Template has description"
  fi

  echo ""
  if [ $ISSUES_FOUND -eq 0 ]; then
    print_success "All best practice checks passed!"
  else
    print_info "Found ${ISSUES_FOUND} best practice suggestions (non-blocking)"
  fi
}

show_summary() {
  print_header "Validation Summary"

  print_success "Template validation complete!"
  echo ""
  print_info "Next steps:"
  echo ""
  echo "  1. Deploy to dev environment:"
  echo "     ./deploy-stack.sh dev"
  echo ""
  echo "  2. Or deploy to production:"
  echo "     ./deploy-stack.sh production"
  echo ""
}

################################################################################
# Main Execution
################################################################################

main() {
  print_header "CloudFormation Template Validation"

  # Check if template exists
  if [ ! -f "${TEMPLATE_FILE}" ]; then
    print_error "Template file not found: ${TEMPLATE_FILE}"
    exit 1
  fi

  check_prerequisites
  validate_yaml_syntax
  validate_cloudformation
  lint_template
  check_best_practices
  show_summary
}

# Run main function
main
