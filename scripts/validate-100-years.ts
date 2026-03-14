import { gregorianToHpc } from "../src/calendar/convert";

const location = {
  latitude: 40.743,
  longitude: -74.032
};

async function run() {

  const startYear = 2000;
  const endYear = 2100;

  console.log("Year | HPC Year | HPC Date | Weekday");

  for (let year = startYear; year <= endYear; year++) {

    const testDate = new Date(Date.UTC(year, 2, 20, 12, 0, 0));

    const hpc = await gregorianToHpc(testDate, location);

    console.log(
      year,
      "|",
      hpc.hpcYear,
      "|",
      hpc.hpcMonth + "-" + hpc.hpcDay,
      "|",
      hpc.weekday
    );

  }

}

run();
