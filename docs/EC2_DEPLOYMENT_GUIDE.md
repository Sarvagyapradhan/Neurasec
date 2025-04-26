# EC2 Deployment Guide for NeuraSec with Domain Setup

This guide provides detailed instructions for deploying the NeuraSec application on an AWS EC2 instance with the neurasec.tech domain.

## 1. Prerequisites

- AWS account with permissions to create and manage EC2 instances
- SSH client (PuTTY for Windows or Terminal for macOS/Linux)
- SSH key pair for EC2 instance access
- Domain name: neurasec.tech (already owned)
- DNS access to configure domain records

## 2. Setting Up the EC2 Instance

### 2.1. Launch an EC2 Instance

1. Log in to the AWS Management Console
2. Navigate to EC2 Dashboard
3. Click "Launch Instance"
4. Choose Amazon Linux 2023 AMI (or Ubuntu Server 22.04 LTS)
5. Select instance type (recommend t2.medium or higher for production)
6. Configure instance details:
   - Network: Default VPC
   - Auto-assign Public IP: Enable
7. Add storage (at least 20GB)
8. Add tags:
   - Key: Name, Value: neurasec-production
9. Configure security group:
   - SSH (Port 22): Your IP only
   - HTTP (Port 80): Anywhere (0.0.0.0/0)
   - HTTPS (Port 443): Anywhere (0.0.0.0/0)
10. Review and launch
11. Select an existing key pair or create a new one
12. Launch instance

### 2.2. Connect to Your Instance

Once your instance is running, connect to it using SSH:

```bash
ssh -i /path/to/your-key.pem ec2-user@your-instance-public-ip
```

*For Ubuntu instances, use `ubuntu` instead of `ec2-user`*

## 3. Setting Up Domain DNS

### 3.1. Get Your EC2 Instance IP

Locate your EC2 instance's public IP address from the AWS Console.

### 3.2. Configure DNS for neurasec.tech

Go to your domain registrar's DNS management panel and create the following records:

1. Create an A record:
   - Host/Name: @ (or leave blank)
   - Value/Points to: Your EC2 instance's public IP
   - TTL: 3600 (or 1 hour)

2. Create another A record:
   - Host/Name: www
   - Value/Points to: Your EC2 instance's public IP
   - TTL: 3600 (or 1 hour)

3. Create an A record for API subdomain:
   - Host/Name: api
   - Value/Points to: Your EC2 instance's public IP
   - TTL: 3600 (or 1 hour)

DNS changes can take up to 24-48 hours to propagate globally, but typically propagate within 1-4 hours.

## 4. Installing Dependencies

Run the following commands to install required dependencies:

```bash
# Update system packages
sudo yum update -y   # For Amazon Linux
# OR
sudo apt update && sudo apt upgrade -y   # For Ubuntu

# Install Docker
sudo yum install -y docker   # For Amazon Linux
# OR
sudo apt install -y docker.io   # For Ubuntu

# Start and enable Docker
sudo systemctl start docker
sudo systemctl enable docker

# Add current user to docker group
sudo usermod -aG docker $USER

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Install Git
sudo yum install -y git   # For Amazon Linux
# OR
sudo apt install -y git   # For Ubuntu

# Install Node.js 18
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -   # For Amazon Linux
sudo yum install -y nodejs   # For Amazon Linux
# OR
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -   # For Ubuntu
sudo apt install -y nodejs   # For Ubuntu

# Install Python and pip
sudo yum install -y python3 python3-pip   # For Amazon Linux
# OR
sudo apt install -y python3 python3-pip   # For Ubuntu

# Apply the docker group changes
newgrp docker
```

## 5. Deploying the Application

### 5.1. Clone the Repository

```bash
git clone https://github.com/yourusername/NeuraSec.git
cd NeuraSec
```

### 5.2. Setting Up Environment Variables

Create environment files for both backend and frontend:

```bash
# Copy example env files
cp .env.example .env
cp backend/.env.example backend/.env
```

Edit the .env files to update the configuration with your domain:

```bash
# Edit frontend .env file
nano .env
```

