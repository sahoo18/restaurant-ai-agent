import json
import os
from pathlib import Path


ORDERS_FILE = Path(__file__).resolve().parents[2] / "data" / "orders.json"


def load_orders():
    # Test-only failure simulation
    if os.getenv("SIMULATE_ORDER_TOOL_FAILURE", "false").lower() == "true":
        raise TimeoutError("Simulated order tool timeout")

    with open(ORDERS_FILE, "r", encoding="utf-8") as file:
        return json.load(file)


def get_order_status(order_id: str):
    orders = load_orders()

    for order in orders:
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
    orders = load_orders()

    for order in orders:
        if order["order_id"] == order_id:
            return order

    return {
        "error": "Order not found",
        "order_id": order_id
    }