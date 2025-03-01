"use client";
import dynamic from "next/dynamic";

const Header = dynamic(() => import("@/components/Header"));
const Topic = dynamic(() => import("@/components/Research/Topic"));
const Feedback = dynamic(() => import("@/components/Research/Feedback"));
const SearchResult = dynamic(
  () => import("@/components/Research/SearchResult")
);
const FinalReport = dynamic(() => import("@/components/Research/FinalReport"));

function Home() {
  return (
    <div className="max-w-screen-md mx-auto px-4">
      <Header />
      <main>
        <Topic />
        <Feedback />
        <SearchResult />
        <FinalReport />
      </main>
    </div>
  );
}

export default Home;
