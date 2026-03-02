export function ToolsPage() {
  const tools = [
    {
      emoji: "◈",
      label: "Meaning Tables",
      desc: "Dvojice abstraktních slov — ty interpretujješ.",
    },
    {
      emoji: "🔮",
      label: "Orákulum (Fate Q)",
      desc: "Otázky ano/ne s pravděpodobností a komplikacemi.",
    },
    {
      emoji: "📚",
      label: "Generátory",
      desc: "NPC, osady, úkoly, poklady z pravidlových knih.",
    },
    {
      emoji: "🎲",
      label: "Hod kostkou",
      desc: "d4, d6, d8, d10, d12, d20 — pro konflikty a tabulky.",
    },
    {
      emoji: "🔄",
      label: "Test chaosu",
      desc: "d10 vs Chaos Faktor — určí typ scény.",
    },
  ];

  return (
    <div>
      <h2 className="text-lg font-bold mb-6">Panel nástrojů</h2>
      <p className="text-sm text-[var(--muted)] mb-6">
        Použij kdykoli potřebuješ inspiraci, rozhodnutí, nebo náhodu.
      </p>
      <div className="flex flex-col gap-3">
        {tools.map((tool) => (
          <div
            key={tool.label}
            className="p-4 border border-[var(--border)] rounded-lg hover:border-[var(--fg)] transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <span className="text-xl">{tool.emoji}</span>
              <div>
                <h3 className="font-semibold text-sm">{tool.label}</h3>
                <p className="text-xs text-[var(--muted)]">{tool.desc}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
