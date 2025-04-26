# NeuraSec EC2 Deployment Checklist

## Pre-Deployment Steps

- [ ] Ensure you have access to your AWS account
- [ ] Make sure you have admin access to your neurasec.tech domain registrar
- [ ] Prepare your SSH key pair for EC2 access
- [ ] Ensure you have all required API keys:
  - [ ] OTX API Key
  - [ ] VirusTotal API Key
  - [ ] Gemini API Key
- [ ] Have your PostgreSQL database credentials ready

## Phase 1: EC2 Instance Setup

1. [ ] Launch EC2 instance:
   ```bash
   # Note: Do this through AWS Console
   # Choose Amazon Linux 2023 or Ubuntu 22.04
   # Select t2.medium or larger
   # Security Group: Allow ports 22 (SSH), 80 (HTTP), 443 (HTTPS)
   ```

2. [ ] Connect to your instance:
   ```bash
   ssh -i /path/to/key.pem ec2-user@your-ec2-ip
   ```

3. [ ] Update system packages:
   ```bash
   sudo yum update -y   # For Amazon Linux
   # OR
   sudo apt update && sudo apt upgrade -y   # For Ubuntu
   ```

4. [ ] Install Docker:
   ```bash
   sudo yum install -y docker   # For Amazon Linux
   # OR
   sudo apt install -y docker.io   # For Ubuntu
   
   sudo systemctl start docker
   sudo systemctl enable docker
   sudo usermod -aG docker $USER
   newgrp docker
   ```

5. [ ] Install Docker Compose:
   ```bash
   sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
   sudo chmod +x /usr/local/bin/docker-compose
   ```

6. [ ] Install Git, Node.js, and Python:
   ```bash
   # Git
   sudo yum install -y git   # For Amazon Linux
   # OR
   sudo apt install -y git   # For Ubuntu
   
   # Node.js
   curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -   # For Amazon Linux
   sudo yum install -y nodejs   # For Amazon Linux
   # OR
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -   # For Ubuntu
   sudo apt install -y nodejs   # For Ubuntu
   
   # Python
   sudo yum install -y python3 python3-pip   # For Amazon Linux
   # OR
   sudo apt install -y python3 python3-pip   # For Ubuntu
   ```

## Phase 2: DNS Configuration

1. [ ] Get your EC2 instance's public IP address
   ```bash
   curl http://checkip.amazonaws.com
   ```

2. [ ] Configure DNS records at your domain registrar:
   - Create A record: @ → Your EC2 IP
   - Create A record: www → Your EC2 IP
   - Create A record: api → Your EC2 IP

## Phase 3: Application Deployment

1. [ ] Clone the repository:
   ```bash
   git clone https://github.com/yourusername/NeuraSec.git
   cd NeuraSec
   ```

2. [ ] Set up environment files:
   ```bash
   cp .env.example .env
   cp backend/.env.example backend/.env
   ```

3. [ ] Configure frontend environment (.env):
   ```bash
   nano .env
   ```
   ```
   NEXT_PUBLIC_APP_URL=https://neurasec.tech
   NEXT_PUBLIC_API_URL=https://api.neurasec.tech
   NODE_ENV=production
   ```

4. [ ] Configure backend environment (backend/.env):
   ```bash
   nano backend/.env
   ```
   ```
   DATABASE_URL=postgresql://postgres.laapgnufkuqnmiympscm:Shorya80$@aws-0-ap-south-1.pooler.supabase.com:6543/postgres
   POSTGRES_HOST=aws-0-ap-south-1.pooler.supabase.com
   POSTGRES_PORT=6543
   POSTGRES_DATABASE=postgres
   POSTGRES_USER=postgres.laapgnufkuqnmiympscm
   POSTGRES_PASSWORD=Shorya80$
   JWT_SECRET=your_secret_key_here
   OTX_API_KEY=your_otx_api_key
   VIRUSTOTAL_API_KEY=your_virustotal_api_key
   GEMINI_API_KEY=your_gemini_api_key
   NODE_ENV=production
   ```

5. [ ] Create Docker Compose file:
   ```bash
   nano docker-compose.yml
   ```
   ```yaml
   version: '3'
   
   services:
     backend:
       build: 
         context: ./backend
         dockerfile: Dockerfile
       ports:
         - "8000:8000"
       env_file:
         - backend/.env
       restart: always
       volumes:
         - ./backend:/app
   
     frontend:
       build:
         context: .
         dockerfile: Dockerfile.frontend
       ports:
         - "3000:3000"
       env_file:
         - .env
       restart: always
       depends_on:
         - backend
   ```

6. [ ] Create Frontend Dockerfile:
   ```bash
   nano Dockerfile.frontend
   ```
   ```dockerfile
   FROM node:18-alpine
   
   WORKDIR /app
   
   COPY package*.json ./
   RUN npm ci
   
   COPY . .
   
   RUN npm run build
   
   EXPOSE 3000
   
   CMD ["npm", "start"]
   ```

