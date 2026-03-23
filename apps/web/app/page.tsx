import Loading from "@/components/loading";
import Clock from "@/components/clock";
import SystemsStatus from "@/components/systemsStatus";
import ThemeToggle from "@/components/themeToggle";
import ActiveCards from "@/components/activeCards";
import Logo from "@/components/logo";
import Settings from "@/components/settings";

export default function Page() {
  return (
    <>
      <Loading />
      <div>
        <div className="header">
          <div className="header-brand flex gap-2 items-center">
            <Logo />
          </div>
          <div className="header-clock"><Clock /></div>
          <div className="header-status gap-4">
            <SystemsStatus />
            <Settings />
            <ThemeToggle />
          </div>
        </div>
        <ActiveCards />
      </div>
    </>
  );
}