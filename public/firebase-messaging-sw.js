importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyCm1ikSjG9fpuiR5ubi0aPcm4c7mD6L1zg",
    authDomain: "national-parks-explorer-7bc55.firebaseapp.com",
    projectId: "national-parks-explorer-7bc55",
    storageBucket: "national-parks-explorer-7bc55.firebasestorage.app",
    messagingSenderId: "683155277657",
    appId: "1:683155277657:web:edafbd29d36fb7774fee48",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('Received background message: ', payload);
  self.registration.showNotification(payload.notification.title, {
    body: payload.notification.body,
    icon: '/icons/icon-192x192.png',
  });
});
