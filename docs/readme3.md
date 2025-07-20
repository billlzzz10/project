# คู่มือการ Deploy AI Business App

## 🚀 การ Deploy แบบ Production

### 1. เตรียม Server

#### ข้อกำหนดระบบ
- Ubuntu 20.04+ หรือ CentOS 8+
- Python 3.11+
- Node.js 20+
- Nginx
- PostgreSQL (แนะนำ)
- SSL Certificate

#### ติดตั้ง Dependencies
```bash
# อัปเดตระบบ
sudo apt update && sudo apt upgrade -y

# ติดตั้ง Python และ tools
sudo apt install python3.11 python3.11-venv python3-pip -y

# ติดตั้ง Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install nodejs -y

# ติดตั้ง Nginx
sudo apt install nginx -y

# ติดตั้ง PostgreSQL
sudo apt install postgresql postgresql-contrib -y
```

### 2. ตั้งค่า Database

#### PostgreSQL Setup
```bash
# เข้าสู่ PostgreSQL
sudo -u postgres psql

# สร้าง database และ user
CREATE DATABASE ai_business_app;
CREATE USER app_user WITH PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE ai_business_app TO app_user;
\q
```

#### Database Configuration
```env
# ใน .env file
DATABASE_URL=postgresql://app_user:secure_password@localhost/ai_business_app
```

### 3. Deploy Backend

#### สร้าง Directory Structure
```bash
sudo mkdir -p /var/www/ai-business-app
sudo chown $USER:$USER /var/www/ai-business-app
cd /var/www/ai-business-app
```

#### Clone และ Setup
```bash
# Clone หรือ copy ไฟล์ backend
cp -r /path/to/ai-business-app-backend ./backend
cd backend

# สร้าง virtual environment
python3.11 -m venv venv
source venv/bin/activate

# ติดตั้ง dependencies
pip install -r requirements.txt
pip install gunicorn psycopg2-binary
```

#### Production Environment File
```bash
# สร้างไฟล์ .env สำหรับ production
cat > .env << EOF
# Database
DATABASE_URL=postgresql://app_user:secure_password@localhost/ai_business_app

# AI API Keys
GOOGLE_API_KEY=your_production_google_api_key
HUGGINGFACE_API_KEY=your_production_huggingface_api_key

# External Integrations
N8N_WEBHOOK_URL=https://your-n8n-instance.com/webhook/your-webhook-id
NOTION_API_KEY=your_production_notion_api_key
AIRTABLE_API_KEY=your_production_airtable_api_key

# Security
SECRET_KEY=your_very_secure_secret_key_here

# Production Settings
FLASK_ENV=production
DEBUG=False
EOF
```

#### สร้าง Systemd Service
```bash
sudo tee /etc/systemd/system/ai-business-app.service << EOF
[Unit]
Description=AI Business App Backend
After=network.target

[Service]
User=$USER
Group=www-data
WorkingDirectory=/var/www/ai-business-app/backend
Environment=PATH=/var/www/ai-business-app/backend/venv/bin
ExecStart=/var/www/ai-business-app/backend/venv/bin/gunicorn --workers 4 --bind 127.0.0.1:5000 src.main:app
Restart=always

[Install]
WantedBy=multi-user.target
EOF

# เริ่มต้น service
sudo systemctl daemon-reload
sudo systemctl enable ai-business-app
sudo systemctl start ai-business-app
sudo systemctl status ai-business-app
```

### 4. Deploy Frontend

#### Build Frontend
```bash
cd /var/www/ai-business-app
cp -r /path/to/ai-business-app-frontend ./frontend
cd frontend

# ติดตั้ง dependencies
npm install

# Build สำหรับ production
npm run build

# Copy built files
sudo mkdir -p /var/www/html/ai-business-app
sudo cp -r dist/* /var/www/html/ai-business-app/
sudo chown -R www-data:www-data /var/www/html/ai-business-app
```

### 5. ตั้งค่า Nginx

