import { useRef, useState, useCallback, type ReactNode } from "react";
import { Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/utils/style";

type Props = {
  children: ReactNode;
};

async function loadMermaid(element: HTMLElement) {
  const { default: mermaid } = await import("mermaid");
  mermaid.initialize({ startOnLoad: false });
  mermaid
    .run({
      nodes: [element],
      suppressErrors: true,
    })
    .catch((e) => {
      console.error("[Mermaid]: ", e.message);
    });
}

function Mermaid({ children }: Props) {
  const mermaidContainerRef = useRef<HTMLDivElement>(null);
  const [rendered, setRendered] = useState<boolean>(false);

  const randerMermaid = useCallback(async () => {
    if (mermaidContainerRef.current) {
      await loadMermaid(mermaidContainerRef.current);
      setRendered(true);
    }
  }, []);

  return (
    <div className="relative">
      <div className="absolute right-2 top-2 flex gap-1">
        <Button
          className={cn("h-6 w-6 opacity-80", { hidden: rendered })}
          variant="outline"
          size="icon"
          onClick={() => randerMermaid()}
        >
          <Eye />
        </Button>
      </div>
      <div
        className={cn(
          "mermaid flex w-full overflow-auto rounded bg-[#f3f4f6] p-4 dark:bg-[rgb(15,23,42)]",
          rendered ? "cursor-pointer justify-center" : ""
        )}
        ref={mermaidContainerRef}
      >
        {children}
      </div>
    </div>
  );
}

export default Mermaid;
