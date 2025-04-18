export interface GateDeviceConfig {
  name: string;
  ip: string;
  username?: string;
  password?: string;
  relay?: number;
  pulseDuration?: number;
}

export interface PlatformConfig {
  platform: string;
  devices: GateDeviceConfig[];
}

export const PLATFORM_NAME = "Shelly2ProGate";
export const PLUGIN_NAME = "homebridge-shelly2pro-gate";
