<script lang="ts">
	// All imports and state from analytics/+page.svelte
	import Icon from '@iconify/svelte';
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Badge } from '$lib/components/ui/badge';
	import { Tabs, TabsContent, TabsList, TabsTrigger } from '$lib/components/ui/tabs';
	import { onMount } from 'svelte';
	import { balanceService } from '$lib/services/balance';
	import { transactionService } from '$lib/services/transactions';
	import { debtService } from '$lib/services/debts';
	import { savingService } from '$lib/services/savings';
	import { categoryService } from '$lib/services/categories';
	import { firebaseUser } from '$lib/stores/auth';

	// State variables for real data
	let loading = $state(true);
	let error = $state<string | null>(null);
	let balance = $state(0);
	let transactions = $state<any[]>([]);
	let debts = $state<any[]>([]);
	let savings = $state<any[]>([]);
	let monthlyIncome = $state(0);
	let categories = $state<any[]>([]);
	
	// Calculated metrics
	let netWorth = $state(0);
	let avgMonthlySavings = $state(0);
	let expenseRatio = $state(0);
	let financialHealthScore = $state(0);
	let netWorthChange = $state(0);
	let expenseRatioChange = $state(0);
	
	// Chart data
	let monthlyData = $state<any[]>([]);
	let categoryData = $state<any[]>([]);
	let weeklySpending = $state<any[]>([]);
	let savingsGrowth = $state<any[]>([]);
	let hoveredCategory = $state<string | null>(null);

	let activeTab = $state('overview');
	let mounted = $state(false);
	
	// Utility function to format currency
	function formatCurrency(amount: number): string {
		return new Intl.NumberFormat('en-US', {
			style: 'currency',
			currency: 'USD',
			minimumFractionDigits: 0,
			maximumFractionDigits: 0
		}).format(amount);
	}
	
	onMount(() => {
		mounted = true;
		if ($firebaseUser) {
			loadAnalyticsData();
		}
	});

	async function loadAnalyticsData() {
		try {
			loading = true;
			error = null;

			// Load all data in parallel
			const [balanceData, transactionsData, debtsData, savingsData, categoriesData] = await Promise.allSettled([
				balanceService.getBalance(),
				transactionService.getAllTransactions(),
				debtService.getAllDebts(),
				savingService.getAllSavings(),
				categoryService.getAllCategories()
			]);

			// Set basic data
			balance = balanceData.status === 'fulfilled' ? balanceData.value.balance || 0 : 0;
			transactions = transactionsData.status === 'fulfilled' ? transactionsData.value : [];
			debts = debtsData.status === 'fulfilled' ? debtsData.value : [];
			savings = savingsData.status === 'fulfilled' ? savingsData.value : [];
			categories = categoriesData.status === 'fulfilled' ? categoriesData.value : [];

			// Calculate metrics
			calculateMetrics();
			generateChartData();

		} catch (e) {
			console.error('Error loading analytics data:', e);
			error = 'Failed to load analytics data';
		} finally {
			loading = false;
		}
	}

	function calculateMetrics() {
		// Calculate Net Worth (Balance + Savings - Debts)
		const totalSavings = savings.reduce((sum, s) => sum + (parseFloat(s.start_amount) || 0), 0);
		const totalDebts = debts.reduce((sum, d) => sum + (parseFloat(d.amount) || 0), 0);
		netWorth = balance + totalSavings - totalDebts;

		// Calculate Average Monthly Savings
		const currentMonth = new Date().getMonth();
		const currentYear = new Date().getFullYear();
		const monthlyTransactions = transactions.filter(t => {
			const transactionDate = new Date(t.date);
			return transactionDate.getMonth() === currentMonth && 
				   transactionDate.getFullYear() === currentYear;
		});

		monthlyIncome = monthlyTransactions
			.filter(t => t.type === 'income')
			.reduce((sum, t) => sum + Math.abs(t.amount), 0);

		const monthlyExpenses = monthlyTransactions
			.filter(t => t.type === 'expense')
			.reduce((sum, t) => sum + Math.abs(t.amount), 0);

		avgMonthlySavings = monthlyIncome - monthlyExpenses;

		// Calculate Expense Ratio
		expenseRatio = monthlyIncome > 0 ? (monthlyExpenses / monthlyIncome) * 100 : 0;

		// Calculate Financial Health Score (0-100)
		let score = 100;
		
		// Deduct points for high debt ratio
		if (totalDebts > 0) {
			const debtRatio = (totalDebts / netWorth) * 100;
			if (debtRatio > 50) score -= 30;
			else if (debtRatio > 30) score -= 20;
			else if (debtRatio > 10) score -= 10;
		}

		// Deduct points for low savings rate
		if (monthlyIncome > 0) {
			const savingsRate = (avgMonthlySavings / monthlyIncome) * 100;
			if (savingsRate < 10) score -= 25;
			else if (savingsRate < 20) score -= 15;
			else if (savingsRate < 30) score -= 5;
		}

		// Add points for good expense ratio
		if (expenseRatio < 60) score += 10;
		else if (expenseRatio > 80) score -= 15;

		financialHealthScore = Math.max(0, Math.min(100, score));

		// Calculate month-over-month changes based on real data
		const previousMonth = new Date(currentYear, currentMonth - 1, 1);
		const previousMonthTransactions = transactions.filter(t => {
			const transactionDate = new Date(t.date);
			return transactionDate.getMonth() === previousMonth.getMonth() && 
				   transactionDate.getFullYear() === previousMonth.getFullYear();
		});

		const previousMonthIncome = previousMonthTransactions
			.filter(t => t.type === 'income')
			.reduce((sum, t) => sum + Math.abs(t.amount), 0);

		const previousMonthExpenses = previousMonthTransactions
			.filter(t => t.type === 'expense')
			.reduce((sum, t) => sum + Math.abs(t.amount), 0);

		const previousMonthSavings = previousMonthIncome - previousMonthExpenses;
		const previousExpenseRatio = previousMonthIncome > 0 ? (previousMonthExpenses / previousMonthIncome) * 100 : 0;

		// Calculate percentage changes
		netWorthChange = previousMonthSavings > 0 ? ((avgMonthlySavings - previousMonthSavings) / previousMonthSavings) * 100 : 0;
		expenseRatioChange = previousExpenseRatio > 0 ? expenseRatio - previousExpenseRatio : 0;
	}

	function generateChartData() {
		// Generate monthly data for the last 6 months
		const currentDate = new Date();
		monthlyData = [];

		for (let i = 5; i >= 0; i--) {
			const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
			const monthName = date.toLocaleDateString('en-US', { month: 'short' });
			const monthYear = date.getFullYear();
			const monthIndex = date.getMonth();

			const monthTransactions = transactions.filter(t => {
				const transactionDate = new Date(t.date);
				return transactionDate.getMonth() === monthIndex && 
					   transactionDate.getFullYear() === monthYear;
			});

			const income = monthTransactions
				.filter(t => t.type === 'income')
				.reduce((sum, t) => sum + Math.abs(t.amount), 0);

			const expenses = monthTransactions
				.filter(t => t.type === 'expense')
				.reduce((sum, t) => sum + Math.abs(t.amount), 0);

			const savings = income - expenses;

			if (income > 0 || expenses > 0) {
				monthlyData.push({
					month: monthName,
					income: income,
					expenses: expenses,
					savings: savings
				});
			}
		}

		// Generate category data from current month transactions
		const currentMonth = new Date().getMonth();
		const currentYear = new Date().getFullYear();
		const currentMonthTransactions = transactions.filter(t => {
			const transactionDate = new Date(t.date);
			return transactionDate.getMonth() === currentMonth && 
				   transactionDate.getFullYear() === currentYear &&
				   t.type === 'expense';
		});

		// Group by category name instead of category_id
		const categoryMap = new Map();
		currentMonthTransactions.forEach(t => {
			const categoryName = categoryService.getCategoryName(t.category_id, categories);
			categoryMap.set(categoryName, (categoryMap.get(categoryName) || 0) + Math.abs(t.amount));
		});

		const colors = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#00ff88', '#ff0088'];
		categoryData = Array.from(categoryMap.entries()).map(([name, value], index) => ({
			name,
			value,
			color: colors[index % colors.length]
		}));

		// Generate weekly spending data from current month transactions
		// Group transactions by day of the week across the current month
		const dailyData = new Map();
		const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
		
		currentMonthTransactions.forEach(t => {
			const transactionDate = new Date(t.date);
			const dayOfWeek = dayNames[transactionDate.getDay()];
			dailyData.set(dayOfWeek, (dailyData.get(dayOfWeek) || 0) + Math.abs(t.amount));
		});

		// Fill in missing days with 0
		weeklySpending = [];
		dayNames.forEach(dayName => {
			weeklySpending.push({
				week: dayName,
				amount: dailyData.get(dayName) || 0
			});
		});

		// Generate savings growth data
		savingsGrowth = monthlyData.map((data, index) => ({
			month: data.month,
			amount: data.savings
		}));
	}
