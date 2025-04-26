# AWS Deployment Guide for NeuraSec

This guide will help you deploy the NeuraSec application to AWS.

## Prerequisites

1. AWS Account
2. AWS CLI installed and configured
3. Docker installed for container builds

## Backend Deployment (FastAPI)

### Option 1: AWS Elastic Beanstalk

1. Install the EB CLI:
   ```
   pip install awsebcli
   ```

2. Navigate to the backend directory:
   ```
   cd backend
   ```

3. Initialize EB:
   ```
   eb init -p docker
   ```

4. Create an environment:
   ```
   eb create neurasec-backend
   ```

5. Deploy:
   ```
   eb deploy
   ```

### Option 2: AWS ECS (Elastic Container Service)

1. Create an ECR repository:
   ```
   aws ecr create-repository --repository-name neurasec-backend
   ```

2. Build and push Docker image:
   ```
   docker build -t neurasec-backend ./backend
   aws ecr get-login-password | docker login --username AWS --password-stdin <your-account-id>.dkr.ecr.<region>.amazonaws.com
   docker tag neurasec-backend:latest <your-account-id>.dkr.ecr.<region>.amazonaws.com/neurasec-backend:latest
   docker push <your-account-id>.dkr.ecr.<region>.amazonaws.com/neurasec-backend:latest
   ```

3. Create ECS cluster, task definition, and service through AWS Console or CLI.

## Frontend Deployment (Next.js)

### Option 1: AWS Amplify

1. Connect your GitHub repository to AWS Amplify
2. Follow the setup wizard, and configure your environment variables from `.env.production`
3. Deploy

### Option 2: AWS S3 + CloudFront

1. Build the Next.js application:
   ```
   npm run build
   ```

2. Create an S3 bucket and upload the build:
   ```
   aws s3 mb s3://neurasec-frontend
   aws s3 sync ./out s3://neurasec-frontend
   ```

3. Set up CloudFront with the S3 bucket as origin

## Database Setup

The application is configured to use a PostgreSQL database hosted on Supabase.
No additional setup is required as the connection details are already in the environment variables.

## Environment Variables

Make sure your AWS environment has all the necessary environment variables from `.env.production`.

## Monitoring and Scaling

1. Set up CloudWatch alarms for monitoring
2. Configure auto-scaling for your ECS service or Elastic Beanstalk environment
3. Set up a load balancer for high availability

## Security Considerations

1. Use AWS Secrets Manager to store sensitive environment variables
2. Configure security groups to restrict access
3. Set up WAF (Web Application Firewall) for additional protection
4. Consider using AWS Certificate Manager for SSL certificates 