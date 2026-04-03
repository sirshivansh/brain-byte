from timeline import build_timeline

logs = [
    {"timestamp": 1, "event_type": "login", "status": "failed"},
    {"timestamp": 2, "event_type": "login", "status": "success"},
    {"timestamp": 3, "event_type": "data_export"}
]

timeline = build_timeline(logs)

print("=== TIMELINE OUTPUT ===")

for step in timeline:
    print(step)