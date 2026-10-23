import { shareImageResponse } from "@/features/cards/server";

/** Image d'une carte au format story : /partage/carte?club=…&rarete=… */
export function GET(request: Request) {
  return shareImageResponse(request);
}
