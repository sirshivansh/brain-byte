import random
from datetime import datetime, timedelta

# 🎯 REALISTIC ATTACK SCENARIOS (Logical Escalation Paths)
SCENARIOS = [
    {
        "name": "Brute Force to Exfiltration",
        "steps": [
            {"source": "firewall", "event_type": "port_scan", "status": "blocked", "technique": {"tactic": "Discovery", "technique": "T1046", "subtechnique": "T1046.001", "name": "Network Service Scanning"}},
            {"source": "auth", "event_type": "login", "status": "failed", "technique": {"tactic": "Credential Access", "technique": "T1110", "subtechnique": "T1110.003", "name": "Password Spraying"}},
            {"source": "auth", "event_type": "login", "status": "failed", "technique": {"tactic": "Credential Access", "technique": "T1110", "subtechnique": "T1110.001", "name": "Brute Force"}},
            {"source": "auth", "event_type": "login", "status": "success", "technique": {"tactic": "Initial Access", "technique": "T1078", "subtechnique": "T1078.002", "name": "Domain Account"}},
            {"source": "cloud", "event_type": "data_export", "status": "success", "technique": {"tactic": "Exfiltration", "technique": "T1567", "subtechnique": "T1567.001", "name": "Exfiltration Over Web Service"}}
        ]
    },
    {
        "name": "Insider Threat / Malware Staging",
        "steps": [
            {"source": "auth", "event_type": "login", "status": "success", "technique": {"tactic": "Initial Access", "technique": "T1078", "subtechnique": "T1078.001", "name": "Default Accounts"}},
            {"source": "cloud", "event_type": "file_upload", "status": "success", "technique": {"tactic": "Command and Control", "technique": "T1105", "subtechnique": "T1105.002", "name": "Software Deployment Tools"}},
            {"source": "firewall", "event_type": "blocked_traffic", "status": "blocked", "technique": {"tactic": "Defense Evasion", "technique": "T1562", "subtechnique": "T1562.001", "name": "Disable or Modify Tools"}}
        ]
    }
]

NOISE_EVENTS = [
    {"source": "auth", "event_type": "login", "status": "success", "technique": {"tactic": "N/A", "technique": "N/A", "subtechnique": "N/A", "name": "Normal User Activity"}},
    {"source": "firewall", "event_type": "blocked_traffic", "status": "blocked", "technique": {"tactic": "N/A", "technique": "N/A", "subtechnique": "N/A", "name": "Routine Firewall Block"}}
]

# 🛡️ THE FIX: Added is_internal argument safely
def get_random_ip(is_internal=True):
    if is_internal:
        return f"10.{random.randint(0,255)}.{random.randint(0,255)}.{random.randint(1,254)}"
    return f"203.0.{random.randint(0,255)}.{random.randint(1,254)}"

def get_live_logs(count=8, target_ip=None):
    logs = []
    now = datetime.now()
    
    # 1. Pick a random, logical attack scenario
    scenario = random.choice(SCENARIOS)
    
    # 2. Generate a random Attacker IP and Victim for THIS session
    # If a specific target_ip was provided by NLP, use that! Otherwise make one up.
    attacker_ip = target_ip if target_ip else get_random_ip(is_internal=False)
    victim_user = random.choice(["admin", "jdoe", "svc_backup", "analyst_1"])
    
    # 3. Build the ATTACK CHAIN logs
    base_time = now - timedelta(minutes=random.randint(10, 30))
    
    for i, step in enumerate(scenario["steps"]):
        event_time = base_time + timedelta(minutes=random.randint(1, 5) * i)
        
        log_entry = {
            "timestamp": event_time.strftime("%Y-%m-%d %H:%M:%S"),
            "source": step["source"],
            "event_type": step["event_type"],
            "status": step["status"],
            "ip": attacker_ip,
            "user": victim_user if step["source"] == "auth" else "",
            "technique": step["technique"]
        }
        logs.append(log_entry)

    # 4. INJECT REALISTIC BACKGROUND NOISE
    for _ in range(random.randint(2, 3)):
        noise = random.choice(NOISE_EVENTS)
        noise_time = now - timedelta(minutes=random.randint(5, 45))
        
        logs.append({
            "timestamp": noise_time.strftime("%Y-%m-%d %H:%M:%S"),
            "source": noise["source"],
            "event_type": noise["event_type"],
            "status": noise["status"],
            "ip": get_random_ip(is_internal=True),
            "user": random.choice(["guest_user", "dev_user", "hr_manager"]),
            "technique": noise["technique"]
        })

    # 5. Sort chronologically
    logs.sort(key=lambda x: x["timestamp"])
    
    return logs