export async function onRequest(context: any) {
  const request = context.request as Request;
  const isApi = new URL(request.url).pathname.startsWith("/api/");

  try {
    const response = await context.next();

    if (!isApi) return response;

    const headers = new Headers(response.headers);
    headers.set("Cache-Control", "no-store");
    headers.set("X-SYS-Stream-API", "pages-function");

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers,
    });
  } catch (error: any) {
    console.error("Unhandled Pages Function exception", {
      path: new URL(request.url).pathname,
      method: request.method,
      error: error instanceof Error ? error.stack || error.message : String(error),
    });

    if (isApi) {
      return new Response(JSON.stringify({
        success: false,
        error: "Server error pada API SYS STREAM.",
        code: "API_FUNCTION_EXCEPTION",
        detail: error instanceof Error ? error.message : String(error),
      }), {
        status: 500,
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          "Cache-Control": "no-store",
          "X-SYS-Stream-API": "pages-function",
        },
      });
    }

    return new Response("Internal Server Error", {
      status: 500,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }
}
