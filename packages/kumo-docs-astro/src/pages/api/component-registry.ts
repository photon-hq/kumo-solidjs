import type { APIRoute } from "astro";
import { kumoRegistryJson as componentRegistry } from "virtual:kumo-registry";

export const GET: APIRoute = () => {
  return new Response(JSON.stringify(componentRegistry), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
    },
  });
};
