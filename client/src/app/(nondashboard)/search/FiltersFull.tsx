"use client";

import { AmenityIcons, PropertyTypeIcons } from "@/lib/constants";
import { cleanParams, cn, formatEnumString } from "@/lib/utils";
import { FiltersState, initialState, setFilters } from "@/state";
import { useAppDispatch, useAppSelector } from "@/state/redux";
import { debounce } from "lodash";
import { usePathname, useRouter } from "next/navigation";
import React, { useState } from "react";

import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectItem,
  SelectValue,
  SelectContent,
  SelectTrigger,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

const FiltersFull = () => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const pathName = usePathname();
  const filters = useAppSelector((state) => state.global.filters);
  const isFiltersFullOpen = useAppSelector(
    (state) => state.global.isFiltersFullOpen
  );

  const [localFilters, setLocalFilters] = useState(initialState.filters);

  const updateURL = debounce((newFilters: FiltersState) => {
    const cleanFilters = cleanParams(newFilters);
    const updatedSearchParams = new URLSearchParams();

    Object.entries(cleanFilters).forEach(([key, value]) => {
      updatedSearchParams.set(
        key,
        Array.isArray(value) ? value.join(",") : value.toString()
      );
    });
    router.push(`${pathName}?${updatedSearchParams.toString()}`);
  });

  const handleSubmit = () => {
    dispatch(setFilters(localFilters));
    updateURL(localFilters);
  };

  const handleReset = () => {
    setLocalFilters(initialState.filters);
    dispatch(setFilters(initialState.filters));
    updateURL(initialState.filters);
  };

  const handleAmenityChange = (amenity: string) => {
    const updatedAmenities = localFilters.amenities.includes(amenity)
      ? localFilters.amenities.filter((a) => a !== amenity)
      : [...localFilters.amenities, amenity];
    setLocalFilters({
      ...localFilters,
      amenities: updatedAmenities,
    });
  }

  const handleLocationSearch = async () => {
    // Implement location search logic here
    // This could involve fetching suggestions or filtering properties based on the input
  }

  if (!isFiltersFullOpen) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg px-4 h-full overflow-auto pb-10">
      <div className="flex flex-col space-y-6">
        {/* Location */}
        <div>
          <h1 className="font-bold mb-2">Location</h1>
          <div className="flex items-center">
            <Input
              placeholder="Enter location"
              value={localFilters.location}
              onChange={(e) =>
                setLocalFilters({ ...localFilters, location: e.target.value })
              }
              className="rounded-l-xl rounded-r-none border-r-0"
            />
            <Button
              onClick={() => {}}
              className="rounded-r-xl rounded-l-none border-l-none border-black shadow-none border
              hover:bg-black hover:text-white hover:cursor-pointer"
            >
              <Search className="size-4" />
            </Button>
          </div>
        </div>

        {/* Property Type */}
        <div>
          <h4 className="font-bold mb-2">Property Type</h4>
          <div className="grid grid-cols-2 gap-4">
            {Object.entries(PropertyTypeIcons).map(([type, Icon]) => (
              <div 
                key={type}
                className={
                  cn(
                    "flex flex-col items-center justify-center p-4 border rounded-xl cursor-pointer hover:bg-black hover:text-white duration-300",
                    localFilters.propertyType === type
                      ? "border-black"
                      : "border-gray-200"
                  )
                }
                onClick={() => {
                  setLocalFilters({
                    ...localFilters,
                    propertyType: type as PropertyTypeEnum,
                  })
                }}
              >
                <Icon className="size-6 mb-2" />
                <span>{type}</span>
              </div>
            ))}
          </div>
        </div>
        
        {/* Price Range */}
        <div>
          <h4 className="font-bold mb-2">Price Range (Monthly)</h4>
          <Slider
            className=""
            min={0}
            max={10000}
            step={100}
            value={[
              localFilters.priceRange[0] ?? 0, localFilters.priceRange[1] ?? 10000,
            ]}
            onValueChange={(value: any) => {
              setLocalFilters({
                ...localFilters,
                priceRange: value as [number, number],
              });
            }}
          />
          <div className="flex justify-between mt-2">
            <span>Minimum Price: {localFilters.priceRange[0] ?? 0}</span>
            <span>Maximum Price: {localFilters.priceRange[1] ?? 10000}</span>
          </div>
        </div>

        {/* Beds and Baths */}
        <div className="flex gap-4">
          <div className="flex-1">
            <h4 className="font-bold mb-4">Beds</h4>
            <Select
              value={localFilters.beds ?? "any"}
              onValueChange={(value) =>
                setLocalFilters({
                  ...localFilters,
                  beds: value
                })
              }
            >
              <SelectTrigger className="w-full rounded-xl border-gray-300">
                <SelectValue placeholder="Any Beds" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any">Any Beds</SelectItem>
                {[1, 2, 3, 4, 5].map((bed) => (
                  <SelectItem key={bed} value={bed.toString()}>
                    {bed}+ Bed{bed > 1 ? "s" : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex-1">
            <h4 className="font-bold mb-4">Baths</h4>
            <Select
              value={localFilters.baths ?? "any"}
              onValueChange={(value) =>
                setLocalFilters({
                  ...localFilters,
                  baths: value
                })
              }
            >
              <SelectTrigger className="w-full rounded-xl border-gray-300">
                <SelectValue placeholder="Any Baths" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any">Any Baths</SelectItem>
                {[1, 2, 3, 4, 5].map((bath) => (
                  <SelectItem key={bath} value={bath.toString()}>
                    {bath}+ Bath{bath > 1 ? "s" : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Square Feet */}
        <div>
          <h4 className="font-bold mb-2">Square Feet</h4>
          <Slider
            className=""
            min={0}
            max={5000}
            step={100}
            value={[
              localFilters.squareFeet[0] ?? 0, localFilters.squareFeet[1] ?? 5000,
            ]}
            onValueChange={(value: any) => {
              setLocalFilters({
                ...localFilters,
                squareFeet: value as [number, number],
              });
            }}
          />
          <div className="flex justify-between mt-2">
            <span>Minimum: {localFilters.squareFeet[0] ?? 0} sq ft</span>
            <span>Maximum: {localFilters.squareFeet[1] ?? 5000} sq ft</span>
          </div>
        </div>

        {/* Amenities */}
        <div>
          <h4 className="font-bold mb-2">Amenities</h4>
          <div className="grid grid-cols-2 gap-4">
            {Object.entries(AmenityIcons).map(([amenity, Icon]) => (
              <div 
                key={amenity} 
                className={cn("flex items-center space-x-2 p-2 border rounded-lg hover:bg-black hover:text-white hover:cursor-pointer duration-300 group", localFilters.amenities.includes(amenity) ? "border-black" : "border-gray-200")}
                onClick={() => handleAmenityChange(amenity as AmenityEnum)}
              >
                <Icon className="size-5 hover:cursor-pointer"/>
                <Label className="group-hover:cursor-pointer">
                  {formatEnumString(amenity)}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Available From */}
        <div>
          <h4 className="font-bold mb-2">Available From</h4>
          <Input
            type="date"
            value={localFilters.availableFrom !== "any" ? localFilters.availableFrom : ""}
            onChange={(e) =>
              setLocalFilters({
                ...localFilters,
                availableFrom: e.target.value,
              })
            }
            className="rounded-xl border-gray-300 w-fit"
          />
        </div>

        <div className="flex gap-4 mt-6">
          <Button
            onClick={handleSubmit}
            className="flex-1 bg-primary-700 text-white hover:bg-primary-800 rounded-xl shadow-md transition-colors duration-300 hover:cursor-pointer"
          >
            Apply
          </Button>
          <Button
            onClick={handleReset}
            className="flex-1 bg-gray-200 text-gray-800 hover:bg-gray-300 rounded-xl shadow-md transition-colors duration-300 hover:cursor-pointer"
          >
            Reset
          </Button>
        </div>
      </div>
    </div>
  );
};

export default FiltersFull;
