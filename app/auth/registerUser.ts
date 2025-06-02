import { createUserWithEmailAndPassword, User } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "../firebase";

interface UserData {
  [key: string]: any; // Adjust this if you know exact userData fields
}

export const registerUser = async (
  email: string, 
  password: string, 
  userData: UserData
): Promise<User> => {
  try {
    // 1. Create authentication entry
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    
    // 2. Store additional user data in Firestore
    await setDoc(doc(db, "users", userCredential.user.uid), {
      email,
      ...userData,
      createdAt: new Date(),
      lastLogin: new Date()
    });
    
    return userCredential.user;
  } catch (error) {
    throw error;
  }
};
