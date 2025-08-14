# Ubuntu Server with Apache 2.4 Deployment Guide

This guide provides step-by-step instructions for deploying the Markdown Editor application to a remote Ubuntu Server with Apache 2.4.

## Prerequisites

- Ubuntu Server 20.04 LTS or later
- Domain name pointing to your server (optional but recommended)
- SSH access to the server
- Sudo privileges on the server

## Server Setup

### 1. Update System Packages

```bash
sudo apt update && sudo apt upgrade -y
```

### 2. Install Apache 2.4

```bash
sudo apt install apache2 -y
sudo systemctl start apache2
sudo systemctl enable apache2
```

### 3. Install Required Modules

```bash
sudo a2enmod rewrite
sudo a2enmod ssl
sudo a2enmod headers
sudo systemctl restart apache2
```

### 4. Configure Firewall

```bash
sudo ufw allow 'Apache Full'
sudo ufw allow OpenSSH
sudo ufw --force enable
```

## Application Deployment

### 1. Create Application Directory

```bash
sudo mkdir -p /var/www/markdown-editor
sudo chown -R $USER:$USER /var/www/markdown-editor
sudo chmod -R 755 /var/www/markdown-editor
```

### 2. Upload Application Files

From your local machine, upload the built application:

```bash
npm install
npm run build
scp -r dist/* user@your-server-ip:/var/www/markdown-editor/
```

Or use the deployment script provided in this directory.

### 3. Set Proper Permissions

```bash
sudo chown -R www-data:www-data /var/www/markdown-editor
sudo chmod -R 644 /var/www/markdown-editor
sudo find /var/www/markdown-editor -type d -exec chmod 755 {} \;
```

## Apache Configuration

### 1. Create Virtual Host Configuration

Copy the provided virtual host configuration:

```bash
sudo cp apache-vhost.conf /etc/apache2/sites-available/markdown-editor.conf
```

### 2. Edit Configuration

Edit the configuration file to match your domain:

```bash
sudo nano /etc/apache2/sites-available/markdown-editor.conf
```

Replace `your-domain.com` with your actual domain name.

### 3. Enable Site

```bash
sudo a2ensite markdown-editor.conf
sudo a2dissite 000-default.conf
sudo systemctl reload apache2
```

### 4. Test Configuration

```bash
sudo apache2ctl configtest
```

Should return "Syntax OK".

## SSL Certificate Setup (Let's Encrypt)

### 1. Install Certbot

```bash
sudo apt install certbot python3-certbot-apache -y
```

### 2. Obtain SSL Certificate

```bash
sudo certbot --apache -d your-domain.com -d www.your-domain.com
```

Follow the prompts to complete the SSL setup.

### 3. Auto-renewal Setup

```bash
sudo systemctl status certbot.timer
```

The auto-renewal should already be configured. Test it with:

```bash
sudo certbot renew --dry-run
```

## Security Hardening

### 1. Hide Apache Version

Add to `/etc/apache2/conf-available/security.conf`:

```apache
ServerTokens Prod
ServerSignature Off
```

Enable the configuration:

```bash
sudo a2enconf security
sudo systemctl restart apache2
```

### 2. Add Security Headers

The provided virtual host configuration already includes security headers:

- X-Content-Type-Options
- X-Frame-Options
- X-XSS-Protection
- Referrer-Policy
- Content-Security-Policy

## Deployment Script Usage

Use the provided deployment script for easy deployment:

```bash
# Make script executable
chmod +x deploy.sh

# Run deployment (replace with your server details)
./deploy.sh user@your-server-ip your-domain.com
```

## Monitoring and Logs

### Check Apache Status

```bash
sudo systemctl status apache2
```

### View Access Logs

```bash
sudo tail -f /var/log/apache2/access.log
```

### View Error Logs

```bash
sudo tail -f /var/log/apache2/error.log
```

### View Application-Specific Logs

```bash
sudo tail -f /var/log/apache2/markdown-editor-access.log
sudo tail -f /var/log/apache2/markdown-editor-error.log
```

## Backup and Updates

### Application Updates

1. Build new version locally: `npm run build`
2. Upload to staging directory: `/var/www/markdown-editor-staging/`
3. Test the staging version
4. Switch to production: `mv /var/www/markdown-editor /var/www/markdown-editor-backup && mv /var/www/markdown-editor-staging /var/www/markdown-editor`
5. Restart Apache: `sudo systemctl restart apache2`

### Regular Backups

```bash
# Backup application files
sudo tar -czf /backup/markdown-editor-$(date +%Y%m%d).tar.gz /var/www/markdown-editor/

# Backup Apache configuration
sudo tar -czf /backup/apache-config-$(date +%Y%m%d).tar.gz /etc/apache2/sites-available/markdown-editor.conf
```

## Troubleshooting

### Common Issues

1. **403 Forbidden Error**
   - Check file permissions: `ls -la /var/www/markdown-editor/`
   - Ensure Apache can read files: `sudo chown -R www-data:www-data /var/www/markdown-editor`

2. **500 Internal Server Error**
   - Check Apache error logs: `sudo tail -f /var/log/apache2/error.log`
   - Verify .htaccess file syntax

3. **SSL Certificate Issues**
   - Check certificate status: `sudo certbot certificates`
   - Renew if necessary: `sudo certbot renew`

4. **Application Not Loading**
   - Verify virtual host is enabled: `sudo a2ensite markdown-editor.conf`
   - Check firewall settings: `sudo ufw status`

### Performance Optimization

For high-traffic sites, consider:

1. **Enable Compression**

   ```bash
   sudo a2enmod deflate
   sudo systemctl restart apache2
   ```

2. **Enable Caching**

   ```bash
   sudo a2enmod expires
   sudo a2enmod headers
   sudo systemctl restart apache2
   ```

3. **Optimize Apache Configuration**
   - Edit `/etc/apache2/apache2.conf`
   - Adjust `MaxRequestWorkers`, `KeepAlive` settings

## Support

For additional help:

- Check Apache documentation: https://httpd.apache.org/docs/2.4/
- Ubuntu Server documentation: https://ubuntu.com/server/docs
- Let's Encrypt documentation: https://letsencrypt.org/docs/

## Directory Structure

```
/var/www/markdown-editor/
├── index.html
├── assets/
│   ├── index-[hash].css
│   └── index-[hash].js
└── vite.svg (favicon)
```
