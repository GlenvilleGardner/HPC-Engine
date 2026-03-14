import {
  convertGregorianToHpc,
  convertHpcToGregorian
} from "../src/services/date-conversion-service";

async function run() {
  const gregorianToHpc = await convertGregorianToHpc({
    isoDate: "2026-03-22T00:00:00.000Z",
    latitude: 40.743,
    longitude: -74.032
  });

  console.log("Gregorian -> HPC");
  console.log(JSON.stringify(gregorianToHpc, null, 2));

  const hpcToGregorianResult = await convertHpcToGregorian({
    hpcYear: 6044,
    hpcMonth: 1,
    hpcDay: 1,
    latitude: 40.743,
    longitude: -74.032
  });

  console.log("HPC -> Gregorian");
  console.log(JSON.stringify(hpcToGregorianResult, null, 2));
}

run().catch((err) => {
  console.error("Date conversion service test failed:", err);
  process.exit(1);
});
