/**
 * Scenario Steps Seed Data
 */

const CREATED_BY_UID = '5usOQ3eOm7OjXmDOFjEmKSQovs42';

const steps = [
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
