import { getEquinox } from "./services/astronomy-authority-client";

async function main() {
  const equinox = await getEquinox(2026);
  console.log("Equinox UTC:", equinox.toISOString());
}

main().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
