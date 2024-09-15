"use client";
import { useEffect, useState } from "react";
import { AnimatedNumber } from "@/components/ui/animated-number";

export function AnimatedNumberBasic({ served }: { served: number }) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    setValue(served);
  }, [served]);

  return (
    <div className="flex w-full items-center justify-center">
      <AnimatedNumber
        className="inline-flex items-center font-mono text-2xl font-light text-zinc-800 dark:text-zinc-50"
        springOptions={{
          bounce: 0,
          duration: 2000,
        }}
        value={value}
      />
    </div>
  );
}
