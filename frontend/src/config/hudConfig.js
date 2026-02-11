/**
 * HUD Configuration JSON (Procedural, Real-World Style)
 * This is the brain. Everything else consumes this.
 * Mirrors NASA MCC XML/JSON config patterns - UI never decides structure, config does.
 */

export const hudConfig = {
  mission: {
    name: "LEO-OPS-01",
    vehicle: "CUBESAT-3U",
    flightDirector: "FD-01"
  },

  severityLevels: {
    INFO: { priority: 0 },
    CAUTION: { priority: 1 },
    WARNING: { priority: 2 },
    CRITICAL: { priority: 3 }
  },

  flightDirectorStrip: [
    { key: "MODE", label: "MODE" },
    { key: "COMMS", label: "COMMS" },
    { key: "POWER", label: "POWER" },
    { key: "THERMAL", label: "THERMAL" },
    { key: "ADCS", label: "ADCS" }
  ],

  subsystems: [
    {
      id: "POWER",
      label: "POWER",
      nominal: true,
      telemetry: ["battery", "busVoltage", "solarState"]
    },
    {
      id: "THERMAL",
      label: "THERMAL",
      nominal: true,
      telemetry: ["payloadTemp", "avionicsTemp"]
    },
    {
      id: "ADCS",
      label: "ADCS",
      nominal: true,
      telemetry: ["mode", "rateError"]
    },
    {
      id: "COMMS",
      label: "COMMS",
      nominal: true,
      telemetry: ["uplink", "downlink"]
    }
  ]
};

export default hudConfig;
