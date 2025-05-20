import firebase_admin
from firebase_admin import credentials, firestore

# Initialize Firestore
cred = credentials.Certificate("serviceAccountKey.json")  # 🔑 Your Firebase Admin SDK key
firebase_admin.initialize_app(cred)
db = firestore.client()

# Sample fallback values
default_entry_fee = "$35"
default_hours = "24/7"
default_highlight = "Scenic landscapes, hiking trails, and wildlife"

# Fetch and update all parks
parks_ref = db.collection("parks")
parks = parks_ref.stream()

for doc in parks:
    park = doc.to_dict()
    update_data = {}

    if 'entryFee' not in park:
        update_data['entryFee'] = default_entry_fee

    if 'hours' not in park:
        update_data['hours'] = default_hours

    if 'highlight' not in park:
        update_data['highlight'] = default_highlight

    if update_data:
        print(f"Updating {park.get('name')}...")
        doc.reference.update(update_data)

print("✅ All parks updated with entryFee, hours, and highlight.")
