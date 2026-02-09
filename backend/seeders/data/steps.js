/**
 * Scenario Steps Seed Data
 * Only includes steps for HUD Demo scenario
 */

const CREATED_BY_UID = '5usOQ3eOm7OjXmDOFjEmKSQovs42';

const steps = [
  // DEMO_COMPLETE_HUD - Comprehensive demonstration of all command types
  {
    scenarioCode: 'DEMO_COMPLETE_HUD',
    data: {
      stepOrder: 1,
      title: '🎮 Commissioning Commands',
      instructions: 'Test commissioning commands: Deploy antenna and verify beacon reception.',
      validationType: 'command_executed',
      validationConfig: {
        commandName: 'DEPLOY_ANTENNA',
        mustSucceed: true,
      },
      isCheckpoint: false,
      expectedDurationSeconds: 90,
      hint: 'Check the Commissioning panel (Secondary Systems tab) - Deploy antenna using button control.',
      createdBy: CREATED_BY_UID,
    },
  },
  {
    scenarioCode: 'DEMO_COMPLETE_HUD',
    data: {
      stepOrder: 2,
      title: '📊 Telemetry Commands',
      instructions: 'Request telemetry data using dropdown to select packet type.',
      validationType: 'command_executed',
      validationConfig: {
        commandName: 'REQUEST_TELEMETRY',
        mustSucceed: true,
      },
      isCheckpoint: false,
      expectedDurationSeconds: 60,
      hint: 'Telemetry panel (Secondary tab) - Use dropdown to select packet type (health, orbit, or all).',
      createdBy: CREATED_BY_UID,
    },
  },
  {
    scenarioCode: 'DEMO_COMPLETE_HUD',
    data: {
      stepOrder: 3,
      title: '🛰️ Orbital Maneuvers',
      instructions: 'Execute an altitude adjustment using the slider control.',
      validationType: 'command_executed',
      validationConfig: {
        commandName: 'ADJUST_ALTITUDE',
        mustSucceed: true,
      },
      isCheckpoint: true,
      expectedDurationSeconds: 120,
      hint: 'Orbital panel (Primary tab) - Use slider to set target altitude, then execute.',
      createdBy: CREATED_BY_UID,
    },
  },
  {
    scenarioCode: 'DEMO_COMPLETE_HUD',
    data: {
      stepOrder: 4,
      title: '🎯 Attitude Control',
      instructions: 'Point the satellite using the combo control (target + coordinates).',
      validationType: 'command_executed',
      validationConfig: {
        commandName: 'POINT_TO_TARGET',
        mustSucceed: true,
      },
      isCheckpoint: false,
      expectedDurationSeconds: 90,
      hint: 'Attitude panel (Primary tab) - Select pointing mode and enter coordinates if needed.',
      createdBy: CREATED_BY_UID,
    },
  },
  {
    scenarioCode: 'DEMO_COMPLETE_HUD',
    data: {
      stepOrder: 5,
      title: '⚡ Power Management',
      instructions: 'Toggle battery charging mode on/off using the toggle control.',
      validationType: 'command_executed',
      validationConfig: {
        commandName: 'TOGGLE_BATTERY_CHARGE',
        mustSucceed: true,
      },
      isCheckpoint: false,
      expectedDurationSeconds: 60,
      hint: 'Power panel (Primary tab) - Use toggle switch to enable/disable battery charging.',
      createdBy: CREATED_BY_UID,
    },
  },
  {
    scenarioCode: 'DEMO_COMPLETE_HUD',
    data: {
      stepOrder: 6,
      title: '🌡️ Thermal Control',
      instructions: 'Activate heaters to maintain temperature.',
      validationType: 'command_executed',
      validationConfig: {
        commandName: 'ACTIVATE_HEATER',
        mustSucceed: true,
      },
      isCheckpoint: false,
      expectedDurationSeconds: 60,
      hint: 'Thermal panel (Secondary tab) - Toggle heater on to maintain optimal temperature.',
      createdBy: CREATED_BY_UID,
    },
  },
  {
    scenarioCode: 'DEMO_COMPLETE_HUD',
    data: {
      stepOrder: 7,
      title: '📡 Communications Setup',
      instructions: 'Configure data downlink using combo control (volume + priority).',
      validationType: 'command_executed',
      validationConfig: {
        commandName: 'SCHEDULE_DOWNLINK',
        mustSucceed: true,
      },
      isCheckpoint: true,
      expectedDurationSeconds: 90,
      hint: 'Communications panel (Primary tab) - Set data volume and priority level.',
      createdBy: CREATED_BY_UID,
    },
  },
  {
    scenarioCode: 'DEMO_COMPLETE_HUD',
    data: {
      stepOrder: 8,
      title: '⚙️ System Commands',
      instructions: 'Execute system status check to verify all subsystems.',
      validationType: 'command_executed',
      validationConfig: {
        commandName: 'SYSTEM_HEALTH_CHECK',
        mustSucceed: true,
      },
      isCheckpoint: false,
      expectedDurationSeconds: 60,
      hint: 'System panel (Secondary tab) - Run complete system health diagnostic.',
      createdBy: CREATED_BY_UID,
    },
  },
];

module.exports = steps;
