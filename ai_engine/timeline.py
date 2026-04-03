def build_timeline(logs):
    logs = sorted(logs, key=lambda x: x["timestamp"])

    timeline = []

    for i, log in enumerate(logs):
        event = {
    "step": i + 1,
    "time": log["timestamp"],
    "event": log["event_type"],
    "status": log.get("status", ""),
    "technique": log.get("technique", "Unknown"),
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

def correlate_logs(logs):
    # Group by IP
    grouped = {}

    for log in logs:
        key = log.get("ip") or log.get("user")

        if key not in grouped:
            grouped[key] = []

        grouped[key].append(log)

    return grouped
def detect_suspicious_ip(logs):
    ip_count = {}

    for log in logs:
        ip = log.get("ip")
        if not ip:
            continue

        if ip not in ip_count:
            ip_count[ip] = 0

        ip_count[ip] += 1

    # Find IP with highest activity
    suspicious_ip = None
    max_count = 0

    for ip, count in ip_count.items():
        if count > max_count and count >= 2:
            suspicious_ip = ip
            max_count = count

    return suspicious_ip