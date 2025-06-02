import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../firebase";

export const resetPassword = async (email: string): Promise<boolean> => {
  try {
    await sendPasswordResetEmail(auth, email);
    return true;
  } catch (error) {
    throw error;
  }
};
