import { Route, Routes } from "react-router-dom";
import { Footer } from "@/components/common/Footer";
import { Navbar } from "@/components/common/Navbar";
import AboutPage from "@/routes/about";
import AdminPage from "@/routes/admin";
import SatsungsPage from "./routes/satsungs";
import CartPage from "@/routes/cart";
import BlogDetailPage from "@/routes/blog.$slug";
import BlogPage from "@/routes/blog";
import ContactPage from "@/routes/contact";
import CoursesPage from "@/routes/courses";

import HomePage from "@/routes/index";
import LoginPage from "@/routes/login";
import SIAPage from "@/routes/sia";
import ScrollToTop from "./components/common/ScrollToTop";
import PrivacyPolicy from "./components/legal/PrivacyPolicy";
import TermsConditions from "./components/legal/TermsCondiction";
import CancellationPolicy from "./components/legal/CacellationPolicy";
import MyLearningPage from "@/routes/my-learning";
import RetreatsPage from "@/routes/retreats";
function NotFoundPage() {
  return (
    <section className="section-odd min-h-screen pt-32">
      <div className="sia-container text-center">
        <h1 className="sia-h1">Page not found</h1>
      </div>
    </section>
  );
}

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/sia" element={<SIAPage />} />
          <Route path="/courses" element={<CoursesPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/blog" element={<BlogPage />} />
          <Route path="/blog/:slug" element={<BlogDetailPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/cart" element={<CartPage />} />
          
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms-conditions" element={<TermsConditions />} />
          <Route path="/cancellation-policy" element={<CancellationPolicy />} />
          <Route path="/my-learning" element={<MyLearningPage />} />
          <Route path="/satsungs" element={<SatsungsPage />} />
          <Route path="/retreats" element={<RetreatsPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
      <Footer />
    </>
  );
}
