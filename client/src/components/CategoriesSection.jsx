import "./CategoriesSection.css";

const CATEGORIES = [
  { id: "Concert", name: "Live Music & Concerts", icon: "🎸", count: "48+ Events", gradient: "from-purple to-pink" },
  { id: "Tech", name: "Tech & Hackathons", icon: "💻", count: "32+ Events", gradient: "from-blue to-cyan" },
  { id: "Festival", name: "Cultural & Festivals", icon: "🎭", count: "29+ Events", gradient: "from-amber to-orange" },
  { id: "Conference", name: "Business & Summits", icon: "🚀", count: "24+ Events", gradient: "from-emerald to-teal" },
  { id: "Comedy", name: "Standup Comedy", icon: "🎙️", count: "19+ Events", gradient: "from-rose to-red" },
  { id: "Sports", name: "Sports & Fitness", icon: "🏆", count: "15+ Events", gradient: "from-indigo to-violet" },
];

export default function CategoriesSection() {
  const handleCategoryClick = (catId) => {
    const eventsSection = document.getElementById("events-section") || document.querySelector(".events-section");
    if (eventsSection) {
      eventsSection.scrollIntoView({ behavior: "smooth" });
      // Dispatch custom event or click the category chip if present
      const chip = document.querySelector(`[data-category="${catId}"]`);
      if (chip) chip.click();
    }
  };

  return (
    <section className="categories-section" aria-label="Event Categories">
      <div className="categories-container">
        <div className="section-header-centered">
          <div className="badge-pill">✨ Explore By Passion</div>
          <h2 className="section-title">Trending Event Categories</h2>
          <p className="section-subtitle">
            From pulse-pounding concerts to high-impact tech summits, find experiences curated for you.
          </p>
        </div>

        <div className="categories-grid">
          {CATEGORIES.map((cat) => (
            <div
              key={cat.id}
              className="category-card"
              onClick={() => handleCategoryClick(cat.id)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === "Enter" && handleCategoryClick(cat.id)}
            >
              <div className="category-icon-box">
                <span className="category-icon">{cat.icon}</span>
              </div>
              <div className="category-details">
                <h3 className="category-title">{cat.name}</h3>
                <span className="category-count">{cat.count}</span>
              </div>
              <span className="category-arrow" aria-hidden="true">→</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
