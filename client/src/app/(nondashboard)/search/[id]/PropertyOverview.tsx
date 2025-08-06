import { useGetPropertyQuery } from "@/state/api";
import { MapPin, Star } from "lucide-react";
import React from "react";

const PropertyOverview = ({ propertyId }: PropertyOverviewProps) => {
  const {
    data: property,
    isError,
    isLoading,
  } = useGetPropertyQuery(propertyId);

  if (isLoading) return <div>Loading...</div>;
  if (isError || !property) return <div>Error loading property details.</div>;

  return (
    <div>
      {/* Header */}
      <div className="mb-4">
        <div className="text-sm text-gray-500 mb-1">
          {property.location?.country} / {property.location?.state} /{" "}
          <span className="font-semibold text-gray-600">
            {property.location?.city}
          </span>
        </div>
        <h1 className="text-3xl font-bold my-5">{property.name}</h1>
        <div className="flex justify-between items-center">
          <span className="flex items-center text-gray-500">
            <MapPin className="size-4 mr-1 text-gray-700" />
            {property.location?.city}, {property.location?.state},{" "}
            {property.location?.country}
          </span>
          <div className="flex justify-between items-center gap-3">
            <span className="flex items-center text-yellow-500">
              <Star className="size-4 mr-1 fill-current" />
              {property.averageRating.toFixed(1)} ({property.numberOfReviews}{" "}
              reviews)
            </span>
            <span className="text-green-600">Verified Listing</span>
          </div>
        </div>
      </div>

      {/* Details */}
      <div className="border border-primary-200 rounded-xl p-6 mb-6">
        <div className="flex justify-between items-center gap-4 px-5">
          <div>
            <div className="text-sm text-gray-500">Monthly Rent</div>
            <div className="font-semibold">
              ${property.pricePerMonth.toLocaleString()}
            </div>
          </div>

          <div className="border-l border-gray-300 h-10" />

          <div>
            <div className="text-sm text-gray-500">Bedrooms</div>
            <div className="font-semibold">
              {property.bedrooms}{" "}
              {property.bedrooms === 1 ? "Bedroom" : "Bedrooms"}
            </div>
          </div>

          <div className="border-l border-gray-300 h-10" />

          <div>
            <div className="text-sm text-gray-500">Bathrooms</div>
            <div className="font-semibold">
              {property.baths} {property.baths === 1 ? "Bathroom" : "Bathrooms"}
            </div>
          </div>

          <div className="border-l border-gray-300 h-10" />

          <div>
            <div className="text-sm text-gray-500">Size</div>
            <div className="font-semibold">
              {property.squareFeet.toLocaleString()} sqft
            </div>
          </div>
        </div>
      </div>

      {/* Summary */}

      <div className="my-16">
        <h2 className="text-xl font-semibold mb-5">About {property.name}</h2>
        <p className="text-gray-500 leading-7 text-justify">
          {property.description} {" "}
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Mollitia, minima! Sit corrupti repudiandae ad nisi. Quo velit tempore consequuntur vitae ducimus incidunt similique nulla hic expedita dolor accusamus, quasi dolorem quia eaque ipsa officia delectus nam neque! Maiores, perspiciatis doloribus veniam similique repellendus aspernatur magni illum fugit necessitatibus obcaecati tempora labore sapiente vero natus corporis? Labore non hic molestiae ratione sequi ad quaerat autem dolores ex magni saepe quidem asperiores, quam itaque sunt ea excepturi nulla repudiandae fuga accusantium harum pariatur ipsum? Suscipit ratione error illo libero quaerat nobis nostrum, quidem commodi officia maxime ab in iusto maiores totam. Ipsum dolorum placeat nam itaque modi, eaque quam vitae soluta debitis eligendi, earum perferendis in magni, animi ipsam asperiores harum molestias corrupti ea aperiam ullam. Sunt accusamus maiores rerum labore, totam consequatur. Molestias, perferendis et rem dolore consequuntur doloremque nostrum ipsa eveniet vitae temporibus, nesciunt ullam eos? Modi commodi tempore, error, atque maxime fugit earum dolorum pariatur ratione, culpa quam fugiat officiis veritatis blanditiis. Aut tempora quod labore corporis? Velit voluptates ab natus, quo quod illum laborum, ipsam qui cum accusantium rem. Sapiente, cum ipsum dolores explicabo nobis quidem voluptates illo at perferendis veritatis, consequatur corporis repellat veniam nemo, velit facilis.
          Lorem ipsum dolor, sit amet consectetur adipisicing elit. Obcaecati, mollitia?
        </p>
      </div>
    </div>
  );
};

export default PropertyOverview;
