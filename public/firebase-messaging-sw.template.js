importScripts('https://www.gstatic.com/firebasejs/8.10.0/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/8.10.0/firebase-messaging.js');

const firebaseConfig = {
  apiKey: '%%NEXT_PUBLIC_API_KEY%%',
  authDomain: '%%NEXT_PUBLIC_AUTH_DOMAIN%%',
  projectId: '%%NEXT_PUBLIC_PROJECT_ID%%',
  storageBucket: '%%NEXT_PUBLIC_STORAGE_BUCKET%%',
  messagingSenderId: '%%NEXT_PUBLIC_MESSAGING_SENDER_ID%%',
  appId: '%%NEXT_PUBLIC_APP_ID%%',
  measurementId: '%%NEXT_PUBLIC_MEASUREMENT_ID%%',
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log(
    '[firebase-messaging-sw.js] Received background message ',
    payload
  );
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: './logo.png',
  };
  self.registration.showNotification(notificationTitle, notificationOptions);
});