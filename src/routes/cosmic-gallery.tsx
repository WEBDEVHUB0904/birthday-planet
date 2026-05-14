import { createFileRoute } from "@tanstack/react-router";
import { CosmicGallery } from "@/pages/CosmicGallery";

export const Route = createFileRoute("/cosmic-gallery")({
  component: CosmicGalleryRoute,
  head: () => ({
    meta: [
      { title: "The Cosmic Art Gallery" },
      {
        name: "description",
        content: "An emotional cinematic gallery where feelings become constellations.",
      },
    ],
  }),
});

function CosmicGalleryRoute() {
  return <CosmicGallery />;
}
