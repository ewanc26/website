/// <reference types="sveltekit" />
import type { PublicEnv } from "./lib/components/shared/interfaces";

declare namespace App {
  interface PublicEnv extends PublicEnv {}
}
