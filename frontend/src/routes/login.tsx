import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { z } from "zod";
import { AnimatedPage } from "@/components/common/AnimatedPage";
import { useAuth } from "@/context/AuthContext"; // ADDED

const loginSchema = z.object({
  email: z.string().trim().email("Enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export default function LoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams(); // ADDED
  const redirectTo = searchParams.get("redirectTo") || "/"; // ADDED
  
  const { signInWithGoogle } = useAuth(); // ADDED
  const [error, setError] = useState("");

  const handleGoogleLogin = async () => {
    try {
      await signInWithGoogle();
      navigate(redirectTo); // Redirect back to cart (or home)
    } catch (err) {
      setError("Failed to sign in with Google.");
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
            <button onClick={handleGoogleLogin} className="sia-button-outline w-full mt-6 bg-white flex justify-center gap-2">
              <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="h-5 w-5" alt="Google" />
              Continue with Google
            </button>

            <div className="relative my-6 text-center">
              <span className="bg-card px-2 text-xs text-muted-foreground relative z-10">OR</span>
              <div className="absolute top-1/2 left-0 w-full border-t border-border"></div>
            </div>

            <form
  className="space-y-4"
  onSubmit={(event) => {
    event.preventDefault();
    setError("");
    const formData = new FormData(event.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    const parsed = loginSchema.safeParse({ email, password });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Invalid credentials");
      return;
    }

    // 🚨 Check if it is the Admin logging in from the normal page 🚨
    if (email === "admin@sia.com" && password === "Admin@123") {
      window.localStorage.setItem("sia-admin-auth", "true");
      navigate("/admin");
      return; // Stop execution here so normal login doesn't run
    }

    // --- Normal User Login Simulation ---
    window.localStorage.setItem("sia-user", parsed.data.email);
    window.dispatchEvent(new Event("sia-auth-updated"));
    navigate(redirectTo); 
  }}
>
              <input name="email" type="email" placeholder="Email" className="h-12 w-full rounded-xl border border-input bg-card px-4 text-sm" />
              <input name="password" type="password" placeholder="Password" className="h-12 w-full rounded-xl border border-input bg-card px-4 text-sm" />
              {error ? <p className="text-sm text-destructive">{error}</p> : null}
              <button type="submit" className="sia-button-primary w-full">Login</button>
            </form>
          </div>
        </div>
      </section>
    </AnimatedPage>
  );
}