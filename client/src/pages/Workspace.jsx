import { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../auth/context.js';
import { useEvents } from '../api/events-context.js';
import { request } from '../api/request.js';
import './InformationPages.css';

export function OrganizerDashboard() {
    const { user, loading } = useAuth();
    if (loading) return <main className="info-page" role="status"><p className="loading-p">Loading your organizer workspace…</p></main>;
    if (!user) return (
        <main className="info-page">
            <div className="info-container info-card auth-reminder-box">
                <span className="info-eyebrow">ORGANIZER PORTAL</span>
                <h1>Organizer Workspace Access</h1>
                <p>Sign in with your Event Organizer account to publish events, manage ticket tiers, and view attendance.</p>
                <Link className="info-button" to="/login?role=organizer">Sign in as Organizer →</Link>
            </div>
        </main>
    );
    if (user.role !== 'organizer') return (
        <main className="info-page">
            <div className="info-container info-card auth-reminder-box">
                <span className="info-eyebrow">BUYER ACCOUNT</span>
                <h1>Organizer Access Required</h1>
                <p>Your current account is registered as a Ticket Buyer. You can explore events and access your saved digital passes.</p>
                <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginTop: '16px' }}>
                    <Link className="info-button" to="/events">Explore Events</Link>
                    <Link className="info-button secondary" to="/register?role=organizer">Create Organizer Account</Link>
                </div>
            </div>
        </main>
    );
    return <OrganizerWorkspace />;
}

function OrganizerWorkspace() {
    const { user } = useAuth();
    const { refresh } = useEvents();
    const [events, setEvents] = useState([]);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [busy, setBusy] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let active = true;
        request('organizer/events').then((result) => { if (active) setEvents(result.events); })
            .catch((err) => { if (active) setError(err.message); }).finally(() => { if (active) setLoading(false); });
        return () => { active = false; };
    }, []);

    async function publish(e) {
        e.preventDefault();
        if (busy) return;
        const form = e.currentTarget;
        const data = Object.fromEntries(new FormData(form));
        setBusy(true); setError(''); setSuccess('');
        try {
            const result = await request('events', {
                ...data,
                startDate: new Date(data.startDate).toISOString(),
                pricePaise: Math.round(Number(data.price) * 100),
                capacity: Number(data.capacity)
            });
            setEvents((items) => [...items, result.event]);
            setSuccess(`🎉 "${result.event.title}" is now published and live on the events page!`);
            form.reset();
            await refresh();
        } catch (err) {
            setError(err.message);
        } finally {
            setBusy(false);
        }
    }

    return (
        <main className="info-page">
            <div className="info-container">
                <header className="info-header">
                    <span className="info-eyebrow">ORGANIZER BOX OFFICE</span>
                    <h1>{user.name}&apos;s Event Workspace</h1>
                    <p>Publish listings, configure VIP and Early-Bird ticket pricing, and track live attendee check-ins.</p>
                </header>

                <div className="workspace-summary-cards">
                    <div className="workspace-stat-box">
                        <span className="stat-icon-wrap">🎪</span>
                        <div>
                            <strong>{events.length}</strong>
                            <p>Published Events</p>
                        </div>
                    </div>
                    <div className="workspace-stat-box">
                        <span className="stat-icon-wrap">🛡️</span>
                        <div>
                            <strong>100%</strong>
                            <p>Aadhaar / PAN Safe Entry</p>
                        </div>
                    </div>
                    <div className="workspace-stat-box">
                        <span className="stat-icon-wrap">🎟️</span>
                        <div>
                            <strong>Active</strong>
                            <p>Direct Box Office</p>
                        </div>
                    </div>
                </div>

                <div className="info-two-column">
                    <form className="info-card" onSubmit={publish}>
                        <h2>+ Publish New Event</h2>
                        <p className="form-sub-desc">Fill in event specifics. Your event will be instantly discoverable.</p>

                        <label htmlFor="new-title">Event Title *</label>
                        <input id="new-title" name="title" required maxLength={120} placeholder="e.g. Bangalore Indie Music Night" />

                        <label htmlFor="new-category">Category *</label>
                        <select id="new-category" name="category">
                            {['Music', 'Technology', 'Comedy', 'Art', 'Business', 'Food', 'Dance', 'Workshop'].map((name) => (
                                <option key={name}>{name}</option>
                            ))}
                        </select>

                        <label htmlFor="new-date">Date and Time *</label>
                        <input id="new-date" type="datetime-local" name="startDate" required />

                        <label htmlFor="new-venue">Venue Address & City *</label>
                        <input id="new-venue" name="venue" required maxLength={200} placeholder="e.g. Phoenix Marketcity, Whitefield, Bangalore" />

                        <div className="info-two-column">
                            <div>
                                <label htmlFor="new-price">Price per Ticket (₹) *</label>
                                <input id="new-price" type="number" name="price" required min="0" max="1000000" step="0.01" placeholder="999" />
                            </div>
                            <div>
                                <label htmlFor="new-capacity">Total Seat Capacity *</label>
                                <input id="new-capacity" type="number" name="capacity" required min="1" max="100000" step="1" placeholder="250" />
                            </div>
                        </div>

                        <label htmlFor="new-image">Event Cover Image URL (HTTPS)</label>
                        <input id="new-image" name="image" type="url" maxLength={1000} placeholder="https://images.unsplash.com/..." />

                        <label htmlFor="new-description">Event Description & Highlights *</label>
                        <textarea id="new-description" name="description" required minLength={20} maxLength={3000} rows={5} placeholder="Tell attendees what they will experience, artist lineup, schedule..." />

                        <button className="info-button" disabled={busy}>
                            {busy ? 'Publishing Event Listing…' : '🚀 Publish Event Listing'}
                        </button>
                        {error && <p className="auth-error" role="alert">{error}</p>}
                        {success && <p className="info-success" role="status">{success}</p>}
                    </form>

                    <section className="info-card">
                        <h2>Your Published Events ({events.length})</h2>
                        {loading ? (
                            <p role="status">Loading events…</p>
                        ) : !events.length ? (
                            <div className="empty-workspace-events">
                                <p>You haven&apos;t published any events yet.</p>
                                <small>Use the form on the left to publish your first live experience.</small>
                            </div>
                        ) : (
                            <div className="organizer-events-list">
                                {events.map((event) => (
                                    <article className="organizer-event-card" key={event.id}>
                                        <div className="organizer-event-badge-row">
                                            <span className="info-tag">{event.category}</span>
                                            <span className="verified-pill">Live on EventBook</span>
                                        </div>
                                        <h3>{event.title}</h3>
                                        <p className="event-meta">📅 {event.date} · {event.time}</p>
                                        <p className="event-venue">📍 {event.venue}</p>
                                        <div className="event-metrics">
                                            <span><strong>{event.price}</strong> / ticket</span>
                                            <span>Capacity: <strong>{event.capacity}</strong></span>
                                        </div>
                                        <Link to={`/events/${event.id}`} className="view-listing-link">
                                            View Public Listing →
                                        </Link>
                                    </article>
                                ))}
                            </div>
                        )}
                    </section>
                </div>
            </div>
        </main>
    );
}

