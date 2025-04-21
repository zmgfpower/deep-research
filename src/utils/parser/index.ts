import { readTextFromFile } from "./textParser";

const TextFormatFileMimeTypes = [
  "application/json",
  "application/ld+json",
  "application/vnd.api+json",
  "application/xhtml+xml",
  "application/xml",
  "application/atom+xml",
  "application/rss+xml",
  "application/x-yaml",
  "application/rtf",
  "application/x-javascript",
  "application/x-typescript",
  "application/ecmascript",
  "application/x-python",
  "application/x-httpd-php",
  "application/x-latex",
  "application/x-sh",
  "application/x-csh",
  "image/svg+xml",
];

export async function fileParser(file: File): Promise<string> {
  if (
    file.type.startsWith("text/") ||
    TextFormatFileMimeTypes.includes(file.type)
  ) {
    return await readTextFromFile(file);
  }
  if (
    file.type.startsWith("application/vnd.openxmlformats-officedocument") ||
    file.type.startsWith("application/vnd.oasis.opendocument")
  ) {
    const { readTextFromOffice } = await import("./officeParser");
    const result = await readTextFromOffice(file);
    if (result instanceof File) {
      return readTextFromFile(result);
    } else if (typeof result === "string") {
      return result;
    } else {
      return "";
    }
  }
  throw new Error(`Unsupported file type: ${file.type}`);
}
