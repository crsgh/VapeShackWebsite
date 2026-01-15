# VS Vape Shop - E-commerce with Square Integration

This is a Next.js e-commerce application integrated with Square POS for real-time inventory management.

## Tech Stack
- **Frontend**: Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: MongoDB (Mongoose) for users and orders
- **Integration**: Square API (Catalog, Inventory, Orders)
- **Auth**: JWT + bcryptjs

## Prerequisites
- Node.js 18+
- MongoDB instance (local or Atlas)
- Square Developer Account

## Setup

1. **Clone the repository**
2. **Install dependencies**:
   ```bash
   npm install
   ```
3. **Configure Environment Variables**:
   Create a `.env.local` file in the root directory:
   ```env
   SQUARE_ACCESS_TOKEN=your_square_access_token
   SQUARE_APP_ID=your_square_app_id
   SQUARE_ENVIRONMENT=production # or sandbox
   MONGODB_URI=mongodb://localhost:27017/vswebsite
   JWT_SECRET=your_jwt_secret_key
   NEXT_PUBLIC_BASE_URL=http://localhost:3000
   ```

## Running the Application

```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) with your browser.

## Features

- **Real-time Inventory**: Syncs with Square POS.
- **Product Listing**: Fetches products directly from Square Catalog.
- **Cart & Checkout**: Manages cart state and processes orders.
- **Authentication**: User registration and login with age verification.
- **Age Gate**: Restricts access to legal age users.

## Inventory Sync Strategy

1. **Real-time Fetch**: The website fetches inventory counts directly from Square API when loading pages.
2. **Webhooks**: (Implemented in `/api/webhooks/square`) Receives updates from Square for `inventory.count.updated` to invalidate caches or update local DB if needed (currently direct fetch is used for simplicity and accuracy).
3. **Checkout Validation**: Before confirming an order, the backend re-checks stock with Square to prevent overselling.

## Deployment

1. Build the application:
   ```bash
   npm run build
   ```
2. Start the production server:
   ```bash
   npm start
   ```

## Scaling

- **Mobile App**: The API at `/api/products` and `/api/orders` is CORS-enabled and JSON-ready for mobile consumption.
- **Caching**: Implement Redis to cache Square inventory responses for high-traffic events, invalidated by Webhooks.
