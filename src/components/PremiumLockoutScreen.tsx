import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useAuthStore } from "../store";
import { db } from "../db";
import { Crown, ExternalLink, ShieldCheck, AlertCircle, Loader2, LogOut, Award, Check } from "lucide-react";

export default function PremiumLockoutScreen() {
  const [licenseKey, setLicenseKey] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState("");
  const { user, setPremium, logout } = useAuthStore();

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!licenseKey.trim()) return;
    setIsVerifying(true);
    
    // Testing Bypass
    if (licenseKey === "FREE-ME") {
      await new Promise(r => setTimeout(r, 1000));
      if (user) {
        await db.users.where("username").equals(user.username).modify({ is_premium: true, license_key: licenseKey });
        setShowSuccess(true);
      }
    } else {
      setError("Invalid Key");
    }
    setIsVerifying(false);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
      {!showSuccess ? (
        <motion.div className="w-full max-w-lg bg-surface rounded-[2.5rem] shadow-2xl border border-border p-10">
          <Crown className="text-primary mx-auto mb-6" size={60} />
          <h1 className="text-3xl font-black mb-3">Trial Expired</h1>
          <p className="text-text-secondary mb-10">Get the Lifetime License to keep training offline.</p>
          
          <form onSubmit={handleVerify} className="space-y-4">
            <input type="text" placeholder="XXXX-XXXX-XXXX" className="w-full bg-background border border-border rounded-2xl px-6 py-4 font-mono" value={licenseKey} onChange={(e) => setLicenseKey(e.target.value)} />
            {error && <p className="text-error text-sm">{error}</p>}
            <button type="submit" disabled={isVerifying} className="w-full bg-primary text-white font-bold py-4 rounded-2xl shadow-lg">
              {isVerifying ? <Loader2 className="animate-spin mx-auto" /> : "Activate License"}
            </button>
          </form>
          <button onClick={() => logout()} className="mt-8 text-text-secondary flex items-center gap-2 mx-auto"><LogOut size={16} /> Sign Out</button>
        </motion.div>
      ) : (
        <motion.div initial={{ scale: 0.5 }} animate={{ scale: 1 }} className="bg-surface p-12 rounded-[3rem] border-4 border-primary/20 shadow-2xl">
          <Award className="text-primary mx-auto mb-6" size={80} />
          <h2 className="text-3xl font-black mb-4">Congratulations!</h2>
          <button onClick={() => setPremium(true)} className="w-full bg-primary text-white font-black py-5 rounded-2xl flex items-center justify-center gap-3">
            <Check size={24} /> Start Training
          </button>
        </motion.div>
      )}
    </div>
  );
}