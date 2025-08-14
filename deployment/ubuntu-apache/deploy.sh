#!/bin/bash

# Markdown Editor - Ubuntu Server with Apache 2.4 Deployment Script
# Usage: ./deploy.sh user@server-ip domain.com

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
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

# Check arguments
if [ $# -lt 2 ]; then
    print_error "Usage: $0 user@server-ip domain.com [staging]"
    print_error "Example: $0 ubuntu@192.168.1.100 my-markdown-editor.com"
    print_error "Add 'staging' as third argument for staging deployment"
    exit 1
fi

SERVER="$1"
DOMAIN="$2"
IS_STAGING="${3:-}"

# Configuration
LOCAL_BUILD_DIR="../../dist"
REMOTE_APP_DIR="/var/www/markdown-editor"
REMOTE_STAGING_DIR="/var/www/markdown-editor-staging"
APACHE_SITES_DIR="/etc/apache2/sites-available"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Determine deployment directory
if [ "$IS_STAGING" = "staging" ]; then
    DEPLOY_DIR="$REMOTE_STAGING_DIR"
    print_warning "Staging deployment mode enabled"
else
    DEPLOY_DIR="$REMOTE_APP_DIR"
fi

print_status "Starting deployment to $SERVER"
print_status "Domain: $DOMAIN"
print_status "Deploy directory: $DEPLOY_DIR"

# Step 1: Check if local build exists
print_status "Checking local build..."
if [ ! -d "$LOCAL_BUILD_DIR" ]; then
    print_error "Build directory not found: $LOCAL_BUILD_DIR"
    print_error "Please run 'npm run build' first"
    exit 1
fi

if [ ! -f "$LOCAL_BUILD_DIR/index.html" ]; then
    print_error "index.html not found in build directory"
    print_error "Please ensure the build completed successfully"
    exit 1
fi

print_success "Local build found"

# Step 2: Test SSH connection
print_status "Testing SSH connection..."
if ! ssh -o ConnectTimeout=10 -o BatchMode=yes "$SERVER" exit 2>/dev/null; then
    print_error "Cannot connect to server: $SERVER"
    print_error "Please check SSH configuration and server accessibility"
    exit 1
fi

print_success "SSH connection successful"

# Step 3: Check server prerequisites
print_status "Checking server prerequisites..."
ssh "$SERVER" bash << 'EOF'
    # Check if Apache is installed and running
    if ! command -v apache2 &> /dev/null; then
        echo "ERROR: Apache2 is not installed"
        exit 1
    fi
    
    if ! systemctl is-active --quiet apache2; then
        echo "ERROR: Apache2 is not running"
        exit 1
    fi
    
    # Check if required modules are enabled
    REQUIRED_MODULES=("rewrite" "ssl" "headers")
    for module in "${REQUIRED_MODULES[@]}"; do
        if ! apache2ctl -M | grep -q "${module}_module"; then
            echo "ERROR: Apache module '$module' is not enabled"
            echo "Run: sudo a2enmod $module"
            exit 1
        fi
    done
    
    echo "SUCCESS: All prerequisites met"
EOF

if [ $? -ne 0 ]; then
    print_error "Server prerequisites not met"
    exit 1
fi

print_success "Server prerequisites verified"

# Step 4: Create deployment directory
print_status "Creating deployment directory..."
ssh "$SERVER" "sudo mkdir -p $DEPLOY_DIR && sudo chown -R \$USER:\$USER $DEPLOY_DIR"

# Step 5: Backup existing deployment (if not staging)
if [ "$IS_STAGING" != "staging" ] && ssh "$SERVER" "[ -d $DEPLOY_DIR ]"; then
    print_status "Creating backup of existing deployment..."
    BACKUP_DIR="/var/www/markdown-editor-backup-$(date +%Y%m%d-%H%M%S)"
    ssh "$SERVER" "sudo cp -r $DEPLOY_DIR $BACKUP_DIR"
    print_success "Backup created: $BACKUP_DIR"
fi

# Step 6: Upload application files
print_status "Uploading application files..."
rsync -avz --delete "$LOCAL_BUILD_DIR/" "$SERVER:$DEPLOY_DIR/"

if [ $? -ne 0 ]; then
    print_error "Failed to upload application files"
    exit 1
fi

print_success "Application files uploaded"

# Step 7: Set proper permissions
print_status "Setting file permissions..."
ssh "$SERVER" bash << EOF
    sudo chown -R www-data:www-data $DEPLOY_DIR
    sudo chmod -R 644 $DEPLOY_DIR
    sudo find $DEPLOY_DIR -type d -exec chmod 755 {} \;
EOF

print_success "File permissions set"

# Step 8: Configure Apache virtual host (only for production deployment)
if [ "$IS_STAGING" != "staging" ]; then
    print_status "Configuring Apache virtual host..."
    
    # Upload and configure virtual host
    TEMP_VHOST="/tmp/markdown-editor.conf"
    scp "$SCRIPT_DIR/apache-vhost.conf" "$SERVER:$TEMP_VHOST"
    
    ssh "$SERVER" bash << EOF
        # Replace placeholder domain with actual domain
        sudo sed -i 's/your-domain\.com/$DOMAIN/g' $TEMP_VHOST
        
        # Move to sites-available
        sudo mv $TEMP_VHOST $APACHE_SITES_DIR/markdown-editor.conf
        
        # Enable site
        sudo a2ensite markdown-editor.conf
        
        # Disable default site if it's enabled
        if sudo a2ensite | grep -q "000-default"; then
            sudo a2dissite 000-default.conf
        fi
        
        # Test Apache configuration
        if ! sudo apache2ctl configtest; then
            echo "ERROR: Apache configuration test failed"
            exit 1
        fi
        
        # Reload Apache
        sudo systemctl reload apache2
EOF
    
    if [ $? -ne 0 ]; then
        print_error "Apache configuration failed"
        exit 1
    fi
    
    print_success "Apache virtual host configured"
fi

# Step 9: Health check
print_status "Performing health check..."
if [ "$IS_STAGING" != "staging" ]; then
    # Test HTTP response
    HTTP_CODE=$(ssh "$SERVER" "curl -s -o /dev/null -w '%{http_code}' http://localhost/")
    if [ "$HTTP_CODE" = "200" ]; then
        print_success "Health check passed (HTTP $HTTP_CODE)"
    else
        print_warning "Health check returned HTTP $HTTP_CODE"
        print_warning "Check Apache error logs: sudo journalctl -u apache2 -n 20"
    fi
fi

# Step 10: Display deployment summary
print_success "Deployment completed successfully!"
echo ""
echo "=== Deployment Summary ==="
echo "Server: $SERVER"
echo "Domain: $DOMAIN"
echo "Deploy Directory: $DEPLOY_DIR"
echo "Deployment Type: $([ "$IS_STAGING" = "staging" ] && echo "Staging" || echo "Production")"
echo ""

if [ "$IS_STAGING" != "staging" ]; then
    echo "=== Next Steps ==="
    echo "1. Test your application: http://$DOMAIN"
    echo "2. Set up SSL certificate:"
    echo "   ssh $SERVER"
    echo "   sudo certbot --apache -d $DOMAIN -d www.$DOMAIN"
    echo ""
    echo "3. Monitor logs:"
    echo "   sudo tail -f /var/log/apache2/markdown-editor-access.log"
    echo "   sudo tail -f /var/log/apache2/markdown-editor-error.log"
else
    echo "=== Staging Deployment ==="
    echo "Staging files deployed to: $DEPLOY_DIR"
    echo "To promote to production:"
    echo "1. Test staging deployment thoroughly"
    echo "2. Run: ./deploy.sh $SERVER $DOMAIN"
fi

echo ""
print_success "Deployment script completed!"