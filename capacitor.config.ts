import type { CapacitorConfig } from "@capacitor/cli";

const appUrl =
  process.env.CAPACITOR_SERVER_URL ??
  process.env.NEXT_PUBLIC_APP_URL ??
  "http://localhost:3000";

const config: CapacitorConfig = {
  appId: "com.aurelle.marketplace",
  appName: "Aurelle",
  webDir: ".next",
  server: {
    url: appUrl,
    cleartext: appUrl.startsWith("http://"),
  },
};

export default config;
