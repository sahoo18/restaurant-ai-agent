from pathlib import Path

KNOWLEDGE_FILE = Path(__file__).resolve().parents[2] / 'data' / 'knowledge' / 'restaurant_policy.txt'
STOP_WORDS = {'what','is','the','a','an','are','of','for','to','my','your','can','i','do','how','when','does','restaurant'}

def load_knowledge():
    return KNOWLEDGE_FILE.read_text(encoding='utf-8')

def retrieve_knowledge(query: str):
    words = {w.strip('.,?!').lower() for w in query.split() if w.strip('.,?!').lower() not in STOP_WORDS}
    matches=[]
    for section in load_knowledge().split('\n\n'):
        score=sum(1 for w in words if w in section.lower())
        if score: matches.append((score, section))
    matches.sort(key=lambda x:x[0], reverse=True)
    if not matches:
        return {'found': False, 'message':'No relevant information found in the knowledge base.'}
    return {'found': True, 'results':[s for _,s in matches[:3]]}
