import React, { useState } from 'react';
import { Navbar } from '../components/Navbar';
import { Hero } from '../components/Hero';
import { TechStrip } from '../components/TechStrip';
import { Services } from '../components/Services';
import { Portfolio } from '../components/Portfolio';
import { Testimonials } from '../components/Testimonials';
import { CtaSection } from '../components/CtaSection';
import { ContactSection } from '../components/ContactSection';
import { Footer } from '../components/Footer';

export const HomePage: React.FC = () => {
  const [selectedRequirement, setSelectedRequirement] = useState<string>('');

  const scrollToSection = (sectionId: string) => {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleServiceSelectRequirement = (requirementName: string) => {
    setSelectedRequirement(requirementName);
    scrollToSection('contact');
  };

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary flex flex-col selection:bg-cyan-primary/30 selection:text-mint-primary overflow-x-hidden">
      
      {/* Navigation */}
      <Navbar onNavigateToSection={scrollToSection} />

      {/* Main Content */}
      <main className="flex-1">
        {/* 1. Hero with interactive AI Robot Centerpiece */}
        <Hero 
          onExploreWork={() => scrollToSection('work')}
          onContactClick={() => scrollToSection('contact')}
        />

        {/* 2. Trust / Technology Core Strip */}
        <TechStrip />

        {/* 3. Services: What We Build */}
        <Services 
          onContactWithRequirement={handleServiceSelectRequirement}
        />

        {/* 4. Portfolio: Selected Work with Hover Video Preview & Categories */}
        <Portfolio />

        {/* 5. Testimonials: Client Stories */}
        <Testimonials />

        {/* 6. Signature CTA Section */}
        <CtaSection 
          onStartProject={() => scrollToSection('contact')}
        />

        {/* 7. Contact / Requirement Form */}
        <ContactSection initialRequirement={selectedRequirement} />
      </main>

      {/* 8. Footer */}
      <Footer />

    </div>
  );
};
