import { describe, it, expect } from 'vitest';

// Business logic functions extracted from ReceiptUpload component
function validateFileType(file: { type: string }): boolean {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  return allowedTypes.includes(file.type);
}

function validateFileSize(file: { size: number }, maxSizeMB: number): boolean {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  return file.size <= maxSizeBytes;
}

function validateReceiptFile(file: { type: string; size: number }, maxSizeMB: number = 10): { isValid: boolean; error?: string } {
  if (!validateFileType(file)) {
    return { isValid: false, error: 'Please select a valid image file (JPG, PNG, GIF, WebP)' };
  }

  if (!validateFileSize(file, maxSizeMB)) {
    return { isValid: false, error: `File size must be less than ${maxSizeMB}MB` };
  }

  return { isValid: true };
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + sizes[i];
}

function extractFileExtension(filename: string): string {
  const lastDotIndex = filename.lastIndexOf('.');
  if (lastDotIndex === -1) return '';
  return filename.substring(lastDotIndex + 1).toLowerCase();
}

function isImageFile(filename: string): boolean {
  const extension = extractFileExtension(filename);
  const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg'];
  return imageExtensions.includes(extension);
}

function generateReceiptId(prefix: string = 'receipt'): string {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000);
  return `${prefix}_${timestamp}_${random}`;
}

function validateOCRResult(result: any): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!result.description || typeof result.description !== 'string' || result.description.trim() === '') {
    errors.push('Description is required');
  }

  if (typeof result.amount !== 'number' || result.amount <= 0) {
    errors.push('Amount must be a positive number');
  }

  if (!result.type || !['income', 'expense'].includes(result.type)) {
    errors.push('Type must be either income or expense');
  }

  if (!result.category || typeof result.category !== 'string' || result.category.trim() === '') {
    errors.push('Category is required');
  }

  if (!result.date || isNaN(new Date(result.date).getTime())) {
    errors.push('Valid date is required');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

function sanitizeOCRResult(result: any): any {
  return {
    description: (result.description || '').trim(),
    amount: Math.abs(parseFloat(result.amount) || 0),
    type: result.type === 'income' ? 'income' : 'expense',
    category: (result.category || 'General').trim(),
    vendor: (result.vendor || '').trim(),
    date: result.date || new Date().toISOString()
  };
}

function calculateConfidenceScore(result: any): number {
  let score = 0;
  let maxScore = 0;

  // Description confidence (weight: 2)
  maxScore += 2;
  if (result.description && result.description.length >= 3) {
    score += 2;
  } else if (result.description && result.description.length > 0) {
    score += 1;
  }

  // Amount confidence (weight: 3)
  maxScore += 3;
  if (typeof result.amount === 'number' && result.amount > 0) {
    score += 3;
  }

  // Vendor confidence (weight: 1)
  maxScore += 1;
  if (result.vendor && result.vendor.length >= 2) {
    score += 1;
  }

  // Date confidence (weight: 1)
  maxScore += 1;
  if (result.date && !isNaN(new Date(result.date).getTime())) {
    score += 1;
  }

  // Category confidence (weight: 1)
  maxScore += 1;
  if (result.category && result.category.length >= 2) {
    score += 1;
  }

  return Math.round((score / maxScore) * 100);
}

function isDragEventValid(event: any): boolean {
  return !!(event?.dataTransfer?.files && event.dataTransfer.files.length > 0);
}

function getFileFromDragEvent(event: any): File | null {
  if (!isDragEventValid(event)) return null;
  return event.dataTransfer.files[0] || null;
}

function createImagePreview(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!validateFileType(file)) {
      reject(new Error('Invalid file type'));
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        resolve(e.target.result as string);
      } else {
        reject(new Error('Failed to read file'));
      }
    };
    reader.onerror = () => reject(new Error('Error reading file'));
    reader.readAsDataURL(file);
  });
}