export function MyBookings() {
    const { user, loading } = useAuth();
    if (loading) return <main className="info-page" role="status"><p className="loading-p">Loading your tickets…</p></main>;
    if (!user) return <Navigate to="/login" replace />;
    return <BookingHistory user={user} />;
}

function BookingHistory({ user }) {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        let active = true;
        request('bookings').then((result) => { if (active) setBookings(result.bookings); })
            .catch((err) => { if (active) setError(err.message); }).finally(() => { if (active) setLoading(false); });
        return () => { active = false; };
    }, []);

    return (
        <main className="info-page">
            <div className="info-container">
                <header className="info-header">
                    <span className="info-eyebrow">YOUR DIGITAL PASSES</span>
                    <h1>{user.name}&apos;s Booked Tickets</h1>
                    <p>All verified event admission passes issued to your account.</p>
                </header>

                {error && <p className="auth-error" role="alert">{error}</p>}

                {loading ? (
                    <p role="status" className="loading-p">Loading your digital passes…</p>
                ) : !error && !bookings.length ? (
                    <section className="info-card empty-bookings-card">
                        <span className="empty-icon" aria-hidden="true">🎟️</span>
                        <h2>No Bookings Found Yet</h2>
                        <p>You haven&apos;t booked any tickets yet. Explore upcoming concerts, workshops, and comedy shows!</p>
                        <Link className="info-button" to="/events">Discover Events →</Link>
                    </section>
                ) : (
                    <div className="bookings-grid">
                        {bookings.map((booking) => {
                            const idLabel = booking.customer?.aadhaar 
                                ? `Aadhaar: •••• •••• ${booking.customer.aadhaar.slice(-4)}`
                                : booking.customer?.pan 
                                ? `PAN: ${booking.customer.pan.slice(0, 3)}••••${booking.customer.pan.slice(-2)}`
                                : "ID Verified Gate Pass";

                            return (
                                <article className="booking-pass-card" key={booking.id}>
                                    <div className="booking-pass-header">
                                        <div>
                                            <span className="pass-pill">{booking.customer?.ticketType || "Official Pass"}</span>
                                            <h2>{booking.eventTitle}</h2>
                                        </div>
                                        <div className="pass-status-badge">
                                            ✓ Confirmed Pass
                                        </div>
                                    </div>

                                    <div className="booking-pass-body">
                                        <div className="pass-details-col">
                                            <p>📅 <strong>Date:</strong> {booking.date}</p>
                                            <p>📍 <strong>Venue:</strong> {booking.venue}</p>
                                            <p>👤 <strong>Attendee:</strong> {booking.customer?.name || user.name}</p>
                                            <p>🛡️ <strong>Govt ID:</strong> <span className="id-masked-text">{idLabel}</span></p>
                                            <p>💳 <strong>Payment:</strong> {booking.method?.toUpperCase().replace('_', ' ')} · {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(booking.totalPaise / 100)} ({booking.quantity} {booking.quantity === 1 ? 'ticket' : 'tickets'})</p>
                                        </div>

                                        <div className="pass-qr-col">
                                            <div className="qr-box-small">
                                                <div className="qr-simulated-pattern" />
                                                <small>GATE SCAN</small>
                                            </div>
                                            <code>{booking.id}</code>
                                        </div>
                                    </div>

                                    <div className="booking-pass-footer">
                                        <Link to={`/events/${booking.eventId}`} className="view-event-link">
                                            View Event Listing →
                                        </Link>
                                        <button
                                            type="button"
                                            className="print-single-ticket-btn print-hide"
                                            onClick={() => window.print()}
                                        >
                                            🖨️ Print Pass
                                        </button>
                                    </div>
                                </article>
                            );
                        })}
                    </div>
                )}
            </div>
        </main>
    );
}

