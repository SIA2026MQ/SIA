import React, { useState } from "react";
import { motion } from "framer-motion";
import { Info, CheckCircle2, MapPin, MessageCircle, ExternalLink, ShieldAlert } from "lucide-react";

// --- Animation Variants ---
const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

// --- Extracted Data ---
const countries = [
  "Afghanistan", "Aland Islands", "Albania", "Algeria", "American Samoa", "Andorra", "Angola", 
  "Anguilla", "Antarctica", "Antigua And Barbuda", "Argentina", "Armenia", "Aruba", "Australia", 
  "Austria", "Azerbaijan", "Bahamas", "Bahrain", "Bangladesh", "Barbados", "Belarus", "Belgium", 
  "Belize", "Benin", "Bermuda", "Bhutan", "Bolivia", "Bonaire, Sint Eustatius and Saba", 
  "Bosnia and Herzegowina", "Botswana", "Bouvet Island", "Brazil", "British Indian Ocean Territory", 
  "Brunei Darussalam", "Bulgaria", "Burkina Faso", "Burundi", "Cabo Verde", "Cambodia", "Cameroon", 
  "Canada", "Cayman Islands", "Central African Republic", "Chad", "Chile", "China", "Christmas Island", 
  "Cocos (Keeling) Islands", "Colombia", "Comoros", "Congo", "Congo, The Democratic Republic Of The", 
  "Cook Islands", "Costa Rica", "Cote D'Ivoire", "Croatia", "Cuba", "Curacao", "Cyprus", "Czechia", 
  "Denmark", "Djibouti", "Dominica", "Dominican Republic", "Ecuador", "Egypt", "El Salvador", "England", 
  "Equatorial Guinea", "Eritrea", "Estonia", "Eswatini", "Ethiopia", "Falkland Islands (Malvinas)", 
  "Faroe Islands", "Fiji", "Finland", "France", "France, Metropolitan", "French Guiana", "French Polynesia", 
  "French Southern Territories", "Gabon", "Gambia", "Georgia", "Germany", "Ghana", "Gibraltar", "Greece", 
  "Greenland", "Grenada", "Guadeloupe", "Guam", "Guatemala", "Guinea", "Guinea-Bissau", "Guyana", "Haiti", 
  "Heard And Mc Donald Islands", "Holy See (Vatican City State)", "Honduras", "Hong Kong", "Hungary", 
  "Iceland", "India", "Indonesia", "Iran (Islamic Republic Of)", "Iraq", "Ireland", "Isle of Man", "Israel", 
  "Italy", "Jamaica", "Japan", "Jersey", "Jordan", "Kazakhstan", "Kenya", "Kiribati", 
  "Korea, Democratic People's Republic Of", "Korea, Republic Of", "Kuwait", "Kyrgyzstan", 
  "Lao People's Democratic Republic", "Latvia", "Lebanon", "Lesotho", "Liberia", "Libya", "Liechtenstein", 
  "Lithuania", "Luxembourg", "Macao", "Madagascar", "Malawi", "Malaysia", "Maldives", "Mali", "Malta", 
  "Marshall Islands", "Martinique", "Mauritania", "Mauritius", "Mayotte", "Mexico", 
  "Micronesia, Federated States Of", "Moldova, Republic Of", "Monaco", "Mongolia", "Montenegro", 
  "Montserrat", "Morocco", "Mozambique", "Myanmar", "Namibia", "Nauru", "Nepal", "Netherlands", 
  "Netherlands Antilles", "New Caledonia", "New Zealand", "Nicaragua", "Niger", "Nigeria", "Niue", 
  "Norfolk Island", "North Macedonia", "Northern Mariana Islands", "Norway", "Oman", "Pakistan", "Palau", 
  "Palestine, State of", "Panama", "Papua New Guinea", "Paraguay", "Peru", "Philippines", "Pitcairn", 
  "Poland", "Portugal", "Puerto Rico", "Qatar", "Republic of Kosovo", "Reunion", "Romania", 
  "Russian Federation", "Rwanda", "Saint Martin", "Saint Barthelemy", 
  "Saint Helena, Ascension and Tristan da Cunha", "Saint Kitts And Nevis", "Saint Lucia", 
  "Saint Pierre and Miquelon", "Saint Vincent And The Grenadines", "Samoa", "San Marino", 
  "Sao Tome And Principe", "Saudi Arabia", "Senegal", "Serbia", "Seychelles", "Sierra Leone", "Singapore", 
  "Sint Maarten", "Slovakia", "Slovenia", "Solomon Islands", "Somalia", "South Africa", 
  "South Georgia and South Sandwich Islands", "South Sudan", "Spain", "Sri Lanka", "Sudan", "Suriname", 
  "Svalbard And Jan Mayen Islands", "Sweden", "Switzerland", "Syrian Arab Republic", "Taiwan", "Tajikistan", 
  "Tanzania, United Republic Of", "Thailand", "Timor-Leste", "Togo", "Tokelau", "Tonga", 
  "Trinidad And Tobago", "Tunisia", "Turkey", "Turkmenistan", "Turks And Caicos Islands", "Tuvalu", 
  "Uganda", "Ukraine", "United Arab Emirates", "United Kingdom", "United States", 
  "United States Minor Outlying Islands", "Uruguay", "Uzbekistan", "Vanuatu", "Venezuela", "Viet Nam", 
  "Virgin Islands (British)", "Virgin Islands (U.S.)", "Wallis And Futuna", "Western Sahara", "Yemen", 
  "Zambia", "Zimbabwe"
];

