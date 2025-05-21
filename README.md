# 🌲 National Parks Explorer

A responsive React + Firebase app to explore U.S. National Parks, view seasonal tips, plan visits, and discover nearby food and lodging. Includes map views, weather forecasts, calendar events, NPS alerts, favorites, and more.

---

## 🚀 Features

- 🗺️ Interactive Leaflet map with park markers  
- 🔍 Search and paginate through all parks  
- ❤️ Favorite parks (saved in Firebase or localStorage)  
- 📅 Calendar view with NPS event heatmap & filtering  
- 🔥 Favorite and save events (synced to Firestore)  
- 🕒 Show last event cache time with daily counts  
- 🌤️ 3-day weather forecasts for each park  
- 📢 Live NPS alerts and seasonal visit tips  
- 🍽️ Recommended nearby food and hotels  
- 📤 Social media sharing support  
- 🔥 Firebase Functions caching to prevent API overuse  
- 🧭 Dynamic themes and mobile-responsive design  
- ✍️ Blog system with slugs, live preview, and rich formatting  
- 🔔 Push notifications (welcome + preferences)  
- 🔐 Admin panel with blog/user/event/media moderation  
- 🌐 SEO support with sitemap, robots.txt, and structured data  

---

## 📁 File Structure

```
src/
├── App.jsx
├── firebase.js
├── index.css
├── main.jsx
├── pages/
│   ├── Home.jsx
│   ├── Favorites.jsx
│   ├── ParkDetails.jsx
│   ├── MapPage.jsx
│   ├── CalendarView.jsx
│   ├── Blog.jsx
│   ├── BlogPost.jsx
│   └── About.jsx
├── admin/
│   ├── AdminPage.jsx
│   ├── AdminBlogEditor.jsx
│   ├── EditBlog.jsx
│   ├── EventsManager.jsx
│   └── UserManagement.jsx
├── components/
│   ├── Layout.jsx
│   ├── ParkCardFlip.jsx
│   ├── EventHeatmap.jsx
│   ├── ShareButtons.jsx
│   └── SkeletonLoader.jsx
├── context/
│   ├── AuthContext.jsx
│   └── ToastContext.jsx
functions/
├── index.js (Cloud Functions incl. sendWelcomePush with CORS fix)
scripts/
├── generate_sitemap.py
├── backfill_blog_slugs.py
public/
├── sitemap.xml
├── robots.txt
```

---

## 📚 File Descriptions

| File | Description |
|------|-------------|
| **App.jsx** | Main routing + layout structure |
| **firebase.js** | Firebase config & services (Auth, Firestore, Messaging) |
| **Home.jsx** | Map, park cards, search, filters, flip UI |
| **ParkDetails.jsx** | Full park info, tips, alerts, weather, reviews |
| **Blog.jsx** | Blog listing from Firestore |
| **BlogPost.jsx** | SEO-friendly blog viewer via slug |
| **AdminBlogEditor.jsx** | WYSIWYG blog creation with image upload |
| **EditBlog.jsx** | Edit existing blog post |
| **UserManagement.jsx** | Admin view to manage users |
| **CalendarView.jsx** | NPS event calendar + filters |
| **MapPage.jsx** | Full screen map of parks |
| **ShareButtons.jsx** | Social share component |
| **SkeletonLoader.jsx** | Reusable loading skeleton |
| **generate_sitemap.py** | Builds sitemap with park/blog slugs |
| **backfill_blog_slugs.py** | Assigns slugs to existing blog posts |

---

## 🔐 Firebase Setup

1. Create Firebase project  
2. Enable Firestore, Auth, Cloud Messaging  
3. Add config to `.env` and `firebase.js`  
4. Add your domain in Firebase Authentication → Authorized Domains  
5. Upload parks to Firestore  
6. Deploy Cloud Functions

```js
const firebaseConfig = {
  apiKey: "...",
  authDomain: "...",
  projectId: "...",
  messagingSenderId: "...",
  appId: "...",
};
```

---

## ⚙️ Firebase Functions

| Function | Purpose |
|---------|---------|
| **sendWelcomePush** | Sends a push notification after signup (CORS fixed) |
| **cacheNPSEvents** | (Optional) caches events from NPS API |

---

## 🧰 Dev Commands

```bash
npm install         # install dependencies
npm run dev         # start Vite dev server
npm run build       # production build
firebase deploy     # deploy functions & Firestore
```

---

## 📈 SEO Optimizations

- `/sitemap.xml` with park + blog slugs
- `/robots.txt` for crawlers
- JSON-LD structured data for blogs and parks
- Optimized mobile-first UI
- Firebase Hosting OR Vercel + Google Search Console verified

---

## 🔗 Live Demo

🌐 [https://www.nationalparksexplorerusa.com](https://www.nationalparksexplorerusa.com)

---

## 🙌 Contributing

Pull requests and feedback welcome. Made with ❤️ under starry skies.

