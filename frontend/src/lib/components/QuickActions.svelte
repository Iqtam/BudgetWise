<script lang="ts">
	import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { Bot, CreditCard, PiggyBank, Plus, Target } from 'lucide-svelte';
</script>

<Card class="bg-gray-900 border-gray-800">
	<CardHeader>
		<CardTitle class="text-white">Quick Actions</CardTitle>
		<CardDescription class="text-gray-400">Common tasks and shortcuts</CardDescription>
	</CardHeader>
	<CardContent>
		<div class="grid grid-cols-2 gap-3">
			<Button
				variant="outline"
				class="h-auto flex-col gap-2 p-4 bg-gray-800 border-gray-700 text-white hover:bg-gray-700 hover:text-white hover:border-gray-600"
				onclick={() => window.location.href = '/dashboard/transactions'}
			>
				<Plus class="h-5 w-5" />
				<span class="text-xs">Add Transaction</span>
			</Button>

			<Button
				variant="outline"
				class="h-auto flex-col gap-2 p-4 bg-gray-800 border-gray-700 text-white hover:bg-gray-700 hover:text-white hover:border-gray-600"
				onclick={() => window.location.href = '/dashboard/budget'}
			>
				<Target class="h-5 w-5" />
				<span class="text-xs">Set Budget</span>
			</Button>

			<Button
				variant="outline"
				class="h-auto flex-col gap-2 p-4 bg-gray-800 border-gray-700 text-white hover:bg-gray-700 hover:text-white hover:border-gray-600"
				onclick={() => window.location.href = '/dashboard/savings'}
			>
				<PiggyBank class="h-5 w-5" />
				<span class="text-xs">Add Savings</span>
			</Button>

			<Button
				variant="outline"
				class="h-auto flex-col gap-2 p-4 bg-gray-800 border-gray-700 text-white hover:bg-gray-700 hover:text-white hover:border-gray-600"
				onclick={() => window.location.href = '/dashboard/debt'}
			>
				<CreditCard class="h-5 w-5" />
				<span class="text-xs">Pay Debt</span>
			</Button>

			<Button
				variant="outline"
				class="h-auto flex-col gap-2 p-4 col-span-2 bg-gray-800 border-gray-700 text-white hover:bg-gray-700 hover:text-white hover:border-gray-600"
				onclick={() => window.location.href = '/dashboard/chat'}
			>
				<Bot class="h-5 w-5" />
				<span class="text-xs">Ask AI Assistant</span>
			</Button>
		</div>
	</CardContent>
</Card> 