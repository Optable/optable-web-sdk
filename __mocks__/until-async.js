// Mock until-async node module as it's ESM only and jest support is still experimental.
//
// https://jestjs.io/docs/manual-mocks#mocking-node-modules
// https://github.com/mswjs/msw/issues/2623
// https://github.com/kettanaito/until-async/blob/main/src/index.ts
export async function until(callback) {
  try {
    return [
      null,
      await callback().catch((error) => {
        throw error;
      }),
    ];
  } catch (error) {
    return [error, null];
  }
}
