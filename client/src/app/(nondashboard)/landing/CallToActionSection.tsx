"use client";

import React from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import Link from 'next/link';

const CallToActionSection = () => {
  return (
    <div className='relative py-24'>
      <Image
        src='/landing-call-to-action.jpg'
        alt='Call to Action Background'
        fill
        className='object-cover object-center'
      />
      <div className="absolute inset-0 bg-black/60"/>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        transition={{ duration: 0.5 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className='relative max-w-4xl xl:max-w-6xl mx-auto px-6 sm:px-8 py-12'
      >
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 md:gap-10">
          <div>
            <h2 className="text-2xl font-bold text-white">
              Find Your Dream Rental Property
            </h2>
          </div>
          <div>
            <p className="mb-3 text-white">
              Discover a wide range of rental properties for your desired location.
            </p>
            <div className="flex justify-center md:justify-start gap-4">
              <button
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className='inline-block text-primary-700 bg-white rounded-lg px-6 py-3 font-semibold hover:bg-primary-500 hover:text-primary-50 hover:cursor-pointer'
              >
                Search
              </button>
              <Link
                href='/signup'
                className='inline-block text-white bg-secondary-500 rounded-lg px-6 py-3 font-semibold hover:bg-secondary-600'
                scroll={false}
              >
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default CallToActionSection