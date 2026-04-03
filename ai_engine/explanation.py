def generate_explanation(parsed):
    actions = parsed.get("actions", [])

    if "fail" in actions and "login" in actions:
        return "Multiple failed login attempts detected. Possible brute-force attack."

    if "export" in actions:
        return "Data export activity detected. Possible data exfiltration."

    return "No major threat detected."


def suggest_action(parsed):
    actions = parsed.get("actions", [])

    if "fail" in actions:
        return ["Block IP", "Enable CAPTCHA", "Monitor User"]

    if "export" in actions:
        return ["Check Data Access Logs", "Restrict Permissions"]

    return ["No action needed"]


# 🔥 ADD THIS FUNCTION (THIS IS WHAT WAS MISSING)
def calculate_risk(parsed, timeline):
    risk = 0

    actions = parsed.get("actions", [])
    events = [step["event"] for step in timeline]

    if "fail" in actions:
        risk += 40

    if events.count("login") >= 2:
        risk += 20

    if "data_export" in events:
        risk += 40

    risk = min(risk, 100)

    if risk >= 80:
        level = "HIGH"
    elif risk >= 50:
        level = "MEDIUM"
    else:
        level = "LOW"

    return risk, level
def root_cause_analysis(timeline):
    events = [step["event"] for step in timeline]

    if "port_scan" in events and "login" in events:
        return "The attack started with reconnaissance (port scanning), followed by brute-force login attempts."

    if "login" in events and "data_export" in events:
        return "The attacker gained access using valid credentials and performed data exfiltration."

    return "No clear root cause identified."


def summarize_attack(timeline):
    events = [step["event"] for step in timeline]

    if "port_scan" in events and "data_export" in events:
        return "Multi-stage attack involving scanning, unauthorized access, and data exfiltration."

    return "No significant attack detected."