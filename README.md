# Restaurant AI Support & Operations Agent

AI-powered restaurant support agent built for the Tenacious Techies AI Automation & Agents Developer assessment.

## Features
- FastAPI REST API
- Conversational `/api/agent/chat` endpoint
- Tool calling for order status, order details and support tickets
- File-based restaurant knowledge base with retrieval
- Policy-grounded answers
- Structured ticket categories and priorities
- Tool argument validation
- Basic privacy and prompt-injection safeguards in the application prompt
- React chat frontend
- Tests for core order tools

## Architecture
React frontend -> FastAPI -> Agent router -> RAG or LLM tool-calling -> Python tools -> JSON operational data.

Order information comes from `data/orders.json`; support tickets are persisted in `data/tickets.json`.

## Setup

### Backend
```powershell
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
copy .env.example .env
```
Put your OpenRouter key in `.env` as `LLM_API_KEY=...`.

Run:
```powershell
uvicorn app.main:app --reload
```
Swagger: `http://127.0.0.1:8000/docs`

### Frontend
```powershell
cd frontend
npm install
npm run dev
```

## Example requests
`POST /api/agent/chat`
```json
{"message":"What is the status of ORD-1005?"}
```

Other examples:
- `Give me the complete details of ORD-1005`
- `What are your cancellation rules?`
- `I was charged for ORD-1005 but my order failed. Create a support ticket.`

## Security and reliability notes
- API secrets are loaded from environment variables and `.env` is ignored by Git.
- Order IDs are validated before order tools run.
- Ticket category and priority use allow-lists.
- Unknown tools are rejected.
- The agent is instructed not to expose unrelated order/customer data or invent operational data.
- The demo uses local JSON data, so production would need a real authenticated database/API, stronger authorization, rate limiting, monitoring, and a production vector database.

## Limitations
The included RAG uses lightweight keyword retrieval rather than embeddings/vector search. It is intentionally simple for the assessment demo and can be upgraded to a vector store later.
