import { useEvents } from "../api/events-context.js";
import { Link, useParams } from "react-router-dom";
import EventImage from './EventImage.jsx';
import "./EventDetails.css";

export default function EventDetails() {
    const { events, loading: eventsLoading } = useEvents();
    const { id } = useParams();

    const event = events.find(
        (event) => String(event.id) === id
    );

    if (eventsLoading && !event) {
        return (
            <div className="event-details-loading" role="status">
                <p>Loading event information...</p>
            </div>
        );
    }

    if (!event) {
        return (
            <div className="event-not-found">
                <h1>Event Not Found</h1>
                <p>The event you are looking for does not exist or has been removed.</p>
                <Link to="/events" className="event-back-btn">
                    Back to All Events
                </Link>
            </div>
        );
    }

    return (
        <div className="event-details-page">
            <div className="details-container">
                <Link to="/events" className="back-button">
                    ← Back to All Events
                </Link>

                {/* Hero Showcase Card */}
                <div className="event-hero-card">
                    <div className="details-image-wrapper">
                        <EventImage src={event.image} alt={event.title} />
                        <span className="details-category-pill">{event.category}</span>
                        <span className="details-verified-pill">🛡️ Aadhaar & PAN Entry</span>
                    </div>

                    <div className="details-hero-info">
                        <div className="details-rating-badge">
                            <span>⭐ {event.rating || "4.9"}</span>
                            <span>({event.reviews || "150+ Reviews"})</span>
                            <span className="details-interest-chip">🔥 {event.interested || "1.2k Interested"}</span>
                        </div>

                        <h1 className="details-title">{event.title}</h1>
                        <p className="details-organizer">
                            Hosted by <strong>{event.organizer}</strong>
                        </p>

                        <div className="details-quick-grid">
                            <div className="quick-item">
                                <span className="quick-icon" aria-hidden="true">📅</span>
                                <div>
                                    <small>Date</small>
                                    <strong>{event.date}</strong>
                                </div>
                            </div>

                            <div className="quick-item">
                                <span className="quick-icon" aria-hidden="true">⏰</span>
                                <div>
                                    <small>Time</small>
                                    <strong>{event.time}</strong>
                                </div>
                            </div>

                            <div className="quick-item">
                                <span className="quick-icon" aria-hidden="true">📍</span>
                                <div>
                                    <small>Location</small>
                                    <strong>{event.location}</strong>
                                </div>
                            </div>

                            <div className="quick-item">
                                <span className="quick-icon" aria-hidden="true">🎟️</span>
                                <div>
                                    <small>Availability</small>
                                    <strong>{event.tickets || "Selling Fast"}</strong>
                                </div>
                            </div>
                        </div>

                        {/* Booking CTA box */}
                        <div className="details-booking-box">
                            <div className="details-price-tag">
                                <small>Ticket Starts At</small>
                                <h2>{event.price}</h2>
                                <span>per person</span>
                            </div>

                            <Link to={`/events/${event.id}/book`} className="details-book-btn">
                                <span>Book Verified Ticket</span>
                                <span aria-hidden="true">→</span>
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Content Sections */}
                <div className="details-content-grid">
                    <div className="details-main-column">
                        {/* About */}
                        <section className="details-section-card">
                            <h2>About This Event</h2>
                            <p className="details-about-p">{event.description}</p>
                        </section>

                        {/* Highlights */}
                        {event.highlights && event.highlights.length > 0 && (
                            <section className="details-section-card">
                                <h2>✨ Event Highlights</h2>
                                <div className="highlights-grid">
                                    {event.highlights.map((highlight, index) => (
                                        <div className="highlight-pill" key={index}>
                                            <span className="check-icon">✓</span>
                                            <span>{highlight}</span>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* Schedule */}
                        {event.schedule && event.schedule.length > 0 && (
                            <section className="details-section-card">
                                <h2>🗓️ Event Timeline & Schedule</h2>
                                <div className="schedule-timeline">
                                    {event.schedule.map((item, index) => (
                                        <div className="schedule-row" key={index}>
                                            <div className="schedule-time">{item[0]}</div>
                                            <div className="schedule-line">
                                                <div className="schedule-dot" />
                                            </div>
                                            <div className="schedule-desc">{item[1]}</div>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* Venue Map */}
                        <section className="details-section-card">
                            <h2>📍 Venue & Location</h2>
                            <div className="venue-detail-box">
                                <div className="venue-map-icon">🗺️</div>
                                <div>
                                    <h3>{event.location}</h3>
                                    <p>{event.venue}</p>
                                    <a
                                        className="venue-map-link"
                                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.venue)}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        Open in Google Maps ↗
                                    </a>
                                </div>
                            </div>
                        </section>
                    </div>

                    {/* Sidebar Trust & Organizer Column */}
                    <div className="details-sidebar-column">
                        <div className="sidebar-trust-card">
                            <h3>🛡️ EventBook Safe Entry</h3>
                            <ul>
                                <li>
                                    <strong>Aadhaar / PAN Verified:</strong> Fast track queue entry at gates with digital boarding pass.
                                </li>
                                <li>
                                    <strong>Instant Digital Pass:</strong> QR code delivered instantly on phone and email.
                                </li>
                                <li>
                                    <strong>Festive Offer Active:</strong> Use code <code>FESTIVE20</code> for 20% off!
                                </li>
                            </ul>
                            <Link to={`/events/${event.id}/book`} className="sidebar-book-btn">
                                Reserve Your Spot Now →
                            </Link>
                        </div>

                        <div className="sidebar-organizer-card">
                            <h3>Organizer Info</h3>
                            <div className="organizer-header">
                                <div className="organizer-avatar-circle">
                                    {event.organizer.slice(0, 2).toUpperCase()}
                                </div>
                                <div>
                                    <h4>{event.organizer}</h4>
                                    <span className="verified-org-tag">✓ Verified Host</span>
                                </div>
                            </div>
                            <p>Official event organizer on EventBook. Direct ticketing with guaranteed valid admission.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

