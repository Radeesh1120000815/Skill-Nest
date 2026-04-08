import "../assets/HomePage.css";


import { useEffect } from "react";
import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import WhyChoose from "../components/WhyChoose";
import Features from "../components/Features";
import HowItWorks from "../components/HowItWorks";
import CTASection from "../components/CTASection";
import Footer from "../components/Footer";


function HomePage() {
  useEffect(() => {
    document.title = 'Skill Nest — Campus Tutoring Platform';
  }, []);
  return (
    <>
      <Navbar />
      <Hero />
      <WhyChoose />
      <Features />
      <HowItWorks />
      <CTASection />
      <Footer />
    </>
  );
}

export default HomePage;