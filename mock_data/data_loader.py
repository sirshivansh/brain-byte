import json

def load_logs():
    with open("../mock_data/auth.json") as f:
        auth = json.load(f)

    with open("../mock_data/firewall.json") as f:
        firewall = json.load(f)

    with open("../mock_data/cloud.json") as f:
        cloud = json.load(f)

    # Combine all logs
    all_logs = auth + firewall + cloud

    return all_logs