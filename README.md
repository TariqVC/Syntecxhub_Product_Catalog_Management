# Product Catalog Management 

A RESTful API for managing a product catalog, built with Node.js, Express, and MongoDB. Features full-text search, pagination, MongoDB aggregation pipelines, API key authentication, and input validation.

---

## Tech Stack

- **Runtime** — Node.js
- **Framework** — Express.js
- **Database** — MongoDB with Mongoose ODM
- **Validation** — express-validator
- **Environment** — dotenv

---

## Project Structure

```
product-catalog-api/
├── src/
│   ├── config/
│   │   └── db.js                  # MongoDB connection
│   ├── controllers/
│   │   └── productController.js   # Route logic
│   ├── middleware/
│   │   ├── auth.js                # API key authentication
│   │   ├── validate.js            # Input validation rules
│   │   └── errorHandler.js        # Global error handling
│   ├── models/
│   │   └── Product.js             # Mongoose schema
│   ├── routes/
│   │   └── productRoutes.js       # Route definitions
│   └── utils/
│       ├── seed.js                # Sample data loader
│       └── apiTest.js             # Integration test suite
├── .env                           # Environment variables (never commit)
├── .gitignore
├── package.json
└── server.js                      # App entry point
```

---

## Getting Started

### Prerequisites

- Node.js v18+
- MongoDB running locally or a MongoDB Atlas URI

### Installation

```bash
# Clone the repository
git clone https://github.com/Sytecxhub_Product_Catalog_management/product-catalog-api.git
cd product-catalog-api

# Install dependencies
npm install
```

### Environment Variables

Create a `.env` file in the root directory:

```
PORT=5000
MONGO_URI=mongodb://localhost:27017/productcatalog
API_KEY=your-secret-api-key-here
```

### Seed the Database

Populate the database with sample products:

```bash
npm run seed
```

### Start the Server

```bash
# Development (with auto-restart)
npm run dev

# Production
npm start
```

The server will start at `http://localhost:5000`.

---

## Authentication

All API endpoints are protected with API key authentication. Include your key in the request headers:

```
x-api-key: your-secret-api-key-here
```

| Scenario | Response |
|---|---|
| No API key provided | `401 Unauthorized` |
| Wrong API key | `403 Forbidden` |
| Valid API key | Request proceeds |

---

## API Endpoints

### Products

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/products` | Get all products (search, filter, paginate) |
| `GET` | `/api/products/:id` | Get a single product by ID |
| `POST` | `/api/products` | Create a new product |
| `PUT` | `/api/products/:id` | Update an existing product |
| `DELETE` | `/api/products/:id` | Soft delete a product |

### Stats (Aggregation)

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/products/stats/category` | Product counts, avg/min/max price per category |
| `GET` | `/api/products/stats/price` | Product distribution across price buckets |

---

## Query Parameters

The `GET /api/products` endpoint supports the following query parameters:

| Parameter | Type | Description | Example |
|---|---|---|---|
| `search` | string | Full-text search on name and category | `?search=headphones` |
| `category` | string | Filter by exact category | `?category=electronics` |
| `minPrice` | number | Minimum price filter | `?minPrice=20` |
| `maxPrice` | number | Maximum price filter | `?maxPrice=100` |
| `sort` | string | Sort order (see options below) | `?sort=price_asc` |
| `page` | integer | Page number (default: 1) | `?page=2` |
| `limit` | integer | Results per page, max 50 (default: 10) | `?limit=5` |

**Sort options:** `price_asc`, `price_desc`, `newest`, `oldest`, `name`

### Example Queries

```bash
# Search by name
GET /api/products?search=keyboard

# Filter by category and sort by price
GET /api/products?category=electronics&sort=price_asc

# Price range with pagination
GET /api/products?minPrice=30&maxPrice=80&page=1&limit=5

# Combine everything
GET /api/products?category=electronics&sort=price_desc&page=1&limit=10
```

---

## Request & Response Examples

### Create a Product

**Request**
```http
POST /api/products
x-api-key: your-secret-api-key-here
Content-Type: application/json

{
  "name": "Wireless Headphones",
  "description": "Noise-cancelling over-ear headphones",
  "price": 99.99,
  "category": "electronics",
  "stock": 50,
  "sku": "ELEC-001"
}
```

**Response** `201 Created`
```json
{
  "success": true,
  "data": {
    "_id": "64f1a2b3c4d5e6f7a8b9c0d1",
    "name": "Wireless Headphones",
    "description": "Noise-cancelling over-ear headphones",
    "price": 99.99,
    "category": "electronics",
    "stock": 50,
    "sku": "ELEC-001",
    "isActive": true,
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

### Get All Products (Paginated)

**Response** `200 OK`
```json
{
  "success": true,
  "count": 5,
  "total": 12,
  "page": 1,
  "totalPages": 3,
  "data": [...]
}
```

### Validation Error

**Response** `400 Bad Request`
```json
{
  "success": false,
  "errors": [
    { "field": "name",  "message": "Name is required" },
    { "field": "price", "message": "Price is required" }
  ]
}
```

### Category Stats

**Response** `200 OK`
```json
{
  "success": true,
  "count": 3,
  "data": [
    {
      "category": "electronics",
      "totalProducts": 4,
      "avgPrice": 92.49,
      "minPrice": 39.99,
      "maxPrice": 149.99,
      "totalStock": 225
    }
  ]
}
```

---

## Product Schema

| Field | Type | Required | Notes |
|---|---|---|---|
| `name` | String | Yes | Max 100 characters |
| `description` | String | No | Max 500 characters |
| `price` | Number | Yes | Must be >= 0 |
| `category` | String | Yes | Auto-lowercased |
| `stock` | Number | No | Defaults to 0, must be >= 0 |
| `sku` | String | No | Unique, auto-uppercased |
| `isActive` | Boolean | No | Defaults to true (soft delete flag) |
| `createdAt` | Date | Auto | Added by Mongoose timestamps |
| `updatedAt` | Date | Auto | Added by Mongoose timestamps |

---

## Running Tests

Make sure the dev server is running, then in a second terminal:

```bash
npm test
```

The integration test suite covers 31 checks across all endpoints including auth, validation, CRUD operations, search, pagination, and aggregation.

---

## Scripts

| Script | Command | Description |
|---|---|---|
| Start server | `npm start` | Runs with Node.js |
| Dev server | `npm run dev` | Runs with nodemon (auto-restart) |
| Seed database | `npm run seed` | Loads 5 sample products |
| Run tests | `npm test` | Runs integration test suite |
