import "./HowItWorks.css";

const steps = [
  ["01", "Find your thing", "Search by interest, category or venue and discover something that fits your mood."],
  ["02", "Know before you go", "See the date, location, schedule and ticket price together before you decide."],
  ["03", "Keep it together", "Complete demo checkout and find your saved booking anytime from your account."],
];

export default function HowItWorks() {
  return (
    <section className="how-it-works">
      <div className="how-heading"><p>THREE SIMPLE STEPS</p><h2>From “what’s on?” to<br /><span>something to look forward to.</span></h2></div>
      <ol className="how-it-works-steps">
        {steps.map(([number, title, description]) => (
          <li key={number}><span>{number}</span><h3>{title}</h3><p>{description}</p></li>
        ))}
      </ol>
    </section>
  );
}
