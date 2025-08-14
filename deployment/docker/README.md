# Docker Deployment Guide

This guide covers deploying the Markdown Editor using Docker containers for development, testing, and production environments.

## Quick Start

### Development
```bash
# Start development environment
docker-compose --profile development up markdown-editor-dev

# Access at http://localhost:5173
```

### Production
```bash
# Build and start production container
docker-compose up -d markdown-editor

# Access at http://localhost:8080
```

## Docker Images

### Production Image
- **Base**: nginx:1.25-alpine
- **Size**: ~50MB (optimized)
- **Security**: Non-root user, read-only filesystem
- **Features**: Gzip compression, security headers, health checks

### Development Image
- **Base**: node:18-alpine
- **Purpose**: Hot-reload development
- **Features**: Volume mounting, Vite dev server

## Available Configurations

### Basic Setup
```bash
# Build production image
docker build -t markdown-editor:latest .

# Run single container
docker run -d -p 8080:8080 --name markdown-editor markdown-editor:latest
```

### Development Environment
```bash
# Start development with hot reload
docker-compose --profile development up

# Or build and run manually
docker build --target builder -t markdown-editor:dev .
docker run -p 5173:5173 -v $(pwd):/app markdown-editor:dev npm run dev
```

### Production with SSL (Traefik)
```bash
# Create external network
docker network create traefik-network

# Start production stack with SSL
docker-compose -f docker-compose.yml -f deployment/docker/docker-compose.prod.yml up -d

# Configure your domain in docker-compose.prod.yml first
```

### With Monitoring
```bash
# Start with Prometheus and Grafana
docker-compose --profile monitoring up -d
```

### With Auto-Updates
```bash
# Start with Watchtower for automatic updates
docker-compose --profile watchtower up -d
```

## Environment Variables

### Production Container
| Variable | Default | Description |
|----------|---------|-------------|
| `NODE_ENV` | production | Environment mode |
| `TZ` | UTC | Timezone |

### Development Container
| Variable | Default | Description |
|----------|---------|-------------|
| `NODE_ENV` | development | Environment mode |
| `VITE_HOST` | 0.0.0.0 | Vite dev server host |
| `VITE_PORT` | 5173 | Vite dev server port |

## Docker Compose Profiles

### Available Profiles
- `development` - Hot-reload development environment
- `proxy` - Nginx reverse proxy
- `watchtower` - Automatic container updates
- `monitoring` - Prometheus + Grafana
- `logging` - Centralized logging with Fluentd

### Using Profiles
```bash
# Single profile
docker-compose --profile development up

# Multiple profiles
docker-compose --profile monitoring --profile logging up

# All profiles
docker-compose --profile development --profile monitoring --profile watchtower up
```

## Security Features

### Container Security
- Non-root user execution
- Read-only root filesystem
- Restricted capabilities
- No new privileges
- Temporary filesystems for writable areas

### Network Security
- Custom bridge networks
- Service isolation
- Security headers (CSP, HSTS, etc.)
- Rate limiting

### Image Security
- Alpine Linux base (minimal attack surface)
- Regular security updates
- No sensitive data in images
- Multi-stage builds

## Resource Management

### Default Limits
```yaml
deploy:
  resources:
    limits:
      cpus: '0.5'
      memory: 256M
    reservations:
      cpus: '0.1'
      memory: 64M
```

### Scaling
```bash
# Scale to multiple replicas
docker-compose up -d --scale markdown-editor=3

# Using Docker Swarm
docker stack deploy -c docker-compose.yml markdown-editor-stack
```

## Persistent Data

### Volumes
- `markdown-editor-logs` - Nginx access/error logs
- `traefik-acme` - SSL certificates
- `prometheus-data` - Metrics data
- `grafana-data` - Dashboard configurations

### Backup
```bash
# Backup volumes
docker run --rm -v markdown-editor-logs:/data -v $(pwd):/backup alpine tar czf /backup/logs-backup.tar.gz /data

# Restore volumes
docker run --rm -v markdown-editor-logs:/data -v $(pwd):/backup alpine tar xzf /backup/logs-backup.tar.gz -C /
```

