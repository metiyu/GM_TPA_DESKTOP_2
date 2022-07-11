// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyDao2aqSz6ZeR7F06W2MBggJ7r5Hw2rICo",
    authDomain: "tpadekstopchello2.firebaseapp.com",
    projectId: "tpadekstopchello2",
    storageBucket: "tpadekstopchello2.appspot.com",
    messagingSenderId: "25462861224",
    appId: "1:25462861224:web:461cc5dd3a4d1a9513819d",
    measurementId: "G-VEM0214YG3"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app)
const auth = getAuth(app)

export { db, auth }