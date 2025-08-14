#!/bin/bash

# Google Cloud Run Deployment Script for Markdown Editor
# Usage: ./deploy.sh [project-id] [region] [domain]

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Default configuration
DEFAULT_REGION="us-central1"
DEFAULT_SERVICE_NAME="markdown-editor"

# Parse arguments
PROJECT_ID="${1:-}"
REGION="${2:-$DEFAULT_REGION}"
CUSTOM_DOMAIN="${3:-}"

if [ -z "$PROJECT_ID" ]; then
    print_error "Usage: $0 <project-id> [region] [domain]"
    print_error "Example: $0 my-gcp-project us-central1 markdown.example.com"
    exit 1
fi

print_status "Starting Google Cloud Run deployment..."
print_status "Project ID: $PROJECT_ID"
print_status "Region: $REGION"
print_status "Service Name: $DEFAULT_SERVICE_NAME"
if [ -n "$CUSTOM_DOMAIN" ]; then
    print_status "Custom Domain: $CUSTOM_DOMAIN"
fi

# Step 1: Verify gcloud CLI is installed and authenticated
print_status "Checking Google Cloud CLI..."
if ! command -v gcloud &> /dev/null; then
    print_error "Google Cloud CLI is not installed"
    print_error "Install it from: https://cloud.google.com/sdk/docs/install"
    exit 1
fi

# Check authentication
if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" | head -n1 &> /dev/null; then
    print_error "Not authenticated with Google Cloud"
    print_error "Run: gcloud auth login"
    exit 1
fi

print_success "Google Cloud CLI verified"

# Step 2: Set project and enable required APIs
print_status "Configuring Google Cloud project..."
gcloud config set project "$PROJECT_ID"

print_status "Enabling required APIs..."
gcloud services enable \
    cloudbuild.googleapis.com \
    run.googleapis.com \
    containerregistry.googleapis.com \
    artifactregistry.googleapis.com \
    --quiet

print_success "APIs enabled"

# Step 3: Create Artifact Registry repository (if it doesn't exist)
print_status "Setting up Artifact Registry..."
if ! gcloud artifacts repositories describe markdown-editor \
    --location="$REGION" &> /dev/null; then
    
    print_status "Creating Artifact Registry repository..."
    gcloud artifacts repositories create markdown-editor \
        --repository-format=docker \
        --location="$REGION" \
        --description="Markdown Editor container images"
else
    print_success "Artifact Registry repository already exists"
fi

# Step 4: Build application locally
print_status "Building application..."
if [ ! -d "../.." ]; then
    print_error "Script must be run from deployment/google-cloud-run directory"
    exit 1
fi

cd ../..

# Install dependencies and build
print_status "Installing dependencies..."
npm ci --silent

print_status "Building application..."
npm run build 2>/dev/null || npx vite build

if [ ! -d "dist" ] || [ ! -f "dist/index.html" ]; then
    print_error "Build failed or dist directory not found"
    exit 1
fi

print_success "Application built successfully"

# Step 5: Build and push Docker image
print_status "Building Docker image..."
IMAGE_NAME="$REGION-docker.pkg.dev/$PROJECT_ID/markdown-editor/app"
IMAGE_TAG="$(date +%Y%m%d-%H%M%S)"
FULL_IMAGE_NAME="$IMAGE_NAME:$IMAGE_TAG"
LATEST_IMAGE_NAME="$IMAGE_NAME:latest"

# Configure Docker authentication
gcloud auth configure-docker "$REGION-docker.pkg.dev" --quiet

# Build image
docker build -t "$FULL_IMAGE_NAME" -t "$LATEST_IMAGE_NAME" .

# Push images
print_status "Pushing Docker image to Artifact Registry..."
docker push "$FULL_IMAGE_NAME"
docker push "$LATEST_IMAGE_NAME"

print_success "Docker image pushed: $FULL_IMAGE_NAME"

# Step 6: Deploy to Cloud Run
print_status "Deploying to Cloud Run..."

# Create service account if it doesn't exist
SA_NAME="markdown-editor-sa"
SA_EMAIL="$SA_NAME@$PROJECT_ID.iam.gserviceaccount.com"

