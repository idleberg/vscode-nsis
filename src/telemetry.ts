import TelemetryReporter from '@vscode/extension-telemetry';
import type { TelemetryEventProperties, TelemetryEventMeasurements } from '@vscode/extension-telemetry';

function stringifyProperties(properties: TelemetryEventProperties) {
  const newProperties = {};
  Object.entries(properties).map(([key, value]) => newProperties[key] = value.toString());

  return newProperties;
}

export function trackEvent(name: string, properties: TelemetryEventProperties = {}, measurements: TelemetryEventMeasurements = {}) {
  reporter.sendTelemetryEvent(name, stringifyProperties(properties), measurements);
}

export const reporter = new TelemetryReporter('515b8376-7024-4346-9602-e3d6d2ec136f');
