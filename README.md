## [Visit Website](https://nbfcfinserve.me/)

# FinServe - Loan Application & Credit Scoring Portal

[![AWS](https://img.shields.io/badge/AWS-Cloud%20Native-orange)](https://aws.amazon.com/)
[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-20.x-green)](https://nodejs.org/)

> A cloud-native digital loan origination platform built on AWS, transforming paper-based NBFC loan processing into a fully automated 15-minute decision system.

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Deployment](#deployment)
- [Usage](#usage)
- [API Documentation](#api-documentation)
- [Security & Compliance](#security--compliance)
- [Contributors](#contributors)


## 🎯 Overview

FinServe is a comprehensive digital loan portal designed for non-banking financial companies (NBFCs) operating in Tier 2 and Tier 3 cities across India. The platform eliminates the need for physical branch visits by providing:

- **15-minute loan decisions** for straightforward applications
- **Automated document verification** using AWS Textract
- **Tamper-proof audit trails** for regulatory compliance
- **Mobile-first design** for applicants in remote areas
- **Serverless architecture** that scales automatically

### Problem Statement

Traditional NBFCs lose **40% of applications** due to:
- Mandatory branch visits (5-10 working days processing)
- Manual verification of 12-15 documents
- Inconsistent credit decision criteria
- No audit trail for regulatory compliance
- No aggregated portfolio analytics

### Solution

A fully digital platform where applicants can:
1. Apply online from any device
2. Upload documents via mobile
3. Receive credit decisions within 15 minutes
4. Track application status in real-time
5. Get transparent rejection reasons

## ✨ Features

### For Applicants
- **OTP-based Registration** - Secure phone/email verification via Amazon Cognito
- **Multi-step Application Form** - Guided loan application with validation
- **Direct Document Upload** - Presigned S3 URLs for browser-to-cloud uploads
- **Real-time Status Tracking** - Live application progress updates
- **EMI Calculator** - Interactive loan amount and tenure calculator
- **Decision Notifications** - Instant email alerts via Amazon SES

### For Admin
- **Admin Dashboard** - Queue of pending applications with filters
- **Extracted Data View** - AI-parsed financial information from documents
- **Decision Submission** - Approve/reject with remarks and tenure selection
- **Audit Log Viewer** - Complete application history and decision trail

### For Compliance
- **Immutable Audit Logs** - DynamoDB with IAM deny policies on delete/update
- **CloudTrail Integration** - Cryptographically validated API activity logs
- **VPC Flow Logs** - Network-level traffic monitoring
- **Document Versioning** - S3 versioning for all uploaded files

## 🏗️ Architecture

```
┌─────────────┐
│   Users     │ (Applicants via Mobile/Desktop)
└──────┬──────┘
       │ HTTPS
       ↓
┌─────────────────────────────────────────────┐
│    AWS Amplify (Frontend Hosting)           │
│    + CloudFront CDN                         │
└──────┬──────────────────────────────────────┘
       │
       ↓
┌─────────────────────────────────────────────┐
│   API Gateway (REST API)                    │
│   + Cognito Authorizer (JWT)                │
└──────┬──────────────────────────────────────┘
       │
       ↓
┌──────────────────────────────────────────────────────────────┐
│              AWS Lambda Functions (VPC)                      │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐    │
│  │   Auth   │  │   Apps   │  │   Docs   │  │  Admin   │    │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘    │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                  │
│  │  Parser  │  │  Notify  │  │  Audit   │                  │
│  └──────────┘  └──────────┘  └──────────┘                  │
└──────────────────────────────────────────────────────────────┘
       │                    │                    │
       ↓                    ↓                    ↓
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│  DynamoDB   │    │     S3      │    │     SES     │
│  (5 tables) │    │ (Documents) │    │  (Emails)   │
└─────────────┘    └─────────────┘    └─────────────┘
       │                    │
       ↓                    ↓
┌─────────────────────────────────────────────┐
│         CloudTrail + CloudWatch             │
│         (Audit Trail & Monitoring)          │
└─────────────────────────────────────────────┘
```

### VPC Architecture
- **Public Subnets** (2 AZs): Application Load Balancer
- **Private App Subnets** (2 AZs): Lambda functions
- **Private Data Subnets** (2 AZs): DynamoDB/S3 VPC endpoints
- **NAT Gateways** (2): High availability internet access
- **Security Groups**: Layered network isolation

## 🛠️ Tech Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Shadcn/UI** - Accessible component library
- **AWS Amplify** - Hosting and CI/CD

### Backend
- **Node.js 20.x** - Lambda runtime
- **AWS Lambda** - Serverless compute (7 functions)
- **API Gateway** - REST API with Cognito auth
- **DynamoDB** - NoSQL database (5 tables)
- **Amazon S3** - Document storage with SSE-S3
- **Amazon Cognito** - User authentication & authorization

### AWS Services
| Service | Purpose |
|---------|---------|
| **VPC** | Network isolation with 6 subnets across 2 AZs |
| **Cognito** | User pools, JWT tokens, group-based access |
| **API Gateway** | REST API with Cognito authorizer |
| **Lambda** | 7 serverless functions (Auth, Apps, Docs, Admin, Audit, Parser, Notifications) |
| **DynamoDB** | 5 tables: users, applications, documents, audit-logs, otp-store |
| **S3** | Document storage + CloudTrail logs + VPC Flow Logs |
| **SES** | Transactional emails (4 templates) |
| **CloudFront** | CDN for document preview URLs |
| **CloudTrail** | Tamper-proof audit trail |
| **CloudWatch** | Metrics, dashboards, alarms |

## 📦 Prerequisites

- **AWS Account** with production SES access
- **Node.js 20.x** or higher
- **AWS CLI** configured with credentials
- **Git** for version control
- **Domain** (optional) for custom email sender

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/your-org/finserve-aws-loan-portal.git
cd finserve-aws-loan-portal
```

### 2. Install Dependencies

```bash
# Frontend
cd frontend
npm install

```

### 3. Set Up AWS Infrastructure

Follow the detailed setup guide in `/docs/AWS_SETUP.md` or follow these high-level steps:

```bash
# 1. Create VPC with public, private, and data subnets
# 2. Set up IAM roles (finserve-lambda-role)
# 3. Create Cognito user pool (finserve-users)
# 4. Create DynamoDB tables (5 tables)
# 5. Create S3 buckets (documents + CloudTrail)
# 6. Deploy Lambda functions (7 functions)
# 7. Configure API Gateway
# 8. Set up SES domain verification
# 9. Enable CloudTrail
# 10. Create CloudWatch dashboard
```

### 4. Environment Configuration

Create `.env.local` in the frontend directory:

```env
NEXT_PUBLIC_AWS_REGION=ap-south-1
NEXT_PUBLIC_COGNITO_USER_POOL_ID=ap-south-1_XXXXXXXXX
NEXT_PUBLIC_COGNITO_CLIENT_ID=xxxxxxxxxxxxxxxxxx
NEXT_PUBLIC_API_GATEWAY_URL=https://xxxxxx.execute-api.ap-south-1.amazonaws.com/dev
NEXT_PUBLIC_S3_BUCKET=finserve-loan-documents-xxxxxxxxxxxx
NEXT_PUBLIC_CLOUDFRONT_URL=https://xxxxxxxxxxxx.cloudfront.net
```

Lambda environment variables (set in AWS Console):

```env
REGION=ap-south-1
COGNITO_USER_POOL_ID=ap-south-1_XXXXXXXXX
COGNITO_CLIENT_ID=xxxxxxxxxxxxxxxxxx
DYNAMODB_USERS_TABLE=finserve-users
DYNAMODB_APPLICATIONS_TABLE=finserve-applications
DYNAMODB_DOCUMENTS_TABLE=finserve-documents
DYNAMODB_AUDIT_TABLE=finserve-audit-logs
DYNAMODB_OTP_TABLE=finserve-otp-store
S3_BUCKET=finserve-loan-documents-xxxxxxxxxxxx
SNS_APPLICATION_UPDATES_TOPIC=arn:aws:sns:ap-south-1:ACCOUNT:finserve-app-updates
SES_FROM_EMAIL=noreply@finserve.in
```

## 📤 Deployment

### Frontend (AWS Amplify)

```bash
# Push to GitHub
git push origin main

# Amplify auto-deploys on push
# Or manual deploy:
cd frontend
npm run build
# Connect Amplify to your GitHub repo in AWS Console
```


## 📖 Usage

### Applicant Journey

1. **Register**
   ```
   GET /auth/register
   POST /auth/register { email, phone, password, name }
   ```

2. **Verify OTP**
   ```
   POST /auth/verify-otp { email, otp }
   ```

3. **Login**
   ```
   POST /auth/login { email, password }
   → Returns JWT token
   ```

4. **Create Application**
   ```
   POST /applications
   Headers: { Authorization: Bearer <jwt> }
   Body: { loanType, amount, tenure, personalInfo, employmentInfo }
   ```

5. **Upload Documents**
   ```
   POST /documents/presigned-url
   → Returns S3 presigned URL
   Browser uploads directly to S3
   POST /documents/confirm { documentId, s3Key }
   ```

6. **Track Status**
   ```
   GET /applications/:id
   → { status: "pending" | "approved" | "rejected" | "conditional" }
   ```

### Admin Journey

1. **Login as Admin**
   ```
   POST /auth/login { email, password }
   (User must be in 'admins' Cognito group)
   ```

2. **View Application Queue**
   ```
   GET /admin/applications?status=pending
   ```

3. **Review Extracted Data**
   ```
   GET /documents/:id/extracted
   → Returns parsed financial data from Textract
   ```

4. **Submit Decision**
   ```
   POST /admin/applications/:id/decision
   Body: { decision: "approved", approvedAmount, interestRate, tenure }
   ```

## 🔌 API Documentation

### Authentication Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/auth/register` | None | Create new user account |
| POST | `/auth/send-otp` | None | Send OTP to email/phone |
| POST | `/auth/verify-otp` | None | Verify OTP and activate account |
| POST | `/auth/login` | None | Get JWT token |
| POST | `/auth/logout` | JWT | Invalidate session |

### Application Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/applications` | JWT | List user's applications |
| POST | `/applications` | JWT | Create new application |
| GET | `/applications/:id` | JWT | Get application details |
| PATCH | `/applications/:id` | JWT | Update application |
| POST | `/applications/track` | None | Track by ID + mobile (public) |

### Document Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/documents/presigned-url` | JWT | Get S3 upload URL |
| POST | `/documents/confirm` | JWT | Confirm upload complete |
| GET | `/documents/:id/status` | JWT | Check extraction status |
| GET | `/documents/:id/extracted` | JWT | Get parsed data |

### Admin Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/admin/applications` | JWT + Admin | Get application queue |
| POST | `/admin/applications/:id/decision` | JWT + Admin | Submit decision |
| GET | `/admin/audit` | JWT + Admin | View audit logs |

## 🔒 Security & Compliance

### Authentication
- **Amazon Cognito** user pools with JWT tokens
- **MFA Optional** for applicants, required for admins
- **Password Policy**: Minimum 8 characters, numbers, special chars

### Authorization
- **Group-based access control** (admins, loan-officers, applicants)
- **API Gateway Cognito authorizer** validates JWT on every request
- **Lambda checks cognito:groups claim** for admin routes

### Data Protection
- **S3 SSE-S3 encryption** for all documents at rest
- **Presigned URLs** with 15-minute expiration for uploads
- **VPC isolation** - Lambda functions in private subnets
- **Security groups** - Layered network segmentation
- **No public S3 access** - All documents via CloudFront OAC

### Audit & Compliance
- **Immutable audit logs** - IAM deny policy prevents deletion
- **CloudTrail** with log file validation (cryptographic integrity)
- **VPC Flow Logs** for network traffic audit
- **CloudWatch** metrics and alarms for anomaly detection

### Regulatory Compliance
- **NBFC audit requirements** met through tamper-proof logs
- **Complete decision trail** - every action logged with timestamp
- **Data retention** - No TTL on audit logs (permanent storage)
- **Access logging** - S3 access logs enabled on document bucket

## 👥 Contributors

<table>
  <tr>
    <td align="center">
      <strong>G Varun</strong><br>
      <sub>AP23110010159</sub>
    </td>
    <td align="center">
      <strong>Y Lalit Aditya</strong><br>
      <sub>AP23110010288</sub>
    </td>
    <td align="center">
      <strong>Kuldeep Swarnkar</strong><br>
      <sub>AP23110010136</sub>
    </td>
    <td align="center">
      <strong>G Sankalp</strong><br>
      <sub>AP23110010291</sub>
    </td>
  </tr>
</table>

**Department of Computer Science and Engineering**  
**SRM University-AP, Neerukonda**  
**May 2026**


**Built with ❤️ using AWS Cloud Services**
