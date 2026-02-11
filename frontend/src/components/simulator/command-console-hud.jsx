/**
 * Command Console HUD - Compact Mission Control Style
 * Dense, no-scroll layout with all commands always visible
 * Inspired by ISS, Orion, Dragon control panels
 * 
 * Note: This is the active command console implementation.
 * Old versions (command-console.jsx, command-console-enhanced.jsx) removed 2026-02-08
 */

import React from 'react';
import { useSimulatorState } from '@/contexts/SimulatorStateContext';
import { Badge } from '@/components/ui/badge';
import {
  CommandButton,
  CommandSlider,
  CommandDropdown,
  CommandToggle,
  CommandCombo
} from './commands';
import { COMMAND_GROUPS } from '@/config/commandConfig';
import {
  Radio,
  Satellite,
  Target
} from 'lucide-react';

export function CommandConsoleHUD() {
  const { 
    executeCommand, 
    missionStarted, 
    satellite,
    steps,
    currentStepIndex
  } = useSimulatorState();

  const currentStep = steps?.[currentStepIndex];
  const requiredCommands = currentStep?.requiredCommands || [];

  const handleCommandExecute = (commandName, parameters = {}) => {
    executeCommand({
      name: commandName,
      type: commandName,
      parameters
    });
  };

  const isCommandEnabled = (command) => {
    if (!missionStarted) return false;
    if (command.resourceCheck) {
      const check = command.resourceCheck(satellite);
      if (!check.enabled) return false;
    }
    return true;
  };

  const getCommandComponent = (command) => {
    const enabled = isCommandEnabled(command);
    const isRequired = requiredCommands.includes(command.name);
    
    const commonProps = {
      command,
      enabled,
      isRequired,
      onExecute: handleCommandExecute
    };

    switch (command.componentType) {
      case 'button':
        return <CommandButton key={command.name} {...commonProps} />;
      case 'slider':
        return <CommandSlider key={command.name} {...commonProps} />;
      case 'dropdown':
        return <CommandDropdown key={command.name} {...commonProps} />;
      case 'toggle':
        return <CommandToggle key={command.name} {...commonProps} />;
      case 'combo':
        return <CommandCombo key={command.name} {...commonProps} />;
      default:
        return null;
    }
  };

  if (!missionStarted) {
    return null; // Hide when mission not started
  }

  // Empty right dock column - content cleared per user request
  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Empty column - ready for future content */}
    </div>
  );
}
