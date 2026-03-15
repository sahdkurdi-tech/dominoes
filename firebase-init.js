const firebaseConfig = {
  apiKey: "AIzaSyBfNBvUDHWHmirlLVQ50ohUf5IZ_nh12kQ",
  authDomain: "dominoes-8b5f1.firebaseapp.com",
  projectId: "dominoes-8b5f1",
  storageBucket: "dominoes-8b5f1.firebasestorage.app",
  messagingSenderId: "735669978467",
  appId: "1:735669978467:web:9f5f2eb809ca2e5d1e7f56"
};

// چالاککردنی فایربەیس
firebase.initializeApp(firebaseConfig);

// بەکارهێنانی window.db بۆ ئەوەی لە هەموو فایلەکاندا کار بکات
window.db = firebase.firestore();

// چالاککردنی پاشەکەوتی ئۆفلاین
window.db.enablePersistence().catch((err) => {
    console.log("کێشە لە چالاککردنی ئۆفلاین:", err.code);
});