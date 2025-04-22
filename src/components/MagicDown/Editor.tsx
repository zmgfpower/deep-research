import { useState, useLayoutEffect, useEffect, useRef, memo } from "react";
import { MarkdownEditor } from "@xiangfa/mdeditor";
import { cn } from "@/utils/style";

import "./style.css";

type EditorProps = {
  className?: string;
  defaultValue: string;
  onChange: (value: string) => void;
};

function Editor({ className, defaultValue, onChange }: EditorProps) {
  const markdownEditorRef = useRef<HTMLDivElement>(null);
  const [markdownEditor, setMarkdownEditor] = useState<MarkdownEditor>();
  const [content, setContent] = useState<string>(defaultValue);

  // Update editor content when external data changes, such as data streams received from a server
  useEffect(() => {
    if (markdownEditor?.status === "create") {
      markdownEditor.update(defaultValue);
    }
  }, [markdownEditor, defaultValue]);

  // Initialize the Markdown editor
  useLayoutEffect(() => {
    const editor = new MarkdownEditor({
      root: markdownEditorRef.current,
      defaultValue: "",
      placeholder: "Please enter...",
      onChange: (value) => {
        setContent(value);
      },
    });

    editor.create().then(() => {
      setMarkdownEditor(editor);
    });

    return () => {
      editor.destroy();
    };
  }, []);

  return (
    <div
      className={cn(
        "text-base whitespace-break-spaces rounded-md border p-1",
        className
      )}
      ref={markdownEditorRef}
      onBlur={() => onChange(content)}
    ></div>
  );
}

export default memo(Editor);
