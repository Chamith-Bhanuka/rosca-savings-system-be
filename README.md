# Seettuwa - Backend API Server 🚀

> *The robust Node.js server powering the Seettuwa Digital ROSCA Platform.*

[![Node.js](https://img.shields.io/badge/Node.js-18.0-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-4.18-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-6.0-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)

## 📋 Table of Contents
1. [Overview](#-overview)
2. [Key Features](#-key-features)
3. [System Architecture](#-system-architecture)
4. [Tech Stack](#-tech-stack)
5. [Getting Started](#-getting-started)
    - [Prerequisites](#prerequisites)
    - [Installation](#installation)
    - [Environment Configuration](#environment-configuration)
6. [API Documentation](#-api-documentation)
7. [Available Scripts](#-available-scripts)
8. [Contact](#-contact)

---

## 📖 Overview

This repository contains the **Server-Side Application** for **Seettuwa**. It acts as the backbone of the platform, handling business logic, database interactions, secure authentication, and third-party integrations.

The API is built with **Node.js** and **Express**, using **MongoDB** for data persistence. It facilitates real-time communication via **Socket.io** and manages complex financial transactions securely through **Stripe**.

**Base URL:** `http://localhost:5000/api/v1`

---

## ✨ Key Features

* **🔐 Secure Authentication:** Robust **JWT-based** authentication with Role-Based Access Control (RBAC) for Users, Moderators, and Super Admins.
* **🏦 Financial Engine:** Complex logic to handle ROSCA cycles, payment tracking, wallet management, and automated payout calculations.
* **💳 Payment Gateway:** Full integration with **Stripe API** for processing contributions and secure payouts.
* **🤖 AI Financial Assistant:** Integrated **Google Gemini AI** agent to provide financial advice and analyze user uploaded documents (payslips) for budget recommendations.
* **⚡ Real-Time Events:** **Socket.io** integration for instant notifications, live chat, and the synchronized "Live Lucky Draw" feature.
* **📅 Task Automation:** **Cron jobs** to automatically check for overdue payments, trigger cycle changes, and send reminders.
* **⚖️ Dispute Resolution:** A dedicated workflow for users to contest rejected payments, complete with evidence uploads via **Cloudinary**.
* **📧 Notification System:** Transactional emails (Welcome, OTP, Payment Receipts) powered by **SendGrid**.

---

## 🏗 System Architecture

The backend is structured using a modular **Controller-Service-Model** pattern to ensure scalability and maintainability.

* **Controllers:** Handle incoming HTTP requests and send responses.
* **Services:** Contain the core business logic (e.g., `PaymentService`, `GroupService`).
* **Models:** Define Mongoose schemas for MongoDB data.
* **Middlewares:** Handle Auth verification, Error handling, and File uploads.
* **Routes:** Define API endpoints.

---

## 🛠️ Tech Stack

| Category | Technologies |
| :--- | :--- |
| **Runtime** | Node.js (v18+) |
| **Framework** | Express.js |
| **Database** | MongoDB (Mongoose ODM) |
| **Language** | TypeScript |
| **Real-Time** | Socket.io |
| **Payments** | Stripe SDK |
| **AI Integration** | Google Generative AI (Gemini) |
| **File Storage** | Cloudinary |
| **Email** | SendGrid / Nodemailer |
| **Validation** | Zod |

---

## ⚡ Getting Started

Follow these steps to set up the backend server locally.

### Prerequisites
* Node.js (v16 or higher)
* MongoDB (Local instance or MongoDB Atlas)
* Stripe Account (Test Mode)
* Cloudinary Account
* SendGrid Account (Optional for emails)

### Installation

1.  **Clone the repository:**
    ```bash
    git clone [https://github.com/Chamith-Bhanuka/seettuwa-backend.git](https://github.com/Chamith-Bhanuka/seettuwa-backend.git)
    cd seettuwa-backend
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

### Environment Configuration

Create a `.env` file in the root directory. **This is critical** for the server to function.

```env
# Server Config
PORT=5000
NODE_ENV=development

# Database
MONGO_URI=mongodb+srv://<your_connection_string>

# Security
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRE=30d

# Stripe Payments
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Cloudinary (Image Uploads)
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...

# Email Service (SendGrid)
SENDGRID_API_KEY=SG....
SENDGRID_FROM_EMAIL=support@seettuwa.com

# AI Integration (Google Gemini)
GEMINI_API_KEY=AIzaSy...

# Client URL (For CORS)
CLIENT_URL=http://localhost:5173
```

### Running the Server
Start the server in development mode:

```Bash
npm run dev
```
>*The server should start at http://localhost:5000 and connect to MongoDB.*
