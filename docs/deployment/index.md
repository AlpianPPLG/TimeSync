# Deployment Guide

This guide provides instructions for deploying the Attendance Management System to various environments.

## Prerequisites

- Node.js 18+ and npm/yarn
- MySQL 8.0+ database
- Git
- PM2 or similar process manager (for production)
- Domain name with SSL certificate (recommended for production)

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Application
NODE_ENV=production
PORT=3000

# Database
DATABASE_URL="mysql://user:password@localhost:3306/attendance_system?schema=public"

# Authentication
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=https://your-domain.com

# Email (SMTP)
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your-email@example.com
SMTP_PASSWORD=your-email-password
SMTP_FROM=no-reply@your-domain.com

# Optional: Google OAuth
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# Optional: GitHub OAuth
GITHUB_ID=
GITHUB_SECRET=
```

## Production Deployment

### 1. Build the Application

```bash
# Install dependencies
npm install --production

# Build the application
npm run build

# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate deploy
```

### 2. Start the Application

#### Using PM2 (Recommended)

1. Install PM2 globally:
   ```bash
   npm install -g pm2
   ```

2. Start the application:
   ```bash
   pm2 start npm --name "attendance-system" -- start
   ```

3. Save the PM2 process list:
   ```bash
   pm2 save
   pm2 startup
   ```

#### Using Systemd

Create a systemd service file at `/etc/systemd/system/attendance-system.service`:

```ini
[Unit]
Description=Attendance Management System
After=network.target

[Service]
Type=simple
User=node
WorkingDirectory=/path/to/attendance-system
Environment=NODE_ENV=production
ExecStart=/usr/bin/npm start
Restart=always

[Install]
WantedBy=multi-user.target
```

Then enable and start the service:

```bash
sudo systemctl daemon-reload
sudo systemctl enable attendance-system
sudo systemctl start attendance-system
```

## Database Setup

### MySQL Configuration

1. Create a new database:
   ```sql
   CREATE DATABASE attendance_system CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   CREATE USER 'attendance_user'@'localhost' IDENTIFIED BY 'secure_password';
   GRANT ALL PRIVILEGES ON attendance_system.* TO 'attendance_user'@'localhost';
   FLUSH PRIVILEGES;
   ```

2. Run migrations:
   ```bash
   npx prisma migrate deploy
   ```

## Web Server Configuration (Nginx)

### Nginx Configuration

Create a new server block at `/etc/nginx/sites-available/attendance-system`:

```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com www.your-domain.com;

    ssl_certificate /path/to/ssl/cert.pem;
    ssl_certificate_key /path/to/ssl/key.pem;

    # SSL configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers on;
    ssl_ciphers 'ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384';

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;

    # Proxy to Node.js
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Static files
    location /_next/static/ {
        alias /path/to/attendance-system/.next/static/;
        expires 365d;
        access_log off;
    }

    # Disable logging for favicon.ico
    location = /favicon.ico {
        access_log off;
        log_not_found off;
    }

    # Disable logging for robots.txt
    location = /robots.txt {
        access_log off;
        log_not_found off;
    }
}
```

Enable the site and reload Nginx:

```bash
sudo ln -s /etc/nginx/sites-available/attendance-system /etc/nginx/sites-enabled/
sudo nginx -t  # Test configuration
sudo systemctl reload nginx
```

## Docker Deployment

### Using Docker Compose

Create a `docker-compose.yml` file:

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=mysql://user:password@db:3306/attendance_system
      - NEXTAUTH_SECRET=your-secret-key
      - NEXTAUTH_URL=http://localhost:3000
    depends_on:
      - db
    restart: unless-stopped
    networks:
      - app-network

  db:
    image: mysql:8.0
    command: --default-authentication-plugin=mysql_native_password
    restart: always
    environment:
      MYSQL_ROOT_PASSWORD: rootpassword
      MYSQL_DATABASE: attendance_system
      MYSQL_USER: user
      MYSQL_PASSWORD: password
    volumes:
      - db_data:/var/lib/mysql
    networks:
      - app-network

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./certs:/etc/nginx/certs:ro
    depends_on:
      - app
    networks:
      - app-network

networks:
  app-network:
    driver: bridge

volumes:
  db_data:
```

### Building and Running

```bash
# Build and start the containers
docker-compose up -d --build

# Run database migrations
docker-compose exec app npx prisma migrate deploy

# View logs
docker-compose logs -f
```

## Continuous Deployment

### GitHub Actions

Create a workflow file at `.github/workflows/deploy.yml`:

```yaml
name: Deploy

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Set up Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18.x'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Build
        run: npm run build
        
      - name: Deploy to production
        uses: appleboy/ssh-action@v1.0.0
        with:
          host: ${{ secrets.SSH_HOST }}
          username: ${{ secrets.SSH_USERNAME }}
          key: ${{ secrets.SSH_PRIVATE_KEY }}
          script: |
            cd /path/to/attendance-system
            git pull origin main
            npm ci --production
            npm run build
            npx prisma migrate deploy
            pm2 restart attendance-system
```

## Monitoring and Maintenance

### Logs

- Application logs: `pm2 logs attendance-system`
- Error logs: `journalctl -u attendance-system -f`
- Nginx access logs: `tail -f /var/log/nginx/access.log`
- Nginx error logs: `tail -f /var/log/nginx/error.log`

### Backups

Set up regular database backups:

```bash
# Create backup script
cat > /usr/local/bin/backup-db.sh << 'EOL'
#!/bin/bash
DATE=$(date +%Y%m%d%H%M%S)
BACKUP_DIR="/var/backups/attendance-system"
mkdir -p $BACKUP_DIR
mysqldump -u user -p'password' attendance_system | gzip > "$BACKUP_DIR/attendance-db-$DATE.sql.gz"
find "$BACKUP_DIR" -type f -mtime +30 -delete
EOL

# Make it executable
chmod +x /usr/local/bin/backup-db.sh

# Add to crontab (run daily at 2 AM)
(crontab -l 2>/dev/null; echo "0 2 * * * /usr/local/bin/backup-db.sh") | crontab -
```

### Updates

To update the application:

```bash
# Pull the latest changes
git pull origin main

# Install dependencies
npm ci

# Build the application
npm run build

# Run database migrations
npx prisma migrate deploy

# Restart the application
pm2 restart attendance-system
```

## Scaling

### Horizontal Scaling

For high-traffic deployments, consider:

1. **Load Balancing**: Use multiple application instances behind a load balancer
2. **Database Replication**: Set up read replicas for the database
3. **Caching**: Implement Redis for session storage and caching
4. **CDN**: Use a CDN for static assets

### Vertical Scaling

- **Database**: Upgrade MySQL server with more CPU/RAM
- **Application**: Increase Node.js memory limit with `NODE_OPTIONS=--max-old-space-size=4096`
- **Web Server**: Increase Nginx worker processes and connections

## Troubleshooting

### Common Issues

- **Database Connection Issues**: Check database credentials and network connectivity
- **Memory Leaks**: Monitor memory usage with `pm2 monit` or `htop`
- **Performance Bottlenecks**: Use `EXPLAIN` for slow SQL queries
- **CORS Errors**: Verify Nginx proxy headers and Next.js CORS configuration

### Getting Help

For support, please open an issue on our [GitHub repository](https://github.com/your-username/attendance-system/issues).
