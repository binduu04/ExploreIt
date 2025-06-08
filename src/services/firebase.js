// src/config/firebase.js
import { initializeApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider, signInAnonymously, signInWithPopup, signOut } from 'firebase/auth'
import { getFirestore, collection, addDoc, getDocs, query, where, orderBy } from 'firebase/firestore'

// Replace with your Firebase config
const firebaseConfig = {
  apiKey: "your-api-key-here",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "your-app-id"
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app)
export const googleProvider = new GoogleAuthProvider()

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app)

// Auth Functions
export const signInWithGoogle = () => signInWithPopup(auth, googleProvider)
export const signInAnonymous = () => signInAnonymously(auth)
export const logOut = () => signOut(auth)

// Firestore Functions
export const saveTrip = async (tripData, userId) => {
  try {
    const docRef = await addDoc(collection(db, 'trips'), {
      ...tripData,
      userId,
      createdAt: new Date(),
      updatedAt: new Date()
    })
    return docRef.id
  } catch (error) {
    console.error('Error saving trip:', error)
    throw error
  }
}

export const getUserTrips = async (userId) => {
  try {
    const q = query(
      collection(db, 'trips'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    )
    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
  } catch (error) {
    console.error('Error fetching trips:', error)
    throw error
  }
}