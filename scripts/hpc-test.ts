import { gregorianToHpc } from "../src/calendar/convert";

const location = {
  latitude: 40.743,
  longitude: -74.032
};

async function run() {

  const tests = [
    "2019-03-20T16:00:00Z",
    "2023-03-20T21:00:00Z",
    "2024-03-20T03:00:00Z",
    "2025-03-20T12:00:00Z",
    "2026-03-20T10:00:00Z",
    "2030-03-20T10:00:00Z"
  ];

  for (const iso of tests) {

    const date = new Date(iso);

    const hpc = await gregorianToHpc(date, location);

    console.log("---------------");
    console.log("Gregorian:", iso);
    console.log("HPC Year:", hpc.hpcYear);
    console.log("HPC Date:", hpc.hpcMonth + "-" + hpc.hpcDay);
    console.log("Weekday:", hpc.weekday);

  }

}

run();
