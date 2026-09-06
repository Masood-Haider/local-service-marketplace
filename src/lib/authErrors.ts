export function getFirebaseAuthErrorMessage(error: any): string {
  if (!error) return "An unexpected error occurred. Please try again."

  const code = error.code || ""

  switch (code) {
    case "auth/email-already-in-use":
      return "This email address is already registered. Please sign in instead."
    case "auth/invalid-email":
      return "The email address is invalid. Please check the format."
    case "auth/operation-not-allowed":
      return "Email/password or Google sign-in is not enabled in Firebase Console. Please verify provider settings."
    case "auth/weak-password":
      return "Your password is too weak. Please use at least 6 characters."
    case "auth/user-disabled":
      return "This account has been disabled by an administrator."
    case "auth/user-not-found":
    case "auth/wrong-password":
    case "auth/invalid-credential":
      return "Invalid email or password. Please verify your credentials."
    case "auth/network-request-failed":
      return "Network error. Please check your internet connection and try again."
    case "auth/too-many-requests":
      return "Too many unsuccessful attempts. Access temporarily restricted. Try again later."
    case "auth/popup-closed-by-user":
      return "The Google sign-in popup was closed before completing. Please try again."
    case "auth/cancelled-popup-request":
      return "Sign-in popup was cancelled because another request was made."
    case "auth/popup-blocked":
      return "The Google sign-in popup was blocked by your browser. Please enable popups for this site."
    case "auth/account-exists-with-different-credential":
      return "An account already exists with this email using a different sign-in method. Please sign in with your original method."
    default:
      return error.message || "Authentication failed. Please try again."
  }
}
