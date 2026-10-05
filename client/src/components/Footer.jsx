import { Link } from 'react-router-dom';
import { useAuth } from '../auth/context.js';
import './Footer.css';

const Arrow = () => <span aria-hidden="true">→</span>;

export default function Footer() {
    const { user } = useAuth();
    const organizer = user?.role === 'organizer';

    return (
        <footer className="footer">
            <div className="footer-cta">
                <div>
                    <p className="footer-eyebrow">MAKE YOUR NEXT PLAN COUNT</p>
                    <h2>{organizer ? 'Ready to bring people together?' : 'There’s always something worth showing up for.'}</h2>
                    <p>{organizer ? 'Create a listing, share your event and manage it from your Box Office.' : 'Find live music, workshops, comedy and more experiences around you.'}</p>
                </div>
                <Link className="footer-cta-button" to={organizer ? '/create-event' : '/events'}>
                    {organizer ? 'Create an event' : 'Explore events'} <Arrow />
                </Link>
            </div>

            <div className="footer-main">
                <div className="footer-brand">
                    <Link to="/" className="footer-logo" aria-label="EventBook home">
                        <span className="footer-logo-mark" aria-hidden="true">E</span>
                        <span><strong>Event</strong>Book</span>
                    </Link>
                    <p>Discover experiences, meet your people and make memories across Bengaluru.</p>
                    <div className="footer-location"><span aria-hidden="true">●</span> Built for local experiences</div>
                </div>

                <nav className="footer-column" aria-label="Explore links">
                    <h3>Explore</h3>
                    <Link to="/events">Find events</Link>
                    <Link to="/features">Features</Link>
                    <Link to="/events?category=Music">Music</Link>
                    <Link to="/events?category=Comedy">Comedy</Link>
                    <Link to="/events?category=Workshop">Workshops</Link>
                </nav>

                <nav className="footer-column" aria-label="Organizer links">
                    <h3>Organizers</h3>
                    <Link to={organizer ? '/create-event' : '/register?role=organizer'}>{organizer ? 'Create an event' : 'Become an organizer'}</Link>
                    <Link to="/box-office">Box Office</Link>
                    <Link to="/pricing">Organizer pricing</Link>
                    <Link to="/resources">Organizer guide</Link>
                </nav>

                <nav className="footer-column" aria-label="Support links">
                    <h3>Help & support</h3>
                    <Link to="/resources">Guides & FAQs</Link>
                    <Link to="/contact">Contact us</Link>
                    {user && <Link to="/my-bookings">My bookings</Link>}
                    <Link to={user ? '/account' : '/login'}>{user ? 'Account settings' : 'Log in'}</Link>
                </nav>

                <div className="footer-account-card">
                    <span className="footer-account-icon" aria-hidden="true">{user ? user.name.slice(0, 1).toUpperCase() : '✦'}</span>
                    <h3>{user ? `Signed in as ${user.name}` : 'Your EventBook starts here'}</h3>
                    <p>{user ? (organizer ? 'Manage your listings and bookings from one place.' : 'Your saved bookings stay connected to this account.') : 'Create a free buyer or organizer account.'}</p>
                    <Link to={user ? '/account' : '/register'}>{user ? 'Open my account' : 'Create an account'} <Arrow /></Link>
                </div>
            </div>

            <div className="footer-bottom">
                <p>© {new Date().getFullYear()} EventBook. All rights reserved.</p>
                <div className="footer-product-note"><span aria-hidden="true" /> Checkout is currently in demo mode—no money is charged.</div>
                <Link to="/contact">Report a problem</Link>
            </div>
        </footer>
    );
}
