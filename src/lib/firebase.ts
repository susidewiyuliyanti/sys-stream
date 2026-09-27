import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  sendPasswordResetEmail,
  updateProfile,
  setPersistence,
  browserLocalPersistence,
  UserCredential,
  User
} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

// Inisialisasi Firebase App
export const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Inisialisasi Firestore dengan database key resmi yang sama dengan admin
export const db = getFirestore(app, "ai-studio-streammasterinte-ecab4a17-e81c-4ff1-9972-d570bcf4652c");

// Inisialisasi Firebase Auth dengan Browser Local Persistence agar sesi awet
export const auth = getAuth(app);
try {
  setPersistence(auth, browserLocalPersistence).catch((err) => {
    console.warn('Set persistence warning:', err);
  });
} catch (e) {
  console.warn('Could not initialize local persistence:', e);
}

// Inisialisasi Google Auth Provider
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

/**
 * Login dengan Google menggunakan Popup (Metode paling stabil di Vercel & Desktop)
 */
export const loginWithGooglePopup = async (): Promise<UserCredential> => {
  return await signInWithPopup(auth, googleProvider);
};

/**
 * Login dengan Google menggunakan Redirect (Alternatif jika popup diblokir oleh browser HP)
 */
export const loginWithGoogleRedirect = async (): Promise<void> => {
  return await signInWithRedirect(auth, googleProvider);
};

/**
 * Smart Google Login: Coba Popup terlebih dahulu, jika popup diblokir browser, fallback ke Redirect
 */
export const loginWithGoogle = async (): Promise<UserCredential | void> => {
  try {
    return await signInWithPopup(auth, googleProvider);
  } catch (err: any) {
    const errCode = err?.code || '';
    if (errCode === 'auth/popup-blocked' || errCode === 'auth/cancelled-popup-request') {
      console.warn('Popup login diblokir browser, mengalihkan ke mode Redirect...');
      return await signInWithRedirect(auth, googleProvider);
    }
    throw err;
  }
};

/**
 * Memeriksa dan mengambil hasil login redirect saat pengguna kembali dari halaman Google
 */
export const getLoginResult = async (): Promise<UserCredential | null> => {
  try {
    return await getRedirectResult(auth);
  } catch (err) {
    console.warn('getRedirectResult caught error:', err);
    throw err;
  }
};

/**
 * Login manual dengan Email dan Kata Sandi
 */
export const loginWithEmail = async (email: string, password: string): Promise<UserCredential> => {
  const cleanEmail = email.trim().toLowerCase();
  return await signInWithEmailAndPassword(auth, cleanEmail, password);
};

/**
 * Registrasi akun baru dengan Email dan Kata Sandi, serta otomatis mengirimkan link verifikasi email
 */
export const registerWithEmail = async (
  email: string,
  password: string,
  displayName?: string
): Promise<{ credential: UserCredential; verificationSent: boolean }> => {
  const cleanEmail = email.trim().toLowerCase();
  const credential = await createUserWithEmailAndPassword(auth, cleanEmail, password);

  // Update Nama Profil jika diisi
  if (displayName && credential.user) {
    try {
      await updateProfile(credential.user, { displayName: displayName.trim() });
    } catch (profileErr) {
      console.warn('Update displayName warning:', profileErr);
    }
  }

  // Kirim email verifikasi resmi Firebase
  let verificationSent = false;
  if (credential.user) {
    try {
      await sendEmailVerification(credential.user);
      verificationSent = true;
    } catch (verifErr) {
      console.warn('Gagal mengirim email verifikasi otomatis:', verifErr);
    }
  }

  return { credential, verificationSent };
};

/**
 * Kirim ulang email verifikasi ke user yang sedang login
 */
export const resendVerificationEmail = async (user?: User | null): Promise<void> => {
  const targetUser = user || auth.currentUser;
  if (!targetUser) {
    throw new Error('Tidak ada akun yang sedang aktif untuk diverifikasi.');
  }
  await sendEmailVerification(targetUser);
};

/**
 * Kirim tautan reset kata sandi ke email
 */
export const sendPasswordReset = async (email: string): Promise<void> => {
  const cleanEmail = email.trim().toLowerCase();
  await sendPasswordResetEmail(auth, cleanEmail);
};


