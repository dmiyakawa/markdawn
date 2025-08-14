# Google Cloud Run Deployment Guide

This guide covers deploying the Markdown Editor to Google Cloud Run with automatic scaling, SSL certificates, and custom domains.

## Prerequisites

1. **Google Cloud Account** with billing enabled
2. **Google Cloud CLI** installed and authenticated
3. **Docker** installed locally
4. **Project with required APIs** enabled

## Quick Deployment

### Option 1: Using Deployment Script (Recommended)
```bash
# Navigate to deployment directory
cd deployment/google-cloud-run

# Deploy to Cloud Run
./deploy.sh your-project-id us-central1 markdown.example.com
```

### Option 2: Using Cloud Build
```bash
# Submit build to Cloud Build
gcloud builds submit --config=cloudbuild.yaml \
  --substitutions=_REGION=us-central1,_CUSTOM_DOMAIN=markdown.example.com
```

### Option 3: Manual Deployment
```bash
# Build and push image
docker build -t gcr.io/your-project-id/markdown-editor .
docker push gcr.io/your-project-id/markdown-editor

# Deploy to Cloud Run
gcloud run deploy markdown-editor \
  --image=gcr.io/your-project-id/markdown-editor \
  --platform=managed \
  --region=us-central1 \
  --allow-unauthenticated
```

## Detailed Setup

### 1. Prerequisites Setup

#### Install Google Cloud CLI
```bash
# macOS
brew install google-cloud-sdk

# Ubuntu/Debian
echo "deb [signed-by=/usr/share/keyrings/cloud.google.gpg] https://packages.cloud.google.com/apt cloud-sdk main" | sudo tee -a /etc/apt/sources.list.d/google-cloud-sdk.list
curl https://packages.cloud.google.com/apt/doc/apt-key.gpg | sudo apt-key --keyring /usr/share/keyrings/cloud.google.gpg add -
sudo apt update && sudo apt install google-cloud-cli
```

#### Authenticate and Set Project
```bash
# Login to Google Cloud
gcloud auth login

# Set project
gcloud config set project YOUR_PROJECT_ID

# Enable required APIs
gcloud services enable \
  cloudbuild.googleapis.com \
  run.googleapis.com \
  containerregistry.googleapis.com \
  artifactregistry.googleapis.com
```

### 2. Build Configuration

#### Cloud Build Configuration
The `cloudbuild.yaml` file defines the complete CI/CD pipeline:

1. **Build Stage**: Install dependencies and build the application
2. **Docker Stage**: Build and push container image
3. **Deploy Stage**: Deploy to Cloud Run
4. **Domain Stage**: Configure custom domain (optional)

#### Customization Variables
```yaml
substitutions:
  _REGION: 'us-central1'          # Deployment region
  _CUSTOM_DOMAIN: ''              # Your custom domain
  _MIN_INSTANCES: '0'             # Minimum instances
  _MAX_INSTANCES: '10'            # Maximum instances
  _MEMORY: '512Mi'                # Memory allocation
  _CPU: '1'                       # CPU allocation
```

### 3. Service Configuration

#### Resource Allocation
- **Memory**: 512Mi (adjustable based on needs)
- **CPU**: 1 vCPU (adjustable)
- **Concurrency**: 100 requests per instance
- **Timeout**: 300 seconds
- **Auto-scaling**: 0-10 instances

#### Health Checks
- **Liveness Probe**: `/health` endpoint every 10 seconds
- **Readiness Probe**: `/health` endpoint every 5 seconds
- **Startup Probe**: Up to 5 minutes for container startup

#### Security Features
- Non-root user execution (UID 1001)
- Read-only root filesystem
- No privilege escalation
- Minimal capabilities

## Custom Domain Setup

### 1. Domain Verification
```bash
# Verify domain ownership
gcloud domains verify YOUR_DOMAIN.com
```

### 2. Create Domain Mapping
```bash
# Map domain to Cloud Run service
gcloud run domain-mappings create \
  --service=markdown-editor \
  --domain=markdown.example.com \
  --region=us-central1
```

### 3. DNS Configuration
Point your domain to Google Cloud Run:
```
CNAME: ghs.googlehosted.com
```

### 4. SSL Certificate
SSL certificates are automatically provisioned and managed by Google.

## Environment Variables

### Production Environment
```bash
NODE_ENV=production
TZ=UTC
PORT=8080
```

### Additional Configuration (Optional)
```bash
# Custom environment variables
gcloud run services update markdown-editor \
  --set-env-vars="CUSTOM_VAR=value" \
  --region=us-central1
```

## Monitoring and Logging

### View Service Logs
```bash
# Real-time logs
gcloud run services logs tail markdown-editor --region=us-central1

# Historical logs
gcloud run services logs read markdown-editor --region=us-central1 --limit=50
```

### Service Metrics
Access metrics in the Cloud Console:
- **URL**: `https://console.cloud.google.com/run/detail/REGION/SERVICE_NAME/metrics`
- **Request count, latency, error rate**
- **Container instance metrics**
- **Custom dashboards available**

### Alerts and Monitoring
```bash
# Create alerting policy for error rate
gcloud alpha monitoring policies create \
  --policy-from-file=monitoring/error-rate-policy.yaml
```

## Scaling Configuration

### Auto-scaling Settings
```bash
# Update scaling configuration
gcloud run services update markdown-editor \
  --min-instances=1 \
  --max-instances=20 \
  --concurrency=200 \
  --region=us-central1
```

