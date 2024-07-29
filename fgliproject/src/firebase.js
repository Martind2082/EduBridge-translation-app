// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {getFirestore} from 'firebase/firestore';
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAbcQ_uK6j7M_VXTqP9hLUFt3gvh3vHcJQ",
  authDomain: "fgli-project.firebaseapp.com",
  projectId: "fgli-project",
  storageBucket: "fgli-project.appspot.com",
  messagingSenderId: "216318208952",
  appId: "1:216318208952:web:8e76cb2a23b37dc16c3d4d"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);