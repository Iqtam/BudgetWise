<script lang="ts">
	import { onMount } from 'svelte';
	import {
		Card,
		CardContent,
		CardDescription,
		CardHeader,
		CardTitle
	} from '$lib/components/ui/card';
	import { Badge } from '$lib/components/ui/badge';
	import Icon from '@iconify/svelte';
	import FinancialChart from '$lib/components/FinancialChart.svelte';
	import RecentTransactions from '$lib/components/RecentTransactions.svelte';
	import QuickActions from '$lib/components/QuickActions.svelte';
	import { balanceService } from '$lib/services/balance';
	import { transactionService } from '$lib/services/transactions';
	import { debtService } from '$lib/services/debts';
	import { savingService } from '$lib/services/savings';
	import { firebaseUser } from '$lib/stores/auth';

	let loading = $state(true);
	let error = $state<string | null>(null);
	let balance = $state(0);
	let monthlyIncome = $state(0);
	let monthlyExpenses = $state(0);
	let recentTransactions = $state<any[]>([]);
	let debts = $state<any[]>([]);
	let savings = $state<any[]>([]);
	let chartData = $state<any[]>([]);
	
	// Previous month data for comparisons
	let previousMonthIncome = $state(0);
	let previousMonthExpenses = $state(0);
	let previousMonthNet = $state(0);
	let previousMonthBalance = $state(0);
	
	let dataLoaded = $state({
		balance: false,
		transactions: false,
		debts: false,
		savings: false
	});

	// Dynamic subtitle based on available data
	let chartSubtitle = $derived(chartData.length === 0 ? "No transaction data available" : 
					   chartData.length === 1 ? "Your spending pattern this month" :
					   `Your spending patterns over the last ${chartData.length} months`);

	// Calculate percentage changes
	let incomeChange = $derived(previousMonthIncome > 0 ? ((monthlyIncome - previousMonthIncome) / previousMonthIncome) * 100 : 0);
	let expensesChange = $derived(previousMonthExpenses > 0 ? ((monthlyExpenses - previousMonthExpenses) / previousMonthExpenses) * 100 : 0);
	let netChange = $derived(previousMonthNet !== 0 ? ((monthlyIncome - monthlyExpenses - previousMonthNet) / Math.abs(previousMonthNet)) * 100 : 0);
	let balanceChange = $derived(previousMonthBalance > 0 ? ((balance - previousMonthBalance) / previousMonthBalance) * 100 : 0);

	// Function to calculate monthly data for the past 6 months
	function calculateMonthlyData(transactions: any[]) {
		const monthlyData = [];
		const currentDate = new Date();
		
		// Generate last 6 months
		for (let i = 5; i >= 0; i--) {
			const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
			const monthName = date.toLocaleDateString('en-US', { month: 'short' });
			const monthYear = date.getFullYear();
			const monthIndex = date.getMonth();
			
			// Filter transactions for this month
			const monthTransactions = transactions.filter(t => {
				const transactionDate = new Date(t.date);
				return transactionDate.getMonth() === monthIndex && 
					   transactionDate.getFullYear() === monthYear;
			});
			
			// Calculate income and expenses for this month
			const income = monthTransactions
				.filter(t => t.type === 'income')
				.reduce((sum, t) => sum + Math.abs(t.amount), 0);
				
			const expenses = monthTransactions
				.filter(t => t.type === 'expense')
				.reduce((sum, t) => sum + Math.abs(t.amount), 0);
			
			// Only include months that have data
			if (income > 0 || expenses > 0) {
				monthlyData.push({
					month: monthName,
					income: income,
					expenses: expenses
				});
			}
		}
		
		return monthlyData;
	}

	// Function to get fallback chart data when backend is not available
	function getFallbackChartData() {
		const currentDate = new Date();
		const fallbackData = [];
		
		// Generate last 6 months with sample data
		for (let i = 5; i >= 0; i--) {
			const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
			const monthName = date.toLocaleDateString('en-US', { month: 'short' });
			
			// Generate realistic sample data
			const baseIncome = 3500 + Math.random() * 1000;
			const baseExpenses = 1200 + Math.random() * 800;
			
			fallbackData.push({
				month: monthName,
				income: Math.round(baseIncome),
				expenses: Math.round(baseExpenses)
			});
		}
		
		return fallbackData;
	}

	onMount(async () => {
		if ($firebaseUser) {
			try {
				loading = true;
				error = null;
				
				// Reset data loaded states
				dataLoaded = {
					balance: false,
					transactions: false,
					debts: false,
					savings: false
				};
				
				// Set fallback chart data initially
				chartData = getFallbackChartData();
				
				// Load all data in parallel for better performance
				const loadData = async () => {
					// Add timeout to prevent hanging
					const timeout = new Promise((_, reject) => 
						setTimeout(() => reject(new Error('Request timeout')), 10000)
					);

					const promises = [
						// Load balance
						(async () => {
							try {
								const balanceData = await balanceService.getBalance();
								balance = balanceData.balance || 0;
								dataLoaded.balance = true;
							} catch (e) {
								console.error('Error loading balance:', e);
								dataLoaded.balance = true; // Mark as loaded even if failed
							}
						})(),

						// Load transactions
						(async () => {
							try {
								const transactions = await transactionService.getAllTransactions();
								
								// Calculate current month data
								const currentMonth = new Date().getMonth();
								const currentYear = new Date().getFullYear();
								
								const currentMonthTransactions = transactions.filter(t => {
									const transactionDate = new Date(t.date);
									return transactionDate.getMonth() === currentMonth && 
										   transactionDate.getFullYear() === currentYear;
								});

								monthlyIncome = currentMonthTransactions
									.filter(t => t.type === 'income')
									.reduce((sum, t) => sum + Math.abs(t.amount), 0);

								monthlyExpenses = currentMonthTransactions
									.filter(t => t.type === 'expense')
									.reduce((sum, t) => sum + Math.abs(t.amount), 0);

								// Calculate previous month data
								const previousMonth = currentMonth === 0 ? 11 : currentMonth - 1;
								const previousYear = currentMonth === 0 ? currentYear - 1 : currentYear;
								
								const previousMonthTransactions = transactions.filter(t => {
									const transactionDate = new Date(t.date);
									return transactionDate.getMonth() === previousMonth && 
										   transactionDate.getFullYear() === previousYear;
								});

								previousMonthIncome = previousMonthTransactions
									.filter(t => t.type === 'income')
									.reduce((sum, t) => sum + Math.abs(t.amount), 0);

								previousMonthExpenses = previousMonthTransactions
									.filter(t => t.type === 'expense')
									.reduce((sum, t) => sum + Math.abs(t.amount), 0);

								previousMonthNet = previousMonthIncome - previousMonthExpenses;

								// Get recent transactions (last 5)
								recentTransactions = transactions
									.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
									.slice(0, 5);
								
								// Calculate chart data for the past 6 months
								chartData = calculateMonthlyData(transactions);
								
								dataLoaded.transactions = true;
							} catch (e) {
								console.error('Error loading transactions:', e);
								dataLoaded.transactions = true; // Mark as loaded even if failed
							}
						})(),

						// Load debts
						(async () => {
							try {
								const debtsData = await debtService.getAllDebts();
								debts = debtsData;
								dataLoaded.debts = true;
							} catch (e) {
								console.error('Error loading debts:', e);
								dataLoaded.debts = true; // Mark as loaded even if failed
							}
						})(),

						// Load savings
						(async () => {
							try {
								const savingsData = await savingService.getAllSavings();
								savings = savingsData;
								dataLoaded.savings = true;
							} catch (e) {
								console.error('Error loading savings:', e);
								dataLoaded.savings = true; // Mark as loaded even if failed
							}
						})()
					];

					// Wait for all promises to complete (either success or failure) with timeout
					await Promise.race([
						Promise.allSettled(promises),
						timeout
					]);
				};

				await loadData();
			} catch (e) {
				error = e instanceof Error ? e.message : 'Failed to load dashboard data';
				console.error('Dashboard loading error:', e);
			} finally {
				loading = false;
			}
		} else {
			// Set fallback data when no user is logged in
			chartData = getFallbackChartData();
			loading = false;
		}

		// Set up visibility change listener for refreshing data when returning to dashboard
		const handleVisibilityChange = () => {
			if (!document.hidden && $firebaseUser && !loading) {
				// Refresh data when page becomes visible again
				refreshDashboard();
			}
		};

		document.addEventListener('visibilitychange', handleVisibilityChange);

		return () => {
			document.removeEventListener('visibilitychange', handleVisibilityChange);
		};
	});

	// Reactive statement to reload data when user changes
	$effect(() => {
		if ($firebaseUser && !loading) {
			// This will trigger a reload when the user changes
			// but only if we're not already loading
		}
	});

	// Function to refresh dashboard data
	async function refreshDashboard() {
		if ($firebaseUser && !loading) {
			loading = true;
			error = null;
			
			// Reset data loaded states
			dataLoaded = {
				balance: false,
				transactions: false,
				debts: false,
				savings: false
			};
			
			try {
				// Load all data in parallel for better performance
				const loadData = async () => {
					// Add timeout to prevent hanging
					const timeout = new Promise((_, reject) => 
						setTimeout(() => reject(new Error('Request timeout')), 10000)
					);

					const promises = [
						// Load balance
						(async () => {
							try {
								const balanceData = await balanceService.getBalance();
								balance = balanceData.balance || 0;
								dataLoaded.balance = true;
							} catch (e) {
								console.error('Error loading balance:', e);
								dataLoaded.balance = true; // Mark as loaded even if failed
							}
						})(),

						// Load transactions
						(async () => {
							try {
								const transactions = await transactionService.getAllTransactions();
								
								// Calculate current month data
								const currentMonth = new Date().getMonth();
								const currentYear = new Date().getFullYear();
								
								const currentMonthTransactions = transactions.filter(t => {
									const transactionDate = new Date(t.date);
									return transactionDate.getMonth() === currentMonth && 
										   transactionDate.getFullYear() === currentYear;
								});

								monthlyIncome = currentMonthTransactions
									.filter(t => t.type === 'income')
									.reduce((sum, t) => sum + Math.abs(t.amount), 0);

								monthlyExpenses = currentMonthTransactions
									.filter(t => t.type === 'expense')
									.reduce((sum, t) => sum + Math.abs(t.amount), 0);

								// Calculate previous month data
								const previousMonth = currentMonth === 0 ? 11 : currentMonth - 1;
								const previousYear = currentMonth === 0 ? currentYear - 1 : currentYear;
								
								const previousMonthTransactions = transactions.filter(t => {
									const transactionDate = new Date(t.date);
									return transactionDate.getMonth() === previousMonth && 
										   transactionDate.getFullYear() === previousYear;
								});

								previousMonthIncome = previousMonthTransactions
									.filter(t => t.type === 'income')
									.reduce((sum, t) => sum + Math.abs(t.amount), 0);

								previousMonthExpenses = previousMonthTransactions
									.filter(t => t.type === 'expense')
									.reduce((sum, t) => sum + Math.abs(t.amount), 0);

								previousMonthNet = previousMonthIncome - previousMonthExpenses;

								// Get recent transactions (last 5)
								recentTransactions = transactions
									.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
									.slice(0, 5);
								
								// Calculate chart data for the past 6 months
								chartData = calculateMonthlyData(transactions);
								
								dataLoaded.transactions = true;
							} catch (e) {
								console.error('Error loading transactions:', e);
								dataLoaded.transactions = true; // Mark as loaded even if failed
							}
						})(),

						// Load debts
						(async () => {
							try {
								const debtsData = await debtService.getAllDebts();
								debts = debtsData;
								dataLoaded.debts = true;
							} catch (e) {
								console.error('Error loading debts:', e);
								dataLoaded.debts = true; // Mark as loaded even if failed
							}
						})(),

						// Load savings
						(async () => {
							try {
								const savingsData = await savingService.getAllSavings();
								savings = savingsData;
								dataLoaded.savings = true;
							} catch (e) {
								console.error('Error loading savings:', e);
								dataLoaded.savings = true; // Mark as loaded even if failed
							}
						})()
					];

					// Wait for all promises to complete (either success or failure) with timeout
					await Promise.race([
						Promise.allSettled(promises),
						timeout
					]);
				};

				await loadData();
			} catch (e) {
				error = e instanceof Error ? e.message : 'Failed to load dashboard data';
				console.error('Dashboard loading error:', e);
			} finally {
				loading = false;
			}
		}
	}

	// Listen for page visibility changes to refresh data when returning to dashboard
	// This is now handled in the main onMount function above

	// Format currency
	function formatCurrency(amount: number): string {
		return new Intl.NumberFormat('en-US', {
			style: 'currency',
			currency: 'USD',
			minimumFractionDigits: 2,
			maximumFractionDigits: 2
		}).format(amount);
	}
