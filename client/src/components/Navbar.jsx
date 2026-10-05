import { useEffect, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/context.js';
import './Navbar.css';

export default function Navbar() {
    const { user } = useAuth();
    const [open, setOpen] = useState(false);
    const [city, setCity] = useState('Bengaluru');
    const [showCityMenu, setShowCityMenu] = useState(false);
    const navigate = useNavigate();

    const close = () => {
        setOpen(false);
        setShowCityMenu(false);
    };

    useEffect(() => {
        function handleEscape(event) {
            if (event.key === 'Escape') {
                setOpen(false);
                setShowCityMenu(false);
            }
        }
        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, []);

    const cities = ['Bengaluru', 'Mumbai', 'Delhi NCR', 'Hyderabad', 'Pune', 'Goa', 'Chennai'];

    function selectCity(c) {
        setCity(c);
        setShowCityMenu(false);
        navigate(`/events?q=${encodeURIComponent(c)}`);
    }

    return (
        <header className="site-header">
            {/* Top promo announcement bar */}
            <div className="nav-announcement-bar">
                <span>🎉 <strong>FESTIVE SPECIAL:</strong> Use code <code className="promo-badge-tag">FESTIVE20</code> for Flat 20% OFF on all events!</span>
                <span className="announcement-secure">🔒 100% Aadhaar & PAN Verified Safe Ticketing</span>
            </div>

            <nav className="navbar" aria-label="Main navigation">
                <div className="nav-left">
                    <Link to="/" className="logo" onClick={close} aria-label="EventBook home">
                        <span className="nav-logo-mark" aria-hidden="true">
                            <span className="logo-pulse" />
                            EB
                        </span>
                        <span className="logo-text">
                            <strong>Event</strong><span>Book</span>
                            <span className="logo-badge">PRO</span>
                        </span>
                    </Link>

                    {/* City switcher pill */}
                    <div className="city-selector-wrap">
                        <button
                            type="button"
                            className="city-selector-btn"
                            onClick={() => setShowCityMenu((v) => !v)}
                            aria-expanded={showCityMenu}
                            aria-label="Select City"
                        >
                            <span className="city-pin" aria-hidden="true">📍</span>
                            <span className="city-name">{city}</span>
                            <span className="city-caret" aria-hidden="true">▾</span>
                        </button>

                        {showCityMenu && (
                            <div className="city-dropdown-menu">
                                <p className="city-dropdown-title">Select Your City</p>
                                {cities.map((item) => (
                                    <button
                                        key={item}
                                        type="button"
                                        className={`city-option ${item === city ? 'active' : ''}`}
                                        onClick={() => selectCity(item)}
                                    >
                                        <span>📍 {item}</span>
                                        {item === city && <span className="city-check">✓</span>}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <button
                    className="nav-menu-button"
                    type="button"
                    aria-expanded={open}
                    aria-controls="main-menu"
                    onClick={() => setOpen((value) => !value)}
                >
                    <span className="visually-hidden">{open ? 'Close menu' : 'Open menu'}</span>
                    <i /><i /><i />
                </button>

                <div className={`nav-panel${open ? ' open' : ''}`} id="main-menu">
                    <div className="nav-links">
                        <NavLink to="/" end onClick={close}>Home</NavLink>
                        <NavLink to="/events" onClick={close}>Find Events</NavLink>
                        <NavLink to="/features" onClick={close}>Features</NavLink>
                        {user && <NavLink to="/my-bookings" onClick={close}>My Bookings</NavLink>}
                        {user?.role === 'organizer' && <NavLink to="/box-office" onClick={close}>Box Office</NavLink>}
                        {(!user || user.role === 'organizer') && <NavLink to="/pricing" onClick={close}>Organizer Pricing</NavLink>}
                        <NavLink to="/resources" onClick={close}>Resources</NavLink>
                        <NavLink to="/contact" onClick={close}>Contact</NavLink>
                    </div>

                    <div className="nav-actions">
                        {user?.role === 'organizer' ? (
                            <Link to="/create-event" className="nav-create" onClick={close}>
                                + Host Event
                            </Link>
                        ) : (
                            <Link to="/register?role=organizer" className="nav-become-organizer" onClick={close}>
                                List Your Event
                            </Link>
                        )}

                        {user ? (
                            <div className="user-profile-menu">
                                <Link to="/account" className="login-btn user-active-btn" onClick={close}>
                                    <span className="nav-avatar" aria-hidden="true">
                                        {user.name.slice(0, 1).toUpperCase()}
                                    </span>
                                    <span>{user.name.split(' ')[0]}</span>
                                </Link>
                            </div>
                        ) : (
                            <Link to="/login" className="login-btn" onClick={close}>
                                <span>Sign In</span>
                            </Link>
                        )}
                    </div>
                </div>
            </nav>
            {open && <button className="nav-backdrop" type="button" aria-label="Close navigation" onClick={close} />}
            {showCityMenu && <div className="city-backdrop" onClick={() => setShowCityMenu(false)} />}
        </header>
    );
}

