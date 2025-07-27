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
	import { transactionService, type Transaction } from '$lib/services/transactions';

	let transactions = $state<Transaction[]>([]);
	let loading = $state(true);
	let error = $state<string | null>(null);

	onMount(async () => {
		try {
			loading = true;
			error = null;
			// Get recent transactions (last 5)
			const allTransactions = await transactionService.getAllTransactions();
			transactions = allTransactions.slice(0, 5);
		} catch (e) {
			error = e instanceof Error ? e.message : 'Failed to load transactions';
			console.error('Error loading recent transactions:', e);
		} finally {
			loading = false;
		}
	});

	// Format currency
	function formatCurrency(amount: number): string {
		return new Intl.NumberFormat('en-US', {
			style: 'currency',
			currency: 'USD',
			minimumFractionDigits: 2,
			maximumFractionDigits: 2
		}).format(Math.abs(amount));
	}

	// Format date
	function formatDate(dateString: string): string {
		return new Date(dateString).toLocaleDateString('en-US', {
			month: 'short',
			day: 'numeric'
		});
	}
</script>

<Card class="border-gray-800 bg-gray-900">
	<CardHeader>
		<CardTitle class="text-white">Recent Transactions</CardTitle>
		<CardDescription class="text-gray-400">Your latest financial activity</CardDescription>
	</CardHeader>
	<CardContent>
		{#if loading}
			<div class="flex items-center justify-center py-8">
				<div class="h-6 w-6 animate-spin rounded-full border-2 border-blue-500 border-t-transparent"></div>
			</div>
		{:else if error}
			<div class="text-center py-8">
				<Icon icon="lucide:alert-circle" class="mx-auto h-8 w-8 text-red-400" />
				<p class="mt-2 text-sm text-gray-400">{error}</p>
			</div>
		{:else if transactions.length > 0}
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
								<p class="text-xs text-gray-400">{formatDate(transaction.date)}</p>
							</div>
						</div>
						<div class="text-right">
							<p
								class={`text-sm font-medium ${transaction.type === 'income' ? 'text-green-400' : 'text-red-400'}`}
							>
								{transaction.type === 'income' ? '+' : ''}{formatCurrency(transaction.amount)}
							</p>
							{#if transaction.category_id}
								<Badge variant="secondary" class="bg-gray-800 text-xs text-gray-300">
									{transaction.type === 'income' ? 'Income' : 'Expense'}
								</Badge>
							{:else}
								<Badge variant="secondary" class="bg-gray-800 text-xs text-gray-300">
									{transaction.type === 'income' ? 'Income' : 'Expense'}
								</Badge>
							{/if}
						</div>
					</div>
				{/each}
			</div>
		{:else}
			<div class="text-center py-8">
				<Icon icon="lucide:receipt" class="mx-auto h-8 w-8 text-gray-400" />
				<p class="mt-2 text-sm text-gray-400">No transactions yet</p>
				<p class="text-xs text-gray-500">Start adding transactions to see them here</p>
			</div>
		{/if}
	</CardContent>
</Card>
