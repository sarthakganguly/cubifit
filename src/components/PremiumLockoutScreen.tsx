import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useAppStore } from "../store";
import { db } from "../db";
import { Crown, ExternalLink, ShieldCheck, AlertCircle, Loader2, LogOut, Award, Check } from "lucide-react";

const GUMROAD_PRODUCT_ID = "YOUR_PRODUCT_ID"; // Placeholder

export default function PremiumLockoutScreen() {
  const [licenseKey, setLicenseKey] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState("");
  const user = useAppStore((state) => state.user);
  const setPremium = useAppStore((state) => state.setPremium);
  const logout = useAppStore((state) => state.logout);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!licenseKey.trim()) return;

    setIsVerifying(true);
    setError("");

    // BYPASS FOR TESTING
    if (licenseKey === "TEST-1234") {
      await new Promise(resolve => setTimeout(resolve, 1500));
      const success = await markAsPremiumInDB();
      if (success) setShowSuccess(true);
      setIsVerifying(false);
      return;
    }

    try {
      const response = await fetch("https://api.gumroad.com/v2/licenses/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          product_permalink: GUMROAD_PRODUCT_ID,
          license_key: licenseKey,
        }),
      });

      const data = await response.json();

      if (data.success && data.uses < 5) {
        const success = await markAsPremiumInDB();
        if (success) setShowSuccess(true);
      } else {
        setError(data.message || "Invalid license key or usage limit exceeded.");
      }
    } catch (err) {
      setError("Failed to verify license. Please check your connection.");
    } finally {
      setIsVerifying(false);
    }
  };

  const markAsPremiumInDB = async () => {
    if (!user) return false;
    try {
      const dbUser = await db.users.where("username").equals(user.username).first();
      if (dbUser) {
        await db.users.update(dbUser.id!, {
          is_premium: true,
          license_key: licenseKey,
        });
        return true;
      }
      return false;
    } catch (err) {
      setError("Failed to save premium status locally.");
      return false;
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 relative overflow-hidden">
      <AnimatePresence>
        {!showSuccess ? (
          <motion.div
            key="lockout-card"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 1.1, filter: "blur(10px)" }}
            className="w-full max-w-lg bg-surface rounded-[2.5rem] shadow-2xl border border-border overflow-hidden relative"
          >
            {/* Decorative background element */}
            <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-primary/10 to-transparent" />

            <div className="p-10 relative z-10">
              <div className="flex flex-col items-center text-center mb-10">
                <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center mb-6 shadow-inner">
                  <Crown className="text-primary" size={40} />
                </div>
                <h1 className="text-3xl font-black text-text-primary mb-3 tracking-tight">
                  Trial Period Expired
                </h1>
                <p className="text-text-secondary leading-relaxed">
                  Your 7-day trial of Cubifit has come to an end. Upgrade to the Lifetime License to unlock permanent offline access and all premium features.
                </p>
              </div>

              <div className="space-y-6">
                <a
                  href={`https://gumroad.com/l/${GUMROAD_PRODUCT_ID}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between w-full bg-primary text-white font-bold py-5 px-8 rounded-2xl hover:bg-primary/90 transition-all shadow-xl shadow-primary/20 group"
                >
                  <div className="flex flex-col items-start">
                    <span className="text-xs opacity-70 uppercase tracking-widest mb-1">Lifetime Access</span>
                    <span className="text-lg">Buy License Key</span>
                  </div>
                  <ExternalLink size={24} className="group-hover:translate-x-1 transition-transform" />
                </a>

                <div className="relative py-4">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-border"></div>
                  </div>
                  <div className="relative flex justify-center text-xs uppercase tracking-widest font-bold">
                    <span className="bg-surface px-4 text-text-secondary">Already have a key?</span>
                  </div>
                </div>

                <form onSubmit={handleVerify} className="space-y-4">
                  <div className="relative">
                    <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary" size={20} />
                    <input
                      type="text"
                      required
                      placeholder="XXXX-XXXX-XXXX-XXXX"
                      className="w-full bg-background border border-border rounded-2xl px-12 py-4 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-mono uppercase"
                      value={licenseKey}
                      onChange={(e) => setLicenseKey(e.target.value)}
                      disabled={isVerifying}
                    />
                  </div>

                  {error && (
                    <div className="flex items-center gap-2 text-error text-sm bg-error/5 p-3 rounded-xl border border-error/10">
                      <AlertCircle size={16} />
                      <span>{error}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isVerifying || !licenseKey.trim()}
                    className="w-full bg-text-primary text-background font-bold py-4 rounded-2xl hover:opacity-90 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isVerifying ? (
                      <>
                        <Loader2 className="animate-spin" size={20} />
                        Verifying...
                      </>
                    ) : (
                      "Activate Lifetime License"
                    )}
                  </button>
                </form>
              </div>

              <div className="mt-10 pt-8 border-t border-border flex justify-center">
                <button
                  onClick={() => logout()}
                  className="text-text-secondary hover:text-error transition-colors flex items-center gap-2 text-sm font-medium"
                >
                  <LogOut size={16} />
                  Sign out and return later
                </button>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="success-window"
            initial={{ opacity: 0, scale: 0.5, rotate: -5 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ type: "spring", damping: 12, stiffness: 100 }}
            className="w-full max-w-md bg-surface rounded-[3rem] shadow-2xl border-4 border-primary/20 p-12 text-center relative z-20"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: "spring", bounce: 0.6 }}
              className="w-24 h-24 bg-primary rounded-full flex items-center justify-center mx-auto mb-8 shadow-xl shadow-primary/30 relative"
            >
              <Award className="text-white" size={48} />
              <motion.div
                animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="absolute inset-0 bg-primary rounded-full -z-10"
              />
            </motion.div>

            <h2 className="text-3xl font-black text-text-primary mb-4">
              Congratulations!
            </h2>
            <p className="text-lg font-bold text-primary mb-6">
              You're now a Lifetime Member
            </p>
            <p className="text-text-secondary mb-10 leading-relaxed">
              Thank you so much for your support! Your contribution helps us keep Cubifit private, local, and accessible for everyone. We're excited to have you on this journey.
            </p>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setPremium(true)}
              className="w-full bg-primary text-white font-black py-5 rounded-2xl shadow-lg shadow-primary/30 flex items-center justify-center gap-3 text-lg"
            >
              <Check size={24} strokeWidth={3} />
              Start Training
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      <p className="mt-8 text-text-secondary text-xs opacity-50">
        Cubifit Premium • Secure Local Activation
      </p>

      {/* Energetic background particles (simulated with CSS) */}
      {showSuccess && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ 
                x: "50%", 
                y: "50%", 
                scale: 0,
                opacity: 1 
              }}
              animate={{ 
                x: `${Math.random() * 100}%`, 
                y: `${Math.random() * 100}%`,
                scale: Math.random() * 2,
                opacity: 0
              }}
              transition={{ 
                duration: 1.5, 
                delay: Math.random() * 0.5,
                ease: "easeOut"
              }}
              className="absolute w-2 h-2 bg-primary rounded-full"
            />
          ))}
        </div>
      )}
    </div>
  );
}