7. [ ] Build and start containers:
   ```bash
   docker-compose up -d
   ```

8. [ ] Verify containers are running:
   ```bash
   docker ps
   ```

## Phase 4: Nginx and SSL Setup

1. [ ] Install Nginx:
   ```bash
   sudo yum install -y nginx   # For Amazon Linux
   # OR
   sudo apt install -y nginx   # For Ubuntu
   
   sudo systemctl start nginx
   sudo systemctl enable nginx
   ```

2. [ ] Configure Nginx:
   ```bash
   sudo nano /etc/nginx/conf.d/neurasec.conf
   ```
   ```nginx
   # Main site configuration
   server {
       listen 80;
       server_name neurasec.tech www.neurasec.tech;
       
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
   }
   
   # API subdomain configuration
   server {
       listen 80;
       server_name api.neurasec.tech;
       
       location / {
           proxy_pass http://localhost:8000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
       }
   }
   ```

3. [ ] Test and restart Nginx:
   ```bash
   sudo nginx -t
   sudo systemctl restart nginx
   ```

4. [ ] Install Certbot for SSL:
   ```bash
   sudo yum install -y certbot python3-certbot-nginx   # For Amazon Linux
   # OR
   sudo apt install -y certbot python3-certbot-nginx   # For Ubuntu
   ```

5. [ ] Set up SSL certificates:
   ```bash
   sudo certbot --nginx -d neurasec.tech -d www.neurasec.tech
   sudo certbot --nginx -d api.neurasec.tech
   ```

## Phase 5: Verification and Monitoring

1. [ ] Verify application access:
   - Visit https://neurasec.tech in browser
   - Test https://api.neurasec.tech/api/auth in browser or with curl

2. [ ] Check application logs:
   ```bash
   docker logs neurasec_backend_1
   docker logs neurasec_frontend_1
   ```

3. [ ] Install monitoring tools:
   ```bash
   sudo yum install -y htop   # For Amazon Linux
   # OR
   sudo apt install -y htop   # For Ubuntu
   ```

4. [ ] Set up CloudWatch monitoring (optional):
   ```bash
   sudo yum install -y amazon-cloudwatch-agent   # For Amazon Linux
   # OR
   sudo apt install -y amazon-cloudwatch-agent   # For Ubuntu
   
   sudo /opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-config-wizard
   sudo systemctl start amazon-cloudwatch-agent
   sudo systemctl enable amazon-cloudwatch-agent
   ```

## Phase 6: Security Enhancements

1. [ ] Add security headers to Nginx:
   ```bash
   sudo nano /etc/nginx/conf.d/neurasec.conf
   ```
   Add to each server block:
   ```nginx
   # Security headers
   add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload";
   add_header X-Content-Type-Options "nosniff";
   add_header X-Frame-Options "DENY";
   add_header X-XSS-Protection "1; mode=block";
   add_header Referrer-Policy "strict-origin-when-cross-origin";
   add_header Permissions-Policy "camera=(), microphone=(), geolocation=()";
   ```

2. [ ] Restart Nginx:
   ```bash
   sudo nginx -t
   sudo systemctl restart nginx
   ```

3. [ ] Set up automatic security updates:
   ```bash
   # For Amazon Linux
   sudo yum install -y yum-cron
   sudo systemctl enable yum-cron
   sudo systemctl start yum-cron
   
   # For Ubuntu
   sudo apt install -y unattended-upgrades
   sudo dpkg-reconfigure -plow unattended-upgrades
   ```

## Phase 7: Backup Configuration

1. [ ] Create backup script:
   ```bash
   nano ~/backup.sh
   ```
   ```bash
   #!/bin/bash
   DATE=$(date +%Y-%m-%d_%H-%M-%S)
   BACKUP_DIR=/home/ec2-user/backups
   
   # Create backup directory if it doesn't exist
   mkdir -p $BACKUP_DIR
   
   # Backup source code
   tar -czf $BACKUP_DIR/neurasec_app_$DATE.tar.gz -C /home/ec2-user NeuraSec
   
   # Remove backups older than 7 days
   find $BACKUP_DIR -type f -name "neurasec_app_*.tar.gz" -mtime +7 -delete
   ```

2. [ ] Make script executable and set up cron job:
   ```bash
   chmod +x ~/backup.sh
   crontab -e
   ```
   Add:
   ```
   0 2 * * * /home/ec2-user/backup.sh
   ```

## Updates and Maintenance

To update the application:
```bash
cd ~/NeuraSec
git pull
docker-compose down
docker-compose up --build -d
```

To renew SSL certificates (should happen automatically, but manual renewal):
```bash
sudo certbot renew
``` 