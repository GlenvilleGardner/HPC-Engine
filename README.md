# HPC Engine

## Overview

The HPC Engine is the scientific core of the Heliocentric Precision Calendar (HPC). It combines:

- astronomical equinox resolution
- local sunset-boundary classification
- observable year-type determination
- calendar grid reset logic
- Gregorian ? HPC date conversion
- API-ready service layers

This branch contains the observable-boundary rebuild and institutional API hardening work.

## Current Status

The engine currently supports:

- observable vs astronomical layer separation
- local equinox window classification
- standard and equinox-adjustment year logic
- Thursday New Year reset
- Wednesday year-end preservation
- Month 13 variable year-end handling
- Year Boundary Service
- Year Structure Service
- Date Conversion Service
- Calendar Day Service
- HTTP API with route modularization
- structured API validation and error responses
- in-memory caching for boundary and structure services

## Validation

Validation artifacts on this branch include:

- `hpc-validation-report-1900-2200.csv`
- `hpc-validation-summary-1900-2200.txt`

Summary result:

- total tested boundaries: 301
- valid Wednesday ? Thursday resets: 301
- invalid resets: 0

## Running the Engine

Install dependencies:

```powershell
npm install
```

Build:

```powershell
npm run build
```

Run engine bootstrap:

```powershell
npm run dev
```

Run API server:

```powershell
npm run api
```

## API Endpoints

### Health
`GET /health`

Example:

```powershell
Invoke-WebRequest "http://localhost:3000/health" | Select-Object -ExpandProperty Content
```

### Year Boundary
`GET /hpc/year-boundary?year=2026&latitude=40.743&longitude=-74.032`

### Year Structure
`GET /hpc/year-structure?year=2026&latitude=40.743&longitude=-74.032`

### Gregorian to HPC
`GET /hpc/convert/gregorian-to-hpc?isoDate=2026-03-22T00:00:00.000Z&latitude=40.743&longitude=-74.032`

### HPC to Gregorian
`GET /hpc/convert/hpc-to-gregorian?hpcYear=6044&hpcMonth=1&hpcDay=1&latitude=40.743&longitude=-74.032`

### Calendar Day
`GET /hpc/calendar-day?isoDate=2026-03-22T00:00:00.000Z&latitude=40.743&longitude=-74.032`

## Architecture

Core layers:

- `src/astronomy` ? astronomical authority integration and boundary computation
- `src/calendar` ? calendar math and conversions
- `src/services` ? API-ready service interfaces
- `src/routes` ? modular HTTP routes
- `src/utils` ? request parsing and API error helpers
- `src/cache` ? lightweight in-memory caching

## Branch Notes

This branch is intended to stabilize the HPC observable-boundary rebuild before merge to `main`.

Major completed work on this branch:

- rebuilt year-boundary logic around local observable sunset intervals
- corrected year reset behavior
- validated year-end Wednesday ? New Year Thursday transitions
- added service architecture
- added institutional HTTP API
- added validation scripts and summary tooling
- added request validation and cache layer

## Recommended Next Steps

- merge this branch into `main` after final review
- create a new branch for astronomy expansion
- add solstice and lunar endpoints
- add persistent caching later if needed
- add API integration tests
