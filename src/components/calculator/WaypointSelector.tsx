import React, { useState, useEffect } from "react";
import { Check, Plus, Trash2 } from "lucide-react";
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
import { Waypoint, parseWaypointsData, calculateDistance } from "@/lib/utils/data-parser";

interface WaypointSelectorProps {
  onDistanceChange: (distance: number) => void;
}

export function WaypointSelector({ onDistanceChange }: WaypointSelectorProps) {
  const [open, setOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [waypoints, setWaypoints] = useState<Waypoint[]>([]);
  const [filteredWaypoints, setFilteredWaypoints] = useState<Waypoint[]>([]);
  const [selectedWaypoints, setSelectedWaypoints] = useState<Waypoint[]>([]);
  const [totalDistance, setTotalDistance] = useState(0);

  // Load waypoint data
  useEffect(() => {
    const fetchData = async () => {
      const data = await parseWaypointsData();
      setWaypoints(data);
      setFilteredWaypoints(data);
    };
    fetchData();
  }, []);

  // Filter waypoints based on search value
  useEffect(() => {
    if (searchValue.trim() === "") {
      setFilteredWaypoints(waypoints);
      return;
    }

    const lowercaseSearch = searchValue.toLowerCase();
    const filtered = waypoints.filter((waypoint) =>
      waypoint.name.toLowerCase().includes(lowercaseSearch)
    );

    setFilteredWaypoints(filtered);
  }, [searchValue, waypoints]);

  // Calculate total distance when selected waypoints change
  useEffect(() => {
    let distance = 0;
    if (selectedWaypoints.length >= 2) {
      for (let i = 0; i < selectedWaypoints.length - 1; i++) {
        const current = selectedWaypoints[i];
        const next = selectedWaypoints[i + 1];
        distance += calculateDistance(
          current.latitude,
          current.longitude,
          next.latitude,
          next.longitude
        );
      }
    }
    setTotalDistance(distance);
    onDistanceChange(distance);
  }, [selectedWaypoints, onDistanceChange]);

  const handleSelectWaypoint = (waypoint: Waypoint) => {
    setSelectedWaypoints([...selectedWaypoints, waypoint]);
    setSearchValue("");
    setOpen(false);
  };

  const handleRemoveWaypoint = (index: number) => {
    const updated = [...selectedWaypoints];
    updated.splice(index, 1);
    setSelectedWaypoints(updated);
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <h3 className="font-medium">Select Waypoints</h3>

        <div className="flex flex-wrap gap-2 mb-4">
          {selectedWaypoints.map((waypoint, index) => (
            <div 
              key={`${waypoint.name}-${index}`} 
              className="flex items-center gap-2 bg-muted px-3 py-1 rounded-md"
            >
              <span className="text-sm font-medium">{index + 1}. {waypoint.name}</span>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-5 w-5 rounded-full" 
                onClick={() => handleRemoveWaypoint(index)}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>

        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="w-full justify-between"
            >
              <div className="flex items-center">
                <Plus className="mr-2 h-4 w-4" />
                Add waypoint
              </div>
              <span className="opacity-50">({selectedWaypoints.length} selected)</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[400px] p-0">
            <Command>
              <CommandInput 
                placeholder="Search waypoints..." 
                value={searchValue}
                onValueChange={setSearchValue}
              />
              <CommandEmpty>No waypoints found.</CommandEmpty>
              <CommandGroup className="max-h-[300px] overflow-y-auto">
                {filteredWaypoints.map((waypoint, index) => (
                  <CommandItem
                    key={`${waypoint.name}-${index}`}
                    value={waypoint.name}
                    onSelect={() => handleSelectWaypoint(waypoint)}
                    className="cursor-pointer"
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4 opacity-0"
                      )}
                    />
                    {waypoint.name} ({waypoint.latitude.toFixed(4)}, {waypoint.longitude.toFixed(4)})
                  </CommandItem>
                ))}
              </CommandGroup>
            </Command>
          </PopoverContent>
        </Popover>
      </div>

      <div className="p-4 border rounded-md bg-muted/50">
        <div className="flex items-center justify-between">
          <span className="font-medium">Total Distance:</span>
          <span className="font-bold">{totalDistance.toFixed(2)} km</span>
        </div>
      </div>
    </div>
  );
}