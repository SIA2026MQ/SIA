import { Route, Routes } from "react-router-dom";
import { Footer } from "@/components/common/Footer";
import { Navbar } from "@/components/common/Navbar";
import StagesDetail from "@/routes/StagesDetail";
import AboutPage from "@/routes/about";
import Events from "@/routes/events";
import AdminPage from "@/routes/admin";
import Subscripton from "./routes/subscription";
import CartPage from "@/routes/cart";
import BlogDetailPage from "@/routes/blog.$slug";
import BlogPage from "@/routes/blog";
import { ContactPage } from "@/routes/contact";
import CoursesPage from "@/routes/courses";
import WebinarsPage from "./routes/webinars";
import HomePage from "@/routes/index";
import LoginPage from "@/routes/login";
import SIAPage from "@/routes/sia";
import ScrollToTop from "./components/common/ScrollToTop";
import PrivacyPolicy from "./components/legal/PrivacyPolicy";
import TermsConditions from "./components/legal/TermsCondiction";
import CancellationPolicy from "./components/legal/CacellationPolicy";
import MyLearningPage from "@/routes/my-learning";
import RetreatsPage from "@/routes/retreats";
import SatsungsQnAPage from "@/routes/ScheduleTab";
import LearningPage from "@/pages/LearnPage";
import Activity from "@/routes/Activities";
import Joinpage from "@/routes/join";

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
          <Route path="/stages" element={<StagesDetail />} />
          <Route path="/sia" element={<SIAPage />} />
          <Route path="/courses" element={<CoursesPage />} />
          <Route path="/satsungs-qna" element={<SatsungsQnAPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/join" element={<Joinpage />} />
          <Route path="/blog" element={<BlogPage />} />
          <Route path="/blog/:slug" element={<BlogDetailPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/activities" element={<Activity />} />
          <Route path="/webinars" element={<WebinarsPage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms-conditions" element={<TermsConditions />} />
          <Route path="/cancellation-policy" element={<CancellationPolicy />} />
          <Route path="/my-learning" element={<MyLearningPage />} />
          <Route path="/membership" element={<Subscripton />} />
          <Route path="/retreats" element={<RetreatsPage />} />
          <Route path="/events" element={<Events />} />
          <Route path="*" element={<NotFoundPage />} />
          <Route path="/learn/:courseId" element={<LearningPage />} />
        </Routes>
      </main>
      <Footer />
    </>
  );
}
