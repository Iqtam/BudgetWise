<script lang="ts">
	import { TrendingDown, TrendingUp, DollarSign, Calendar } from 'lucide-svelte';
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Badge } from '$lib/components/ui/badge';
	import { Tabs, TabsContent, TabsList, TabsTrigger } from '$lib/components/ui/tabs';
	import { onMount } from 'svelte';

	const monthlyData = [
		{ month: "Jul", income: 5200, expenses: 3800, savings: 1400 },
		{ month: "Aug", income: 5400, expenses: 3200, savings: 2200 },
		{ month: "Sep", income: 5100, expenses: 3600, savings: 1500 },
		{ month: "Oct", income: 5600, expenses: 3400, savings: 2200 },
		{ month: "Nov", income: 5300, expenses: 3100, savings: 2200 },
		{ month: "Dec", income: 5420, expenses: 3280, savings: 2140 }
	];

	const categoryData = [
		{ name: "Food & Dining", value: 420, color: "#8884d8" },
		{ name: "Transportation", value: 180, color: "#82ca9d" },
		{ name: "Entertainment", value: 95, color: "#ffc658" },
		{ name: "Utilities", value: 245, color: "#ff7300" },
		{ name: "Shopping", value: 320, color: "#00ff88" },
		{ name: "Healthcare", value: 150, color: "#ff0088" }
	];

	const weeklySpending = [
		{ week: "Week 1", amount: 280 },
		{ week: "Week 2", amount: 420 },
		{ week: "Week 3", amount: 380 },
		{ week: "Week 4", amount: 520 }
	];

	const savingsGrowth = [
		{ month: "Jan", amount: 8500 },
		{ month: "Feb", amount: 9200 },
		{ month: "Mar", amount: 9800 },
		{ month: "Apr", amount: 10500 },
		{ month: "May", amount: 11200 },
		{ month: "Jun", amount: 12345 }
	];

	let activeTab = $state("overview");

	// For client-side rendering of charts
	let mounted = $state(false);
	onMount(() => {
		mounted = true;
	});
</script>

