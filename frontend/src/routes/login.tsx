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
  // 1. Pull dbUser instead of the raw Firebase user to guarantee the backend handshake is done
  const { signInWithGoogle, dbUser, loading: authLoading } = useAuth();
  const navigate = useNavigate({ from: Route.fullPath });
  const { redirect } = Route.useSearch();

  // 2. The Redirect Effect
  useEffect(() => {
    // 🚨 ADD THIS LINE TO X-RAY THE STATE:
    console.log("Login Status -> Loading:", authLoading, "| Database User:", dbUser);

    // Wait until loading is completely finished AND we have the database user profile
    if (!authLoading && dbUser) {
      navigate({ 
        to: redirect || "/", 
        replace: true 
      });
    }
  }, [dbUser, authLoading, navigate, redirect]);

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
      // We don't put navigate() here because signInWithRedirect will reload the page automatically
    } catch (error) {
      console.error("Google sign-in failed:", error);
    }
  };

  // 3. Prevent the login screen from flashing while Firebase is waking up or while redirecting
  if (authLoading || dbUser) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[var(--color-cream)]">
        <div className="h-12 w-12 border-4 border-[#600694] border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-[#600694] font-medium animate-pulse">Authenticating with Shifting Into Awareness...</p>
      </div>
    );
  }

  return (
    <section className="relative min-h-screen overflow-hidden bg-gradient-soft pt-28 pb-16">
      <div className="absolute -top-40 -right-40 h-[600px] w-[600px] rounded-full bg-[var(--color-purple-pale)] opacity-60 blur-3xl" />
      <div className="absolute -bottom-40 -left-40 h-[500px] w-[500px] rounded-full bg-[var(--color-gold)]/15 blur-3xl" />

      <div className="relative mx-auto grid max-w-6xl gap-12 px-6 lg:grid-cols-2 lg:items-center">
        {/* Left side: Branding */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="hidden lg:flex flex-col items-start"
        >
          <img src={logo} alt="SIA Logo" className="h-20 w-auto" />
          <h1 className="mt-8 font-serif italic text-5xl text-[var(--color-purple)] leading-tight">
            Welcome, <br />sincere seeker.
          </h1>
          <p className="mt-6 text-lg text-[var(--color-text-mid)] max-w-md leading-relaxed">
            Sign in to enrol in courses, register for retreats, and follow the journey.
          </p>
          <div className="mt-10 rounded-2xl border border-[var(--color-gold)]/30 bg-white/70 backdrop-blur p-5 text-sm shadow-card">
            <p className="flex items-center gap-2 font-semibold text-[var(--color-purple)]">
              <Sparkles className="h-4 w-4 text-[var(--color-gold)]" /> Admin demo access
            </p>
            <p className="mt-2 text-[var(--color-text-mid)]">
              Username: <code className="font-mono text-[var(--color-purple)]">admin@shiftingintoawareness.com</code>
              <br />
              Password: <code className="font-mono text-[var(--color-purple)]">Use Google Sign‑In with that email</code>
            </p>
          </div>
        </motion.div>

        {/* Right side: Google Sign-In Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="relative rounded-3xl bg-white p-8 sm:p-10 shadow-card-lifted text-center"
        >
          <Lotus className="absolute -top-8 left-1/2 -translate-x-1/2 h-16 w-16 text-[var(--color-purple)] lg:hidden" />

          <h2 className="font-serif text-3xl text-[var(--color-purple)]">Welcome back</h2>
          <p className="mt-1 text-sm text-[var(--color-text-mid)]">
            Sign in with your Google account to continue.
          </p>

          <div className="mt-8 space-y-4">
            <button
              onClick={handleGoogleSignIn}
              className="inline-flex w-full items-center justify-center gap-3 rounded-full bg-white border border-[var(--color-purple)]/30 px-6 py-3.5 text-[var(--color-text-dark)] font-medium hover:bg-[var(--color-purple-pale)] transition-colors shadow-sm cursor-pointer"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Sign in with Google
            </button>
          </div>

          <p className="mt-6 text-xs text-[var(--color-text-mid)]">
            By continuing, you agree to our{" "}
            <Link to="/contact" className="text-[var(--color-purple)] underline">
              terms and privacy policy
            </Link>
            .
          </p>
        </motion.div>
      </div>
    </section>
  );
}