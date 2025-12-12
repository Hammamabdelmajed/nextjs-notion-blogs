import { defineCloudflareConfig } from "@opennextjs/cloudflare";
// import r2IncrementalCache from "@opennextjs/cloudflare/overrides/incremental-cache/r2-incremental-cache";
 
export default defineCloudflareConfig({
  // incrementalCache: r2IncrementalCache, there is bucket name mismatch try to solve it later
});
