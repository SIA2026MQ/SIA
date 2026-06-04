import { useForm } from "react-hook-form";
import { CheckCircle2, Loader2 } from "lucide-react";
import { useState } from "react";
import type { InputHTMLAttributes } from "react";
import { AnimatedPage } from "@/components/common/AnimatedPage";

type ContactFormValues = {
  fullName: string;
  email: string;
  subject: string;
  message: string;
};

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ContactFormValues>();

  const onSubmit = handleSubmit(async () => {
    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1200));
    setLoading(false);
    setSubmitted(true);
    reset();
  });

  return (
    <AnimatedPage>
      <section className="section-odd pt-32 pb-16">
        <div className="sia-container grid gap-10 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-6">
            <h1 className="sia-h1">We&apos;d Love to Hear From You</h1>
            <p className="sia-body max-w-xl">
              Whether you are exploring satsang, a retreat, or course guidance, our team is here to
              support your journey.
            </p>
            <ul className="space-y-2 text-sm leading-7 text-muted-foreground">
              <li>Email: hello@shiftingintoawareness.org</li>
              <li>WhatsApp: +91 98765 43210</li>
              <li>Location: Global · Online + In-Person Retreats</li>
            </ul>
            <div className="flex gap-3">
              {["Instagram", "YouTube", "Facebook", "WhatsApp"].map((social) => (
                <a
                  key={social}
                  href="#"
                  className="rounded-full border border-primary/30 px-4 py-2 text-xs font-semibold uppercase tracking-[0.06em] text-primary"
                >
                  {social}
                </a>
              ))}
            </div>
          </div>

          <form className="sia-card space-y-4" onSubmit={onSubmit} aria-label="Contact form">
            <FloatingInput
              label="Full Name"
              error={errors.fullName?.message}
              {...register("fullName", { required: "Full name is required" })}
            />
            <FloatingInput
              label="Email Address"
              type="email"
              error={errors.email?.message}
              {...register("email", {
                required: "Email is required",
                pattern: { value: /\S+@\S+\.\S+/, message: "Enter a valid email" },
              })}
            />
            <div className="relative">
              <select
                className="peer h-14 w-full rounded-xl border border-input bg-transparent px-4 pt-5 text-sm"
                {...register("subject", { required: "Please choose a subject" })}
                defaultValue=""
              >
                <option value="" disabled>
                  Select subject
                </option>
                <option>General Inquiry</option>
                <option>Course Enquiry</option>
                <option>Retreat Booking</option>
                <option>Media</option>
                <option>Other</option>
              </select>
              <label className="pointer-events-none absolute left-4 top-2 text-xs uppercase tracking-[0.06em] text-muted-foreground">
                Subject
              </label>
              {errors.subject && (
                <p className="mt-1 text-xs text-destructive">{errors.subject.message}</p>
              )}
            </div>
            <div className="relative">
              <textarea
                rows={5}
                className="peer w-full rounded-xl border border-input bg-transparent px-4 pt-5 text-sm"
                placeholder=" "
                {...register("message", { required: "Message is required" })}
              />
              <label className="pointer-events-none absolute left-4 top-2 text-xs uppercase tracking-[0.06em] text-muted-foreground">
                Message
              </label>
              {errors.message && (
                <p className="mt-1 text-xs text-destructive">{errors.message.message}</p>
              )}
            </div>

            <button type="submit" className="sia-button-primary w-full" aria-label="Send message">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Send Message →"}
            </button>

            {submitted && (
              <div className="flex items-center gap-2 rounded-xl bg-purple-pale p-3 text-sm text-primary">
                <CheckCircle2 className="h-4 w-4" /> Thank you, we&apos;ll be in touch shortly!
              </div>
            )}
          </form>
        </div>
      </section>
    </AnimatedPage>
  );
}

type FloatingInputProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
};

function FloatingInput({ label, error, ...props }: FloatingInputProps) {
  return (
    <div className="relative">
      <input
        placeholder=" "
        className={`peer h-14 w-full rounded-xl border bg-transparent px-4 pt-5 text-sm ${
          error ? "border-destructive animate-[shake_0.3s_ease-in-out]" : "border-input"
        }`}
        {...props}
      />
      <label className="pointer-events-none absolute left-4 top-2 text-xs uppercase tracking-[0.06em] text-muted-foreground">
        {label}
      </label>
      {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
    </div>
  );
}
