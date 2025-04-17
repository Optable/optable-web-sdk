// Helper function to wait for an assertion to pass
// This is useful to test async code that may take some time to resolve
export async function waitFor(assertion: () => void, timeout = 2000, interval = 50): Promise<void> {
  const start = Date.now();

  return new Promise((resolve, reject) => {
    const check = () => {
      try {
        assertion(); // attempt the expect()
        resolve(); // passed, done!
      } catch (err) {
        if (Date.now() - start >= timeout) return reject(err); // timeout
        setTimeout(check, interval); // retry
      }
    };
    check();
  });
}
