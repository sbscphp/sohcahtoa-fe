"use client";

import { ReactNode, useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { logo } from "@/app/assets/asset";
import { Avatar } from "@mantine/core";

interface AuthLayoutProps {
  children: ReactNode;
  variant?: "default" | "login";
}

interface TestimonialContent {
  headline: string;
  description: string;
  testimonial: string;
  name: string;
  role: string;
  image: string;
}

const testimonials: TestimonialContent[] = [
  {
    headline: "Making Global Exchange Accessible",
    description:
      "Discover endless opportunities on Freelance Connect, where talented freelancers and businesses unite. Jump right in with us!",
    testimonial:
      "Sohcahtoa has changed my fx trading in Nigeria. It's easy to use, with excellent tools and real-time market updates. The community support is invaluable. I highly recommend it for anyone visiting Nigeria!",
    name: "Daphne Park",
    role: "Traveller",
    image: "https://placehold.co/60x60/teal/white?text=DP"
  },
  {
    headline: "Exchange Money the Right Way",
    description:
      "Secure FX buying and selling, built on transparency and time-tested standards.",
    testimonial:
      "SohCahToa makes managing my small FX needs simple. The rates are fair, the process is quick, and I never worry about delays. It's the most reliable platform I've used",
    name: "Adekunle, Ibrahim",
    role: "Student",
    image: "https://placehold.co/60x60/grey/white?text=AI"
  }
];

export function AuthLayout({ children, variant = "default" }: AuthLayoutProps) {
  const initialIndex = variant === "login" ? 1 : 0;
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const currentContent = testimonials[currentIndex];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % testimonials.length);
    }, 8000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen flex p-3">
      {/* Left Column - Marketing/Information */}
      <div className="hidden lg:flex lg:w-2/5 xl:w-1/3 bg-bg-card-2 p-8 xl:p-12 flex-col justify-between rounded-lg">
        <div>
          {/* Logo */}
          <div className="flex items-center gap-3 mb-12">
            <Image src={logo} alt="SohCahToa" />
          </div>

          {/* Headline and Description with smooth transition */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.6, ease: "easeInOut" }}
            >
              <h2 className="text-heading-200 text-4xl font-bold mb-4">
                {currentContent.headline}
              </h2>

              <p className="text-body-text-100 text-sm leading-relaxed">
                {currentContent.description}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Testimonial with smooth transition */}
        <div className="">
          <AnimatePresence mode="wait">
            <motion.div
              className="bg-white rounded-lg p-6"
              key={currentIndex}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.6, ease: "easeInOut" }}
            >
              <p className="text-body-text-100 text-sm leading-relaxed mb-4">
                &quot;{currentContent.testimonial}&quot;
              </p>
              <div className="flex items-center gap-3">
                <Avatar
                  src={currentContent.image}
                  name={currentContent.name}
                  color="initials"
                  radius="md"
                />
                <div>
                  <p className="text-heading-200 text-sm font-semibold">
                    {currentContent.name}
                  </p>
                  <p className="text-text-300 text-xs">{currentContent.role}</p>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
          {/* Carousel indicators - Diamond shaped */}
          <div className="flex gap-2 mt-4 justify-center">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-2 h-2 rotate-45 transition-colors ${
                  index === currentIndex ? "bg-primary-400" : "bg-gray-200"
                }`}
                aria-label={`Go to testimonial ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Right Column - Form Content */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-xl">{children}</div>
      </div>
    </div>
  );
}
