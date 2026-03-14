import { getCalendarDay } from "../src/services/calendar-day-service";

async function run() {
  const result = await getCalendarDay({
    isoDate: "2026-03-22T00:00:00.000Z",
    latitude: 40.743,
    longitude: -74.032
  });

  console.log("Calendar Day Result:");
  console.log(JSON.stringify(result, null, 2));
}

run().catch((err) => {
  console.error("Calendar day service test failed:", err);
  process.exit(1);
});
