import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { z } from "zod";
import { signInWithEmailAndPassword } from "firebase/auth"; // Added for secure email login
import { auth } from "@/lib/firebase";
import { AnimatedPage } from "@/components/common/AnimatedPage";
import { useAuth } from "@/context/AuthContext";

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

  const handleGoogleLogin = async () => {
    try {
      setError("");
      await signInWithGoogle();
      navigate(redirectTo);
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
      // Log into Firebase directly. 
      // The AuthContext listener will automatically catch this and sync with the Database!
      await signInWithEmailAndPassword(auth, parsed.data.email, parsed.data.password);
      navigate(redirectTo);
    } catch (err: any) {
      console.error(err);
      setError("Invalid email or password.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatedPage>
      <section className="section-odd pt-32 pb-16 min-h-[80vh]">
        <div className="sia-container max-w-xl">
          <div className="sia-card">
            <h1 className="sia-h2">Welcome Back</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {redirectTo === "/cart"
                ? "Please log in to complete your purchase."
                : "Login to manage your courses and checkout faster."}
            </p>

            {/* Google Sign-in Button */}
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
              {error ? <p className="text-sm text-destructive">{error}</p> : null}

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
      </section>
    </AnimatedPage>
  );
}