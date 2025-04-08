import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import { isEqual, shuffle } from "radash";

const accessPassword = process.env.ACCESS_PASSWORD || "";
const GOOGLE_GENERATIVE_AI_API_KEY =
  process.env.GOOGLE_GENERATIVE_AI_API_KEY || "";
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || "";
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || "";
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY || "";
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY || "";
const XAI_API_KEY = process.env.XAI_API_KEY || "";
const OPENAI_COMPATIBLE_API_KEY = process.env.OPENAI_COMPATIBLE_API_KEY || "";

// Limit the middleware to paths starting with `/api/`
export const config = {
  matcher: "/api/:path*",
};

const ERRORS = {
  NO_PERMISSIONS: {
    code: 403,
    message: "No permissions",
    status: "FORBIDDEN",
  },
  NO_API_KEY: {
    code: 500,
    message: "The server does not have an API key.",
    status: "Internal Server Error",
  },
};

export function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith("/api/ai/google")) {
    const authorization = request.headers.get("x-goog-api-key");
    if (isEqual(authorization, null) || authorization !== accessPassword) {
      return NextResponse.json(
        { error: ERRORS.NO_PERMISSIONS },
        { status: 403 }
      );
    } else {
      // Support multi-key polling,
      const apiKeys = shuffle(GOOGLE_GENERATIVE_AI_API_KEY.split(","));
      if (apiKeys[0]) {
        const requestHeaders = new Headers(request.headers);
        requestHeaders.set("x-goog-api-key", apiKeys[0]);
        return NextResponse.next({
          request: {
            headers: requestHeaders,
          },
        });
      } else {
        return NextResponse.json(
          {
            error: ERRORS.NO_API_KEY,
          },
          { status: 500 }
        );
      }
    }
  }
  if (request.nextUrl.pathname.startsWith("/api/ai/openrouter")) {
    const authorization = request.headers.get("authorization");
    if (
      isEqual(authorization, null) ||
      authorization !== `Bearer ${accessPassword}`
    ) {
      return NextResponse.json(
        { error: ERRORS.NO_PERMISSIONS },
        { status: 403 }
      );
    } else {
      // Support multi-key polling,
      const apiKeys = shuffle(OPENROUTER_API_KEY.split(","));
      if (apiKeys[0]) {
        const requestHeaders = new Headers(request.headers);
        requestHeaders.set("Authorization", `Bearer ${apiKeys[0]}`);
        return NextResponse.next({
          request: {
            headers: requestHeaders,
          },
        });
      } else {
        return NextResponse.json(
          {
            error: ERRORS.NO_API_KEY,
          },
          { status: 500 }
        );
      }
    }
  }
  if (request.nextUrl.pathname.startsWith("/api/ai/openai")) {
    const authorization = request.headers.get("authorization");
    if (
      isEqual(authorization, null) ||
      authorization !== `Bearer ${accessPassword}`
    ) {
      return NextResponse.json(
        { error: ERRORS.NO_PERMISSIONS },
        { status: 403 }
      );
    } else {
      // Support multi-key polling,
      const apiKeys = shuffle(OPENAI_API_KEY.split(","));
      if (apiKeys[0]) {
        const requestHeaders = new Headers(request.headers);
        requestHeaders.set("Authorization", `Bearer ${apiKeys[0]}`);
        return NextResponse.next({
          request: {
            headers: requestHeaders,
          },
        });
      } else {
        return NextResponse.json(
          {
            error: ERRORS.NO_API_KEY,
          },
          { status: 500 }
        );
      }
    }
  }
  if (request.nextUrl.pathname.startsWith("/api/ai/anthropic")) {
    const authorization = request.headers.get("x-api-key");
    if (isEqual(authorization, null) || authorization !== accessPassword) {
      return NextResponse.json(
        { error: ERRORS.NO_PERMISSIONS },
        { status: 403 }
      );
    } else {
      // Support multi-key polling,
      const apiKeys = shuffle(ANTHROPIC_API_KEY.split(","));
      if (apiKeys[0]) {
        const requestHeaders = new Headers(request.headers);
        requestHeaders.set("x-api-key", apiKeys[0]);
        return NextResponse.next({
          request: {
            headers: requestHeaders,
          },
        });
      } else {
        return NextResponse.json(
          {
            error: ERRORS.NO_API_KEY,
          },
          { status: 500 }
        );
      }
    }
  }
  if (request.nextUrl.pathname.startsWith("/api/ai/deepseek")) {
    const authorization = request.headers.get("authorization");
    if (
      isEqual(authorization, null) ||
      authorization !== `Bearer ${accessPassword}`
    ) {
      return NextResponse.json(
        { error: ERRORS.NO_PERMISSIONS },
        { status: 403 }
      );
    } else {
      // Support multi-key polling,
      const apiKeys = shuffle(DEEPSEEK_API_KEY.split(","));
      if (apiKeys[0]) {
        const requestHeaders = new Headers(request.headers);
        requestHeaders.set("Authorization", `Bearer ${apiKeys[0]}`);
        return NextResponse.next({
          request: {
            headers: requestHeaders,
          },
        });
      } else {
        return NextResponse.json(
          {
            error: ERRORS.NO_API_KEY,
          },
          { status: 500 }
        );
      }
    }
  }
  if (request.nextUrl.pathname.startsWith("/api/ai/xai")) {
    const authorization = request.headers.get("authorization");
    if (
      isEqual(authorization, null) ||
      authorization !== `Bearer ${accessPassword}`
    ) {
      return NextResponse.json(
        { error: ERRORS.NO_PERMISSIONS },
        { status: 403 }
      );
    } else {
      // Support multi-key polling,
      const apiKeys = shuffle(XAI_API_KEY.split(","));
      if (apiKeys[0]) {
        const requestHeaders = new Headers(request.headers);
        requestHeaders.set("Authorization", `Bearer ${apiKeys[0]}`);
        return NextResponse.next({
          request: {
            headers: requestHeaders,
          },
        });
      } else {
        return NextResponse.json(
          {
            error: ERRORS.NO_API_KEY,
          },
          { status: 500 }
        );
      }
    }
  }
  if (request.nextUrl.pathname.startsWith("/api/ai/openaicompatible")) {
    const authorization = request.headers.get("authorization");
    if (
      isEqual(authorization, null) ||
      authorization !== `Bearer ${accessPassword}`
    ) {
      return NextResponse.json(
        { error: ERRORS.NO_PERMISSIONS },
        { status: 403 }
      );
    } else {
      // Support multi-key polling,
      const apiKeys = shuffle(OPENAI_COMPATIBLE_API_KEY.split(","));
      if (apiKeys[0]) {
        const requestHeaders = new Headers(request.headers);
        requestHeaders.set("Authorization", `Bearer ${apiKeys[0]}`);
        return NextResponse.next({
          request: {
            headers: requestHeaders,
          },
        });
      } else {
        return NextResponse.json(
          {
            error: ERRORS.NO_API_KEY,
          },
          { status: 500 }
        );
      }
    }
  }
  // The ollama model only verifies access to the backend API
  if (request.nextUrl.pathname.startsWith("/api/ai/ollama")) {
    const authorization = request.headers.get("authorization");
    if (
      isEqual(authorization, null) ||
      authorization !== `Bearer ${accessPassword}`
    ) {
      return NextResponse.json(
        { error: ERRORS.NO_PERMISSIONS },
        { status: 403 }
      );
    } else {
      const requestHeaders = new Headers(request.headers);
      requestHeaders.delete("authorization");
      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      });
    }
  }
  return NextResponse.next();
}
