/* eslint-disable no-param-reassign */

// Fills missing trafficPercentage values by distributing remaining % evenly across
// tests that don't specify one.
export function calculateTrafficPercentages(abTests) {
  const allocated = abTests
    .filter((t) => t.trafficPercentage !== undefined)
    .reduce((sum, t) => sum + t.trafficPercentage, 0);
  const without = abTests.filter((t) => t.trafficPercentage === undefined);
  if (without.length > 0) {
    const even = (100 - allocated) / without.length;
    without.forEach((t) => {
      t.trafficPercentage = even;
    });
  }
  return abTests;
}

// Weighted random bucket selection across tests with assigned trafficPercentage values.
// Mirrors determineABTest in lib/edge/targeting.ts.
export function determineABTest(abTests) {
  if (!abTests || !abTests.length) return null;
  const total = abTests.reduce((s, t) => s + t.trafficPercentage, 0);
  if (total > 100) return null;
  const bucket = Math.floor(Math.random() * 100);
  let cumulative = 0;
  for (const test of abTests) {
    cumulative += test.trafficPercentage;
    if (bucket < cumulative) return test;
  }
  return null;
}

// Select an A/B test, applying sessionStorage forced-include/exclude overrides before
// falling back to weighted random selection. Persists the result to OPTABLE_SPLIT_TEST.
//
// Override keys (value "1" or "true" to activate):
//   optableInclude<ID>  — force this test
//   optableResolve<ID>  — force this test (alias)
//   optableExclude<ID>  — exclude this test from random selection
//   optableInclude<ID>=false/"0" — also excludes this test
export function selectABTest(abTests) {
  if (!abTests || !abTests.length) return null;

  const tests = calculateTrafficPercentages([...abTests]);
  const trueVals = ["1", "true"];
  const falseVals = ["0", "false"];

  // Forced inclusion wins — first matching test is selected immediately.
  for (const test of tests) {
    const key = test.id.toUpperCase();
    const forced =
      trueVals.includes(sessionStorage.getItem(`optableInclude${key}`)) ||
      trueVals.includes(sessionStorage.getItem(`optableResolve${key}`));
    if (forced) {
      const selected = { ...test, trafficPercentage: 100 };
      sessionStorage.setItem("OPTABLE_SPLIT_TEST", JSON.stringify(selected));
      return selected;
    }
  }

  // Filter out excluded tests before random selection.
  const eligible = tests.filter((test) => {
    const key = test.id.toUpperCase();
    return (
      !trueVals.includes(sessionStorage.getItem(`optableExclude${key}`)) &&
      !falseVals.includes(sessionStorage.getItem(`optableInclude${key}`))
    );
  });

  const selected = determineABTest(eligible.length ? eligible : tests);
  if (selected) {
    const pinned = { ...selected, trafficPercentage: 100 };
    sessionStorage.setItem("OPTABLE_SPLIT_TEST", JSON.stringify(pinned));
    return pinned;
  }
  return null;
}