#### สร้าง Nginx Configuration
```bash
sudo tee /etc/nginx/sites-available/ai-business-app << EOF
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;
    
    # Redirect HTTP to HTTPS
    return 301 https://\$server_name\$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com www.your-domain.com;
    
    # SSL Configuration
    ssl_certificate /path/to/your/certificate.crt;
    ssl_certificate_key /path/to/your/private.key;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    
    # Frontend
    location / {
        root /var/www/html/ai-business-app;
        index index.html;
        try_files \$uri \$uri/ /index.html;
    }
    
    # Backend API
    location /api/ {
        proxy_pass http://127.0.0.1:5000;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;
    }
    
    # Security Headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
}
EOF

# เปิดใช้งาน site
sudo ln -s /etc/nginx/sites-available/ai-business-app /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 6. SSL Certificate (Let's Encrypt)

```bash
# ติดตั้ง Certbot
sudo apt install certbot python3-certbot-nginx -y

# สร้าง SSL certificate
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# ตั้งค่า auto-renewal
sudo crontab -e
# เพิ่มบรรทัดนี้:
0 12 * * * /usr/bin/certbot renew --quiet
```

### 7. ตั้งค่า Firewall

```bash
# เปิด ports ที่จำเป็น
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
sudo ufw enable
```

### 8. Monitoring และ Logging

#### ตั้งค่า Log Rotation
```bash
sudo tee /etc/logrotate.d/ai-business-app << EOF
/var/log/ai-business-app/*.log {
    daily
    missingok
    rotate 52
    compress
    delaycompress
    notifempty
    create 644 $USER www-data
    postrotate
        systemctl reload ai-business-app
    endscript
}
EOF
```

#### Monitoring Script
```bash
# สร้าง monitoring script
cat > /var/www/ai-business-app/monitor.sh << EOF
#!/bin/bash

# ตรวจสอบ backend service
if ! systemctl is-active --quiet ai-business-app; then
    echo "Backend service is down, restarting..."
    sudo systemctl restart ai-business-app
fi

# ตรวจสอบ nginx
if ! systemctl is-active --quiet nginx; then
    echo "Nginx is down, restarting..."
    sudo systemctl restart nginx
fi

# ตรวจสอบ disk space
DISK_USAGE=\$(df / | grep -vE '^Filesystem|tmpfs|cdrom' | awk '{ print \$5 }' | sed 's/%//g')
if [ \$DISK_USAGE -gt 80 ]; then
    echo "Disk usage is above 80%: \${DISK_USAGE}%"
fi
EOF

chmod +x /var/www/ai-business-app/monitor.sh

# เพิ่มใน crontab
(crontab -l 2>/dev/null; echo "*/5 * * * * /var/www/ai-business-app/monitor.sh") | crontab -
```

## 🔧 การ Deploy ด้วย Docker

### 1. Backend Dockerfile
```dockerfile
# ai-business-app-backend/Dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY src/ ./src/
COPY .env .

EXPOSE 5000

CMD ["gunicorn", "--workers", "4", "--bind", "0.0.0.0:5000", "src.main:app"]
```

### 2. Frontend Dockerfile
```dockerfile
# ai-business-app-frontend/Dockerfile
FROM node:20-alpine as build

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80
```

### 3. Docker Compose
```yaml
# docker-compose.yml
version: '3.8'

services:
  backend:
    build: ./ai-business-app-backend
    ports:
      - "5000:5000"
    environment:
      - DATABASE_URL=postgresql://postgres:password@db:5432/ai_business_app
    depends_on:
      - db
    volumes:
      - ./ai-business-app-backend/.env:/app/.env

  frontend:
    build: ./ai-business-app-frontend
    ports:
      - "80:80"
    depends_on:
      - backend

  db:
    image: postgres:15
    environment:
      - POSTGRES_DB=ai_business_app
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=password
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

### 4. Deploy ด้วย Docker
```bash
# Build และ run
docker-compose up -d

# ตรวจสอบสถานะ
docker-compose ps

# ดู logs
docker-compose logs -f
```

## 🔄 การอัปเดตและ Maintenance

