"use client";
import dynamic from "next/dynamic";

const ResearchTopic = dynamic(() => import("@/components/ResearchTopic"));
const ResearchGoal = dynamic(() => import("@/components/ResearchGoal"));
const SearchResult = dynamic(() => import("@/components/SearchResult"));
const FinalReport = dynamic(() => import("@/components/FinalReport"));

function Home() {
  return (
    <div>
      <header>
        <h1 className="text-center text-2xl font-bold my-6">Deep Research</h1>
      </header>
      <main className="max-w-screen-md mx-auto">
        <ResearchTopic />
        <ResearchGoal />
        <SearchResult />
        <FinalReport />
      </main>
    </div>
  );
}

export default Home;
