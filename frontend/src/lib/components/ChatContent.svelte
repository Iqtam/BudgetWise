<script lang="ts">
	import { Button } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { ScrollArea } from '$lib/components/ui/scroll-area/index.js';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card/index.js';
	import Icon from '@iconify/svelte';
	import { onMount } from 'svelte';
	import {
		aiAssistantService,
		type Message,
		type ActionItem,
		type Insight
	} from '$lib/services/aiAssistant';

	const initialMessages: Message[] = [
		{
			id: 1,
			type: 'assistant',
			content:
				"Hello! I'm your AI financial assistant powered by advanced AI. I can help you create personalized budgets, track expenses, provide savings advice, manage debt, and analyze your financial patterns. How can I help you today?",
			timestamp: new Date()
		}
	];

	let messages: Message[] = initialMessages;
	let inputValue = '';
	let isLoading = false;
	let scrollArea: any;
	let errorMessage = '';

	onMount(async () => {
		scrollToBottom();
		await loadChatHistory();
	});

	function scrollToBottom() {
		setTimeout(() => {
			if (scrollArea) {
				scrollArea.scrollTop = scrollArea.scrollHeight;
			}
		}, 100);
	}

	async function loadChatHistory() {
		try {
			const history = await aiAssistantService.getChatHistory(1, 50);
			if (history.chatHistory.length > 0) {
				const historyMessages = aiAssistantService.convertHistoryToMessages(history.chatHistory);
				messages = [...initialMessages, ...historyMessages];
				scrollToBottom();
			}
		} catch (error) {
			console.error('Failed to load chat history:', error);
			// Continue with initial messages if history fails to load
		}
	}

	async function sendMessage(content: string) {
		try {
			errorMessage = '';
			const response = await aiAssistantService.sendMessage(content);

			if (response.success) {
				const assistantMessage: Message = {
					id: messages.length + 1,
					type: 'assistant',
					content: response.data.conversationalResponse,
					timestamp: new Date(),
					intent: response.data.intent,
					actionItems: response.data.actionItems,
					insights: response.data.insights,
					budgetSummary: response.data.budgetSummary,
					projections: response.data.projections
				};
				messages = [...messages, assistantMessage];
				scrollToBottom();
			} else {
				throw new Error(response.error || 'Failed to get response');
			}
		} catch (error) {
			console.error('Error sending message:', error);
			errorMessage = (error as Error).message || 'Failed to send message. Please try again.';

			// Add error message to chat
			const errorResponse: Message = {
				id: messages.length + 1,
				type: 'assistant',
				content: `I apologize, but I encountered an error: ${errorMessage}. Please try again or contact support if the issue persists.`,
				timestamp: new Date()
			};
			messages = [...messages, errorResponse];
			scrollToBottom();
		} finally {
			// Always set loading to false when done (success or error)
			isLoading = false;
		}
	}

	async function handleSendMessage(content: string) {
		console.log('handleSendMessage called with:', content);
		if (!content.trim() || isLoading) return;

		// Add user message immediately
		const userMessage: Message = {
			id: messages.length + 1,
			type: 'user',
			content: content.trim(),
			timestamp: new Date()
		};
		messages = [...messages, userMessage];

		inputValue = '';
		isLoading = true;
		scrollToBottom();

		// Don't set isLoading to false here - let sendMessage handle it
		await sendMessage(content.trim());
	}

	function handleSubmit(event: SubmitEvent) {
		event.preventDefault();
		handleSendMessage(inputValue);
	}

	function handleQuickAction(message: string) {
		console.log('Quick action clicked:', message);
		// Show the message in the input box immediately
		inputValue = message;
		// Send the message after the next tick to ensure the input shows
		requestAnimationFrame(() => {
			handleSendMessage(message);
		});
	}
</script>

