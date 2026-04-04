def generate_explanation(parsed, attack_summary, timeline):
    try:
        intent = parsed.get("intent", "unknown")
        entities = parsed.get("entities", [])
        text = parsed.get("text", "")

        # 🧠 Gather Evidence from the Timeline
        evidence_str = ""
        if timeline and len(timeline) > 0:
            first_event = timeline[0]
            last_event = timeline[-1]
            
            # Get unique sources for correlation proof
            unique_sources = list(set([e.get("source", "unknown").title() for e in timeline]))
            sources_str = ", ".join(unique_sources)
            
            start_time = first_event.get("timestamp", "Unknown")
            end_time = last_event.get("timestamp", "Unknown")
            
            evidence_str = f" Correlation across {len(unique_sources)} source(s): [{sources_str}]. Activity window: {start_time} to {end_time}."

        # 🧠 Check if NLP found an IP address
        ip = next((e["value"] for e in entities if e["type"] == "IP_ADDRESS"), None)

        # 🧠 Generate highly contextual, evidence-backed response
        if ip:
            return f"🧠 Analysis: Indicator of Compromise (IOC) {ip} actively flagged.{evidence_str} {attack_summary} NLP Intent classified as '{intent}'."

        if "failure" in intent or "brute" in intent:
            return f"🚨 Investigating authentication anomalies.{evidence_str} {attack_summary} Reviewing brute-force patterns."

        if "exfiltration" in intent:
            return f"📦 Tracking data movement vectors.{evidence_str} {attack_summary} High risk of intellectual property loss."

        return f"🛡️ General Threat Assessment.{evidence_str} {attack_summary} Timeline reconstructed for query: '{text}'"

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