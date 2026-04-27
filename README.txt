INVENTORY BACKEND FULL UPDATED

This backend includes:
1. MongoDB connection
2. Bottle database API
3. Barcode lookup API
4. Scanned reading/history API
5. CORS setup for frontend connection

FILES:
server.js
models/Bottle.js
models/Reading.js
routes/bottleRoutes.js
routes/readingRoutes.js
.env.example

INSTALL:
npm install

LOCAL RUN:
Create .env file using .env.example
npm run dev

RENDER DEPLOYMENT:
Add these Environment Variables in Render:

MONGO_URI=your MongoDB Atlas connection string
CORS_ORIGIN=https://your-main-frontend-vercel-url.vercel.app

Optional:
PORT=5000

MAIN API TESTS:

Backend health:
GET https://back-a9dq.onrender.com/api/health

Get all bottles:
GET https://back-a9dq.onrender.com/api/bottles

Add bottle:
POST https://back-a9dq.onrender.com/api/bottles

Example body:
{
  "productId": "P001",
  "barcode": "8901234567890",
  "brandName": "Magic Moments Vodka",
  "category": "Vodka",
  "bottleSizeML": 750,
  "emptyBottleWeightG": 400,
  "costPrice": 520
}

Fetch bottle by barcode:
GET https://back-a9dq.onrender.com/api/bottles/8901234567890

Save scanner reading:
POST https://back-a9dq.onrender.com/api/readings

Get scanner history:
GET https://back-a9dq.onrender.com/api/readings

IMPORTANT:
Admin panel adds bottles using POST /api/bottles.
Main scanner website fetches bottles using GET /api/bottles/:barcode.
MongoDB stores the data.
