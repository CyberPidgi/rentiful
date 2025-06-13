"use client";

import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const DiscoverSection = () => {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={containerVariants}
      className="py-12 mb-16 bg-white"
    >
      <div className="max-w-6xl xl:max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 xl:px-16">
        <motion.div variants={itemVariants} className="my-12 text-center">
          <h2 className="text-3xl font-semibold leading-tight text-gray-800">
            Discover
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Find your Dream Rental Property
          </p>
          <p className="mt-2 text-gray-500 max-w-3xl mx-auto">
            Searching for a rental property can be overwhelming. Our platform
            simplifies the process, allowing you to explore verified listings,
            read user reviews, and utilize advanced filters to find the perfect
            home for you.
          </p>
        </motion.div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12 xl:gap-16 text-center">
          {[
            {
              imageSrc: "/landing-icon-wand.png",
              title: "Search for Properties",
              description:
                "Browse through our extensive database of rental listings to find your ideal home.",
            },
            {
              imageSrc: "/landing-icon-calendar.png",
              title: "Book your Rental",
              description:
                "Once you've found the perfect rental, easily it book it online with a few click.",
            },
            {
              imageSrc: "/landing-icon-heart.png",
              title: "Enjoy your new home.",
              description:
                "Move into your new rental and enjoy the comfort of your new home.",
            },
          ].map((feature, index) => (
            <motion.div 
              key={index} 
              variants={itemVariants}
            >
              <DiscoverCard
                imageSrc={feature.imageSrc}
                title={feature.title}
                description={feature.description}
              />
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

const DiscoverCard = ({
  imageSrc,
  title,
  description,
}: {
  imageSrc: string;
  title: string;
  description: string;
}) => (
  <div className="px-4 py-12 shadow-lg rounded-lg bg-primary-50 md:h-72">
    <div className="bg-primary-700 p-[0.6rem] rounded-full mb-4 h-10 w-10 mx-auto">
      <Image
        src={imageSrc}
        alt={title}
        width={30}
        height={30}
        className="object-contain h-full w-full"
      />
    </div>
    <h3 className="mt-4 text-xl font-medium text-gray-800">{title}</h3>
    <p className="mt-2 text-base text-gray-500">{description}</p>
  </div>
);

export default DiscoverSection;
