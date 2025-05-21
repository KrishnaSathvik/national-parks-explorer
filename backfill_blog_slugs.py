import firebase_admin
from firebase_admin import credentials, firestore
import re

# ✅ Initialize Firebase
cred = credentials.Certificate("serviceAccountKey.json")
firebase_admin.initialize_app(cred)
db = firestore.client()

def slugify(title):
    return (
        title.lower()
        .strip()
        .replace("'", "")
        .replace('"', "")
        .replace("&", "and")
        .replace("?", "")
        .replace("/", "-")
        .replace(",", "")
        .replace(".", "")
        .replace(":", "")
        .replace(";", "")
        .replace("(", "")
        .replace(")", "")
        .replace("[", "")
        .replace("]", "")
        .replace("!", "")
        .replace("@", "")
        .replace("#", "")
        .replace("$", "")
        .replace("%", "")
        .replace("^", "")
        .replace("*", "")
        .replace("+", "")
        .replace("=", "")
        .replace("~", "")
        .replace("`", "")
        .replace("\\", "")
        .replace("|", "")
        .replace("<", "")
        .replace(">", "")
        .replace(" ", "-")
        [:100]
    )

def backfill_blog_slugs():
    blogs_ref = db.collection("blogs")
    blogs = blogs_ref.stream()

    count = 0
    for doc in blogs:
        data = doc.to_dict()
        blog_id = doc.id

        # Skip if slug already exists
        if "slug" in data:
            continue

        title = data.get("title", "")
        if not title:
            print(f"⚠️ Skipping {blog_id}: no title found.")
            continue

        slug = slugify(title)
        db.collection("blogs").document(blog_id).update({"slug": slug})
        print(f"✅ Updated blog {blog_id} with slug: {slug}")
        count += 1

    print(f"🎉 Backfilled slugs for {count} blog posts.")

if __name__ == "__main__":
    backfill_blog_slugs()
