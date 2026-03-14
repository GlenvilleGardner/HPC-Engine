import express from "express";
import healthRoute from "./routes/health-route";
import yearBoundaryRoute from "./routes/year-boundary-route";
import yearStructureRoute from "./routes/year-structure-route";
import dateConversionRoute from "./routes/date-conversion-route";
import calendarDayRoute from "./routes/calendar-day-route";

const app = express();
app.use(express.json());

app.use(healthRoute);
app.use(yearBoundaryRoute);
app.use(yearStructureRoute);
app.use(dateConversionRoute);
app.use(calendarDayRoute);

const PORT = 3000;

app.listen(PORT, () => {
  console.log(`HPC API server running on http://localhost:${PORT}`);
});
