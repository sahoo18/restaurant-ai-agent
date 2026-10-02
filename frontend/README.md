# Restaurant AI Customer UI

Customer-facing React/Vite UI for the Restaurant AI Support Agent.

## Features
- Customer Overview with order lookup
- Order status, ETA, items, total, and customer name
- AI Support chat connected to `POST /api/agent/chat`
- Session-based conversation context
- Quick support questions
- Graceful API error messages

## Run

```powershell
npm.cmd install
npm.cmd run dev
```

Open the Vite URL shown in the terminal, usually `http://localhost:5173`.

The backend must be running at `http://127.0.0.1:8000`.

## Optional API URL

Create `.env` from `.env.example` if your backend runs somewhere else:

```text
VITE_API_BASE_URL=http://127.0.0.1:8000
```
