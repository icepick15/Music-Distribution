import React from 'react'
import HeroSection from '../components/Hero'
import Features from '../components/WhyUs'
import NewReleases from '../components/NewReleases'
import PricingPlans from '../components/Pricing'
import Testimonials from '../components/Testimonials'
const Home = () => {
  return (
    <div>
      <HeroSection />
      <Features />
      <NewReleases />
      <PricingPlans />
      <Testimonials />
    </div>
  )
}

export default Home
