const steps = [
  {
    title: "Paste original AI instruction",
    detail: "The exact task you gave your AI coding tool.",
  },
  {
    title: "Paste Git diff",
    detail: "The changes that tool actually made.",
  },
  {
    title: "Get verification report",
    detail: "Missing requirements, unexpected changes, and risky modifications.",
  },
];

export function ProductIntro() {
  return (
    <section className="mt-10 text-sm leading-6 text-[#3f3832]">
      <h2 className="text-xs font-semibold tracking-[0.16em] uppercase text-[#6b6258]">
        How it works
      </h2>
      <ol className="mt-4 grid gap-3 sm:grid-cols-3">
        {steps.map((step, index) => (
          <li
            key={step.title}
            className="rounded-lg border border-[#e4d9c8] bg-[#faf7f1] px-4 py-4"
          >
            <p className="text-xs font-semibold tracking-[0.14em] uppercase text-[#9a3412]">
              Step {index + 1}
            </p>
            <p className="mt-2 font-semibold text-[#1c1915]">{step.title}</p>
            <p className="mt-2 text-[#5c5348]">{step.detail}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
