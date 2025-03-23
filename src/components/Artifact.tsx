"use client";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Sparkles,
  SendHorizontal,
  BookOpen,
  GraduationCap,
  School,
  PersonStanding,
  Baby,
  Swords,
  Languages,
  SlidersVertical,
  ChevronsUp,
  ChevronUp,
  ChevronDown,
  ChevronsDown,
  LoaderCircle,
} from "lucide-react";
import { Button } from "@/components/Button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
  PopoverClose,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import useArtifact from "@/hooks/useArtifact";

type Props = {
  value: string;
  systemInstruction?: string;
  onChange: (value: string) => void;
  buttonClassName?: string;
  dropdownMenuSide?: "top" | "right" | "bottom" | "left";
  dropdownMenuSideOffset?: number;
  tooltipSide?: "top" | "right" | "bottom" | "left";
  tooltipSideOffset?: number;
};

function Artifact(props: Props) {
  const {
    value,
    onChange,
    systemInstruction,
    buttonClassName,
    dropdownMenuSide = "left",
    dropdownMenuSideOffset = 0,
    tooltipSide = "left",
    tooltipSideOffset = 0,
  } = props;
  const { t } = useTranslation();
  const {
    loadingAction,
    AIWrite,
    translate,
    changeReadingLevel,
    adjustLength,
  } = useArtifact({ value, onChange });

  const [prompt, setPrompt] = useState<string>("");

  return (
    <>
      <Popover onOpenChange={(open) => open && setPrompt("")}>
        <PopoverTrigger asChild>
          <Button
            className={buttonClassName}
            type="button"
            size="icon"
            variant="ghost"
            title={t("AIWrite")}
            side={tooltipSide}
            sideoffset={tooltipSideOffset}
            disabled={loadingAction !== ""}
          >
            {loadingAction === "aiWrite" ? (
              <LoaderCircle className="animate-spin" />
            ) : (
              <Sparkles />
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="flex gap-2 p-2">
          <Input
            className="h-8"
            placeholder={t("writingPromptTip")}
            value={prompt}
            onChange={(ev) => setPrompt(ev.target.value)}
          />
          <PopoverClose asChild>
            <Button
              className="h-8"
              size="icon"
              variant="secondary"
              title={t("send")}
              onClick={() => AIWrite(prompt, systemInstruction)}
            >
              <SendHorizontal />
            </Button>
          </PopoverClose>
        </PopoverContent>
      </Popover>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            className={buttonClassName}
            type="button"
            size="icon"
            variant="ghost"
            title={t("readingLevel")}
            side={tooltipSide}
            sideoffset={tooltipSideOffset}
            disabled={loadingAction !== ""}
          >
            {loadingAction === "readingLevel" ? (
              <LoaderCircle className="animate-spin" />
            ) : (
              <BookOpen />
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          side={dropdownMenuSide}
          sideOffset={dropdownMenuSideOffset}
        >
          <DropdownMenuItem
            onClick={() => changeReadingLevel("PhD student", systemInstruction)}
          >
            <GraduationCap />
            <span>{t("PhD")}</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() =>
              changeReadingLevel("college student", systemInstruction)
            }
          >
            <School />
            <span>{t("college")}</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() =>
              changeReadingLevel("high school student", systemInstruction)
            }
          >
            <PersonStanding />
            <span>{t("teenager")}</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() =>
              changeReadingLevel("elementary school student", systemInstruction)
            }
          >
            <Baby />
            <span>{t("child")}</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => changeReadingLevel("pirate", systemInstruction)}
          >
            <Swords />
            <span>{t("pirate")}</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            className={buttonClassName}
            type="button"
            size="icon"
            variant="ghost"
            title={t("adjustLength")}
            side={tooltipSide}
            sideoffset={tooltipSideOffset}
            disabled={loadingAction !== ""}
          >
            {loadingAction === "adjustLength" ? (
              <LoaderCircle className="animate-spin" />
            ) : (
              <SlidersVertical />
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          side={dropdownMenuSide}
          sideOffset={dropdownMenuSideOffset}
        >
          <DropdownMenuItem
            onClick={() =>
              adjustLength(
                "much longer than it currently is",
                systemInstruction
              )
            }
          >
            <ChevronsUp />
            <span>{t("longest")}</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() =>
              adjustLength(
                "slightly longer than it currently is",
                systemInstruction
              )
            }
          >
            <ChevronUp />
            <span>{t("long")}</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() =>
              adjustLength(
                "slightly shorter than it currently is",
                systemInstruction
              )
            }
          >
            <ChevronDown />
            <span>{t("shorter")}</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() =>
              adjustLength(
                "much shorter than it currently is",
                systemInstruction
              )
            }
          >
            <ChevronsDown />
            <span>{t("shortest")}</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            className={buttonClassName}
            type="button"
            size="icon"
            variant="ghost"
            title={t("translate")}
            side={tooltipSide}
            sideoffset={tooltipSideOffset}
            disabled={loadingAction !== ""}
          >
            {loadingAction === "translate" ? (
              <LoaderCircle className="animate-spin" />
            ) : (
              <Languages />
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          side={dropdownMenuSide}
          sideOffset={dropdownMenuSideOffset}
        >
          <DropdownMenuItem
            onClick={() => translate("English", systemInstruction)}
          >
            <span>🇬🇧</span>
            <span>English</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => translate("Simplified Chinese", systemInstruction)}
          >
            <span>🇨🇳</span>
            <span>简体中文</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => translate("Traditional Chinese", systemInstruction)}
          >
            <span>🇭🇰</span>
            <span>繁体中文</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => translate("Japanese", systemInstruction)}
          >
            <span>🇯🇵</span>
            <span>日本語</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => translate("Korean", systemInstruction)}
          >
            <span>🇰🇷</span>
            <span>한국어</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => translate("Spanish", systemInstruction)}
          >
            <span>🇪🇸</span>
            <span>Español</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => translate("German", systemInstruction)}
          >
            <span>🇩🇪</span>
            <span>Deutsch</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => translate("French", systemInstruction)}
          >
            <span>🇫🇷</span>
            <span>Français</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => translate("Portuguese", systemInstruction)}
          >
            <span>🇧🇷</span>
            <span>Português</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => translate("Russian", systemInstruction)}
          >
            <span>🇷🇺</span>
            <span>Русский</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => translate("Hindi", systemInstruction)}
          >
            <span>🇮🇳</span>
            <span>हिन्दी</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => translate("Arabic", systemInstruction)}
          >
            <span>🇸🇦</span>
            <span>العربية</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}

export default Artifact;
