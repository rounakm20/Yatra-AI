import { initializeApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth'

const firebaseConfig = {
  apiKey: "AIzaSyAWbWoeTMMcn4ElJkefglBLIciJ431pLX4",
  authDomain: "yatra-ai-9c996.firebaseapp.com",
  projectId: "yatra-ai-9c996",
  storageBucket: "yatra-ai-9c996.firebasestorage.app",
  messagingSenderId: "313094099246",
  appId: "1:313094099246:web:106670687028df916a6abf",
  measurementId: "G-N8KZX14HKE"
}

const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const googleProvider = new GoogleAuthProvider()

export async function signInWithGoogle() {
  const result = await signInWithPopup(auth, googleProvider)
  const user = result.user
  return {
    googleId: user.uid,
    email: user.email,
    name: user.displayName,
    avatar: user.photoURL,
  }
}