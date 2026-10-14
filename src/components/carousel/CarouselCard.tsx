"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { EventCard } from "./types";

interface CarouselCardProps {
  card: EventCard;
  offset: number;
}

export default function CarouselCard({ card, offset }: CarouselCardProps) {
  const distance = Math.abs(offset);

  const x = offset * 270;

  const rotateY = offset === 0 ? 0 : offset > 0 ? -20 : 20;

  const scale =
    distance === 0 ? 1 : distance === 1 ? 0.92 : distance === 2 ? 0.82 : 0.72;

  const blur = distance >= 3 ? 8 : distance === 2 ? 4 : 0;

  const opacity = distance >= 3 ? 0.15 : distance === 2 ? 0.7 : 1;

  const translateZ =
    distance === 0 ? 300 : distance === 1 ? 180 : distance === 2 ? 80 : 0;

  return (
    <motion.div
      animate={{
        x,
        scale,
        rotateY,
        z: translateZ,
        opacity,
        filter: `blur(${blur}px)`,
      }}
      transition={{
        type: "spring",
        stiffness: 200,
        damping: 24,
        mass: 0.9,
      }}
      style={{
        transformStyle: "preserve-3d",
        zIndex: 100 - distance,
        willChange: "transform",
      }}
      className="absolute h-107.5 w-75 overflow-hidden rounded-4xl shadow-[0_30px_80px_rgba(0,0,0,0.55)]"
    >
      <Image
        src={card.image}
        alt={card.title}
        fill
        priority={distance === 0}
        className="object-cover"
        sizes="300px"
      />

      <div className="absolute inset-0 bg-linear-to-t from-black via-black/20 to-transparent" />

      <div className="absolute left-6 top-6">
        <p className="text-[11px] uppercase tracking-[3px] text-[#ff765f]">
          {card.subtitle}
        </p>
      </div>

      <div className="absolute bottom-8 left-7 right-7">
        <h2 className="text-3xl font-semibold leading-tight text-white">
          {card.title}
        </h2>
      </div>
    </motion.div>
  );
}
