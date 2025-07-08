<script lang="ts">
	import { Button } from "$lib/components/ui/button/index.js";
	import { Input } from "$lib/components/ui/input/index.js";
	import { ScrollArea } from "$lib/components/ui/scroll-area/index.js";
	import { Bot, Send, User } from "lucide-svelte";
	import { onMount } from "svelte";

	interface Message {
		id: number;
		type: "user" | "assistant";
		content: string;
		timestamp: Date;
	}

	const initialMessages: Message[] = [
		{
			id: 1,
			type: "assistant",
			content:
				"Hello! I'm your AI financial assistant. I can help you track expenses, create budgets, analyze spending patterns, and answer financial questions. How can I help you today?",
			timestamp: new Date(),
		},
	];

	let messages: Message[] = initialMessages;
	let inputValue = "";
	let isLoading = false;
	let scrollArea: HTMLElement;

	onMount(() => {
		scrollToBottom();
	});

	function scrollToBottom() {
		setTimeout(() => {
			if (scrollArea) {
				scrollArea.scrollTop = scrollArea.scrollHeight;
			}
		}, 100);
	}

	function generateAIResponse(userInput: string): { content: string } {
		const input = userInput.toLowerCase();

		if (input.includes("spent") || input.includes("expense") || input.includes("bought")) {
			return {
				content:
					"I've recorded your expense! Based on the information provided, I've categorized this transaction and updated your budget. Your remaining budget for this category is looking good. Would you like me to analyze your spending patterns or set up any alerts?",
			};
		}

		if (input.includes("income") || input.includes("received") || input.includes("earned")) {
			return {
				content:
					"Great! I've added this income to your records. Your monthly income is tracking well. Based on your income pattern, I can suggest some automatic savings transfers or budget adjustments. What would you like to focus on?",
			};
		}

		if (input.includes("budget") || input.includes("spending")) {
			return {
				content:
					"Let me check your budget status... You're currently at 68% of your monthly budget with 12 days remaining. Your top spending categories are Food ($420/$500) and Transportation ($180/$300). You're on track to stay within budget this month!",
			};
		}

		if (input.includes("savings") || input.includes("save") || input.includes("goal")) {
			return {
				content:
					"I'd be happy to help with your savings goals! Based on your current income and expenses, you have about $400 available for savings each month. I can help you create a plan, set up automatic transfers, or optimize your existing savings strategy.",
			};
		}

		if (input.includes("debt") || input.includes("loan") || input.includes("payment")) {
			return {
				content:
					"I can help you manage your debt effectively! You currently have $26,250 in total debt across 3 accounts. I recommend focusing on your Credit Card first (18.99% APR) using the debt avalanche method. Would you like a detailed payoff plan?",
			};
		}

		return {
			content:
				"I understand you're looking for financial guidance. I can help you with budgeting, expense tracking, savings goals, debt management, and financial analysis. Could you be more specific about what you'd like assistance with?",
		};
	}

	async function handleSendMessage(content: string) {
		if (!content.trim()) return;

		const userMessage: Message = {
			id: messages.length + 1,
			type: "user",
			content: content.trim(),
			timestamp: new Date(),
		};

		messages = [...messages, userMessage];
		inputValue = "";
		isLoading = true;
		scrollToBottom();

		// Simulate AI response
		setTimeout(() => {
			const aiResponse = generateAIResponse(content.trim());
			const assistantMessage: Message = {
				id: messages.length + 2,
				type: "assistant",
				content: aiResponse.content,
				timestamp: new Date(),
			};

			messages = [...messages, assistantMessage];
			isLoading = false;
			scrollToBottom();
		}, 1000);
	}

	function handleSubmit(event: SubmitEvent) {
		event.preventDefault();
		handleSendMessage(inputValue);
	}
</script>

<div class="flex flex-col h-full">
	<!-- Chat Messages -->
	<ScrollArea bind:this={scrollArea} class="flex-1 p-4">
		<div class="space-y-4 max-w-3xl mx-auto">
			{#each messages as message}
				<div class="flex gap-3 {message.type === 'user' ? 'justify-end' : 'justify-start'}">
					<div class="flex gap-3 max-w-[80%] {message.type === 'user' ? 'flex-row-reverse' : 'flex-row'}">
						<div
							class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full {message.type === 'user'
								? 'bg-muted'
								: 'bg-primary text-primary-foreground'}"
						>
							{#if message.type === 'user'}
								<User class="h-4 w-4" />
							{:else}
								<Bot class="h-4 w-4" />
							{/if}
						</div>
						<div class="space-y-2 {message.type === 'user' ? 'text-right' : 'text-left'}">
							<div
								class="rounded-lg px-4 py-2 {message.type === 'user'
									? 'bg-muted'
									: 'bg-primary text-primary-foreground'}"
							>
								<p class="text-sm">{message.content}</p>
							</div>
							<p class="text-xs text-muted-foreground">
								{message.timestamp.toLocaleTimeString()}
							</p>
						</div>
					</div>
				</div>
			{/each}

			{#if isLoading}
				<div class="flex gap-3 justify-start">
					<div class="flex gap-3 max-w-[80%]">
						<div class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted">
							<Bot class="h-4 w-4" />
						</div>
						<div class="rounded-lg px-4 py-2 bg-muted">
							<div class="flex space-x-1">
								<div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
								<div
									class="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
									style="animation-delay: 0.1s"
								></div>
								<div
									class="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
									style="animation-delay: 0.2s"
								></div>
							</div>
						</div>
					</div>
				</div>
			{/if}
		</div>
	</ScrollArea>

	<!-- Input Area -->
	<div class="border-t p-4 bg-gray-900">
		<div class="max-w-3xl mx-auto">
			<form on:submit={handleSubmit} class="flex gap-2">
				<Input
					bind:value={inputValue}
					placeholder="Ask me about your finances, add transactions, or get insights..."
					disabled={isLoading}
					class="flex-1 bg-gray-800 text-white placeholder:text-gray-400 border-gray-700 focus-visible:ring-blue-500"
				/>
				<Button type="submit" disabled={isLoading || !inputValue.trim()} class="bg-blue-600 hover:bg-blue-700 text-white border-none">
					<Send class="h-4 w-4" />
				</Button>
			</form>
			<p class="text-xs text-muted-foreground mt-2 text-center">
				Try: "I spent $50 on dinner" or "How's my budget looking?"
			</p>
		</div>
	</div>
</div> 