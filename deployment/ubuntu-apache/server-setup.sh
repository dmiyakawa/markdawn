#!/bin/bash

# Ubuntu Server Setup Script for Markdown Editor
# Run this script on your Ubuntu server to install and configure all prerequisites

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

# Check if running as root
if [ "$EUID" -eq 0 ]; then
    print_error "This script should not be run as root"
    print_error "Run as a regular user with sudo privileges"
    exit 1
fi

# Check for sudo privileges
if ! sudo -n true 2>/dev/null; then
    print_error "This script requires sudo privileges"
    print_error "Please run with a user that has sudo access"
    exit 1
fi

print_status "Starting Ubuntu Server setup for Markdown Editor..."

# Step 1: Update system packages
print_status "Updating system packages..."
sudo apt update && sudo apt upgrade -y
print_success "System packages updated"

# Step 2: Install Apache 2.4
print_status "Installing Apache 2.4..."
sudo apt install apache2 -y

# Start and enable Apache
sudo systemctl start apache2
sudo systemctl enable apache2
print_success "Apache 2.4 installed and started"

# Step 3: Install required Apache modules
print_status "Enabling required Apache modules..."
sudo a2enmod rewrite
sudo a2enmod ssl
sudo a2enmod headers
sudo a2enmod expires
sudo a2enmod deflate

# Restart Apache to load modules
sudo systemctl restart apache2
print_success "Apache modules enabled"

# Step 4: Configure firewall
print_status "Configuring firewall..."
sudo ufw allow 'Apache Full'
sudo ufw allow OpenSSH

# Enable firewall if not already enabled
if ! sudo ufw status | grep -q "Status: active"; then
    print_warning "Enabling UFW firewall..."
    sudo ufw --force enable
fi

print_success "Firewall configured"

# Step 5: Install additional tools
print_status "Installing additional tools..."
sudo apt install -y curl wget unzip rsync

# Install Certbot for SSL certificates
sudo apt install -y certbot python3-certbot-apache

print_success "Additional tools installed"

# Step 6: Create application directory
print_status "Creating application directory..."
sudo mkdir -p /var/www/markdown-editor
sudo chown -R $USER:$USER /var/www/markdown-editor
sudo chmod -R 755 /var/www/markdown-editor

print_success "Application directory created"

# Step 7: Configure Apache security
print_status "Configuring Apache security..."

# Create security configuration
sudo tee /etc/apache2/conf-available/security-enhanced.conf > /dev/null << 'EOF'
# Enhanced Security Configuration for Markdown Editor

# Hide Apache version and OS information
ServerTokens Prod
ServerSignature Off

# Disable unnecessary modules (optional - be careful)
# LoadModule autoindex_module modules/mod_autoindex.so
# LoadModule status_module modules/mod_status.so

# Prevent access to .ht files
<FilesMatch "^\.ht">
    Require all denied
</FilesMatch>

# Prevent access to version control directories
<DirectoryMatch "\.git">
    Require all denied
</DirectoryMatch>

# Disable server-info and server-status
<Location "/server-info">
    Require all denied
</Location>

<Location "/server-status">
    Require all denied
</Location>

# Timeout settings
Timeout 60
KeepAliveTimeout 15

# Limit request size (adjust as needed)
LimitRequestBody 10485760  # 10MB
EOF

# Enable the security configuration
sudo a2enconf security-enhanced

print_success "Apache security configured"

# Step 8: Set up log rotation
print_status "Configuring log rotation..."
sudo tee /etc/logrotate.d/markdown-editor > /dev/null << 'EOF'
/var/log/apache2/markdown-editor-*.log {
    daily
    missingok
    rotate 52
    compress
    delaycompress
    notifempty
    create 640 root adm
    sharedscripts
    postrotate
        if /bin/systemctl status apache2 > /dev/null ; then \
            /bin/systemctl reload apache2 > /dev/null; \
        fi;
    endscript
}
EOF

print_success "Log rotation configured"

# Step 9: Create backup directory
print_status "Creating backup directory..."
sudo mkdir -p /backup
sudo chown $USER:$USER /backup
print_success "Backup directory created"

# Step 10: Test Apache configuration
print_status "Testing Apache configuration..."
if sudo apache2ctl configtest; then
    print_success "Apache configuration test passed"
    sudo systemctl reload apache2
else
    print_error "Apache configuration test failed"
    exit 1
fi

# Step 11: Install optional security tools
print_status "Installing optional security tools..."

# Install fail2ban for additional security (optional)
if ! command -v fail2ban-server &> /dev/null; then
    print_status "Installing fail2ban..."
    sudo apt install -y fail2ban
    
    # Basic fail2ban configuration for Apache
    sudo tee /etc/fail2ban/jail.local > /dev/null << 'EOF'
[apache-auth]
enabled = true
port = http,https
filter = apache-auth
logpath = /var/log/apache2/*error.log
maxretry = 6
bantime = 600

[apache-badbots]
enabled = true
port = http,https
filter = apache-badbots
logpath = /var/log/apache2/*access.log
maxretry = 2
bantime = 86400

[apache-noscript]
enabled = true
port = http,https
filter = apache-noscript
logpath = /var/log/apache2/*access.log
maxretry = 6
bantime = 86400
EOF
    
    sudo systemctl enable fail2ban
    sudo systemctl start fail2ban
    print_success "fail2ban installed and configured"
fi

# Display server information
print_success "Ubuntu Server setup completed successfully!"
echo ""
echo "=== Server Information ==="
echo "Operating System: $(lsb_release -d | cut -f2)"
echo "Apache Version: $(apache2 -v | head -n1)"
echo "Server IP: $(curl -s ifconfig.me 2>/dev/null || echo "Unable to detect")"
echo "Available Space: $(df -h / | awk 'NR==2{print $4}')"
echo "Memory: $(free -h | awk 'NR==2{print $2}')"
echo ""

echo "=== Next Steps ==="
echo "1. Configure your domain DNS to point to this server"
echo "2. Run the deployment script from your local machine:"
echo "   ./deploy.sh user@$(curl -s ifconfig.me 2>/dev/null || echo "server-ip") your-domain.com"
echo "3. Set up SSL certificate after deployment:"
echo "   sudo certbot --apache -d your-domain.com -d www.your-domain.com"
echo ""

echo "=== Useful Commands ==="
echo "Check Apache status: sudo systemctl status apache2"
echo "View Apache error logs: sudo tail -f /var/log/apache2/error.log"
echo "View Apache access logs: sudo tail -f /var/log/apache2/access.log"
echo "Test Apache config: sudo apache2ctl configtest"
echo "Check firewall status: sudo ufw status"
echo ""

print_success "Server is ready for Markdown Editor deployment!"