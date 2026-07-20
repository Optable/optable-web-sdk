import type { ABTestConfig } from "../config";

export function determineABTest(abTests?: ABTestConfig[]): ABTestConfig | null {
  if (!abTests || abTests.length === 0) {
    return null;
  }

  const totalTrafficPercentage = abTests.reduce((sum, test) => sum + test.trafficPercentage, 0);
  if (totalTrafficPercentage > 100) {
    console.error(`AB Test Config Error: Traffic Percentage Sum Exceeds 100%`);
    return null;
  }

  const bucket = Math.floor(Math.random() * 100);
  let cumulative = 0;
  for (const test of abTests) {
    cumulative += test.trafficPercentage;
    if (bucket < cumulative) {
      return test;
    }
  }
  return null;
}
