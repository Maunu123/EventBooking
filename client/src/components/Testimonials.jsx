import "./Testimonials.css";

const TESTIMONIALS = [
  {
    name: "Rhea Sharma",
    role: "Tech Enthusiast & Founder",
    city: "Bengaluru",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80",
    rating: 5,
    text: "The Aadhaar Pay feature made my group booking of 6 passes for HackIndia 2025 instantaneous. The QR pass on my phone scanned in less than 2 seconds at entry!",
    badge: "Verified Attendee",
  },
  {
    name: "Arjun Mehta",
    role: "Senior Product Architect",
    city: "Mumbai",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80",
    rating: 5,
    text: "Corporate billing with PAN verification was completely seamless. Got the GST invoice and official ticket pass immediately in my dashboard. 10/10 experience.",
    badge: "Corporate VIP",
  },
  {
    name: "Pooja Varma",
    role: "Music & Festival Lover",
    city: "Delhi NCR",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80",
    rating: 5,
    text: "Booked Sunburn Arena passes using UPI QR. The live countdown timer and instant PDF download gave total peace of mind. Best event booking platform in India!",
    badge: "Festival Pass Holder",
  },
];

export default function Testimonials() {
  return (
    <section className="testimonials-section" aria-label="Customer Reviews">
      <div className="testimonials-container">
        <div className="section-header-centered">
          <div className="badge-pill">💬 Verified Reviews</div>
          <h2 className="section-title">Loved by 250,000+ Eventgoers</h2>
          <p className="section-subtitle">
            Here is what music lovers, tech professionals, and festival-goers say about their booking experience.
          </p>
        </div>

        <div className="testimonials-grid">
          {TESTIMONIALS.map((t, idx) => (
            <div key={idx} className="testimonial-card">
              <div className="testimonial-header">
                <img src={t.avatar} alt={t.name} className="testimonial-avatar" />
                <div className="testimonial-author-info">
                  <div className="testimonial-name">{t.name}</div>
                  <div className="testimonial-role">{t.role} • {t.city}</div>
                </div>
              </div>

              <div className="testimonial-stars" aria-label={`Rating ${t.rating} out of 5`}>
                {"★".repeat(t.rating)}
              </div>

              <p className="testimonial-text">"{t.text}"</p>

              <div className="testimonial-footer">
                <span className="verified-chip">
                  <span className="check-icon">✓</span> {t.badge}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
