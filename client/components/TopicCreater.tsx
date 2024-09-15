"use client";

import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useMutation } from "@tanstack/react-query";
import { createTopic } from "@/app/actions";
import { useRouter } from "next/navigation";
import { useCurrentUser } from "@/hooks/use-current-user";
import { Loader } from "lucide-react";
import { Skeleton } from "./ui/skeleton";

const TopicCreator = () => {
  const [input, setInput] = useState<string>("");
  const router = useRouter();

  const { mutate, error, isPending } = useMutation({
    mutationFn: createTopic,
  });
  const { data, isLoading } = useCurrentUser();
  if (!data) {
    return (
      <div className="mt-12 flex flex-col gap-2">
        <div className="flex gap-2">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-10 w-20" />
        </div>
      </div>
    );
  }
  const { _id } = data;
  const userId = _id;

  const handleCreateTopic = () => {
    mutate(
      { topicName: input, userId },
      {
        onSuccess: (data) => {
          if (data.error) {
            console.error(data.error);
            return;
          }
          const { role } = data;
          if (role === "admin") {
            console.log("You are the admin");
            router.push(`/${input}`);
          } else {
            console.log("You are a user");
            router.push(`/${input}`);
          }
        },
      }
    );
  };

  if (isLoading) {
    return (
      <div className="mt-12 flex flex-col gap-2">
        <div className="flex gap-2">
          <Skeleton className="h-10 w-64 bg-white" />
          <Skeleton className="h-10 w-20" />
        </div>
      </div>
    );
  }

  return (
    <div className="mt-12 flex flex-col gap-2">
      <div className="flex gap-2">
        <Input
          value={input}
          onChange={({ target }) => setInput(target.value)}
          className="bg-white min-w-64"
          placeholder="Enter topic here..."
        />
        <Button disabled={isPending} onClick={handleCreateTopic}>
          Create
        </Button>
      </div>

      {error ? <p className="text-sm text-red-600">{error.message}</p> : null}
    </div>
  );
};

export default TopicCreator;
