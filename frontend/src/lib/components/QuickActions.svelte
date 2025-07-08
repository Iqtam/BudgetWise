<script lang="ts">
	import {
		Card,
		CardContent,
		CardDescription,
		CardHeader,
		CardTitle
	} from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import Icon from '@iconify/svelte';
</script>

<Card class="border-gray-800 bg-gray-900">
	<CardHeader>
		<CardTitle class="text-white">Quick Actions</CardTitle>
		<CardDescription class="text-gray-400">Common tasks and shortcuts</CardDescription>
	</CardHeader>
	<CardContent>
		<div class="grid grid-cols-2 gap-3">
			<Button
				variant="outline"
				class="h-auto flex-col gap-2 border-gray-700 bg-gray-800 p-4 text-white hover:border-gray-600 hover:bg-gray-700 hover:text-white"
				onclick={() => (window.location.href = '/dashboard/transactions')}
			>
				<Icon icon="lucide:plus" class="h-5 w-5" />
				<span class="text-xs">Add Transaction</span>
			</Button>

			<Button
				variant="outline"
				class="h-auto flex-col gap-2 border-gray-700 bg-gray-800 p-4 text-white hover:border-gray-600 hover:bg-gray-700 hover:text-white"
				onclick={() => (window.location.href = '/dashboard/budget')}
			>
				<Icon icon="lucide:target" class="h-5 w-5" />
				<span class="text-xs">Set Budget</span>
			</Button>

			<Button
				variant="outline"
				class="h-auto flex-col gap-2 border-gray-700 bg-gray-800 p-4 text-white hover:border-gray-600 hover:bg-gray-700 hover:text-white"
				onclick={() => (window.location.href = '/dashboard/savings')}
			>
				<Icon icon="lucide:piggy-bank" class="h-5 w-5" />
				<span class="text-xs">Add Savings</span>
			</Button>

			<Button
				variant="outline"
				class="h-auto flex-col gap-2 border-gray-700 bg-gray-800 p-4 text-white hover:border-gray-600 hover:bg-gray-700 hover:text-white"
				onclick={() => (window.location.href = '/dashboard/debt')}
			>
				<Icon icon="lucide:credit-card" class="h-5 w-5" />
				<span class="text-xs">Pay Debt</span>
			</Button>

			<Button
				variant="outline"
				class="col-span-2 h-auto flex-col gap-2 border-gray-700 bg-gray-800 p-4 text-white hover:border-gray-600 hover:bg-gray-700 hover:text-white"
				onclick={() => (window.location.href = '/dashboard/chat')}
			>
				<Icon icon="lucide:bot" class="h-5 w-5" />
				<span class="text-xs">Ask AI Assistant</span>
			</Button>
		</div>
	</CardContent>
</Card>
