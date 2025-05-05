import json

# Load your main parks data
with open("parks_repaired.json", "r") as f:
    parks = json.load(f)

# Load the thumbnails JSON
with open("all_park_thumbnails.json", "r") as f:
    thumbnails = json.load(f)

# Map parkCode to thumbnail URL
thumbnail_map = {item["parkCode"]: item["thumbnailUrl"] for item in thumbnails}

# Add thumbnail to each park entry
for park in parks:
    code = park.get("parkCode")
    if code in thumbnail_map:
        park["thumbnailUrl"] = thumbnail_map[code]

# Write updated data to new file
with open("parks_with_thumbnails.json", "w") as f:
    json.dump(parks, f, indent=2)

print("✅ Merged thumbnails successfully into parks_with_thumbnails.json")
