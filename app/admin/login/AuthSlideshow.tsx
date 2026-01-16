"use client";

import { useEffect, useState } from "react";
import { Box, Transition } from "@mantine/core";
import Image from "next/image";
import WrapDollar from "../_components/assets/WrapDollar.png";
import Flags from "../_components/assets/Currency.png";

const images = [WrapDollar, Flags];

export function AuthSlideshow() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % images.length);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  return (
    <Box className="relative h-80 w-full flex items-end justify-center">
      {images.map((src, i) => (
        <Transition
          key={i}
          mounted={i === index}
          transition="fade"
          duration={600}
        >
          {(styles) => (
            <Image
              src={src}
              alt="Currency"
              style={styles}
              className="absolute bottom-0 h-full object-contain"
            />
          )}
        </Transition>
      ))}
    </Box>
  );
}
