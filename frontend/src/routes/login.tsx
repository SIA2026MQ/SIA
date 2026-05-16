import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Lotus } from "@/components/decorative";
import logo from "@/assets/sia-logo.jpg";

type LoginSearch = { redirect?: string };

export const Route = createFileRoute("/login")({
  validateSearch: (search: Record<string, unknown>): LoginSearch => ({
    redirect: (search.redirect as string) || "/",
  }),
  head: () => ({
    meta: [{ title: "Sign In · Shifting Into Awareness" }],
  }),
  component: LoginPage,
});

function LoginPage() {
  const { signInWithGoogle, dbUser, loading } = useAuth();
  const navigate = useNavigate();
  const { redirect } = Route.useSearch();

  useEffect(() => {
    // When user is loaded and not loading, redirect
    if (!loading && dbUser) {
      navigate({ to: redirect, replace: true });
    }
  }, [dbUser, loading, navigate, redirect]);

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
      // AuthProvider will update dbUser, which triggers redirect above
    } catch (error) {
      console.error("Sign-in failed", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[var(--color-cream)]">
        <div className="h-12 w-12 border-4 border-[#600694] border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-[#600694] font-medium">Authenticating...</p>
      </div>
    );
  }

  return (
    <section className="relative min-h-screen overflow-hidden bg-gradient-soft pt-28 pb-16">
      {/* ... your existing JSX, same as before ... */}
      <div className="relative mx-auto grid max-w-6xl gap-12 px-6 lg:grid-cols-2 lg:items-center">
        {/* Left side – same */}
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="hidden lg:flex flex-col items-start">
          <img src={logo} alt="SIA Logo" className="h-20 w-auto" />
          <h1 className="mt-8 font-serif italic text-5xl text-[var(--color-purple)] leading-tight">Welcome, <br />sincere seeker.</h1>
          <p className="mt-6 text-lg text-[var(--color-text-mid)] max-w-md leading-relaxed">Sign in to enrol in courses, register for retreats, and follow the journey.</p>
          <div className="mt-10 rounded-2xl border border-[var(--color-gold)]/30 bg-white/70 backdrop-blur p-5 text-sm shadow-card">
            <p className="flex items-center gap-2 font-semibold text-[var(--color-purple)]"><Sparkles className="h-4 w-4 text-[var(--color-gold)]" /> Admin demo access</p>
            <p className="mt-2 text-[var(--color-text-mid)]">Email: <code className="font-mono text-[var(--color-purple)]">{import.meta.env.VITE_ADMIN_EMAIL || "admin@shiftingintoawareness.com"}</code></p>
          </div>
        </motion.div>

        {/* Right side – Google Sign-In */}
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.1 }} className="relative rounded-3xl bg-white p-8 sm:p-10 shadow-card-lifted text-center">
          <Lotus className="absolute -top-8 left-1/2 -translate-x-1/2 h-16 w-16 text-[var(--color-purple)] lg:hidden" />
          <h2 className="font-serif text-3xl text-[var(--color-purple)]">Welcome back</h2>
          <p className="mt-1 text-sm text-[var(--color-text-mid)]">Sign in with your Google account to continue.</p>
          <div className="mt-8 space-y-4">
            <button onClick={handleGoogleSignIn} className="inline-flex w-full items-center justify-center gap-3 rounded-full bg-white border border-[var(--color-purple)]/30 px-6 py-3.5 text-[var(--color-text-dark)] font-medium hover:bg-[var(--color-purple-pale)] transition-colors shadow-sm cursor-pointer">
              <svg className="h-5 w-5" viewBox="0 0 24 24">...</svg>
              Sign in with Google
            </button>
          </div>
          <p className="mt-6 text-xs text-[var(--color-text-mid)]">By continuing, you agree to our <Link to="/contact" className="text-[var(--color-purple)] underline">terms and privacy policy</Link>.</p>
        </motion.div>
      </div>
    </section>
  );
}