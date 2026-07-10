import { motion } from "framer-motion";
import contactImage from "@/assets/contact.jpeg"; // Example image
import aratai from "@/assets/We-are-now-on-Arratai-1.gif"

// Animation variants
const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

// Extracted country list
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

export function ContactPage() {
  return (
    <section className="py-16 pb-32 bg-[#F7E7E7] min-h-screen">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        
        {/* Header */}
        <div className="mb-12 text-center md:text-left">
          <h1 className="font-display text-3xl md:text-5xl font-bold text-[#4B1D52] mb-4 mt-8">
            Contact Me
          </h1>
          <p className="text-muted-foreground text-lg">
            Fields marked with an <span className="text-red-500">*</span> are required
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* LEFT SIDE: Two Steady (Sticky) Vertical Image Rectangles */}
          <div className="lg:col-span-5 flex flex-col gap-6 lg:sticky lg:top-8 h-max">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInUp}
              // CHANGED: Using aspect-square or aspect-[4/5] ensures the two stacked images match the form height
              className="group aspect-[4/5] md:aspect-square w-full overflow-hidden rounded-3xl border border-[#4B1D52]/10 shadow-lg bg-white"
            >
              <img
                src={contactImage}
                alt="Meditation space"
                className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              />
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInUp}
              className="group aspect-[4/5] md:aspect-square w-full overflow-hidden rounded-3xl border border-[#4B1D52]/10 shadow-lg bg-white"
            >
              <img
                src={aratai}
                alt="Spiritual path"
                className="h-full w-full object-contain transition-transform duration-700 ease-out group-hover:scale-105"
              />
            </motion.div>
          </div>

          {/* RIGHT SIDE: Contact Form */}
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="lg:col-span-7 bg-white p-8 md:p-12 rounded-3xl shadow-xl border border-[#4B1D52]/10"
          >
            <form className="space-y-6 text-foreground">
              
              {/* Name */}
              <motion.div variants={fadeInUp}>
                <label className="block text-sm font-semibold text-[#4B1D52] mb-2">Name *</label>
                <input type="text" required className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-[#F7F3FA]/50 focus:bg-white focus:border-[#4B1D52] focus:ring-1 focus:ring-[#4B1D52] outline-none transition-all" />
              </motion.div>

              {/* Email */}
              <motion.div variants={fadeInUp}>
                <label className="block text-sm font-semibold text-[#4B1D52] mb-2">Email *</label>
                <input type="email" required className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-[#F7F3FA]/50 focus:bg-white focus:border-[#4B1D52] focus:ring-1 focus:ring-[#4B1D52] outline-none transition-all" />
              </motion.div>

              {/* City & State */}
              <motion.div variants={fadeInUp}>
                <label className="block text-sm font-semibold text-[#4B1D52] mb-2">City & State *</label>
                <input type="text" required className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-[#F7F3FA]/50 focus:bg-white focus:border-[#4B1D52] focus:ring-1 focus:ring-[#4B1D52] outline-none transition-all" />
              </motion.div>

              {/* Country */}
              <motion.div variants={fadeInUp}>
                <label className="block text-sm font-semibold text-[#4B1D52] mb-2">Country *</label>
                <select required className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-[#F7F3FA]/50 focus:bg-white focus:border-[#4B1D52] focus:ring-1 focus:ring-[#4B1D52] outline-none transition-all appearance-none cursor-pointer">
                  <option value="">- Select Country -</option>
                  {countries.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </motion.div>

              {/* Phone */}
              <motion.div variants={fadeInUp}>
                <label className="block text-sm font-semibold text-[#4B1D52] mb-2">Phone *</label>
                <input type="tel" required className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-[#F7F3FA]/50 focus:bg-white focus:border-[#4B1D52] focus:ring-1 focus:ring-[#4B1D52] outline-none transition-all" />
              </motion.div>

              {/* Spiritual Practice */}
              <motion.div variants={fadeInUp}>
                <label className="block text-sm font-semibold text-[#4B1D52] mb-2">What is your current spiritual practice? *</label>
                <input type="text" required className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-[#F7F3FA]/50 focus:bg-white focus:border-[#4B1D52] focus:ring-1 focus:ring-[#4B1D52] outline-none transition-all" />
              </motion.div>

              {/* SiA Member Radio */}
              <motion.div variants={fadeInUp} className="space-y-3">
                <label className="block text-sm font-semibold text-[#4B1D52]">Are you SiA Member? *</label>
                <div className="flex gap-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="sia_member" value="yes" required className="w-4 h-4 text-[#4B1D52] focus:ring-[#4B1D52]" />
                    <span>Yes</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="sia_member" value="no" required className="w-4 h-4 text-[#4B1D52] focus:ring-[#4B1D52]" />
                    <span>No</span>
                  </label>
                </div>
              </motion.div>

              {/* Receive Updates Radio */}
              <motion.div variants={fadeInUp} className="space-y-3">
                <label className="block text-sm font-semibold text-[#4B1D52]">Would you like to receive updates on your phone? *</label>
                <div className="flex gap-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="phone_updates" value="yes" required className="w-4 h-4 text-[#4B1D52] focus:ring-[#4B1D52]" />
                    <span>Yes</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="phone_updates" value="no" required className="w-4 h-4 text-[#4B1D52] focus:ring-[#4B1D52]" />
                    <span>No</span>
                  </label>
                </div>
              </motion.div>

              {/* Message Regarding Dropdown */}
              <motion.div variants={fadeInUp}>
                <label className="block text-sm font-semibold text-[#4B1D52] mb-2">Your Message is Regarding... *</label>
                <select required className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-[#F7F3FA]/50 focus:bg-white focus:border-[#4B1D52] focus:ring-1 focus:ring-[#4B1D52] outline-none transition-all appearance-none cursor-pointer">
                  <option value="">- Select Topic -</option>
                  <option value="General Enquiry">General Enquiry</option>
                  <option value="Membership">Membership</option>
                  <option value="Events">Events</option>
                  <option value="Invite Jake for Satsangs">Invite Jake for Satsangs</option>
                  <option value="Other">Other</option>
                </select>
              </motion.div>

              {/* Your Message */}
              <motion.div variants={fadeInUp}>
                <label className="block text-sm font-semibold text-[#4B1D52] mb-2">Your Message *</label>
                <textarea rows={5} required className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-[#F7F3FA]/50 focus:bg-white focus:border-[#4B1D52] focus:ring-1 focus:ring-[#4B1D52] outline-none transition-all resize-none"></textarea>
              </motion.div>

              {/* Generic Select */}
              <motion.div variants={fadeInUp}>
                <label className="block text-sm font-semibold text-[#4B1D52] mb-2">Select *</label>
                <select required className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-[#F7F3FA]/50 focus:bg-white focus:border-[#4B1D52] focus:ring-1 focus:ring-[#4B1D52] outline-none transition-all appearance-none cursor-pointer">
                  <option value="">- Select -</option>
                  <option value="One">One</option>
                  <option value="Two">Two</option>
                  <option value="Three">Three</option>
                </select>
              </motion.div>

              {/* Submit Button */}
              <motion.div variants={fadeInUp} className="pt-4">
                <button 
                  type="submit" 
                  className="w-full py-4 bg-[#4B1D52] text-white rounded-xl font-bold uppercase tracking-widest hover:bg-[#7D2E61] transition-colors shadow-md hover:shadow-lg"
                >
                  Send Message
                </button>
              </motion.div>

            </form>
          </motion.div>
        </div>
      </div>
    </section>
  );
}