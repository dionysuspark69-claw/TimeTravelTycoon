// Placeholder. Overwritten by `npm run vercel-build` (esbuild bundle of
// server/vercel-entry.ts) on every Vercel deploy. This stub exists in the
// repo so Vercel's vercel.json `functions` pattern validation can find a
// matching file before the build runs.
export default function handler(_req, res) {
  res.statusCode = 500;
  res.end("Server not built. Run `npm run vercel-build` to produce the bundle.");
}
