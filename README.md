# 🌲 National Parks Explorer

A responsive React + Firebase app to explore U.S. National Parks, view seasonal tips, plan visits, and discover nearby food and lodging. Includes map views, weather forecasts, calendar events, NPS alerts, favorites, and more.

---

## 🚀 Features

- 🗺️ Interactive Leaflet map with park markers  
- 🔍 Search and paginate through all parks  
- ❤️ Favorite parks (saved in Firebase or localStorage)  
- 📆 Calendar view with NPS event heatmap & filtering  
- 🌤️ 7-day weather forecasts for each park  
- 📢 Live NPS alerts and seasonal visit tips  
- 🍽️ Recommended nearby food and hotels  
- 📤 Social media sharing support  
- 🔥 Firebase Functions caching to prevent API overuse  
- 🧭 Dynamic themes and mobile-responsive design  

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
│   ├── ParkDetail.jsx
│   ├── MapPage.jsx
│   └── CalendarView.jsx
├── components/
│   ├── Layout.jsx
│   └── EventHeatmap.jsx
```

---

## 📚 File Descriptions

| File | Description |
|------|-------------|
| **App.jsx** | Core routes + park & favorites logic synced with Firebase |
| **firebase.js** | Firebase and Firestore config |
| **main.jsx** | App root mount point |
| **index.css** | Tailwind CSS import and base styles |
| **Home.jsx** | Map view, search, pagination, and favorites toggle |
| **Favorites.jsx** | Park cards filtered from user’s saved favorites |
| **ParkDetail.jsx** | Park metadata, alerts, weather, food, lodging |
| **MapPage.jsx** | Dedicated full-screen interactive map |
| **CalendarView.jsx** | Monthly NPS event heatmap with filters |
| **EventHeatmap.jsx** | Reusable heatmap component for event overview |
| **Layout.jsx** | Common layout with navigation/header/footer |

---

## 🔐 Firebase Setup

1. Create a Firebase project  
2. Enable Firestore and Firebase Auth  
3. Upload `parks` collection & deploy functions  
4. Set Firebase config in `firebase.js`

```js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "YOUR_KEY",
  authDomain: "YOUR_APP.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  ...
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
```

---

## ⚙️ Firebase Functions

| Function | Purpose |
|---------|---------|
| **getParkEvents** | Proxy for real-time NPS event API requests |
| **cacheNPSEvents** | Caches all events into Firestore (manual trigger) |

---

## 🧰 Dev Commands

```bash
npm install         # install dependencies
npm run dev         # start dev server
npm run build       # production build
firebase deploy     # deploy functions and Firestore rules
```

---

## 🙌 Contributing

Contributions welcome! Feel free to fork, improve, and submit PRs.

---

## 🔗 Live Demo

[https://national-parks-explorer.vercel.app](https://national-parks-explorer.vercel.app)
