# Redii — Redis Caching Demonstration

A full-stack demo app showcasing Redis caching with a Node.js/Express backend and a React + Vite frontend.

## Project Structure

```
redii/
├── client/
│   └── redii-demonstration/   # React + Vite frontend
└── server/                    # Express backend
    ├── app.js
    ├── redis.js
    └── routes/
        └── products.js
```

## Tech Stack

- **Frontend:** React 19, Vite
- **Backend:** Node.js, Express 5
- **Cache:** Redis (via ioredis)
- **Dev tools:** Nodemon, dotenv

## Getting Started

### Prerequisites

- Node.js 18+
- A Redis instance (local or cloud, e.g. Redis Cloud)

### 1. Server setup

```bash
cd server
npm install
```

Create a `.env` file in the `server/` directory:

```env
REDIS_HOST=your-redis-host
REDIS_PORT=your-redis-port
REDIS_USERNAME=default
REDIS_PASSWORD=your-redis-password
```

Start the server (with auto-restart via nodemon):

```bash
npm start
```

Server runs on **http://localhost:3000**

### 2. Client setup

```bash
cd client/redii-demonstration
npm install
npm run dev
```

Client runs on **http://localhost:5173**

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Health check |
| GET | `/api/products` | Get all products |
