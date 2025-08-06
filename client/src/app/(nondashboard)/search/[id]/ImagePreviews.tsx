"use client";

import React, { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";

const ImagePreviews = ({ images }: ImagePreviewsProps) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const handlePrev = () => {
    setCurrentImageIndex((prevIndex) =>
      prevIndex === 0 ? images.length - 1 : prevIndex - 1
    );
  };
  const handleNext = () => {
    setCurrentImageIndex((prevIndex) =>
      prevIndex === images.length - 1 ? 0 : prevIndex + 1
    );
  };
  return (
    <div className="relative h-[450px] w-full">
      {images.map((image, index) => (
        <div
          key={image}
          className={`absolute top-0 left-0 w-full h-full transition-opacity duration-500 ${
            index === currentImageIndex ? "opacity-100" : "opacity-0"
          }`}
        >
          <Image
            src={image}
            alt={`Image ${index + 1}`}
            fill
            className="object-cover cursor-pointer transition-transform duration-500 ease-in-out"
          />
        </div>
      ))}

      {/* 
        top-1/2 translates the top-left of the container to the center
        and then -translate-y-1/2 moves it up by half its height
        to center the button vertically.
        fkn genius.
       */}
      <button
        onClick={handlePrev}
        className="absolute left-2 top-1/2 transform bg-primary-700/50 hover:bg-black text-white p-2 rounded-full cursor-pointer duration-300"
      >
        <ChevronLeft className="size-5" />
      </button>

      <button
        onClick={handleNext}
        className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-primary-700/50 hover:bg-black text-white p-2 rounded-full cursor-pointer duration-300"
      >
        <ChevronRight className="size-5" />
      </button>
    </div>
  );
};

export default ImagePreviews;
