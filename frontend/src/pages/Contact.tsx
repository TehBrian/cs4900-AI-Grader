import PageShell from "../components/PageShell";

export default function Contact() {
  return (
    <PageShell title="Contact">
      <div className="rounded-2xl bg-white border shadow-sm p-6 text-gray-700">
        <div className="leading-relaxed space-y-1">
          <p>CS 4910 Spring Group 6</p>
          <p>Dr. Dean Johnson: dean.johnson@wmich.edu</p>
        </div>
      </div>
    </PageShell>
  );
}