Update the following variables in the .env file:
```
NEXT_PUBLIC_APP_URL=https://neurasec.tech
NEXT_PUBLIC_API_URL=https://api.neurasec.tech
NODE_ENV=production
```

```bash
# Edit backend .env file
nano backend/.env
```

Update the following variables in the backend/.env file:
```
DATABASE_URL=postgresql://postgres.laapgnufkuqnmiympscm:Shorya80$@aws-0-ap-south-1.pooler.supabase.com:6543/postgres
POSTGRES_HOST=aws-0-ap-south-1.pooler.supabase.com
POSTGRES_PORT=6543
POSTGRES_DATABASE=postgres
POSTGRES_USER=postgres.laapgnufkuqnmiympscm
POSTGRES_PASSWORD=Shorya80$
JWT_SECRET=your_secret_key_for_jwt_token_generation
OTX_API_KEY=your_otx_api_key
VIRUSTOTAL_API_KEY=your_virustotal_api_key
GEMINI_API_KEY=your_gemini_api_key
NODE_ENV=production
```

### 5.3. Create Docker Compose File

Create a `docker-compose.yml` file in the root directory:

```bash
nano docker-compose.yml
```

Add the following content:

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

### 5.4. Create Frontend Dockerfile

Create a `Dockerfile.frontend` in the root directory:

```bash
nano Dockerfile.frontend
```

Add the following content:

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

### 5.5. Start the Application

Build and start the containers:

```bash
docker-compose up -d
```

Verify that the containers are running:

```bash
docker ps
```

## 6. Setting Up Nginx as a Reverse Proxy

### 6.1. Install Nginx

```bash
sudo yum install -y nginx   # For Amazon Linux
# OR
sudo apt install -y nginx   # For Ubuntu

sudo systemctl start nginx
sudo systemctl enable nginx
```

### 6.2. Configure Nginx for Your Domain

Create a configuration file for your application:

```bash
sudo nano /etc/nginx/conf.d/neurasec.conf
```

Add the following configuration:

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

Test the configuration and restart Nginx:

```bash
sudo nginx -t
sudo systemctl restart nginx
```

## 7. Setting Up SSL with Let's Encrypt

Secure your neurasec.tech domain with HTTPS:

```bash
# Install Certbot
sudo yum install -y certbot python3-certbot-nginx   # For Amazon Linux
# OR
sudo apt install -y certbot python3-certbot-nginx   # For Ubuntu

# Obtain and install SSL certificate for main domain
sudo certbot --nginx -d neurasec.tech -d www.neurasec.tech

# Obtain and install SSL certificate for API subdomain
sudo certbot --nginx -d api.neurasec.tech
```

Follow the prompts to set up HTTPS. Certbot will automatically modify your Nginx configuration to redirect HTTP to HTTPS.

## 8. Verifying the Deployment

After completing the setup, verify that your application is running correctly:

1. Open a web browser and visit https://neurasec.tech
2. Check the API endpoint at https://api.neurasec.tech
3. Verify that all functionality works as expected

## 9. Monitoring and Logs

### 9.1. View application logs

```bash
# Backend logs
docker logs -f neurasec_backend_1

# Frontend logs
docker logs -f neurasec_frontend_1
```

### 9.2. Monitor system resources

```bash
sudo yum install -y htop   # For Amazon Linux
# OR
sudo apt install -y htop   # For Ubuntu

htop
```

### 9.3. Set up Monitoring with AWS CloudWatch

1. Install CloudWatch agent:
   ```bash
   sudo yum install -y amazon-cloudwatch-agent   # For Amazon Linux
   # OR
   sudo apt install -y amazon-cloudwatch-agent   # For Ubuntu
   ```

2. Configure CloudWatch:
   ```bash
   sudo /opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-config-wizard
   ```

3. Start the CloudWatch agent:
   ```bash
   sudo systemctl start amazon-cloudwatch-agent
   sudo systemctl enable amazon-cloudwatch-agent
   ```

## 10. Setting Up Automatic Backups

Create a backup script:

```bash
nano ~/backup.sh
```

Add the following content:

