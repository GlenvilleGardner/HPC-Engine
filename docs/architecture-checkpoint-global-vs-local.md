# HPC Engine Architecture Checkpoint — Global vs Local Boundary Logic

## Purpose

The HPC Engine is the computational authority for the Heliocentric Precision Calendar ecosystem.

Its purpose is to provide:

- astronomically grounded seasonal boundary resolution
- globally consistent structural calendar logic
- locally accurate observable timing
- reusable calendar computation for all HPC apps, tools, and devices

This includes support for:

- HPC Calendar app
- HPC Agricultural / Farmers’ Almanac platform
- HPC Solar Watch
- HPC astronomical validation tools
- future HPC web and mobile applications

---

## Core Scientific Principle

The spring equinox is a single global astronomical event.

It occurs at one exact instant in time and is not different for different users.

However, it is experienced on Earth through sunset-defined human observation, which varies by geographic location.

The engine therefore separates:

1. astronomical reality
2. structural calendar classification
3. local observable manifestation

---

## Three-Layer Model

### 1. Astronomical Reality (Global)

The equinoxes and solstices are treated as:

- one exact UTC event instant
- one event-location on Earth determined by the subsolar point
- one event-location sunset-defined observable window

This is the scientific authority layer.

### 2. Structural Calendar Logic (Global)

The calendar’s structural year logic is determined globally.

The engine evaluates whether the spring equinox falls within the correct sunset-defined Wednesday window at the event-location.

This produces one and only one global result for the year:

- classification
- yearType
- whether the next sunset must be used for the New Year boundary

These values are global and are not user-location dependent.

### 3. Local Observable Manifestation (Local)

A user’s location affects only local experience of the already-determined global structure.

Local logic determines:

- local observable sunset window containing the equinox
- local boundary sunset UTC
- local timing of New Year onset
- local timing of seasonal transition display

Local logic does not determine:

- classification
- yearType
- structural leap behavior

---

## New Year Rule

The HPC New Year is anchored to the spring equinox through sunset-defined observational logic.

The governing rule is:

- the equinox should fall within the Tuesday-sunset to Wednesday-sunset window
- when this occurs, the year is STANDARD
- when the equinox falls outside that window, the year is EQUINOX_ADJUSTMENT

New Year always begins at Wednesday sunset, which is the start of Thursday.

Therefore:

- Day 1 of every HPC year is Thursday
- the yearly calendar grid resets at New Year
- weekdays remain fixed year to year
- feast days remain fixed year to year

---

## Calendar Grid Model

The HPC calendar does not force the tropical year into the internal calendar grid.

Instead:

- the astronomical year boundary is resolved first
- the calendar grid resets at New Year
- the full counted grid runs from that reset boundary

There are no zero days and no out-of-grid intercalary days.

### STANDARD Year

- Months 1–12 = 28 days each
- Month 13 = 29 days
- Total = 365 days

### EQUINOX_ADJUSTMENT Year

- Months 1–12 = 28 days each
- Month 13 = 30 days
- Total = 366 days

This keeps the calendar structurally clean while maintaining solar alignment.

---

## Global vs Local Boundary Rule

### Global boundary determines:

- equinoxUtc
- eventLatitude
- eventLongitude
- observableWindowStartUtc
- observableWindowEndUtc
- classification
- yearType
- boundarySunsetUtc
- usedNextDaySunset

### Local observation determines:

- local observableWindowStartUtc
- local observableWindowEndUtc
- local boundarySunsetUtc
- local observable New Year onset timing

The local layer mirrors the already-determined global sunset decision.

It does not independently reclassify the year.

---

## Architectural Correction Completed

A key engine correction was completed:

Previously, local boundary logic still recomputed structural year behavior in some flows.

This has now been corrected so that:

- classification is global only
- yearType is global only
- local boundary logic is timing-only
- local observation follows the global boundary sunset decision

This correction is enforced in:

- year-boundary-detail endpoint
- validation-snapshot endpoint
- calendar-day logic
- date conversion logic
- integration tests

---

## Calendar Date Resolution Rule

The engine resolves HPC dates by:

1. determining the applicable local New Year boundary for the user location
2. identifying the correct boundary year
3. retrieving the global yearType for that boundary year
4. counting days from the local boundary onset
5. mapping counted days onto the fixed 13-month HPC grid

This preserves the annual reset model.

---

## Validation Artifacts

The engine now produces validation datasets suitable for scientific review.

Current exports include:

- global boundary dataset (2000–2100)
- cross-location observation dataset (2000–2100)
- global seasonal anchor dataset (2000–2100)

These support:

- scientific paper tables
- validation reports
- future charts and figures
- frontend integration testing

---

## Integration Test Coverage

The engine includes integration tests confirming:

- global year boundary structure
- year-boundary-detail separation of global vs local
- validation-snapshot separation of global vs local
- calendar-day use of global structural year logic

This provides regression protection for future refactors.

---

## Frontend Consumption Guidance

Frontend layers should consume engine results and must not recompute core logic.

### HPC Calendar app
Use:
- /hpc/calendar-day
- /hpc/year-boundary-detail

### HPC Agricultural / Farmers’ Almanac platform
Use:
- /hpc/solar-progress
- /hpc/season-timeline
- /hpc/global-season-events

### Validation platform / scientific dashboard
Use:
- /hpc/global-year-boundary
- /hpc/global-season-timeline
- /hpc/validation-snapshot

### Solar Watch
Use:
- /hpc/calendar-day
- /hpc/solar-progress

---

## Summary

The HPC Engine now distinguishes correctly between:

- astronomical truth
- structural calendar truth
- local observational timing

This enables the HPC system to remain:

- astronomically grounded
- structurally stable
- globally consistent
- locally observable
- scientifically defensible
