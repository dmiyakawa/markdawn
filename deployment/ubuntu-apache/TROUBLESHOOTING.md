# Troubleshooting Guide - Ubuntu Server with Apache 2.4

This guide covers common issues and solutions for deploying the Markdown Editor on Ubuntu Server with Apache 2.4.

## Pre-Deployment Issues

### 1. Build Failures

**Problem**: `npm run build` fails with errors

**Solutions**:
```bash
# Clear node modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear npm cache
npm cache clean --force

# Try building with --verbose for more details
npm run build --verbose

# Check Node.js version (requires Node 16+)
node --version
```

### 2. SSH Connection Issues

**Problem**: Cannot connect to server via SSH

**Solutions**:
```bash
# Test SSH connection
ssh -v user@server-ip

# Check SSH service on server
sudo systemctl status ssh
sudo systemctl start ssh

# Verify firewall allows SSH
sudo ufw allow OpenSSH
sudo ufw status

# Check SSH key permissions (if using key auth)
chmod 600 ~/.ssh/id_rsa
chmod 644 ~/.ssh/id_rsa.pub
```

## Server Setup Issues

### 3. Apache Installation Problems

**Problem**: Apache fails to install or start

**Solutions**:
```bash
# Check if port 80 is in use
sudo netstat -tulpn | grep :80

# Remove conflicting services
sudo systemctl stop nginx  # If nginx is installed
sudo apt remove nginx

# Reinstall Apache
sudo apt update
sudo apt remove apache2
sudo apt install apache2

# Check Apache status
sudo systemctl status apache2
sudo journalctl -u apache2 -n 20
```

### 4. Module Loading Issues

**Problem**: Apache modules fail to load

**Solutions**:
```bash
# Check available modules
apache2ctl -M

# Enable required modules manually
sudo a2enmod rewrite
sudo a2enmod ssl
sudo a2enmod headers
sudo a2enmod expires
sudo a2enmod deflate

# Check for module conflicts
sudo apache2ctl configtest

# Restart Apache after enabling modules
sudo systemctl restart apache2
```

## Deployment Issues

### 5. File Upload Failures

**Problem**: Deployment script fails to upload files

**Solutions**:
```bash
# Check disk space on server
df -h

# Verify rsync is installed
sudo apt install rsync

# Check directory permissions
ls -la /var/www/
sudo chown -R $USER:$USER /var/www/markdown-editor

# Test manual file upload
scp test.txt user@server:/var/www/markdown-editor/
```

### 6. Virtual Host Configuration Errors

**Problem**: Apache configuration test fails

**Solutions**:
```bash
# Check configuration syntax
sudo apache2ctl configtest

# View detailed error information
sudo apache2ctl -S

# Check if domain name is valid in config
sudo nano /etc/apache2/sites-available/markdown-editor.conf

# Verify sites are properly linked
sudo a2ensite markdown-editor.conf
sudo systemctl reload apache2
```

### 7. Permission Issues

**Problem**: 403 Forbidden errors

**Solutions**:
```bash
# Set correct ownership
sudo chown -R www-data:www-data /var/www/markdown-editor

# Set correct permissions
sudo chmod -R 644 /var/www/markdown-editor
sudo find /var/www/markdown-editor -type d -exec chmod 755 {} \;

# Check parent directory permissions
ls -la /var/www/

# Verify Apache can access the directory
sudo -u www-data ls -la /var/www/markdown-editor
```

## Runtime Issues

### 8. 404 Errors on Refresh

**Problem**: Page not found when refreshing or accessing direct URLs

**Solutions**:
```bash
# Ensure mod_rewrite is enabled
sudo a2enmod rewrite
sudo systemctl restart apache2

# Check .htaccess file exists and is readable
ls -la /var/www/markdown-editor/.htaccess

# Verify AllowOverride is set in virtual host
sudo grep -n "AllowOverride" /etc/apache2/sites-available/markdown-editor.conf

# Test rewrite rules manually
sudo apache2ctl -S
```

### 9. Static Assets Not Loading

**Problem**: CSS/JS files return 404 errors

**Solutions**:
```bash
# Check if files exist
ls -la /var/www/markdown-editor/assets/

# Verify MIME types are configured
sudo grep -n "AddType" /etc/apache2/sites-available/markdown-editor.conf

# Check browser network tab for actual file requests
# Look for cache-related issues

# Clear browser cache and test in incognito mode
```

### 10. SSL Certificate Issues

**Problem**: HTTPS not working or certificate errors

**Solutions**:
```bash
# Check certificate status
sudo certbot certificates

# Renew certificate if expired
sudo certbot renew

# Test SSL configuration
sudo apache2ctl configtest

# Check SSL virtual host
sudo grep -A 20 "<VirtualHost \*:443>" /etc/apache2/sites-available/markdown-editor-le-ssl.conf

# Verify certificate files exist
sudo ls -la /etc/letsencrypt/live/your-domain.com/

# Test SSL with external tool
# Visit: https://www.ssllabs.com/ssltest/
```

## Performance Issues

### 11. Slow Loading Times

**Problem**: Application loads slowly

