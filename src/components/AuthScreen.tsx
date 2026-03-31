import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useAppStore } from "../store";
import { db } from "../db";
import { Lock, User, Key, ArrowLeft, Eye, EyeOff, CheckCircle2 } from "lucide-react";
import { cn } from "../lib/utils";

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

  const setUser = useAppStore((state) => state.setUser);

  const generatePasskey = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let result = "";
    for (let i = 0; i < 16; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      const user = await db.users.where("username").equals(username).first();
      if (user && user.password === password) {
        setUser({
          username: user.username,
          isPremium: user.is_premium,
          trialStartDate: user.created_at,
        });
      } else {
        setError("Invalid username or password");
      }
    } catch (err) {
      setError("An error occurred during sign in");
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    try {
      const existing = await db.users.where("username").equals(username).first();
      if (existing) {
        setError("Username already exists");
        return;
      }

      const newPasskey = generatePasskey();
      const now = Date.now();
      await db.users.add({
        username,
        password,
        passkey: newPasskey,
        created_at: now,
        is_premium: false,
      });
      setGeneratedPasskey(newPasskey);
      setMode("passkey");
    } catch (err) {
      setError("An error occurred during sign up");
    }
  };

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      const user = await db.users.where("username").equals(username).first();
      if (user && user.passkey === passkey) {
        setResetUsername(username);
        setMode("reset");
        setPassword("");
        setConfirmPassword("");
      } else {
        setError("Invalid username or passkey");
      }
    } catch (err) {
      setError("An error occurred");
    }
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    try {
      const user = await db.users.where("username").equals(resetUsername).first();
      if (user) {
        await db.users.update(user.id!, { password });
        setMode("signin");
        setUsername(resetUsername);
        setPassword("");
        setError("");
        alert("Password reset successful! Please sign in.");
      }
    } catch (err) {
      setError("An error occurred during password reset");
    }
  };

  const inputClasses = "w-full bg-surface border border-border rounded-xl px-11 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all";
  const labelClasses = "block text-sm font-medium text-text-secondary mb-1.5 ml-1";

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-surface rounded-3xl shadow-2xl shadow-primary/5 border border-border overflow-hidden"
      >
        <div className="p-8">
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-4">
              <Lock className="text-primary" size={32} />
            </div>
            <h1 className="text-2xl font-bold text-text-primary">
              {mode === "signin" && "Welcome Back"}
              {mode === "signup" && "Create Account"}
              {mode === "passkey" && "Secret Passkey"}
              {mode === "forgot" && "Reset Password"}
              {mode === "reset" && "New Password"}
            </h1>
            <p className="text-text-secondary text-sm mt-1">
              {mode === "signin" && "Sign in to access your workouts"}
              {mode === "signup" && "Join Cubifit and start training"}
              {mode === "passkey" && "Store this safely to recover your account"}
              {mode === "forgot" && "Enter your details to reset password"}
              {mode === "reset" && "Choose a strong new password"}
            </p>
          </div>

          <AnimatePresence mode="wait">
            {mode === "signin" && (
              <motion.form
                key="signin"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                onSubmit={handleSignIn}
                className="space-y-4"
              >
                <div>
                  <label className={labelClasses}>Username</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary" size={18} />
                    <input
                      type="text"
                      required
                      className={inputClasses}
                      placeholder="Enter username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                    />
                  </div>
                </div>
                <div>
                  <label className={labelClasses}>Password</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary" size={18} />
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      className={inputClasses}
                      placeholder="Enter password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-text-secondary hover:text-primary transition-colors"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
                {error && <p className="text-error text-xs ml-1">{error}</p>}
                <button
                  type="submit"
                  className="w-full bg-primary text-white font-bold py-3 rounded-xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 active:scale-[0.98]"
                >
                  Sign In
                </button>
                <div className="flex flex-col gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setMode("forgot");
                      setError("");
                    }}
                    className="text-sm text-text-secondary hover:text-primary transition-colors"
                  >
                    Forgot Password?
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setMode("signup");
                      setError("");
                      setUsername("");
                      setPassword("");
                    }}
                    className="text-sm text-primary font-semibold hover:underline"
                  >
                    Don't have an account? Sign Up
                  </button>
                </div>
              </motion.form>
            )}

            {mode === "signup" && (
              <motion.form
                key="signup"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                onSubmit={handleSignUp}
                className="space-y-4"
              >
                <div>
                  <label className={labelClasses}>Username</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary" size={18} />
                    <input
                      type="text"
                      required
                      className={inputClasses}
                      placeholder="Choose username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                    />
                  </div>
                </div>
                <div>
                  <label className={labelClasses}>Password</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary" size={18} />
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      className={inputClasses}
                      placeholder="Create password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                </div>
                <div>
                  <label className={labelClasses}>Confirm Password</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary" size={18} />
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      className={inputClasses}
                      placeholder="Confirm password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                  </div>
                </div>
                {error && <p className="text-error text-xs ml-1">{error}</p>}
                <button
                  type="submit"
                  className="w-full bg-primary text-white font-bold py-3 rounded-xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 active:scale-[0.98]"
                >
                  Sign Up
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMode("signin");
                    setError("");
                  }}
                  className="w-full text-sm text-text-secondary hover:text-primary transition-colors flex items-center justify-center gap-2"
                >
                  <ArrowLeft size={16} /> Back to Sign In
                </button>
              </motion.form>
            )}

            {mode === "passkey" && (
              <motion.div
                key="passkey"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-6"
              >
                <div className="bg-primary/5 border border-primary/20 rounded-2xl p-6 text-center">
                  <p className="text-text-secondary text-xs uppercase tracking-widest font-bold mb-3">Your Secret Passkey</p>
                  <div className="font-mono text-2xl font-bold text-primary tracking-wider break-all bg-surface p-4 rounded-xl border border-border shadow-inner">
                    {generatedPasskey}
                  </div>
                </div>
                <div className="flex items-start gap-3 bg-warning/10 p-4 rounded-xl border border-warning/20">
                  <Key className="text-warning shrink-0" size={20} />
                  <p className="text-xs text-warning-foreground leading-relaxed">
                    <strong>Warning:</strong> This is the only time you will see this passkey. You will need it to reset your password if you forget it. Store it in a safe place.
                  </p>
                </div>
                <button
                  onClick={async () => {
                    const user = await db.users.where("username").equals(username).first();
                    if (user) {
                      setUser({
                        username: user.username,
                        isPremium: user.is_premium,
                        trialStartDate: user.created_at,
                      });
                    }
                  }}
                  className="w-full bg-primary text-white font-bold py-3 rounded-xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
                >
                  <CheckCircle2 size={20} /> I've Stored It, Let's Go
                </button>
              </motion.div>
            )}

            {mode === "forgot" && (
              <motion.form
                key="forgot"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                onSubmit={handleForgot}
                className="space-y-4"
              >
                <div>
                  <label className={labelClasses}>Username</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary" size={18} />
                    <input
                      type="text"
                      required
                      className={inputClasses}
                      placeholder="Enter username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                    />
                  </div>
                </div>
                <div>
                  <label className={labelClasses}>Secret Passkey</label>
                  <div className="relative">
                    <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary" size={18} />
                    <input
                      type="text"
                      required
                      className={inputClasses}
                      placeholder="Enter 16-char passkey"
                      value={passkey}
                      onChange={(e) => setPasskey(e.target.value)}
                    />
                  </div>
                </div>
                {error && <p className="text-error text-xs ml-1">{error}</p>}
                <button
                  type="submit"
                  className="w-full bg-primary text-white font-bold py-3 rounded-xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 active:scale-[0.98]"
                >
                  Verify Passkey
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMode("signin");
                    setError("");
                  }}
                  className="w-full text-sm text-text-secondary hover:text-primary transition-colors flex items-center justify-center gap-2"
                >
                  <ArrowLeft size={16} /> Back to Sign In
                </button>
              </motion.form>
            )}

            {mode === "reset" && (
              <motion.form
                key="reset"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                onSubmit={handleReset}
                className="space-y-4"
              >
                <div>
                  <label className={labelClasses}>New Password</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary" size={18} />
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      className={inputClasses}
                      placeholder="Enter new password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                </div>
                <div>
                  <label className={labelClasses}>Confirm New Password</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary" size={18} />
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      className={inputClasses}
                      placeholder="Confirm new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                  </div>
                </div>
                {error && <p className="text-error text-xs ml-1">{error}</p>}
                <button
                  type="submit"
                  className="w-full bg-primary text-white font-bold py-3 rounded-xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 active:scale-[0.98]"
                >
                  Reset Password
                </button>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
