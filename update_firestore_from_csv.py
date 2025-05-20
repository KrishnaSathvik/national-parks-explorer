
import csv
import firebase_admin
from firebase_admin import credentials, firestore

# Step 1: Initialize Firebase
cred = credentials.Certificate("serviceAccountKey.json")  # Replace with your actual file
firebase_admin.initialize_app(cred)
db = firestore.client()

# Step 2: Load the CSV
with open("parks_update_full.csv", newline='', encoding='utf-8') as csvfile:
    reader = csv.DictReader(csvfile)
    for row in reader:
        park_id = row["id"]
        update_data = {
            "entryFee": row["entryFee"],
            "hours": row["hours"],
            "highlight": row["highlight"]
        }

        # Step 3: Update Firestore document
        docs = db.collection("parks").where("parkCode", "==", park_id).stream()
        found = False
        for doc in docs:
            doc.reference.update(update_data)
            print(f"✅ Updated {park_id}")
            found = True

        if not found:
            print(f"❌ Park ID not found: {park_id}")

