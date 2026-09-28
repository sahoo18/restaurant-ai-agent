import React,{useState} from 'react';
import {createRoot} from 'react-dom/client';
import './style.css';

function App(){
 const [messages,setMessages]=useState([{role:'assistant',text:'Hello! I can help with orders, policies, payments, delivery and support tickets.'}]);
 const [input,setInput]=useState(''); const [loading,setLoading]=useState(false);
 async function send(){if(!input.trim()||loading)return; const text=input.trim(); setMessages(m=>[...m,{role:'user',text}]); setInput(''); setLoading(true);
  try{const r=await fetch('http://127.0.0.1:8000/api/agent/chat',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({message:text})}); const d=await r.json(); setMessages(m=>[...m,{role:'assistant',text:d.response||d.detail||'No response'}]);}
  catch(e){setMessages(m=>[...m,{role:'assistant',text:'Backend is not reachable. Start FastAPI on port 8000.'}]);} finally{setLoading(false)} }
 return <div className="app"><div className="card"><h1>Restaurant AI Support</h1><p className="sub">AI support & operations agent</p><div className="chat">{messages.map((m,i)=><div key={i} className={'msg '+m.role}><span>{m.text}</span></div>)}{loading&&<div className="msg assistant"><span>Thinking...</span></div>}</div><div className="input"><input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==='Enter'&&send()} placeholder="Ask about an order or policy..."/><button onClick={send}>Send</button></div></div></div>
}
createRoot(document.getElementById('root')).render(<App/>);
