import { getAuth } from 'firebase/auth';
import { PUBLIC_BACKEND_API_URL } from '$env/static/public';
const API_URL = PUBLIC_BACKEND_API_URL || "http://budgetwis.me/api";

export interface OCRResult {
	type: 'expense' | 'income';
	amount: number;
	date: string;
	vendor: string;
	description: string;
	category: string;
	upload_id?: number;
	extraction_id?: number;
}

// Chat result has the same structure as OCR result
export interface ChatResult extends OCRResult {}

class OCRService {
	private async getAuthHeaders() {
		const auth = getAuth();
		const user = auth.currentUser;
		if (!user) throw new Error('User not authenticated');

		const token = await user.getIdToken();
		return {
			'Authorization': `Bearer ${token}`,
		};
	}

	async processReceipt(file: File): Promise<OCRResult> {
		try {
			const headers = await this.getAuthHeaders();
			
			const formData = new FormData();
			formData.append('receipt', file);

			const response = await fetch(`${API_URL}/ocr/receipt`, {
				method: 'POST',
				headers: headers,
				body: formData,
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.message || 'Failed to process receipt');
			}

			const result = await response.json();
			return result.data;
		} catch (error) {
			console.error('OCR processing error:', error);
			throw error;
		}
	}

	async processChatMessage(message: string): Promise<ChatResult> {
		try {
			const headers = await this.getAuthHeaders();

			const response = await fetch(`${API_URL}/ocr/chat`, {
				method: 'POST',
				headers: {
					...headers,
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ message }),
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.message || 'Failed to process chat message');
			}

			const result = await response.json();
			return result.data;
		} catch (error) {
			console.error('Chat processing error:', error);
			throw error;
		}
	}

	async getOCRHistory(): Promise<any[]> {
		try {
			const headers = await this.getAuthHeaders();

			const response = await fetch(`${API_URL}/ocr/history`, {
				method: 'GET',
				headers: {
					...headers,
					'Content-Type': 'application/json',
				},
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.message || 'Failed to fetch OCR history');
			}

			const result = await response.json();
			return result.data;
		} catch (error) {
			console.error('OCR history error:', error);
			throw error;
		}
	}

	validateFileType(file: File): boolean {
		const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
		return allowedTypes.includes(file.type);
	}

	validateFileSize(file: File, maxSizeMB: number = 10): boolean {
		const maxSize = maxSizeMB * 1024 * 1024; // Convert to bytes
		return file.size <= maxSize;
	}
}

export const ocrService = new OCRService();