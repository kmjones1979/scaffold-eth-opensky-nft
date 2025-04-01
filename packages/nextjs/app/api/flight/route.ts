import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const flightNumber = searchParams.get("flightNumber");

  if (!flightNumber) {
    return NextResponse.json({ error: "Flight number is required" }, { status: 400 });
  }

  try {
    // Get real-time flight data from OpenSky's states endpoint
    const response = await fetch(
      "https://opensky-network.org/api/states/all",
      { next: { revalidate: 60 } }, // Cache for 1 minute
    );

    if (!response.ok) {
      throw new Error(`OpenSky API error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log("OpenSky API Response:", JSON.stringify(data, null, 2));

    if (!data.states || data.states.length === 0) {
      return NextResponse.json({ error: "No active flights found" }, { status: 404 });
    }

    // Transform the states data into a more usable format
    const flights = data.states.map((state: any[]) => ({
      callsign: state[1]?.trim() || "",
      icao24: state[0]?.trim() || "",
      origin_country: state[2] || "Unknown",
      longitude: state[5] || 0,
      latitude: state[6] || 0,
      altitude: state[7] || 0,
      on_ground: state[8] || false,
      velocity: state[9] || 0,
      true_track: state[10] || 0,
      vertical_rate: state[11] || 0,
    }));

    console.log("Total flights in response:", flights.length);
    console.log(
      "All flight callsigns:",
      flights.map((f: { callsign: string }) => f.callsign),
    );

    // Find all flights that match our search criteria
    const matchingFlights = flights.filter((flight: any) => {
      const callsign = flight.callsign?.trim() || "";
      const icao24 = flight.icao24?.trim() || "";

      console.log("Checking flight:", {
        callsign,
        icao24,
        searchTerm: flightNumber,
        isMatch:
          callsign.toUpperCase().includes(flightNumber.toUpperCase()) ||
          icao24.toUpperCase().includes(flightNumber.toUpperCase()),
      });

      // For any search term, try to match against both callsign and icao24
      return (
        callsign.toUpperCase().includes(flightNumber.toUpperCase()) ||
        icao24.toUpperCase().includes(flightNumber.toUpperCase())
      );
    });

    console.log("Matching flights found:", matchingFlights.length);
    console.log("Matching flight details:", JSON.stringify(matchingFlights, null, 2));

    if (matchingFlights.length === 0) {
      return NextResponse.json(
        {
          error: "No flights found matching your search",
          details: "Try searching with a different flight number or ICAO24 code",
        },
        { status: 404 },
      );
    }

    // Transform the data to match our frontend interface
    const transformedFlights = matchingFlights.map((flight: any) => ({
      flight: {
        number: flight.callsign?.trim() || "Unknown",
        iata: flight.callsign?.trim() || "Unknown",
        status: flight.on_ground ? "On Ground" : "In Air",
        altitude: flight.altitude || 0,
        latitude: flight.latitude || 0,
        longitude: flight.longitude || 0,
        velocity: flight.velocity || 0,
        true_track: flight.true_track || 0,
        vertical_rate: flight.vertical_rate || 0,
        origin_country: flight.origin_country || "Unknown",
        icao24: flight.icao24 || "Unknown",
      },
    }));

    return NextResponse.json({ flights: transformedFlights });
  } catch (error) {
    console.error("Detailed error:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch flight data",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
