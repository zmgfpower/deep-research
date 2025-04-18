import { readTextFromFile } from "./textParser";

export async function fileParser(file: File): Promise<string> {
  if (file.type.startsWith("text/")) {
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
