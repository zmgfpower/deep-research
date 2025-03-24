"use client";
import {
  useRef,
  useLayoutEffect,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { Pencil, PencilOff, CodeXml, Eye } from "lucide-react";
import { Crepe } from "@milkdown/crepe";
import { editorViewOptionsCtx } from "@milkdown/kit/core";
import { replaceAll } from "@milkdown/kit/utils";
import { diagram } from "@xiangfa/milkdown-plugin-diagram";
import { math } from "@xiangfa/milkdown-plugin-math";
import FloatingMenu from "@/components/FloatingMenu";
import { Button } from "@/components/Button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/utils/style";

import "@milkdown/crepe/theme/common/style.css";
import "./style.css";

type EditorProps = {
  className?: string;
  value: string;
  onChange: (value: string) => void;
  tools?: ReactNode;
};

function MilkdownEditor(props: EditorProps) {
  const { className, value: defaultValue, onChange, tools } = props;
  const containerRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<HTMLDivElement>(null);
  const markdownRef = useRef<HTMLTextAreaElement>(null);
  const [milkdownEditor, setMilkdownEditor] = useState<Crepe>();
  const [mode, setMode] = useState<"markdown" | "WYSIWYM">("WYSIWYM");
  const [editable, setEditable] = useState<boolean>(false);
  const [markdown, setMarkdown] = useState<string>(defaultValue);

  function handleEditable(enable: boolean) {
    milkdownEditor?.setReadonly(!enable);
    setEditable(enable);
  }

  function changeMode(mode: "markdown" | "WYSIWYM") {
    if (mode === "markdown") {
      const markdownEditor = markdownRef.current;
      const editor = editorRef.current;
      if (markdownEditor && editor) {
        markdownEditor.style.height = editor.scrollHeight + "px";
        setTimeout(() => {
          markdownEditor.style.height = markdownEditor.scrollHeight + "px";
        }, 50);
      }
    } else if (mode === "WYSIWYM") {
      if (milkdownEditor) replaceAll(markdown)(milkdownEditor.editor.ctx);
    }
    setMode(mode);
    if (!editable) handleEditable(true);
  }

  function save() {
    changeMode("WYSIWYM");
    handleEditable(false);
    onChange(markdown);
  }

  useEffect(() => {
    if (mode === "markdown") {
      const markdownEditor = markdownRef.current;
      const updateMarkdownEditorHeight = () => {
        if (markdownRef.current) {
          markdownRef.current.style.height =
            markdownRef.current.scrollHeight + "px";
        }
      };
      markdownEditor?.addEventListener("input", updateMarkdownEditorHeight);
      return () => {
        markdownEditor?.removeEventListener(
          "input",
          updateMarkdownEditorHeight
        );
      };
    }
  }, [mode]);

  useLayoutEffect(() => {
    const crepe = new Crepe({
      root: editorRef.current,
      defaultValue,
      features: {
        [Crepe.Feature.ImageBlock]: false,
        [Crepe.Feature.Latex]: false,
      },
      featureConfigs: {
        [Crepe.Feature.Placeholder]: {
          text: `Please enter text or press "/" for commands`,
        },
        [Crepe.Feature.BlockEdit]: {
          slashMenuTextGroupLabel: "Text",
          slashMenuListGroupLabel: "List",
          slashMenuAdvancedGroupLabel: "Advanced",
          slashMenuTextLabel: "Text",
          slashMenuH1Label: "Heading 1",
          slashMenuH2Label: "Heading 2",
          slashMenuH3Label: "Heading 3",
          slashMenuH4Label: "Heading 4",
          slashMenuH5Label: "Heading 5",
          slashMenuH6Label: "Heading 6",
          slashMenuQuoteLabel: "Quote",
          slashMenuDividerLabel: "Divider",
          slashMenuBulletListLabel: "BulletList",
          slashMenuOrderedListLabel: "OrderedList",
          slashMenuTaskListLabel: "TaskList",
          slashMenuImageLabel: "Image",
          slashMenuCodeBlockLabel: "CodeBlock",
          slashMenuTableLabel: "Table",
          slashMenuMathLabel: "Math",
        },
      },
    });
    crepe.editor.config((ctx) => {
      // Add attributes to the editor container
      ctx.update(editorViewOptionsCtx, (prev) => ({
        ...prev,
        attributes: {
          class: "milkdown-editor mx-auto outline-none",
          spellcheck: "false",
        },
      }));
    });

    crepe.setReadonly(true).create();
    crepe.editor.use(diagram).use(math);
    setMilkdownEditor(crepe);

    crepe.on((listener) => {
      listener.markdownUpdated((ctx, markdown) => {
        setMarkdown(markdown);
      });
    });

    return () => {
      crepe.destroy();
    };
  }, [defaultValue, setMarkdown]);

  return (
    <div className={cn("relative", className)} ref={containerRef}>
      <div className={cn({ hidden: mode !== "WYSIWYM" })} ref={editorRef}></div>
      <Textarea
        className={cn(
          "overflow-y-hidden border-none outline-none focus-visible:ring-0 px-0 py-0 resize-none text-base md:text-base",
          { hidden: mode !== "markdown" }
        )}
        ref={markdownRef}
        value={markdown}
        onChange={(ev) => setMarkdown(ev.target.value)}
      ></Textarea>
      <FloatingMenu targetRef={containerRef} fixedTopOffset={16}>
        <div className="flex flex-col gap-1 border rounded-full py-2 p-1 bg-white/90 dark:bg-slate-800/80">
          {mode === "WYSIWYM" ? (
            <Button
              className="float-menu-button"
              title="Markdown"
              side="left"
              sideoffset={8}
              variant="ghost"
              onClick={() => changeMode("markdown")}
            >
              <CodeXml />
            </Button>
          ) : (
            <Button
              className="float-menu-button"
              title="WYSIWYM"
              side="left"
              sideoffset={8}
              variant="ghost"
              onClick={() => changeMode("WYSIWYM")}
            >
              <Eye />
            </Button>
          )}
          {editable ? (
            <Button
              className="float-menu-button"
              title="Save"
              side="left"
              sideoffset={8}
              size="icon"
              variant="ghost"
              onClick={() => save()}
            >
              <PencilOff />
            </Button>
          ) : (
            <Button
              className="float-menu-button"
              title="Edit"
              side="left"
              sideoffset={8}
              size="icon"
              variant="ghost"
              onClick={() => handleEditable(true)}
            >
              <Pencil />
            </Button>
          )}
          {tools ? tools : null}
        </div>
      </FloatingMenu>
    </div>
  );
}

export default MilkdownEditor;
