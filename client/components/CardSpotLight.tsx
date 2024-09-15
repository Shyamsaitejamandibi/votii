import { CardSpotlight } from "@/components/ui/card-spotlight";

export function CardSpotlightDemo({ title }: { title: string }) {
  return (
    <CardSpotlight className="h-40 w-40 text-wrap">
      <p className="text-xl font-bold relative z-20 mt-2 text-white">{title}</p>
    </CardSpotlight>
  );
}
