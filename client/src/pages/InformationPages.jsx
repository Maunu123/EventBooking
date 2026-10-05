import { request } from "../api/request.js";
import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import "./InformationPages.css";

const currency = (value) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 }).format(value);

function Page({ eyebrow, title, description, children }) {
    return <main className="info-page"><div className="info-container">
        <header className="info-header"><p className="info-eyebrow">{eyebrow}</p><h1>{title}</h1><p>{description}</p></header>
        {children}
    </div></main>;
}

export function Pricing() {
    const [price, setPrice] = useState("999");
    const [count, setCount] = useState("100");
    const valid = price !== "" && count !== "" && Number(price) >= 0 && Number(price) <= 1000000 && Number.isInteger(Number(count)) && Number(count) >= 1 && Number(count) <= 100000;
    const gross = Number(price) * Number(count);
    const fees = Number(price) === 0 ? 0 : gross * .02 + Number(count) * 10;
    return <Page eyebrow="PRICING FOR EVENT ORGANIZERS" title="A plan for every gathering" description="Estimate platform fees for publishing and selling tickets to your event.">
        <div className="info-notice">Sample pricing only. These plans are not available for purchase, and these fees are not applied to demo checkout.</div>
        <div className="info-three-column">
            <article className="info-card"><span className="info-tag">Community</span><h2>Free events</h2><p className="plan-price">₹0 <small>/ ticket</small></p><p>A sample plan for gatherings with free entry.</p><ul><li>Event listing</li><li>Registration form</li><li>Attendee overview</li></ul><Link className="info-button secondary" to="/contact?topic=Free%20event%20plan">Enquire about free events</Link></article>
            <article className="info-card featured-plan"><span className="info-tag">Paid events</span><h2>Standard</h2><p className="plan-price">2% + ₹10 <small>/ ticket</small></p><p>An illustrative fee for each paid ticket sold.</p><ul><li>Everything in Free events</li><li>Payment checkout</li><li>Sales reporting</li></ul><a className="info-button" href="#fee-calculator">Estimate your fees</a></article>
            <article className="info-card"><span className="info-tag">Larger events</span><h2>Custom</h2><p className="plan-price">Let’s talk</p><p>Discuss requirements for multiple events or larger audiences.</p><ul><li>Volume requirements</li><li>Team workflows</li><li>Support requirements</li></ul><Link className="info-button secondary" to="/contact?topic=Custom%20pricing">Discuss your event</Link></article>
        </div>
        <section className="info-card info-section" id="fee-calculator"><h2>Estimate your ticket revenue</h2><p>Sample Standard fee: 2% of ticket revenue + ₹10 per paid ticket. Free tickets have no sample fee. Taxes, refunds and payment-provider charges are excluded.</p>
            <div className="info-two-column"><div><label htmlFor="ticket-price">Ticket price (₹)</label><input id="ticket-price" type="number" min="0" max="1000000" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} /></div><div><label htmlFor="ticket-count">Tickets sold</label><input id="ticket-count" type="number" min="1" max="100000" step="1" value={count} onChange={(e) => setCount(e.target.value)} /></div></div>
            <div aria-live="polite">{valid ? <dl className="info-totals"><div><dt>Gross ticket revenue</dt><dd>{currency(gross)}</dd></div><div><dt>Estimated fee</dt><dd>{currency(fees)}</dd></div><div className="info-total"><dt>Revenue after sample fee</dt><dd>{currency(gross - fees)}</dd></div></dl> : <p>Enter a price from ₹0 to ₹10,00,000 and a whole ticket count from 1 to 1,00,000.</p>}</div>
        </section>
    </Page>;
}

export function Contact() {
    const [params] = useSearchParams();
    const [downloaded, setDownloaded] = useState(false);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState('');
    async function downloadMessage(e) {
        e.preventDefault();
        if (busy) return;
        const form = e.currentTarget;
        const body = Object.fromEntries(new FormData(form));
        setBusy(true); setError(''); setDownloaded(false);
        try {
            const result = await request('contact', body);
            setDownloaded(result.reference);
            form.reset();
        } catch (err) { setError(err.message); } finally { setBusy(false); }
    }
    return <Page eyebrow="LET’S CONNECT" title="How can we help?" description="Have a question about an event or an idea for your next gathering? Prepare your enquiry below.">
        <div className="info-two-column"><section className="info-card"><h2>Tell us what you need</h2><p>Include the event name, date and a description of your question so the right details are in one place.</p><div className="contact-topic"><h3>Attending an event</h3><p>Find guidance on choosing tickets and using demo checkout.</p><Link to="/resources">Read the booking guide →</Link></div><div className="contact-topic"><h3>Organising an event</h3><p>Explore the box office preview and sample pricing before preparing your enquiry.</p><Link to="/box-office">Explore Box Office →</Link></div><div className="info-notice">Your enquiry will be saved securely for the team. Email notifications are not enabled yet.</div></section>
        <form className="info-card" onSubmit={downloadMessage} onChange={() => setDownloaded(false)}><h2>Your message</h2>
            <label htmlFor="contact-name">Full name</label><input id="contact-name" name="name" autoComplete="name" required pattern=".*\S.*" maxLength={100} />
            <label htmlFor="contact-email">Email address</label><input id="contact-email" name="email" type="email" autoComplete="email" required maxLength={254} />
            <label htmlFor="contact-topic">Topic</label><input id="contact-topic" name="topic" defaultValue={params.get("topic")?.slice(0, 120) || "General enquiry"} required pattern=".*\S.*" maxLength={120} />
            <label htmlFor="contact-message">Message</label><textarea id="contact-message" name="message" rows={6} required minLength={10} maxLength={3000} placeholder="Tell us about your question or event…" onChange={(e) => e.target.setCustomValidity(e.target.value.trim().length < 10 ? "Please enter at least 10 non-padding characters." : "")} />
            <button className="info-button" type="submit" disabled={busy}>{busy ? "Sending?" : "Send enquiry"}</button>
            {error && <p className="auth-error" role="alert">{error}</p>}
            {downloaded && <p className="info-success" role="status">Your enquiry has been saved. Reference: {downloaded}</p>}
        </form></div>
    </Page>;
}

