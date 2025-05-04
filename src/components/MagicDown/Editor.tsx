import { useState, useLayoutEffect, useEffect, useRef, memo } from "react";
import { useTranslation } from "react-i18next";
import { MagicdownEditor } from "@xiangfa/mdeditor";
import { cn } from "@/utils/style";

import "./style.css";

type EditorProps = {
  className?: string;
  defaultValue: string;
  onChange: (value: string) => void;
};

function Editor({ className, defaultValue, onChange }: EditorProps) {
  const { t } = useTranslation();
  const markdownEditorRef = useRef<HTMLDivElement>(null);
  const [markdownEditor, setMarkdownEditor] = useState<MagicdownEditor>();
  const [content, setContent] = useState<string>(defaultValue);

  // Update editor content when external data changes, such as data streams received from a server
  useEffect(() => {
    if (markdownEditor?.status === "created") {
      markdownEditor.update(defaultValue);
    }
  }, [markdownEditor, defaultValue]);

  // Initialize the Markdown editor
  useLayoutEffect(() => {
    const editor = new MagicdownEditor({
      root: markdownEditorRef.current,
      defaultValue: "",
      placeholder: t("editor.placeholder"),
      onChange: (value) => {
        setContent(value);
      },
      i18n: {
        tooltip: {
          bold: t("editor.tooltip.bold"),
          italic: t("editor.tooltip.italic"),
          strikethrough: t("editor.tooltip.strikethrough"),
          link: t("editor.tooltip.link"),
          code: t("editor.tooltip.code"),
          math: t("editor.tooltip.math"),
          quote: t("editor.tooltip.quote"),
        },
        slash: {
          heading: {
            name: t("editor.slash.heading.name"),
            description: t("editor.slash.heading.description"),
          },
          h1: {
            name: t("editor.slash.h1.name"),
            description: t("editor.slash.h1.description"),
          },
          h2: {
            name: t("editor.slash.h2.name"),
            description: t("editor.slash.h2.description"),
          },
          h3: {
            name: t("editor.slash.h3.name"),
            description: t("editor.slash.h3.description"),
          },
          h4: {
            name: t("editor.slash.h4.name"),
            description: t("editor.slash.h4.description"),
          },
          h5: {
            name: t("editor.slash.h5.name"),
            description: t("editor.slash.h5.description"),
          },
          h6: {
            name: t("editor.slash.h6.name"),
            description: t("editor.slash.h6.description"),
          },
          list: {
            name: t("editor.slash.list.name"),
            description: t("editor.slash.list.description"),
          },
          ul: {
            name: t("editor.slash.ul.name"),
            description: t("editor.slash.ul.description"),
          },
          ol: {
            name: t("editor.slash.ol.name"),
            description: t("editor.slash.ol.description"),
          },
          todo: {
            name: t("editor.slash.todo.name"),
            description: t("editor.slash.todo.description"),
          },
          advanced: {
            name: t("editor.slash.advanced.name"),
            description: t("editor.slash.advanced.description"),
          },
          link: {
            name: t("editor.slash.link.name"),
            description: t("editor.slash.link.description"),
          },
          image: {
            name: t("editor.slash.image.name"),
            description: t("editor.slash.image.description"),
          },
          code: {
            name: t("editor.slash.code.name"),
            description: t("editor.slash.code.description"),
          },
          math: {
            name: t("editor.slash.math.name"),
            description: t("editor.slash.math.description"),
          },
          table: {
            name: t("editor.slash.table.name"),
            description: t("editor.slash.table.description"),
          },
          quote: {
            name: t("editor.slash.quote.name"),
            description: t("editor.slash.quote.description"),
          },
          horizontal: {
            name: t("editor.slash.horizontal.name"),
            description: t("editor.slash.horizontal.description"),
          },
        },
        placeholder: t("editor.placeholder"),
      },
    });

    editor.create().then(() => {
      setMarkdownEditor(editor);
    });

    return () => {
      editor.destroy();
    };
  }, [t]);

  return (
    <div
      className={cn(
        "relative text-base whitespace-break-spaces rounded-md border p-1",
        className
      )}
      ref={markdownEditorRef}
      onBlur={() => onChange(content)}
    ></div>
  );
}

export default memo(Editor);
