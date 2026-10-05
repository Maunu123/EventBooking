import './WhyChoose.css';

const benefits = [
    ['01', 'Easy discovery', 'Search by category, interest or venue and quickly narrow down what feels right.'],
    ['02', 'Clear event details', 'Review the schedule, venue, organizer and price before starting checkout.'],
    ['03', 'Personal booking history', 'Sign in to keep demo bookings connected to your account and easy to revisit.'],
    ['04', 'Tools for organizers', 'Publish listings and manage your own events from a focused organizer workspace.'],
];

export default function WhyChoose() {
    return (
        <section className="why-choose">
            <div className="why-header">
                <p className="why-subtitle">WHY EVENTBOOK?</p>
                <h2>Less friction.<span> More moments.</span></h2>
                <p className="why-description">Everything you need to discover, understand and keep track of your next experience.</p>
            </div>
            <div className="benefits-grid">
                {benefits.map(([icon, title, description]) => (
                    <article className="benefit-card" key={icon}>
                        <div className="benefit-icon">{icon}</div>
                        <h3>{title}</h3>
                        <p>{description}</p>
                    </article>
                ))}
            </div>
        </section>
    );
}
