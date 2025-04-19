interface Resource {
  id: string;
  name: string;
  size: number;
  type: string;
  status: "unprocessed" | "processing" | "completed" | "failed";
}

interface Source {
  title?: string;
  content?: string;
  url: string;
}

interface SearchTask {
  state: "unprocessed" | "processing" | "completed" | "failed";
  query: string;
  researchGoal: string;
  learning: string;
  sources: Source[];
}

interface PartialJson {
  value: JSONValue | undefined;
  state:
    | "undefined-input"
    | "successful-parse"
    | "repaired-parse"
    | "failed-parse";
}

interface WebSearchResult {
  content: string;
  url: string;
  title?: string;
}
