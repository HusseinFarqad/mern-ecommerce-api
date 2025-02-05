# E-commerce API

A robust RESTful API for an e-commerce platform built with Node.js, Express, and MongoDB. This API provides endpoints for user authentication, product management, and shopping cart functionality with image upload capabilities.

## Features

- **User Management**

  - User registration and authentication
  - JWT-based authorization
  - Separate admin authentication

- **Product Management**

  - CRUD operations for products
  - Multiple image uploads
  - Cloudinary integration for image storage
  - Category and subcategory organization
  - Advanced filtering and sorting

- **Shopping Cart**

  - Add/remove items
  - Update quantities
  - Size-specific product management
  - Cart total calculation
  - Persistent cart storage

- **Security Features**
  - Password hashing
  - JWT authentication
  - Protected admin routes
  - Input validation
  - Error handling

## Tech Stack

- Node.js
- Express.js
- MongoDB with Mongoose
- JWT for authentication
- Cloudinary for image storage
- Multer for file uploads
- Bcrypt for password hashing

## Prerequisites

Before you begin, ensure you have installed:

- Node.js (v14 or higher)
- MongoDB (v4 or higher)
- npm or yarn package manager

## Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/husseinfarqad/mern-ecommerce-api.git
   cd mern-ecommerce-api
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create a .env file in the root directory and add your configuration:

   ```env
   PORT=4000
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   CLOUDINARY_NAME=your_cloudinary_name
   CLOUDINARY_API_KEY=your_cloudinary_key
   CLOUDINARY_SECRET_KEY=your_cloudinary_secret
   ADMIN_EMAIL=admin@example.com
   ADMIN_PASSWORD=secure_admin_password
   ```

4. Start the server:

   ```bash
   # Development mode
   npm run dev

   # Production mode
   npm start
   ```

## API Endpoints

### Authentication

#### User Registration

```http
POST /api/user/register
Content-Type: application/json

{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "securepassword123"
}
```

#### User Login

```http
POST /api/user/login
Content-Type: application/json

{
    "email": "john@example.com",
    "password": "securepassword123"
}
```

#### Admin Login

```http
POST /api/user/admin
Content-Type: application/json

{
    "email": "admin@example.com",
    "password": "adminpassword123"
}
```

### Products

#### Get All Products

```http
GET /api/products

# Query Parameters
?category=shirts
?subCategory=casual
?minPrice=10
?maxPrice=100
?bestseller=true
?sort=-price
?page=1
?limit=10
```

#### Get Single Product

```http
GET /api/products/:id
```

#### Add Product (Admin Only)

```http
POST /api/products/add
Content-Type: multipart/form-data

name: "Product Name"
description: "Product Description"
price: 99.99
category: "Category Name"
subCategory: "Sub Category"
bestseller: "true"
sizes: ["S", "M", "L"]
image1: [file]
image2: [file]
image3: [file]
image4: [file]
```

#### Update Product (Admin Only)

```http
PUT /api/products/:id
Content-Type: multipart/form-data

# All fields are optional
name: "Updated Name"
price: 79.99
...
```

#### Delete Product (Admin Only)

```http
DELETE /api/products/:id
```

### Shopping Cart

#### Get Cart

```http
GET /api/cart
Headers:
    token: your_jwt_token
```

#### Add to Cart

```http
POST /api/cart/add
Headers:
    token: your_jwt_token
Content-Type: application/json

{
    "itemId": "product_id",
    "size": "M"
}
```

#### Update Cart

```http
PUT /api/cart/update
Headers:
    token: your_jwt_token
Content-Type: application/json

{
    "itemId": "product_id",
    "size": "M",
    "quantity": 2
}
```

#### Clear Cart

```http
DELETE /api/cart/clear
Headers:
    token: your_jwt_token
```

## Error Handling

The API uses standard HTTP response codes:

- 200: Success
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 404: Not Found
- 500: Server Error

Error responses follow this format:

```json
{
  "success": false,
  "status": "error",
  "message": "Error description"
}
```

## Development

### Running Tests

```bash
npm test
```

### Linting

```bash
npm run lint
```

### Format Code

```bash
npm run format
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contact

Hussein Farqad - husseinfarqued@gmail.com
Project Link: [https://github.com/husseinfarqad/mern-ecommerce-api](https://github.com/husseinfarqad/mern-ecommerce-api)
