import { auth } from "../config/firebaseConfig";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword
} from "firebase/auth";
import { db } from "../config/firebaseConfig";
import { setDoc, doc } from "firebase/firestore";

export const registerUser = async (email, password, callSign) => {
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  const token = await cred.user.getIdToken();
  // Store callSign in Firestore under users collection
  await setDoc(doc(db, "users", cred.user.uid), {
    email,
    callSign
  });
  return {user: cred.user, token };
};

export const loginUser = async (email, password) => {
  const cred = await signInWithEmailAndPassword(auth, email, password);
  const token = await cred.user.getIdToken();
  return { user: cred.user, token };
};
