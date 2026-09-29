# Architecture — Restaurant Support & Operations AI Agent

## High-level flow

```mermaid
flowchart TD
    Client[User / Frontend / API Client]
    API[FastAPI API]
    Router[Agent Router]
    LLM[OpenRouter-compatible LLM]

    Tools[Approved Tool Layer]
    Status[get_order_status]
    Details[get_order_details]
    Ticket[create_support_ticket]

    Orders[(orders.json)]
    Tickets[(tickets.json)]

    RAG[RAG Retriever]
    KB[(restaurant_policy.txt)]

    Auto[Complaint Automation]
    Classify[Classification]
    Validate[Pydantic Validation]
    Logs[(automation_logs.json)]

    Client --> API
    API --> Router
    Router --> LLM

    Router --> Tools
    Tools --> Status
    Tools --> Details
    Tools --> Ticket

    Status --> Orders
    Details --> Orders
    Ticket --> Tickets

    Router --> RAG
    RAG --> KB

    Router --> Auto
    Auto --> Classify
    Classify --> Validate
    Validate --> Ticket
    Validate --> Logs

    LLM --> Router
    Tools --> Router
    RAG --> Router
    Router --> API
    API --> Client
```

## Security boundary

The LLM does not directly access the filesystem, database, shell, SQL, or arbitrary APIs.

The application exposes only approved tools:

- `get_order_status`
- `get_order_details`
- `create_support_ticket`

Application code validates tool arguments and business rules before execution.

## Data flow

### Order request

```text
User
 → /api/agent/chat
 → agent detects order request
 → validate order ID
 → get_order_status()
 → orders.json
 → authoritative result
 → natural-language response
```

### Policy request

```text
User
 → /api/agent/chat
 → policy intent
 → retrieve_knowledge()
 → restaurant_policy.txt
 → relevant sections
 → grounded response
```

### Complaint

```text
User
 → /api/agent/chat
 → complaint detection
 → AI classification
 → Pydantic validation
 → create_support_ticket()
 → tickets.json
 → automation_logs.json
```
