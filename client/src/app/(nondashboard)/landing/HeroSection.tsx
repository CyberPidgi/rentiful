"use client";

import React from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const HeroSection = () => {
  return (
    <div className='relative h-screen'>
      <Image 
        src='/landing-splash.jpg'
        alt='Hero Background'
        fill
        className='object-cover object-center'
        priority
      />
      <div className="absolute inset-0 bg-black/60">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeInOut' }}
          className='absolute top-1/3 transform -translate-y-1/2 text-center w-full'
        >
          <div className="max-w-4xl px-16 mx-auto sm:px-12">
            <h1 className="text-5xl font-bold text-white mb-4">
              Start your journey to find the perfect rental apartment
            </h1>
          </div>
          <p className="text-xl text-white mb-8">
            Explore our wide range of rental properties tailored for your lifestyle.
          </p>
          <div className="flex justify-center">
            <Input
              type='text'
              value={'Search Query'}
              onChange={() => {}}
              placeholder='Search for apartments, locations, or amenities...'
              className='w-full max-w-lg rounded-none rounded-l-xl border-none bg-white h-12 has-focus:!outline-none'
            />
            <Button
              onClick={() => {}}
              className='h-12 rounded-none rounded-r-xl bg-secondary-600 hover:bg-secondary-700 text-white border-none hover:cursor-pointer'
            >
              Search
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default HeroSection