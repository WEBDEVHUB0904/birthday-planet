import { createFileRoute } from "@tanstack/react-router";
import { lazy, Suspense } from "react";
import { motion } from "framer-motion";

const FinalOrb = lazy(() => import("@/components/FinalOrb"));

export const Route = createFileRoute("/final-orb")({
  component: FinalOrbRoute,
  head: () => ({
    meta: [
      { title: "Make a Wish — Happy Birthday Manpreet" },
      {
        name: "description",
        content: "A cinematic birthday wish experience written in the stars.",
      },
    ],
  }),
});

function FinalOrbRoute() {
  return (
    <Suspense
      fallback={
        <div
          className="flex h-screen w-screen items-center justify-center"
          style={{ background: "#0a0a1a" }}
        >
          <motion.p
            className="text-sm tracking-[0.4em] uppercase"
            style={{ color: "rgba(245,200,66,0.5)", fontFamily: "system-ui" }}
            animate={{ opacity: [0.3, 0.8, 0.3] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            lighting the lanterns…
          </motion.p>
        </div>
      }
    >
      <FinalOrb />
    </Suspense>
  );
}
