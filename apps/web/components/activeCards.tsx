import WeatherCard from "@/components/cards/weather";
import CalendarCard from "@/components/cards/calendar";
import StocksCard from "@/components/cards/stocks";
import TodoCard from "@/components/cards/todo";
import StatusReporter from "./statusReporter";
import MultiHabitTracker from "./cards/habitsTracker";

const isWeekend = [0, 6].includes(new Date().getDay());

const ALL_CARDS = [
  WeatherCard,
  MultiHabitTracker,
  !isWeekend && StocksCard,
  TodoCard,
  CalendarCard,
].filter(Boolean) as React.ComponentType[];

const autoSuccessStatuses = [
  ...(isWeekend ? ["stocks"] : []),
];

export default function ActiveCards() {
  return (
    <>
      {autoSuccessStatuses.length > 0 && (
        <StatusReporter statuses={autoSuccessStatuses} />
      )}

      <div className="gap-4 m-4!" style={{ columns: "25rem" }}>
        {ALL_CARDS.map((Card, i) => (
          <div key={i} style={{ breakInside: "avoid", marginBottom: "1rem" }}>
            <Card />
          </div>
        ))}
      </div>
    </>
  );
}