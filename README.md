# 🌲 National Parks Explorer

A responsive React + Firebase app to explore U.S. National Parks, view seasonal tips, plan visits, and discover nearby food and lodging. Includes features like map views, weather forecasts, NPS alerts, favorites, and social sharing.

---

## 🚀 Features

- 🗺️ Interactive Leaflet map with park markers  
- 🔍 Search and paginate through all parks  
- ❤️ Favorite parks (saved in localStorage)  
- 📆 Seasonal visit tips and weather forecast  
- 🍽️ Recommended nearby food and hotels  
- 📤 Social media sharing support  
- 🧭 Dynamic background themes per park  
- 📱 Mobile-responsive design

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
│   └── MapPage.jsx
├── components/
│   └── Layout.jsx
```

---

## 📚 File Descriptions

| File | Description |
|------|-------------|
| **App.jsx** | Sets up React Router and routes for `/`, `/favorites`, `/park/:id`, and `/map`. Also manages global `parks` and `favorites` state. |
| **firebase.js** | Firebase config & Firestore initialization (used to load parks data). |
| **main.jsx** | App entry point. Wraps the app in `<BrowserRouter>` and renders it to DOM. |
| **index.css** | Tailwind CSS import and base styles. |
| **Home.jsx** | Home page showing map, park cards, search bar, and pagination. Handles adding/removing favorites. |
| **Favorites.jsx** | Shows a grid of favorited parks pulled from localStorage. |
| **ParkDetail.jsx** | Displays individual park info: alerts, weather, best seasons, places to visit, nearby foods, hotels, and share buttons. |
| **MapPage.jsx** | Optional separate page for a full map view (if used). |
| **Layout.jsx** | Shared layout wrapper for all pages — header/footer/global font setup. |

---

## 🔐 Firebase Setup

1. Create a Firebase project
2. Enable Firestore
3. Upload your `parks` collection
4. Add your Firebase config to `firebase.js`

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

## 🧰 Dev Commands

```bash
npm install         # install dependencies
npm run dev         # start dev server
npm run build       # production build
```

---

## 🙌 Contributing

Contributions welcome! Feel free to fork and submit pull requests.