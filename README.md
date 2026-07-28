# Full-Featured E-Commerce Storefront

A production-oriented full-stack e-commerce application built with **Next.js**, **Express.js**, **MongoDB Atlas**, **Mongoose**, **TypeScript**, and **npm Workspaces**.

The project follows a monorepo architecture where the frontend, backend, and shared contracts live in a single repository, allowing both applications to share types and constants while remaining independently deployable.

---

# Tech Stack

## Frontend

* Next.js (App Router)
* React
* TypeScript
* Tailwind CSS

## Backend

* Express.js
* Node.js
* TypeScript
* MongoDB Atlas
* Mongoose

## Shared

* Shared TypeScript interfaces
* Shared constants
* Shared API response types

---

# Project Structure

```text
ecommerce-store/
│
├── client/             # Next.js frontend
├── server/             # Express.js backend
├── shared/             # Shared types & constants
├── .github/
│   └── workflows/
├── README.md
├── package.json
└── .gitignore
```

---

# Prerequisites

Install the following before starting:

* Node.js 20+
* npm 10+
* Git
* MongoDB Atlas account

---

# Clone the Repository

```bash
git clone <repository-url>

cd ecommerce-store
```

---

# Install Dependencies

Install all workspace dependencies from the project root.

```bash
npm install
```

---

# Environment Variables

## Client

Create:

```text
client/.env.local
```

Example:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
```

---

## Server

Create:

```text
server/.env
```

Example:

```env
NODE_ENV=development

PORT=5000

CLIENT_URL=http://localhost:3000

MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/ecommerce
```

Never commit your real `.env` file to source control.

---

# Running the Development Servers

## Terminal 1

Start the backend.

```bash
cd server

npm run dev
```

Expected output:

```text
MongoDB connected
Server listening on port 5000
```

---

## Terminal 2

Start the frontend.

```bash
cd client

npm run dev
```

Expected output:

```text
Ready in ...
Local: http://localhost:3000
```

---

# Development URLs

Frontend

```text
http://localhost:3000
```

Backend

```text
http://localhost:5000
```

Health Endpoint

```text
http://localhost:5000/api/v1/health
```

Expected response

```json
{
  "success": true,
  "message": "OK",
  "data": {}
}
```

---

# Available Scripts

## Root

Install all workspace dependencies

```bash
npm install
```

Build every workspace

```bash
npm run build
```

---

## Server

Development

```bash
npm run dev
```

Build

```bash
npm run build
```

Production

```bash
npm start
```

---

## Client

Development

```bash
npm run dev
```

Build

```bash
npm run build
```

Production

```bash
npm start
```

---

# Shared Package

The `shared` workspace contains cross-project contracts used by both the frontend and backend.

Examples include:

* Product
* Order
* User
* API response types
* Role constants

This ensures the frontend and backend use identical TypeScript definitions, preventing duplicated or inconsistent models.

---

# Development Workflow

1. Start MongoDB Atlas.
2. Start the Express backend.
3. Verify the health endpoint.
4. Start the Next.js frontend.
5. Begin development.

---

# Manual Testing Checklist

Before pushing changes:

* Backend starts successfully.
* MongoDB connects successfully.
* `/api/v1/health` returns HTTP 200.
* Frontend loads at `http://localhost:3000`.
* Frontend can communicate with the backend.
* TypeScript builds successfully.
* No linting errors.
* No secrets are committed.

---

# Continuous Integration

GitHub Actions automatically:

* Installs dependencies
* Runs linting
* Builds the shared package
* Builds the server
* Builds the client

on every push to the repository.

---

# Future Features

* Authentication (Auth.js / NextAuth)
* Google & GitHub OAuth
* Shopping Cart
* Wishlist
* Checkout & Payments
* Orders
* User Profiles
* Admin Dashboard
* Coupons
* Analytics
* Testing
* Production Deployment

---

# License

This project is intended for educational and portfolio purposes.