<div class="flex-1 space-y-6 p-6">
	<!-- Key Metrics -->
	<div class="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
		<Card class="bg-gray-900 border-gray-800">
			<CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
				<CardTitle class="text-sm font-medium text-gray-300">Net Worth</CardTitle>
				<TrendingUp class="h-4 w-4 text-gray-400" />
			</CardHeader>
			<CardContent>
				<div class="text-2xl font-bold text-white">$38,095</div>
				<p class="text-xs text-gray-400">
					<span class="inline-flex items-center text-green-600">
						<TrendingUp class="h-3 w-3 mr-1" />
						+12.5%
					</span>
					from last month
				</p>
			</CardContent>
		</Card>

		<Card class="bg-gray-900 border-gray-800">
			<CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
				<CardTitle class="text-sm font-medium text-gray-300">Avg Monthly Savings</CardTitle>
				<DollarSign class="h-4 w-4 text-gray-400" />
			</CardHeader>
			<CardContent>
				<div class="text-2xl font-bold text-white">$1,943</div>
				<p class="text-xs text-gray-400">36% of income</p>
			</CardContent>
		</Card>

		<Card class="bg-gray-900 border-gray-800">
			<CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
				<CardTitle class="text-sm font-medium text-gray-300">Expense Ratio</CardTitle>
				<TrendingDown class="h-4 w-4 text-gray-400" />
			</CardHeader>
			<CardContent>
				<div class="text-2xl font-bold text-white">64%</div>
				<p class="text-xs text-gray-400">
					<span class="inline-flex items-center text-green-600">
						<TrendingDown class="h-3 w-3 mr-1" />
						-2.1%
					</span>
					improvement
				</p>
			</CardContent>
		</Card>

		<Card class="bg-gray-900 border-gray-800">
			<CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
				<CardTitle class="text-sm font-medium text-gray-300">Financial Health</CardTitle>
				<Calendar class="h-4 w-4 text-gray-400" />
			</CardHeader>
			<CardContent>
				<div class="text-2xl font-bold text-white">Excellent</div>
				<Badge variant="default" class="mt-1">
					Score: 92/100
				</Badge>
			</CardContent>
		</Card>
	</div>

	<Tabs bind:value={activeTab} class="space-y-4">
		<TabsList class="bg-gray-900 border-gray-800">
			<TabsTrigger value="overview" class="data-[state=active]:bg-gray-800 text-gray-300">Overview</TabsTrigger>
			<TabsTrigger value="spending" class="data-[state=active]:bg-gray-800 text-gray-300">Spending Analysis</TabsTrigger>
			<TabsTrigger value="income" class="data-[state=active]:bg-gray-800 text-gray-300">Income Trends</TabsTrigger>
			<TabsTrigger value="savings" class="data-[state=active]:bg-gray-800 text-gray-300">Savings Growth</TabsTrigger>
		</TabsList>

		<TabsContent value="overview" class="space-y-4">
			<div class="grid gap-4 md:grid-cols-2">
				<Card class="bg-gray-900 border-gray-800">
					<CardHeader>
						<CardTitle class="text-white">Income vs Expenses</CardTitle>
						<p class="text-sm text-gray-400">Monthly comparison over the last 6 months</p>
					</CardHeader>
					<CardContent>
						{#if mounted}
							<div class="w-full h-[300px]">
								<!-- Manual Bar Chart Implementation -->
								<div class="flex items-end justify-between h-[250px] px-4 py-2">
									{#each monthlyData as data, i}
										<div class="flex flex-col items-center flex-1">
											<div class="flex items-end space-x-1 mb-2">
												<!-- Income Bar -->
																							<div class="relative">
												<div 
													class="w-6 rounded-t transition-all"
													style="height: {(data.income / 6000) * 200}px; background-color: #10b981;"
												></div>
												<div class="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs font-medium text-green-600">
													${data.income}
												</div>
											</div>
											<!-- Expenses Bar -->
											<div class="relative">
												<div 
													class="w-6 rounded-t transition-all"
													style="height: {(data.expenses / 6000) * 200}px; background-color: #ef4444;"
												></div>
												<div class="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs font-medium text-red-600">
													${data.expenses}
												</div>
											</div>
											</div>
											<span class="text-xs text-muted-foreground mt-2">{data.month}</span>
										</div>
									{/each}
								</div>
															<!-- Legend -->
							<div class="flex justify-center items-center space-x-6 mt-4">
								<div class="flex items-center space-x-2">
									<div class="w-3 h-3 bg-green-500 rounded"></div>
									<span class="text-sm text-gray-300">Income</span>
								</div>
								<div class="flex items-center space-x-2">
									<div class="w-3 h-3 bg-red-500 rounded"></div>
									<span class="text-sm text-gray-300">Expenses</span>
								</div>
							</div>
							</div>
						{/if}
					</CardContent>
				</Card>

				<Card class="bg-gray-900 border-gray-800">
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
							<div class="w-full h-[300px] flex items-center justify-center">
								<!-- Pie Chart -->
								<div class="relative">
									<svg width="200" height="200" class="transform -rotate-90">
										
										{#each categoryData as category, i}
											{@const percentage = (category.value / total) * 100}
											{@const strokeDasharray = `${(percentage / 100) * circumference} ${circumference}`}
											{@const rotation = categoryData.slice(0, i).reduce((sum, item) => sum + (item.value / total) * 360, 0)}
											
											<circle
												cx={centerX}
												cy={centerY}
												r={radius}
												fill="none"
												stroke={category.color}
												stroke-width="20"
												stroke-dasharray={strokeDasharray}
												transform="rotate({rotation} {centerX} {centerY})"
												class="transition-all duration-300"
											/>
										{/each}
									</svg>
									
									<!-- Labels -->
									<div class="absolute inset-0 flex items-center justify-center">
										<div class="text-center">
											<div class="text-lg font-bold text-white">$1,410</div>
											<div class="text-xs text-gray-400">Total</div>
										</div>
									</div>
								</div>
								
								<!-- Legend -->
								<div class="ml-8 space-y-2">
									{#each categoryData as category}
										{@const total = categoryData.reduce((sum, item) => sum + item.value, 0)}
										{@const percentage = Math.round((category.value / total) * 100)}
										<div class="flex items-center space-x-2 text-sm">
											<div class="w-3 h-3 rounded-full" style="background-color: {category.color}"></div>
											<span class="text-xs text-gray-300">{category.name} {percentage}%</span>
										</div>
									{/each}
								</div>
							</div>
						{/if}
					</CardContent>
				</Card>
			</div>

			<Card class="bg-gray-900 border-gray-800">
				<CardHeader>
					<CardTitle class="text-white">Savings Trend</CardTitle>
					<p class="text-sm text-gray-400">Monthly savings accumulation</p>
				</CardHeader>
				<CardContent>
					{#if mounted}
						{@const maxSavings = Math.max(...monthlyData.map(d => d.savings))}
						{@const points = monthlyData.map((d, i) => `${100 + i * 120},${250 - (d.savings / maxSavings) * 200}`).join(' L')}
						<div class="w-full h-[300px]">
							<!-- Area Chart -->
							<svg width="100%" height="100%" viewBox="0 0 800 300" class="w-full h-full">
								<defs>
									<linearGradient id="savingsGradient" x1="0%" y1="0%" x2="0%" y2="100%">
										<stop offset="0%" style="stop-color:#10b981;stop-opacity:0.6" />
										<stop offset="100%" style="stop-color:#10b981;stop-opacity:0.1" />
									</linearGradient>
								</defs>
								
								<!-- Grid lines -->
								{#each Array(6) as _, i}
									<line x1="60" y1={50 + i * 40} x2="740" y2={50 + i * 40} stroke="#374151" stroke-width="0.5" opacity="0.3" />
								{/each}
								
								<!-- Area path -->
								<path d="M {points} L 700,250 L 100,250 Z" fill="url(#savingsGradient)" />
								<path d="M {points}" fill="none" stroke="#10b981" stroke-width="3" />
								
								<!-- Data points -->
								{#each monthlyData as data, i}
									{@const x = 100 + i * 120}
									{@const y = 250 - (data.savings / maxSavings) * 200}
									<circle cx={x} cy={y} r="4" fill="#10b981" />
									<text x={x} y="275" text-anchor="middle" class="text-xs fill-gray-400">{data.month}</text>
									<text x={x} y={y - 10} text-anchor="middle" class="text-xs fill-white font-medium">${data.savings}</text>
								{/each}
							</svg>
						</div>
					{/if}
				</CardContent>
			</Card>
		</TabsContent>

		<TabsContent value="spending" class="space-y-4">
			<div class="grid gap-4 md:grid-cols-2">
				<Card class="bg-gray-900 border-gray-800">
					<CardHeader>
						<CardTitle class="text-white">Weekly Spending Pattern</CardTitle>
						<p class="text-sm text-gray-400">Current month weekly breakdown</p>
					</CardHeader>
					<CardContent>
						{#if mounted}
							<div class="w-full h-[300px]">
								<div class="flex items-end justify-between h-[250px] px-4">
									{#each weeklySpending as data}
										{@const maxAmount = Math.max(...weeklySpending.map(d => d.amount))}
										<div class="flex flex-col items-center flex-1">
											<div class="relative">
												<div 
													class="w-12 bg-blue-500 rounded-t transition-all"
													style="height: {(data.amount / maxAmount) * 200}px"
												></div>
												<div class="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs font-medium text-white">
													${data.amount}
												</div>
											</div>
											<span class="text-xs text-gray-400 mt-2">{data.week}</span>
										</div>
									{/each}
								</div>
							</div>
						{/if}
					</CardContent>
				</Card>

				<Card class="bg-gray-900 border-gray-800">
					<CardHeader>
						<CardTitle class="text-white">Top Spending Categories</CardTitle>
						<p class="text-sm text-gray-400">This month's highest expenses</p>
					</CardHeader>
					<CardContent>
						<div class="space-y-4">
							{#each categoryData.sort((a, b) => b.value - a.value) as category, index}
								<div class="flex items-center justify-between">
									<div class="flex items-center gap-2">
										<div class="w-3 h-3 rounded-full" style="background-color: {category.color}"></div>
										<span class="text-sm font-medium text-gray-300">{category.name}</span>
									</div>
									<div class="text-right">
										<span class="text-sm font-bold text-white">${category.value}</span>
										<Badge variant="secondary" class="ml-2">
											#{index + 1}
										</Badge>
									</div>
								</div>
							{/each}
						</div>
					</CardContent>
				</Card>
			</div>

			<Card class="bg-gray-900 border-gray-800">
				<CardHeader>
					<CardTitle class="text-white">Spending Insights</CardTitle>
					<p class="text-sm text-gray-400">AI-powered analysis of your spending patterns</p>
				</CardHeader>
				<CardContent>
					<div class="space-y-4">
						<div class="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
							<h4 class="font-semibold text-blue-900 dark:text-blue-100">Peak Spending Day</h4>
							<p class="text-sm text-blue-700 dark:text-blue-300 mt-1">
								You tend to spend the most on Fridays, averaging $85 per day. Consider planning purchases earlier in
								the week.
							</p>
						</div>

						<div class="p-4 bg-green-50 dark:bg-green-950 rounded-lg">
							<h4 class="font-semibold text-green-900 dark:text-green-100">Improvement Opportunity</h4>
							<p class="text-sm text-green-700 dark:text-green-300 mt-1">
								Your food spending decreased by 15% this month. Great job! You saved $74 compared to last month.
							</p>
						</div>

						<div class="p-4 bg-yellow-50 dark:bg-yellow-950 rounded-lg">
							<h4 class="font-semibold text-yellow-900 dark:text-yellow-100">Budget Alert</h4>
							<p class="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
								Shopping category is 30% over budget. Consider reviewing recent purchases or adjusting the budget
								limit.
							</p>
						</div>
					</div>
				</CardContent>
			</Card>
		</TabsContent>

		<TabsContent value="income" class="space-y-4">
			<Card class="bg-gray-900 border-gray-800">
				<CardHeader>
					<CardTitle class="text-white">Income Trends</CardTitle>
					<p class="text-sm text-gray-400">Monthly income over the last 6 months</p>
				</CardHeader>
				<CardContent>
					{#if mounted}
						{@const maxIncome = Math.max(...monthlyData.map(d => d.income))}
						{@const minIncome = Math.min(...monthlyData.map(d => d.income))}
						{@const range = maxIncome - minIncome}
						{@const points = monthlyData.map((d, i) => `${100 + i * 120},${350 - ((d.income - minIncome) / range) * 250}`).join(' L')}
						<div class="w-full h-[400px]">
							<!-- Area Chart -->
							<svg width="100%" height="100%" viewBox="0 0 800 400" class="w-full h-full">
								<defs>
									<linearGradient id="incomeGradient" x1="0%" y1="0%" x2="0%" y2="100%">
										<stop offset="0%" style="stop-color:#10b981;stop-opacity:0.6" />
										<stop offset="100%" style="stop-color:#10b981;stop-opacity:0.1" />
									</linearGradient>
								</defs>
								
								<!-- Grid lines -->
								{#each Array(8) as _, i}
									<line x1="60" y1={50 + i * 40} x2="740" y2={50 + i * 40} stroke="#374151" stroke-width="0.5" opacity="0.3" />
								{/each}
								
								<!-- Area path -->
								<path d="M {points} L 700,350 L 100,350 Z" fill="url(#incomeGradient)" />
								<path d="M {points}" fill="none" stroke="#10b981" stroke-width="3" />
								
								<!-- Data points -->
								{#each monthlyData as data, i}
									{@const x = 100 + i * 120}
									{@const y = 350 - ((data.income - minIncome) / range) * 250}
									<circle cx={x} cy={y} r="5" fill="#10b981" />
									<text x={x} y="375" text-anchor="middle" class="text-xs fill-gray-400">{data.month}</text>
									<text x={x} y={y - 10} text-anchor="middle" class="text-xs fill-white font-medium">${data.income}</text>
								{/each}
							</svg>
						</div>
					{/if}
				</CardContent>
			</Card>

			<div class="grid gap-4 md:grid-cols-2">
				<Card class="bg-gray-900 border-gray-800">
					<CardHeader>
						<CardTitle class="text-white">Income Sources</CardTitle>
						<p class="text-sm text-gray-400">Breakdown of income streams</p>
					</CardHeader>
					<CardContent>
						<div class="space-y-4">
							<div class="flex items-center justify-between">
								<span class="text-sm font-medium text-gray-300">Primary Salary</span>
								<span class="text-sm font-bold text-white">$4,500 (83%)</span>
							</div>
							<div class="flex items-center justify-between">
								<span class="text-sm font-medium text-gray-300">Freelance Work</span>
								<span class="text-sm font-bold text-white">$720 (13%)</span>
							</div>
							<div class="flex items-center justify-between">
								<span class="text-sm font-medium text-gray-300">Investments</span>
								<span class="text-sm font-bold text-white">$200 (4%)</span>
							</div>
						</div>
					</CardContent>
				</Card>

				<Card class="bg-gray-900 border-gray-800">
					<CardHeader>
						<CardTitle class="text-white">Income Growth</CardTitle>
						<p class="text-sm text-gray-400">Year-over-year comparison</p>
					</CardHeader>
					<CardContent>
						<div class="space-y-4">
							<div class="text-center">
								<div class="text-3xl font-bold text-green-600">+18.5%</div>
								<p class="text-sm text-gray-400">Income growth this year</p>
							</div>
							<div class="space-y-2">
								<div class="flex justify-between text-sm">
									<span class="text-gray-300">This Year Avg</span>
									<span class="font-medium text-white">$5,340</span>
								</div>
								<div class="flex justify-between text-sm">
									<span class="text-gray-300">Last Year Avg</span>
									<span class="font-medium text-white">$4,505</span>
								</div>
							</div>
						</div>
					</CardContent>
				</Card>
			</div>
		</TabsContent>

		<TabsContent value="savings" class="space-y-4">
			<Card class="bg-gray-900 border-gray-800">
				<CardHeader>
					<CardTitle class="text-white">Savings Growth</CardTitle>
					<p class="text-sm text-gray-400">Total savings accumulation over time</p>
				</CardHeader>
				<CardContent>
					{#if mounted}
						{@const maxAmount = Math.max(...savingsGrowth.map(d => d.amount))}
						{@const minAmount = Math.min(...savingsGrowth.map(d => d.amount))}
						{@const range = maxAmount - minAmount}
						{@const points = savingsGrowth.map((d, i) => `${100 + i * 110},${350 - ((d.amount - minAmount) / range) * 250}`).join(' L')}
						<div class="w-full h-[400px]">
							<!-- Area Chart for Savings Growth -->
							<svg width="100%" height="100%" viewBox="0 0 800 400" class="w-full h-full">
								<defs>
									<linearGradient id="savingsGrowthGradient" x1="0%" y1="0%" x2="0%" y2="100%">
										<stop offset="0%" style="stop-color:#10b981;stop-opacity:0.6" />
										<stop offset="100%" style="stop-color:#10b981;stop-opacity:0.1" />
									</linearGradient>
								</defs>
								
								<!-- Grid lines -->
								{#each Array(8) as _, i}
									<line x1="60" y1={50 + i * 40} x2="740" y2={50 + i * 40} stroke="#374151" stroke-width="0.5" opacity="0.3" />
								{/each}
								
								<!-- Area path -->
								<path d="M {points} L 650,350 L 100,350 Z" fill="url(#savingsGrowthGradient)" />
								<path d="M {points}" fill="none" stroke="#10b981" stroke-width="3" />
								
								<!-- Data points -->
								{#each savingsGrowth as data, i}
									{@const x = 100 + i * 110}
									{@const y = 350 - ((data.amount - minAmount) / range) * 250}
									<circle cx={x} cy={y} r="4" fill="#10b981" />
									<text x={x} y="375" text-anchor="middle" class="text-xs fill-gray-400">{data.month}</text>
									<text x={x} y={y - 10} text-anchor="middle" class="text-xs fill-white font-medium">${data.amount}</text>
								{/each}
							</svg>
						</div>
					{/if}
				</CardContent>
			</Card>

			<div class="grid gap-4 md:grid-cols-3">
				<Card class="bg-gray-900 border-gray-800">
					<CardHeader>
						<CardTitle class="text-white">Savings Rate</CardTitle>
					</CardHeader>
					<CardContent>
						<div class="text-center">
							<div class="text-3xl font-bold text-white">36%</div>
							<p class="text-sm text-gray-400">of income saved</p>
							<Badge variant="default" class="mt-2">
								Excellent
							</Badge>
						</div>
					</CardContent>
				</Card>

				<Card class="bg-gray-900 border-gray-800">
					<CardHeader>
						<CardTitle class="text-white">Emergency Fund</CardTitle>
					</CardHeader>
					<CardContent>
						<div class="text-center">
							<div class="text-3xl font-bold text-white">2.1</div>
							<p class="text-sm text-gray-400">months of expenses</p>
							<Badge variant="secondary" class="mt-2">
								Building
							</Badge>
						</div>
					</CardContent>
				</Card>

				<Card class="bg-gray-900 border-gray-800">
					<CardHeader>
						<CardTitle class="text-white">Investment Growth</CardTitle>
					</CardHeader>
					<CardContent>
						<div class="text-center">
							<div class="text-3xl font-bold text-green-600">+7.2%</div>
							<p class="text-sm text-gray-400">annual return</p>
							<Badge variant="default" class="mt-2">
								On Track
							</Badge>
						</div>
					</CardContent>
				</Card>
			</div>
		</TabsContent>
	</Tabs>
</div> 