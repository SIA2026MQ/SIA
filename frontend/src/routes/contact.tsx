import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Phone, MapPin, Send, Check, Instagram, Youtube, Facebook, MessageCircle } from "lucide-react";
import { Lotus } from "@/components/decorative";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact · We'd Love to Hear From You · SIA" },
      { name: "description", content: "Reach the Shifting Into Awareness team — for inquiries, bookings, media, and personal questions." },
      { property: "og:title", content: "Contact · SIA" },
      { property: "og:description", content: "Reach the Shifting Into Awareness team — for inquiries, bookings, media, and personal questions." },
    ],
  }),
  component: ContactPage,
});

interface FormValues {
  name: string;
  email: string;
  subject: string;
  message: string;
}

function ContactPage() {
  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<FormValues>();
  const [sent, setSent] = useState(false);
  const [shakeKey, setShakeKey] = useState(0);

  const onSubmit = async (data: FormValues) => {
    await new Promise((r) => setTimeout(r, 1100));
    console.log("Contact submission:", data);
    setSent(true);
    reset();
  };

  const onInvalid = () => setShakeKey((k) => k + 1);

  return (
    <section className="relative overflow-hidden bg-[var(--color-cream)] pt-32 pb-24 min-h-screen">
      <div className="mx-auto max-w-7xl px-6 lg:px-10 grid lg:grid-cols-5 gap-14 items-start">
        <div className="lg:col-span-2 relative">
          <Lotus className="absolute -bottom-16 -left-10 h-72 w-72 text-[var(--color-purple)] opacity-[0.07] -z-10" />
          <p className="btn-label text-[var(--color-gold)]">Contact</p>
          <h1 className="mt-4 font-serif italic text-4xl sm:text-5xl text-[var(--color-purple)] leading-tight">
            We'd love to hear from you.
          </h1>
          <p className="mt-6 text-[var(--color-text-mid)] leading-relaxed">
            Whether you're seeking guidance, considering a retreat, or simply want to say hello — write to us. Every message is read with care.
          </p>

          <div className="mt-10 space-y-5">
            {[
              { icon: Mail, label: "Email", value: "jakelight@sia.org", href: "mailto:jakelight@sia.org" },
              { icon: Phone, label: "WhatsApp", value: "+91 98765 43210", href: "https://wa.me/919876543210" },
              { icon: MapPin, label: "Where we gather", value: "Rishikesh · India · Worldwide" },
            ].map(({ icon: Icon, label, value, href }) => (
              <div key={label} className="flex items-start gap-4">
                <div className="grid h-11 w-11 place-items-center rounded-full bg-[var(--color-purple-pale)] text-[var(--color-purple)] shrink-0">
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wider text-[var(--color-text-mid)]">{label}</p>
                  {href ? (
                    <a href={href} className="font-medium text-[var(--color-text-dark)] hover:text-[var(--color-purple)]">{value}</a>
                  ) : (
                    <p className="font-medium text-[var(--color-text-dark)]">{value}</p>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-10 flex gap-3">
            {[Instagram, Youtube, Facebook, MessageCircle].map((Icon, i) => (
              <a key={i} href="#" aria-label="social" className="grid h-11 w-11 place-items-center rounded-full border border-[var(--color-purple)]/25 text-[var(--color-purple)] hover:bg-[var(--color-purple)] hover:text-[var(--color-cream)] transition-colors">
                <Icon className="h-5 w-5" />
              </a>
            ))}
          </div>
        </div>

        <motion.div
          key={shakeKey}
          className={cn("lg:col-span-3 rounded-3xl bg-white p-8 sm:p-10 shadow-card relative", shakeKey > 0 && Object.keys(errors).length > 0 && "shake")}
        >
          <AnimatePresence mode="wait">
            {sent ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="text-center py-16"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 260, damping: 18, delay: 0.1 }}
                  className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-[var(--color-purple)] text-[var(--color-cream)]"
                >
                  <Check className="h-10 w-10" strokeWidth={2.5} />
                </motion.div>
                <h2 className="mt-6 font-serif text-3xl text-[var(--color-purple)]">Thank you.</h2>
                <p className="mt-3 text-[var(--color-text-mid)]">We'll be in touch shortly. May your day be peaceful.</p>
                <button onClick={() => setSent(false)} className="mt-8 text-sm font-semibold text-[var(--color-purple)] underline-offset-4 hover:underline">
                  Send another message
                </button>
              </motion.div>
            ) : (
              <motion.form
                key="form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onSubmit={handleSubmit(onSubmit, onInvalid)}
                className="grid gap-5"
                noValidate
              >
                <Field
                  label="Full Name"
                  error={errors.name?.message}
                  {...register("name", { required: "Please share your name" })}
                />
                <Field
                  label="Email Address"
                  type="email"
                  error={errors.email?.message}
                  {...register("email", {
                    required: "We need an email to write back",
                    pattern: { value: /^[^@\s]+@[^@\s]+\.[^@\s]+$/, message: "That doesn't look like a valid email" },
                  })}
                />
                <div>
                  <label className="block text-xs uppercase tracking-wider text-[var(--color-text-mid)] mb-2">Subject</label>
                  <select
                    {...register("subject", { required: true })}
                    className="w-full rounded-lg border border-[var(--color-purple)]/20 bg-transparent px-4 py-3.5 text-[var(--color-text-dark)] focus:border-[var(--color-purple)] focus:outline-none transition-colors"
                  >
                    <option value="">Select a subject</option>
                    <option>General Inquiry</option>
                    <option>Course Enquiry</option>
                    <option>Retreat Booking</option>
                    <option>Media</option>
                    <option>Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider text-[var(--color-text-mid)] mb-2">Message</label>
                  <textarea
                    rows={5}
                    {...register("message", { required: "A few words please", minLength: { value: 10, message: "A little more, please" } })}
                    className="w-full rounded-lg border border-[var(--color-purple)]/20 bg-transparent px-4 py-3 text-[var(--color-text-dark)] focus:border-[var(--color-purple)] focus:outline-none transition-colors resize-none"
                  />
                  {errors.message && <p className="mt-1.5 text-xs text-[oklch(0.55_0.22_25)]">{errors.message.message}</p>}
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="mt-2 inline-flex items-center justify-center gap-2 rounded-full bg-[var(--color-purple)] px-6 py-4 btn-label text-[var(--color-cream)] hover:bg-[var(--color-purple-light)] transition-colors disabled:opacity-70"
                >
                  {isSubmitting ? (
                    <span className="h-4 w-4 rounded-full border-2 border-[var(--color-cream)] border-t-transparent animate-spin" />
                  ) : (
                    <>Send Message <Send className="h-4 w-4" /></>
                  )}
                </button>
              </motion.form>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
}

interface FieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

const Field = (() => {
  const Component = (
    { label, error, ...props }: FieldProps,
    ref: React.Ref<HTMLInputElement>,
  ) => {
    return (
      <div>
        <label className="block text-xs uppercase tracking-wider text-[var(--color-text-mid)] mb-2">{label}</label>
        <input
          ref={ref}
          {...props}
          className={cn(
            "w-full rounded-lg border bg-transparent px-4 py-3.5 text-[var(--color-text-dark)] focus:outline-none transition-colors",
            error
              ? "border-[oklch(0.55_0.22_25)]"
              : "border-[var(--color-purple)]/20 focus:border-[var(--color-purple)]",
          )}
        />
        {error && <p className="mt-1.5 text-xs text-[oklch(0.55_0.22_25)]">{error}</p>}
      </div>
    );
  };
  Component.displayName = "Field";
  return Object.assign(
    // forwardRef wrapper
    (props: FieldProps & { ref?: React.Ref<HTMLInputElement> }) => Component(props, props.ref ?? null),
    {},
  );
})();
