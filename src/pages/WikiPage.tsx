export function WikiPage() {
  const categories = [
    { emoji: "🐭", label: "Postava", count: 0 },
    { emoji: "👤", label: "NPC", count: 0 },
    { emoji: "🏘", label: "Osady / Místa", count: 0 },
    { emoji: "⚔", label: "Frakce", count: 0 },
    { emoji: "📋", label: "Úkoly", count: 0 },
    { emoji: "🧵", label: "Příběhové linky", count: 0 },
    { emoji: "💎", label: "Předměty", count: 0 },
  ];

  return (
    <div>
      <h2 className="text-lg font-bold mb-6">Kampáňová Wiki</h2>
      <p className="text-sm text-[var(--muted)] mb-6">
        Vyber kategorii entit. Vše je propojené — NPC patří do osad, frakce mají
        členy, úkoly vedou na místa.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {categories.map((cat) => (
          <div
            key={cat.label}
            className="p-4 border border-[var(--border)] rounded-lg hover:border-[var(--fg)] transition-colors cursor-pointer flex items-center gap-3"
          >
            <span className="text-2xl">{cat.emoji}</span>
            <div>
              <h3 className="font-semibold text-sm">{cat.label}</h3>
              <p className="text-xs text-[var(--muted)]">{cat.count} záznamů</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
