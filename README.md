# Resolve — Full-Stack Complaint Portal

This converts the original single-file HTML complaint portal into:

- React + Vite frontend
- Node.js + Express backend
- MongoDB database
- Environment variables
- Render deployment configuration
- GitHub-ready monorepo
- Employee ticket creation + history
- API health check

## Project structure

```text
resolve-fullstack/
├── client/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── styles.css
│   ├── .env.example
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
├── server/
│   ├── src/
│   │   ├── models/Ticket.js
│   │   ├── routes/auth.js
│   │   ├── routes/tickets.js
│   │   ├── middleware/auth.js
│   │   ├── db.js
│   │   └── server.js
│   ├── .env.example
│   └── package.json
├── render.yaml
├── .gitignore
└── README.md
```

## 1. Requirements

Install:

- Node.js 20+
- npm
- MongoDB Atlas account
- Git/GitHub

## 2. MongoDB

Create a MongoDB Atlas cluster and copy the connection string.

Example:

```env
MONGODB_URI=mongodb+srv://USERNAME:PASSWORD@cluster.mongodb.net/resolve
```

Do not commit this value to GitHub.

## 3. Backend

Open a terminal:

```bash
cd server
npm install
copy .env.example .env
```

On macOS/Linux use:

```bash
cp .env.example .env
```

Edit `.env`:

```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=make-this-a-long-random-secret
CLIENT_URL=http://localhost:5173
```

Start:

```bash
npm run dev
```

Health check:

```text
http://localhost:5000/api/health
```

## 4. Frontend

Open another terminal:

```bash
cd client
npm install
copy .env.example .env
```

On macOS/Linux:

```bash
cp .env.example .env
```

Set:

```env
VITE_API_URL=http://localhost:5000/api
```

Start:

```bash
npm run dev
```

Open the Vite URL shown in the terminal, normally:

```text
http://localhost:5173
```

## 5. How the app works

### Login

The current UI keeps the original portal's simple Employee ID + Password flow.

The backend creates a JWT for the entered Employee ID. This is suitable for a prototype/demo where employee credentials are managed elsewhere.

For a real production employee login system, replace `POST /api/auth/login` with your actual employee authentication/user collection.

### Raise ticket

Frontend:

```text
POST /api/tickets
```

Backend saves:

```text
ticketId
employeeId
employeeName
complaint
status
createdAt
updatedAt
```

### History

Frontend:

```text
GET /api/tickets/my
```

The JWT identifies the employee, so the frontend does not send an arbitrary employee ID for history.

### Admin compatibility

The ticket collection is named:

```text
tickets
```

The fields are intentionally simple so an existing admin dashboard can query the same MongoDB collection.

If your existing admin app already uses a different collection name or field names, change `server/src/models/Ticket.js` and the admin query to match.

## 6. GitHub

From the project root:

```bash
git init
git add .
git commit -m "Convert Resolve complaint portal to React Express MongoDB"
git branch -M main
git remote add origin YOUR_GITHUB_REPOSITORY_URL
git push -u origin main
```

Never commit `.env`.

## 7. Render deployment

This project includes `render.yaml` for a two-service deployment:

```text
resolve-api
resolve-frontend
```

The backend is a Render Web Service.

The frontend is a Render Static Site.

The frontend receives the backend URL through:

```env
VITE_API_URL
```

### Render environment variables

Backend:

```text
MONGODB_URI = your MongoDB Atlas URI
JWT_SECRET = your secret
CLIENT_URL = your deployed frontend URL
```

Frontend:

```text
VITE_API_URL = your deployed backend /api URL
```

After deployment, set the final URLs in the Render Environment settings and redeploy if necessary.

## 8. Important

Do not put MongoDB credentials or JWT secrets in the React frontend.

Vite variables beginning with `VITE_` are exposed to browser code.

Only `VITE_API_URL` belongs in the frontend.

The backend owns:

- MongoDB credentials
- JWT secret
- database access

## 9. API endpoints

```text
GET  /api/health
POST /api/auth/login
POST /api/tickets
GET  /api/tickets/my
```

## 10. Local test flow

1. Start MongoDB/Atlas connection.
2. Start backend on port 5000.
3. Start frontend on port 5173.
4. Enter any Employee ID and non-empty password for the current prototype authentication.
5. Raise a complaint.
6. Open History.
7. Check MongoDB Atlas `tickets` collection.
8. Open the existing admin application and verify it reads the same database/collection.

For production, connect login to your real employee authentication system before relying on it for sensitive complaints.
