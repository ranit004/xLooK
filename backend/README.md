# URL Safety Checker Backend

A TypeScript Express.js server for checking URL safety and security.

## Features

- **URL Validation**: Validates URLs and checks for malicious content
- **CORS Support**: Configured to allow requests from frontend
- **Environment Variables**: Configurable through .env file
- **TypeScript**: Full TypeScript support with type checking
- **Error Handling**: Comprehensive error handling middleware
- **Health Check**: Health check endpoint for monitoring

## API Endpoints

### POST `/api/check-url`

Validates and analyzes a URL for safety.

**Request Body:**
```json
{
  "url": "https://example.com"
}
```

**Response:**
```json
{
  "success": true,
  "url": "https://example.com",
  "results": [
    {
      "id": "overall",
      "title": "Overall Safety",
      "description": "URL appears to be safe",
      "status": "safe",
      "value": "SAFE",
      "category": "security",
      "details": "No threats detected across all security checks"
    }
  ],
  "checkedAt": "2024-01-01T12:00:00.000Z"
}
```

### GET `/health`

Health check endpoint.

**Response:**
```json
{
  "status": "OK",
  "timestamp": "2024-01-01T12:00:00.000Z",
  "uptime": 123.45
}
```

## Installation

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file with your configuration:
```
PORT=5000
ALLOWED_ORIGIN=http://localhost:3000
```

3. Start the development server:
```bash
npm run dev
```

## Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build the TypeScript code
- `npm start` - Start production server
- `npm run watch` - Watch for TypeScript changes
- `npm run clean` - Clean build directory

## Environment Variables

- `PORT` - Server port (default: 5000)
- `ALLOWED_ORIGIN` - CORS allowed origin (default: http://localhost:3000)
- `NODE_ENV` - Environment (development/production)

## Project Structure

```
backend/
├── src/
│   ├── controllers/    # Route controllers
│   ├── middleware/     # Express middleware
│   ├── routes/         # API routes
│   ├── utils/          # Utility functions
│   └── server.ts       # Main server file
├── .env                # Environment variables
├── tsconfig.json       # TypeScript configuration
└── package.json        # Dependencies and scripts
```
