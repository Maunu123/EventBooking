import { useState } from "react";
import "./FAQ.css";

const FAQS = [
  {
    q: "How does Aadhaar Pay / AePS and PAN verification work?",
    a: "During checkout, you can select Aadhaar Pay (which verifies your 12-digit UID via simulated AePS instant biometric/OTP authentication) or PAN Verified Checkout for GST corporate invoicing and high-tier VIP passes. All ID credentials are encrypted and securely masked on your digital pass."
  },
  {
    q: "What payment methods are supported?",
    a: "We support Instant UPI QR (GPay, PhonePe, Paytm, BHIM), Aadhaar Pay (AePS), PAN Verified Corporate Billing, Credit & Debit Cards (RuPay, Visa, Mastercard), and Net Banking across 50+ Indian banks."
  },
  {
    q: "How do I receive and scan my event ticket?",
    a: "Immediately upon payment confirmation, you receive a dynamic Boarding Pass Ticket with a high-resolution QR code, attendee details, and booking reference. You can download the PDF, print it, or present the live QR code on your mobile at the event entrance."
  },
  {
    q: "Can I get a refund or cancel my booking?",
    a: "Refunds are processed according to the organizer's cancellation policy. Standard cancellation is available up to 48 hours before the event start time. Refunds are credited to the original payment source within 3-5 business days."
  },
  {
    q: "How can organizers publish and manage events?",
    a: "Organizers can register an account, navigate to the Organizer Workspace, create events with custom ticket tiers (Early Bird, Standard, VIP), upload venue banners, monitor live revenue analytics, and manage attendee lists."
  }
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(0);

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? -1 : index);
  };

  return (
    <section className="faq-section" aria-label="Frequently Asked Questions">
      <div className="faq-container">
        <div className="section-header-centered">
          <div className="badge-pill">❓ Need Help?</div>
          <h2 className="section-title">Frequently Asked Questions</h2>
          <p className="section-subtitle">
            Everything you need to know about booking passes, Aadhaar & PAN security, and digital tickets.
          </p>
        </div>

        <div className="faq-accordion">
          {FAQS.map((item, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div key={idx} className={`faq-item ${isOpen ? "open" : ""}`}>
                <button
                  className="faq-question-btn"
                  onClick={() => toggleFAQ(idx)}
                  aria-expanded={isOpen}
                >
                  <span className="faq-q-text">{item.q}</span>
                  <span className="faq-toggle-icon">{isOpen ? "−" : "+"}</span>
                </button>
                {isOpen && (
                  <div className="faq-answer">
                    <p>{item.a}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
