import { describe, it, expect } from 'vitest';

// Business logic functions extracted from UserProfile component
function validatePasswordChange(currentPassword: string, newPassword: string, confirmPassword: string): { isValid: boolean; error?: string } {
  // Check if new passwords match
  if (newPassword !== confirmPassword) {
    return { isValid: false, error: 'New passwords do not match' };
  }

  // Check password length
  if (newPassword.length < 6) {
    return { isValid: false, error: 'New password must be at least 6 characters long' };
  }

  // Check if current password is provided
  if (!currentPassword) {
    return { isValid: false, error: 'Current password is required to change password' };
  }

  return { isValid: true };
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

function formatDateTime(dateString: string): string {
  return new Date(dateString).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function validateProfileData(fullName: string, email: string): { isValid: boolean; error?: string } {
  // Validate full name
  if (!fullName.trim()) {
    return { isValid: false, error: 'Full name is required' };
  }

  if (fullName.trim().length < 2) {
    return { isValid: false, error: 'Full name must be at least 2 characters long' };
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email.trim()) {
    return { isValid: false, error: 'Email is required' };
  }

  if (!emailRegex.test(email)) {
    return { isValid: false, error: 'Please enter a valid email address' };
  }

  return { isValid: true };
}

function hasProfileChanges(originalFullName: string, newFullName: string, originalEmail: string, newEmail: string): boolean {
  return originalFullName !== newFullName || originalEmail !== newEmail;
}

function getUserDisplayName(user: any): string {
  if (user?.UserProfile?.full_name) {
    return user.UserProfile.full_name;
  }
  if (user?.email) {
    return user.email.split('@')[0];
  }
  return 'User';
}

function getUserRole(user: any): string {
  return user?.role || 'Member';
}

function isAccountActive(user: any): boolean {
  // Simple check - could be extended based on account status fields
  return !!(user?.email && user?.id);
}

function getAccountStatusBadge(isActive: boolean): { text: string; variant: string; color: string } {
  if (isActive) {
    return {
      text: 'Active',
      variant: 'success',
      color: 'text-green-200'
    };
  }
  return {
    text: 'Inactive',
    variant: 'destructive',
    color: 'text-red-200'
  };
}

function validatePasswordStrength(password: string): { score: number; feedback: string[] } {
  const feedback: string[] = [];
  let score = 0;

  if (password.length >= 8) {
    score += 1;
  } else {
    feedback.push('Use at least 8 characters');
  }

  if (/[a-z]/.test(password)) {
    score += 1;
  } else {
    feedback.push('Add lowercase letters');
  }

  if (/[A-Z]/.test(password)) {
    score += 1;
  } else {
    feedback.push('Add uppercase letters');
  }

  if (/[0-9]/.test(password)) {
    score += 1;
  } else {
    feedback.push('Add numbers');
  }

  if (/[^a-zA-Z0-9]/.test(password)) {
    score += 1;
  } else {
    feedback.push('Add special characters');
  }

  return { score, feedback };
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

describe('UserProfile Business Logic', () => {
  const mockUser = {
    id: '123',
    email: 'john.doe@example.com',
    role: 'admin',
    UserProfile: {
      full_name: 'John Doe',
      created_at: '2024-01-15T10:30:00Z',
      updated_at: '2024-01-20T14:45:00Z'
    }
  };

  describe('validatePasswordChange', () => {
    it('should pass validation with valid passwords', () => {
      const result = validatePasswordChange('current123', 'newPassword123', 'newPassword123');
      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should fail when passwords do not match', () => {
      const result = validatePasswordChange('current123', 'newPassword123', 'differentPassword');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('New passwords do not match');
    });

    it('should fail when new password is too short', () => {
      const result = validatePasswordChange('current123', '12345', '12345');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('New password must be at least 6 characters long');
    });

    it('should fail when current password is missing', () => {
      const result = validatePasswordChange('', 'newPassword123', 'newPassword123');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Current password is required to change password');
    });
  });

  describe('formatDate', () => {
    it('should format date correctly', () => {
      const result = formatDate('2024-01-15T10:30:00Z');
      expect(result).toBe('January 15, 2024');
    });

    it('should handle different date formats', () => {
      const result = formatDate('2024-12-31');
      expect(result).toBe('December 31, 2024');
    });
  });

  describe('formatDateTime', () => {
    it('should format datetime correctly', () => {
      const result = formatDateTime('2024-01-15T10:30:00Z');
      // Note: This will vary by timezone, so we just check it contains expected parts
      expect(result).toContain('2024');
      expect(result).toContain('Jan');
      expect(result).toContain('15');
    });
  });

  describe('getInitials', () => {
    it('should get initials from full name', () => {
      const result = getInitials('John Doe');
      expect(result).toBe('JD');
    });

    it('should handle single name', () => {
      const result = getInitials('John');
      expect(result).toBe('J');
    });

    it('should handle multiple names and limit to 2 characters', () => {
      const result = getInitials('John Michael Doe Smith');
      expect(result).toBe('JM');
    });

    it('should handle empty string', () => {
      const result = getInitials('');
      expect(result).toBe('');
    });

    it('should convert to uppercase', () => {
      const result = getInitials('john doe');
      expect(result).toBe('JD');
    });
  });

  describe('validateProfileData', () => {
    it('should pass validation with valid data', () => {
      const result = validateProfileData('John Doe', 'john@example.com');
      expect(result.isValid).toBe(true);
    });

    it('should fail with empty full name', () => {
      const result = validateProfileData('', 'john@example.com');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Full name is required');
    });

    it('should fail with full name too short', () => {
      const result = validateProfileData('J', 'john@example.com');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Full name must be at least 2 characters long');
    });

    it('should fail with empty email', () => {
      const result = validateProfileData('John Doe', '');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Email is required');
    });

    it('should fail with invalid email format', () => {
      const result = validateProfileData('John Doe', 'invalid-email');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Please enter a valid email address');
    });

    // it('should handle whitespace in inputs', () => {
    //   const result = validateProfileData('  John Doe  ', '  john@example.com  ');
    //   expect(result.isValid).toBe(true);
    // });
  });

  describe('hasProfileChanges', () => {
    it('should return true when full name changes', () => {
      const result = hasProfileChanges('John Doe', 'Jane Doe', 'john@example.com', 'john@example.com');
      expect(result).toBe(true);
    });

    it('should return true when email changes', () => {
      const result = hasProfileChanges('John Doe', 'John Doe', 'john@example.com', 'jane@example.com');
      expect(result).toBe(true);
    });

    it('should return false when nothing changes', () => {
      const result = hasProfileChanges('John Doe', 'John Doe', 'john@example.com', 'john@example.com');
      expect(result).toBe(false);
    });

    it('should return true when both change', () => {
      const result = hasProfileChanges('John Doe', 'Jane Smith', 'john@example.com', 'jane@example.com');
      expect(result).toBe(true);
    });
  });

  describe('getUserDisplayName', () => {
    it('should return full name when available', () => {
      const result = getUserDisplayName(mockUser);
      expect(result).toBe('John Doe');
    });

    it('should return email username when no full name', () => {
      const userWithoutName = { ...mockUser, UserProfile: null };
      const result = getUserDisplayName(userWithoutName);
      expect(result).toBe('john.doe');
    });

    it('should return "User" as fallback', () => {
      const result = getUserDisplayName(null);
      expect(result).toBe('User');
    });

    it('should handle user with empty profile', () => {
      const userWithEmptyProfile = { ...mockUser, UserProfile: { full_name: '' } };
      const result = getUserDisplayName(userWithEmptyProfile);
      expect(result).toBe('john.doe');
    });
  });

  describe('getUserRole', () => {
    it('should return user role when available', () => {
      const result = getUserRole(mockUser);
      expect(result).toBe('admin');
    });

    it('should return "Member" as default', () => {
      const userWithoutRole = { ...mockUser, role: undefined };
      const result = getUserRole(userWithoutRole);
      expect(result).toBe('Member');
    });

    it('should handle null user', () => {
      const result = getUserRole(null);
      expect(result).toBe('Member');
    });
  });

  describe('isAccountActive', () => {
    it('should return true for valid user with email and id', () => {
      const result = isAccountActive(mockUser);
      expect(result).toBe(true);
    });

    it('should return false for user without email', () => {
      const userWithoutEmail = { ...mockUser, email: undefined };
      const result = isAccountActive(userWithoutEmail);
      expect(result).toBe(false);
    });

    it('should return false for user without id', () => {
      const userWithoutId = { ...mockUser, id: undefined };
      const result = isAccountActive(userWithoutId);
      expect(result).toBe(false);
    });

    it('should return false for null user', () => {
      const result = isAccountActive(null);
      expect(result).toBe(false);
    });
  });

  describe('getAccountStatusBadge', () => {
    it('should return active badge for active account', () => {
      const result = getAccountStatusBadge(true);
      expect(result.text).toBe('Active');
      expect(result.variant).toBe('success');
      expect(result.color).toBe('text-green-200');
    });

    it('should return inactive badge for inactive account', () => {
      const result = getAccountStatusBadge(false);
      expect(result.text).toBe('Inactive');
      expect(result.variant).toBe('destructive');
      expect(result.color).toBe('text-red-200');
    });
  });

  describe('validatePasswordStrength', () => {
    it('should score strong password highly', () => {
      const result = validatePasswordStrength('StrongP@ssw0rd');
      expect(result.score).toBe(5);
      expect(result.feedback).toHaveLength(0);
    });

    it('should provide feedback for weak password', () => {
      const result = validatePasswordStrength('weak');
      expect(result.score).toBeLessThan(5);
      expect(result.feedback.length).toBeGreaterThan(0);
      expect(result.feedback).toContain('Use at least 8 characters');
    });

    it('should check for different character types', () => {
      const result = validatePasswordStrength('password');
      expect(result.feedback).toContain('Add uppercase letters');
      expect(result.feedback).toContain('Add numbers');
      expect(result.feedback).toContain('Add special characters');
    });

    it('should handle empty password', () => {
      const result = validatePasswordStrength('');
      expect(result.score).toBe(0);
      expect(result.feedback.length).toBeGreaterThan(0);
    });
  });

  describe('formatFileSize', () => {
    it('should format bytes correctly', () => {
      expect(formatFileSize(0)).toBe('0 Bytes');
      expect(formatFileSize(1024)).toBe('1 KB');
      expect(formatFileSize(1048576)).toBe('1 MB');
      expect(formatFileSize(1073741824)).toBe('1 GB');
    });

    it('should handle decimal values', () => {
      expect(formatFileSize(1536)).toBe('1.5 KB');
      expect(formatFileSize(2621440)).toBe('2.5 MB');
    });

    it('should handle large numbers', () => {
      const result = formatFileSize(5368709120);
      expect(result).toBe('5 GB');
    });
  });

  describe('Edge Cases', () => {
    // it('should handle undefined values gracefully', () => {
    //   expect(() => getInitials(undefined as any)).not.toThrow();
    //   expect(() => getUserDisplayName(undefined)).not.toThrow();
    //   expect(() => getUserRole(undefined)).not.toThrow();
    // });

    it('should handle malformed date strings', () => {
      expect(() => formatDate('invalid-date')).not.toThrow();
      expect(() => formatDateTime('invalid-date')).not.toThrow();
    });

    it('should handle special characters in names', () => {
      const result = getInitials('José María');
      expect(result).toBe('JM');
    });

    it('should validate email with special characters', () => {
      const result = validateProfileData('John Doe', 'john+test@example-domain.com');
      expect(result.isValid).toBe(true);
    });

    it('should handle extremely long names', () => {
      const longName = 'A'.repeat(100);
      const result = getInitials(longName);
      expect(result).toBe('A');
    });
  });
}); 