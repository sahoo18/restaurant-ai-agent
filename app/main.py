from fastapi import FastAPI
from pydantic import BaseModel
from app.tools.orders import get_order_status, get_order_details
from app.tools.tickets import create_support_ticket
from app.llm import agent_chat

app=FastAPI(title='Restaurant AI Support Agent', description='AI-powered restaurant support and operations agent', version='1.0.0')

class SupportTicketRequest(BaseModel):
    order_id:str; category:str; priority:str; description:str
class AgentChatRequest(BaseModel):
    message:str

@app.get('/')
def home(): return {'message':'Restaurant AI Agent is running'}
@app.get('/health')
def health(): return {'status':'healthy'}
@app.get('/api/orders/{order_id}/status')
def order_status(order_id:str): return get_order_status(order_id)
@app.get('/api/orders/{order_id}')
def order_details(order_id:str): return get_order_details(order_id)
@app.post('/api/support/tickets')
def support_ticket(request:SupportTicketRequest): return create_support_ticket(**request.model_dump())
@app.post('/api/agent/chat')
def agent_endpoint(request:AgentChatRequest): return {'response':agent_chat(request.message)}
