from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from app.tools.orders import get_order_status, get_order_details
from app.tools.tickets import create_support_ticket
from app.llm import agent_chat


# In-memory conversation sessions
# Example:
# {
#     "context-test-2": [
#         {"role": "user", "content": "My order is ORD-1005."},
#         {"role": "assistant", "content": "..."}
#     ]
# }
sessions = {}


app = FastAPI(
    title="Restaurant AI Support Agent",
    description="AI-powered restaurant support and operations agent",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------------------------------------------------
# Request Models
# ---------------------------------------------------------

class SupportTicketRequest(BaseModel):
    order_id: str
    category: str
    priority: str
    description: str


class AgentChatRequest(BaseModel):
    message: str
    session_id: str = "default"


# ---------------------------------------------------------
# Basic APIs
# ---------------------------------------------------------

@app.get("/")
def home():
    return {
        "message": "Restaurant AI Agent is running"
    }


@app.get("/health")
def health():
    return {
        "status": "healthy"
    }


# ---------------------------------------------------------
# Order APIs
# ---------------------------------------------------------

@app.get("/api/orders/{order_id}/status")
def order_status(order_id: str):
    return get_order_status(order_id)


@app.get("/api/orders/{order_id}")
def order_details(order_id: str):
    return get_order_details(order_id)


# ---------------------------------------------------------
# Support Ticket API
# ---------------------------------------------------------

@app.post("/api/support/tickets")
def support_ticket(request: SupportTicketRequest):
    return create_support_ticket(
        **request.model_dump()
    )


# ---------------------------------------------------------
# Agent Chat API
# ---------------------------------------------------------

@app.post("/api/agent/chat")
def agent_endpoint(request: AgentChatRequest):

    import re

    session_id = request.session_id

    # -----------------------------------------------------
    # Create session if it does not exist
    # -----------------------------------------------------

    if session_id not in sessions:
        sessions[session_id] = []

    history = sessions[session_id]

    # -----------------------------------------------------
    # Find previous order ID from conversation history
    # -----------------------------------------------------

    previous_order_id = None

    for message in history:

        content = message.get("content", "")

        order_matches = re.findall(
            r"\bORD-\d{4}\b",
            content,
            re.IGNORECASE
        )

        if order_matches:
            previous_order_id = order_matches[-1].upper()

    # -----------------------------------------------------
    # Check current message for an order ID
    # -----------------------------------------------------

    current_order_matches = re.findall(
        r"\bORD-\d{4}\b",
        request.message,
        re.IGNORECASE
    )

    if current_order_matches:
        previous_order_id = current_order_matches[-1].upper()

    # -----------------------------------------------------
    # Prepare message for the AI agent
    # -----------------------------------------------------

    agent_message = request.message

    # -----------------------------------------------------
    # Context keywords
    # -----------------------------------------------------

    lower_message = request.message.lower()

    context_keywords = [
        "status",
        "where is",
        "delivery",
        "when will",
        "when is",
        "arrive",
        "details",
        "what did i order",
        "items",
        "order information",
        "order details"
    ]

    asks_about_previous_order = any(
        keyword in lower_message
        for keyword in context_keywords
    )

    # -----------------------------------------------------
    # Attach previous order ID when appropriate
    # -----------------------------------------------------

    if (
        previous_order_id
        and asks_about_previous_order
        and not current_order_matches
    ):

        agent_message = (
            f"The customer is continuing a conversation "
            f"about order {previous_order_id}.\n\n"
            f"Current customer message:\n"
            f"{request.message}\n\n"
            f"Use order ID {previous_order_id} for this request."
        )

    # -----------------------------------------------------
    # Run AI agent
    # -----------------------------------------------------

    response = agent_chat(agent_message)

    # -----------------------------------------------------
    # Save user message
    # -----------------------------------------------------

    history.append({
        "role": "user",
        "content": request.message
    })

    # -----------------------------------------------------
    # Save assistant response
    # -----------------------------------------------------

    history.append({
        "role": "assistant",
        "content": response
    })

    # -----------------------------------------------------
    # Return response
    # -----------------------------------------------------

    return {
        "session_id": session_id,
        "response": response
    }