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
	import { marked } from 'marked';

	// Chart types for financial insights
	type ChartType = 'line' | 'doughnut' | 'pie' | 'bar' | 'stacked-bar' | 'gauge' | 'donut';

	interface ChartData {
		title: string;
		type: ChartType;
		data: any;
	}

	interface GraphData {
		type: string;
		charts: ChartData[];
		summary: any;
	}

	const initialMessages: Message[] = [
		{
			id: 1,
			type: 'assistant',
			content:
				"Hello! I'm your AI financial assistant powered by advanced AI. I can help you create personalized budgets, track expenses, provide savings advice, manage debt, and analyze your financial patterns. How can I help you today?",
			displayedContent:
				"Hello! I'm your AI financial assistant powered by advanced AI. I can help you create personalized budgets, track expenses, provide savings advice, manage debt, and analyze your financial patterns. How can I help you today?",
			timestamp: new Date()
		}
	];

	let messages: Message[] = initialMessages;
	let inputValue = '';
	let isLoading = false;
	let scrollArea: any;
	let errorMessage = '';
	let typingInterval: any = null;
	let isTyping = false;
	let scrollViewport: HTMLDivElement;

	onMount(async () => {
		await loadChatHistory();
		// Ensure scroll to bottom after everything is loaded
		setTimeout(() => {
			scrollToBottom();
		}, 200);
	});

	function scrollToBottom() {
		requestAnimationFrame(() => {
			if (scrollArea) {
				// Use window.scrollTo as a fallback
				window.scrollTo(0, document.body.scrollHeight);
			}
		});
	}

	function startTypingEffect(message: Message, speed = 30) {
		console.log('startTypingEffect called with message:', message);
		console.log('Message graphData in startTypingEffect:', message.graphData);
		// Prevent multiple intervals
		if (typingInterval) clearInterval(typingInterval);

		message.displayedContent = '';
		const words = message.content.split(' ');
		let wordIndex = 0;
		isTyping = true;
		typingInterval = setInterval(() => {
			if (!isTyping) {
				clearInterval(typingInterval);
				typingInterval = null;
				return;
			}
			if (wordIndex < words.length) {
				message.displayedContent += (wordIndex === 0 ? '' : ' ') + words[wordIndex];
				// Force reactivity by creating a new array reference
				messages = [...messages];
				wordIndex++;
				// Force immediate scroll during typing
				if (scrollArea) {
					window.scrollTo(0, document.body.scrollHeight);
				}
			} else {
				clearInterval(typingInterval);
				typingInterval = null;
				isTyping = false;
				message.displayedContent = message.content;
				console.log('Message after typing complete:', message);
				console.log('Message graphData after typing:', message.graphData);
				// Force reactivity by creating a new array reference
				messages = [...messages];
				// Final scroll after typing is complete
				scrollToBottom();
			}
		}, speed);
	}

	function stopTyping() {
		console.log('stopTyping called');
		isTyping = false;
		if (typingInterval) {
			clearInterval(typingInterval);
			typingInterval = null;
		}
		// Show full content for the last assistant message
		const lastMsg = messages[messages.length - 1];
		if (lastMsg && lastMsg.type === 'assistant') {
			lastMsg.displayedContent = lastMsg.content;
			messages = [...messages];
		}
	}

	async function loadChatHistory() {
		try {
			const history = await aiAssistantService.getChatHistory(1, 50);
			if (history.chatHistory.length > 0) {
				const historyMessages = aiAssistantService.convertHistoryToMessages(history.chatHistory);
				for (const msg of historyMessages) {
					if (msg.type === 'assistant') {
						msg.displayedContent = msg.content;
					}
				}
				messages = [...initialMessages, ...historyMessages];
				// Force scroll to bottom after loading history
				setTimeout(() => {
					scrollToBottom();
				}, 100);
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
			console.log('AI response:', response);
			if (response.success) {
				console.log('Response data:', response.data);
				console.log('Response data keys:', Object.keys(response.data));
				console.log('Graph data in response:', response.data.graphData);
				console.log('Graph data type:', typeof response.data.graphData);
				console.log(
					'Graph data keys:',
					response.data.graphData ? Object.keys(response.data.graphData) : 'null/undefined'
				);
				const assistantMessage: Message = {
					id: messages.length + 1,
					type: 'assistant',
					content: response.data.conversationalResponse,
					displayedContent: '',
					timestamp: new Date(),
					intent: response.data.intent || undefined,
					actionItems: response.data.actionItems || [],
					insights: response.data.insights || [],
					budgetSummary: response.data.budgetSummary || undefined,
					projections: response.data.projections || undefined,
					graphData: response.data.graphData || undefined,
					insightType: response.data.insightType || undefined
				};
				console.log('Assistant message created:', assistantMessage);
				console.log('Assistant message graphData:', assistantMessage.graphData);
				console.log('Assistant message graphData type:', typeof assistantMessage.graphData);
				console.log('Assistant message graphData truthy:', !!assistantMessage.graphData);
				// Create a deep copy to ensure all properties are preserved, but keep timestamp as Date
				const messageCopy = {
					...assistantMessage,
					timestamp: new Date(assistantMessage.timestamp)
				};
				console.log('Message copy created:', messageCopy);
				console.log('Message copy graphData:', messageCopy.graphData);
				messages = [...messages, messageCopy];
				console.log('Message added to array:', messages[messages.length - 1]);
				startTypingEffect(messageCopy);
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

	// Chart rendering functions
	function renderLineChart(chart: ChartData) {
		const data = chart.data;
		if (!data || data.length === 0) {
			return `<div class="chart-container"><div class="chart-title">${chart.title}</div><div class="chart-placeholder">No data available</div></div>`;
		}

		// Convert string amounts to numbers
		const numericData = data.map((d: any) => ({
			...d,
			amount: parseFloat(d.amount) || 0
		}));

		const maxValue = Math.max(...numericData.map((d: any) => d.amount));
		const minValue = Math.min(...numericData.map((d: any) => d.amount));
		const range = maxValue - minValue;

		return `
			<div class="chart-container">
				<div class="chart-title">${chart.title}</div>
				<div class="chart-content line">
					${numericData
						.map((d: any, i: number) => {
							const height = range > 0 ? ((d.amount - minValue) / range) * 100 : 50;
							return `
							<div class="chart-bar" style="height: ${height}%; background: linear-gradient(to top, #3b82f6, #1d4ed8);">
								<div class="chart-label">${d.month}</div>
								<div class="chart-value">$${d.amount.toFixed(0)}</div>
							</div>
						`;
						})
						.join('')}
				</div>
			</div>
		`;
	}

	function renderDoughnutChart(chart: ChartData) {
		const data = chart.data;
		console.log('Doughnut chart data:', data);
		if (!data || data.length === 0) {
			console.log('No data for doughnut chart:', chart);
			return `<div class="chart-container"><div class="chart-title">${chart.title}</div><div class="chart-placeholder">No data available</div></div>`;
		}

		const total = data.reduce((sum: number, d: any) => sum + d.value, 0);
		if (total === 0) {
			return `<div class="chart-container"><div class="chart-title">${chart.title}</div><div class="chart-placeholder">No data available</div></div>`;
		}
		let currentAngle = 0;

		return `
			<div class="chart-container">
				<div class="chart-title">${chart.title}</div>
				<div class="chart-content doughnut">
					<svg viewBox="0 0 100 100" class="doughnut-svg">
						${data
							.map((d: any, i: number) => {
								const percentage = (d.value / total) * 100;
								const angle = (percentage / 100) * 360;
								const startAngle = currentAngle;
								currentAngle += angle;

								const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];
								const color = colors[i % colors.length];

								const x1 = 50 + 40 * Math.cos(((startAngle - 90) * Math.PI) / 180);
								const y1 = 50 + 40 * Math.sin(((startAngle - 90) * Math.PI) / 180);
								const x2 = 50 + 40 * Math.cos(((startAngle + angle - 90) * Math.PI) / 180);
								const y2 = 50 + 40 * Math.sin(((startAngle + angle - 90) * Math.PI) / 180);

								const largeArcFlag = angle > 180 ? 1 : 0;

								return `
								<path d="M 50 50 L ${x1} ${y1} A 40 40 0 ${largeArcFlag} 1 ${x2} ${y2} Z" 
									  fill="${color}" stroke="white" stroke-width="2"/>
							`;
							})
							.join('')}
					</svg>
					<div class="doughnut-legend">
						${data
							.map((d: any, i: number) => {
								const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];
								const color = colors[i % colors.length];
								const percentage = (d.value / total) * 100;
								return `
								<div class="legend-item">
									<div class="legend-color" style="background: ${color}"></div>
									<div class="legend-text">
										<div>${d.label}</div>
										<div class="legend-value">$${d.value.toFixed(0)} (${percentage.toFixed(1)}%)</div>
									</div>
								</div>
							`;
							})
							.join('')}
					</div>
				</div>
			</div>
		`;
	}

	function renderBarChart(chart: ChartData) {
		const data = chart.data;
		if (!data || data.length === 0) {
			console.log('No data for bar chart:', chart);
			return `<div class="chart-container"><div class="chart-title">${chart.title}</div><div class="chart-placeholder">No data available</div></div>`;
		}

		const maxValue = Math.max(...data.map((d: any) => Math.max(d.budgeted || 0, d.actual || 0)));
		if (maxValue === 0) {
			return `<div class="chart-container"><div class="chart-title">${chart.title}</div><div class="chart-placeholder">No data available</div></div>`;
		}

		return `
			<div class="chart-container">
				<div class="chart-title">${chart.title}</div>
				<div class="chart-content bar-chart">
					${data
						.map((d: any) => {
							const budgetedHeight = maxValue > 0 ? (d.budgeted / maxValue) * 100 : 0;
							const actualHeight = maxValue > 0 ? (d.actual / maxValue) * 100 : 0;

							return `
							<div class="bar-group">
								<div class="bar-label">${d.category}</div>
								<div class="bar-container">
									<div class="bar budgeted" style="height: ${budgetedHeight}%; background: #10b981;"></div>
									<div class="bar actual" style="height: ${actualHeight}%; background: #3b82f6;"></div>
								</div>
								<div class="bar-values">
									<div>Budget: $${d.budgeted.toFixed(0)}</div>
									<div>Actual: $${d.actual.toFixed(0)}</div>
								</div>
							</div>
						`;
						})
						.join('')}
				</div>
			</div>
		`;
	}

	function renderGaugeChart(chart: ChartData) {
		const data = chart.data;
		if (!data) {
			console.log('No data for gauge chart:', chart);
			return `<div class="chart-container"><div class="chart-title">${chart.title}</div><div class="chart-placeholder">No data available</div></div>`;
		}

		const percentage = (data.value / data.max) * 100;
		const angle = (percentage / 100) * 180;

		return `
			<div class="chart-container">
				<div class="chart-title">${chart.title}</div>
				<div class="chart-content gauge">
					<svg viewBox="0 0 100 60" class="gauge-svg">
						<path d="M 10 50 A 40 40 0 0 1 90 50" stroke="#e5e7eb" stroke-width="8" fill="none"/>
						<path d="M 10 50 A 40 40 0 0 1 ${10 + (80 * angle) / 180} ${50 - 40 * Math.sin((angle * Math.PI) / 180)}" 
							  stroke="#3b82f6" stroke-width="8" fill="none"/>
						<text x="50" y="45" text-anchor="middle" class="gauge-text">${data.value.toFixed(1)}%</text>
						<text x="50" y="55" text-anchor="middle" class="gauge-label">${data.label}</text>
					</svg>
				</div>
			</div>
		`;
	}

	function renderDonutChart(chart: ChartData) {
		const data = chart.data;
		if (!data || data.length === 0) {
			console.log('No data for donut chart:', chart);
			return `<div class="chart-container"><div class="chart-title">${chart.title}</div><div class="chart-placeholder">No data available</div></div>`;
		}

		const total = data.reduce((sum: number, d: any) => sum + d.value, 0);
		if (total === 0) {
			return `<div class="chart-container"><div class="chart-title">${chart.title}</div><div class="chart-placeholder">No data available</div></div>`;
		}
		let currentAngle = 0;

		return `
			<div class="chart-container">
				<div class="chart-title">${chart.title}</div>
				<div class="chart-content donut">
					<svg viewBox="0 0 100 100" class="donut-svg">
						${data
							.map((d: any, i: number) => {
								const percentage = (d.value / total) * 100;
								const angle = (percentage / 100) * 360;
								const startAngle = currentAngle;
								currentAngle += angle;

								const colors = ['#3b82f6', '#ef4444', '#10b981'];
								const color = colors[i % colors.length];

								const x1 = 50 + 35 * Math.cos(((startAngle - 90) * Math.PI) / 180);
								const y1 = 50 + 35 * Math.sin(((startAngle - 90) * Math.PI) / 180);
								const x2 = 50 + 35 * Math.cos(((startAngle + angle - 90) * Math.PI) / 180);
								const y2 = 50 + 35 * Math.sin(((startAngle + angle - 90) * Math.PI) / 180);

								const largeArcFlag = angle > 180 ? 1 : 0;

								return `
								<path d="M 50 50 L ${x1} ${y1} A 35 35 0 ${largeArcFlag} 1 ${x2} ${y2} Z" 
									  fill="${color}" stroke="white" stroke-width="3"/>
							`;
							})
							.join('')}
						<circle cx="50" cy="50" r="15" fill="white"/>
						<text x="50" y="55" text-anchor="middle" class="donut-center">Total</text>
					</svg>
					<div class="donut-legend">
						${data
							.map((d: any, i: number) => {
								const colors = ['#3b82f6', '#ef4444', '#10b981'];
								const color = colors[i % colors.length];
								return `
								<div class="legend-item">
									<div class="legend-color" style="background: ${color}"></div>
									<div class="legend-text">
										<div>${d.label}</div>
										<div class="legend-value">$${d.value.toFixed(0)}</div>
									</div>
								</div>
							`;
							})
							.join('')}
					</div>
				</div>
			</div>
		`;
	}

	function renderStackedBarChart(chart: ChartData) {
		const data = chart.data;
		if (!data || data.length === 0) {
			console.log('No data for stacked bar chart:', chart);
			return `<div class="chart-container"><div class="chart-title">${chart.title}</div><div class="chart-placeholder">No data available</div></div>`;
		}

		// For stacked bar charts, we expect data with multiple series
		const maxValue = Math.max(
			...data.map((d: any) => {
				const total = Object.values(d)
					.filter((v) => typeof v === 'number' && v > 0)
					.reduce((sum: number, val: any) => sum + val, 0);
				return total;
			})
		);

		if (maxValue === 0) {
			return `<div class="chart-container"><div class="chart-title">${chart.title}</div><div class="chart-placeholder">No data available</div></div>`;
		}

		return `
			<div class="chart-container">
				<div class="chart-title">${chart.title}</div>
				<div class="chart-content stacked-bar">
					${data
						.map((d: any) => {
							const categories = Object.keys(d).filter(
								(key) => key !== 'label' && key !== 'category' && typeof d[key] === 'number'
							);
							const total = categories.reduce((sum: number, key: string) => sum + d[key], 0);
							const totalHeight = maxValue > 0 ? (total / maxValue) * 100 : 0;

							return `
							<div class="stacked-bar-group">
								<div class="stacked-bar-label">${d.label || d.category || 'Unknown'}</div>
								<div class="stacked-bar-container" style="height: ${totalHeight}%;">
									${categories
										.map((key: string, i: number) => {
											const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
											const color = colors[i % colors.length];
											const height = total > 0 ? (d[key] / total) * 100 : 0;
											return `<div class="stacked-bar-segment" style="height: ${height}%; background: ${color};" title="${key}: $${d[key].toFixed(0)}"></div>`;
										})
										.join('')}
								</div>
								<div class="stacked-bar-value">$${total.toFixed(0)}</div>
							</div>
						`;
						})
						.join('')}
				</div>
			</div>
		`;
	}

	function renderChart(chart: ChartData) {
		// console.log('Rendering chart:', chart);
		switch (chart.type) {
			case 'line':
				return renderLineChart(chart);
			case 'doughnut':
				return renderDoughnutChart(chart);
			case 'bar':
				return renderBarChart(chart);
			case 'gauge':
				return renderGaugeChart(chart);
			case 'donut':
				return renderDonutChart(chart);
			case 'pie':
				return renderDoughnutChart(chart); // Use doughnut renderer for pie charts
			case 'stacked-bar':
				return renderStackedBarChart(chart);
			default:
				console.log('Unknown chart type:', chart.type);
				return `<div class="chart-placeholder">Chart type "${chart.type}" not implemented</div>`;
		}
	}
</script>

<div class="flex h-full flex-col">
	<!-- Chat Messages -->
	<ScrollArea bind:this={scrollArea} class="flex-1 overflow-y-auto p-4">
		<div class="space-y-4 px-4">
			{#each messages as message}
				<div class="flex gap-3 {message.type === 'user' ? 'justify-end' : 'justify-start'}">
					<div
						class="flex max-w-[80%] gap-3 {message.type === 'user'
							? 'flex-row-reverse'
							: 'flex-row'} {message.type === 'user' ? 'mr-16' : 'ml-16'}"
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
								{#if message.type === 'assistant'}
									<div class="text-base">
										{@html marked.parse(message.displayedContent || '')}
									</div>
								{:else}
									<p class="text-base">{message.content}</p>
								{/if}
							</div>

							{#if message.displayedContent === message.content}
								<!-- {console.log('=== CHECKING ADDITIONAL CONTENT ===')}
								{console.log('Message type:', message.type)}
								{console.log('Message actionItems length:', message.actionItems?.length)}
								{console.log('Message insights length:', message.insights?.length)}
								{console.log('Message budgetSummary:', message.budgetSummary)}
								{console.log('Message graphData:', message.graphData)}
								{console.log(
									'Condition result:',
									message.type === 'assistant' &&
										(message.actionItems?.length ||
											message.insights?.length ||
											message.budgetSummary ||
											message.graphData)
								)} -->
								<!-- AI Assistant additional content -->
								{#if message.type === 'assistant' && (message.actionItems?.length || message.insights?.length || message.budgetSummary || message.graphData)}
									<div class="mt-3 max-w-md space-y-3">
										<!-- {console.log('=== TEMPLATE DEBUG ===')}
										{console.log('Message object:', message)}
										{console.log('Message graphData:', message.graphData)}
										{console.log('Message graphData type:', typeof message.graphData)}
										{console.log('Message graphData truthy check:', !!message.graphData)}
										{console.log('Message graphData charts:', message.graphData?.charts)}
										{console.log(
											'Message graphData charts length:',
											message.graphData?.charts?.length
										)} -->
										<!-- Graph Data -->
										{#if message.graphData}
											{console.log('=== INSIDE GRAPH DATA SECTION ===')}
											<div class="graph-data-section">
												<div class="mb-2 flex items-center gap-2">
													<Icon icon="lucide:bar-chart-3" class="h-4 w-4 text-blue-500" />
													<span class="text-sm font-medium">
														{message.insightType
															? message.insightType.charAt(0).toUpperCase() +
																message.insightType.slice(1)
															: 'Financial'} Insights
													</span>
												</div>

												{#each message.graphData.charts as chart}
													{@html renderChart(chart)}
												{/each}

												{#if message.graphData.summary}
													<div class="graph-summary">
														{#each Object.entries(message.graphData.summary) as [key, value]}
															<div class="summary-item">
																<div class="summary-label">
																	{key
																		.replace(/([A-Z])/g, ' $1')
																		.replace(/^./, (str) => str.toUpperCase())}
																</div>
																<div class="summary-value">
																	{#if typeof value === 'number'}
																		${value.toFixed(2)}
																	{:else}
																		{value}
																	{/if}
																</div>
															</div>
														{/each}
													</div>
												{/if}
											</div>
										{/if}

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
																	<div class="text-muted-foreground text-xs">
																		{item.description}
																	</div>
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
																	<div class="text-muted-foreground text-xs">
																		{insight.message}
																	</div>
																</div>
															</div>
														{/each}
													</div>
												</CardContent>
											</Card>
										{/if}
									</div>
								{/if}
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

				{#if isTyping}
					<Button
						type="button"
						onclick={stopTyping}
						class="flex items-center border-none bg-red-600 text-white hover:bg-red-700"
						style="margin-right: 0.5rem;"
					>
						<Icon icon="lucide:stop-circle" class="mr-1 h-4 w-4" />
						Stop
					</Button>
				{/if}
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

<style>
	.chart-container {
		margin: 1rem 0;
		padding: 1rem;
		background: white;
		border-radius: 8px;
		border: 1px solid #e5e7eb;
	}

	.chart-title {
		font-weight: 600;
		margin-bottom: 0.5rem;
		color: #374151;
	}

	.chart-content {
		position: relative;
	}

	.chart-content.line {
		display: flex;
		align-items: end;
		gap: 0.5rem;
		height: 120px;
		padding: 1rem 0;
	}

	.chart-bar {
		flex: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: end;
		min-height: 20px;
		position: relative;
	}

	.chart-label {
		font-size: 0.75rem;
		color: #6b7280;
		margin-top: 0.25rem;
		text-align: center;
	}

	.chart-value {
		font-size: 0.75rem;
		font-weight: 600;
		color: #374151;
		margin-top: 0.25rem;
	}

	.chart-content.doughnut {
		display: flex;
		align-items: center;
		gap: 1rem;
	}

	.doughnut-svg {
		width: 120px;
		height: 120px;
	}

	.doughnut-legend {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.legend-item {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.legend-color {
		width: 12px;
		height: 12px;
		border-radius: 2px;
	}

	.legend-text {
		font-size: 0.75rem;
	}

	.legend-value {
		font-size: 0.625rem;
		color: #6b7280;
	}

	.chart-content.bar-chart {
		display: flex;
		gap: 1rem;
		align-items: end;
		height: 150px;
		padding: 1rem 0;
	}

	.bar-group {
		flex: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.5rem;
	}

	.bar-label {
		font-size: 0.75rem;
		color: #6b7280;
		text-align: center;
	}

	.bar-container {
		display: flex;
		gap: 2px;
		width: 100%;
		height: 100px;
		align-items: end;
	}

	.bar {
		flex: 1;
		min-height: 4px;
		border-radius: 2px;
	}

	.bar-values {
		font-size: 0.625rem;
		color: #6b7280;
		text-align: center;
	}

	.chart-content.gauge {
		display: flex;
		justify-content: center;
		padding: 1rem;
	}

	.gauge-svg {
		width: 120px;
		height: 80px;
	}

	.gauge-text {
		font-size: 0.875rem;
		font-weight: 600;
		fill: #374151;
	}

	.gauge-label {
		font-size: 0.625rem;
		fill: #6b7280;
	}

	.chart-content.donut {
		display: flex;
		align-items: center;
		gap: 1rem;
	}

	.donut-svg {
		width: 120px;
		height: 120px;
	}

	.donut-center {
		font-size: 0.75rem;
		font-weight: 600;
		fill: #374151;
	}

	.donut-legend {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.chart-placeholder {
		padding: 2rem;
		text-align: center;
		color: #6b7280;
		font-style: italic;
	}

	.graph-data-section {
		margin-top: 1rem;
		padding: 1rem;
		background: #f9fafb;
		border-radius: 8px;
		border: 1px solid #e5e7eb;
	}

	.graph-summary {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
		gap: 1rem;
		margin-top: 1rem;
	}

	.summary-item {
		text-align: center;
		padding: 0.5rem;
		background: white;
		border-radius: 4px;
		border: 1px solid #e5e7eb;
	}

	.summary-label {
		font-size: 0.75rem;
		color: #6b7280;
		margin-bottom: 0.25rem;
	}

	.summary-value {
		font-size: 1rem;
		font-weight: 600;
		color: #374151;
	}

	.chart-content.stacked-bar {
		display: flex;
		gap: 1rem;
		align-items: end;
		height: 150px;
		padding: 1rem 0;
	}

	.stacked-bar-group {
		flex: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.5rem;
	}

	.stacked-bar-label {
		font-size: 0.75rem;
		color: #6b7280;
		text-align: center;
	}

	.stacked-bar-container {
		width: 100%;
		display: flex;
		flex-direction: column;
		border-radius: 2px;
		overflow: hidden;
	}

	.stacked-bar-segment {
		flex: 1;
		min-height: 4px;
	}

	.stacked-bar-value {
		font-size: 0.625rem;
		color: #6b7280;
		text-align: center;
	}
</style>