### Traffic Management
```bash
# Split traffic between revisions
gcloud run services update-traffic markdown-editor \
  --to-revisions=REVISION1=50,REVISION2=50 \
  --region=us-central1

# Route all traffic to latest
gcloud run services update-traffic markdown-editor \
  --to-latest \
  --region=us-central1
```

## Security Considerations

### IAM and Service Accounts
```bash
# Create dedicated service account
gcloud iam service-accounts create markdown-editor-sa \
  --display-name="Markdown Editor Service Account"

# Assign minimal permissions
gcloud projects add-iam-policy-binding PROJECT_ID \
  --member="serviceAccount:markdown-editor-sa@PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/run.invoker"
```

### Network Security
```bash
# Restrict ingress (if needed)
gcloud run services update markdown-editor \
  --ingress=internal-and-cloud-load-balancing \
  --region=us-central1

# VPC connector (for private resources)
gcloud run services update markdown-editor \
  --vpc-connector=CONNECTOR_NAME \
  --region=us-central1
```

## Cost Optimization

### Pricing Factors
- **CPU and Memory allocation**
- **Request volume**
- **Instance time**
- **Network egress**

### Cost Optimization Tips
1. **Right-size resources**: Start with minimal resources
2. **Min instances**: Set to 0 for cost savings
3. **Request batching**: Optimize for higher concurrency
4. **Regional selection**: Choose cost-effective regions

### Cost Monitoring
```bash
# View billing information
gcloud billing accounts list
gcloud billing projects describe PROJECT_ID
```

## CI/CD Integration

### GitHub Actions Integration
```yaml
name: Deploy to Cloud Run
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    - uses: google-github-actions/setup-gcloud@v0
      with:
        service_account_key: ${{ secrets.GCP_SA_KEY }}
        project_id: ${{ secrets.GCP_PROJECT_ID }}
    - run: gcloud builds submit --config=cloudbuild.yaml
```

### Automated Testing
```bash
# Run tests before deployment
gcloud builds submit --config=cloudbuild-test.yaml
```

## Backup and Disaster Recovery

### Image Backup
Images are automatically stored in Artifact Registry with versioning.

### Configuration Backup
```bash
# Export service configuration
gcloud run services describe markdown-editor \
  --region=us-central1 \
  --format="export" > service-backup.yaml

# Restore from backup
gcloud run services replace service-backup.yaml --region=us-central1
```

### Multi-region Deployment
```bash
# Deploy to multiple regions
for region in us-central1 us-east1 europe-west1; do
  gcloud run deploy markdown-editor \
    --image=gcr.io/PROJECT_ID/markdown-editor \
    --region=$region \
    --allow-unauthenticated
done
```

## Troubleshooting

### Common Issues

#### 1. Build Failures
```bash
# Check build logs
gcloud builds log BUILD_ID

# Inspect Cloud Build history
gcloud builds list --limit=10
```

#### 2. Service Not Responding
```bash
# Check service status
gcloud run services describe markdown-editor --region=us-central1

# View recent logs
gcloud run services logs read markdown-editor --region=us-central1
```

#### 3. Domain Mapping Issues
```bash
# Check domain mapping status
gcloud run domain-mappings describe DOMAIN --region=us-central1

# Verify DNS configuration
dig DOMAIN CNAME
```

#### 4. Permission Errors
```bash
# Check IAM permissions
gcloud projects get-iam-policy PROJECT_ID

# Test service account permissions
gcloud auth activate-service-account --key-file=key.json
```

### Health Check Debugging
```bash
# Test health endpoint
curl -I https://YOUR_SERVICE_URL/health

# Check container startup
gcloud run services logs read markdown-editor \
  --region=us-central1 \
  --filter="severity>=ERROR"
```

## Advanced Configuration

### Blue-Green Deployments
```bash
# Deploy new version without traffic
gcloud run deploy markdown-editor \
  --image=gcr.io/PROJECT_ID/markdown-editor:v2 \
  --no-traffic \
  --tag=v2 \
  --region=us-central1

# Gradually shift traffic
gcloud run services update-traffic markdown-editor \
  --to-tags=v2=10 \
  --region=us-central1
```

### Custom VPC Integration
```bash
# Create VPC connector
gcloud compute networks vpc-access connectors create markdown-editor-connector \
  --region=us-central1 \
  --subnet=default \
  --subnet-project=PROJECT_ID

# Update service to use VPC
gcloud run services update markdown-editor \
  --vpc-connector=markdown-editor-connector \
  --region=us-central1
```

## Useful Commands Reference

### Service Management
```bash
# List services
gcloud run services list

# Get service URL
gcloud run services describe SERVICE_NAME --region=REGION --format="value(status.url)"

# Delete service
gcloud run services delete SERVICE_NAME --region=REGION
```

### Revision Management
```bash
# List revisions
gcloud run revisions list --service=SERVICE_NAME --region=REGION

# Delete old revisions
gcloud run revisions delete REVISION_NAME --region=REGION
```

### Configuration Updates
```bash
# Update environment variables
gcloud run services update SERVICE_NAME \
  --update-env-vars=KEY=VALUE \
  --region=REGION

# Update resource allocation
gcloud run services update SERVICE_NAME \
  --memory=1Gi \
  --cpu=2 \
  --region=REGION
```

## Support and Resources

- **Cloud Run Documentation**: https://cloud.google.com/run/docs
- **Pricing Calculator**: https://cloud.google.com/products/calculator
- **Status Page**: https://status.cloud.google.com/
- **Support**: https://cloud.google.com/support