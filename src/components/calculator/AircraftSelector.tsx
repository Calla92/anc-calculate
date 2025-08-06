import React, { useState, useEffect } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Aircraft, parseAircraftData } from "@/lib/utils/data-parser";

interface AircraftSelectorProps {
  onSelectAircraft: (aircraft: Aircraft | null) => void;
  onManualMTOW: (weight: number) => void;
}

export function AircraftSelector({ onSelectAircraft, onManualMTOW }: AircraftSelectorProps) {
  const [open, setOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [aircrafts, setAircrafts] = useState<Aircraft[]>([]);
  const [filteredAircrafts, setFilteredAircrafts] = useState<Aircraft[]>([]);
  const [selectedAircraft, setSelectedAircraft] = useState<Aircraft | null>(null);
  const [manualMTOW, setManualMTOW] = useState<string>("");
  const [isManualInput, setIsManualInput] = useState(false);

  // Load aircraft data
  useEffect(() => {
    const fetchData = async () => {
      const data = await parseAircraftData();
      setAircrafts(data);
      setFilteredAircrafts(data);
    };
    fetchData();
  }, []);

  // Filter aircraft based on search value
  useEffect(() => {
    if (searchValue.trim() === "") {
      setFilteredAircrafts(aircrafts);
      return;
    }

    const lowercaseSearch = searchValue.toLowerCase();
    const filtered = aircrafts.filter(
      (aircraft) =>
        aircraft.manufacturer.toLowerCase().includes(lowercaseSearch) ||
        aircraft.model.toLowerCase().includes(lowercaseSearch)
    );

    setFilteredAircrafts(filtered);
  }, [searchValue, aircrafts]);

  const handleSelectAircraft = (aircraft: Aircraft) => {
    setSelectedAircraft(aircraft);
    setIsManualInput(false);
    onSelectAircraft(aircraft);
    setOpen(false);
  };

  const handleManualSubmit = () => {
    const weight = parseFloat(manualMTOW);
    if (!isNaN(weight) && weight > 0) {
      onManualMTOW(weight);
      setSelectedAircraft(null);
      setIsManualInput(true);
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <h3 className="font-medium">Select Aircraft</h3>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="w-full justify-between"
            >
              {selectedAircraft
                ? `${selectedAircraft.manufacturer} ${selectedAircraft.model}`
                : isManualInput
                ? `Manual MTOW: ${manualMTOW} tonnes`
                : "Search for aircraft..."}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[400px] p-0">
            <Command>
              <CommandInput 
                placeholder="Search aircraft by manufacturer or model..." 
                value={searchValue}
                onValueChange={setSearchValue}
              />
              <CommandEmpty>No aircraft found.</CommandEmpty>
              <CommandGroup className="max-h-[300px] overflow-y-auto">
                {filteredAircrafts.map((aircraft, index) => (
                  <CommandItem
                    key={`${aircraft.manufacturer}-${aircraft.model}-${index}`}
                    value={`${aircraft.manufacturer} ${aircraft.model}`}
                    onSelect={() => handleSelectAircraft(aircraft)}
                    className="cursor-pointer"
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        selectedAircraft?.model === aircraft.model &&
                          selectedAircraft?.manufacturer === aircraft.manufacturer
                          ? "opacity-100"
                          : "opacity-0"
                      )}
                    />
                    {aircraft.manufacturer} {aircraft.model} - {aircraft.weight} tonnes
                  </CommandItem>
                ))}
              </CommandGroup>
            </Command>
          </PopoverContent>
        </Popover>
      </div>

      <div className="space-y-2">
        <h3 className="font-medium">Or Enter MTOW Manually</h3>
        <div className="flex gap-2">
          <Input
            type="number"
            placeholder="Enter MTOW in tonnes"
            value={manualMTOW}
            onChange={(e) => setManualMTOW(e.target.value)}
            className="flex-1"
            step="0.01"
            min="0"
          />
          <Button onClick={handleManualSubmit}>Use</Button>
        </div>
      </div>
    </div>
  );
}