import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../db";
import { useState } from "react";

export function HomePage() {
  const campaigns = useLiveQuery(() => db.campaigns.toArray());
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState("");

  async function handleCreate() {
    if (!name.trim()) return;
    await db.campaigns.add({
      name: name.trim(),
      description: "",
      chaosFactor: 5,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    setName("");
    setCreating(false);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-bold">Kampaně</h2>
        <button
          onClick={() => setCreating(true)}
          className="px-3 py-1.5 text-xs bg-[var(--fg)] text-[var(--bg)] rounded-md hover:opacity-80"
        >
          + Nová kampaň
        </button>
      </div>

      {creating && (
        <div className="mb-4 p-4 border border-[var(--border)] rounded-lg">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleCreate()}
            placeholder="Název kampaně..."
            autoFocus
            className="w-full px-3 py-2 text-sm border border-[var(--border)] rounded-md bg-transparent outline-none focus:border-[var(--fg)]"
          />
          <div className="flex gap-2 mt-3">
            <button
              onClick={handleCreate}
              className="px-3 py-1.5 text-xs bg-[var(--fg)] text-[var(--bg)] rounded-md"
            >
              Vytvořit
            </button>
            <button
              onClick={() => setCreating(false)}
              className="px-3 py-1.5 text-xs text-[var(--muted)] rounded-md"
            >
              Zrušit
            </button>
          </div>
        </div>
      )}

      {campaigns?.length === 0 && !creating && (
        <p className="text-sm text-[var(--muted)]">
          Zatím nemáš žádnou kampaň. Vytvoř si první!
        </p>
      )}

      <div className="flex flex-col gap-2">
        {campaigns?.map((c) => (
          <div
            key={c.id}
            className="p-4 border border-[var(--border)] rounded-lg hover:border-[var(--fg)] transition-colors cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-sm">{c.name}</h3>
              <span className="text-xs text-[var(--muted)]">
                CF {c.chaosFactor}
              </span>
            </div>
            {c.description && (
              <p className="text-xs text-[var(--muted)] mt-1">
                {c.description}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
