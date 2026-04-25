# Inventory Backend Deploy Ready

Complete backend in one project.

## Includes
- Auth: main user + sub-user
- Outlets, bars, stock rooms
- Products
- Stock room add + assign
- Transfers
- Indents
- Manual inventory
- Closing sessions and closing item calculation
- Reports
- History/activity logs
- Device endpoints
- JSON file persistence in data/db.json

## Run

```bash
npm install
npm run dev
```

Health:
```txt
http://localhost:4000/health
```

Login:
```txt
skyline / 1234
rahul_bar / 1234
```

## Deploy

Start command:
```bash
npm start
```

Environment variables:
```env
PORT=4000
JWT_SECRET=change_this_secret_before_deploy
CORS_ORIGIN=http://localhost:5173,http://localhost:3000,https://your-frontend-domain.com
```

Note: This uses JSON file persistence. It is deploy-ready for MVP/demo. For large production, migrate this same logic to PostgreSQL.
