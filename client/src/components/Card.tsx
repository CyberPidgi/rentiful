import React, { useState } from "react";
import Image from "next/image";
import { Bath, Bed, Heart, House, Star } from "lucide-react";
import Link from "next/link";

const Card = ({
  property,
  isFavorite,
  onFavoriteToggle,
  showFavoriteButton,
  propertyLink,
}: CardProps) => {
  const [imgSrc, setImgSrc] = useState<string>(
    property.photoUrls?.[0] || "/placeholder.jpg"
  );
  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-lg w-full mb-5">
      <div className="relative">
        <div className="w-full h-48 relative">
          <Image
            src={imgSrc}
            alt={property.title}
            fill
            className="object-cover"
            onError={() => setImgSrc("/placeholder.jpg")}
          />
        </div>

        <div className="absolute bottom-4 left-4 flex gap-2">
          {property.isPetsAllowed && (
            <span className="bg-white text-black text-xs font-semibold px-2 py-1 rounded-full">
              Pets Allowed
            </span>
          )}

          {property.isParkingIncluded && (
            <span className="bg-white text-black text-xs font-semibold px-2 py-1 rounded-full">
              Parking Included
            </span>
          )}
        </div>
        {showFavoriteButton && (
          <button
            className={`absolute top-4 right-4 flex items-center justify-center p-1 text-base bg-black rounded-full cursor-pointer`}
            onClick={onFavoriteToggle}
          >
            <Heart
              className={`size-5 ${
                isFavorite
                  ? "text-red-500 fill-red-500"
                  : "fill-none text-white"
              }`}
            />
          </button>
        )}

        <div className="p-4">
          <h2 className="text-xl font-bold mb-1">
            {propertyLink ? (
              <Link
                href={propertyLink}
                className="text-blue-600 hover:underline"
                scroll={false}
              >
                {property.name}
              </Link>
            ) : (
              <span>{property.name}</span>
            )}
          </h2>
          <p className="text-gray-600 mb-2">
            {property?.location.address}, {property?.location.city}
          </p>
          <div className="flex justify-between items-center">
            <div className="flex items-center mb-2">
              <Star className='size-4 text-yellow-400 mr-1'/>
              <span className="font-semibold">
                {property.averageRating?.toFixed(1) || "N/A"}
              </span>
              <span className="text-gray-500 ml-1">
                ({property.numberOfReviews || 0} reviews)
              </span>
            </div>

            <p className="text-lg font-bold mb-3">
              ${property.pricePerMonth.toFixed(0)}/month
            </p>
          </div>
          <hr/>
          <div className="flex justify-between items-center mt-5 gap-4 text-gray-600">
            <span className="flex items-center">
              <Bed className='size-5 mr-2'/>
              {property.beds} Beds
            </span>
            <span className="flex items-center">
              <Bath className='size-5 mr-2'/>
              {property.baths} Baths
            </span>
            <span className="flex items-center">
              <House className='size-5 mr-2'/>
              {property.squareFeet} sqft
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Card;
