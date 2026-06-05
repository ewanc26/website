import { getCurrentSabbat } from "$lib/utils/sabbats";
import type { TestModule, TestResult } from "./types";

export const sabbatTimeTest: TestModule = {
  name: "Sabbat Theme Time Simulation",
  description:
    "Verify Sabbat theme updates correctly when a date is simulated.",
  run: async (): Promise<TestResult> => {
    try {
      const date = new Date("2026-12-05T00:00:00Z"); // Samhain
      const sabbat = getCurrentSabbat(date);

      if (sabbat.name === "Samhain") {
        return {
          success: true,
          message: "Successfully identified Samhain on Dec 5, 2026.",
        };
      } else {
        return {
          success: false,
          message: `Expected Samhain, but got ${sabbat.name}.`,
        };
      }
    } catch (error) {
      return {
        success: false,
        message: "Test failed with error.",
        details: error,
      };
    }
  },
};
