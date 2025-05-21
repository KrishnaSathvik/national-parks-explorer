import firebase_admin
from firebase_admin import credentials, firestore
import re

# ✅ Load service account key
cred = credentials.Certificate("serviceAccountKey.json")
firebase_admin.initialize_app(cred)

db = firestore.client()

# 🔤 Slugify function
def slugify(name):
    slug = name.lower()
    slug = re.sub(r'[^a-z0-9\s-]', '', slug)
    slug = re.sub(r'[\s]+', '-', slug)
    return slug[:100]

# 🚀 Update slugs for all parks
def update_park_slugs():
    parks_ref = db.collection("parks")
    docs = parks_ref.stream()

    count = 0
    for doc in docs:
        data = doc.to_dict()
        name = data.get("name", "")
        slug = slugify(name)

        print(f"✅ Updating {name} → {slug}")

        parks_ref.document(doc.id).update({"slug": slug})
        count += 1

    print(f"🎉 Successfully updated {count} parks with slugs.")

if __name__ == "__main__":
    update_park_slugs()
