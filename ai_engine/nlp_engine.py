import spacy

nlp = spacy.load("en_core_web_sm")

def parse_query(user_query):
    doc = nlp(user_query)

    data = {
        "date": None,
        "location": None,
        "actions": []
    }

    # Extract DATE and LOCATION
    for ent in doc.ents:
        if ent.label_ == "DATE":
            data["date"] = ent.text
        elif ent.label_ == "GPE":
            data["location"] = ent.text

    # Extract ACTIONS
    for token in doc:
        if token.lemma_ in ["login", "fail", "export"]:
            data["actions"].append(token.lemma_)

    return data