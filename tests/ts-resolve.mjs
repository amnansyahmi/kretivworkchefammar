// The app is bundled by Next, which resolves extensionless relative imports
// ("./types", "./db/client"). Plain Node does not. Rather than litter the
// source with .ts extensions just to satisfy the test runner, this resolver
// hook retries a failed relative specifier as "<spec>.ts" and
// "<spec>/index.ts" — the same two candidates the bundler would try.
//
// Node >=22.18 strips the types itself, so no transpiler is needed.

const CANDIDATES = [".ts", "/index.ts", ".tsx"];

export async function resolve(specifier, context, nextResolve) {
  try {
    return await nextResolve(specifier, context);
  } catch (error) {
    const relative = specifier.startsWith("./") || specifier.startsWith("../");
    const hasExtension = /\.[cm]?[jt]sx?$/.test(specifier);
    if (!relative || hasExtension) throw error;

    for (const extension of CANDIDATES) {
      try {
        return await nextResolve(specifier + extension, context);
      } catch {
        // try the next candidate
      }
    }
    throw error;
  }
}
