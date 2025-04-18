"use client";
import { useRef, type ReactNode } from "react";

type Props = {
  children: ReactNode;
  accept?: string;
  onChange: (files: FileList | null) => void;
};

function UploadWrapper({ children, accept, onChange }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        multiple
        hidden
        onChange={(ev) => onChange(ev.target.files)}
      />
      <div onClick={() => fileInputRef.current?.click()}>{children}</div>
    </>
  );
}

export default UploadWrapper;