```bash
#!/bin/bash
DATE=$(date +%Y-%m-%d_%H-%M-%S)
BACKUP_DIR=/home/ec2-user/backups

# Create backup directory if it doesn't exist
mkdir -p $BACKUP_DIR

# Backup source code
tar -czf $BACKUP_DIR/neurasec_app_$DATE.tar.gz -C /home/ec2-user NeuraSec

# Optional: Upload to S3
# aws s3 cp $BACKUP_DIR/neurasec_app_$DATE.tar.gz s3://your-bucket/backups/

# Remove backups older than 7 days
find $BACKUP_DIR -type f -name "neurasec_app_*.tar.gz" -mtime +7 -delete
```

Make it executable and set up a cron job:

```bash
chmod +x ~/backup.sh

# Edit crontab to run daily at 2 AM
crontab -e
```

Add the following line:

```
0 2 * * * /home/ec2-user/backup.sh
```

## 11. Updating the Application

To update the application when you have new changes:

```bash
# Navigate to the application directory
cd ~/NeuraSec

# Pull latest changes
git pull

# Rebuild and restart containers
docker-compose down
docker-compose up --build -d

# If needed, restart Nginx
sudo systemctl restart nginx
```

## 12. Additional Security Recommendations

1. Keep your EC2 instance updated:
   ```bash
   sudo yum update -y   # For Amazon Linux
   # OR
   sudo apt update && sudo apt upgrade -y   # For Ubuntu
   ```

2. Configure additional security headers in Nginx:
   ```bash
   sudo nano /etc/nginx/conf.d/neurasec.conf
   ```
   
   Add these headers inside the server block:
   ```nginx
   # Security headers
   add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload";
   add_header X-Content-Type-Options "nosniff";
   add_header X-Frame-Options "DENY";
   add_header X-XSS-Protection "1; mode=block";
   add_header Referrer-Policy "strict-origin-when-cross-origin";
   add_header Permissions-Policy "camera=(), microphone=(), geolocation=()";
   ```

3. Configure AWS WAF for additional protection:
   - Go to AWS WAF in the AWS Console
   - Create a Web ACL
   - Add the necessary rules (like rate limiting, IP blocking, etc.)
   - Associate it with your EC2 instance or load balancer

4. Set up automatic security patches:
   ```bash
   # For Amazon Linux
   sudo yum install -y yum-cron
   sudo systemctl enable yum-cron
   sudo systemctl start yum-cron
   
   # For Ubuntu
   sudo apt install -y unattended-upgrades
   sudo dpkg-reconfigure -plow unattended-upgrades
   ```

## 13. Troubleshooting

### 13.1. Application Not Accessible

1. Check if Docker containers are running:
   ```bash
   docker ps
   ```

2. Verify Nginx configuration:
   ```bash
   sudo nginx -t
   ```

3. Check DNS records:
   ```bash
   nslookup neurasec.tech
   nslookup api.neurasec.tech
   ```

4. Examine application logs:
   ```bash
   docker logs neurasec_backend_1
   docker logs neurasec_frontend_1
   ```

5. Check Nginx logs:
   ```bash
   sudo tail -f /var/log/nginx/access.log
   sudo tail -f /var/log/nginx/error.log
   ```

### 13.2. SSL Certificate Issues

1. Check the status of your certificates:
   ```bash
   sudo certbot certificates
   ```

2. Renew certificates if needed:
   ```bash
   sudo certbot renew --dry-run
   sudo certbot renew
   ```

### 13.3. Database Connection Issues

1. Verify database credentials in the .env file
2. Test database connection:
   ```bash
   # From inside the backend container
   docker exec -it neurasec_backend_1 bash
   python -c "import psycopg2; conn = psycopg2.connect('postgresql://user:password@host:port/dbname')"
   ```

## 14. Scaling Your Application (Future)

If you need to scale your application in the future:

1. Consider using AWS Elastic Load Balancer (ELB)
2. Set up Auto Scaling Groups for your EC2 instances
3. Move to a managed Kubernetes service like EKS for container orchestration
4. Consider using AWS RDS for managed PostgreSQL database
5. Implement a CDN like CloudFront for static assets 