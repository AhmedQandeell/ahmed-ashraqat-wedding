import { createHash } from "node:crypto";
import vinext from "vinext";
import { defineConfig } from "vite";
import hostingConfig from "./.openai/hosting.json";
import { sites } from "./build/sites-vite-plugin";

const WEDDING_DATABASE_ID =
  "d289f584-78e6-4c64-b89b-682eff3f188e";

const { d1, r2 } = hostingConfig;

// Cloudflare Builds exposes GUESTBOOK_ADMIN_PASSWORD to the build process only.
// Convert it to a one-way digest and deploy only that digest as a Worker binding,
// so the raw admin password never becomes part of the repository or frontend.
const adminBuildPassword = process.env.GUESTBOOK_ADMIN_PASSWORD?.trim();
const adminPasswordHash =
  adminBuildPassword && adminBuildPassword.length >= 12
    ? createHash("sha256").update(adminBuildPassword, "utf8").digest("hex")
    : undefined;

// macOS Seatbelt blocks FSEvents, so Codex previews need polling for HMR.
const isCodexSeatbeltSandbox = process.env.CODEX_SANDBOX === "seatbelt";

const localBindingConfig = {
  main: "./worker/index.ts",
  compatibility_flags: ["nodejs_compat"],
  vars: adminPasswordHash
    ? { GUESTBOOK_ADMIN_PASSWORD_HASH: adminPasswordHash }
    : {},
  d1_databases: d1
    ? [
        {
          binding: d1,
          database_name: "site-creator-d1",
          database_id: WEDDING_DATABASE_ID,
        },
      ]
    : [],
  r2_buckets: r2
    ? [
        {
          binding: r2,
          bucket_name: "site-creator-r2",
        },
      ]
    : [],
};

export default defineConfig(async () => {
  // Keep Wrangler and Miniflare state project-local. These are non-secret tool
  // settings; application environment belongs in ignored `.env*` files.
  process.env.WRANGLER_WRITE_LOGS ??= "false";
  process.env.WRANGLER_LOG_PATH ??= ".wrangler/logs";
  process.env.MINIFLARE_REGISTRY_PATH ??= ".wrangler/registry";

  // Wrangler snapshots its log path while the Cloudflare plugin is imported.
  const { cloudflare } = await import("@cloudflare/vite-plugin");

  return {
    server: {
      host: "0.0.0.0",
      allowedHosts: ["terminal.local"],
      ...(isCodexSeatbeltSandbox
        ? { watch: { useFsEvents: false, usePolling: true } }
        : {}),
    },
    plugins: [
      vinext(),
      sites(),
      cloudflare({
        viteEnvironment: { name: "rsc", childEnvironments: ["ssr"] },
        inspectorPort: false,
        config: localBindingConfig,
      }),
    ],
  };
});
