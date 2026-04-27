export interface DeviceFlowData {
  deviceCode: string;
  userCode: string;
  verificationUri: string;
  verificationUriComplete?: string;
}

export interface DeviceFlowInitiateRequest {
  deviceType: string;
  deviceName: string;
}

export interface DeviceFlowInitiateResponse {
  device_code: string;
  user_code: string;
  verification_uri: string;
  verification_uri_complete?: string;
  expires_in: number;
  interval: number;
}

export interface DeviceFlowPollRequest {
  device_code: string;
  pollCount: number;
}

export type DeviceType = 'TV' | 'CAR' | 'WATCH' | 'CONSOLE';

export interface DeviceConfig {
  type: DeviceType;
  name: string;
  icon: string;
  description: string;
  primaryColor: string;
}

export const DEVICE_CONFIGS: Record<DeviceType, Omit<DeviceConfig, 'type'>> = {
  TV: {
    name: 'Smart TV',
    icon: '📺',
    description: 'This flow demonstrates how devices with limited input capabilities (like Smart TVs) can authenticate users by displaying a code that can be entered on another device.',
    primaryColor: 'accent',
  },
  CAR: {
    name: 'Smart Car',
    icon: '🚗',
    description: 'This flow demonstrates how in-vehicle infotainment systems can authenticate users by displaying a code that can be entered on a mobile device for secure access.',
    primaryColor: 'teal',
  },
  WATCH: {
    name: 'Smart Watch',
    icon: '⌚',
    description: 'Authenticate wearable devices with limited screens using device authorization flow.',
    primaryColor: 'purple',
  },
  CONSOLE: {
    name: 'Gaming Console',
    icon: '🎮',
    description: 'Authenticate gaming consoles securely without typing credentials using a controller.',
    primaryColor: 'blue',
  },
};