</script>

{#if loading}
	<div class="flex h-64 items-center justify-center">
		<div class="flex flex-col items-center space-y-4">
			<div class="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
			<p class="text-gray-400">Loading dashboard...</p>
		</div>
	</div>
{:else if error}
	<div class="flex h-64 items-center justify-center">
		<div class="text-center">
			<Icon icon="lucide:alert-circle" class="mx-auto h-12 w-12 text-red-400" />
			<h3 class="mt-2 text-lg font-medium text-white">Error loading dashboard</h3>
			<p class="mt-1 text-sm text-gray-400">{error}</p>
			<button 
				class="mt-4 rounded-md bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
				on:click={() => window.location.reload()}
			>
				Retry
			</button>
		</div>
	</div>
{:else}
	<div class="flex-1 space-y-6 p-6">
		<!-- Financial Overview Cards -->
		<div class="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
			<Card class="border-gray-800 bg-gray-900">
				<CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
					<CardTitle class="text-sm font-medium text-white">Total Balance</CardTitle>
					<Icon icon="lucide:dollar-sign" class="h-4 w-4 text-gray-400" />
				</CardHeader>
				<CardContent>
					<div class="text-2xl font-bold text-white">{formatCurrency(balance)}</div>
					<div class="flex items-center text-xs text-gray-400">
						<Icon icon="lucide:trending-up" class="mr-1 h-3 w-3 text-green-400" />
						Current balance
					</div>
					{#if previousMonthBalance > 0}
						<div class="text-xs {balanceChange >= 0 ? 'text-green-400' : 'text-red-400'} mt-1">
							{balanceChange >= 0 ? '+' : ''}{balanceChange.toFixed(1)}% vs last month
						</div>
					{/if}
				</CardContent>
			</Card>

			<Card class="border-gray-800 bg-gray-900">
				<CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
					<CardTitle class="text-sm font-medium text-white">Monthly Income</CardTitle>
					<Icon icon="lucide:trending-up" class="h-4 w-4 text-gray-400" />
				</CardHeader>
				<CardContent>
					<div class="text-2xl font-bold text-green-400">{formatCurrency(monthlyIncome)}</div>
					<div class="flex items-center text-xs text-gray-400">
						<Icon icon="lucide:trending-up" class="mr-1 h-3 w-3 text-green-400" />
						This month
					</div>
					{#if previousMonthIncome > 0}
						<div class="text-xs {incomeChange >= 0 ? 'text-green-400' : 'text-red-400'} mt-1">
							{incomeChange >= 0 ? '+' : ''}{incomeChange.toFixed(1)}% vs last month
						</div>
					{/if}
				</CardContent>
			</Card>

			<Card class="border-gray-800 bg-gray-900">
				<CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
					<CardTitle class="text-sm font-medium text-white">Monthly Expenses</CardTitle>
					<Icon icon="lucide:credit-card" class="h-4 w-4 text-gray-400" />
				</CardHeader>
				<CardContent>
					<div class="text-2xl font-bold text-red-400">{formatCurrency(monthlyExpenses)}</div>
					<div class="flex items-center text-xs text-gray-400">
						<Icon icon="lucide:trending-down" class="mr-1 h-3 w-3 text-red-400" />
						This month
					</div>
					{#if previousMonthExpenses > 0}
						<div class="text-xs {expensesChange <= 0 ? 'text-green-400' : 'text-red-400'} mt-1">
							{expensesChange >= 0 ? '+' : ''}{expensesChange.toFixed(1)}% vs last month
						</div>
					{/if}
				</CardContent>
			</Card>

			<Card class="border-gray-800 bg-gray-900">
				<CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
					<CardTitle class="text-sm font-medium text-white">Net Income</CardTitle>
					<Icon icon="lucide:target" class="h-4 w-4 text-gray-400" />
				</CardHeader>
				<CardContent>
					<div class="text-2xl font-bold {monthlyIncome - monthlyExpenses >= 0 ? 'text-green-400' : 'text-red-400'}">
						{formatCurrency(monthlyIncome - monthlyExpenses)}
					</div>
					<div class="flex items-center text-xs text-gray-400">
						<Icon icon="lucide:trending-up" class="mr-1 h-3 w-3 text-green-400" />
						This month
					</div>
					{#if previousMonthNet !== 0}
						<div class="text-xs {netChange >= 0 ? 'text-green-400' : 'text-red-400'} mt-1">
							{netChange >= 0 ? '+' : ''}{netChange.toFixed(1)}% vs last month
						</div>
					{/if}
				</CardContent>
			</Card>
		</div>

		<!-- Budget Overview -->
		<div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
			<Card class="col-span-2 border-gray-800 bg-gray-900">
				<CardHeader>
					<CardTitle class="text-white">Spending Overview</CardTitle>
					<CardDescription class="text-gray-400">
						{chartSubtitle}
					</CardDescription>
				</CardHeader>
				<CardContent>
					<FinancialChart data={chartData} loading={loading} />
				</CardContent>
			</Card>

			<Card class="border-gray-800 bg-gray-900">
				<CardHeader>
					<CardTitle class="text-white">Quick Stats</CardTitle>
					<CardDescription class="text-gray-400">This month's summary</CardDescription>
				</CardHeader>
				<CardContent class="space-y-4">
					<div class="space-y-2">
						<div class="flex items-center justify-between text-sm">
							<span class="text-gray-300">Income</span>
							<span class="text-green-400">{formatCurrency(monthlyIncome)}</span>
						</div>
					</div>

					<div class="space-y-2">
						<div class="flex items-center justify-between text-sm">
							<span class="text-gray-300">Expenses</span>
							<span class="text-red-400">{formatCurrency(monthlyExpenses)}</span>
						</div>
					</div>

					<div class="space-y-2">
						<div class="flex items-center justify-between text-sm">
							<span class="text-gray-300">Net</span>
							<span class="{monthlyIncome - monthlyExpenses >= 0 ? 'text-green-400' : 'text-red-400'}">
								{formatCurrency(monthlyIncome - monthlyExpenses)}
							</span>
						</div>
					</div>
				</CardContent>
			</Card>
		</div>

		<!-- Recent Activity and Quick Actions -->
		<div class="grid gap-4 md:grid-cols-2">
			<RecentTransactions />
			<QuickActions />
		</div>

		<!-- Debt and Savings Summary -->
		<div class="grid gap-4 md:grid-cols-2">
			<Card class="border-gray-800 bg-gray-900">
				<CardHeader>
					<CardTitle class="flex items-center gap-2 text-white">
						<Icon icon="lucide:wallet" class="h-5 w-5" />
						Debt Summary
					</CardTitle>
				</CardHeader>
				<CardContent class="space-y-4">
					{#if debts.length > 0}
						{#each debts as debt}
							<div class="space-y-1">
								<div class="flex items-center justify-between">
									<span class="text-sm text-gray-300">{debt.description}</span>
									<span class="font-medium text-white">{formatCurrency(parseFloat(debt.amount) || 0)}</span>
								</div>
								<div class="flex items-center justify-between text-xs text-gray-500">
									<span>Due: {new Date(debt.expiration_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
									<span class="text-red-400">{debt.interest_rate}% APR</span>
								</div>
							</div>
						{/each}
						<div class="border-t border-gray-800 pt-4">
							<div class="flex items-center justify-between font-semibold">
								<span class="text-gray-300">Total Debt</span>
								<span class="text-red-400">
									{formatCurrency(debts.reduce((sum: number, debt: any) => {
										const amount = parseFloat(debt.amount) || 0;
										return sum + amount;
									}, 0))}
								</span>
							</div>
						</div>
					{:else}
						<div class="text-center py-8">
							<Icon icon="lucide:wallet" class="mx-auto h-8 w-8 text-gray-400" />
							<p class="mt-2 text-sm text-gray-400">No debts recorded</p>
							<p class="text-xs text-gray-500">Great job staying debt-free!</p>
						</div>
					{/if}
				</CardContent>
			</Card>

			<Card class="border-gray-800 bg-gray-900">
				<CardHeader>
					<CardTitle class="flex items-center gap-2 text-white">
						<Icon icon="lucide:piggy-bank" class="h-5 w-5" />
						Savings Summary
					</CardTitle>
				</CardHeader>
				<CardContent class="space-y-4">
					{#if savings.length > 0}
						{#each savings as saving}
							<div class="space-y-1">
								<div class="flex items-center justify-between">
									<span class="text-sm text-gray-300">{saving.description}</span>
									<span class="font-medium text-white">{formatCurrency(parseFloat(saving.start_amount) || 0)}</span>
								</div>
								<div class="flex items-center justify-between text-xs text-gray-500">
									<span>Target: {formatCurrency(parseFloat(saving.target_amount) || 0)}</span>
									<span>End: {saving.end_date ? new Date(saving.end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'No deadline'}</span>
								</div>
							</div>
						{/each}
						<div class="border-t border-gray-800 pt-4">
							<div class="flex items-center justify-between font-semibold">
								<span class="text-gray-300">Total Savings</span>
								<span class="text-green-400">
									{formatCurrency(savings.reduce((sum: number, saving: any) => {
										const amount = parseFloat(saving.start_amount) || 0;
										return sum + amount;
									}, 0))}
								</span>
							</div>
						</div>
					{:else}
						<div class="text-center py-8">
							<Icon icon="lucide:piggy-bank" class="mx-auto h-8 w-8 text-gray-400" />
							<p class="mt-2 text-sm text-gray-400">No savings goals set</p>
							<p class="text-xs text-gray-500">Create savings goals to start building wealth</p>
						</div>
					{/if}
				</CardContent>
			</Card>
		</div>
	</div>
{/if}
