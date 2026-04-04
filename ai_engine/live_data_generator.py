import random
from datetime import datetime, timedelta

# 🧠 OUR ENTERPRISE MITRE DICTIONARY
ATTACK_VECTORS = [
    {
        "source": "firewall",
        "event_type": "port_scan",
        "status": "blocked",
        "technique": {"tactic": "Discovery", "technique": "T1046", "subtechnique": "T1046.001", "name": "Network Service Scanning"}
    },
    {
        "source": "auth",
        "event_type": "login",
        "status": "failed",
        "technique": {"tactic": "Credential Access", "technique": "T1110", "subtechnique": "T1110.003", "name": "Password Spraying"}
    },
    {
        "source": "auth",
        "event_type": "login",
        "status": "success",
        "technique": {"tactic": "Initial Access", "technique": "T1078", "subtechnique": "T1078.002", "name": "Domain Account"}
    },
    {
        "source": "cloud",
        "event_type": "data_export",
        "status": "success",
        "technique": {"tactic": "Exfiltration", "technique": "T1567", "subtechnique": "T1567.001", "name": "Exfiltration Over Web Service"}
    },
    {
        "source": "cloud",
        "event_type": "file_upload",
        "status": "success",
        "technique": {"tactic": "Command and Control", "technique": "T1105", "subtechnique": "T1105.002", "name": "Software Deployment Tools"}
    },
    {
        "source": "firewall",
        "event_type": "blocked_traffic",
        "status": "blocked",
        "technique": {"tactic": "Defense Evasion", "technique": "T1562", "subtechnique": "T1562.001", "name": "Disable or Modify Tools"}
    }
]

# 🎭 RANDOM GENERATORS FOR REALISM
def get_random_ip():
    # 70% chance it's internal, 30% chance it's external
    if random.random() > 0.3:
        return f"192.168.{random.randint(0,255)}.{random.randint(1,254)}"
    else:
        return f"203.0.{random.randint(0,255)}.{random.randint(1,254)}"

def get_random_user():
    users = ["admin", "root", "jdoe", "dev_user", "guest_user", "svc_backup", "analyst_1"]
    return random.choice(users)

def get_live_logs(count=8):
    logs = []
    
    # Pick a random "Attacker IP" to create a cohesive attack chain
    attacker_ip = get_random_ip()
    
    # Generate timestamps going back from right now
    now = datetime.now()
    
    for i in range(count):
        # Time fluctuates: events happen 1 to 15 minutes apart
        event_time = now - timedelta(minutes=random.randint(1, 15) * (count - i))
        
        # 60% chance the event is part of the main attack chain, 40% chance it's random background noise
        if random.random() > 0.4:
            ip = attacker_ip
            user = "admin" if random.random() > 0.5 else get_random_user()
        else:
            ip = get_random_ip()
            user = get_random_user()

        # Pick a random attack vector
        vector = random.choice(ATTACK_VECTORS)
        
        # If it's a success login, clear the user, otherwise keep it
        final_user = user if vector["event_type"] != "blocked_traffic" else ""

        log_entry = {
            "timestamp": event_time.strftime("%Y-%m-%d %H:%M:%S"),
            "source": vector["source"],
            "event_type": vector["event_type"],
            "status": vector["status"],
            "ip": ip,
            "user": final_user,
            "technique": vector["technique"]
        }
        
        logs.append(log_entry)
        
    # Sort them chronologically (oldest to newest) so timeline.py works perfectly
    logs.sort(key=lambda x: x["timestamp"])
    
    return logs