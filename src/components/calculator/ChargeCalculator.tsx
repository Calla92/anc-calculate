import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AircraftSelector } from "./AircraftSelector";
import { WaypointSelector } from "./WaypointSelector";
import { Aircraft } from "@/lib/utils/data-parser";
import { cn } from "@/lib/utils";
import {
  calculateWeightFactor,
  calculateDistanceFactor,
  calculateR,
  calculateCharge,
} from "@/lib/utils/calculations";

export function ChargeCalculator() {
  const [selectedAircraft, setSelectedAircraft] = useState<Aircraft | null>(null);
  const [manualMTOW, setManualMTOW] = useState<number | null>(null);
  const [distance, setDistance] = useState(0);
  const [weightFactor, setWeightFactor] = useState<number | null>(null);
  const [distanceFactor, setDistanceFactor] = useState<number | null>(null);
  const [rValue, setRValue] = useState<number | null>(null);
  const [charge, setCharge] = useState<number | null>(null);

  // Calculate weight factor when aircraft or manual MTOW changes
  useEffect(() => {
    if (selectedAircraft) {
      const wf = calculateWeightFactor(selectedAircraft.weight);
      setWeightFactor(wf);
      setManualMTOW(null);
    } else if (manualMTOW !== null) {
      const wf = calculateWeightFactor(manualMTOW);
      setWeightFactor(wf);
    } else {
      setWeightFactor(null);
    }
  }, [selectedAircraft, manualMTOW]);

  // Calculate distance factor when distance changes
  useEffect(() => {
    if (distance > 0) {
      const df = calculateDistanceFactor(distance);
      setDistanceFactor(df);
    } else {
      setDistanceFactor(null);
    }
  }, [distance]);

  // Calculate R value and charge when weight factor or distance factor changes
  useEffect(() => {
    if (weightFactor !== null && distanceFactor !== null) {
      const r = calculateR(weightFactor, distanceFactor);
      setRValue(r);
      
      const calculatedCharge = calculateCharge(r);
      setCharge(calculatedCharge);
    } else {
      setRValue(null);
      setCharge(null);
    }
  }, [weightFactor, distanceFactor]);

  const handleSelectAircraft = (aircraft: Aircraft | null) => {
    setSelectedAircraft(aircraft);
  };

  const handleManualMTOW = (weight: number) => {
    setManualMTOW(weight);
    setSelectedAircraft(null);
  };

  const handleDistanceChange = (newDistance: number) => {
    setDistance(newDistance);
  };

  const getMTOW = (): number | null => {
    if (selectedAircraft) {
      return selectedAircraft.weight;
    } else if (manualMTOW !== null) {
      return manualMTOW;
    }
    return null;
  };

  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <div className="space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Air Navigation Charges Calculator</h1>
          <p className="text-muted-foreground">
            Calculate air navigation charges based on aircraft weight and distance flown
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Aircraft Information</CardTitle>
            </CardHeader>
            <CardContent>
              <AircraftSelector
                onSelectAircraft={handleSelectAircraft}
                onManualMTOW={handleManualMTOW}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Route Information</CardTitle>
            </CardHeader>
            <CardContent>
              <WaypointSelector onDistanceChange={handleDistanceChange} />
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Calculation Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-muted p-4 rounded-lg space-y-1">
                  <p className="text-sm text-muted-foreground">MTOW (tonnes)</p>
                  <p className="text-xl font-bold">{getMTOW()?.toFixed(2) || "-"}</p>
                </div>
                <div className="bg-muted p-4 rounded-lg space-y-1">
                  <p className="text-sm text-muted-foreground">Distance (km)</p>
                  <p className="text-xl font-bold">{distance > 0 ? distance.toFixed(2) : "-"}</p>
                </div>
                <div className="bg-muted p-4 rounded-lg space-y-1">
                  <p className="text-sm text-muted-foreground">Weight Factor (Wf)</p>
                  <p className="text-xl font-bold">{weightFactor?.toFixed(4) || "-"}</p>
                </div>
                <div className="bg-muted p-4 rounded-lg space-y-1">
                  <p className="text-sm text-muted-foreground">Distance Factor (Df)</p>
                  <p className="text-xl font-bold">{distanceFactor?.toFixed(2) || "-"}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-muted p-4 rounded-lg space-y-1">
                  <p className="text-sm text-muted-foreground">R Value (Wf × Df)</p>
                  <p className="text-xl font-bold">{rValue?.toFixed(4) || "-"}</p>
                </div>
                <div className="bg-primary/10 p-4 rounded-lg space-y-1 border border-primary">
                  <p className="text-sm text-primary-foreground">Navigation Charge</p>
                  <p className="text-2xl font-bold">
                    {charge ? `$${charge.toFixed(2)} USD` : "-"}
                  </p>
                </div>
              </div>
              
              {rValue !== null && (
                <div className="p-4 bg-muted/50 rounded-md mt-4">
                  <h3 className="font-medium mb-2">Charge Calculation</h3>
                  <div className="space-y-1 text-sm">
                    <p>
                      <span className="font-medium">Weight Factor (Wf):</span> sqrt({getMTOW()?.toFixed(2)} / 50) = {weightFactor?.toFixed(4)}
                    </p>
                    <p>
                      <span className="font-medium">Distance Factor (Df):</span> {distance.toFixed(2)} / 100 = {distanceFactor?.toFixed(2)}
                    </p>
                    <p>
                      <span className="font-medium">R Value:</span> {weightFactor?.toFixed(4)} × {distanceFactor?.toFixed(2)} = {rValue.toFixed(4)}
                    </p>
                    <p>
                      <span className="font-medium">Charge Bracket:</span> R = {rValue.toFixed(4)} → ${charge} USD
                    </p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Charge Brackets</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th className="border p-2 text-left">R Value (Wf × Df)</th>
                    <th className="border p-2 text-left">Charge (USD)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className={cn("bg-muted/50", rValue !== null && rValue <= 1 && "bg-primary/10")}>
                    <td className="border p-2">Up to 1</td>
                    <td className="border p-2">$60.00</td>
                  </tr>
                  <tr className={cn("bg-muted/50", rValue !== null && rValue > 1 && rValue <= 2 && "bg-primary/10")}>
                    <td className="border p-2">Above 1 to 2</td>
                    <td className="border p-2">$90.00</td>
                  </tr>
                  <tr className={cn("bg-muted/50", rValue !== null && rValue > 2 && rValue <= 4 && "bg-primary/10")}>
                    <td className="border p-2">Above 2 to 4</td>
                    <td className="border p-2">$140.00</td>
                  </tr>
                  <tr className={cn("bg-muted/50", rValue !== null && rValue > 4 && rValue <= 8 && "bg-primary/10")}>
                    <td className="border p-2">Above 4 to 8</td>
                    <td className="border p-2">$200.00</td>
                  </tr>
                  <tr className={cn("bg-muted/50", rValue !== null && rValue > 8 && rValue <= 12 && "bg-primary/10")}>
                    <td className="border p-2">Above 8 to 12</td>
                    <td className="border p-2">$235.00</td>
                  </tr>
                  <tr className={cn("bg-muted/50", rValue !== null && rValue > 12 && rValue <= 15 && "bg-primary/10")}>
                    <td className="border p-2">Above 12 to 15</td>
                    <td className="border p-2">$280.00</td>
                  </tr>
                  <tr className={cn("bg-muted/50", rValue !== null && rValue > 15 && rValue <= 20 && "bg-primary/10")}>
                    <td className="border p-2">Above 15 to 20</td>
                    <td className="border p-2">$320.00</td>
                  </tr>
                  <tr className={cn("bg-muted/50", rValue !== null && rValue > 20 && rValue <= 25 && "bg-primary/10")}>
                    <td className="border p-2">Above 20 to 25</td>
                    <td className="border p-2">$365.00</td>
                  </tr>
                  <tr className={cn("bg-muted/50", rValue !== null && rValue > 25 && "bg-primary/10")}>
                    <td className="border p-2">Above 25</td>
                    <td className="border p-2">$400.00</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}