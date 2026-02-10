/**
 * Scenario Steps Seed Data
 */

const CREATED_BY_UID = '5usOQ3eOm7OjXmDOFjEmKSQovs42';

const steps = [
  {
    scenarioCode: 'HUD_INTRODUCTION',
    data: {
      title: 'Observe HUD Layout',
      instructions: 'Take a moment to familiarize yourself with the Heads-Up Display layout. Note the different panels and information displayed.',
      stepOrder: 1,
      validationType: 'TIME_BASED',
      expectedDurationSeconds: 15,
      hints: ['The HUD shows satellite status, telemetry, and controls', 'Panels include power, attitude, communications, and more'],
      createdBy: CREATED_BY_UID,
    },
  },
  {
    scenarioCode: 'HUD_INTRODUCTION',
    data: {
      title: 'Monitor Satellite Telemetry',
      instructions: 'Observe the real-time telemetry data in the HUD. Pay attention to power levels, attitude, and communications status.',
      stepOrder: 2,
      validationType: 'TIME_BASED',
      expectedDurationSeconds: 20,
      hints: ['Telemetry updates automatically', 'Green indicators show normal operation'],
      createdBy: CREATED_BY_UID,
    },
  },
  {
    scenarioCode: 'ROOKIE_COMMISSIONING_101',
    data: {
      title: 'Wait for Beacon Signal',
      instructions: 'Monitor the communications panel for the first beacon signal from your satellite. Beacons indicate the satellite is operational and ready for contact.',
      stepOrder: 1,
      validationType: 'TIME_BASED',
      expectedDurationSeconds: 30,
      hints: ['Beacons appear automatically as the satellite powers up', 'Look for the beacon counter in the communications section'],
      createdBy: CREATED_BY_UID,
    },
  },
  {
    scenarioCode: 'ROOKIE_COMMISSIONING_101',
    data: {
      title: 'Send PING Command',
      instructions: 'Send a PING command to establish communications with the satellite. This verifies two-way communication capability.',
      stepOrder: 2,
      validationType: 'COMMAND',
      expectedCommands: [
        {
          commandName: 'PING',
          commandPayload: {},
          expectedResult: 'OK',
        },
      ],
      hints: ['Use the command input in the communications panel', 'PING is a basic connectivity test'],
      createdBy: CREATED_BY_UID,
    },
  },
];

module.exports = steps;