const guides = [
    { title: "Find your next event", category: "Attendees", text: "Browse the events catalogue, then open View Details to check the venue, date, schedule and price. Confirm that the event fits your plans before starting checkout.", to: "/events", action: "Browse events" },
    { title: "Book tickets in demo mode", category: "Attendees", text: "Choose Book Ticket on an event, select 1–10 tickets and enter your name, email and phone number. Proceed to Payment to review your order. Simulated payments do not charge money, send email or issue a valid ticket.", to: "/events", action: "Choose an event" },
    { title: "Use the box office", category: "Organisers", text: "Log in as an Event Organizer to publish event listings and view your own events. Listings are saved in the database. Ticket scanning and attendee check-in are not connected yet.", to: "/box-office", action: "Open Box Office" },
    { title: "Understand sample pricing", category: "Organisers", text: "Use the pricing calculator to compare ticket revenue and illustrative fees. The sample Standard fee is 2% plus ₹10 per paid ticket. These estimates exclude taxes and payment-provider charges and do not change demo checkout totals.", to: "/pricing", action: "Try the calculator" },
    { title: "Prepare an event enquiry", category: "Organisers", text: "Include your event name, expected audience, date and questions in the contact form. Submit the form to save your enquiry for the team. The page displays a reference only after it has been saved. Email notifications are not yet enabled.", to: "/contact", action: "Prepare an enquiry" },
];

export function Resources() {
    const [query, setQuery] = useState("");
    const [category, setCategory] = useState("All");
    const results = guides.filter((guide) => (category === "All" || guide.category === category) && `${guide.title} ${guide.text}`.toLowerCase().includes(query.trim().toLowerCase()));
    return <Page eyebrow="THE EVENTBOOK GUIDE" title="A little guidance. A great experience." description="Practical guides for exploring events, trying checkout and planning your next gathering.">
        <section className="info-card resource-search"><div><label htmlFor="resource-search">Search resources</label><input id="resource-search" type="search" placeholder="Try tickets, pricing or enquiries" value={query} onChange={(e) => setQuery(e.target.value)} /></div><div><label htmlFor="resource-category">For</label><select id="resource-category" value={category} onChange={(e) => setCategory(e.target.value)}><option>All</option><option>Attendees</option><option>Organisers</option></select></div></section>
        <p role="status">{results.length} {results.length === 1 ? "guide" : "guides"} found</p>
        <div className="info-three-column">{results.map((guide) => <article className="info-card" key={guide.title}><span className="info-tag">{guide.category}</span><h2>{guide.title}</h2><p>{guide.text}</p><Link className="info-text-link" to={guide.to}>{guide.action} →</Link></article>)}</div>
        {!results.length && <div className="info-card"><h2>No matching guides</h2><p>Try another search or choose a different audience.</p><button className="info-button secondary" onClick={() => { setQuery(""); setCategory("All"); }}>Clear filters</button></div>}
        <section className="info-card info-section"><h2>Frequently asked questions</h2>
            <details><summary>Will demo checkout charge me?</summary><p>No. All payment methods are simulated. No real payment is taken and no ticket is issued.</p></details>
            <details><summary>Can I change the number of tickets?</summary><p>Yes. Choose between 1 and 10 tickets in booking. From the payment step, use Edit booking details to change the quantity.</p></details>
            <details><summary>Where is my confirmation email?</summary><p>The current demo does not send confirmation emails. The confirmation screen is a preview only.</p></details>
            <details><summary>Can I manage real attendees in Box Office?</summary><p>Not yet. Box Office supports event creation and your published listings. Live payments, attendance and ticket scanning are not connected yet.</p></details>
        </section>
    </Page>;
}
