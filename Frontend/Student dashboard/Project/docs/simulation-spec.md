# BUS FLOW - Simulation Engine Specification

## Overview

The **Simulation Engine** (`engines/simulation-engine`) enables dynamic playback of realistic fleet operations for hackathon judging, feature testing, and load simulation without requiring physical buses.

---

## Capabilities

1. **GPS Telemetry Simulation**: Generates smooth GPS coordinate trajectories along route paths with speed variations, traffic slowdowns, and stop dwell times.
2. **Student Movement & Boarding Simulation**: Simulates students approaching stops, sending boarding pings, and updating bus capacity state.
3. **Dynamic Route Override Playback**: Simulates mid-route road blockages forcing dynamic route overrides and instant recalculations.
4. **Time Compression**: Allows running simulations in real-time (1x) or accelerated speed (5x, 10x) for rapid scenario validation.

---

## Execution Scenarios

- `scenario_normal_commute`: Standard morning pickup across 10 stops.
- `scenario_capacity_overflow`: High boarding demand triggering 85% and 100% capacity alert rules.
- `scenario_route_blockage`: Road obstruction triggering admin dynamic route override, re-routing active trip.
- `scenario_bus_breakdown`: Emergency alert triggered by driver, notifying students and reassigning route.
