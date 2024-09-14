import { Icons } from "@/components/Icon";
import MaxWidthWrapper from "@/components/MaxWidthWrapper";
import { Navbar } from "@/components/Navbar";
import TopicCreator from "@/components/TopicCreater";
import { redis } from "@/lib/redis";
import { Loader, Star } from "lucide-react";
import Link from "next/link";

// Dummy function to simulate fetching topics from Redis
async function getTopics() {
  const topics = await redis.smembers("existing-topics");

  // Log the topics to check their format
  // console.log("Raw topics:", topics);

  // If the topics are not JSON, return them as they are
  return topics;
}

// TopicCard component to display each topic as a clickable card
function TopicCard({ id, title }: { id: string; title: string }) {
  return (
    <Link href={`/${id}`} className="block">
      <div className="p-6 rounded-lg shadow-lg bg-white hover:bg-gray-100 transition-colors cursor-pointer">
        <h2 className="text-lg font-semibold">{title}</h2>
      </div>
    </Link>
  );
}

export default async function Home() {
  const servedRequests = await redis.get("served-requests");
  const topics = await getTopics(); // Fetch topics

  return (
    <section className="min-h-screen bg-grid-zinc-50">
      <Navbar />
      <MaxWidthWrapper className="relative pb-24 pt-10 sm:pb-32 lg:pt-24 xl:pt-32 lg:pb-52">
        <div className="hidden lg:block absolute inset-0 top-8">
          {/* circle */}
        </div>

        <div className="px-6 lg:px-0 lg:pt-4">
          <div className="relative mx-auto text-center flex flex-col items-center">
            <h1 className="relative leading-snug w-fit tracking-tight text-balance mt-16 font-bold text-gray-900 text-5xl md:text-6xl">
              What do you{" "}
              <span className="whitespace-nowrap">
                th
                <span className="relative">
                  i
                  <span className="absolute inset-x-0 -top-2 -translate-x-3">
                    <Icons.brain className="h-7 w-7 md:h-8 md:w-8" />
                  </span>
                </span>
                nk
              </span>{" "}
              about...
            </h1>

            <TopicCreator />

            <div className="mt-12 flex flex-col sm:flex-row items-center sm:items-start gap-5">
              <div className="flex flex-col gap-1 justify-between items-center">
                <div className="flex gap-0.5">
                  <Star className="h-4 w-4 text-green-600 fill-green-600" />
                  <Star className="h-4 w-4 text-green-600 fill-green-600" />
                  <Star className="h-4 w-4 text-green-600 fill-green-600" />
                  <Star className="h-4 w-4 text-green-600 fill-green-600" />
                  <Star className="h-4 w-4 text-green-600 fill-green-600" />
                </div>

                <p>
                  <span className="font-semibold">
                    {Number(servedRequests)}
                  </span>{" "}
                  served requests
                </p>
              </div>
            </div>

            {/* Display topics as cards */}
            <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {topics.map((topic) => {
                return <TopicCard key={topic} id={topic} title={topic} />;
              })}
            </div>
          </div>
        </div>
      </MaxWidthWrapper>
    </section>
  );
}
