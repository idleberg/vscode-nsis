import { getConfig } from 'vscode-get-config';
import TelemetryReporter, { type TelemetryEventProperties, type TelemetryEventMeasurements } from '@vscode/extension-telemetry';

function stringifyProperties(properties: Record<string, unknown>): TelemetryEventProperties {
  const newProperties = {};
  Object.entries(properties).map(([key, value]) => newProperties[key] = String(value));

  return newProperties;
}

export async function sendTelemetryEvent(name: string, properties: Record<string, unknown> = {}, measurements: TelemetryEventMeasurements = {}) {
  const { disableTelemetry } = await getConfig('nsis');

  if (disableTelemetry) {
    return;
  }

  reporter.sendTelemetryEvent(name, stringifyProperties(properties), measurements);
}

export const reporter = new TelemetryReporter('71c4e4b9-6847-41f0-8ea3-a35821fa41e0');
