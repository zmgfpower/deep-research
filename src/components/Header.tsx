"use client";
import dynamic from "next/dynamic";
import { useTranslation } from "react-i18next";
import { Settings, Github } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useGlobalStore } from "@/store/global";

const ThemeToggle = dynamic(() => import("@/components/Theme/ToggleButton"));

const VERSION = process.env.NEXT_PUBLIC_VERSION;

function Header() {
  const { t } = useTranslation();
  const { setOpenSetting } = useGlobalStore();

  return (
    <>
      <header className="flex justify-between items-center my-6">
        <a href="https://github.com/u14app/deep-research" target="_blank">
          <h1 className="text-center text-2xl font-bold">
            {t("title")}
            <small className="ml-2 font-normal text-base">v{VERSION}</small>
          </h1>
        </a>
        <div className="flex gap-1">
          <ThemeToggle />
          <a href="https://github.com/u14app/deep-research" target="_blank">
            <Button className="h-8 w-8" variant="ghost" size="icon">
              <Github className="h-5 w-5" />
            </Button>
          </a>
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
    </>
  );
}

export default Header;
