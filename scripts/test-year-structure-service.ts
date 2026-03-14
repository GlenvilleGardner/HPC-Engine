import { getYearStructure } from "../src/services/year-structure-service";

async function run() {

  const result = await getYearStructure({
    year: 2026,
    latitude: 40.743,
    longitude: -74.032
  });

  console.log("Year Structure:");
  console.log(JSON.stringify(result,null,2));

}

run();
