export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validatePhone(phone: string): boolean {
  const phoneRegex = /^\+[1-9]\d{1,14}$/;
  return phoneRegex.test(phone);
}

export function formatPhone(phone: string): string {
  return phone.replace(/\s+/g, '');
}

export function validatePhoneE164(phone: string): { valid: boolean; error?: string } {
  const formatted = formatPhone(phone);

  if (!formatted.startsWith('+')) {
    return { valid: false, error: 'Phone number must start with +' };
  }

  if (!/^\+[1-9]\d{1,14}$/.test(formatted)) {
    return { valid: false, error: 'Invalid E.164 format' };
  }

  return { valid: true };
}
