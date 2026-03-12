# Heliocentric Precision Calendar (HPC) Engine Specification

Author: Glenville Gardner  
Affiliation: Independent Researcher  
Repository: https://github.com/GlenvilleGardner/HPC-Engine

---

# 1. Purpose

The HPC Engine is a scientific chronometry system designed to resolve dates using a heliocentric astronomical framework. The engine integrates astronomical computation, geospatial solar timing, agricultural modeling, and biological cycle tracking within a unified time backbone.

The engine powers multiple applications including:

- HPC Calendar
- HPC Solar Watch
- HPC Farmers’ Almanac
- HPC Agro Intelligence Platform
- Zimrah Fertility Application
- HPC Historical Timeline

---

# 2. Epoch Anchor

The HPC system is anchored to the following astronomical reference event:

Spring Equinox — March 20, 2019  
UTC Time: 21:58:00  
Weekday: Wednesday

This event serves as the epoch reference for HPC chronological calculations.

---

# 3. Creation Week Model

The HPC calendar follows the creation-week model in which:

- The creation week begins on Sunday.
- Astronomical timekeeping begins on the fourth day of creation.
- The fourth day corresponds to Wednesday.

Therefore:

Spring equinox occurring on Wednesday establishes the astronomical anchor for the system.

---

# 4. HPC Year Boundary Rule

The HPC New Year begins according to the following rule:

1. Determine the moment of the **spring equinox**.
2. Determine the **local sunset time** for the user's geospatial location.
3. If the equinox occurs before sunset on that day, the new year begins at that sunset.
4. If the equinox occurs after sunset, the new year begins at the following sunset.

The new year therefore begins at the **sunset marking the beginning of Thursday**.

---

# 5. Calendar Structure

The HPC calendar structure consists of:

13 months  
28 days per month  

Total counted days:

364 counted days

Each month contains exactly four weeks.

---

# 6. Intercalary System

The HPC system includes intercalary corrections to maintain alignment with the tropical year.

Components include:

Year Day  
Adjustment Days over extended cycles

These days are not assigned to any week or month.

They preserve the invariant weekly cycle.

---

# 7. Astronomical Solver Hierarchy

The HPC engine resolves astronomical events using the following priority:

Primary Solver  
NASA JPL DE440 Ephemeris

Fallback Solver  
Meeus Astronomical Algorithms

Last Resort  
Analytical approximations

---

# 8. Geospatial Solar Timing

The HPC engine calculates solar events using user location.

Inputs include:

Latitude  
Longitude  
Elevation (optional)

Solar events computed include:

Sunrise  
Sunset  
Solar noon

Sunset is used for all day-boundary calculations.

---

# 9. Time Backbone

All engine modules operate from a shared time backbone based on:

Elapsed Solar Days since Epoch

Additional astronomical metrics include:

Julian Day  
Julian Day Number  
Modified Julian Day

---

# 10. Calendar Conversion

The engine supports bidirectional conversion:

Gregorian ? HPC  
HPC ? Gregorian

Conversion accuracy is maintained through the astronomical year-boundary solver.

---

# 11. Agriculture Intelligence Layer

The HPC agriculture module provides:

Growing Degree Day calculation  
Crop maturity modeling  
Planting window evaluation  
Solar seasonal phase tracking

Crop parameters are defined in the data layer.

---

# 12. Zimrah Fertility Engine

The Zimrah module provides biological cycle analysis including:

Cycle day tracking  
Ovulation prediction  
Fertile window detection  
Luteal phase monitoring

Cycle calculations operate using the continuous elapsed solar day system.

---

# 13. Engine Architecture

The HPC engine consists of the following subsystems:

Core Time Engine  
Astronomical Solver  
Geospatial Sunset Engine  
Calendar Resolver  
Agricultural Intelligence Engine  
Fertility Engine

Each subsystem shares the same chronological backbone.

---

# 14. Future Extensions

Planned extensions include:

DE440 ephemeris integration  
Intercalary cycle optimization  
Advanced agricultural climate modeling  
Wearable device integration (HPC Solar Watch)

---

# 15. Scientific Significance

The HPC engine represents a unified heliocentric chronometry system capable of integrating astronomical, agricultural, and biological time models.

The system provides a stable calendar framework with fixed weekly alignment while preserving long-term solar synchronization.

---

End of Specification
