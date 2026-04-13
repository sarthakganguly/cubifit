import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useAuthStore } from "../store";
import { db } from "../db";
import { Lock, User, Key, ArrowLeft, Eye, EyeOff, CheckCircle2 } from "lucide-react";
import { hashPassword } from "../lib/utils";

type AuthMode = "signin" | "signup" | "passkey" | "forgot" | "reset";

export default function AuthScreen() {
  const [mode, setMode] = useState<AuthMode>("signin");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passkey, setPasskey] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [generatedPasskey, setGeneratedPasskey] = useState("");
  const [resetUsername, setResetUsername] = useState("");

  const { setUser } = useAuthStore();

  const generatePasskey = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let result = "";
    for (let i = 0; i < 16; i++) result += chars.charAt(Math.floor(Math.random() * chars.length));
    return result;
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      const userRecord = await db.users.where("username").equals(username).first();
      const hashedInput = await hashPassword(password);
      if (userRecord && userRecord.password === hashedInput) {
        setUser({ username: userRecord.username, isPremium: userRecord.is_premium, trialStartDate: userRecord.created_at });
      } else {
        setError("Invalid username or password");
      }
    } catch (err: any) { setError(err.message || "Sign in error"); }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (password !== confirmPassword) return setError("Passwords do not match");
    if (password.length < 6) return setError("Too short");

    try {
      const existing = await db.users.where("username").equals(username).first();
      if (existing) return setError("User exists");

      const hashedPassword = await hashPassword(password);
      const newPasskey = generatePasskey();
      await db.users.add({ username, password: hashedPassword, passkey: newPasskey, created_at: Date.now(), is_premium: false });
      setGeneratedPasskey(newPasskey);
      setMode("passkey");
    } catch (err: any) { setError(err.message || "Signup error"); }
  };

  const inputClasses = "w-full bg-surface border border-border rounded-xl px-11 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all";

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md bg-surface rounded-3xl shadow-2xl border border-border p-8">
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-4"><Lock className="text-primary" size={32} /></div>
            <h1 className="text-2xl font-bold">{mode === "signin" ? "Welcome Back" : "Create Account"}</h1>
          </div>

          <AnimatePresence mode="wait">
            {mode === "signin" ? (
              <motion.form key="signin" onSubmit={handleSignIn} className="space-y-4">
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary" size={18} />
                  <input type="text" required className={inputClasses} placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} />
                </div>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary" size={18} />
                  <input type={showPassword ? "text" : "password"} required className={inputClasses} placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
                </div>
                {error && <p className="text-error text-xs">{error}</p>}
                <button type="submit" className="w-full bg-primary text-white font-bold py-3 rounded-xl shadow-lg">Sign In</button>
                <button type="button" onClick={() => setMode("signup")} className="w-full text-sm text-primary text-center">Don't have an account? Sign Up</button>
              </motion.form>
            ) : mode === "signup" ? (
              <motion.form key="signup" onSubmit={handleSignUp} className="space-y-4">
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary" size={18} />
                  <input type="text" required className={inputClasses} placeholder="Choose Username" value={username} onChange={(e) => setUsername(e.target.value)} />
                </div>
                <input type="password" required className={inputClasses} placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
                <input type="password" required className={inputClasses} placeholder="Confirm Password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
                {error && <p className="text-error text-xs">{error}</p>}
                <button type="submit" className="w-full bg-primary text-white font-bold py-3 rounded-xl">Sign Up</button>
                <button type="button" onClick={() => setMode("signin")} className="w-full text-sm text-text-secondary text-center">Back to Sign In</button>
              </motion.form>
            ) : (
              <motion.div key="passkey" className="space-y-6 text-center">
                <div className="bg-primary/5 p-6 rounded-2xl border border-primary/20">
                  <p className="text-xs uppercase font-bold mb-2">Your Secret Passkey</p>
                  <div className="font-mono text-xl font-bold text-primary break-all">{generatedPasskey}</div>
                </div>
                <button onClick={async () => {
                  const userRecord = await db.users.where("username").equals(username).first();
                  if (userRecord) setUser({ username: userRecord.username, isPremium: userRecord.is_premium, trialStartDate: userRecord.created_at });
                }} className="w-full bg-primary text-white font-bold py-3 rounded-xl">I've Stored It, Let's Go</button>
              </motion.div>
            )}
          </AnimatePresence>
      </motion.div>
    </div>
  );
}