"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import CarouselCard from "./CarouselCard";
import { cards } from "./data";

const AUTO_PLAY_DELAY = 1500;

export default function Carousel() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  const timer = useRef<NodeJS.Timeout | null>(null);

  const total = cards.length;

  const next = () => {
    setActive((prev) => (prev + 1) % total);
  };

  const previous = () => {
    setActive((prev) => (prev - 1 + total) % total);
  };

  useEffect(() => {
    if (paused) return;

    timer.current = setInterval(next, AUTO_PLAY_DELAY);

    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, [paused]);

  const positionedCards = useMemo(() => {
    return cards.map((card, index) => {
      let offset = index - active;

      if (offset > total / 2) {
        offset -= total;
      }

      if (offset < -total / 2) {
        offset += total;
      }

      return {
        ...card,
        offset,
      };
    });
  }, [active]);

  return (
    <section
      className="relative flex h-162.5 w-full items-center justify-center overflow-hidden"
      style={{
        perspective: 2200,
      }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <motion.div
        drag="x"
        dragElastic={0.08}
        dragConstraints={{ left: 0, right: 0 }}
        onDragEnd={(_, info) => {
          if (info.offset.x < -120) {
            next();
          }

          if (info.offset.x > 120) {
            previous();
          }
        }}
        className="relative flex h-full w-full items-center justify-center"
      >
        {positionedCards.map((card) => (
          <CarouselCard key={card.id} card={card} offset={card.offset} />
        ))}
      </motion.div>
    </section>
  );
}
