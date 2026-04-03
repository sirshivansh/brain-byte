from nlp_engine import parse_query

query = "Show failed logins from yesterday in India"

result = parse_query(query)

print(result)