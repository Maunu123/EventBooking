import { useAuth } from "../auth/context.js";
import { request } from "../api/request.js";
import { useRef, useState, useEffect } from "react";
import { useParams, useSearchParams, Link } from "react-router-dom";
import { useEvents } from "../api/events-context.js";
import EventImage from './EventImage.jsx';
import "./TicketBooking.css";

const money = (amount) => new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
}).format(amount);

export default function TicketBooking() {
    const { events, loading: eventsLoading } = useEvents();
    const { id } = useParams();
    const event = events.find((item) => String(item.id) === id);

    if (eventsLoading && !event) {
        return (
            <div className="booking-error" role="status">
                <div className="loading-spinner" />
                <p>Loading your event details...</p>
            </div>
        );
    }

    return event ? <Checkout key={event.id} event={event} /> : (
        <div className="booking-error">
            <h2>Event Not Found</h2>
            <p>The event you are trying to book is no longer available.</p>
            <Link to="/events" className="payment-btn" style={{ maxWidth: '200px', textAlign: 'center' }}>
                Back to Events
            </Link>
        </div>
    );
}

function Checkout({ event }) {
    const [params] = useSearchParams();
    const { user } = useAuth();
    const [step, setStep] = useState("details"); // details | payment | complete
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState("");
    const attempt = useRef(null);
    const heading = useRef(null);

    // Ticket tier selection
    const [ticketType, setTicketType] = useState("Standard"); // Standard | VIP Pass | Early Bird
    const [quantity, setQuantity] = useState(() => {
        const requested = Number(params.get("quantity"));
        return Number.isInteger(requested) && requested >= 1 && requested <= 10 ? requested : 1;
    });

    // Customer & ID details
    const [customer, setCustomer] = useState({
        name: user?.name || "",
        email: user?.email || "",
        phone: "",
        idType: "aadhaar", // aadhaar | pan
        idNumber: "",
        companyName: "",
    });

    // Promo Code
    const [promoCodeInput, setPromoCodeInput] = useState("");
    const [appliedPromo, setAppliedPromo] = useState("");
    const [promoError, setPromoError] = useState("");
    const [promoSuccess, setPromoSuccess] = useState("");

    // Payment Method & Bank
    const [method, setMethod] = useState("upi"); // upi | aadhaar_pay | pan_checkout | card | netbanking
    const [upiId, setUpiId] = useState("");
    const [selectedBank, setSelectedBank] = useState("HDFC Bank");
    const [cardDetails, setCardDetails] = useState({ number: "", name: "", expiry: "", cvv: "" });
    const [reference, setReference] = useState("");

    // Calculate pricing
    const basePrice = (event.pricePaise != null ? event.pricePaise / 100 : Number(event.price.replace(/[^0-9.]/g, "")));
    
    let unitPrice = basePrice;
    if (ticketType === "VIP Pass") {
        unitPrice = Math.round(basePrice * 1.5);
    } else if (ticketType === "Early Bird") {
        unitPrice = Math.round(basePrice * 0.85);
    }

    const subtotal = unitPrice * quantity;
    
    let discount = 0;
    if (appliedPromo === "FESTIVE20") {
        discount = Math.round(subtotal * 0.2);
    } else if (appliedPromo === "WELCOME100") {
        discount = Math.min(100, subtotal);
    } else if (appliedPromo === "EVENTVIBES") {
        discount = Math.min(200, subtotal);
    }

    const total = Math.max(0, subtotal - discount);

    useEffect(() => {
        heading.current?.focus();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [step]);

    function handleIdNumberChange(e) {
        let val = e.target.value;
        if (customer.idType === 'aadhaar') {
            // Keep digits only, max 12 digits, format as 0000 0000 0000
            val = val.replace(/\D/g, '').slice(0, 12);
            val = val.replace(/(\d{4})(?=\d)/g, '$1 ');
        } else if (customer.idType === 'pan') {
            // Uppercase alphanumeric, max 10 chars
            val = val.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 10);
        }
        setCustomer({ ...customer, idNumber: val });
    }

    function applyCoupon(e) {
        e.preventDefault();
        const code = promoCodeInput.trim().toUpperCase();
        setPromoError("");
        setPromoSuccess("");

        if (code === "FESTIVE20") {
            setAppliedPromo("FESTIVE20");
            setPromoSuccess("🎉 Coupon 'FESTIVE20' applied! 20% discount added.");
        } else if (code === "WELCOME100") {
            setAppliedPromo("WELCOME100");
            setPromoSuccess("🎉 Coupon 'WELCOME100' applied! ₹100 flat discount added.");
        } else if (code === "EVENTVIBES") {
            setAppliedPromo("EVENTVIBES");
            setPromoSuccess("🎉 Coupon 'EVENTVIBES' applied! ₹200 discount added.");
        } else {
            setPromoError("Invalid promo code. Try 'FESTIVE20' or 'WELCOME100'.");
        }
    }

    function removeCoupon() {
        setAppliedPromo("");
        setPromoCodeInput("");
        setPromoSuccess("");
        setPromoError("");
    }

    function isIdValid() {
        if (!customer.idNumber) return true; // Optional or validated if provided
        const cleanId = customer.idNumber.replace(/\s/g, '');
        if (customer.idType === 'aadhaar') {
            return /^\d{12}$/.test(cleanId);
        }
        if (customer.idType === 'pan') {
            return /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(cleanId);
        }
        return true;
    }

    function proceedToPayment(e) {
        e.preventDefault();
        setError("");

        if (customer.idNumber && !isIdValid()) {
            setError(customer.idType === 'aadhaar' 
                ? "Please enter a valid 12-digit Aadhaar number (e.g., 5482 9102 3847)."
                : "Please enter a valid 10-character PAN number (e.g., ABCDE1234F)."
            );
            return;
        }

        attempt.current = crypto.randomUUID();
        setStep("payment");
    }

    async function handlePaymentSubmit(e) {
        e.preventDefault();
        if (step !== "payment" || busy) return;
        if (!user) {
            setError("Please sign in or register before completing checkout to link tickets to your account.");
            return;
        }

        setBusy(true);
        setError("");

        const cleanId = customer.idNumber.replace(/\s/g, '');
        const payloadCustomer = {
            name: customer.name.trim(),
            email: customer.email.trim(),
            phone: customer.phone.trim(),
            idType: customer.idType,
            idNumber: cleanId,
            aadhaar: customer.idType === 'aadhaar' ? cleanId : '',
            pan: customer.idType === 'pan' ? cleanId : '',
            ticketType,
            promoCode: appliedPromo,
        };

        try {
            const result = await request('bookings/demo', {
                eventId: String(event.id),
                quantity,
                method,
                customer: payloadCustomer,
                key: attempt.current,
            });

            setReference(result.booking.id);
            setStep("complete");
        } catch (err) {
            setError(err.message || "Payment simulation failed. Please try again.");
        } finally {
            setBusy(false);
        }
    }

    const updateCustomer = (e) => setCustomer({ ...customer, [e.target.name]: e.target.value });

    // Masked ID string
    const getMaskedId = () => {
        if (!customer.idNumber) return "General Verification";
        const clean = customer.idNumber.replace(/\s/g, '');
        if (customer.idType === 'aadhaar') {
            return `Aadhaar: •••• •••• ${clean.slice(-4)}`;
        }
        return `PAN: ${clean.slice(0, 3)}••••${clean.slice(-2)}`;
    };

    return (
        <section className="booking-page">
            <div className="booking-container">
                <Link className="back-button" to={`/events/${event.id}`}>
                    ← Back to event details
                </Link>

                <div className="booking-header">
                    <span className="booking-header-eyebrow">EVENTBOOK SECURE CHECKOUT</span>
                    <h1 ref={heading} tabIndex={-1}>
                        {step === "details" ? "Customize Tickets & Attendee Info" : step === "payment" ? "Choose Payment Method" : "Booking Confirmed & Digital Pass"}
                    </h1>
                    <p className="booking-header-sub">
                        {step === "details" 
                            ? "Select your ticket tier, quantity, and provide Aadhaar or PAN details for instant verified gate pass." 
                            : step === "payment" 
                            ? "Select your preferred payment method. 100% demo secured with instant pass generation." 
                            : "Your digital QR ticket has been generated and securely saved to your account."}
                    </p>

                    <ol className="checkout-steps" aria-label="Checkout progress">
                        {[
                            { id: "details", label: "1. Ticket & ID Details" },
                            { id: "payment", label: "2. Payment Method" },
                            { id: "complete", label: "3. Digital Pass Issued" }
                        ].map((item) => (
                            <li key={item.id} className={step === item.id ? "active-step" : step === "complete" || (step === "payment" && item.id === "details") ? "done-step" : ""}>
                                <span>{item.label}</span>
                            </li>
                        ))}
                    </ol>
                </div>

                <div className="booking-content">
                    {/* Event Summary Left Column */}
                    <div className="booking-event-card">
                        <div className="booking-event-img-wrap">
                            <EventImage src={event.image} alt={event.title} />
                            <span className="booking-event-badge">{event.category}</span>
                            <span className="booking-secure-tag">🛡️ Aadhaar/PAN Verified</span>
                        </div>

                        <div className="booking-event-info">
                            <h2>{event.title}</h2>
                            <div className="event-meta-pill">
                                <span>📅 {event.date}</span>
                                <span>⏰ {event.time}</span>
                            </div>
                            <p className="booking-venue-text">
                                <span aria-hidden="true">📍</span> {event.venue}
                            </p>
                            <p className="booking-organizer-text">
                                Organized by <strong>{event.organizer}</strong>
                            </p>

                            <div className="booking-guarantee-box">
                                <h4>✨ EventBook Guarantee</h4>
                                <ul>
                                    <li>✓ 100% Verified Entry at Venue Gates</li>
                                    <li>✓ Instant QR Code on Phone & Downloadable PDF</li>
                                    <li>✓ Encrypted Aadhaar & PAN Privacy Protection</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* Form Right Column */}
                    <div className="booking-card">
                        {step === "details" ? (
                            <form onSubmit={proceedToPayment}>
                                <div className="card-header-bar">
                                    <h2>Step 1: Select Tickets & Verify ID</h2>
                                    <span className="step-tag">Step 1 of 3</span>
                                </div>

                                {!user && (
                                    <div className="payment-demo-notice">
                                        <span>💡 <strong>Quick Note:</strong> You can fill in the details now. Make sure to <Link to="/login">Sign In</Link> before payment so your ticket is saved to your account!</span>
                                    </div>
                                )}

                                {/* Ticket Tier Selection */}
                                <div className="ticket-tier-selection">
                                    <label className="section-label">Select Ticket Tier</label>
                                    <div className="tier-options-grid">
                                        {[
                                            { type: "Standard", title: "General Admission", desc: "Full event access & stage view", priceMult: 1 },
                                            { type: "VIP Pass", title: "VIP Front-Row Pass", desc: "Priority entry, lounge & refreshments", priceMult: 1.5, badge: "MOST POPULAR" },
                                            { type: "Early Bird", title: "Early Bird Discount", desc: "Limited special discounted tier", priceMult: 0.85, badge: "15% OFF" }
                                        ].map((tier) => (
                                            <div
                                                key={tier.type}
                                                className={`tier-card ${ticketType === tier.type ? "selected" : ""}`}
                                                onClick={() => setTicketType(tier.type)}
                                            >
                                                {tier.badge && <span className="tier-badge">{tier.badge}</span>}
                                                <div className="tier-radio">
                                                    <input
                                                        type="radio"
                                                        name="ticketType"
                                                        checked={ticketType === tier.type}
                                                        onChange={() => setTicketType(tier.type)}
                                                    />
                                                </div>
                                                <div className="tier-details">
                                                    <h4>{tier.title}</h4>
                                                    <p>{tier.desc}</p>
                                                    <span className="tier-price">{money(Math.round(basePrice * tier.priceMult))} / ticket</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Ticket Quantity */}
                                <div className="ticket-quantity-row">
                                    <div>
                                        <h3>Ticket Quantity</h3>
                                        <p className="checkout-hint">Choose up to 10 tickets per booking</p>
                                    </div>
                                    <div className="ticket-quantity-controls">
                                        <button
                                            type="button"
                                            aria-label="Decrease quantity"
                                            disabled={quantity <= 1}
                                            onClick={() => setQuantity((n) => Math.max(1, n - 1))}
                                        >
                                            −
                                        </button>
                                        <span aria-live="polite" className="qty-number">{quantity}</span>
                                        <button
                                            type="button"
                                            aria-label="Increase quantity"
                                            disabled={quantity >= 10}
                                            onClick={() => setQuantity((n) => Math.min(10, n + 1))}
                                        >
                                            +
                                        </button>
                                    </div>
                                </div>

                                {/* Customer Contact Information */}
                                <div className="customer-details-section">
                                    <h3 className="section-title">Attendee Information</h3>
                                    
                                    <div className="form-group">
                                        <label htmlFor="customer-name">Full Name (as per Govt ID) *</label>
                                        <input
                                            id="customer-name"
                                            name="name"
                                            placeholder="e.g. Aarav Sharma"
                                            autoComplete="name"
                                            required
                                            maxLength={100}
                                            value={customer.name}
                                            onChange={updateCustomer}
                                        />
                                    </div>

                                    <div className="form-row-two">
                                        <div className="form-group">
                                            <label htmlFor="customer-email">Email Address (for e-Ticket) *</label>
                                            <input
                                                id="customer-email"
                                                name="email"
                                                type="email"
                                                placeholder="aarav@example.com"
                                                autoComplete="email"
                                                required
                                                maxLength={254}
                                                value={customer.email}
                                                onChange={updateCustomer}
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label htmlFor="customer-phone">Mobile Number (with +91) *</label>
                                            <input
                                                id="customer-phone"
                                                name="phone"
                                                type="tel"
                                                placeholder="+91 98765 43210"
                                                autoComplete="tel"
                                                required
                                                pattern="\+?[0-9][0-9 ()\-]{8,18}[0-9]"
                                                value={customer.phone}
                                                onChange={updateCustomer}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* ✨ Government Identification Option (Aadhaar & PAN) */}
                                <div className="govt-id-section">
                                    <div className="govt-id-header">
                                        <div>
                                            <div className="govt-id-title-row">
                                                <span className="govt-id-icon-badge">🛡️</span>
                                                <h3>Govt ID Verification Option</h3>
                                            </div>
                                            <p>Select Aadhaar or PAN for verified gate pass generation & rapid venue check-in.</p>
                                        </div>
                                        <span className="ssl-shield">🔒 256-bit UIDAI/NSDL Encrypted</span>
                                    </div>

                                    <div className="id-type-selector">
                                        <label className={`id-type-pill ${customer.idType === 'aadhaar' ? 'active' : ''}`}>
                                            <input
                                                type="radio"
                                                name="idType"
                                                value="aadhaar"
                                                checked={customer.idType === 'aadhaar'}
                                                onChange={() => setCustomer({ ...customer, idType: 'aadhaar', idNumber: '' })}
                                            />
                                            <span className="id-pill-icon">🇮🇳</span>
                                            <span className="id-pill-text">
                                                <strong>Aadhaar Card</strong>
                                                <small>UIDAI 12-Digit Biometric</small>
                                            </span>
                                        </label>

                                        <label className={`id-type-pill ${customer.idType === 'pan' ? 'active' : ''}`}>
                                            <input
                                                type="radio"
                                                name="idType"
                                                value="pan"
                                                checked={customer.idType === 'pan'}
                                                onChange={() => setCustomer({ ...customer, idType: 'pan', idNumber: '' })}
                                            />
                                            <span className="id-pill-icon">📑</span>
                                            <span className="id-pill-text">
                                                <strong>PAN Card</strong>
                                                <small>Income Tax / GST Invoicing</small>
                                            </span>
                                        </label>
                                    </div>

                                    {customer.idType === 'aadhaar' ? (
                                        <div className="id-card-preview-box aadhaar-theme">
                                            <div className="id-card-topbar">
                                                <div className="id-govt-seal">
                                                    <span className="emblem-flag">🇮🇳</span>
                                                    <div>
                                                        <span className="govt-org-name">Government of India</span>
                                                        <span className="govt-card-title">Unique Identification Authority of India (UIDAI)</span>
                                                    </div>
                                                </div>
                                                <span className="id-chip-icon">🪪 Mera Aadhaar</span>
                                            </div>

                                            <div className="id-input-wrapper">
                                                <label htmlFor="aadhaar-number">12-Digit Aadhaar Number</label>
                                                <div className="input-with-badge">
                                                    <span className="input-prefix-icon">🔢</span>
                                                    <input
                                                        id="aadhaar-number"
                                                        name="idNumber"
                                                        placeholder="XXXX XXXX XXXX (e.g. 5482 9102 3847)"
                                                        maxLength={14}
                                                        value={customer.idNumber}
                                                        onChange={handleIdNumberChange}
                                                    />
                                                    {customer.idNumber.replace(/\s/g, '').length === 12 && (
                                                        <span className="id-valid-badge">✓ 12-Digit Verified</span>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="id-card-bottom-bar">
                                                <span className="id-security-text">
                                                    🔒 Masked for privacy: <strong>{customer.idNumber.replace(/\s/g, '').length === 12 ? `•••• •••• ${customer.idNumber.replace(/\s/g, '').slice(-4)}` : '•••• •••• XXXX'}</strong> on ticket pass.
                                                </span>
                                                <span className="id-trust-tag">AePS Enabled</span>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="id-card-preview-box pan-theme">
                                            <div className="id-card-topbar">
                                                <div className="id-govt-seal">
                                                    <span className="emblem-flag">🇮🇳</span>
                                                    <div>
                                                        <span className="govt-org-name">Income Tax Department</span>
                                                        <span className="govt-card-title">Permanent Account Number (PAN Card)</span>
                                                    </div>
                                                </div>
                                                <span className="id-chip-icon">📑 Tax Verified</span>
                                            </div>

                                            <div className="id-input-wrapper">
                                                <label htmlFor="pan-number">10-Character Alphanumeric PAN Number</label>
                                                <div className="input-with-badge">
                                                    <span className="input-prefix-icon">🔤</span>
                                                    <input
                                                        id="pan-number"
                                                        name="idNumber"
                                                        placeholder="ABCDE1234F"
                                                        maxLength={10}
                                                        value={customer.idNumber}
                                                        onChange={handleIdNumberChange}
                                                        style={{ textTransform: 'uppercase', letterSpacing: '2px' }}
                                                    />
                                                    {/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(customer.idNumber) && (
                                                        <span className="id-valid-badge">✓ Valid PAN</span>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="id-card-bottom-bar">
                                                <span className="id-security-text">
                                                    📑 Masked on pass: <strong>{/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(customer.idNumber) ? `${customer.idNumber.slice(0, 3)}••••${customer.idNumber.slice(-2)}` : 'ABC••••1F'}</strong> with GST corporate receipt.
                                                </span>
                                                <span className="id-trust-tag">GST Compliant</span>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Promo Code Accordion */}
                                <div className="promo-code-container">
                                    <div className="promo-code-box">
                                        <input
                                            type="text"
                                            placeholder="Enter Coupon (e.g. FESTIVE20)"
                                            value={promoCodeInput}
                                            onChange={(e) => setPromoCodeInput(e.target.value)}
                                            disabled={!!appliedPromo}
                                        />
                                        {appliedPromo ? (
                                            <button type="button" className="remove-promo-btn" onClick={removeCoupon}>
                                                Remove
                                            </button>
                                        ) : (
                                            <button type="button" className="apply-promo-btn" onClick={applyCoupon}>
                                                Apply
                                            </button>
                                        )}
                                    </div>
                                    {promoSuccess && <p className="promo-success-text">{promoSuccess}</p>}
                                    {promoError && <p className="promo-error-text">{promoError}</p>}
                                    {!appliedPromo && (
                                        <p className="promo-suggestion">
                                            💡 Tip: Try code <button type="button" className="code-link" onClick={() => { setPromoCodeInput("FESTIVE20"); }}>FESTIVE20</button> for 20% off!
                                        </p>
                                    )}
                                </div>

                                <PriceSummary
                                    ticketType={ticketType}
                                    quantity={quantity}
                                    subtotal={subtotal}
                                    discount={discount}
                                    appliedPromo={appliedPromo}
                                    total={total}
                                />

                                {error && <p role="alert" className="auth-error">{error}</p>}

                                <button className="payment-btn" type="submit">
                                    <span>Continue to Secure Payment</span>
                                    <span aria-hidden="true">→</span>
                                </button>
                            </form>
                        ) : step === "payment" ? (
                            <form onSubmit={handlePaymentSubmit}>
                                <div className="card-header-bar">
                                    <h2>Step 2: Choose Payment Method</h2>
                                    <span className="step-tag">Step 2 of 3</span>
                                </div>

                                <div className="payment-demo-notice">
                                    <span>🛡️ <strong>Demo Checkout Mode:</strong> Secure test gateway enabled. No actual monetary charge will be deducted.</span>
                                </div>

                                <div className="checkout-attendee-preview">
                                    <div className="attendee-preview-header">
                                        <h4>Attendee Details</h4>
                                        <button type="button" onClick={() => setStep("details")} className="edit-details-btn">
                                            Edit
                                        </button>
                                    </div>
                                    <p><strong>Name:</strong> {customer.name}</p>
                                    <p><strong>Contact:</strong> {customer.email} · {customer.phone}</p>
                                    <p><strong>Pass Tier:</strong> {ticketType} ({quantity} {quantity === 1 ? 'ticket' : 'tickets'})</p>
                                    {customer.idNumber && (
                                        <p className="id-badge-pill">
                                            🛡️ {getMaskedId()}
                                        </p>
                                    )}
                                </div>

                                {/* Payment Methods Grid */}
                                <div className="payment-methods-wrapper">
                                    <label className="section-label">Select Payment Option</label>
                                    
                                    <div className="payment-methods-grid">
                                        {[
                                            { id: 'upi', name: 'Instant UPI / QR', icon: '📱', desc: 'GPay, PhonePe, Paytm, BHIM' },
                                            { id: 'aadhaar_pay', name: 'Aadhaar Pay / AePS', icon: '🇮🇳', desc: 'Aadhaar-linked Bank direct transfer' },
                                            { id: 'pan_checkout', name: 'PAN Verified Checkout', icon: '📑', desc: 'Corporate tax invoice & 1-click pay' },
                                            { id: 'card', name: 'Credit / Debit Card', icon: '💳', desc: 'Visa, MasterCard, RuPay' },
                                            { id: 'netbanking', name: 'Net Banking', icon: '🏦', desc: 'SBI, HDFC, ICICI, Axis, Kotak' }
                                        ].map((m) => (
                                            <div
                                                key={m.id}
                                                className={`payment-method-card ${method === m.id ? "active" : ""}`}
                                                onClick={() => setMethod(m.id)}
                                            >
                                                <div className="method-radio">
                                                    <input
                                                        type="radio"
                                                        name="payment-method"
                                                        value={m.id}
                                                        checked={method === m.id}
                                                        onChange={() => setMethod(m.id)}
                                                    />
                                                </div>
                                                <span className="method-icon">{m.icon}</span>
                                                <div className="method-info">
                                                    <strong>{m.name}</strong>
                                                    <small>{m.desc}</small>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Dynamic Sub-form for Selected Payment Method */}
                                <div className="payment-subform-box">
                                    {method === 'upi' && (
                                        <div className="upi-payment-subform">
                                            <h4>Scan QR Code or Enter UPI ID</h4>
                                            <div className="upi-qr-preview">
                                                <div className="mock-qr-code">
                                                    <div className="qr-matrix" />
                                                    <span>SCAN & PAY</span>
                                                </div>
                                                <div className="upi-id-input-wrap">
                                                    <label htmlFor="upi-vpa">Enter UPI ID / VPA</label>
                                                    <input
                                                        id="upi-vpa"
                                                        placeholder="username@okaxis or @paytm"
                                                        value={upiId}
                                                        onChange={(e) => setUpiId(e.target.value)}
                                                    />
                                                    <div className="upi-app-badges">
                                                        <span>Google Pay</span>
                                                        <span>PhonePe</span>
                                                        <span>Paytm</span>
                                                        <span>BHIM</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {method === 'aadhaar_pay' && (
                                        <div className="aadhaar-pay-subform">
                                            <h4>🇮🇳 Aadhaar Enabled Payment System (AePS)</h4>
                                            <p className="aadhaar-pay-desc">
                                                Authorize payment using your UIDAI-registered bank account.
                                            </p>
                                            <div className="form-group">
                                                <label>Selected Aadhaar Number</label>
                                                <input
                                                    disabled
                                                    value={customer.idType === 'aadhaar' && customer.idNumber ? customer.idNumber : "5482 9102 3847 (Demo)"}
                                                    className="disabled-input"
                                                />
                                            </div>
                                            <div className="form-group">
                                                <label>Select Linked Bank</label>
                                                <select value={selectedBank} onChange={(e) => setSelectedBank(e.target.value)}>
                                                    <option>State Bank of India (SBI)</option>
                                                    <option>HDFC Bank</option>
                                                    <option>ICICI Bank</option>
                                                    <option>Punjab National Bank (PNB)</option>
                                                    <option>Bank of Baroda</option>
                                                    <option>Kotak Mahindra Bank</option>
                                                </select>
                                            </div>
                                            <div className="biometric-demo-pill">
                                                <span>✓ Aadhaar Biometric / OTP Simulator Ready</span>
                                            </div>
                                        </div>
                                    )}

                                    {method === 'pan_checkout' && (
                                        <div className="pan-pay-subform">
                                            <h4>📑 PAN Card Verified Business Billing</h4>
                                            <p>Generate compliant GST e-Invoice linked directly to your Permanent Account Number.</p>
                                            <div className="form-group">
                                                <label>Verified PAN Number</label>
                                                <input
                                                    disabled
                                                    value={customer.idType === 'pan' && customer.idNumber ? customer.idNumber : "ABCDE1234F (Demo)"}
                                                    className="disabled-input"
                                                />
                                            </div>
                                            <div className="form-group">
                                                <label>GST / Company Name (Optional)</label>
                                                <input
                                                    placeholder="e.g. Acme Tech Solutions Pvt Ltd"
                                                    value={customer.companyName}
                                                    onChange={(e) => setCustomer({ ...customer, companyName: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {method === 'card' && (
                                        <div className="card-pay-subform">
                                            <h4>Credit or Debit Card</h4>
                                            <div className="form-group">
                                                <label>Card Number</label>
                                                <input
                                                    placeholder="4532 •••• •••• 8892"
                                                    maxLength={19}
                                                    value={cardDetails.number}
                                                    onChange={(e) => setCardDetails({ ...cardDetails, number: e.target.value })}
                                                />
                                            </div>
                                            <div className="form-row-two">
                                                <div className="form-group">
                                                    <label>Expiry Date</label>
                                                    <input
                                                        placeholder="MM/YY"
                                                        maxLength={5}
                                                        value={cardDetails.expiry}
                                                        onChange={(e) => setCardDetails({ ...cardDetails, expiry: e.target.value })}
                                                    />
                                                </div>
                                                <div className="form-group">
                                                    <label>CVV / CVC</label>
                                                    <input
                                                        type="password"
                                                        placeholder="•••"
                                                        maxLength={4}
                                                        value={cardDetails.cvv}
                                                        onChange={(e) => setCardDetails({ ...cardDetails, cvv: e.target.value })}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {method === 'netbanking' && (
                                        <div className="netbanking-subform">
                                            <h4>Select Your Bank</h4>
                                            <div className="form-group">
                                                <select value={selectedBank} onChange={(e) => setSelectedBank(e.target.value)}>
                                                    <option>HDFC Bank</option>
                                                    <option>State Bank of India (SBI)</option>
                                                    <option>ICICI Bank</option>
                                                    <option>Axis Bank</option>
                                                    <option>Kotak Mahindra Bank</option>
                                                    <option>Punjab National Bank</option>
                                                    <option>Bank of Baroda</option>
                                                </select>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <PriceSummary
                                    ticketType={ticketType}
                                    quantity={quantity}
                                    subtotal={subtotal}
                                    discount={discount}
                                    appliedPromo={appliedPromo}
                                    total={total}
                                />

                                {error && <p role="alert" className="auth-error">{error}</p>}

                                <button
                                    type="submit"
                                    className="payment-btn"
                                    disabled={busy || !user}
                                >
                                    {busy ? "Authorizing Payment & Issuing Pass..." : `Pay ${money(total)} & Get Digital Pass`}
                                </button>

                                {!user && (
                                    <p className="signin-reminder">
                                        Please <Link to="/login">Log in</Link> or <Link to="/register">Create Account</Link> to complete payment.
                                    </p>
                                )}

                                <button
                                    type="button"
                                    disabled={busy}
                                    className="checkout-back-link"
                                    onClick={() => setStep("details")}
                                >
                                    ← Edit Ticket & Attendee Details
                                </button>
                            </form>
                        ) : (
                            /* Step 3: Complete & Boarding Pass Digital Ticket */
                            <div className="checkout-confirmation-wrapper">
                                <div className="confirmation-header">
                                    <div className="confirmation-success-icon" aria-hidden="true">✓</div>
                                    <h2>Payment Successful!</h2>
                                    <p className="confirmation-sub">Your digital e-ticket pass has been issued and verified.</p>
                                </div>

                                {/* Digital Boarding Pass Ticket */}
                                <div className="digital-ticket-card" id="printable-ticket">
                                    <div className="ticket-top-banner">
                                        <div className="ticket-brand">
                                            <span><strong>Event</strong>Book</span>
                                            <span className="ticket-badge-pill">OFFICIAL PASS</span>
                                        </div>
                                        <div className="ticket-tier-tag">
                                            {ticketType}
                                        </div>
                                    </div>

                                    <div className="ticket-body">
                                        <div className="ticket-main-info">
                                            <span className="ticket-category">{event.category}</span>
                                            <h3 className="ticket-event-title">{event.title}</h3>
                                            
                                            <div className="ticket-grid-details">
                                                <div>
                                                    <small>Date & Time</small>
                                                    <strong>{event.date}</strong>
                                                    <span>{event.time}</span>
                                                </div>
                                                <div>
                                                    <small>Venue Location</small>
                                                    <strong>{event.venue}</strong>
                                                </div>
                                                <div>
                                                    <small>Attendee Name</small>
                                                    <strong>{customer.name}</strong>
                                                    <span>{customer.phone}</span>
                                                </div>
                                                <div>
                                                    <small>Govt ID Status</small>
                                                    <strong className="verified-id-green">✓ {getMaskedId()}</strong>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="ticket-stub-side">
                                            <div className="qr-code-box">
                                                <div className="qr-simulated-pattern" />
                                                <small>SCAN AT VENUE GATE</small>
                                            </div>
                                            <div className="stub-info">
                                                <small>Booking Ref:</small>
                                                <code>{reference}</code>
                                                <p>{quantity} {quantity === 1 ? 'Admit One' : `Admit ${quantity}`}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="ticket-footer-strip">
                                        <span>💳 Paid via {method.toUpperCase().replace('_', ' ')} · {money(total)}</span>
                                        <span>🔒 Aadhaar/PAN Encrypted Gate Pass</span>
                                    </div>
                                </div>

                                {/* Confirmation Actions */}
                                <div className="confirmation-actions print-hide">
                                    <button
                                        type="button"
                                        className="print-ticket-btn"
                                        onClick={() => window.print()}
                                    >
                                        🖨️ Print / Download Ticket PDF
                                    </button>

                                    <Link className="view-my-bookings-btn" to="/my-bookings">
                                        View in My Bookings →
                                    </Link>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
}

function PriceSummary({ ticketType, quantity, subtotal, discount, appliedPromo, total }) {
    return (
        <div className="booking-summary-card">
            <h4 className="summary-title">Order Summary</h4>
            <div className="summary-row">
                <span>{ticketType} (×{quantity})</span>
                <strong>{money(subtotal)}</strong>
            </div>
            {discount > 0 && (
                <div className="summary-row discount-row">
                    <span>Discount ({appliedPromo})</span>
                    <strong className="discount-amount">−{money(discount)}</strong>
                </div>
            )}
            <div className="summary-row">
                <span>Convenience Fee (Festive Promo)</span>
                <span className="free-fee-badge">FREE (₹0)</span>
            </div>
            <div className="summary-row">
                <span>Govt ID Gate Verification</span>
                <span className="free-fee-badge">FREE (₹0)</span>
            </div>
            <hr className="summary-divider" />
            <div className="summary-row total-row">
                <span>Total Amount</span>
                <strong className="final-total-price">{money(total)}</strong>
            </div>
        </div>
    );
}