if ! gcloud iam service-accounts describe "$SA_EMAIL" &> /dev/null; then
    print_status "Creating service account..."
    gcloud iam service-accounts create "$SA_NAME" \
        --display-name="Markdown Editor Service Account" \
        --description="Service account for Markdown Editor Cloud Run service"
fi

# Deploy the service
gcloud run deploy "$DEFAULT_SERVICE_NAME" \
    --image="$FULL_IMAGE_NAME" \
    --platform=managed \
    --region="$REGION" \
    --allow-unauthenticated \
    --port=8080 \
    --memory=512Mi \
    --cpu=1 \
    --min-instances=0 \
    --max-instances=10 \
    --concurrency=100 \
    --timeout=300 \
    --service-account="$SA_EMAIL" \
    --set-env-vars="NODE_ENV=production,TZ=UTC" \
    --labels="app=markdown-editor,environment=production" \
    --execution-environment=gen2 \
    --quiet

# Get the service URL
SERVICE_URL=$(gcloud run services describe "$DEFAULT_SERVICE_NAME" \
    --region="$REGION" \
    --format="value(status.url)")

print_success "Deployment completed!"
print_success "Service URL: $SERVICE_URL"

# Step 7: Configure custom domain (if provided)
if [ -n "$CUSTOM_DOMAIN" ]; then
    print_status "Configuring custom domain: $CUSTOM_DOMAIN"
    
    # Create domain mapping
    if ! gcloud run domain-mappings describe "$CUSTOM_DOMAIN" \
        --region="$REGION" &> /dev/null; then
        
        gcloud run domain-mappings create \
            --service="$DEFAULT_SERVICE_NAME" \
            --domain="$CUSTOM_DOMAIN" \
            --region="$REGION" \
            --quiet
            
        print_success "Domain mapping created for $CUSTOM_DOMAIN"
        print_warning "Configure your DNS to point $CUSTOM_DOMAIN to:"
        print_warning "ghs.googlehosted.com"
    else
        print_success "Domain mapping already exists for $CUSTOM_DOMAIN"
    fi
fi

# Step 8: Health check
print_status "Performing health check..."
sleep 10  # Wait for deployment to stabilize

HTTP_CODE=$(curl -s -o /dev/null -w '%{http_code}' "$SERVICE_URL/health" || echo "000")
if [ "$HTTP_CODE" = "200" ]; then
    print_success "Health check passed (HTTP $HTTP_CODE)"
else
    print_warning "Health check returned HTTP $HTTP_CODE"
    print_warning "Service may still be starting up"
fi

# Step 9: Display deployment summary
echo ""
echo "=== Deployment Summary ==="
echo "Project ID: $PROJECT_ID"
echo "Region: $REGION"
echo "Service Name: $DEFAULT_SERVICE_NAME"
echo "Image: $FULL_IMAGE_NAME"
echo "Service URL: $SERVICE_URL"
if [ -n "$CUSTOM_DOMAIN" ]; then
    echo "Custom Domain: https://$CUSTOM_DOMAIN"
fi
echo ""

echo "=== Useful Commands ==="
echo "View logs:"
echo "  gcloud run services logs tail $DEFAULT_SERVICE_NAME --region=$REGION"
echo ""
echo "View service details:"
echo "  gcloud run services describe $DEFAULT_SERVICE_NAME --region=$REGION"
echo ""
echo "Update traffic allocation:"
echo "  gcloud run services update-traffic $DEFAULT_SERVICE_NAME --to-latest --region=$REGION"
echo ""
echo "Delete service:"
echo "  gcloud run services delete $DEFAULT_SERVICE_NAME --region=$REGION"
echo ""

echo "=== Monitoring and Management ==="
echo "Cloud Console: https://console.cloud.google.com/run/detail/$REGION/$DEFAULT_SERVICE_NAME/metrics?project=$PROJECT_ID"
echo "Logs: https://console.cloud.google.com/run/detail/$REGION/$DEFAULT_SERVICE_NAME/logs?project=$PROJECT_ID"
echo ""

print_success "Google Cloud Run deployment completed successfully!"

# Clean up local Docker images (optional)
print_status "Cleaning up local Docker images..."
docker rmi "$FULL_IMAGE_NAME" "$LATEST_IMAGE_NAME" 2>/dev/null || true

cd deployment/google-cloud-run