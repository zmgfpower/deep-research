import { omit } from "radash";

interface ReaderResult {
  code: number;
  status: number;
  data: {
    title: string;
    description: string;
    url: string;
    content: string;
    usage: {
      tokens: number;
    };
  };
}

export async function jinaReader(url = "") {
  if (url === "") {
    return new Error("No url provided");
  }

  const response = await fetch("https://r.jina.ai", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ url }),
  });
  const result: ReaderResult = await response.json();
  return omit(result.data, ["usage", "description"]);
}
