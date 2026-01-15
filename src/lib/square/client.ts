import { SquareClient, SquareEnvironment } from "square";
import { config } from "../config";

let squareClient: SquareClient | null = null;

export function getSquareClient() {
  if (squareClient) {
    return squareClient;
  }

  if (!config.square.accessToken) {
    throw new Error("SQUARE_ACCESS_TOKEN is not configured");
  }

  squareClient = new SquareClient({
    // v43 uses `token` instead of `accessToken`
    token: config.square.accessToken,
    environment:
      config.square.environment === "sandbox"
        ? SquareEnvironment.Sandbox
        : SquareEnvironment.Production,
  });

  return squareClient;
}
