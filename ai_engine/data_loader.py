import json
import os

def load_logs():
    base_path = os.path.dirname(__file__)

    auth_path = os.path.join(base_path, "../mock_data/auth.json")
    firewall_path = os.path.join(base_path, "../mock_data/firewall.json")
    cloud_path = os.path.join(base_path, "../mock_data/cloud.json")

    with open(auth_path) as f:
        auth = json.load(f)

    with open(firewall_path) as f:
        firewall = json.load(f)

    with open(cloud_path) as f:
        cloud = json.load(f)

    return auth + firewall + cloud