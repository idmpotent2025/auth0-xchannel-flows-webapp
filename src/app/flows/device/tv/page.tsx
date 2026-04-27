'use client';

import { useDeviceFlow } from '../hooks/useDeviceFlow';
import { DeviceFlowCard } from '../components/DeviceFlowCard';
import { DEVICE_CONFIGS } from '../types';

export default function TVDevicePage() {
  const {
    userCode,
    verificationUri,
    status,
    timeRemaining,
    pollCount,
    error,
    tokens,
    initiateFlow,
    reset,
  } = useDeviceFlow();

  const deviceConfig = DEVICE_CONFIGS.TV;

  const handleStart = () => {
    initiateFlow('TV', deviceConfig.name);
  };

  return (
    <DeviceFlowCard
      deviceIcon={deviceConfig.icon}
      deviceName={deviceConfig.name}
      deviceDescription={deviceConfig.description}
      primaryColor={deviceConfig.primaryColor}
      status={status}
      userCode={userCode}
      verificationUri={verificationUri}
      timeRemaining={timeRemaining}
      pollCount={pollCount}
      error={error}
      tokens={tokens}
      onStart={handleStart}
      onReset={reset}
    />
  );
}