<div class="flex h-full flex-col">
	<!-- Chat Messages -->
	<ScrollArea bind:this={scrollArea} class="flex-1 p-4">
		<div class="mx-auto max-w-3xl space-y-4">
			{#each messages as message}
				<div class="flex gap-3 {message.type === 'user' ? 'justify-end' : 'justify-start'}">
					<div
						class="flex max-w-[80%] gap-3 {message.type === 'user'
							? 'flex-row-reverse'
							: 'flex-row'}"
					>
						<div
							class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full {message.type ===
							'user'
								? 'bg-muted'
								: 'bg-primary text-primary-foreground'}"
						>
							{#if message.type === 'user'}
								<Icon icon="lucide:user" class="h-4 w-4" />
							{:else}
								<Icon icon="lucide:bot" class="h-4 w-4" />
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

							<!-- AI Assistant additional content -->
							{#if message.type === 'assistant' && (message.actionItems?.length || message.insights?.length || message.budgetSummary)}
								<div class="mt-3 max-w-md space-y-3">
									<!-- Budget Summary -->
									{#if message.budgetSummary}
										<Card class="border-blue-200 bg-blue-50">
											<CardHeader class="pb-2">
												<CardTitle class="flex items-center gap-2 text-sm">
													<Icon icon="lucide:dollar-sign" class="h-4 w-4" />
													Budget Plan: {message.budgetSummary.framework.replace('_', ' ')}
												</CardTitle>
											</CardHeader>
											<CardContent class="pt-0">
												<div class="space-y-1 text-xs">
													<div>
														Monthly Budget: ${message.budgetSummary.totalMonthlyBudget.toFixed(2)}
													</div>
													{#if message.budgetSummary.allocationBreakdown}
														<div class="mt-2 grid grid-cols-3 gap-2">
															<div class="text-center">
																<div class="font-medium">Needs</div>
																<div>
																	${message.budgetSummary.allocationBreakdown.needs.toFixed(0)}
																</div>
															</div>
															<div class="text-center">
																<div class="font-medium">Wants</div>
																<div>
																	${message.budgetSummary.allocationBreakdown.wants.toFixed(0)}
																</div>
															</div>
															<div class="text-center">
																<div class="font-medium">Savings</div>
																<div>
																	${message.budgetSummary.allocationBreakdown.savingsAndDebt.toFixed(
																		0
																	)}
																</div>
															</div>
														</div>
													{/if}
												</div>
											</CardContent>
										</Card>
									{/if}

									<!-- Action Items -->
									{#if message.actionItems?.length}
										<Card class="border-green-200 bg-green-50">
											<CardHeader class="pb-2">
												<CardTitle class="flex items-center gap-2 text-sm">
													<Icon icon="lucide:target" class="h-4 w-4" />
													Action Items
												</CardTitle>
											</CardHeader>
											<CardContent class="pt-0">
												<div class="space-y-2">
													{#each message.actionItems as item}
														<div class="flex items-start gap-2">
															<Badge
																variant={item.priority === 'high'
																	? 'destructive'
																	: item.priority === 'medium'
																		? 'default'
																		: 'secondary'}
																class="text-xs"
															>
																{item.priority}
															</Badge>
															<div class="flex-1">
																<div class="text-xs font-medium">{item.title}</div>
																<div class="text-muted-foreground text-xs">{item.description}</div>
																{#if item.estimatedTime}
																	<div class="text-muted-foreground text-xs">
																		⏱ {item.estimatedTime}
																	</div>
																{/if}
															</div>
														</div>
													{/each}
												</div>
											</CardContent>
										</Card>
									{/if}

									<!-- Insights -->
									{#if message.insights?.length}
										<Card class="border-orange-200 bg-orange-50">
											<CardHeader class="pb-2">
												<CardTitle class="flex items-center gap-2 text-sm">
													<Icon icon="lucide:trending-up" class="h-4 w-4" />
													Insights
												</CardTitle>
											</CardHeader>
											<CardContent class="pt-0">
												<div class="space-y-2">
													{#each message.insights as insight}
														<div class="flex items-start gap-2">
															<Icon
																icon="lucide:alert-circle"
																class="mt-0.5 h-3 w-3 text-{insight.type === 'warning'
																	? 'orange'
																	: insight.type === 'info'
																		? 'blue'
																		: 'green'}-500"
															/>
															<div class="flex-1">
																<div class="text-xs font-medium">{insight.title}</div>
																<div class="text-muted-foreground text-xs">{insight.message}</div>
															</div>
														</div>
													{/each}
												</div>
											</CardContent>
										</Card>
									{/if}

									<!-- Projections -->
									{#if message.projections}
										<Card class="border-purple-200 bg-purple-50">
											<CardHeader class="pb-2">
												<CardTitle class="text-sm">Financial Projections</CardTitle>
											</CardHeader>
											<CardContent class="pt-0">
												<div class="space-y-1 text-xs">
													<div>
														Monthly Surplus: ${message.projections.monthlySurplus.toFixed(2)}
													</div>
													<div>
														Yearly Projection: ${message.projections.yearlyProjection.toFixed(2)}
													</div>
													<div>
														Budget Utilization: {message.projections.budgetUtilization.toFixed(1)}%
													</div>
													{#if message.projections.emergencyFundTimeline}
														<div>
															Emergency Fund: {message.projections.emergencyFundTimeline} months
														</div>
													{/if}
												</div>
											</CardContent>
										</Card>
									{/if}
								</div>
							{/if}

							<p class="text-muted-foreground text-xs">
								{message.timestamp.toLocaleTimeString()}
								{#if message.intent}
									• {message.intent.replace('_', ' ').toLowerCase()}
								{/if}
							</p>
						</div>
					</div>
				</div>
			{/each}

			{#if isLoading}
				<div class="flex justify-start gap-3">
					<div class="flex max-w-[80%] gap-3">
						<div class="bg-muted flex h-8 w-8 shrink-0 items-center justify-center rounded-full">
							<Icon icon="lucide:bot" class="h-4 w-4" />
						</div>
						<div class="bg-muted rounded-lg px-4 py-2">
							<div class="flex space-x-1">
								<div class="h-2 w-2 animate-bounce rounded-full bg-gray-400"></div>
								<div
									class="h-2 w-2 animate-bounce rounded-full bg-gray-400"
									style="animation-delay: 0.1s"
								></div>
								<div
									class="h-2 w-2 animate-bounce rounded-full bg-gray-400"
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
	<div class="border-t bg-gray-900 p-4">
		<div class="mx-auto max-w-3xl">
			<form on:submit={handleSubmit} class="flex gap-2">
				<Input
					bind:value={inputValue}
					placeholder="Ask me about your finances, add transactions, or get insights..."
					disabled={isLoading}
					class="flex-1 border-gray-700 bg-gray-800 text-white placeholder:text-gray-400 focus-visible:ring-blue-500"
				/>
				<Button
					type="submit"
					disabled={isLoading || !inputValue.trim()}
					class="border-none bg-blue-600 text-white hover:bg-blue-700"
				>
					<Icon icon="lucide:send" class="h-4 w-4" />
				</Button>
			</form>
			<div class="mt-2 text-center">
				<p class="text-muted-foreground mb-2 text-xs">Quick suggestions:</p>
				<div class="flex flex-wrap justify-center gap-1">
					<Button
						variant="outline"
						size="sm"
						class="h-6 px-2 text-xs"
						onclick={() => handleQuickAction('Help me create a budget plan')}
						disabled={isLoading}
					>
						<Icon icon="lucide:target" class="mr-1 h-5 w-5 text-blue-500" />
						Budget Plan
					</Button>
					<Button
						variant="outline"
						size="sm"
						class="h-6 px-2 text-xs"
						onclick={() => handleQuickAction('Show me my financial insights')}
						disabled={isLoading}
					>
						<Icon icon="lucide:trending-up" class="mr-1 h-5 w-5 text-green-500" />
						Insights
					</Button>
					<Button
						variant="outline"
						size="sm"
						class="h-6 px-2 text-xs"
						onclick={() => handleQuickAction('Give me savings advice')}
						disabled={isLoading}
					>
						<Icon icon="lucide:piggy-bank" class="mr-1 h-5 w-5 text-pink-500" />
						Savings
					</Button>
					<Button
						variant="outline"
						size="sm"
						class="h-6 px-2 text-xs"
						onclick={() => handleQuickAction('Help me manage my debt')}
						disabled={isLoading}
					>
						<Icon icon="lucide:alert-circle" class="mr-1 h-5 w-5 text-yellow-500" />
						Debt Help
					</Button>
					<Button
						variant="outline"
						size="sm"
						class="h-6 px-2 text-xs"
						onclick={() => handleQuickAction('Analyze my budget and recommend reallocations')}
						disabled={isLoading}
					>
						<Icon icon="lucide:repeat" class="mr-1 h-5 w-5 text-purple-500" />
						Reallocation
					</Button>
				</div>
			</div>
		</div>
	</div>
</div>
