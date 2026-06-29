import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { z } from "zod";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { AnimatedPage } from "@/components/common/AnimatedPage";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import { ShieldBan, X } from "lucide-react"; // 🚨 NEW: Imported icons for the popup

const loginSchema = z.object({
  email: z.string().trim().email("Enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export default function LoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") || "/";

  const { signInWithGoogle } = useAuth();
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showBlockedModal, setShowBlockedModal] = useState(false); // 🚨 NEW: Modal state

  // 🚨 NEW: Reusable function to check DB status before allowing entry
  const verifyDbStatusAndRedirect = async () => {
    try {
      const res = await api.getMe();
      if (res.user?.isBlocked) {
        await auth.signOut();
        setShowBlockedModal(true);
        return false;
      }
      navigate(redirectTo);
      return true;
    } catch (err: any) {
      await auth.signOut();
      
      // 🚨 FIX: Catch the direct Account Suspended error AND the 401 race condition
      const errorMessage = err?.message || "";
      if (
        errorMessage === "Account Suspended" || 
        errorMessage.includes("401") || 
        errorMessage.includes("403") || 
        err?.response?.data?.isBlocked
      ) {
        setShowBlockedModal(true);
      } else {
        setError("Failed to sync with server. Please try again.");
      }
      return false;
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setError("");
      await signInWithGoogle();
      await verifyDbStatusAndRedirect(); // 🚨 NEW: Check status before redirecting
    } catch (err) {
      setError("Failed to sign in with Google.");
    }
  };

  const handleEmailLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setIsLoading(true);

    const formData = new FormData(event.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    const parsed = loginSchema.safeParse({ email, password });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Invalid credentials");
      setIsLoading(false);
      return;
    }

    try {
      await signInWithEmailAndPassword(auth, parsed.data.email, parsed.data.password);
      await verifyDbStatusAndRedirect(); // 🚨 NEW: Check status before redirecting
    } catch (err: any) {
      console.error(err);
      setError("Invalid email or password.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatedPage>
      <section className="section-odd pt-32 pb-16 min-h-[80vh] relative">
        <div className="sia-container max-w-xl">
          <div className="sia-card relative z-10">
            <h1 className="sia-h2">Welcome Back</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {redirectTo === "/cart"
                ? "Please log in to complete your purchase."
                : "Login to manage your courses and checkout faster."}
            </p>

            <button
              onClick={handleGoogleLogin}
              className="sia-button-outline w-full mt-6 bg-white flex justify-center items-center gap-2"
            >
              <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="h-5 w-5" alt="Google" />
              Continue with Google
            </button>

            <div className="relative my-6 text-center">
              <span className="bg-card px-2 text-xs text-muted-foreground relative z-10">OR</span>
              <div className="absolute top-1/2 left-0 w-full border-t border-border"></div>
            </div>

            <form className="space-y-4" onSubmit={handleEmailLogin}>
              <input
                name="email"
                type="email"
                placeholder="Email"
                className="h-12 w-full rounded-xl border border-input bg-card px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
              <input
                name="password"
                type="password"
                placeholder="Password"
                className="h-12 w-full rounded-xl border border-input bg-card px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
              {error ? <p className="text-sm text-destructive font-bold">{error}</p> : null}

              <button
                type="submit"
                disabled={isLoading}
                className="sia-button-primary w-full disabled:opacity-70"
              >
                {isLoading ? "Logging in..." : "Login"}
              </button>
            </form>
          </div>
        </div>

        {/* 🚨 NEW: BLOCKED USER POPUP */}
        {showBlockedModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl max-w-md w-full p-8 shadow-2xl relative text-center border-t-8 border-red-600 animate-in zoom-in-95 duration-300">
              <button 
                onClick={() => setShowBlockedModal(false)}
                className="absolute top-4 right-4 p-2 bg-gray-50 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
              
              <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-6">
                <ShieldBan className="h-8 w-8 text-red-600" />
              </div>
              
              <h2 className="text-2xl font-display text-gray-900 mb-3">Account Suspended</h2>
              <p className="text-gray-600 text-sm leading-relaxed mb-8">
                Your account has been blocked by an administrator. You no longer have access to the Shifting Into Awareness platform.
              </p>
              
              <button 
                onClick={() => setShowBlockedModal(false)}
                className="w-full py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </section>
    </AnimatedPage>
  );
}