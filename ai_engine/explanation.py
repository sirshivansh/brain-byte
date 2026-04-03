def generate_explanation(parsed, attack_summary):
    try:
        intent = parsed.get("intent", "unknown")
        entities = parsed.get("entities", [])
        text = parsed.get("text", "")

        # 🧠 Check if NLP found an IP address
        ip = next((e["value"] for e in entities if e["type"] == "IP_ADDRESS"), None)

        # 🧠 Generate contextual response based on what NLP found
        if ip:
            return f"🧠 Analysis: Focusing on Indicator of Compromise (IOC) {ip}. {attack_summary} NLP Intent classified as '{intent}'."

        if "failure" in intent or "brute" in intent:
            return f"🚨 {attack_summary} Investigating authentication failures and brute-force patterns."

        if "exfiltration" in intent:
            return f"📦 {attack_summary} Tracking data movement and potential exfiltration vectors."

        return f"🛡️ {attack_summary} Timeline reconstructed for query: '{text}'"

    except Exception as e:
        print("❌ explanation error:", e)
        return f"🛡️ {attack_summary}"

def suggest_action(parsed):
    return ["Block IP", "Reset Password", "Isolate Host"]

def calculate_risk(parsed, timeline):
    return 85, "High"

def root_cause_analysis(timeline):
    return "Suspicious behavior"

def summarize_attack(timeline):
    return "Multi-stage attack"