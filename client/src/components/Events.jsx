import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useEvents } from "../api/events-context.js";
import EventImage from './EventImage.jsx';
import './Events.css';

export default function Events({ featured = false }) {
    const { events, notice, loading } = useEvents();
    const [params, setParams] = useSearchParams();
    const [sortBy, setSortBy] = useState('featured');

    const query = featured ? '' : (params.get('q') || '').trim();
    const category = featured ? 'All' : params.get('category') || 'All';
    const categories = ['All', ...new Set(events.map((event) => String(event.category || '').trim()).filter(Boolean))];
    const normalizedQuery = query.toLocaleLowerCase();
    const normalizedCategory = category.toLocaleLowerCase();

    let matches = events.filter((event) => {
        const eventCategory = String(event.category || '').trim().toLocaleLowerCase();
        const searchable = [event.title, event.category, event.location, event.venue, event.organizer]
            .filter(Boolean).join(' ').toLocaleLowerCase();
        return (category === 'All' || eventCategory === normalizedCategory) && searchable.includes(normalizedQuery);
    });

    if (sortBy === 'price-low') {
        matches = [...matches].sort((a, b) => {
            const pa = a.pricePaise ?? (Number(a.price?.replace(/[^0-9.]/g, '') || 0) * 100);
            const pb = b.pricePaise ?? (Number(b.price?.replace(/[^0-9.]/g, '') || 0) * 100);
            return pa - pb;
        });
    } else if (sortBy === 'price-high') {
        matches = [...matches].sort((a, b) => {
            const pa = a.pricePaise ?? (Number(a.price?.replace(/[^0-9.]/g, '') || 0) * 100);
            const pb = b.pricePaise ?? (Number(b.price?.replace(/[^0-9.]/g, '') || 0) * 100);
            return pb - pa;
        });
    }

    const visible = featured ? events.slice(0, 4) : matches;

    function filter(key, value) {
        const next = new URLSearchParams(params);
        if (!value || value === 'All') next.delete(key); else next.set(key, value);
        setParams(next, { replace: true });
    }

    function clearFilters() {
        setParams({}, { replace: true });
        setSortBy('featured');
    }

    const categoryIcons = {
        All: '✨',
        Music: '🎵',
        Technology: '💻',
        Comedy: '🎭',
        Workshop: '🎨',
        Business: '💼',
        Food: '🍕',
        Art: '🖌️',
        Dance: '💃'
    };

    return (
        <section className="events-section" id="events-grid">
            {notice && <p className="info-notice" role="status">{notice}</p>}

            <div className="events-heading-row">
                <div className="events-header">
                    <span className="events-subtitle">{featured ? '🔥 TOP PICK EXPERIENCES' : 'EXPLORE ALL EVENTS'}</span>
                    {featured ? <h2 className="featured-heading">Worth Going Out For</h2> : <h1>Find Your Next Experience</h1>}
                    <p className="events-description">
                        {featured ? 'A handpicked curation of the most anticipated events across town.' : 'Search live concerts, tech meetups, workshops & comedy shows with instant verified booking.'}
                    </p>
                </div>
                {featured && (
                    <Link className="events-see-all-btn" to="/events">
                        Explore All ({events.length}) Events <span aria-hidden="true">→</span>
                    </Link>
                )}
            </div>

            {!featured && (
                <div className="events-controls-panel">
                    <div className="events-search-row">
                        <div className="search-input-wrap">
                            <span className="search-input-icon" aria-hidden="true">🔍</span>
                            <label className="visually-hidden" htmlFor="events-search">Search events</label>
                            <input
                                id="events-search"
                                type="search"
                                value={params.get('q') || ''}
                                onChange={(e) => filter('q', e.target.value)}
                                placeholder="Search by title, artist, category, or venue..."
                            />
                        </div>

                        <div className="events-sort-wrap">
                            <label htmlFor="events-sort">Sort by:</label>
                            <select
                                id="events-sort"
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                            >
                                <option value="featured">Featured / Recommended</option>
                                <option value="price-low">Price: Low to High</option>
                                <option value="price-high">Price: High to Low</option>
                            </select>
                        </div>

                        {(query || category !== 'All' || sortBy !== 'featured') && (
                            <button className="clear-event-filters" type="button" onClick={clearFilters}>
                                ✕ Reset
                            </button>
                        )}
                    </div>

                    <div className="event-category-filters" aria-label="Filter by category">
                        {categories.map((item) => {
                            const icon = categoryIcons[item] || '🎯';
                            const count = events.filter((e) => item === 'All' || String(e.category || '').trim().toLowerCase() === item.toLowerCase()).length;
                            return (
                                <button
                                    type="button"
                                    key={item}
                                    className={`category-filter-chip ${item.toLowerCase() === normalizedCategory ? 'active' : ''}`}
                                    aria-pressed={item.toLowerCase() === normalizedCategory}
                                    onClick={() => filter('category', item)}
                                >
                                    <span>{icon} {item}</span>
                                    <span className="category-chip-count">{count}</span>
                                </button>
                            );
                        })}
                    </div>

                    <p className="events-result-count" role="status">
                        {loading ? 'Loading curated events…' : `Showing ${matches.length} ${matches.length === 1 ? 'event' : 'events'}${category !== 'All' ? ` in ${category}` : ''}${query ? ` matching "${query}"` : ''}`}
                    </p>
                </div>
            )}

            <div className="events-grid">
                {visible.map((event) => (
                    <article className="event-card" key={event.id}>
                        <Link className="event-image-wrap" to={`/events/${event.id}`} aria-label={`View details for ${event.title}`}>
                            <EventImage src={event.image} alt="" loading="lazy" />
                            <span className="event-card-category-badge">{event.category}</span>
                            <span className="event-card-id-verified" title="Aadhaar and PAN Verified">
                                🛡️ ID Pass
                            </span>
                            <div className="event-image-hover-overlay">
                                <span>View Details & Tickets →</span>
                            </div>
                        </Link>

                        <div className="event-info">
                            <div className="event-date-row">
                                <span className="event-calendar-tag">📅 {event.date}</span>
                                <span className="event-time-tag">⏰ {event.time.split(' - ')[0]}</span>
                            </div>

                            <h2 className="event-card-title">
                                <Link to={`/events/${event.id}`}>{event.title}</Link>
                            </h2>

                            <p className="event-location-text">
                                <span aria-hidden="true">📍</span> {event.location || event.venue}
                            </p>

                            {/* Booking progress indicator */}
                            <div className="event-availability-bar">
                                <div className="event-progress-track">
                                    <div className="event-progress-fill" style={{ width: '80%' }} />
                                </div>
                                <div className="event-progress-text">
                                    <span>🔥 Fast Selling</span>
                                    <span>{event.tickets || "Limited Spots"}</span>
                                </div>
                            </div>

                            <div className="event-card-bottom">
                                <div className="event-price-block">
                                    <small>Price</small>
                                    <strong>{event.price}</strong>
                                </div>
                                <Link
                                    to={`/events/${event.id}/book`}
                                    className="book-now-card-btn"
                                    aria-label={`Book ticket for ${event.title}`}
                                >
                                    Book Now →
                                </Link>
                            </div>
                        </div>
                    </article>
                ))}
            </div>

            {!loading && !visible.length && (
                <div className="events-empty">
                    <span className="empty-icon" aria-hidden="true">🎪</span>
                    <h2>No events found matching your criteria</h2>
                    <p>Try searching for another topic, interest, or reset your current filters.</p>
                    <button type="button" className="clear-filters-btn" onClick={clearFilters}>
                        Reset All Filters
                    </button>
                </div>
            )}
        </section>
    );
}

