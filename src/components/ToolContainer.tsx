"use client";

export default function ToolContainer({
  title,
  icon,
  children,
}: {
  title: string;
  icon: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto max-w-4xl px-4 pt-20 pb-16">
      <h2 className="mb-8 text-center">
        <span
          data-text={title}
          className="glitch-text neon-title flicker-erratic glow-magenta text-4xl font-bold font-heading"
        >
          {icon} {title}
        </span>
      </h2>

      <div className="card-glass card-glow rounded-lg border border-[#2a2a4a] bg-black/30 backdrop-blur-sm p-6">
        {children}
      </div>
    </div>
  );
}
