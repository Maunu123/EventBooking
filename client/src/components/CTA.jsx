import { Link } from "react-router-dom";

export default function CTA() {
  return (
    <section className="home-cta">
      <p className="home-cta-eyebrow">DON’T JUST HEAR ABOUT IT LATER</p>
      <h2>Make a plan worth<br />looking forward to.</h2>
      <p>Concerts, comedy, workshops and local experiences are waiting.</p>
      <Link className="home-cta-button" to="/events">See what’s happening <span aria-hidden="true">→</span></Link>
    </section>
  );
}
