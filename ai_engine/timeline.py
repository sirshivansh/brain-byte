def build_timeline(logs):
    logs = sorted(logs, key=lambda x: x["timestamp"])
    timeline = []

    for i, log in enumerate(logs):
        # Extract basic info
        source = log.get("source", "unknown")
        event_type = log.get("event_type", "unknown")
        
        # 🟢 FIX 1: Auto-detect source if missing
        if source == "unknown" or not source:
            if "port_scan" in event_type or "blocked" in event_type:
                source = "firewall"
            elif "login" in event_type:
                source = "auth"
            else:
                source = "cloud"
        
        # 🟢 FIX 2: Pull MITRE directly from the new JSON data!
        mitre = log.get("technique", "N/A")
        
        # 🟢 FIX 3: Assign Risk based on event type
        risk = "low"
        
        if event_type == "port_scan" or event_type == "blocked_traffic":
            risk = "high"
        elif event_type == "login" and log.get("status") == "failed":
            risk = "critical"
        elif event_type == "login" and log.get("status") == "success":
            risk = "medium"
        elif event_type == "data_export":
            risk = "critical"
        elif event_type == "file_upload":
            risk = "high"

        # 🟢 FIX 4: Clean description format (No more empty brackets!)
        status_text = f" - {log.get('status')}" if log.get("status") else ""
        
        # Format for React
        event = {
            "timestamp": str(log.get("timestamp", "")),
            "source": source, 
            "description": f"{event_type.replace('_', ' ').title()}{status_text}", 
            "mitre": mitre,      
            "risk": risk,        
            "ip": log.get("ip", ""), 
            "user": log.get("user", "") 
        }
        
        timeline.append(event)

    return timeline


def detect_attack(timeline):
    # 🟢 FIX: Get all descriptions as lowercase strings
    events = [step.get("description", "").lower() for step in timeline]

    # 🟢 FIX: Use any() to check if the word exists INSIDE the string
    has_login = any("login" in event for event in events)
    has_export = any("export" in event for event in events)
    
    login_count = sum(1 for event in events if "login" in event)

    if has_login and has_export:
        return "🚨 CRITICAL: Possible account compromise followed by data exfiltration attack."

    if login_count >= 2:
        return "⚠️ HIGH: Multiple login attempts detected. Possible brute-force attack."

    return "No clear attack pattern detected."


def correlate_logs(logs):
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

    suspicious_ip = None
    max_count = 0
    for ip, count in ip_count.items():
        if count > max_count and count >= 2:
            suspicious_ip = ip
            max_count = count

    return suspicious_ip