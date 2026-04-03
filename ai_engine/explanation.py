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