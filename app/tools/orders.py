import json
import re
from pathlib import Path

ORDERS_FILE = Path(__file__).resolve().parents[2] / "data" / "orders.json"


def load_orders():
    with open(ORDERS_FILE, "r", encoding="utf-8") as f:
        return json.load(f)


def validate_order_id(order_id: str):
    """
    Validate the expected order ID format.
    Example: ORD-1005
    """
    if not re.fullmatch(r"ORD-\d{4}", order_id):
        return {
            "valid": False,
            "error": f'The order ID "{order_id}" does not match the expected format ORD-XXXX.'
        }

    return {"valid": True}


def get_order_status(order_id: str):
    validation = validate_order_id(order_id)

    if not validation["valid"]:
        return validation

    for order in load_orders():
        if order["order_id"] == order_id:
            return {
                "order_id": order["order_id"],
                "status": order["status"],
                "estimated_delivery": order["estimated_delivery"]
            }

    return {
        "error": "Order not found",
        "order_id": order_id
    }


def get_order_details(order_id: str):
    validation = validate_order_id(order_id)

    if not validation["valid"]:
        return validation

    for order in load_orders():
        if order["order_id"] == order_id:
            return order

    return {
        "error": "Order not found",
        "order_id": order_id
    }