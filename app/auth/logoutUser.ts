import { signOut } from "firebase/auth";
import { auth } from "../firebase";

export const logoutUser = async (): Promise<boolean> => {
  try {
    await signOut(auth);
    return true;
  } catch (error) {
    throw error;
  }
};
