import "./TrustStats.css";

const STATS = [
  { value: "250K+", label: "Happy Attendees", icon: "🎉", desc: "Across 40+ Indian cities" },
  { value: "1,200+", label: "Verified Events", icon: "🎟️", desc: "Music, tech, food & sports" },
  { value: "100%", label: "Verified Passes", icon: "🛡️", desc: "Aadhaar & PAN fraud-proof" },
  { value: "4.9/5", label: "Organizer Rating", icon: "⭐", desc: "From 500+ top event managers" },
];

export default function TrustStats() {
  return (
    <section className="trust-stats-section" aria-label="Platform Statistics">
      <div className="trust-stats-container">
        <div className="trust-stats-grid">
          {STATS.map((stat, idx) => (
            <div key={idx} className="stat-card">
              <div className="stat-icon-wrapper">{stat.icon}</div>
              <div className="stat-info">
                <div className="stat-value-gradient">{stat.value}</div>
                <div className="stat-label">{stat.label}</div>
                <div className="stat-desc">{stat.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
