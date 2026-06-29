import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Mail, Lock, X, Github, Cloud, User as UserIcon, LogOut, CheckCircle2, AlertCircle } from "lucide-react";
import { auth, googleProvider, trackEvent } from "../lib/firebase";
import { signInWithPopup, createUserWithEmailAndPassword, signInWithEmailAndPassword, sendEmailVerification, signOut, User } from "firebase/auth";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
}

export default function AuthModal({ isOpen, onClose, currentUser }: AuthModalProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Rate limit state
  const [lockoutTime, setLockoutTime] = useState(0);

  useEffect(() => {
    let timer: any;
    if (lockoutTime > 0) {
      timer = setInterval(() => {
        setLockoutTime(prev => Math.max(0, prev - 1));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [lockoutTime]);

  const handleRateLimit = () => {
    // Simple client-side throttle to discourage brute force
    const attemptsStr = localStorage.getItem("auth_attempts") || "0";
    const lastAttemptStr = localStorage.getItem("auth_last_attempt") || "0";
    
    let attempts = parseInt(attemptsStr, 10);
    const lastAttempt = parseInt(lastAttemptStr, 10);
    const now = Date.now();

    if (now - lastAttempt > 5 * 60 * 1000) {
      attempts = 0; // Reset after 5 mins
    }

    if (attempts >= 5) {
      setLockoutTime(30); // 30 sec lockout
      setError("Too many attempts. Please wait 30 seconds.");
      localStorage.setItem("auth_last_attempt", String(now));
      return false;
    }

    localStorage.setItem("auth_attempts", String(attempts + 1));
    localStorage.setItem("auth_last_attempt", String(now));
    return true;
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!handleRateLimit()) return;
    
    setIsLoading(true);
    setError(null);
    try {
      if (isLogin) {
        const cred = await signInWithEmailAndPassword(auth, email, password);
        trackEvent("login", { method: "email" });
        if (!cred.user.emailVerified) {
          setError("Please verify your email address before continuing.");
          await signOut(auth); // force sign out until verified
        } else {
          onClose();
        }
      } else {
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        trackEvent("sign_up", { method: "email" });
        await sendEmailVerification(cred.user);
        await signOut(auth);
        setIsLogin(true);
        setError("Success! Please check your email to verify your account.");
        // We do not close the modal here so they see the message
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An error occurred during authentication.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await signInWithPopup(auth, googleProvider);
      trackEvent("login", { method: "google" });
      onClose();
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An error occurred with Google Sign-In.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut(auth);
    trackEvent("logout");
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-md bg-surface-container rounded-3xl shadow-2xl border border-outline/10 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-outline/10">
              <h2 className="text-xl font-bold text-on-surface">
                {currentUser ? "Account Settings" : (isLogin ? "Welcome Back" : "Create Account")}
              </h2>
              <button 
                onClick={onClose}
                className="p-2 text-on-surface-variant hover:text-on-surface hover:bg-surface-container-highest rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              {currentUser ? (
                <div className="flex flex-col items-center justify-center space-y-4">
                  <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center">
                    <UserIcon className="w-10 h-10 text-primary" />
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-semibold text-on-surface">{currentUser.email}</p>
                    <p className="text-sm text-primary flex items-center justify-center gap-1 mt-1">
                      {currentUser.emailVerified ? (
                        <><CheckCircle2 className="w-4 h-4" /> Verified</>
                      ) : (
                        <><AlertCircle className="w-4 h-4 text-error" /> Unverified Email</>
                      )}
                    </p>
                  </div>
                  <button
                    onClick={handleSignOut}
                    className="flex items-center gap-2 mt-4 px-6 py-2 bg-error/10 text-error font-medium rounded-xl hover:bg-error/20 transition-colors"
                  >
                    <LogOut className="w-4 h-4" /> Sign Out
                  </button>
                </div>
              ) : (
                <>
                  <form onSubmit={handleEmailAuth} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-on-surface-variant mb-1">Email</label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant/50" />
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={e => setEmail(e.target.value)}
                          className="w-full pl-10 pr-4 py-3 bg-surface border border-outline/20 rounded-xl focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-on-surface"
                          placeholder="you@example.com"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-on-surface-variant mb-1">Password</label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant/50" />
                        <input
                          type="password"
                          required
                          minLength={6}
                          value={password}
                          onChange={e => setPassword(e.target.value)}
                          className="w-full pl-10 pr-4 py-3 bg-surface border border-outline/20 rounded-xl focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-on-surface"
                          placeholder="••••••••"
                        />
                      </div>
                    </div>

                    {error && (
                      <div className={`p-3 rounded-lg text-sm ${error.includes("Success") ? "bg-primary/10 text-primary border border-primary/20" : "bg-error/10 text-error border border-error/20"}`}>
                        {error}
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={isLoading || lockoutTime > 0}
                      className="w-full py-3 bg-primary text-on-primary font-semibold rounded-xl hover:bg-primary-vibrant active:scale-95 transition-all disabled:opacity-50 disabled:pointer-events-none"
                    >
                      {lockoutTime > 0 ? `Wait ${lockoutTime}s` : (isLoading ? "Please wait..." : (isLogin ? "Sign In" : "Sign Up"))}
                    </button>
                  </form>

                  <div className="mt-6 flex items-center justify-between text-sm">
                    <span className="h-px bg-outline/20 flex-1" />
                    <span className="px-4 text-on-surface-variant">OR</span>
                    <span className="h-px bg-outline/20 flex-1" />
                  </div>

                  <button
                    onClick={handleGoogleAuth}
                    disabled={isLoading || lockoutTime > 0}
                    className="mt-6 w-full flex items-center justify-center gap-3 py-3 bg-surface border border-outline/20 text-on-surface font-semibold rounded-xl hover:bg-surface-container-highest active:scale-95 transition-all disabled:opacity-50"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                    </svg>
                    Continue with Google
                  </button>

                  <p className="mt-6 text-center text-sm text-on-surface-variant">
                    {isLogin ? "Don't have an account? " : "Already have an account? "}
                    <button 
                      onClick={() => { setIsLogin(!isLogin); setError(null); }}
                      className="text-primary hover:underline font-semibold"
                    >
                      {isLogin ? "Sign up" : "Log in"}
                    </button>
                  </p>
                </>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
