import React from 'react'
import ModernHero from '../components/ModernHero'
import ModernFeatures from '../components/ModernFeatures'
import HomeBlogSection from '../components/HomeBlogSection'
import ModernTestimonials from '../components/ModernTestimonials'
import ModernPricing from '../components/ModernPricing'

const Home = () => {
  return (
    <div>
      <ModernHero />
      <ModernFeatures />
      <HomeBlogSection />
      <ModernTestimonials />
      <ModernPricing />
    </div>
  )
}

export default Home
