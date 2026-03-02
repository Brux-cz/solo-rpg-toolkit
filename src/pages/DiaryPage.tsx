export function DiaryPage() {
  return (
    <div>
      <h2 className="text-lg font-bold mb-6">Deník kampaně</h2>
      <p className="text-sm text-[var(--muted)] mb-4">
        Timeline scén — heslovité záznamy i narativní shrnutí. Každý záznam je
        propojený s entitami z wiki.
      </p>
      <div className="border border-dashed border-[var(--border)] rounded-lg p-8 text-center text-sm text-[var(--muted)]">
        Zatím žádné záznamy. Začni hrát a zapisuj scény!
      </div>
    </div>
  );
}
