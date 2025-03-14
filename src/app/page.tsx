"use client";
import dynamic from "next/dynamic";
import { useGlobalStore } from "@/store/global";

const Header = dynamic(() => import("@/components/Header"));
const Setting = dynamic(() => import("@/components/Setting"));
const Topic = dynamic(() => import("@/components/Research/Topic"));
const Feedback = dynamic(() => import("@/components/Research/Feedback"));
const SearchResult = dynamic(
  () => import("@/components/Research/SearchResult")
);
const FinalReport = dynamic(() => import("@/components/Research/FinalReport"));

function Home() {
  const { openSetting, setOpenSetting } = useGlobalStore();

  return (
    <div className="max-w-screen-md mx-auto px-4">
      <Header />
      <main>
        <Topic />
        <Feedback />
        <SearchResult />
        <FinalReport />
      </main>
      <aside>
        <Setting open={openSetting} onClose={() => setOpenSetting(false)} />
      </aside>
    </div>
  );
}

export default Home;
