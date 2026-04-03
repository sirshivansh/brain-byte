def build_timeline(logs):
    logs = sorted(logs, key=lambda x: x["timestamp"])

    timeline = []

    for i, log in enumerate(logs):
        event = {
            "step": i + 1,
            "time": log["timestamp"],
            "event": log["event_type"],
            "status": log.get("status", ""),
            "description": ""
        }

        if log["event_type"] == "login" and log.get("status") == "failed":
            event["description"] = "Failed login attempt detected"

        elif log["event_type"] == "login" and log.get("status") == "success":
            event["description"] = "Successful login detected"

        elif log["event_type"] == "data_export":
            event["description"] = "Sensitive data export detected"

        timeline.append(event)

    return timeline


# 🔥 THIS FUNCTION IS MISSING IN YOUR FILE
def detect_attack(timeline):
    events = [step["event"] for step in timeline]

    if "login" in events and "data_export" in events:
        return "Possible account compromise followed by data exfiltration attack."

    if events.count("login") >= 2:
        return "Multiple login attempts detected. Possible brute-force attack."

    return "No clear attack pattern detected."