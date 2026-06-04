import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { AnimatedPage } from "@/components/common/AnimatedPage";

export default function TermsConditions() {
  const navigate = useNavigate();

  return (
    <AnimatedPage>
      <section className="section-odd pt-32 pb-20">
        <div className="sia-container max-w-3xl space-y-10">
          
          <button 
            onClick={() => navigate(-1)} 
            className="flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary/80 transition"
          >
            <ArrowLeft className="h-4 w-4" /> Go Back
          </button>

          <header className="space-y-4">
            <h1 className="sia-h1 text-primary">Terms & Conditions</h1>
            <p className="text-sm text-muted-foreground uppercase tracking-widest font-semibold">
              By: Jake Light | Last Updated: October 12, 2023
            </p>
          </header>

          <div className="sia-body space-y-8 text-muted-foreground leading-relaxed">
            <section className="space-y-4">
              <h2 className="text-xl font-bold text-primary">Introduction</h2>
              <p>These Website Standard Terms and Conditions manage your use of our website, <em>Shifting Into Awareness</em>, accessible at apr10.shiftingintoawareness.com. By using this Website, you agree to accept all terms and conditions written herein. You must not use this Website if you disagree with any of these terms. Minors or people below 18 years old are not allowed to use this Website.</p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-bold text-primary">Intellectual Property Rights</h2>
              <p>Other than content you own, <em>Shifting Into Awareness</em> and/or its licensors own all intellectual property rights and materials contained in this Website. You are granted a limited license only for purposes of viewing the material contained on this Website.</p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-bold text-primary">Restrictions</h2>
              <p>You are specifically restricted from:</p>
              <ul className="list-disc pl-5 space-y-2">
                <li>Publishing website material in any other media.</li>
                <li>Selling, sublicensing, or commercializing any website material.</li>
                <li>Publicly performing or showing any website material.</li>
                <li>Using this Website in any way that is damaging, impacts user access, or is contrary to applicable laws.</li>
                <li>Engaging in data mining, harvesting, or extracting.</li>
                <li>Engaging in advertising or marketing.</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-bold text-primary">Your Content</h2>
              <p>“Your Content” means any audio, video, text, images, or other material you display on this Website. By displaying Your Content, you grant <em>Shifting Into Awareness</em> a non-exclusive, worldwide, irrevocable, sub-licensable license to use, reproduce, and distribute it. Your Content must be your own and not invade any third-party rights.</p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-bold text-primary">Limitation of Liability & Indemnification</h2>
              <p>This Website is provided “as is,” with all faults. <em>Shifting Into Awareness</em> and its officers shall not be held liable for any indirect, consequential, or special liability arising out of your use of this Website. You hereby indemnify <em>Shifting Into Awareness</em> against all liabilities, costs, and damages arising from your breach of these Terms.</p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-bold text-primary">Governing Law & Jurisdiction</h2>
              <p>These Terms will be governed by and interpreted in accordance with the laws of the State of India, and you submit to the non-exclusive jurisdiction of the state and federal courts located therein for the resolution of any disputes.</p>
            </section>
          </div>
        </div>
      </section>
    </AnimatedPage>
  );
}