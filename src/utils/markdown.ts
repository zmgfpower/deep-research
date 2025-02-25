export function markdownCodeBlockToJson(markdownText: string): any | null {
  const lines = markdownText.split("\n");
  let jsonString = "";
  let inCodeBlock = false;

  for (const line of lines) {
    if (line.startsWith("```json")) {
      inCodeBlock = true;
    } else if (line.startsWith("```") && inCodeBlock) {
      inCodeBlock = false;
      break;
    } else if (inCodeBlock) {
      jsonString += line + "\n";
    }
  }

  if (jsonString) {
    try {
      return JSON.parse(jsonString.trim());
    } catch (error) {
      console.error("Error parsing JSON:", error);
      return null;
    }
  } else {
    return null;
  }
}
