import WeatherCard from "@/components/cards/weather";
import CalendarCard from "@/components/cards/calendar";
import StocksCard from "@/components/cards/stocks";
import NewsCard from "@/components/cards/news";
import FlightsCard from "@/components/cards/flights";
import TodoCard from "@/components/cards/todo";
import WishlistCard from "@/components/cards/AmazonWishlist";
import HabitTracker from "@/components/cards/habitTracker";

export const DASHBOARD_CARDS = [
  WeatherCard,
  NewsCard,
  CalendarCard,
  TodoCard,
  StocksCard,
  FlightsCard,
  WishlistCard,
  HabitTracker,
] as const;