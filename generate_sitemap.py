import firebase_admin
from firebase_admin import credentials, firestore

cred = credentials.Certificate("serviceAccountKey.json")
firebase_admin.initialize_app(cred)
db = firestore.client()

with open("public/sitemap.xml", "w") as f:
    f.write('<?xml version="1.0" encoding="UTF-8"?>\n')
    f.write('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n')

    # ✅ Static routes
    static_routes = [
        "",
        "about",
        "calendar",
        "blog",
        "signup",
        "login",
        "account"
    ]
    for route in static_routes:
        f.write(f'  <url><loc>https://www.nationalparksexplorerusa.com/{route}</loc></url>\n')

    # ✅ Park slugs
    parks = db.collection("parks").stream()
    for doc in parks:
        data = doc.to_dict()
        slug = data.get("slug")
        if slug:
            f.write(f'  <url><loc>https://www.nationalparksexplorerusa.com/park/{slug}</loc></url>\n')

    # ✅ Blog slugs
    blogs = db.collection("blogs").stream()
    for doc in blogs:
        data = doc.to_dict()
        slug = data.get("slug")
        if slug:
            f.write(f'  <url><loc>https://www.nationalparksexplorerusa.com/blog/{slug}</loc></url>\n')

    f.write('</urlset>\n')

print("✅ sitemap.xml generated in public/")
