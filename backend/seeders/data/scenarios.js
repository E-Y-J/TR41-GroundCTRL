/**
 * Scenario Seed Data
 * Only includes the HUD Demo scenario for current development
 */

const CREATED_BY_UID = '5usOQ3eOm7OjXmDOFjEmKSQovs42';

const scenarios = [
  {
    code: 'DEMO_COMPLETE_HUD',
    data: {
      satellite_code: 'TRAINING_SAT_02',
      title: '🎮 Complete HUD Demonstration',
      description: 'Comprehensive demonstration mission showcasing all command types and subsystems. Perfect for exploring the complete unified command interface.',
      difficulty: 'INTERMEDIATE',
      tier: 'MISSION_SPECIALIST',
      type: 'GUIDED',
      estimatedDurationMinutes: 45,
      status: 'PUBLISHED',
      isActive: true,
      isCore: false,
      isPublic: true,
      
      timeControl: {
        initialScale: '10x',
        allowedScales: ['real_time', '2x', '5x', '10x', '30x', '60x'],
        autoAccelerate: true,
      },
      
      initialState: {
        missionElapsedTime: 0,
        communications: {
          antennaDeployed: true,
          beaconCount: 5,
        },
        power: {
          currentCharge_percent: 85,
        },
      },
      
      tags: ['demo', 'comprehensive', 'all_systems', 'training'],
      objectives: [
        'Commissioning: Deploy antenna and establish communications',
        'Telemetry: Request and analyze satellite health data',
        'Orbital: Execute altitude adjustment maneuver',
        'Attitude: Point satellite to specific target',
        'Power: Manage battery and solar systems',
        'Thermal: Activate heaters for temperature control',
        'Communications: Configure and test data downlink',
        'System: Monitor overall satellite status',
      ],
      prerequisites: [],
      createdBy: CREATED_BY_UID,
    },
  },
];

module.exports = scenarios;