## Health Checks

### Application Health
- **Endpoint**: `http://localhost:8080/health`
- **Interval**: 30 seconds
- **Timeout**: 10 seconds
- **Retries**: 3

### Manual Health Check
```bash
# Check container health
docker inspect --format='{{.State.Health.Status}}' markdown-editor-app

# Check all services
docker-compose ps
```

## Monitoring and Logs

### Container Logs
```bash
# View logs
docker-compose logs -f markdown-editor

# View specific service logs
docker logs -f markdown-editor-app

# Export logs
docker logs markdown-editor-app > app.log 2>&1
```

### Metrics (with monitoring profile)
- **Prometheus**: http://localhost:9090
- **Grafana**: http://localhost:3000
- **Traefik Dashboard**: http://localhost:8090

## Troubleshooting

### Common Issues

#### Container Won't Start
```bash
# Check container status
docker ps -a

# View container logs
docker logs markdown-editor-app

# Check image exists
docker images | grep markdown-editor
```

#### Port Already in Use
```bash
# Find process using port
sudo netstat -tulpn | grep :8080

# Use different port
docker run -p 8081:8080 markdown-editor:latest
```

#### Permission Issues
```bash
# Check container user
docker exec markdown-editor-app id

# Fix volume permissions
sudo chown -R 1001:1001 ./volumes/
```

#### Health Check Failing
```bash
# Test health endpoint manually
curl http://localhost:8080/health

# Check nginx configuration
docker exec markdown-editor-app nginx -t
```

### Debug Mode

#### Access Container Shell
```bash
# Development container
docker exec -it markdown-editor-dev sh

# Production container (temporary shell access)
docker run -it --entrypoint sh markdown-editor:latest
```

#### Override Container Settings
```bash
# Run with custom entrypoint
docker run -it --entrypoint sh -v $(pwd):/app markdown-editor:latest

# Run with host networking (debug only)
docker run --network host markdown-editor:latest
```

## Performance Optimization

### Image Size Optimization
- Multi-stage builds reduce final image size
- Alpine Linux base (~5MB vs ~100MB+ for Ubuntu)
- Only production dependencies included

### Runtime Optimization
- Nginx gzip compression
- Static asset caching
- HTTP/2 support (with SSL)
- Rate limiting

### Resource Monitoring
```bash
# Container resource usage
docker stats markdown-editor-app

# Detailed system info
docker exec markdown-editor-app cat /proc/meminfo
docker exec markdown-editor-app df -h
```

## Production Deployment

### Prerequisites
1. Docker and Docker Compose installed
2. Domain name configured (for SSL)
3. Firewall ports 80 and 443 open

### Steps
1. Clone repository
2. Configure domain in `docker-compose.prod.yml`
3. Set secure passwords in environment files
4. Deploy with SSL:
   ```bash
   docker network create traefik-network
   docker-compose -f docker-compose.yml -f deployment/docker/docker-compose.prod.yml up -d
   ```

### SSL Configuration
- Automatic with Traefik and Let's Encrypt
- Certificates stored in Docker volume
- Auto-renewal configured

### Backup Strategy
```bash
#!/bin/bash
# backup.sh
DATE=$(date +%Y%m%d_%H%M%S)
docker run --rm \
  -v markdown-editor-logs:/logs \
  -v traefik-acme:/acme \
  -v $(pwd)/backups:/backup \
  alpine tar czf /backup/markdown-editor-$DATE.tar.gz /logs /acme
```

## Updates and Maintenance

### Manual Updates
```bash
# Pull latest images
docker-compose pull

# Recreate containers with new images
docker-compose up -d --force-recreate

# Clean up old images
docker image prune -f
```

### Automatic Updates (Watchtower)
```bash
# Enable automatic updates
docker-compose --profile watchtower up -d

# Configure update schedule in docker-compose.yml
```

### Maintenance Commands
```bash
# System cleanup
docker system prune -f

# Remove unused volumes
docker volume prune -f

# Update all images
docker images --format "table {{.Repository}}\t{{.Tag}}" | grep -v "REPOSITORY" | awk '{print $1":"$2}' | xargs -L1 docker pull
```