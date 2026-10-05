import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/context.js';
import { useEvents } from "../api/events-context.js";
import './Hero.css';

export default function Hero() {
    const { events } = useEvents();
    const { user } = useAuth();
    const navigate = useNavigate();

    const spotlightEvent = events[0] || {
        id: 1,
        title: "Live Music Festival 2026",
        category: "Music",
        date: "12 October 2026",
        venue: "Phoenix Marketcity, Bangalore",
        price: "₹999",
        image: "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=1200&q=85"
    };

    function search(e) {
        e.preventDefault();
        const query = new FormData(e.currentTarget).get('search')?.toString().trim();
        navigate(query ? `/events?q=${encodeURIComponent(query)}` : '/events');
    }

    return (
        <section className="hero home-hero">
            <div className="hero-bg-glow" aria-hidden="true" />
            <div className="hero-grid-pattern" aria-hidden="true" />

            <div className="hero-content">
                <div className="hero-pill-badge">
                    <span className="hero-pill-dot" />
                    <span>{user ? `Welcome back, ${user.name.split(' ')[0]}!` : '🔥 5,000+ Verified Tickets Booked This Week'}</span>
                </div>

                <h1 className="hero-title">
                    Less scrolling.<br />
                    <span className="hero-gradient-text">More living.</span>
                </h1>

                <p className="hero-description">
                    Discover handpicked music gigs, tech conferences, comedy specials, and creative workshops. 
                    Fast, secure checkout with <strong>Aadhaar & PAN verification</strong> and instant digital QR passes.
                </p>

                <form className="home-search" onSubmit={search} role="search">
                    <span className="search-icon-decor" aria-hidden="true">🔍</span>
                    <label className="visually-hidden" htmlFor="home-search">Search events</label>
                    <input
                        id="home-search"
                        name="search"
                        type="search"
                        placeholder="Search concerts, tech summits, comedy, pottery..."
                        maxLength={150}
                    />
                    <button type="submit" className="hero-search-submit">
                        <span>Find Events</span>
                        <span aria-hidden="true">→</span>
                    </button>
                </form>

                <div className="home-popular">
                    <span className="popular-label">Popular Vibes:</span>
                    {[
                        { name: 'Music', icon: '🎵' },
                        { name: 'Technology', icon: '💻' },
                        { name: 'Comedy', icon: '🎭' },
                        { name: 'Workshop', icon: '🎨' },
                        { name: 'Food', icon: '🍕' }
                    ].map((item) => (
                        <Link key={item.name} to={`/events?category=${item.name}`} className="popular-chip">
                            <span>{item.icon}</span> {item.name}
                        </Link>
                    ))}
                </div>

                <div className="hero-trust-badges">
                    <div className="trust-badge-item">
                        <span className="trust-badge-icon">🛡️</span>
                        <span>Govt ID Verified Passes</span>
                    </div>
                    <div className="trust-badge-item">
                        <span className="trust-badge-icon">⚡</span>
                        <span>Instant QR Delivery</span>
                    </div>
                    <div className="trust-badge-item">
                        <span className="trust-badge-icon">💳</span>
                        <span>UPI & RuPay Supported</span>
                    </div>
                </div>
            </div>

            <div className="hero-visual">
                <div className="spotlight-card-wrapper">
                    <div className="spotlight-badge-floating">
                        ⭐ TOP FEATURED EVENT
                    </div>

                    <Link className="home-spotlight" to={`/events/${spotlightEvent.id}`}>
                        <img
                            src={spotlightEvent.image}
                            alt={spotlightEvent.title}
                            fetchPriority="high"
                        />
                        <div className="spotlight-overlay" />
                        
                        <div className="spotlight-top-tags">
                            <span className="spotlight-category-tag">{spotlightEvent.category}</span>
                            <span className="spotlight-verified-tag">✓ Aadhaar & PAN Entry</span>
                        </div>

                        <div className="spotlight-copy">
                            <div className="spotlight-meta">
                                <span>📅 {spotlightEvent.date}</span>
                                <span>📍 Bangalore</span>
                            </div>
                            <h2>{spotlightEvent.title}</h2>
                            <p className="spotlight-venue">{spotlightEvent.venue}</p>
                            
                            <div className="spotlight-footer-row">
                                <div className="spotlight-price-box">
                                    <small>Starts from</small>
                                    <strong>{spotlightEvent.price}</strong>
                                </div>
                                <span className="spotlight-cta-btn">
                                    Book Tickets <span aria-hidden="true">→</span>
                                </span>
                            </div>
                        </div>
                    </Link>

                    {/* Social proof floating card */}
                    <div className="spotlight-floating-social">
                        <div className="avatar-stack">
                            <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=80&q=80" alt="Attendee" />
                            <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=80&q=80" alt="Attendee" />
                            <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=80&q=80" alt="Attendee" />
                        </div>
                        <div>
                            <strong>1.4k+ Attendees Going</strong>
                            <p>Fast booking · Limited seats left</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