**Solutions**:
```bash
# Enable compression
sudo a2enmod deflate
sudo systemctl restart apache2

# Check if compression is working
curl -H "Accept-Encoding: gzip" -I http://your-domain.com

# Enable caching modules
sudo a2enmod expires
sudo a2enmod headers

# Monitor server resources
htop
iotop
free -h
df -h

# Check Apache access logs for large files
sudo tail -f /var/log/apache2/markdown-editor-access.log
```

### 12. High Memory Usage

**Problem**: Server running out of memory

**Solutions**:
```bash
# Check memory usage
free -h
ps aux --sort=-%mem | head

# Optimize Apache configuration
sudo nano /etc/apache2/apache2.conf

# Adjust these values:
# MaxRequestWorkers 150
# KeepAlive On
# KeepAliveTimeout 5
# MaxKeepAliveRequests 100

# Restart Apache
sudo systemctl restart apache2

# Add swap if needed
sudo fallocate -l 1G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
```

## Security Issues

### 13. Unauthorized Access Attempts

**Problem**: Suspicious entries in access logs

**Solutions**:
```bash
# Check access logs
sudo tail -f /var/log/apache2/markdown-editor-access.log

# Install and configure fail2ban
sudo apt install fail2ban
sudo systemctl enable fail2ban
sudo systemctl start fail2ban

# Check fail2ban status
sudo fail2ban-client status

# Block specific IPs manually
sudo ufw deny from suspicious-ip-address

# Review firewall rules
sudo ufw status numbered
```

### 14. Security Headers Not Working

**Problem**: Security headers not appearing in responses

**Solutions**:
```bash
# Ensure headers module is enabled
sudo a2enmod headers
sudo systemctl restart apache2

# Test headers
curl -I http://your-domain.com

# Check virtual host configuration
sudo grep -n "Header" /etc/apache2/sites-available/markdown-editor.conf

# Verify configuration is active
sudo apache2ctl -S
```

## Monitoring and Logs

### 15. Log Analysis

**Useful commands for log monitoring**:

```bash
# Real-time access logs
sudo tail -f /var/log/apache2/markdown-editor-access.log

# Real-time error logs
sudo tail -f /var/log/apache2/markdown-editor-error.log

# Search for specific errors
sudo grep "404" /var/log/apache2/markdown-editor-access.log
sudo grep "error" /var/log/apache2/markdown-editor-error.log

# Analyze most requested files
sudo awk '{print $7}' /var/log/apache2/markdown-editor-access.log | sort | uniq -c | sort -nr | head -10

# Check for bot traffic
sudo grep -i bot /var/log/apache2/markdown-editor-access.log

# Monitor Apache status
sudo systemctl status apache2
sudo journalctl -u apache2 -f
```

### 16. Health Check Script

Create a simple health check script:

```bash
#!/bin/bash
# health-check.sh

URL="http://your-domain.com"
EXPECTED_STATUS="200"

STATUS=$(curl -s -o /dev/null -w '%{http_code}' $URL)

if [ "$STATUS" = "$EXPECTED_STATUS" ]; then
    echo "✓ Site is responding correctly (HTTP $STATUS)"
    exit 0
else
    echo "✗ Site issue detected (HTTP $STATUS)"
    
    # Check Apache status
    if ! systemctl is-active --quiet apache2; then
        echo "✗ Apache is not running"
        sudo systemctl start apache2
    fi
    
    # Check disk space
    DISK_USAGE=$(df / | awk 'NR==2{print $5}' | sed 's/%//')
    if [ "$DISK_USAGE" -gt 90 ]; then
        echo "✗ Disk usage is high: ${DISK_USAGE}%"
    fi
    
    exit 1
fi
```

## Emergency Recovery

### 17. Site Completely Down

**Emergency recovery steps**:

```bash
# 1. Check if Apache is running
sudo systemctl status apache2
sudo systemctl start apache2

# 2. Check disk space
df -h

# 3. Check for configuration errors
sudo apache2ctl configtest

# 4. Restore from backup
sudo cp -r /var/www/markdown-editor-backup-* /var/www/markdown-editor/

# 5. Reset permissions
sudo chown -R www-data:www-data /var/www/markdown-editor
sudo chmod -R 644 /var/www/markdown-editor
sudo find /var/www/markdown-editor -type d -exec chmod 755 {} \;

# 6. Restart Apache
sudo systemctl restart apache2
```

### 18. Get Help

**Where to find additional help**:

- Apache Documentation: https://httpd.apache.org/docs/2.4/
- Ubuntu Server Guide: https://ubuntu.com/server/docs
- Let's Encrypt Documentation: https://letsencrypt.org/docs/
- Stack Overflow: https://stackoverflow.com/questions/tagged/apache2

**Collecting information for support**:

```bash
# System information
lsb_release -a
apache2 -v
uname -a

# Configuration files
sudo apache2ctl -S
sudo apache2ctl -M

# Log excerpts (last 20 lines)
sudo tail -20 /var/log/apache2/error.log
sudo tail -20 /var/log/apache2/markdown-editor-error.log

# Test results
sudo apache2ctl configtest
curl -I http://your-domain.com
```

Remember to always backup your configuration and data before making significant changes!