import { EventEmitter } from "node:events";
import type { ServerResponse } from "node:http";

type EventListener = (...args: unknown[]) => void;

/**
 * Helper class to manage the ReadableStream's data and state.
 * Handles buffering before the stream controller is available.
 */
class ResponseStreamAdapter {
  private bufferedChunks: Uint8Array[] = [];
  private controller: ReadableStreamController<Uint8Array> | undefined;
  private closed = false;

  /**
   * Returns the ReadableStream that will expose the written data.
   */
  getStream(): ReadableStream<Uint8Array> {
    return new ReadableStream({
      start: (controller) => {
        this.controller = controller;
        // Enqueue any data that was buffered before the stream started
        for (const chunk of this.bufferedChunks) {
          this.controller.enqueue(chunk);
        }
        this.bufferedChunks.length = 0; // Clear the buffer
        // If end() was called before start(), close the stream now
        if (this.closed) {
          this.controller.close();
        }
      },
    });
  }

  /**
   * Writes a chunk of data to the stream or buffer.
   * @param chunk The data chunk (string or Buffer). Original code only supported string for enqueueing.
   */
  write(chunk: string | Buffer): void {
    // Matching original code's behavior to only process strings here for enqueueing
    if (chunk instanceof Buffer) {
      // Original code threw an error here. Let's maintain that.
      throw new Error("Buffer not supported for writing to stream");
    }

    const data = new TextEncoder().encode(chunk as string);

    if (this.controller) {
      // If the stream has started, enqueue the data directly
      this.controller.enqueue(data);
    } else {
      // If the stream hasn't started yet, buffer the data
      this.bufferedChunks.push(data);
    }
  }

  /**
   * Signals the end of the response body.
   * @param data Optional final data chunk.
   */
  end(data?: string | Buffer): void {
    if (data) {
      this.write(data);
    }
    this.closed = true;
    if (this.controller) {
      // If the stream has started, close the controller
      this.controller.close();
    }
  }
}

/**
 * Anthropic's MCP API requires a server response object. This function
 * creates a fake server response object that can be used to pass to the MCP API.
 */
export function createServerResponseAdapter(
  signal: AbortSignal,
  handler: (res: ServerResponse) => Promise<void> | void
): Promise<Response> {
  return new Promise((resolve) => {
    const streamAdapter = new ResponseStreamAdapter();
    const eventEmitter = new EventEmitter();

    const fakeServerResponse = {
      writeHead: (statusCode: number, headers?: Record<string, string>) => {
        if (typeof headers === "string") {
          throw new Error("Status message of writeHead not supported");
        }
        const response = new Response(streamAdapter.getStream(), {
          status: statusCode,
          headers,
        });
        resolve(response);
        return fakeServerResponse;
      },
      write: (chunk: Buffer | string, encoding?: BufferEncoding): boolean => {
        if (encoding) {
          throw new Error("Encoding not supported");
        }
        streamAdapter.write(chunk);
        return true;
      },
      end: (data?: Buffer | string) => {
        streamAdapter.end(data);
        return fakeServerResponse;
      },
      on: (event: string, listener: EventListener) => {
        eventEmitter.on(event, listener);
        return fakeServerResponse;
      },
    } as ServerResponse;

    // Listen for abort signal and emit 'close' event
    signal.addEventListener("abort", () => {
      eventEmitter.emit("close");
    });

    handler(fakeServerResponse);
  });
}
