import { getYearBoundary } from "../src/services/year-boundary-service";

async function run() {
  const result = await getYearBoundary({
    year: 2026,
    latitude: 40.743,
    longitude: -74.032
  });

  console.log("Year Boundary Result:");
  console.log(result);
}

run().catch((err) => {
  console.error("Year boundary service test failed:", err);
  process.exit(1);
});
