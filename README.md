# 🛍️ Payload E-Commerce

A full-stack e-commerce app built with **Payload CMS** + **Next.js** + **MongoDB**.

## Features

- 🛒 Product catalog with categories & images
- 👤 JWT Authentication (admin & customer roles)
- 📦 Orders with auto-calculated totals
- 📧 Email notifications via Mailtrap
- 🔐 Role-based access control
- 🛍️ Cart with quantity controls
- 📋 Order history page

## Tech Stack

- **Backend**: Payload CMS, MongoDB, Node.js
- **Frontend**: Next.js, React, TypeScript
- **Email**: Nodemailer + Mailtrap

## Getting Started

1. Clone the repo
2. `cp .env.example .env` and fill in your credentials
3. `pnpm install`
4. `npm run dev`
5. Open `http://localhost:3000`

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/products | List all products |
| GET | /api/products/featured | Featured products |
| GET | /api/products/search?q= | Search products |
| POST | /api/users/login | Login |
| GET | /api/orders | My orders (auth required) |
| GET | /api/orders/summary | Order stats (auth required) |
