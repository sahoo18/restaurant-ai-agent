import json
from datetime import datetime
from pathlib import Path

from pydantic import BaseModel, Field, ValidationError


class ComplaintClassification(BaseModel):
    category: str = Field(
        pattern="^(Payment|Order|Delivery|Refund|Technical)$"
    )
    priority: str = Field(
        pattern="^(Low|Medium|High)$"
    )
    sentiment: str = Field(
        pattern="^(Positive|Neutral|Negative)$"
    )
    description: str = Field(min_length=1)


def validate_classification(data: dict):
    try:
        result = ComplaintClassification(**data)
        return {
            "valid": True,
            "data": result.model_dump()
        }
    except ValidationError as error:
        return {
            "valid": False,
            "error": str(error)
        }


def log_automation_result(result: dict):
    log_path = (
        Path(__file__).resolve().parents[1]
        / "data"
        / "automation_logs.json"
    )

    if log_path.exists():
        with open(log_path, "r", encoding="utf-8") as file:
            logs = json.load(file)
    else:
        logs = []

    logs.append({
        "timestamp": datetime.now().isoformat(),
        "result": result
    })

    with open(log_path, "w", encoding="utf-8") as file:
        json.dump(logs, file, indent=2)