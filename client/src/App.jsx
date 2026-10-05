import { OrganizerDashboard, MyBookings } from "./pages/Workspace.jsx";
import EventsProvider from "./api/EventsProvider.jsx";
import ScrollToTop from "./components/ScrollToTop.jsx";
import AuthProvider from "./auth/AuthProvider.jsx";
import { AuthPage, AccountPage } from "./pages/Auth.jsx";
import { Pricing, Contact, Resources } from "./pages/InformationPages.jsx";
import {
    BrowserRouter,
    Routes,
    Route,
    Link
} from "react-router-dom";

import Navbar from './components/Navbar.jsx';
import Hero from "./components/Hero.jsx";
import TrustStats from "./components/TrustStats.jsx";
import CategoriesSection from "./components/CategoriesSection.jsx";
import Events from "./components/Events.jsx";
import EventDetails from "./components/EventDetails.jsx";
import Footer from "./components/Footer.jsx";
import WhyChoose from "./components/WhyChoose.jsx";
import HowItWorks from "./components/HowItWorks.jsx";
import Testimonials from "./components/Testimonials.jsx";
import FAQ from "./components/FAQ.jsx";
import CTA from "./components/CTA.jsx"; 
import TicketBooking from "./components/TicketBooking.jsx";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <EventsProvider>
          <ScrollToTop />
          <Navbar />
          <Routes>
            <Route path="/login" element={<AuthPage key="login" />} />
            <Route path="/register" element={<AuthPage key="register" register />} />
            <Route path="/account" element={<AccountPage />} />
            <Route path="/my-bookings" element={<MyBookings />} />
            <Route path="/create-event" element={<OrganizerDashboard />} />

            <Route
              path="/"
              element={
                <>
                  <Hero />
                  <TrustStats />
                  <CategoriesSection />
                  <Events featured />
                  <HowItWorks />
                  <WhyChoose />
                  <Testimonials />
                  <FAQ />
                  <CTA />
                </>
              }
            />

            <Route path="/events" element={<Events />} />
            <Route path="/events/:id" element={<EventDetails />} />
            <Route path="/events/:id/book" element={<TicketBooking />} />
            
            <Route path="/box-office" element={<OrganizerDashboard />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/resources" element={<Resources />} />
            <Route path="/features" element={<WhyChoose />} />

            <Route path="*" element={
              <section className="page-not-found">
                <h1>Page unavailable</h1>
                <p>This page does not exist or has not been added yet.</p>
                <Link to="/events">Back to Events</Link>
              </section>
            } />
          </Routes>
          <Footer />
        </EventsProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;