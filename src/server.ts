import express from "express";
import healthRoute from "./routes/health-route";
import yearBoundaryRoute from "./routes/year-boundary-route";
import yearStructureRoute from "./routes/year-structure-route";
import dateConversionRoute from "./routes/date-conversion-route";
import calendarDayRoute from "./routes/calendar-day-route";
import seasonEventsRoute from "./routes/season-events-route";
import solarProgressRoute from "./routes/solar-progress-route";
import seasonTimelineRoute from "./routes/season-timeline-route";
import yearBoundaryDetailRoute from "./routes/year-boundary-detail-route";
import globalYearBoundaryRoute from "./routes/global-year-boundary-route";
import globalSeasonEventsRoute from "./routes/global-season-events-route";
import globalSeasonTimelineRoute from "./routes/global-season-timeline-route";
import validationSnapshotRoute from "./routes/validation-snapshot-route";
import feastDaysRoute from "./routes/feast-days-route";
import zadokRoute from "./routes/zadok-route";
import seasonalAnchorRoute from "./routes/seasonal-anchor-route";

const app = express();
export default app;

app.use(express.json());
app.use(seasonEventsRoute);
app.use(healthRoute);
app.use(yearBoundaryRoute);
app.use(yearStructureRoute);
app.use(dateConversionRoute);
app.use(calendarDayRoute);
app.use(solarProgressRoute);
app.use(seasonTimelineRoute);
app.use(yearBoundaryDetailRoute);
app.use(globalYearBoundaryRoute);
app.use(globalSeasonEventsRoute);
app.use(globalSeasonTimelineRoute);
app.use(validationSnapshotRoute);
app.use(feastDaysRoute);
app.use(zadokRoute);
app.use(seasonalAnchorRoute);

const PORT = 3000;

if (!process.env.VITEST && process.env.NODE_ENV !== "test") {
  app.listen(PORT, () => {
    console.log(`HPC API server running on http://localhost:${PORT}`);
  });
}