### การอัปเดต Application
```bash
# Backup database
sudo -u postgres pg_dump ai_business_app > backup_$(date +%Y%m%d).sql

# อัปเดต backend
cd /var/www/ai-business-app/backend
git pull origin main  # หรือ copy ไฟล์ใหม่
source venv/bin/activate
pip install -r requirements.txt

# Restart service
sudo systemctl restart ai-business-app

# อัปเดต frontend
cd /var/www/ai-business-app/frontend
npm install
npm run build
sudo cp -r dist/* /var/www/html/ai-business-app/
```

### Database Migration
```bash
# หากมีการเปลี่ยนแปลง database schema
cd /var/www/ai-business-app/backend
source venv/bin/activate
python -c "from src.main import app, db; app.app_context().push(); db.create_all()"
```

### การสำรองข้อมูล
```bash
# สร้าง backup script
cat > /var/www/ai-business-app/backup.sh << EOF
#!/bin/bash
BACKUP_DIR="/var/backups/ai-business-app"
DATE=\$(date +%Y%m%d_%H%M%S)

mkdir -p \$BACKUP_DIR

# Database backup
sudo -u postgres pg_dump ai_business_app > \$BACKUP_DIR/db_backup_\$DATE.sql

# Application backup
tar -czf \$BACKUP_DIR/app_backup_\$DATE.tar.gz /var/www/ai-business-app

# ลบ backup เก่า (เก็บไว้ 30 วัน)
find \$BACKUP_DIR -name "*.sql" -mtime +30 -delete
find \$BACKUP_DIR -name "*.tar.gz" -mtime +30 -delete
EOF

chmod +x /var/www/ai-business-app/backup.sh

# เพิ่มใน crontab (backup ทุกวันเวลา 2:00)
(crontab -l 2>/dev/null; echo "0 2 * * * /var/www/ai-business-app/backup.sh") | crontab -
```

## 🔍 การแก้ไขปัญหา Production

### ตรวจสอบ Logs
```bash
# Backend logs
sudo journalctl -u ai-business-app -f

# Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# System logs
sudo tail -f /var/log/syslog
```

### Performance Monitoring
```bash
# ตรวจสอบ resource usage
htop
iotop
netstat -tulpn

# ตรวจสอบ database performance
sudo -u postgres psql ai_business_app -c "SELECT * FROM pg_stat_activity;"
```

### การแก้ไขปัญหาที่พบบ่อย

**Service ไม่เริ่มต้น**
```bash
sudo systemctl status ai-business-app
sudo journalctl -u ai-business-app --no-pager
```

**Database Connection Issues**
```bash
# ตรวจสอบ PostgreSQL
sudo systemctl status postgresql
sudo -u postgres psql -c "SELECT version();"
```

**High Memory Usage**
```bash
# ลด workers ใน gunicorn
sudo systemctl edit ai-business-app
# เพิ่ม:
[Service]
ExecStart=
ExecStart=/var/www/ai-business-app/backend/venv/bin/gunicorn --workers 2 --bind 127.0.0.1:5000 src.main:app
```

**SSL Certificate Issues**
```bash
sudo certbot certificates
sudo certbot renew --dry-run
```

## 📊 Performance Optimization

### Database Optimization
```sql
-- สร้าง indexes สำหรับ performance
CREATE INDEX idx_chat_sessions_user_id ON chat_sessions(user_id);
CREATE INDEX idx_chat_messages_session_id ON chat_messages(session_id);
CREATE INDEX idx_prompt_templates_created_by ON prompt_templates(created_by);
CREATE INDEX idx_generated_tools_created_by ON generated_tools(created_by);
```

### Nginx Caching
```nginx
# เพิ่มใน nginx config
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}

location /api/ {
    # API caching สำหรับ static data
    location /api/prompts {
        proxy_cache_valid 200 5m;
        proxy_cache_key $request_uri;
    }
}
```

### Application Optimization
```python
# ใน production config
SQLALCHEMY_ENGINE_OPTIONS = {
    'pool_size': 10,
    'pool_recycle': 120,
    'pool_pre_ping': True
}
```

---

**หมายเหตุ**: คู่มือนี้เป็นแนวทางทั่วไป กรุณาปรับแต่งตามสภาพแวดล้อมและความต้องการของคุณ

