<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Badge } from '$lib/components/ui/badge';
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Camera, Upload, Loader2, CheckCircle, Edit, X } from 'lucide-svelte';
	import { createEventDispatcher } from 'svelte';
	import { ocrService, type OCRResult } from '$lib/services/ocr';

	export let isOpen = false;

	const dispatch = createEventDispatcher<{
		close: void;
		success: { data: OCRResult };
		edit: { data: OCRResult };
	}>();

	let fileInput: HTMLInputElement;
	let selectedFile: File | null = null;
	let isProcessing = false;
	let ocrResult: OCRResult | null = null;
	let error: string | null = null;
	let dragActive = false;

	function onFileSelected(event: Event) {
		const target = event.target as HTMLInputElement;
		if (target.files && target.files[0]) {
			handleFile(target.files[0]);
		}
	}

	function handleFile(file: File) {
		error = null;
		
		// Validate file type
		if (!ocrService.validateFileType(file)) {
			error = 'Please select a valid image file (JPG, PNG, GIF, WebP)';
			return;
		}

		// Validate file size
		if (!ocrService.validateFileSize(file, 10)) {
			error = 'File size must be less than 10MB';
			return;
		}

		selectedFile = file;
	}

	async function processReceipt() {
		if (!selectedFile) return;

		isProcessing = true;
		error = null;

		try {
			const result = await ocrService.processReceipt(selectedFile);
			ocrResult = result;
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to process receipt';
		} finally {
			isProcessing = false;
		}
	}

	function handleConfirm() {
		if (ocrResult) {
			dispatch('success', { data: ocrResult });
			closeModal();
		}
	}

	function handleEdit() {
		if (ocrResult) {
			dispatch('edit', { data: ocrResult });
			closeModal();
		}
	}

	function closeModal() {
		isOpen = false;
		selectedFile = null;
		ocrResult = null;
		error = null;
		isProcessing = false;
		dispatch('close');
	}

	function onDragOver(event: DragEvent) {
		event.preventDefault();
		dragActive = true;
	}

	function onDragLeave(event: DragEvent) {
		event.preventDefault();
		dragActive = false;
	}

	function onDrop(event: DragEvent) {
		event.preventDefault();
		dragActive = false;
		
		const files = event.dataTransfer?.files;
		if (files && files[0]) {
			handleFile(files[0]);
		}
	}
</script>

{#if isOpen}
	<div class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
		<Card class="w-full max-w-md mx-4">
			<CardHeader class="flex flex-row items-center justify-between">
				<CardTitle class="flex items-center gap-2">
					<Camera class="h-5 w-5" />
					Receipt Scanner
				</CardTitle>
				<Button variant="ghost" size="sm" on:click={closeModal}>
					<X class="h-4 w-4" />
				</Button>
			</CardHeader>
			
			<CardContent class="space-y-4">
				{#if !ocrResult}
					<!-- File Upload Section -->
					<div class="space-y-4">
						<!-- Drag & Drop Area -->
						<div
							class="border-2 border-dashed rounded-lg p-6 text-center transition-colors {dragActive
								? 'border-primary bg-primary/5'
								: 'border-gray-300 hover:border-gray-400'}"
							on:dragover={onDragOver}
							on:dragleave={onDragLeave}
							on:drop={onDrop}
							role="button"
							tabindex="0"
						>
							<Upload class="h-8 w-8 mx-auto mb-2 text-gray-400" />
							<p class="text-sm text-gray-600 mb-2">
								Drag & drop your receipt image here, or
							</p>
							<Button variant="outline" on:click={() => fileInput?.click()}>
								Choose File
							</Button>
						</div>

						<input
							bind:this={fileInput}
							type="file"
							accept="image/*"
							class="hidden"
							on:change={onFileSelected}
						/>

						{#if selectedFile}
							<div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
								<div class="flex items-center gap-2">
									<CheckCircle class="h-4 w-4 text-green-500" />
									<span class="text-sm text-gray-700">{selectedFile.name}</span>
								</div>
								<Badge variant="secondary">
									{(selectedFile.size / 1024 / 1024).toFixed(1)}MB
								</Badge>
							</div>

							<Button 
								class="w-full" 
								on:click={processReceipt} 
								disabled={isProcessing}
							>
								{#if isProcessing}
									<Loader2 class="h-4 w-4 mr-2 animate-spin" />
									Processing...
								{:else}
									<Camera class="h-4 w-4 mr-2" />
									Scan Receipt
								{/if}
							</Button>
						{/if}

						{#if error}
							<div class="p-3 bg-red-50 border border-red-200 rounded-lg">
								<p class="text-sm text-red-600">{error}</p>
							</div>
						{/if}
					</div>
				{:else}
					<!-- OCR Results Preview -->
					<div class="space-y-4">
						<div class="text-center">
							<CheckCircle class="h-8 w-8 mx-auto mb-2 text-green-500" />
							<h3 class="font-semibold text-green-700">Receipt Processed!</h3>
						</div>

						<div class="bg-gray-50 p-4 rounded-lg space-y-2">
							<h4 class="font-mono text-sm font-semibold mb-3">🧾 OCR Preview:</h4>
							<div class="space-y-1 text-sm">
								<div class="flex justify-between">
									<span class="text-gray-600">Description:</span>
									<span class="font-medium">{ocrResult.description}</span>
								</div>
								<div class="flex justify-between">
									<span class="text-gray-600">Amount:</span>
									<span class="font-medium">৳{ocrResult.amount.toFixed(2)}</span>
								</div>
								<div class="flex justify-between">
									<span class="text-gray-600">Type:</span>
									<Badge variant={ocrResult.type === 'expense' ? 'destructive' : 'default'}>
										{ocrResult.type}
									</Badge>
								</div>
								<div class="flex justify-between">
									<span class="text-gray-600">Category:</span>
									<span class="font-medium">{ocrResult.category}</span>
								</div>
								<div class="flex justify-between">
									<span class="text-gray-600">Vendor:</span>
									<span class="font-medium">{ocrResult.vendor}</span>
								</div>
								<div class="flex justify-between">
									<span class="text-gray-600">Date:</span>
									<span class="font-medium">{new Date(ocrResult.date).toLocaleDateString()}</span>
								</div>
							</div>
						</div>

						<div class="flex gap-2">
							<Button variant="outline" class="flex-1" on:click={handleEdit}>
								<Edit class="h-4 w-4 mr-2" />
								Edit
							</Button>
							<Button class="flex-1" on:click={handleConfirm}>
								<CheckCircle class="h-4 w-4 mr-2" />
								Confirm & Add
							</Button>
						</div>
					</div>
				{/if}
			</CardContent>
		</Card>
	</div>
{/if}