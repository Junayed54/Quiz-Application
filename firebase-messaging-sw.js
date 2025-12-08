// Service worker must use importScripts (UMD version, not ES module)
importScripts('https://www.gstatic.com/firebasejs/12.2.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/12.2.1/firebase-messaging-compat.js');

// Initialize Firebase inside SW
firebase.initializeApp({
  apiKey: "AIzaSyCpnkyTVh76T6aIdpi_LpxIiV47Jw9V7Hg",
  authDomain: "jobs-academy.firebaseapp.com",
  projectId: "jobs-academy",
  storageBucket: "jobs-academy.firebasestorage.app",
  messagingSenderId: "524525708923",
  appId: "1:524525708923:web:09f0ba0e9eae09267ea4de",
  measurementId: "G-11T4YEDB7B"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  // console.log('[firebase-messaging-sw.js] Received background message ', payload);
  // const notificationTitle = payload.data.title;
  // const { body, icon, image, url } = payload.data;

  // const notificationOptions = {
  //   body: body,
  //   icon: icon,
  //   image: image,

  //   data: {
  //     url: url  // Store the link for click handling
  //   }
  // }
  // self.registration.showNotification(notificationTitle, notificationOptions);

  self.registration.showNotification(payload.data.title, {
    body: payload.data.body,
    data: { url: payload.data.url }
  });

});


self.addEventListener('notificationclick', (event) => {
  // event.notification.close();
  const targetUrl = event.notification.data?.url;
  event.notification.close();
  event.waitUntil(clients.openWindow(url));
  // event.waitUntil(
  //   clients.matchAll({ type: 'window', includeUncontrolled: true }).then(windowClients => {
  //     for (let client of windowClients) {
  //       if (client.url === targetUrl && 'focus' in client) {
  //         return client.focus();
  //       }
  //     }
  //     if (clients.openWindow && targetUrl) {
  //       return clients.openWindow(targetUrl);
  //     }
  //   })
  // );
});