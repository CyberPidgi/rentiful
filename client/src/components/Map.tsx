"use client";

import React, { useRef } from "react";
import "leaflet/dist/leaflet.css";
import "leaflet-defaulticon-compatibility";
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import { useAppSelector } from "@/state/redux";
import { useGetPropertiesQuery } from "@/state/api";
import { set } from "lodash";

const Map = () => {
  const filters = useAppSelector((state) => state.global.filters);

  const {
    data: properties,
    isLoading,
    isError,
  } = useGetPropertiesQuery(filters);
  console.log("Properties:", properties);

  if (isLoading) {
    return <div>Loading map...</div>;
  }


  console.log("Filters:", filters);

  return (
    <div className="basis-5/12 grow relative rounded-xl border-black border">
      <MapContainer
        className="w-full h-full"
        center={[filters?.coordinates[1], filters?.coordinates[0]]}
        zoom={9}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {properties?.map((property) => {
          const longitude = property.location.coordinates.longitude;
          const latitude = property.location.coordinates.latitude;

          return (
          <Marker
            key={property.id}
            position={[latitude, longitude]}
          >
            <Popup className='h-fit'>
              <div className="flex flex-col -m-2">
                <a href={`/search/${property.id}`}>{property.name}</a>
                <p>Price: ${property.pricePerMonth}</p>
              </div>
            </Popup>
          </Marker>);
        })}
      </MapContainer>
    </div>
  );
};

export default Map;
