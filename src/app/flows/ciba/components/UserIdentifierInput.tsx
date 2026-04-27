'use client';

import { IdentifierType } from '../types';
import { IDENTIFIER_HINTS, IDENTIFIER_LABELS } from '../constants';

interface UserIdentifierInputProps {
  userIdentifier: string;
  identifierType: IdentifierType;
  onIdentifierChange: (identifier: string) => void;
  onTypeChange: (type: IdentifierType) => void;
}

export function UserIdentifierInput({
  userIdentifier,
  identifierType,
  onIdentifierChange,
  onTypeChange,
}: UserIdentifierInputProps) {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Identifier Type
        </label>
        <div className="flex gap-4">
          <label className="flex items-center">
            <input
              type="radio"
              name="identifierType"
              value="email"
              checked={identifierType === 'email'}
              onChange={(e) => onTypeChange(e.target.value as IdentifierType)}
              className="mr-2"
            />
            Email
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              name="identifierType"
              value="phone"
              checked={identifierType === 'phone'}
              onChange={(e) => onTypeChange(e.target.value as IdentifierType)}
              className="mr-2"
            />
            Phone
          </label>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {IDENTIFIER_LABELS[identifierType]}
        </label>
        <input
          type={identifierType === 'email' ? 'email' : 'tel'}
          value={userIdentifier}
          onChange={(e) => onIdentifierChange(e.target.value)}
          placeholder={IDENTIFIER_HINTS[identifierType]}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
        />
        {identifierType === 'phone' && (
          <p className="text-xs text-gray-500 mt-1">
            Format: +[country code][number] (e.g., +12345678900)
          </p>
        )}
      </div>
    </div>
  );
}