</script>

<div class="flex-1 space-y-6 p-6">
	<!-- Key Metrics -->
	<div class="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
		<Card class="border-gray-800 bg-gray-900">
			<CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
				<CardTitle class="text-sm font-medium text-gray-300">Net Worth</CardTitle>
				<Icon icon="lucide:trending-up" class="h-4 w-4 text-gray-400" />
			</CardHeader>
			<CardContent>
				<div class="text-2xl font-bold text-white">{formatCurrency(netWorth)}</div>
				<p class="text-xs text-gray-400">
					<span class="inline-flex items-center text-green-600">
						<Icon icon="lucide:trending-up" class="mr-1 h-3 w-3" />
						+{netWorthChange.toFixed(1)}%
					</span>
					from last month
				</p>
			</CardContent>
		</Card>

		<Card class="border-gray-800 bg-gray-900">
			<CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
				<CardTitle class="text-sm font-medium text-gray-300">Avg Monthly Savings</CardTitle>
				<Icon icon="lucide:dollar-sign" class="h-4 w-4 text-gray-400" />
			</CardHeader>
			<CardContent>
				<div class="text-2xl font-bold text-white">{formatCurrency(avgMonthlySavings)}</div>
				{#if monthlyIncome > 0}
					<p class="text-xs text-gray-400">{((avgMonthlySavings / monthlyIncome) * 100).toFixed(0)}% of income</p>
				{:else}
					<p class="text-xs text-gray-400">No income data</p>
				{/if}
			</CardContent>
		</Card>

		<Card class="border-gray-800 bg-gray-900">
			<CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
				<CardTitle class="text-sm font-medium text-gray-300">Expense Ratio</CardTitle>
				<Icon icon="lucide:trending-down" class="h-4 w-4 text-gray-400" />
			</CardHeader>
			<CardContent>
				<div class="text-2xl font-bold text-white">{expenseRatio.toFixed(0)}%</div>
				<p class="text-xs text-gray-400">
					<span class="inline-flex items-center text-green-600">
						<Icon icon="lucide:trending-down" class="mr-1 h-3 w-3" />
						{expenseRatioChange.toFixed(1)}%
					</span>
					improvement
				</p>
			</CardContent>
		</Card>

		<Card class="border-gray-800 bg-gray-900">
			<CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
				<CardTitle class="text-sm font-medium text-gray-300">Financial Health</CardTitle>
				<Icon icon="lucide:calendar" class="h-4 w-4 text-gray-400" />
			</CardHeader>
			<CardContent>
				<div class="text-2xl font-bold text-white">
					{financialHealthScore >= 90 ? 'Excellent' : 
					 financialHealthScore >= 80 ? 'Good' : 
					 financialHealthScore >= 70 ? 'Fair' : 
					 financialHealthScore >= 60 ? 'Poor' : 'Critical'}
				</div>
				<Badge variant="default" class="mt-1">Score: {financialHealthScore.toFixed(0)}/100</Badge>
			</CardContent>
		</Card>
	</div>

	<Tabs bind:value={activeTab} class="space-y-4">
		<TabsList class="border-gray-800 bg-gray-900">
			<TabsTrigger value="overview" class="text-gray-300 data-[state=active]:bg-gray-800"
				>Overview</TabsTrigger
			>
			<TabsTrigger value="spending" class="text-gray-300 data-[state=active]:bg-gray-800"
				>Spending Analysis</TabsTrigger
			>
			<TabsTrigger value="income" class="text-gray-300 data-[state=active]:bg-gray-800"
				>Income Trends</TabsTrigger
			>
			<TabsTrigger value="savings" class="text-gray-300 data-[state=active]:bg-gray-800"
				>Savings Growth</TabsTrigger
			>
		</TabsList>

		<TabsContent value="overview" class="space-y-4">
			<div class="grid gap-4 md:grid-cols-2">
				<Card class="border-gray-800 bg-gray-900">
					<CardHeader>
						<CardTitle class="text-white">Income vs Expenses</CardTitle>
						<p class="text-sm text-gray-400">Monthly comparison over the last {Math.min(monthlyData.length, 6)} months</p>
					</CardHeader>
					<CardContent>
						{#if mounted}
							<div class="h-[300px] w-full">
								<!-- Manual Bar Chart Implementation -->
								<div class="flex h-[250px] items-end justify-between px-4 py-2">
									{#each monthlyData as data, i}
										<div class="flex flex-1 flex-col items-center">
											<div class="mb-2 flex items-end space-x-1">
												<!-- Income Bar -->
												<div class="relative">
													<div
														class="w-6 rounded-t transition-all"
														style="height: {(data.income / 6000) *
															200}px; background-color: #10b981;"
													></div>
													<div
														class="absolute -top-6 left-1/2 -translate-x-1/2 transform text-xs font-medium text-green-600"
													>
														${data.income}
													</div>
												</div>
												<!-- Expenses Bar -->
												<div class="relative">
													<div
														class="w-6 rounded-t transition-all"
														style="height: {(data.expenses / 6000) *
															200}px; background-color: #ef4444;"
													></div>
													<div
														class="absolute -top-6 left-1/2 -translate-x-1/2 transform text-xs font-medium text-red-600"
													>
														${data.expenses}
													</div>
												</div>
											</div>
											<span class="text-muted-foreground mt-2 text-xs">{data.month}</span>
										</div>
									{/each}
								</div>
								<!-- Legend -->
								<div class="mt-4 flex items-center justify-center space-x-6">
									<div class="flex items-center space-x-2">
										<div class="h-3 w-3 rounded bg-green-500"></div>
										<span class="text-sm text-gray-300">Income</span>
									</div>
									<div class="flex items-center space-x-2">
										<div class="h-3 w-3 rounded bg-red-500"></div>
										<span class="text-sm text-gray-300">Expenses</span>
									</div>
								</div>
							</div>
						{/if}
					</CardContent>
				</Card>

				<Card class="border-gray-800 bg-gray-900">
					<CardHeader>
						<CardTitle class="text-white">Spending by Category</CardTitle>
						<p class="text-sm text-gray-400">Current month breakdown</p>
					</CardHeader>
					<CardContent>
						{#if mounted}
							{@const total = categoryData.reduce((sum, item) => sum + item.value, 0)}
							{@const radius = 80}
							{@const centerX = 100}
							{@const centerY = 100}
							{@const circumference = 2 * Math.PI * radius}
							<div class="flex h-[300px] w-full items-center justify-center">
								<!-- Pie Chart -->
								<div class="relative">
									<svg width="200" height="200" class="-rotate-90 transform">
										{#each categoryData as category, i}
											{@const percentage = (category.value / total) * 100}
											{@const strokeDasharray = `${(percentage / 100) * circumference} ${circumference}`}
											{@const rotation = categoryData
												.slice(0, i)
												.reduce((sum, item) => sum + (item.value / total) * 360, 0)}
											{@const isHovered = hoveredCategory === category.name}

											<circle
												cx={centerX}
												cy={centerY}
												r={radius}
												fill="none"
												stroke={category.color}
												stroke-width={isHovered ? "25" : "20"}
												stroke-dasharray={strokeDasharray}
												transform="rotate({rotation} {centerX} {centerY})"
												class="transition-all duration-300 cursor-pointer {isHovered ? 'opacity-100' : 'opacity-80'}"
												on:mouseenter={() => hoveredCategory = category.name}
												on:mouseleave={() => hoveredCategory = null}
												style="filter: {isHovered ? 'drop-shadow(0 0 8px ' + category.color + ')' : 'none'}"
											/>
										{/each}
									</svg>

									<!-- Labels -->
									<div class="absolute inset-0 flex items-center justify-center">
										<div class="text-center">
											{#if hoveredCategory}
												{@const hoveredData = categoryData.find(c => c.name === hoveredCategory)}
												<div class="text-lg font-bold text-white">{formatCurrency(hoveredData?.value || 0)}</div>
												<div class="text-xs text-gray-400">{hoveredCategory}</div>
											{:else}
												<div class="text-lg font-bold text-white">{formatCurrency(categoryData.reduce((sum, item) => sum + item.value, 0))}</div>
												<div class="text-xs text-gray-400">Total</div>
											{/if}
										</div>
									</div>
								</div>

								<!-- Legend -->
								<div class="ml-8 space-y-2">
									{#each categoryData as category}
										{@const total = categoryData.reduce((sum, item) => sum + item.value, 0)}
										{@const percentage = Math.round((category.value / total) * 100)}
										{@const isHovered = hoveredCategory === category.name}
										<div 
											class="flex items-center space-x-2 text-sm cursor-pointer transition-all duration-200 p-1 rounded {isHovered ? 'opacity-100 bg-gray-800' : 'opacity-70'}"
											on:mouseenter={() => hoveredCategory = category.name}
											on:mouseleave={() => hoveredCategory = null}
										>
											<div
												class="h-3 w-3 rounded-full transition-all duration-200 {isHovered ? 'scale-125' : 'scale-100'}"
												style="background-color: {category.color}"
											></div>
											<span class="text-xs text-gray-300">{category.name} {percentage}%</span>
										</div>
									{/each}
								</div>
							</div>
						{/if}
					</CardContent>
				</Card>
			</div>
		</TabsContent>

		<TabsContent value="spending" class="space-y-4">
			<Card class="border-gray-800 bg-gray-900">
				<CardHeader>
					<CardTitle class="text-white">Daily Spending Pattern</CardTitle>
					<p class="text-sm text-gray-400">Current month spending by day of the week</p>
				</CardHeader>
				<CardContent>
					{#if mounted}
						{#if weeklySpending.some(w => w.amount > 0)}
							<div class="h-[300px] w-full">
								<div class="flex h-[250px] items-end justify-between px-4">
									{#each weeklySpending as data}
										{@const maxAmount = Math.max(...weeklySpending.map((d) => d.amount))}
										<div class="flex flex-1 flex-col items-center">
											<div class="relative">
												<div
													class="w-12 rounded-t bg-blue-500 transition-all"
													style="height: {(data.amount / maxAmount) * 200}px"
												></div>
												<div
													class="absolute -top-6 left-1/2 -translate-x-1/2 transform text-xs font-medium text-white"
												>
													{formatCurrency(data.amount)}
												</div>
											</div>
											<span class="mt-2 text-xs text-gray-400">{data.week}</span>
										</div>
									{/each}
								</div>
							</div>
						{:else}
							<div class="h-[300px] w-full flex items-center justify-center">
								<div class="text-center">
									<Icon icon="lucide:bar-chart-3" class="h-8 w-8 text-gray-400 mx-auto mb-2" />
									<p class="text-gray-400 text-sm">No spending data available for this month</p>
								</div>
							</div>
						{/if}
					{/if}
				</CardContent>
			</Card>
		</TabsContent>

		<TabsContent value="income" class="space-y-4">
			<Card class="border-gray-800 bg-gray-900">
				<CardHeader>
					<CardTitle class="text-white">Income Trends</CardTitle>
					<p class="text-sm text-gray-400">Monthly income over the last {Math.min(monthlyData.length, 6)} months</p>
				</CardHeader>
				<CardContent>
					{#if mounted}
						{@const maxIncome = Math.max(...monthlyData.map((d) => d.income))}
						{@const minIncome = 0}
						{@const range = maxIncome - minIncome}
						{@const points = monthlyData
							.map((d, i) => `${100 + i * 120},${350 - ((d.income - minIncome) / range) * 250}`)
							.join(' L')}
						<div class="h-[400px] w-full">
							<!-- Area Chart -->
							<svg width="100%" height="100%" viewBox="0 0 800 400" class="h-full w-full">
								<defs>
									<linearGradient id="incomeGradient" x1="0%" y1="0%" x2="0%" y2="100%">
										<stop offset="0%" style="stop-color:#10b981;stop-opacity:0.6" />
										<stop offset="100%" style="stop-color:#10b981;stop-opacity:0.1" />
									</linearGradient>
								</defs>

								<!-- Grid lines -->
								{#each Array(8) as _, i}
									<line
										x1="60"
										y1={50 + i * 40}
										x2="740"
										y2={50 + i * 40}
										stroke="#374151"
										stroke-width="0.5"
										opacity="0.3"
									/>
								{/each}

								<!-- Area path -->
								<path d="M {points} L 700,350 L 100,350 Z" fill="url(#incomeGradient)" />
								<path d="M {points}" fill="none" stroke="#10b981" stroke-width="3" />

								<!-- Data points -->
								{#each monthlyData as data, i}
									{@const x = 100 + i * 120}
									{@const y = 350 - ((data.income - minIncome) / range) * 250}
									<circle cx={x} cy={y} r="5" fill="#10b981" />
									<text {x} y="375" text-anchor="middle" class="fill-gray-400 text-xs"
										>{data.month}</text
									>
									<text {x} y={y - 10} text-anchor="middle" class="fill-white text-xs font-medium"
										>${data.income}</text
									>
								{/each}
							</svg>
						</div>
					{/if}
				</CardContent>
			</Card>
		</TabsContent>

		<TabsContent value="savings" class="space-y-4">
			<Card class="border-gray-800 bg-gray-900">
				<CardHeader>
					<CardTitle class="text-white">Savings Growth</CardTitle>
					<p class="text-sm text-gray-400">Total savings accumulation over time</p>
				</CardHeader>
				<CardContent>
					{#if mounted}
						{@const maxAmount = Math.max(...savingsGrowth.map((d) => d.amount))}
						{@const minAmount = Math.min(...savingsGrowth.map((d) => d.amount))}
						{@const range = maxAmount - minAmount}
						{@const points = savingsGrowth
							.map((d, i) => `${100 + i * 110},${350 - ((d.amount - minAmount) / range) * 250}`)
							.join(' L')}
						<div class="h-[400px] w-full">
							<!-- Area Chart for Savings Growth -->
							<svg width="100%" height="100%" viewBox="0 0 800 400" class="h-full w-full">
								<defs>
									<linearGradient id="savingsGrowthGradient" x1="0%" y1="0%" x2="0%" y2="100%">
										<stop offset="0%" style="stop-color:#10b981;stop-opacity:0.6" />
										<stop offset="100%" style="stop-color:#10b981;stop-opacity:0.1" />
									</linearGradient>
								</defs>

								<!-- Grid lines -->
								{#each Array(8) as _, i}
									<line
										x1="60"
										y1={50 + i * 40}
										x2="740"
										y2={50 + i * 40}
										stroke="#374151"
										stroke-width="0.5"
										opacity="0.3"
									/>
								{/each}

								<!-- Zero baseline -->
								{#if savingsGrowth.length > 0}
									{@const zeroY = 350 - ((0 - minAmount) / range) * 250}
									<line
										x1="60"
										y1={zeroY}
										x2="740"
										y2={zeroY}
										stroke="#ef4444"
										stroke-width="2"
										opacity="0.8"
									/>
								{/if}

								<!-- Area path -->
								<path d="M {points} L 650,350 L 100,350 Z" fill="url(#savingsGrowthGradient)" />
								<path d="M {points}" fill="none" stroke="#10b981" stroke-width="3" />

								<!-- Data points -->
								{#each savingsGrowth as data, i}
									{@const x = 100 + i * 110}
									{@const y = 350 - ((data.amount - minAmount) / range) * 250}
									<circle cx={x} cy={y} r="4" fill="#10b981" />
									<text {x} y="375" text-anchor="middle" class="fill-gray-400 text-xs"
										>{data.month}</text
									>
									<text {x} y={y - 10} text-anchor="middle" class="fill-white text-xs font-medium"
										>${data.amount}</text
									>
								{/each}
							</svg>
						</div>
					{/if}
				</CardContent>
			</Card>

			<div class="grid gap-4 md:grid-cols-2">
				<Card class="border-gray-800 bg-gray-900">
					<CardHeader>
						<CardTitle class="text-white">Savings Rate</CardTitle>
					</CardHeader>
					<CardContent>
						<div class="text-center">
							{#if mounted}
								{@const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + Math.abs(t.amount), 0)}
								{@const totalExpense = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + Math.abs(t.amount), 0)}
								{@const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpense) / totalIncome) * 100 : 0}
								{@const savingsRateStatus = savingsRate >= 20 ? 'Excellent' : savingsRate >= 10 ? 'Good' : savingsRate >= 5 ? 'Fair' : 'Poor'}
								<div class="text-3xl font-bold text-white">{savingsRate.toFixed(1)}%</div>
								<p class="text-sm text-gray-400">of income saved</p>
								<Badge variant="default" class="mt-2">{savingsRateStatus}</Badge>
							{:else}
								<div class="text-3xl font-bold text-white">0%</div>
								<p class="text-sm text-gray-400">of income saved</p>
								<Badge variant="secondary" class="mt-2">No Data</Badge>
							{/if}
						</div>
					</CardContent>
				</Card>

				<Card class="border-gray-800 bg-gray-900">
					<CardHeader>
						<CardTitle class="text-white">Emergency Fund</CardTitle>
					</CardHeader>
					<CardContent>
						<div class="text-center">
							{#if mounted}
								{@const monthlyExpenses = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + Math.abs(t.amount), 0) / 12}
								{@const emergencyFund = savings.reduce((sum, s) => sum + (parseFloat(s.start_amount) || 0), 0)}
								{@const monthsCovered = monthlyExpenses > 0 ? emergencyFund / monthlyExpenses : 0}
								{@const emergencyStatus = monthsCovered >= 6 ? 'Excellent' : monthsCovered >= 3 ? 'Good' : monthsCovered >= 1 ? 'Building' : 'Critical'}
								<div class="text-3xl font-bold text-white">{monthsCovered.toFixed(1)}</div>
								<p class="text-sm text-gray-400">months of expenses</p>
								<Badge variant="secondary" class="mt-2">{emergencyStatus}</Badge>
							{:else}
								<div class="text-3xl font-bold text-white">0.0</div>
								<p class="text-sm text-gray-400">months of expenses</p>
								<Badge variant="secondary" class="mt-2">No Data</Badge>
							{/if}
						</div>
					</CardContent>
				</Card>
			</div>
		</TabsContent>
	</Tabs>
</div>
