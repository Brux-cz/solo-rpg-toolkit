import { Outlet, NavLink } from "react-router-dom";

const navItems = [
  { to: "/", label: "⚔ Kampaň" },
  { to: "/wiki", label: "📖 Wiki" },
  { to: "/diary", label: "📜 Deník" },
  { to: "/tools", label: "🎲 Nástroje" },
  { to: "/diagram", label: "🗺 Diagram" },
];

export function App() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b border-[var(--border)] px-4 py-3 flex items-center justify-between">
        <h1 className="text-sm font-bold tracking-wider">SOLO RPG TOOLKIT</h1>
        <nav className="flex gap-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              className={({ isActive }) =>
                `px-3 py-1.5 text-xs rounded-md transition-colors ${
                  isActive
                    ? "bg-[var(--fg)] text-[var(--bg)]"
                    : "text-[var(--muted)] hover:text-[var(--fg)]"
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </header>

      {/* Content */}
      <main className="flex-1 p-4 max-w-5xl mx-auto w-full">
        <Outlet />
      </main>
    </div>
  );
}