const sourceOptions = [
  "A friend recommended",
  "A member of SiA recommended",
  "Through YouTube Channel",
  "Through Facebook",
  "Through Instagram",
  "Through search engine",
  "Through an advertisement",
  "Through an Event"
];

export default function JoinPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Google Apps Script Submit Handler
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const form = e.currentTarget;
    const formData = new FormData(form);

    // ====================================================================
    // PASTE YOUR GOOGLE APPS SCRIPT WEB APP URL HERE:
    // const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec";
    // ====================================================================
    
    try {
      /* UNCOMMENT THIS BLOCK TO ACTIVATE SUBMISSION
      await fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        body: formData,
        mode: 'no-cors' // Required for Google Scripts to avoid CORS errors
      });
      */
      
      // Simulate network request for now
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      alert("Application submitted successfully. We will be in touch soon.");
      form.reset();
    } catch (error) {
      console.error("Error submitting form:", error);
      alert("There was an error submitting your form. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="py-16 md:py-24 bg-[#F7F3FA] min-h-screen selection:bg-[#4B1D52] selection:text-white">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        
        {/* Header */}
        <div className="mb-12 text-center md:text-left max-w-3xl">
          <h1 className="font-display text-4xl md:text-5xl font-bold text-[#600694] mb-6 tracking-tight">
            Join the SiA Family
          </h1>
          <p className="text-muted-foreground text-xl leading-relaxed">
            You may use this form to join the regular Zoom sessions. Please note that this platform is not a casual platform but a serious platform where spiritual evolution is at the highest priority.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          
          {/* =========================================
              LEFT SIDE: Information Content
              ========================================= */}
          <motion.div 
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="lg:col-span-5 flex flex-col gap-8 text-[#4B1D52]"
          >
            {/* Section 1 */}
            <motion.div variants={fadeUp} className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-[#600694]/10">
              <h3 className="flex items-center gap-3 text-lg font-bold uppercase tracking-widest mb-4">
                <CheckCircle2 className="w-5 h-5 text-[#600694]" /> Becoming a Member
              </h3>
              <p className="text-muted-foreground leading-relaxed mb-4 text-xl">
                You become a member of SiA as soon as you attend any webinar or course of SiA. In case you have not done any, it is mandatory to do the basic course of SiA in order to become a member.
              </p>
              <a href="/courses" target="_blank" rel="noreferrer" className="text-[#600694] font-semibold hover:underline flex items-center gap-2">
                View Courses <ExternalLink className="w-4 h-4" />
              </a>
            </motion.div>

            {/* Section 2 */}
            <motion.div variants={fadeUp} className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-[#600694]/10">
              <h3 className="flex items-center gap-3 text-lg font-bold uppercase tracking-widest mb-4">
                <Info className="w-5 h-5 text-[#600694]" /> Daily Satsangs & Sessions
              </h3>
              <p className="text-muted-foreground leading-relaxed mb-4 text-xl">
                There is a monthly membership fee, which gives access to unlimited webinars and daily sessions for the entire month. Free satsangs include daily powerful sessions, clarity sessions, teachings from higher scriptures, deep contemplative sessions, meditative sessions, followup sessions for webinars and practice sessions.
              </p>
              <p className="text-muted-foreground leading-relaxed text-xl">
                There are regular <strong>LIVE CLARITY SESSIONS</strong> where you may directly ask questions on Zoom or via private message (confidentiality maintained).
              </p>
            </motion.div>

            {/* Section 3 */}
            <motion.div variants={fadeUp} className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-[#600694]/10">
              <h3 className="flex items-center gap-3 text-lg font-bold uppercase tracking-widest mb-4">
                <MessageCircle className="w-5 h-5 text-[#600694]" /> Internal Communication
              </h3>
              <p className="text-muted-foreground leading-relaxed mb-4 text-xl">
                We are using the <strong>Arratai App</strong> for our messaging services. It is mandatory that you install this App. We will not add your number to any open groups to protect your privacy. All updates will reach you via direct encrypted broadcast messages.
              </p>
              <div className="flex flex-col gap-3 mt-4">
                <a href="https://chat.arattai.in/app/download" target="_blank" rel="noreferrer" className="text-[#600694] font-semibold hover:underline flex items-center gap-2">
                  Download Arratai App <ExternalLink className="w-4 h-4" />
                </a>
                <a href="https://whatsapp.com/channel/0029Va4zV169sBI8pxgZOQ3H" target="_blank" rel="noreferrer" className="text-[#600694] font-semibold hover:underline flex items-center gap-2">
                  Join WhatsApp Channel <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </motion.div>

            {/* Section 4 */}
            <motion.div variants={fadeUp} className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-[#600694]/10">
              <h3 className="flex items-center gap-3 text-lg font-bold uppercase tracking-widest mb-4">
                <MapPin className="w-5 h-5 text-[#600694]" /> Retreats
              </h3>
              <p className="text-muted-foreground leading-relaxed mb-4 text-xl">
                Only members are entitled for retreats (subject to approval). Retreats range from 4 to 9 days in sacred locations like Tiruvannamalai, Kanhagad, Ganeshpuri, Delhi, Uttarkashi, Gorakhpur.
              </p>
              <p className="text-muted-foreground leading-relaxed text-xl">
                Main retreats are conducted 2-3 times a year in Tiruvannamalai at the foothills of Arunachala. New members must have attended a webinar in the past 6 months to apply.
              </p>
            </motion.div>

            {/* Section 5 (Rules) */}
            <motion.div variants={fadeUp} className="bg-[#600694] text-white p-6 md:p-8 rounded-3xl shadow-xl">
              <h3 className="flex items-center gap-3 text-lg font-bold uppercase tracking-widest mb-6 text-[#F7F3FA]">
                <ShieldAlert className="w-5 h-5 text-[#C45E9F]" /> Worth Mentioning
              </h3>
              <ul className="space-y-4 text-white/80 font-light text-xl">
                <li className="flex items-start gap-3"><span className="text-[#C45E9F] mt-1">•</span> Here there is no path and hence nothing fanatical to any guru, path, philosophy, or religion.</li>
                <li className="flex items-start gap-3"><span className="text-[#C45E9F] mt-1">•</span> Time disciplines are strict.</li>
                <li className="flex items-start gap-3"><span className="text-[#C45E9F] mt-1">•</span> Zero-tolerance to malpractices or actions based on impure intentions.</li>
                <li className="flex items-start gap-3"><span className="text-[#C45E9F] mt-1">•</span> Serious seekers are always on priority.</li>
                <li className="flex items-start gap-3"><span className="text-[#C45E9F] mt-1">•</span> This platform keeps its highest goal of nothing less than self-realisation at all times.</li>
                <li className="flex items-start gap-3"><span className="text-[#C45E9F] mt-1">•</span> There can be crude demolition of your beliefs, concepts and conditionining. If it gets uncomfortable, you are free to discontinue.</li>
                <li className="flex items-start gap-3"><span className="text-[#C45E9F] mt-1">•</span> We respect all teachers and paths, but strongly encourage following only one path.</li>
              </ul>
            </motion.div>

          </motion.div>

          {/* =========================================
              RIGHT SIDE: The Form
              ========================================= */}
          <motion.div 
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="lg:col-span-7 bg-white p-8 md:p-12 rounded-3xl shadow-xl border border-[#4B1D52]/10 lg:sticky lg:top-8"
          >
            <form onSubmit={handleSubmit} className="space-y-6 text-foreground">
              <p className="text-sm text-red-500 font-medium mb-8">Fields marked with an * are required</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Name */}
                <motion.div variants={fadeUp}>
                  <label className="block text-sm font-semibold text-[#4B1D52] mb-2">Name *</label>
                  <input type="text" name="name" required className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-[#F7F3FA]/50 focus:bg-white focus:border-[#4B1D52] focus:ring-1 focus:ring-[#4B1D52] outline-none transition-all" />
                </motion.div>

                {/* Age */}
                <motion.div variants={fadeUp}>
                  <label className="block text-sm font-semibold text-[#4B1D52] mb-2">Age *</label>
                  <input type="number" name="age" required className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-[#F7F3FA]/50 focus:bg-white focus:border-[#4B1D52] focus:ring-1 focus:ring-[#4B1D52] outline-none transition-all" />
                </motion.div>
              </div>

              {/* Email */}
              <motion.div variants={fadeUp}>
                <label className="block text-sm font-semibold text-[#4B1D52] mb-2">Email *</label>
                <input type="email" name="email" required className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-[#F7F3FA]/50 focus:bg-white focus:border-[#4B1D52] focus:ring-1 focus:ring-[#4B1D52] outline-none transition-all" />
              </motion.div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* City */}
                <motion.div variants={fadeUp}>
                  <label className="block text-sm font-semibold text-[#4B1D52] mb-2">City *</label>
                  <input type="text" name="city" required className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-[#F7F3FA]/50 focus:bg-white focus:border-[#4B1D52] focus:ring-1 focus:ring-[#4B1D52] outline-none transition-all" />
                </motion.div>

                {/* State */}
                <motion.div variants={fadeUp}>
                  <label className="block text-sm font-semibold text-[#4B1D52] mb-2">State *</label>
                  <input type="text" name="state" required className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-[#F7F3FA]/50 focus:bg-white focus:border-[#4B1D52] focus:ring-1 focus:ring-[#4B1D52] outline-none transition-all" />
                </motion.div>
              </div>

              {/* Country */}
              <motion.div variants={fadeUp}>
                <label className="block text-sm font-semibold text-[#4B1D52] mb-2">Country *</label>
                <select name="country" required className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-[#F7F3FA]/50 focus:bg-white focus:border-[#4B1D52] focus:ring-1 focus:ring-[#4B1D52] outline-none transition-all appearance-none cursor-pointer">
                  <option value="">- Select Country -</option>
                  {countries.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </motion.div>

              {/* WhatsApp Phone */}
              <motion.div variants={fadeUp}>
                <label className="block text-sm font-semibold text-[#4B1D52] mb-1">WhatsApp Number *</label>
                <p className="text-xs text-muted-foreground mb-3">Your number is kept confidential and never added to any open groups. Please type your number along with your country code.</p>
                <input type="tel" name="whatsapp" required placeholder="+1 234 567 8900" className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-[#F7F3FA]/50 focus:bg-white focus:border-[#4B1D52] focus:ring-1 focus:ring-[#4B1D52] outline-none transition-all" />
              </motion.div>

              {/* Spiritual Practice */}
              <motion.div variants={fadeUp}>
                <label className="block text-sm font-semibold text-[#4B1D52] mb-2">What is your current spiritual practice? *</label>
                <textarea name="spiritual_practice" rows={3} required className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-[#F7F3FA]/50 focus:bg-white focus:border-[#4B1D52] focus:ring-1 focus:ring-[#4B1D52] outline-none transition-all resize-none"></textarea>
              </motion.div>

              {/* Source Dropdown */}
              <motion.div variants={fadeUp}>
                <label className="block text-sm font-semibold text-[#4B1D52] mb-2">How did you reach here? *</label>
                <select name="source" required className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-[#F7F3FA]/50 focus:bg-white focus:border-[#4B1D52] focus:ring-1 focus:ring-[#4B1D52] outline-none transition-all appearance-none cursor-pointer">
                  <option value="">- Select Option -</option>
                  {sourceOptions.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </motion.div>

              {/* Agreement Radio */}
              <motion.div variants={fadeUp} className="space-y-4 pt-4 border-t border-gray-100">
                <label className="block text-sm font-semibold text-[#4B1D52]">Agreement *</label>
                <p className="text-sm text-muted-foreground bg-[#F7F3FA] p-4 rounded-xl border border-[#4B1D52]/10 leading-relaxed">
                  I understand that to become a member I would need to do the basic course, only after which I would become eligible to attend the daily satsangs, meditations, practices and clarity sessions. Also I understand that from May 2026 there would be a monthly membership fee, which would give me access to unlimited webinars, followup sessions, scriptural teachings, and practices for the entire month.
                </p>
                
                <div className="flex flex-col gap-4 mt-4">
                  <label className="flex items-center gap-3 cursor-pointer p-3 rounded-xl border border-gray-200 hover:bg-[#F7F3FA]/50 transition-colors">
                    <input type="radio" name="agreement" value="I agree" required className="w-4 h-4 text-[#4B1D52] focus:ring-[#4B1D52]" />
                    <span className="font-medium text-[#4B1D52]">I agree</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer p-3 rounded-xl border border-gray-200 hover:bg-[#F7F3FA]/50 transition-colors">
                    <input type="radio" name="agreement" value="I am not ready yet" required className="w-4 h-4 text-[#4B1D52] focus:ring-[#4B1D52]" />
                    <span className="font-medium text-[#4B1D52]">I am not ready yet</span>
                  </label>
                </div>
              </motion.div>

              {/* Message */}
              <motion.div variants={fadeUp}>
                <label className="block text-sm font-semibold text-[#4B1D52] mb-2">Message (Optional)</label>
                <textarea name="message" rows={4} className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-[#F7F3FA]/50 focus:bg-white focus:border-[#4B1D52] focus:ring-1 focus:ring-[#4B1D52] outline-none transition-all resize-none"></textarea>
              </motion.div>

              {/* Submit Button */}
              <motion.div variants={fadeUp} className="pt-6 border-t border-gray-100">
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full py-4 bg-[#600694] text-white rounded-xl font-bold uppercase tracking-widest hover:bg-[#7D2E61] transition-colors shadow-md hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? "Submitting Application..." : "Submit Application"}
                </button>
              </motion.div>

            </form>
          </motion.div>
        </div>
      </div>
    </section>
  );
}