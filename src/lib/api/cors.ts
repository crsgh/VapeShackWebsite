import { config } from "../config";

const defaultOrigin = "*";

export function buildCorsHeaders() {
  const origin = config.cors.allowedOrigin || defaultOrigin;
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Credentials": "true",
    "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
    "Access-Control-Allow-Headers":
      "Origin, X-Requested-With, Content-Type, Accept, Authorization",
  };
}

export function withCorsResponse(response: Response) {
  const headers = new Headers(response.headers);
  const corsHeaders = buildCorsHeaders();

  Object.entries(corsHeaders).forEach(([key, value]) => {
    headers.set(key, value);
  });

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

export function corsPreflight() {
  const headers = buildCorsHeaders();
  return new Response(null, {
    status: 204,
    headers,
  });
}

