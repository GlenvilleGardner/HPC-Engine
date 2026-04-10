# HPC Engine

## Overview

The HPC Engine is the scientific core of the Heliocentric Precision Calendar (HPC).

It combines:

- astronomical spring equinox resolution
- geospatial local sunset-boundary classification
- observable vs astronomical layer separation
- standard and equinox-adjustment year determination
- 13-month tropical solar calendar structure
- Gregorian to HPC date conversion
- HPC to Gregorian date conversion
- API-ready service layers

The HPC is a geospatial, equinox-anchored, sunset-based tropical solar calendar.
The year begins at the first local sunset after the spring equinox.
Each day runs from sunset to sunset.
The astronomical layer determines the precise equinox instant.
The observable layer determines the local calendar boundary through sunset classification.

## Calendar Structure

- Months 1-12 each contain 28 days
- Month 13 contains 29 days in a standard year
- Month 13 contains 30 days in an equinox-adjustment year

Year lengths:

- Standard year = 365 days
- Equinox-adjustment year = 366 days

All days are counted within the calendar structure.
There are no zero days and no non-weekday intercalary days outside the calendar.

## Current Status

The engine currently supports:

- observable vs astronomical layer separation
- local sunset-boundary year classification
- geospatial New Year determination
- standard 365-day year logic
- equinox-adjustment 366-day year logic
- 13-month structure with Month 13 year-end variation
- Year Boundary Service
- Year Structure Service
- Date Conversion Service
- Calendar Day Service
- HTTP API with route modularization
- structured API validation and error responses
- in-memory caching for boundary and structure services

## Validation

Validation artifacts currently present in the repository include:

- `hpc-validation-report-1900-2200.csv`
- `hpc-validation-summary-1900-2200.txt`
- `hpc-boundary-validation-2000-2600.csv`
- `hpc-boundary-validation-2000-2600.json`
- `hpc-boundary-validation-2000-3000.csv`

Validation focus for the rebuilt model is:

- New Year begins at the first local sunset after the spring equinox
- year classification is correct as 365 or 366 days
- Months 1-12 remain fixed at 28 days
- Month 13 is correctly classified as 29 or 30 days
- Gregorian and HPC conversion remain consistent under sunset-based boundaries

## Running the Engine

Install dependencies:

```bash
npm install
npm run build
npm run dev
npm run api
Invoke-WebRequest "http://localhost:3000/health" | Select-Object -ExpandProperty Content
@'
# HPC Engine

## Overview

The HPC Engine is the scientific core of the Heliocentric Precision Calendar (HPC).

It combines:

- astronomical spring equinox resolution
- geospatial local sunset-boundary classification
- observable vs astronomical layer separation
- standard and equinox-adjustment year determination
- 13-month tropical solar calendar structure
- Gregorian to HPC date conversion
- HPC to Gregorian date conversion
- API-ready service layers

The HPC is a geospatial, equinox-anchored, sunset-based tropical solar calendar.
The year begins at the first local sunset after the spring equinox.
Each day runs from sunset to sunset.
The astronomical layer determines the precise equinox instant.
The observable layer determines the local calendar boundary through sunset classification.

## Calendar Structure

- Months 1-12 each contain 28 days
- Month 13 contains 29 days in a standard year
- Month 13 contains 30 days in an equinox-adjustment year

Year lengths:

- Standard year = 365 days
- Equinox-adjustment year = 366 days

All days are counted within the calendar structure.
There are no zero days and no non-weekday intercalary days outside the calendar.
