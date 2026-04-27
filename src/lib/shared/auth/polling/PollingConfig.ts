export interface PollingConfig {
  initialInterval: number;
  maxInterval: number;
  timeout: number;
  maxPolls: number;
  slowDownIncrement: number;
}

export const DEFAULT_POLLING_CONFIG: PollingConfig = {
  initialInterval: 5,
  maxInterval: 30,
  timeout: 600,
  maxPolls: 120,
  slowDownIncrement: 5,
};

export const DEVICE_FLOW_CONFIG: PollingConfig = {
  initialInterval: 5,
  maxInterval: 30,
  timeout: 900,
  maxPolls: 180,
  slowDownIncrement: 5,
};

export const CIBA_FLOW_CONFIG: PollingConfig = {
  initialInterval: 5,
  maxInterval: 30,
  timeout: 600,
  maxPolls: 120,
  slowDownIncrement: 5,
};
