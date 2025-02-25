"use client";
import dynamic from "next/dynamic";
import { useState } from "react";

const ResearchTopic = dynamic(() => import("@/components/ResearchTopic"));
const ResearchGoal = dynamic(() => import("@/components/ResearchGoal"));

function Home() {
  const [queries, setQueries] = useState<SearchQueries | null>(null);

  return (
    <main className="max-w-screen-md mx-auto">
      <ResearchTopic onResult={setQueries} />
      <ResearchGoal data={queries} />
    </main>
  );
}

export default Home;
