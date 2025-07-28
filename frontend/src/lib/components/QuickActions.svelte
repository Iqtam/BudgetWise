<script lang="ts">
	import {
		Card,
		CardContent,
		CardDescription,
		CardHeader,
		CardTitle
	} from '$lib/components/ui/card';

	function handleNavigation(path: string) {
		console.log('Navigating to:', path);
		// Use direct navigation with full URL
		const fullPath = window.location.origin + path;
		console.log('Full path:', fullPath);
		window.location.href = fullPath;
	}

	function testClick() {
		console.log('Button clicked!');
		// Test with full URL
		const fullPath = window.location.origin + '/dashboard/transactions';
		console.log('Test navigation to:', fullPath);
		window.location.href = fullPath;
	}
</script>

<Card class="border-gray-800 bg-gray-900">
	<CardHeader>
		<CardTitle class="text-white">Quick Actions</CardTitle>
		<CardDescription class="text-gray-400">Common tasks and shortcuts</CardDescription>
	</CardHeader>
	<CardContent>
		<div class="grid grid-cols-2 gap-3">
			<button
				class="h-auto flex-col gap-2 border border-gray-700 bg-gray-800 p-4 text-white hover:border-gray-600 hover:bg-gray-700 hover:text-white rounded-md"
				on:click={testClick}
			>
				<span class="text-lg">+</span>
				<span class="text-xs">Add Transaction</span>
			</button>

			<button
				class="h-auto flex-col gap-2 border border-gray-700 bg-gray-800 p-4 text-white hover:border-gray-600 hover:bg-gray-700 hover:text-white rounded-md"
				on:click={() => handleNavigation('/dashboard/budget')}
			>
				<span class="text-lg">🎯</span>
				<span class="text-xs">Set Budget</span>
			</button>

			<button
				class="h-auto flex-col gap-2 border border-gray-700 bg-gray-800 p-4 text-white hover:border-gray-600 hover:bg-gray-700 hover:text-white rounded-md"
				on:click={() => handleNavigation('/dashboard/goals')}
			>
				<span class="text-lg">💰</span>
				<span class="text-xs">Add Savings</span>
			</button>

			<button
				class="h-auto flex-col gap-2 border border-gray-700 bg-gray-800 p-4 text-white hover:border-gray-600 hover:bg-gray-700 hover:text-white rounded-md"
				on:click={() => handleNavigation('/dashboard/debt')}
			>
				<span class="text-lg">💳</span>
				<span class="text-xs">Pay Debt</span>
			</button>

			<button
				class="col-span-2 h-auto flex-col gap-2 border border-gray-700 bg-gray-800 p-4 text-white hover:border-gray-600 hover:bg-gray-700 hover:text-white rounded-md"
				on:click={() => handleNavigation('/dashboard/chat')}
			>
				<span class="text-lg">🤖</span>
				<span class="text-xs">Ask AI Assistant</span>
			</button>
		</div>
	</CardContent>
</Card>
