import { NextRequest, NextResponse } from "next/server";
import { getDatabaseConnection } from "@/lib/db";
import { FlightCrawled } from "@/entities/FlightCrawled";

export async function GET(req: NextRequest) {
  try {
    const db = await getDatabaseConnection();
    const flightCrawledRepository = db.getRepository(FlightCrawled);
    const flights = await flightCrawledRepository
      .createQueryBuilder("flight")
      .select("flight.origin", "origin")
      .addSelect("flight.airline", "airline")
      .addSelect("flight.destination", "destination")
      .addSelect("flight.flightDate", "flightDate")
      .addSelect("MAX(flight.price)", "maxPrice")
      .addSelect("MIN(flight.price)", "minPrice")
      .groupBy("flight.origin, flight.destination, flight.flightDate, flight.price")
      .orderBy("minPrice", "ASC")
      .andWhere("flight.price <> ''")
      .getRawMany();

    const flightsReduced =flights.reduce((acc: any[], flight: any) => {
      const route = `${flight.origin} ↔ ${flight.destination}`;
      const currentPrice = parseFloat(flight.minPrice);
      const existingRoute = acc.find((f: any) => f.route === route);

      if (existingRoute) {
        if (currentPrice > existingRoute.price) {
          existingRoute.trend = "▼";
        } else if (currentPrice < existingRoute.price) {
          existingRoute.trend = "▲";
        } else if (currentPrice == existingRoute.price) {
          existingRoute.trend = "-";
        }

        if (currentPrice < existingRoute.price) {
          existingRoute.price = currentPrice;
          existingRoute.airline = flight.airline;
          existingRoute.flightDate = flight.flightDate;
        }
      } else {
        acc.push({
          route,
          airline: flight.airline,
          flightDate: flight.flightDate,
          price: currentPrice,
          trend: "-",
        });
      }

      return acc;
    }, []);

    const flightsResult = flightsReduced.map((flight: { route: string; airline: string; flightDate: string; price: number; trend: string; }) => ({
      route: flight.route,
      airline: flight.airline,
      date: flight.flightDate,
      price: flight.price,
      trend: flight.trend,
    }));
    
    return NextResponse.json({ message: "Flights data retrieved successfully", data: flightsResult }, { status: 200 })
  } catch (error: unknown) {
    console.error(error)
    return NextResponse.json({ error: "Failed to retrieve flights data" }, { status: 500 });
  }
}