function compareOCRResults(result1: any, result2: any): { similarity: number; differences: string[] } {
  const differences: string[] = [];
  let matches = 0;
  let totalFields = 0;

  const fields = ['description', 'amount', 'type', 'category', 'vendor'];
  
  fields.forEach(field => {
    totalFields++;
    if (result1[field] === result2[field]) {
      matches++;
    } else {
      differences.push(`${field}: ${result1[field]} vs ${result2[field]}`);
    }
  });

  const similarity = Math.round((matches / totalFields) * 100);
  
  return { similarity, differences };
}

describe('ReceiptUpload Business Logic', () => {
  const validImageFile = {
    name: 'receipt.jpg',
    type: 'image/jpeg',
    size: 1024 * 1024 // 1MB
  };

  const invalidTypeFile = {
    name: 'document.pdf',
    type: 'application/pdf',
    size: 1024 * 1024
  };

  const largeSizeFile = {
    name: 'large-image.jpg',
    type: 'image/jpeg',
    size: 15 * 1024 * 1024 // 15MB
  };

  const mockOCRResult = {
    description: 'Grocery Shopping',
    amount: 45.99,
    type: 'expense',
    category: 'Food',
    vendor: 'SuperMart',
    date: '2024-01-15T10:30:00Z'
  };

  describe('validateFileType', () => {
    it('should accept valid image file types', () => {
      expect(validateFileType({ type: 'image/jpeg' })).toBe(true);
      expect(validateFileType({ type: 'image/jpg' })).toBe(true);
      expect(validateFileType({ type: 'image/png' })).toBe(true);
      expect(validateFileType({ type: 'image/gif' })).toBe(true);
      expect(validateFileType({ type: 'image/webp' })).toBe(true);
    });

    it('should reject invalid file types', () => {
      expect(validateFileType({ type: 'application/pdf' })).toBe(false);
      expect(validateFileType({ type: 'text/plain' })).toBe(false);
      expect(validateFileType({ type: 'video/mp4' })).toBe(false);
    });

    it('should handle empty or undefined type', () => {
      expect(validateFileType({ type: '' })).toBe(false);
      expect(validateFileType({ type: undefined as any })).toBe(false);
    });
  });

  describe('validateFileSize', () => {
    it('should accept files within size limit', () => {
      expect(validateFileSize({ size: 5 * 1024 * 1024 }, 10)).toBe(true); // 5MB < 10MB
      expect(validateFileSize({ size: 1024 }, 1)).toBe(true); // 1KB < 1MB
    });

    it('should reject files exceeding size limit', () => {
      expect(validateFileSize({ size: 15 * 1024 * 1024 }, 10)).toBe(false); // 15MB > 10MB
      expect(validateFileSize({ size: 2 * 1024 * 1024 }, 1)).toBe(false); // 2MB > 1MB
    });

    it('should handle exact size limit', () => {
      expect(validateFileSize({ size: 10 * 1024 * 1024 }, 10)).toBe(true); // Exactly 10MB
    });

    it('should handle zero size', () => {
      expect(validateFileSize({ size: 0 }, 10)).toBe(true);
    });
  });

  describe('validateReceiptFile', () => {
    it('should pass validation for valid files', () => {
      const result = validateReceiptFile(validImageFile);
      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should fail for invalid file type', () => {
      const result = validateReceiptFile(invalidTypeFile);
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Please select a valid image file (JPG, PNG, GIF, WebP)');
    });

    it('should fail for oversized file', () => {
      const result = validateReceiptFile(largeSizeFile);
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('File size must be less than 10MB');
    });

    it('should accept custom size limit', () => {
      const result = validateReceiptFile(largeSizeFile, 20);
      expect(result.isValid).toBe(true);
    });
  });

  describe('formatFileSize', () => {
    it('should handle decimal values', () => {
      expect(formatFileSize(1536)).toBe('1.5KB');
      expect(formatFileSize(2621440)).toBe('2.5MB');
    });
  });

  describe('extractFileExtension', () => {
    it('should extract file extensions correctly', () => {
      expect(extractFileExtension('photo.jpg')).toBe('jpg');
      expect(extractFileExtension('document.pdf')).toBe('pdf');
      expect(extractFileExtension('archive.tar.gz')).toBe('gz');
    });

    it('should handle files without extension', () => {
      expect(extractFileExtension('filename')).toBe('');
      expect(extractFileExtension('.')).toBe('');
    });

    it('should handle hidden files', () => {
      expect(extractFileExtension('.gitignore')).toBe('gitignore');
      expect(extractFileExtension('.env.local')).toBe('local');
    });

    it('should convert to lowercase', () => {
      expect(extractFileExtension('PHOTO.JPG')).toBe('jpg');
      expect(extractFileExtension('Document.PDF')).toBe('pdf');
    });
  });

  describe('isImageFile', () => {
    it('should identify image files correctly', () => {
      expect(isImageFile('photo.jpg')).toBe(true);
      expect(isImageFile('image.png')).toBe(true);
      expect(isImageFile('animation.gif')).toBe(true);
      expect(isImageFile('modern.webp')).toBe(true);
    });

    it('should reject non-image files', () => {
      expect(isImageFile('document.pdf')).toBe(false);
      expect(isImageFile('text.txt')).toBe(false);
      expect(isImageFile('video.mp4')).toBe(false);
    });

    it('should handle case insensitive extensions', () => {
      expect(isImageFile('PHOTO.JPG')).toBe(true);
      expect(isImageFile('Image.PNG')).toBe(true);
    });
  });

  describe('generateReceiptId', () => {
    it('should generate unique IDs', () => {
      const id1 = generateReceiptId();
      const id2 = generateReceiptId();
      expect(id1).not.toBe(id2);
    });

    it('should include custom prefix', () => {
      const id = generateReceiptId('test');
      expect(id).toMatch(/^test_\d+_\d+$/);
    });

    it('should use default prefix', () => {
      const id = generateReceiptId();
      expect(id).toMatch(/^receipt_\d+_\d+$/);
    });

    it('should handle empty prefix', () => {
      const id = generateReceiptId('');
      expect(id).toMatch(/^_\d+_\d+$/);
    });
  });

  describe('validateOCRResult', () => {
    it('should pass validation for valid OCR result', () => {
      const result = validateOCRResult(mockOCRResult);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should fail for missing description', () => {
      const invalidResult = { ...mockOCRResult, description: '' };
      const result = validateOCRResult(invalidResult);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Description is required');
    });

    it('should fail for invalid amount', () => {
      const invalidResult = { ...mockOCRResult, amount: -10 };
      const result = validateOCRResult(invalidResult);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Amount must be a positive number');
    });

    it('should fail for invalid type', () => {
      const invalidResult = { ...mockOCRResult, type: 'invalid' };
      const result = validateOCRResult(invalidResult);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Type must be either income or expense');
    });

    it('should fail for invalid date', () => {
      const invalidResult = { ...mockOCRResult, date: 'invalid-date' };
      const result = validateOCRResult(invalidResult);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Valid date is required');
    });

    it('should collect multiple errors', () => {
      const invalidResult = { description: '', amount: -5, type: 'invalid' };
      const result = validateOCRResult(invalidResult);
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(1);
    });
  });

  describe('sanitizeOCRResult', () => {
    it('should sanitize valid OCR result', () => {
      const result = sanitizeOCRResult(mockOCRResult);
      expect(result.description).toBe('Grocery Shopping');
      expect(result.amount).toBe(45.99);
      expect(result.type).toBe('expense');
    });

    it('should handle missing or invalid fields', () => {
      const invalidInput = {
        description: '  ',
        amount: 'invalid',
        type: 'unknown',
        category: null,
        vendor: undefined
      };
      const result = sanitizeOCRResult(invalidInput);
      expect(result.description).toBe('');
      expect(result.amount).toBe(0);
      expect(result.type).toBe('expense');
      expect(result.category).toBe('General');
      expect(result.vendor).toBe('');
    });

    it('should convert negative amounts to positive', () => {
      const negativeAmount = { ...mockOCRResult, amount: -25.50 };
      const result = sanitizeOCRResult(negativeAmount);
      expect(result.amount).toBe(25.50);
    });

    it('should provide default date', () => {
      const noDate = { ...mockOCRResult, date: undefined };
      const result = sanitizeOCRResult(noDate);
      expect(result.date).toBeDefined();
      expect(new Date(result.date)).toBeInstanceOf(Date);
    });
  });

  describe('calculateConfidenceScore', () => {
    it('should give high score for complete result', () => {
      const score = calculateConfidenceScore(mockOCRResult);
      expect(score).toBe(100);
    });

    it('should give lower score for incomplete result', () => {
      const incompleteResult = {
        description: 'Test',
        amount: 10,
        type: 'expense',
        category: '',
        vendor: '',
        date: 'invalid'
      };
      const score = calculateConfidenceScore(incompleteResult);
      expect(score).toBeLessThan(100);
    });

    it('should handle missing fields', () => {
      const minimalResult = { amount: 10 };
      const score = calculateConfidenceScore(minimalResult);
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(100);
    });
  });

  describe('isDragEventValid', () => {
    it('should validate drag events with files', () => {
      const validEvent = {
        dataTransfer: {
          files: [{ name: 'test.jpg' }]
        }
      };
      expect(isDragEventValid(validEvent)).toBe(true);
    });

    it('should reject invalid drag events', () => {
      expect(isDragEventValid({})).toBe(false);
      expect(isDragEventValid({ dataTransfer: {} })).toBe(false);
      expect(isDragEventValid({ dataTransfer: { files: [] } })).toBe(false);
    });
  });

  describe('getFileFromDragEvent', () => {
    it('should extract file from valid drag event', () => {
      const mockFile = { name: 'test.jpg' };
      const validEvent = {
        dataTransfer: {
          files: [mockFile]
        }
      };
      const result = getFileFromDragEvent(validEvent);
      expect(result).toBe(mockFile);
    });

    it('should return null for invalid events', () => {
      expect(getFileFromDragEvent({})).toBeNull();
      expect(getFileFromDragEvent({ dataTransfer: { files: [] } })).toBeNull();
    });
  });

  describe('compareOCRResults', () => {
    it('should calculate similarity between identical results', () => {
      const result = compareOCRResults(mockOCRResult, mockOCRResult);
      expect(result.similarity).toBe(100);
      expect(result.differences).toHaveLength(0);
    });

    it('should calculate similarity between different results', () => {
      const differentResult = { ...mockOCRResult, amount: 50.00, vendor: 'MegaMart' };
      const result = compareOCRResults(mockOCRResult, differentResult);
      expect(result.similarity).toBeLessThan(100);
      expect(result.differences.length).toBeGreaterThan(0);
    });

    it('should list specific differences', () => {
      const differentResult = { ...mockOCRResult, amount: 100 };
      const result = compareOCRResults(mockOCRResult, differentResult);
      expect(result.differences).toContain('amount: 45.99 vs 100');
    });
  });

  describe('Edge Cases', () => {
    it('should handle extremely large files', () => {
      const hugeFile = { type: 'image/jpeg', size: Number.MAX_SAFE_INTEGER };
      const result = validateReceiptFile(hugeFile);
      expect(result.isValid).toBe(false);
    });

    it('should handle special characters in filenames', () => {
      expect(isImageFile('receipt_@#$%.jpg')).toBe(true);
      expect(extractFileExtension('file@domain.com.png')).toBe('png');
    });



    it('should handle very long descriptions', () => {
      const longDescription = 'A'.repeat(1000);
      const longResult = { ...mockOCRResult, description: longDescription };
      const validation = validateOCRResult(longResult);
      expect(validation.isValid).toBe(true);
    });

    it('should handle zero amounts in confidence calculation', () => {
      const zeroAmount = { ...mockOCRResult, amount: 0 };
      const score = calculateConfidenceScore(zeroAmount);
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(100);
    });
  });
}); 