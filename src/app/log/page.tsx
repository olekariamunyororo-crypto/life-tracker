import { DailyEntryForm } from "@/components/forms/daily-entry";

export default function LogPage() {
  return (
    <div className="kolo-page">
      <header className="mb-4">
        <p className="text-xs font-medium uppercase tracking-wider text-[var(--kolo-muted)]">
          Capture the day
        </p>
        <h1 className="kolo-section-title mt-1">Log</h1>
      </header>
      <div className="kolo-card-lg p-4 sm:p-6">
        <DailyEntryForm />
      </div>
    </div>
  );
}
