# Markdown Editor - Production Dockerfile
# Optimized for pre-built applications

# Production stage only (assuming dist/ is already built)
FROM nginx:1.25-alpine AS production

# Install security updates and useful tools
RUN apk update && \
    apk upgrade && \
    apk add --no-cache \
    curl \
    ca-certificates && \
    rm -rf /var/cache/apk/*

# Create non-root user for security
RUN addgroup -g 1001 -S appgroup && \
    adduser -S appuser -u 1001 -G appgroup

# Copy pre-built application
COPY dist/ /usr/share/nginx/html/

# Copy custom nginx configuration
COPY deployment/docker/nginx.conf /etc/nginx/nginx.conf
COPY deployment/docker/default.conf /etc/nginx/conf.d/default.conf

# Set proper permissions
RUN chown -R appuser:appgroup /usr/share/nginx/html && \
    chown -R appuser:appgroup /var/cache/nginx && \
    chown -R appuser:appgroup /var/log/nginx && \
    chown -R appuser:appgroup /etc/nginx/conf.d && \
    touch /var/run/nginx.pid && \
    chown -R appuser:appgroup /var/run/nginx.pid

# Create directories for nginx to write to
RUN mkdir -p /var/cache/nginx/client_temp \
             /var/cache/nginx/proxy_temp \
             /var/cache/nginx/fastcgi_temp \
             /var/cache/nginx/uwsgi_temp \
             /var/cache/nginx/scgi_temp && \
    chown -R appuser:appgroup /var/cache/nginx

# Switch to non-root user
USER appuser

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8080/health || exit 1

# Expose port
EXPOSE 8080

# Start nginx
CMD ["nginx", "-g", "daemon off;"]

# Metadata
LABEL maintainer="Markdown Editor Team" \
      version="1.0.0" \
      description="Markdown Editor - Production Docker Image" \
      org.opencontainers.image.title="Markdown Editor" \
      org.opencontainers.image.description="Professional markdown editor with dual-pane editing" \
      org.opencontainers.image.version="1.0.0" \
      org.opencontainers.image.created="2025-01-13" \
      org.opencontainers.image.source="https://github.com/your-org/markdown-editor" \
      org.opencontainers.image.licenses="MIT"