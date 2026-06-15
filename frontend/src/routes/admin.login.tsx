import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatedPage } from "@/components/common/AnimatedPage";

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const [error, setError] = useState("");

  return (
    <AnimatedPage>
      <section className="section-odd pt-32 pb-16 min-h-[80vh]">
        <div className="sia-container max-w-md">
          <div className="sia-card">
            <h1 className="sia-h2 text-center text-[#600694]">Admin Portal</h1>
            <p className="mt-2 text-sm text-center text-muted-foreground">
              Restricted access. Authorized personnel only.
            </p>
            <form
              className="mt-8 space-y-4"
              onSubmit={(event) => {
                event.preventDefault();
                setError("");
                
                const formData = new FormData(event.currentTarget);
                const email = formData.get("email") as string;
                const password = formData.get("password") as string;

                // 🚨 Hardcoded Admin Check 🚨
                if (email === "admin@sia.com" && password === "Admin@123") {
                  // Set the secret key that AdminPage.tsx is looking for
                  window.localStorage.setItem("sia-admin-auth", "true");
                  // Redirect directly to the dashboard
                  navigate("/admin/login");
                } else {
                  setError("Invalid admin credentials");
                }
              }}
            >
              <input
                name="email"
                type="email"
                required
                placeholder="Admin Email"
                className="h-12 w-full rounded-xl border border-input bg-card px-4 text-sm"
              />
              <input
                name="password"
                type="password"
                required
                placeholder="Password"
                className="h-12 w-full rounded-xl border border-input bg-card px-4 text-sm"
              />
              {error && <p className="text-sm text-red-500 font-semibold">{error}</p>}
              <button type="submit" className="sia-button-primary w-full bg-[#600694] text-white">
                Access Dashboard
              </button>
            </form>
          </div>
        </div>
      </section>
    </AnimatedPage>
  );
}