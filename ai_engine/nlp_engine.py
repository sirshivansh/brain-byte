print("🔥 NLP ENGINE LOADED")

import spacy
import re # 🟢 Moved to the top to keep things clean

nlp = spacy.load("en_core_web_sm")

def parse_query(text):
    print("👉 parse_query input:", text)

    # HARD SAFETY
    if not text or not isinstance(text, str):
        return {"intent": "unknown", "text": "", "entities": []}

    text = text.strip()

    if text == "":
        return {"intent": "unknown", "text": "", "entities": []}

    try:
        doc = nlp(text)
    except Exception as e:
        print("❌ NLP ERROR:", e)
        return {"intent": "unknown", "text": text, "entities": []}

    # 🧠 SMART EXTRACTION: Grab Spacy entities
    extracted_entities = []
    for ent in doc.ents:
        extracted_entities.append({"type": ent.label_, "value": ent.text})

    # 🧠 SMART FALLBACK: Regex to catch raw IP addresses & fix SpaCy mistakes!
    ips = re.findall(r'\b(?:\d{1,3}\.){3}\d{1,3}\b', text)
    
    existing_values = {e["value"] for e in extracted_entities}
    
    for ip in ips:
        if ip not in existing_values:
            extracted_entities.append({"type": "IP_ADDRESS", "value": ip})
        else:
            for ent in extracted_entities:
                if ent["value"] == ip:
                    ent["type"] = "IP_ADDRESS"

    # 🛑 PREP FOR SAFETY CHECKS
    text_lower = text.lower()

    # 🛑 SAFETY GUARD 1: Prompt Injection Detection
    injection_keywords = ["ignore", "system", "prompt", "previous instructions", "forget", "roleplay"]
    if any(kw in text_lower for kw in injection_keywords):
        print("🚨 BLOCKED PROMPT INJECTION ATTEMPT")
        return {"intent": "injection_attempt", "text": text, "entities": []}

    # 🛑 SAFETY GUARD 2: Hallucination Prevention (Out-of-Domain check)
    security_keywords = ["login", "ip", "port", "attack", "failed", "block", "firewall", "export", "data", "user", "investigate", "what", "show"]
    has_security_context = any(kw in text_lower for kw in security_keywords)
    
    if not has_security_context and not ips:
        print("🚨 BLOCKED OUT-OF-DOMAIN QUERY")
        return {"intent": "out_of_domain", "text": text, "entities": []}

    # 🧠 INTENT DETECTION: Figure out what the user wants
    intent = "general"
    
    if "failed" in text_lower or "brute" in text_lower:
        intent = "investigate_failure"
    elif "export" in text_lower or "data" in text_lower:
        intent = "investigate_exfiltration"
    elif "block" in text_lower or "ban" in text_lower:
        intent = "action_block"
    elif "timeline" in text_lower or "show" in text_lower:
        intent = "view_timeline"
    elif "what" in text_lower or "investigate" in text_lower or "doing" in text_lower:
        intent = "investigate_ioc"

    print("🧠 EXTRACTED ENTITIES:", extracted_entities)
    print("🎯 DETECTED INTENT:", intent)

    return {
        "intent": intent,
        "text": text,
        "entities": extracted_entities
    }