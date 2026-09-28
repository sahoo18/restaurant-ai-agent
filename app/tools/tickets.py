import json
from pathlib import Path
from datetime import datetime

TICKETS_FILE = Path(__file__).resolve().parents[2] / 'data' / 'tickets.json'

def create_support_ticket(order_id: str, category: str, priority: str, description: str):
    ticket = {
        'ticket_id': f"TKT-{datetime.now().strftime('%Y%m%d%H%M%S%f')[:17]}",
        'order_id': order_id, 'category': category, 'priority': priority,
        'description': description, 'created_at': datetime.now().isoformat()
    }
    tickets = []
    if TICKETS_FILE.exists():
        with open(TICKETS_FILE, 'r', encoding='utf-8') as f:
            tickets = json.load(f)
    tickets.append(ticket)
    with open(TICKETS_FILE, 'w', encoding='utf-8') as f:
        json.dump(tickets, f, indent=2)
    return ticket
