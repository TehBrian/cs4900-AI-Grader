import PageShell from "../components/PageShell";

export default function About() {
  return (
    <PageShell title="About">
      <div className="rounded-2xl bg-white border shadow-sm p-6 text-gray-700">
        <p className="leading-relaxed">
          An application that can give and grade problem solutions that are symbolic in nature combining both quiz delivery with intelligent AI-powered grading.
        </p>
      </div>
    </PageShell>
  );
}
