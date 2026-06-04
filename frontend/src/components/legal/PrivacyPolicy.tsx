import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { AnimatedPage } from "@/components/common/AnimatedPage";

export default function PrivacyPolicy() {
  const navigate = useNavigate();

  return (
    <AnimatedPage>
      <section className="section-odd pt-32 pb-20">
        <div className="sia-container max-w-3xl space-y-10">
          
          {/* Back Button */}
          <button 
            onClick={() => navigate(-1)} 
            className="flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary/80 transition"
          >
            <ArrowLeft className="h-4 w-4" /> Go Back
          </button>

          <header className="space-y-4">
            <h1 className="sia-h1 text-primary">Privacy Policy</h1>
            <p className="text-sm text-muted-foreground uppercase tracking-widest font-semibold">
              By: Jake Light | Last Updated: September 29, 2023
            </p>
          </header>

          <div className="sia-body space-y-8 text-muted-foreground leading-relaxed">
            
            <section className="space-y-4">
              <h2 className="text-xl font-bold text-primary">Information Sharing</h2>
              <ul className="list-disc pl-5 space-y-2">
                <li><strong>With Affiliates:</strong> We may share Your information with Our affiliates, requiring them to honor this Privacy Policy. Affiliates include Our parent company, subsidiaries, joint venture partners, or other companies under common control with Us.</li>
                <li><strong>With Business Partners:</strong> We may share Your information to offer You certain products, services, or promotions.</li>
                <li><strong>With Other Users:</strong> When You interact in public areas, such information may be viewed by all users and publicly distributed. If You register through a Third-Party Social Media Service, Your contacts may see Your name, profile, pictures, and activity descriptions.</li>
                <li><strong>With Your Consent:</strong> We may disclose Your personal information for any other purpose with Your explicit consent.</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-bold text-primary">Retention of Your Personal Data</h2>
              <p>We retain Your Personal Data only for as long as necessary for the purposes set out in this Policy, to comply with legal obligations, resolve disputes, and enforce our agreements. Usage Data is generally retained for a shorter period unless required for security or functionality improvements.</p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-bold text-primary">Transfer of Your Personal Data</h2>
              <p>Your information is processed at our operating offices and may be transferred to computers located outside of Your jurisdiction. By submitting Your information and consenting to this Policy, You agree to this transfer. We take all reasonable steps to ensure Your data is treated securely and in accordance with this Privacy Policy.</p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-bold text-primary">Your Rights (Delete Data)</h2>
              <p>You have the right to request deletion of Your Personal Data. You may manage or delete your information via account settings, if available, or by contacting Us directly. Note that we may need to retain certain information where we have a legal obligation or lawful basis to do so.</p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-bold text-primary">Disclosure of Your Personal Data</h2>
              <ul className="list-disc pl-5 space-y-2">
                <li><strong>Business Transactions:</strong> If the Company is involved in a merger, acquisition, or asset sale, Your Personal Data may be transferred.</li>
                <li><strong>Law Enforcement:</strong> We may disclose Your Personal Data if required by law or valid requests by public authorities.</li>
                <li><strong>Other Legal Requirements:</strong> Necessary actions to comply with legal obligations, protect our rights/property, investigate wrongdoing, or protect public safety.</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-bold text-primary">Security</h2>
              <p>While We strive to use commercially acceptable means to protect Your Personal Data, no method of transmission or electronic storage is 100% secure. We cannot guarantee absolute security.</p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-bold text-primary">Children’s Privacy</h2>
              <p>Our Service does not address anyone under 13. If We become aware that We have collected data from a child under 13 without verification of parental consent, We will take steps to remove that information from our servers.</p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-bold text-primary">Third-Party Links</h2>
              <p>Our Service may contain links to third-party websites. We have no control over and assume no responsibility for the content, privacy policies, or practices of any third-party sites.</p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-bold text-primary">Changes to this Policy</h2>
              <p>We may update this Policy from time to time. We will notify You of changes by posting the new Privacy Policy on this page and updating the "Last updated" date. Continued use of the Service constitutes acceptance of the changes.</p>
            </section>

            <section className="space-y-4 p-6 bg-primary/5 rounded-2xl border border-primary/10">
              <h2 className="text-lg font-bold text-primary">Contact Us</h2>
              <p>If you have any questions, please contact us at:</p>
              <a href="mailto:shiftingintoawareness@gmail.com" className="text-primary font-bold hover:underline">
                shiftingintoawareness@gmail.com
              </a>
            </section>

          </div>
        </div>
      </section>
    </AnimatedPage>
  );
}