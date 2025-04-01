"use client";

import { useState } from "react";
import type { NextPage } from "next";
import { useAccount } from "wagmi";
import { ChartBarIcon, ClockIcon, MapPinIcon, PaperAirplaneIcon } from "@heroicons/react/24/outline";
import { useScaffoldWriteContract } from "~~/hooks/scaffold-eth";

interface FlightData {
  flights: Array<{
    flight: {
      number: string;
      iata: string;
      status: string;
      altitude: number;
      latitude: number;
      longitude: number;
      velocity: number;
      true_track: number;
      vertical_rate: number;
      origin_country: string;
      icao24: string;
    };
  }>;
}

interface ErrorResponse {
  error: string;
  details?: string;
}

const Home: NextPage = () => {
  const { address: connectedAddress } = useAccount();
  const [flightNumber, setFlightNumber] = useState("");
  const [flightData, setFlightData] = useState<FlightData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ErrorResponse | null>(null);
  const [selectedFlightIndex, setSelectedFlightIndex] = useState<number | null>(null);

  const { writeContractAsync: writeYourContractAsync } = useScaffoldWriteContract({ contractName: "YourContract" });

  const fetchFlightData = async () => {
    if (!flightNumber) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/flight?flightNumber=${flightNumber}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch flight data");
      }

      setFlightData(data);
    } catch (err) {
      setError({
        error: "Failed to fetch flight data",
        details: err instanceof Error ? err.message : "An unknown error occurred",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="flex flex-col items-center justify-center min-h-screen py-2 bg-gradient-to-b from-sky-100 to-white">
        <div className="absolute top-0 left-0 w-full h-1/3 bg-gradient-to-b from-sky-400 to-transparent -z-10"></div>
        <div className="absolute bottom-0 left-0 w-full h-1/3 bg-gradient-to-t from-sky-400 to-transparent -z-10"></div>

        <div className="flex items-center space-x-2 mb-8">
          <PaperAirplaneIcon className="h-12 w-12 text-sky-500 transform rotate-45" />
          <h1 className="text-4xl font-bold text-sky-900">Flight Tracker</h1>
        </div>

        <div className="w-full max-w-md space-y-4 bg-white/95 backdrop-blur-sm rounded-xl p-6 shadow-xl">
          <div className="flex flex-col gap-0">
            <div className="relative">
              <input
                type="text"
                value={flightNumber}
                onChange={e => setFlightNumber(e.target.value)}
                placeholder="Enter flight number (e.g., HA92)"
                className="input input-bordered w-full pl-10 bg-white text-gray-900 placeholder-gray-500"
              />
              <PaperAirplaneIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-sky-500" />
            </div>
            <div className="text-sm text-gray-700 space-y-0 bg-sky-50/50 p-2 rounded-lg">
              <p className="font-medium">Search by:</p>
              <ul className="list-disc list-inside space-y-0">
                <li>Flight number (e.g., HA92)</li>
                <li>ICAO24 code (e.g., A0B1C2)</li>
              </ul>
              <p className="text-gray-600">
                Note: For Hawaiian Airlines flights, use the exact flight number starting with &apos;HA&apos;
              </p>
            </div>
            <button
              onClick={fetchFlightData}
              disabled={loading || !flightNumber}
              className="btn btn-primary bg-sky-500 hover:bg-sky-600 border-0 text-white"
            >
              {loading ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Loading...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <PaperAirplaneIcon className="h-5 w-5" />
                  <span>Track Flight</span>
                </div>
              )}
            </button>
          </div>

          {error && (
            <div className="alert alert-error bg-red-50 border-red-200">
              <div className="flex flex-col">
                <span className="font-bold text-red-700">{error.error}</span>
                {error.details && <span className="text-sm text-red-600">{error.details}</span>}
              </div>
            </div>
          )}

          {flightData && flightData.flights.length > 0 && (
            <div className="space-y-4">
              <div className="bg-white rounded-lg p-4 border border-sky-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Matching Flights</h3>
                <div className="space-y-2">
                  {flightData.flights.map((flightInfo, index) => (
                    <label
                      key={index}
                      className="flex items-center space-x-3 p-2 hover:bg-sky-50 rounded-lg cursor-pointer"
                    >
                      <input
                        type="radio"
                        name="flight-select"
                        className="radio radio-primary"
                        checked={selectedFlightIndex === index}
                        onChange={() => setSelectedFlightIndex(index)}
                      />
                      <div className="flex items-center space-x-2">
                        <PaperAirplaneIcon className="h-5 w-5 text-sky-500" />
                        <span className="text-gray-900">
                          {flightInfo.flight.number} - {flightInfo.flight.origin_country}
                        </span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {selectedFlightIndex !== null && flightData.flights[selectedFlightIndex] && (
                <div className="card bg-white shadow-xl border border-sky-100">
                  <div className="card-body">
                    <h2 className="card-title text-gray-900 flex items-center space-x-2 mb-1">
                      <PaperAirplaneIcon className="h-6 w-6 text-sky-500" />
                      <span>Flight Information</span>
                    </h2>
                    <div className="space-y-0">
                      <div className="flex items-center space-x-2">
                        <PaperAirplaneIcon className="h-4 w-4 text-sky-500" />
                        <p className="text-gray-900 text-sm leading-none">
                          <strong className="text-gray-700">Flight Number:</strong>{" "}
                          {flightData.flights[selectedFlightIndex].flight.number}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <ClockIcon className="h-4 w-4 text-sky-500" />
                        <p className="text-gray-900 text-sm leading-none">
                          <strong className="text-gray-700">Status:</strong>{" "}
                          {flightData.flights[selectedFlightIndex].flight.status}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <ChartBarIcon className="h-4 w-4 text-sky-500" />
                        <p className="text-gray-900 text-sm leading-none">
                          <strong className="text-gray-700">Altitude:</strong>{" "}
                          {Math.round(flightData.flights[selectedFlightIndex].flight.altitude)} meters
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <ChartBarIcon className="h-4 w-4 text-sky-500" />
                        <p className="text-gray-900 text-sm leading-none">
                          <strong className="text-gray-700">Speed:</strong>{" "}
                          {Math.round(flightData.flights[selectedFlightIndex].flight.velocity)} m/s
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <ChartBarIcon className="h-4 w-4 text-sky-500" />
                        <p className="text-gray-900 text-sm leading-none">
                          <strong className="text-gray-700">Heading:</strong>{" "}
                          {Math.round(flightData.flights[selectedFlightIndex].flight.true_track)}°
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <ChartBarIcon className="h-4 w-4 text-sky-500" />
                        <p className="text-gray-900 text-sm leading-none">
                          <strong className="text-gray-700">Vertical Rate:</strong>{" "}
                          {Math.round(flightData.flights[selectedFlightIndex].flight.vertical_rate)} m/s
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <MapPinIcon className="h-4 w-4 text-sky-500" />
                        <p className="text-gray-900 text-sm leading-none">
                          <strong className="text-gray-700">Origin Country:</strong>{" "}
                          {flightData.flights[selectedFlightIndex].flight.origin_country}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <MapPinIcon className="h-4 w-4 text-sky-500" />
                        <p className="text-gray-900 text-sm leading-none">
                          <strong className="text-gray-700">Location:</strong>{" "}
                          {flightData.flights[selectedFlightIndex].flight.latitude.toFixed(4)},{" "}
                          {flightData.flights[selectedFlightIndex].flight.longitude.toFixed(4)}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <PaperAirplaneIcon className="h-4 w-4 text-sky-500" />
                        <p className="text-gray-900 text-sm leading-none">
                          <strong className="text-gray-700">Aircraft Registration:</strong>{" "}
                          {flightData.flights[selectedFlightIndex].flight.icao24}
                        </p>
                      </div>
                      <button
                        className="btn btn-primary bg-sky-500 hover:bg-sky-600 border-0 w-full mt-4 text-white"
                        onClick={async () => {
                          if (!connectedAddress) {
                            setError({
                              error: "Wallet not connected",
                              details: "Please connect your wallet before minting",
                            });
                            return;
                          }

                          try {
                            await writeYourContractAsync({
                              functionName: "mint",
                              args: [
                                connectedAddress,
                                BigInt(Math.round(flightData.flights[selectedFlightIndex].flight.altitude || 0)),
                              ],
                            });
                            setError(null);
                          } catch (e) {
                            console.error("Error minting NFT:", e);
                            setError({
                              error: "Failed to mint NFT",
                              details: e instanceof Error ? e.message : "An unknown error occurred",
                            });
                          }
                        }}
                      >
                        <div className="flex items-center space-x-2">
                          <PaperAirplaneIcon className="h-5 w-5" />
                          <span>Mint Flight NFT</span>
                        </div>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Home;
