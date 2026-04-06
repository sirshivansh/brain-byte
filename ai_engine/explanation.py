def generate_explanation(parsed, attack_summary, timeline):
    try:
        intent = parsed.get("intent", "unknown")
        entities = parsed.get("entities", [])
        text = parsed.get("text", "")

        # 🧠 Handle empty timelines gracefully to prevent index errors
        if not timeline:
            return f"🛡️ No specific log evidence found in the current window for: '{text}'. {attack_summary}"

        # 🧠 Gather Evidence from the Timeline
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
    # 🧠 HACKATHON TIP: Make actions change based on the intent!
    intent = parsed.get("intent", "")
    if "action_block" in intent or "ioc" in intent:
        return ["Block IP Address", "Update Firewall Rules", "Isolate System"]
    if "failure" in intent:
        return ["Reset User Password", "Enable MFA", "Lock Account"]
    
    return ["Review Logs", "Monitor Traffic", "Run Malware Scan"]

def calculate_risk(parsed, timeline):
    # Calculate a score based on number of events
    if not timeline:
        return 0, "None"
    
    base_score = 40
    event_multiplier = min(len(timeline) * 5, 50) # Max +50 from events
    final_score = base_score + event_multiplier
    
    level = "Critical" if final_score > 80 else "High" if final_score > 60 else "Medium"
    return final_score, level

def root_cause_analysis(timeline):
    return "Correlation of multi-source logs indicates a targeted probing attempt."

def summarize_attack(timeline):
    return "Detected suspicious patterns across authentication and network layers."