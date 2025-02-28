"use client";
import dynamic from "next/dynamic";
import { useState } from "react";
import { Settings } from "lucide-react";
import { Button } from "@/components/ui/button";

const ResearchTopic = dynamic(() => import("@/components/ResearchTopic"));
const ResearchGoal = dynamic(() => import("@/components/ResearchGoal"));
const ResearchResult = dynamic(() => import("@/components/ResearchResult"));
const FinalReport = dynamic(() => import("@/components/FinalReport"));
const ThemeToggle = dynamic(() => import("@/components/Theme/ToggleButton"));
const Setting = dynamic(() => import("@/components/Setting"));

function Home() {
  const [openSetting, setOpenSetting] = useState<boolean>(false);

  return (
    <div className="max-w-screen-md mx-auto px-4">
      <header className="flex justify-between items-center my-6">
        <h1 className="text-center text-2xl font-bold">Deep Research</h1>
        <div className="flex gap-1">
          <ThemeToggle />
          <Button
            className="h-8 w-8"
            variant="ghost"
            size="icon"
            onClick={() => setOpenSetting(true)}
          >
            <Settings className="h-5 w-5" />
          </Button>
        </div>
      </header>
      <main>
        <ResearchTopic />
        <ResearchGoal />
        <ResearchResult />
        <FinalReport />
      </main>
      <aside>
        <Setting open={openSetting} onClose={() => setOpenSetting(false)} />
      </aside>
    </div>
  );
}

export default Home;
