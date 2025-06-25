<script lang="ts">
	import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Badge } from '$lib/components/ui/badge';
	import { 
		ArrowDownIcon, 
		ArrowUpIcon, 
		CreditCard, 
		DollarSign, 
		PiggyBank, 
		Target, 
		TrendingUp, 
		Wallet 
	} from 'lucide-svelte';
	import FinancialChart from '$lib/components/FinancialChart.svelte';
	import RecentTransactions from '$lib/components/RecentTransactions.svelte';
	import QuickActions from '$lib/components/QuickActions.svelte';
</script>

<div class="flex-1 space-y-6 p-6">
	<!-- Financial Overview Cards -->
	<div class="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
		<Card class="bg-gray-900 border-gray-800">
			<CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
				<CardTitle class="text-sm font-medium text-gray-300">Total Balance</CardTitle>
				<DollarSign class="h-4 w-4 text-gray-400" />
			</CardHeader>
			<CardContent>
				<div class="text-2xl font-bold text-white">$12,345.67</div>
				<p class="text-xs text-gray-400">
					<span class="inline-flex items-center text-green-400">
						<ArrowUpIcon class="h-3 w-3 mr-1" />
						+2.5%
					</span>
					from last month
				</p>
			</CardContent>
		</Card>

		<Card class="bg-gray-900 border-gray-800">
			<CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
				<CardTitle class="text-sm font-medium text-gray-300">Monthly Income</CardTitle>
				<TrendingUp class="h-4 w-4 text-gray-400" />
			</CardHeader>
			<CardContent>
				<div class="text-2xl font-bold text-white">$5,420.00</div>
				<p class="text-xs text-gray-400">
					<span class="inline-flex items-center text-green-400">
						<ArrowUpIcon class="h-3 w-3 mr-1" />
						+8.2%
					</span>
					from last month
				</p>
			</CardContent>
		</Card>

		<Card class="bg-gray-900 border-gray-800">
			<CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
				<CardTitle class="text-sm font-medium text-gray-300">Monthly Expenses</CardTitle>
				<CreditCard class="h-4 w-4 text-gray-400" />
			</CardHeader>
			<CardContent>
				<div class="text-2xl font-bold text-white">$3,280.45</div>
				<p class="text-xs text-gray-400">
					<span class="inline-flex items-center text-red-400">
						<ArrowDownIcon class="h-3 w-3 mr-1" />
						-1.2%
					</span>
					from last month
				</p>
			</CardContent>
		</Card>

		<Card class="bg-gray-900 border-gray-800">
			<CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
				<CardTitle class="text-sm font-medium text-gray-300">Savings Goal</CardTitle>
				<Target class="h-4 w-4 text-gray-400" />
			</CardHeader>
			<CardContent>
				<div class="text-2xl font-bold text-white">68%</div>
				<div class="w-full bg-gray-700 rounded-full h-2 mt-2">
					<div class="bg-white h-2 rounded-full transition-all" style="width: 68%"></div>
				</div>
				<p class="text-xs text-gray-400 mt-2">$6,800 of $10,000 goal</p>
			</CardContent>
		</Card>
	</div>

	<!-- Budget Overview -->
	<div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
		<Card class="col-span-2 bg-gray-900 border-gray-800">
			<CardHeader>
				<CardTitle class="text-white">Spending Overview</CardTitle>
				<CardDescription class="text-gray-400">Your spending patterns over the last 6 months</CardDescription>
			</CardHeader>
			<CardContent>
				<FinancialChart />
			</CardContent>
		</Card>

		<Card class="bg-gray-900 border-gray-800">
			<CardHeader>
				<CardTitle class="text-white">Budget Status</CardTitle>
				<CardDescription class="text-gray-400">Current month progress</CardDescription>
			</CardHeader>
			<CardContent class="space-y-4">
				<div class="space-y-2">
					<div class="flex items-center justify-between text-sm">
						<span class="text-gray-300">Food & Dining</span>
						<span class="text-gray-300">$420 / $500</span>
					</div>
					<div class="w-full bg-gray-700 rounded-full h-2">
						<div class="bg-white h-2 rounded-full transition-all" style="width: 84%"></div>
					</div>
					<Badge variant="secondary" class="text-xs bg-gray-800 text-gray-300">
						84% used
					</Badge>
				</div>

				<div class="space-y-2">
					<div class="flex items-center justify-between text-sm">
						<span class="text-gray-300">Transportation</span>
						<span class="text-gray-300">$180 / $300</span>
					</div>
					<div class="w-full bg-gray-700 rounded-full h-2">
						<div class="bg-white h-2 rounded-full transition-all" style="width: 60%"></div>
					</div>
					<Badge variant="secondary" class="text-xs bg-gray-800 text-gray-300">
						60% used
					</Badge>
				</div>

				<div class="space-y-2">
					<div class="flex items-center justify-between text-sm">
						<span class="text-gray-300">Entertainment</span>
						<span class="text-gray-300">$95 / $200</span>
					</div>
					<div class="w-full bg-gray-700 rounded-full h-2">
						<div class="bg-white h-2 rounded-full transition-all" style="width: 47.5%"></div>
					</div>
					<Badge variant="secondary" class="text-xs bg-gray-800 text-gray-300">
						48% used
					</Badge>
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
		<Card class="bg-gray-900 border-gray-800">
			<CardHeader>
				<CardTitle class="flex items-center gap-2 text-white">
					<Wallet class="h-5 w-5" />
					Debt Summary
				</CardTitle>
			</CardHeader>
			<CardContent class="space-y-4">
				<div class="flex items-center justify-between">
					<span class="text-sm text-gray-300">Credit Card</span>
					<span class="font-medium text-white">$2,450.00</span>
				</div>
				<div class="flex items-center justify-between">
					<span class="text-sm text-gray-300">Student Loan</span>
					<span class="font-medium text-white">$15,600.00</span>
				</div>
				<div class="flex items-center justify-between">
					<span class="text-sm text-gray-300">Car Loan</span>
					<span class="font-medium text-white">$8,200.00</span>
				</div>
				<div class="border-t border-gray-800 pt-4">
					<div class="flex items-center justify-between font-semibold">
						<span class="text-gray-300">Total Debt</span>
						<span class="text-red-400">$26,250.00</span>
					</div>
				</div>
			</CardContent>
		</Card>

		<Card class="bg-gray-900 border-gray-800">
			<CardHeader>
				<CardTitle class="flex items-center gap-2 text-white">
					<PiggyBank class="h-5 w-5" />
					Savings Summary
				</CardTitle>
			</CardHeader>
			<CardContent class="space-y-4">
				<div class="flex items-center justify-between">
					<span class="text-sm text-gray-300">Emergency Fund</span>
					<span class="font-medium text-white">$3,200.00</span>
				</div>
				<div class="flex items-center justify-between">
					<span class="text-sm text-gray-300">Vacation Fund</span>
					<span class="font-medium text-white">$1,850.00</span>
				</div>
				<div class="flex items-center justify-between">
					<span class="text-sm text-gray-300">Investment Account</span>
					<span class="font-medium text-white">$7,295.67</span>
				</div>
				<div class="border-t border-gray-800 pt-4">
					<div class="flex items-center justify-between font-semibold">
						<span class="text-gray-300">Total Savings</span>
						<span class="text-green-400">$12,345.67</span>
					</div>
				</div>
			</CardContent>
		</Card>
	</div>
</div> 