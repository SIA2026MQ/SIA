import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { AnimatedPage } from "@/components/common/AnimatedPage";

export default function CancellationPolicy() {
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
            <h1 className="sia-h1 text-primary">Cancellation & Refund Policy</h1>
            <p className="text-sm text-muted-foreground uppercase tracking-widest font-semibold">
              By: Jake Light | Last Updated: October 15, 2025
            </p>
          </header>

          <div className="sia-body space-y-8 text-muted-foreground leading-relaxed">
            
            <section className="space-y-4">
              <h2 className="text-xl font-bold text-primary">Webinars & Workshops</h2>
              <p>We maintain a <strong>100% non-refundable</strong> cancellation policy for all webinars. If you cancel for any reason, you will not receive a refund.</p>
              <p>However, you may transfer your webinar pass to another individual or apply the credit toward a future webinar of the same value.</p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-bold text-primary">Retreats</h2>
              <p>Refunds are calculated based on the net amount received after payment merchant deductions (e.g., RazorPay, PayPal). Further transaction charges may apply.</p>
              <ul className="list-disc pl-5 space-y-2">
                <li><strong>30–45 days before retreat:</strong> 25% deduction applies.</li>
                <li><strong>15–30 days before retreat:</strong> 50% deduction applies.</li>
                <li><strong>0–15 days before retreat:</strong> No refund applicable.</li>
              </ul>
              <p><em>Transfers:</em> Seats may be transferred to another person, subject to approval. Alternatively, 50% of your contribution may be applied to a future retreat (if approved) within 6 months. After 6 months, these credits expire.</p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-bold text-primary">Rescheduling & Cancellations</h2>
              <p>If an event is rescheduled, you are automatically enrolled in the new session. If you cannot attend the new date, you may choose an alternate event of equal or lesser value. If an event is cancelled entirely and no alternate date is scheduled, participants will be refunded (minus transaction charges).</p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-bold text-primary">Disclaimers</h2>
              <p>We make every effort to represent our offerings accurately, but we <strong>cannot guarantee specific results</strong>, as outcomes depend on individual dedication and health. Our content is not a substitute for professional medical, psychological, financial, or legal advice.</p>
              <p><em>Shifting Into Awareness</em> and its representatives are not liable for any direct or indirect damages, including economic loss or health-related issues. By using our services, you agree to take full responsibility for your actions and decisions.</p>
            </section>

            <section className="space-y-4 italic border-t pt-6">
              <p className="text-xs"><em>Force Majeure:</em> We are not liable for service delays or failures caused by events beyond our control, including acts of God, strikes, or widespread health concerns.</p>
            </section>
          </div>
        </div>
      </section>
    </AnimatedPage>
  );
}