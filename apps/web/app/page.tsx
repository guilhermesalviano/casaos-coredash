import { DASHBOARD_CARDS } from "@/components/cards/cards";
import Clock from "@/components/clock";
import SystemsStatus from "@/components/systemsStatus";
import ThemeToggle from "@/components/themeToggle";

export default function Dashboard() {
  return (
    <>
      <div className="header">
        <div className="header-brand max-sm:text-2xl">⬡ <span className="max-sm:hidden">My Notion Version</span></div>
        <div className="header-clock"><Clock /></div>
        <div className="header-status gap-4">
          <SystemsStatus />
          <ThemeToggle />
        </div>
      </div>

      <div style={{ columns: "25rem", columnGap: "1rem", margin: "1rem" }}>
        {DASHBOARD_CARDS.map((C, i) => (
          <div key={i} style={{ breakInside: "avoid", marginBottom: "1rem", marginLeft: "0.5rem", marginRight: "0.5rem" }}>
            <C />
          </div>
        ))}
      </div>
    </>
  );
}