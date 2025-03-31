import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import { isEqual, shuffle } from "radash";

const accessPassword = process.env.ACCESS_PASSWORD || "";
const GOOGLE_GENERATIVE_AI_API_KEY =
  process.env.GOOGLE_GENERATIVE_AI_API_KEY || "";
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || "";
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || "";
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY || "";

const apiRoutes = [
  "/api/ai/google",
  "/api/ai/openrouter",
  "/api/ai/openai",
  "/api/ai/deepseek",
];

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
  if (request.nextUrl.pathname.startsWith(apiRoutes[0])) {
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
  if (request.nextUrl.pathname.startsWith(apiRoutes[1])) {
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
  if (request.nextUrl.pathname.startsWith(apiRoutes[2])) {
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
  if (request.nextUrl.pathname.startsWith(apiRoutes[3])) {
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
  return NextResponse.next();
}
