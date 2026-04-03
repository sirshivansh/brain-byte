from nlp_engine import parse_query
from query_builder import build_query

query = "Show failed logins from yesterday in India"

parsed = parse_query(query)
mongo_query = build_query(parsed)

print("Parsed:", parsed)
print("Mongo Query:", mongo_query)
