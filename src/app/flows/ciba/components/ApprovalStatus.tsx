'use client';

interface ApprovalStatusProps {
  authRequestId: string;
  userIdentifier: string;
  location?: string;
  pollCount: number;
  timeRemaining: number;
}

export function ApprovalStatus({
  authRequestId,
  userIdentifier,
  location,
  pollCount,
  timeRemaining,
}: ApprovalStatusProps) {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div>
      <div className="bg-accent-50 border-2 border-accent rounded-lg p-6 mb-6">
        <div className="text-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Waiting for Customer Approval
          </h2>
          <div className="bg-white rounded-lg p-4 mb-4">
            <p className="text-sm text-gray-600 mb-2">Authentication Request ID:</p>
            <p className="text-xs font-mono text-gray-800 break-all">{authRequestId}</p>
          </div>
          <p className="text-sm text-gray-600">
            User: <span className="font-semibold">{userIdentifier}</span>
          </p>
          {location && (
            <p className="text-sm text-gray-600">
              Location: <span className="font-semibold">{location}</span>
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
        <div className="flex items-center">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-accent mr-2"></div>
          <span>Polling for approval (Poll #{pollCount})</span>
        </div>
        <div className="font-mono font-semibold">
          Time remaining: {formatTime(timeRemaining)}
        </div>
      </div>

      <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-600">
        <p className="font-semibold mb-2">What happens next:</p>
        <ol className="list-decimal list-inside space-y-1">
          <li>Customer receives push notification on their mobile device</li>
          <li>Customer reviews authentication request details</li>
          <li>Customer approves or denies the request</li>
          <li>This page automatically updates with the result</li>
        </ol>
      </div>

      <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm">
        <p className="text-blue-800">
          <strong>Note:</strong> In a production environment, the customer would receive
          a push notification on their Auth0 Guardian app or integrated mobile application.
        </p>
      </div>
    </div>
  );
}
