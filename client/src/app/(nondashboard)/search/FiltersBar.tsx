import { FiltersState, setFilters, setViewMode, toggleFiltersFullOpen } from "@/state";
import { useAppDispatch, useAppSelector } from "@/state/redux";
import { usePathname, useRouter } from "next/navigation";
import React, { useState } from "react";
import { debounce } from "lodash";
import { cleanParams, cn, formatPriceValue } from "@/lib/utils";

import { Filter, Grid, List, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectItem,
  SelectValue,
  SelectContent,
  SelectTrigger,
} from "@/components/ui/select";
import { PropertyTypeIcons } from "@/lib/constants";

const FiltersBar = () => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const pathName = usePathname();
  const filters = useAppSelector((state) => state.global.filters);
  const isFiltersFullOpen = useAppSelector(
    (state) => state.global.isFiltersFullOpen
  );
  const viewMode = useAppSelector((state) => state.global.viewMode);

  const [searchInput, setSearchInput] = useState(filters.location);

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

  const handleFilterChange = (
    key: string,
    value: any,
    isMin: boolean | null
  ) => {
    let newValue = value;

    if (key === "priceRange" || key === "squareFeet") {
      const currentArrayRange = [...filters[key]];
      if (isMin !== null) {
        const index = isMin ? 0 : 1;
        currentArrayRange[index] = value === "any" ? null : Number(value);
      }
      newValue = currentArrayRange;
    } else if (key === "coordinates") {
      newValue = value === "any" ? [0, 0] : value.map(Number);
    }

    const newFilters = {
      ...filters,
      [key]: newValue,
    };
    dispatch(setFilters(newFilters));
    updateURL(newFilters);
  };

  return (
    <div className="flex justify-between w-full items-center py-5">
      {/* Filters */}
      <div className="flex justify-between items-center gap-4 p-2">
        {/* All Filters */}
        <Button
          variant="outline"
          className={cn(
            "gap-2 rounded-xl border-primary-400 hover:bg-primary-500 hover:text-primary-100 hover:cursor-pointer ",
            isFiltersFullOpen && "bg-primary-700 text-primary-100"
          )}
          onClick={() => dispatch(toggleFiltersFullOpen())}
        >
          <Filter className="size-4" />
          <span>All Filters</span>
        </Button>

        {/* Search Location */}
        <div className="flex items-center">
          <Input
            placeholder="Search by location"
            value={searchInput}
            onChange={(e) => {
              setSearchInput(e.target.value);
            }}
            className="w-40 rounded-l-xl rounded-r-none border-primary-400 border-r-0"
          />
          <Button
            variant="outline"
            className="rounded-l-none rounded-r-xl border-primary-400 shadow-none border-l-none hover:bg-primary-700 hover:text-primary-50 hover:cursor-pointer"
            // onClick={handleLocationSearch}
          >
            <Search className="size-4" />
          </Button>
        </div>

        {/* Price Range */}
        <div className="flex gap-1">
          {/* Minimum Price */}
          <Select
            value={filters.priceRange[0]?.toString() ?? "any"}
            onValueChange={(value) =>
              handleFilterChange("priceRange", value, true)
            }
          >
            <SelectTrigger className="w-fit rounded-xl border-primary-400">
              <SelectValue>
                {formatPriceValue(filters.priceRange[0], true) || "Min Price"}
              </SelectValue>
            </SelectTrigger>
            <SelectContent className="bg-white">
              <SelectItem value="any">Any Min Price</SelectItem>
              {[500, 1000, 1500, 2000, 3000, 5000, 10000].map((price) => (
                <SelectItem key={price} value={price.toString()}>
                  {formatPriceValue(price, true)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Maximum Price */}
          <Select
            value={filters.priceRange[1]?.toString() ?? "any"}
            onValueChange={(value) =>
              handleFilterChange("priceRange", value, false)
            }
          >
            <SelectTrigger className="w-fit rounded-xl border-primary-400">
              <SelectValue>
                {formatPriceValue(filters.priceRange[1], false) || "Max Price"}
              </SelectValue>
            </SelectTrigger>
            <SelectContent className="bg-white">
              <SelectItem value="any">Any Max Price</SelectItem>
              {[1000, 1500, 2000, 3000, 5000, 10000].map((price) => (
                <SelectItem key={price} value={price.toString()}>
                  {formatPriceValue(price, false)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        
        {/* Beds and Baths */}
        <div className="flex gap-1">

          {/* Beds */}
          <Select
            value={filters.beds?.toString() ?? "any"}
            onValueChange={(value) =>
              handleFilterChange("beds", value, null)
            }
          >
            <SelectTrigger className="w-fit rounded-xl border-primary-400">
              <SelectValue placeholder="Beds"/>
            </SelectTrigger>
            <SelectContent className="bg-white">
              <SelectItem value="any">Any Number of Beds</SelectItem>
              <SelectItem value="1">1+ Bed</SelectItem>
              <SelectItem value="2">2+ Beds</SelectItem>
              <SelectItem value="3">3+ Beds</SelectItem>
              <SelectItem value="4">4+ Beds</SelectItem>
            </SelectContent>
          </Select>

          {/* Baths */}
          <Select
            value={filters.baths?.toString() ?? "any"}
            onValueChange={(value) =>
              handleFilterChange("baths", value, null)
            }
          >
            <SelectTrigger className="w-fit rounded-xl border-primary-400">
              <SelectValue placeholder="Baths"/>
            </SelectTrigger>
            <SelectContent className="bg-white">
              <SelectItem value="any">Any Number of Baths</SelectItem>
              <SelectItem value="1">1+ Bath</SelectItem>
              <SelectItem value="2">2+ Baths</SelectItem>
              <SelectItem value="3">3+ Baths</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Property Type */}
        <Select
          value={filters.propertyType ?? "any"}
          onValueChange={(value) =>
            handleFilterChange("propertyType", value, null)
          }
        >
          <SelectTrigger className="w-36 rounded-xl border-primary-400">
            <SelectValue placeholder="Home Type" />
          </SelectTrigger>
          <SelectContent className="bg-white">
            <SelectItem value="any">Any Property Type</SelectItem>
            {Object.entries(PropertyTypeIcons).map(([type, Icon]) => (
              <SelectItem key={type} value={type}>
                <div className="flex items-center">
                  <Icon className="size-4 mr-2" />
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* View Mode Toggle */}
      <div className="flex justify-between items-center gap-4 p-2">
        <div className="flex border rounded-xl">
          <Button
            variant={'ghost'}
            className={cn(
              "px-3 py-1 rounded-none rounded-l-xl hover:bg-primary-600 hover:text-primary-100",
              viewMode === "list" ? "bg-primary-700 text-primary-50" : ""
            )}
            onClick={() => dispatch(setViewMode("list"))}
          >
            <List className="size-5" />
          </Button>
          <Button
            variant={'ghost'}
            className={cn(
              "px-3 py-1 rounded-none rounded-r-xl hover:bg-primary-600 hover:text-primary-100",
              viewMode === "grid" ? "bg-primary-700 text-primary-50" : ""
            )}
            onClick={() => dispatch(setViewMode("grid"))}
          >
            <Grid className="size-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default FiltersBar;
