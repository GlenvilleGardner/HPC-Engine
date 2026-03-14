import { getEquinox } from "./services/astronomy-authority-client";

async function main() {
  const equinox = await getEquinox(2026);

  console.log("Raw equinox UTC:", equinox.equinoxUTC);
  console.log("Next step: wire this into the HPC sunset boundary solver.");
}

main().catch((err) => {
  console.error("Boundary test failed:", err);
  process.exit(1);
});
