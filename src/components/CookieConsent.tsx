import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Cookie, X } from "lucide-react";
import { trackEvent } from "../lib/firebase";

export default function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if user has already made a choice
    const consent = localStorage.getItem("cookie_consent");
    if (!consent) {
      // Small delay so it slides in naturally after load
      const timer = setTimeout(() => setIsVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem("cookie_consent", "accepted");
    setIsVisible(false);
    trackEvent("cookie_consent_accepted");
  };

  const handleDecline = () => {
    localStorage.setItem("cookie_consent", "declined");
    setIsVisible(false);
    trackEvent("cookie_consent_declined");
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-surface-container border border-outline/20 p-4 rounded-2xl shadow-xl z-50 overflow-hidden"
        >
          {/* Decorative Aurora */}
          <div className="absolute inset-0 opacity-10 pointer-events-none">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary blur-[40px] rounded-full mix-blend-screen" />
          </div>

          <div className="relative flex flex-col gap-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-primary-container/30 text-primary rounded-lg">
                  <Cookie className="w-5 h-5" />
                </div>
                <h3 className="text-on-surface font-semibold">Cookie Consent</h3>
              </div>
              <button 
                onClick={handleDecline}
                className="text-muted-foreground hover:text-on-surface transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <p className="text-sm text-on-surface-variant">
              We use cookies to improve your experience and analyze platform usage. By accepting, you agree to our <a href="#/privacy" className="text-primary hover:underline">Privacy Policy</a>.
            </p>

            <div className="flex items-center gap-2 mt-2">
              <button
                onClick={handleAccept}
                className="flex-1 py-2 bg-primary text-on-primary font-semibold rounded-xl hover:bg-primary-vibrant active:scale-95 transition-all"
              >
                Accept All
              </button>
              <button
                onClick={handleDecline}
                className="flex-1 py-2 bg-surface-container-highest text-on-surface font-semibold rounded-xl hover:bg-surface-container-highest/80 active:scale-95 transition-all"
              >
                Decline
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
