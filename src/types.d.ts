interface SearchTask {
  state: "unprocessed" | "processing" | "completed";
  query: string;
  researchGoal: string;
  learning: string;
}

interface PartialJson {
  value: JSONValue | undefined;
  state:
    | "undefined-input"
    | "successful-parse"
    | "repaired-parse"
    | "failed-parse";
}
