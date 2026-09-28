from app.tools.orders import get_order_status, get_order_details

def test_order_status():
    assert get_order_status('ORD-1005')['status']=='Out for Delivery'

def test_missing_order():
    assert get_order_status('ORD-9999')['error']=='Order not found'

def test_order_details():
    assert get_order_details('ORD-1005')['customer_name']=='Amit'
