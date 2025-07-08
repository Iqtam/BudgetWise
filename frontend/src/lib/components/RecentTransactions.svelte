<script lang="ts">
	import {
		Card,
		CardContent,
		CardDescription,
		CardHeader,
		CardTitle
	} from '$lib/components/ui/card';
	import { Badge } from '$lib/components/ui/badge';
	import Icon from '@iconify/svelte';

	const transactions = [
		{
			id: 1,
			description: 'Salary Deposit',
			amount: 5420.0,
			type: 'income',
			category: 'Salary',
			date: '2024-01-15'
		},
		{
			id: 2,
			description: 'Grocery Store',
			amount: -125.5,
			type: 'expense',
			category: 'Food',
			date: '2024-01-14'
		},
		{
			id: 3,
			description: 'Gas Station',
			amount: -45.2,
			type: 'expense',
			category: 'Transportation',
			date: '2024-01-13'
		},
		{
			id: 4,
			description: 'Freelance Payment',
			amount: 800.0,
			type: 'income',
			category: 'Freelance',
			date: '2024-01-12'
		},
		{
			id: 5,
			description: 'Netflix Subscription',
			amount: -15.99,
			type: 'expense',
			category: 'Entertainment',
			date: '2024-01-11'
		}
	];
</script>

<Card class="border-gray-800 bg-gray-900">
	<CardHeader>
		<CardTitle class="text-white">Recent Transactions</CardTitle>
		<CardDescription class="text-gray-400">Your latest financial activity</CardDescription>
	</CardHeader>
	<CardContent>
		<div class="space-y-4">
			{#each transactions as transaction}
				<div class="flex items-center justify-between">
					<div class="flex items-center space-x-3">
						<div
							class={`flex h-8 w-8 items-center justify-center rounded-full ${
								transaction.type === 'income'
									? 'bg-green-500/20 text-green-400'
									: 'bg-red-500/20 text-red-400'
							}`}
						>
							{#if transaction.type === 'income'}
								<Icon icon="lucide:arrow-up" class="h-4 w-4" />
							{:else}
								<Icon icon="lucide:arrow-down" class="h-4 w-4" />
							{/if}
						</div>
						<div>
							<p class="text-sm font-medium text-white">{transaction.description}</p>
							<p class="text-xs text-gray-400">{transaction.date}</p>
						</div>
					</div>
					<div class="text-right">
						<p
							class={`text-sm font-medium ${transaction.type === 'income' ? 'text-green-400' : 'text-red-400'}`}
						>
							{transaction.type === 'income' ? '+' : ''}${Math.abs(transaction.amount).toFixed(2)}
						</p>
						<Badge variant="secondary" class="bg-gray-800 text-xs text-gray-300">
							{transaction.category}
						</Badge>
					</div>
				</div>
			{/each}
		</div>
	</CardContent>
</Card>
