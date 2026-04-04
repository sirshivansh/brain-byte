import requests
import time
import random
from datetime import datetime

NODE_URL = "http://localhost:5000/api/logs"

# 🚨 ATTACKER ACTIONS (What a real hacker does)
ATTACK_EVENTS = [
    {"source": "firewall", "event_type": "port_scan", "status": "blocked", "technique": "T1046.001"},
    {"source": "auth", "event_type": "login", "status": "failed", "technique": "T1110.003"},
    {"source": "auth", "event_type": "login", "status": "failed", "technique": "T1110.001"},
    {"source": "auth", "event_type": "login", "status": "success", "technique": "T1078.002"}, # The breach
    {"source": "cloud", "event_type": "file_upload", "status": "success", "technique": "T1105.002"}, # Malware drop
    {"source": "cloud", "event_type": "data_export", "status": "success", "technique": "T1567.001"}, # Exfiltration
    {"source": "firewall", "event_type": "blocked_traffic", "status": "blocked", "technique": "T1562.001"} # C2 blocked
]

# 💼 BENIGN OFFICE NOISE (What normal employees do)
BENIGN_EVENTS = [
    {"source": "auth", "event_type": "login", "status": "success", "technique": "Normal Activity"},
    {"source": "auth", "event_type": "login", "status": "failed", "technique": "Typo / Forgot Password"}, # Just a mistake
    {"source": "firewall", "event_type": "blocked_traffic", "status": "blocked", "technique": "Ad-blocker / Geo-block"},
    {"source": "cloud", "event_type": "file_access", "status": "success", "technique": "Routine Document Read"},
    {"source": "firewall", "event_type": "allowed_traffic", "status": "allowed", "technique": "Standard Outbound HTTPS"}
]

def get_random_ip():
    return f"192.168.{random.randint(0,255)}.{random.randint(1,254)}"

print("🚀 STARTING CONTINUOUS LOG STREAMER...")
print("📡 Simulating live network traffic. Press Ctrl+C to stop.\n")

# 🎯 Pick ONE specific IP to act as our persistent attacker
ATTACKER_IP = "203.0.113.42" 

log_count = 0

try:
    while True:
        # 35% chance it's the attacker, 65% chance it's normal office background noise
        if random.random() < 0.35:
            ip = ATTACKER_IP
            vector = random.choice(ATTACK_EVENTS) 
        else:
            ip = get_random_ip()
            vector = random.choice(BENIGN_EVENTS) # Pick from a variety of normal tasks
        
        payload = {
            "source": vector["source"],
            "event": f"{vector['event_type']} - {vector['status']}",
            "ip_address": ip,
            "severity": "Medium",
            "mitre_attack": vector["technique"]
        }

        try:
            response = requests.post(NODE_URL, json=payload, timeout=2)
            node_reply = response.json()
            log_count += 1
            
            alert = node_reply.get('memory_alert', '')
            
            # Make the attacker logs stand out in your terminal
            if ip == ATTACKER_IP:
                print(f"🚨 [{datetime.now().strftime('%H:%M:%S')}] {vector['event_type'].upper()} from {ip} | {alert}")
            else:
                print(f"💬 [{datetime.now().strftime('%H:%M:%S')}] {vector['event_type']} from {ip}")
            
        except requests.exceptions.ConnectionError:
            print("❌ ERROR: Is Node.js server running on port 5000?")
            break

        time.sleep(random.uniform(1.5, 3.5)) # Slightly faster stream to show variety quickly

except KeyboardInterrupt:
    print(f"\n🛑 Streamer stopped. Total logs pushed to database: {log_count}")