from datetime import datetime, timedelta

def build_query(parsed_data):
    query = {}

    # ACTION → event_type
    if "login" in parsed_data["actions"]:
        query["event_type"] = "login"

    # FAIL → status
    if "fail" in parsed_data["actions"]:
        query["status"] = "failed"

    # LOCATION
    if parsed_data["location"]:
        query["location"] = parsed_data["location"]

    # DATE → timestamp range
    if parsed_data["date"] == "yesterday":
        yesterday = datetime.now() - timedelta(days=1)

        start = yesterday.replace(hour=0, minute=0, second=0)
        end = yesterday.replace(hour=23, minute=59, second=59)

        query["timestamp"] = {
            "$gte": start,
            "$lte": end
        }

    return query