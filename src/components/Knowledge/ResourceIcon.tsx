"use client";
import { File, BookText, Link } from "lucide-react";

type Props = {
  className?: string;
  type: string;
};

function ResourceIcon({ className, type }: Props) {
  if (type === "knowledge") {
    return <BookText className={className} />;
  } else if (type === "url") {
    return <Link className={className} />;
  } else {
    return <File className={className} />;
  }
}

export default ResourceIcon;
