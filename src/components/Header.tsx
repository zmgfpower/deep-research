"use client";
import dynamic from "next/dynamic";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Settings } from "lucide-react";
import { Button } from "@/components/ui/button";

const ThemeToggle = dynamic(() => import("@/components/Theme/ToggleButton"));
const Setting = dynamic(() => import("@/components/Setting"));

function Header() {
  const { t } = useTranslation();
  const [openSetting, setOpenSetting] = useState<boolean>(false);

  return (
    <>
      <header className="flex justify-between items-center my-6">
        <h1 className="text-center text-2xl font-bold">{t("title")}</h1>
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
      <aside>
        <Setting open={openSetting} onClose={() => setOpenSetting(false)} />
      </aside>
    </>
  );
}

export default Header;
