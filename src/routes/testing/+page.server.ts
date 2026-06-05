import { error } from "@sveltejs/kit";
import { dev } from "$app/environment";

export function load() {
  if (!dev) {
    throw error(404, "Not found");
  }
  return {
    message: "Dev-only testing suite active",
  };
}
