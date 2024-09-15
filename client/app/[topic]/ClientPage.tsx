"use client";

import { useEffect, useState, useMemo } from "react";
import { useMutation } from "@tanstack/react-query";
import { io } from "socket.io-client";
import { Wordcloud } from "@visx/wordcloud";
import { Text } from "@visx/text";
import { scaleLog } from "@visx/scale";
import MaxWidthWrapper from "@/components/MaxWidthWrapper";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { submitComment } from "../actions";
import { useCurrentUser } from "@/hooks/use-current-user";

const COLORS = ["#143059", "#2F6B9A", "#82a6c2"];
const MAX_WORDS = 100;
const SOCKET_URL =
  process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:8080";

interface Word {
  text: string;
  value: number;
}

interface ClientPageProps {
  topicName: string;
  initialData: Word[];
  user: string;
}

const getRotationDegree = () =>
  (Math.random() > 0.5 ? 60 : -60) * Math.random();

const ClientPage = ({ topicName, initialData, user }: ClientPageProps) => {
  const { data } = useCurrentUser();
  const [words, setWords] = useState<Word[]>(initialData);
  const [input, setInput] = useState("");
  const [layoutOptions, setLayoutOptions] = useState({
    font: "Impact",
    spiral: "archimedean",
    withRotation: false,
  });

  const socket = useMemo(() => io(SOCKET_URL), []);

  useEffect(() => {
    socket.emit("join-room", `room:${topicName}`);

    const handleRoomStyle = (message: string) => {
      const { layoutOptions: newLayoutOptions } = JSON.parse(message);
      if (newLayoutOptions) {
        setLayoutOptions((prevLayoutOptions) => ({
          ...prevLayoutOptions,
          ...newLayoutOptions,
        }));
      }
    };

    const handleRoomUpdate = (message: string) => {
      const newWords = JSON.parse(message).words as Word[];
      if (newWords) {
        setWords((prevWords) => {
          const updatedWords = new Map(
            prevWords.map((word) => [word.text, word])
          );
          newWords.forEach((newWord) => {
            if (updatedWords.has(newWord.text)) {
              const existingWord = updatedWords.get(newWord.text)!;
              updatedWords.set(newWord.text, {
                ...existingWord,
                value: existingWord.value + newWord.value,
              });
            } else if (updatedWords.size < MAX_WORDS) {
              updatedWords.set(newWord.text, newWord);
            }
          });
          return Array.from(updatedWords.values());
        });
      }
    };

    socket.on("room-update", handleRoomUpdate);
    socket.on("updateWordCloud", handleRoomStyle);

    return () => {
      socket.off("room-update", handleRoomUpdate);
      socket.off("updateWordCloud", handleRoomStyle);
      socket.disconnect();
    };
  }, [topicName, socket]);

  const fontScale = useMemo(() => {
    const values = words.map((d) => d.value);
    return scaleLog({
      domain: [Math.min(...values), Math.max(...values)],
      range: [10, 100],
    });
  }, [words]);

  const { mutate, isPending } = useMutation({
    mutationFn: submitComment,
    onSuccess: () => setInput(""),
  });

  const handleLayoutChange = (
    option: keyof typeof layoutOptions,
    value: any
  ) => {
    setLayoutOptions((prev) => ({ ...prev, [option]: value }));

    // Emit layout changes only if the user is the owner
    if (isOwner) {
      socket.emit("update-layout-options", `room:${topicName}`, {
        ...layoutOptions,
        [option]: value,
      });
    }
  };

  if (!data) {
    return null;
  }
  const { _id } = data;
  const isOwner = user === _id;

  return (
    <div className="w-full flex flex-col items-center justify-center min-h-screen bg-grid-zinc-50 pb-10">
      <MaxWidthWrapper className="flex flex-col items-center gap-6 pt-10">
        <h1 className="text-4xl sm:text-5xl font-bold text-center tracking-tight text-balance">
          What people think about{" "}
          <span className="text-blue-600">{topicName}</span>:
        </h1>

        <p className="text-sm">(updated in real-time)</p>

        <div className="aspect-square max-w-xl flex items-center justify-center">
          <Wordcloud
            words={words}
            width={500}
            height={500}
            fontSize={(word) => fontScale(word.value)}
            font={layoutOptions.font}
            padding={2}
            spiral={layoutOptions.spiral as "archimedean" | "rectangular"}
            rotate={layoutOptions.withRotation ? getRotationDegree : 0}
            random={() => 0.5}
          >
            {(cloudWords) =>
              cloudWords.map((w, i) => (
                <Text
                  key={w.text}
                  fill={COLORS[i % COLORS.length]}
                  textAnchor="middle"
                  transform={`translate(${w.x}, ${w.y}) rotate(${w.rotate})`}
                  fontSize={w.size}
                  fontFamily={w.font}
                >
                  {w.text}
                </Text>
              ))
            }
          </Wordcloud>
        </div>

        {isOwner && (
          <div className="mt-6 space-y-4">
            <h2 className="text-2xl font-semibold">Customize Word Cloud</h2>

            <div className="flex gap-4 items-center">
              <Select
                value={layoutOptions.font}
                onValueChange={(value: any) =>
                  handleLayoutChange("font", value)
                }
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select font" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Impact">Impact</SelectItem>
                  <SelectItem value="Arial">Arial</SelectItem>
                  <SelectItem value="Courier">Courier</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={layoutOptions.spiral}
                onValueChange={(value: string) =>
                  handleLayoutChange(
                    "spiral",
                    value as "archimedean" | "rectangular"
                  )
                }
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select spiral" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="archimedean">Archimedean</SelectItem>
                  <SelectItem value="rectangular">Rectangular</SelectItem>
                </SelectContent>
              </Select>

              <div className="flex items-center space-x-2">
                <Switch
                  id="rotation-mode"
                  checked={layoutOptions.withRotation}
                  onCheckedChange={(checked: any) =>
                    handleLayoutChange("withRotation", checked)
                  }
                />
                <Label htmlFor="rotation-mode">With rotation</Label>
              </div>
            </div>
          </div>
        )}

        <div className="max-w-lg w-full mt-6">
          <Label
            htmlFor="comment-input"
            className="font-semibold tracking-tight text-lg pb-2"
          >
            Here&apos;s what I think about {topicName}
          </Label>
          <div className="mt-1 flex gap-2 items-center">
            <Input
              id="comment-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={`${topicName} is absolutely...`}
            />
            <Button
              disabled={isPending || !input.trim()}
              onClick={() =>
                mutate({
                  comment: input.trim(),
                  topicName,
                })
              }
            >
              Share
            </Button>
          </div>
        </div>
      </MaxWidthWrapper>
    </div>
  );
};

export default ClientPage;
