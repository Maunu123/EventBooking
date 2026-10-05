import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export default function ScrollToTop() {
    const { pathname } = useLocation();
    useEffect(() => {
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
        const exactTitles = {
            '/': 'EventBook — Find experiences worth showing up for',
            '/events': 'Explore Events — EventBook',
            '/login': 'Log in — EventBook',
            '/register': 'Create an account — EventBook',
            '/account': 'My Account — EventBook',
            '/my-bookings': 'My Bookings — EventBook',
            '/box-office': 'Box Office — EventBook',
            '/create-event': 'Create an Event — EventBook',
            '/pricing': 'Organizer Pricing — EventBook',
            '/resources': 'Guides & FAQs — EventBook',
            '/contact': 'Contact Us — EventBook',
            '/features': 'Features — EventBook',
        };
        document.title = exactTitles[pathname] || (pathname.includes('/book') ? 'Book Tickets — EventBook' : pathname.startsWith('/events/') ? 'Event Details — EventBook' : 'EventBook');
    }, [pathname]);
    return null;
}
