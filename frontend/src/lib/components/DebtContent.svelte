<script lang="ts">
	import { 
		CreditCard, 
		DollarSign, 
		TrendingDown, 
		Wallet, 
		Plus 
	} from 'lucide-svelte';
	import { Button } from '$lib/components/ui/button';
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Badge } from '$lib/components/ui/badge';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Progress } from '$lib/components/ui/progress';
	import { 
		Dialog,
		DialogContent,
		DialogDescription,
		DialogHeader,
		DialogTitle,
		DialogTrigger 
	} from '$lib/components/ui/dialog';
	import {
		Select,
		SelectContent,
		SelectItem,
		SelectTrigger
	} from '$lib/components/ui/select';

	const mockDebts = [
		{
			id: 1,
			name: "Credit Card",
			balance: 2450,
			originalAmount: 5000,
			interestRate: 18.99,
			minimumPayment: 75,
			dueDate: "2024-02-15",
			type: "bank",
			takenFrom: "Chase Bank",
		},
		{
			id: 2,
			name: "Student Loan",
			balance: 15600,
			originalAmount: 25000,
			interestRate: 4.5,
			minimumPayment: 280,
			dueDate: "2024-02-20",
			type: "bank",
			takenFrom: "Federal Student Aid",
		},
		{
			id: 3,
			name: "Car Loan",
			balance: 8200,
			originalAmount: 18000,
			interestRate: 6.2,
			minimumPayment: 320,
			dueDate: "2024-02-10",
			type: "bank",
			takenFrom: "Auto Finance Corp",
		},
		{
			id: 4,
			name: "Personal Loan",
			balance: 3500,
			originalAmount: 5000,
			interestRate: 12.5,
			minimumPayment: 150,
			dueDate: "2024-02-25",
			type: "personal",
			takenFrom: "John Smith",
		},
		{
			id: 5,
			name: "Home Equity Loan",
			balance: 45000,
			originalAmount: 50000,
			interestRate: 5.8,
			minimumPayment: 425,
			dueDate: "2024-02-05",
			type: "bank",
			takenFrom: "Wells Fargo",
		},
		{
			id: 6,
			name: "Business Loan",
			balance: 12000,
			originalAmount: 20000,
			interestRate: 8.9,
			minimumPayment: 245,
			dueDate: "2024-02-18",
			type: "bank",
			takenFrom: "Small Business Bank",
		},
		{
			id: 7,
			name: "Medical Debt",
			balance: 1800,
			originalAmount: 2500,
			interestRate: 0,
			minimumPayment: 100,
			dueDate: "2024-02-28",
			type: "personal",
			takenFrom: "City Hospital",
		},
		{
			id: 8,
			name: "Family Loan",
			balance: 2200,
			originalAmount: 3000,
			interestRate: 2.0,
			minimumPayment: 75,
			dueDate: "2024-02-12",
			type: "personal",
			takenFrom: "Mom & Dad",
		},
		{
			id: 9,
			name: "Store Credit Card",
			balance: 890,
			originalAmount: 1500,
			interestRate: 24.99,
			minimumPayment: 35,
			dueDate: "2024-02-22",
			type: "bank",
			takenFrom: "Department Store",
		},
		{
			id: 10,
			name: "Payday Loan",
			balance: 650,
			originalAmount: 800,
			interestRate: 35.0,
			minimumPayment: 85,
			dueDate: "2024-02-08",
			type: "personal",
			takenFrom: "Quick Cash",
		},
		{
			id: 11,
			name: "Motorcycle Loan",
			balance: 4200,
			originalAmount: 8000,
			interestRate: 7.5,
			minimumPayment: 180,
			dueDate: "2024-02-16",
			type: "bank",
			takenFrom: "Bike Finance",
		},
		{
			id: 12,
			name: "Furniture Loan",
			balance: 1100,
			originalAmount: 2000,
			interestRate: 15.9,
			minimumPayment: 65,
			dueDate: "2024-02-20",
			type: "bank",
			takenFrom: "Furniture Store",
		}
	];

	let debts = $state(mockDebts);
	let isAddDebtOpen = $state(false);
	let isPaymentOpen = $state(false);
	let selectedDebt = $state<number | null>(null);
	let currentPage = $state(1);
	const itemsPerPage = 10;

	$effect(() => {
		currentPage = 1;
	});

	const getPaginatedDebts = () => {
		const startIndex = (currentPage - 1) * itemsPerPage;
		const endIndex = startIndex + itemsPerPage;
		const paginatedDebts = debts.slice(startIndex, endIndex);

		return {
			debts: paginatedDebts,
			totalCount: debts.length,
			totalPages: Math.ceil(debts.length / itemsPerPage),
			startIndex: startIndex + 1,
			endIndex: Math.min(endIndex, debts.length),
		};
	};

	const paginatedData = $derived(getPaginatedDebts());
	const totalDebt = $derived(debts.reduce((sum, debt) => sum + debt.balance, 0));
	const totalMinimumPayment = $derived(debts.reduce((sum, debt) => sum + debt.minimumPayment, 0));
	const highestInterestRate = $derived(Math.max(...debts.map(debt => debt.interestRate)));
	const highestInterestDebt = $derived(debts.find(debt => debt.interestRate === highestInterestRate));

	function handleAddDebt(event: Event) {
		event.preventDefault();
		const formData = new FormData(event.target as HTMLFormElement);
		
		const description = formData.get("description") as string;
		const type = formData.get("type") as string;
		const amount = Number.parseFloat(formData.get("amount") as string);
		const interestRate = Number.parseFloat(formData.get("interestRate") as string);
		const takenFrom = formData.get("takenFrom") as string;
		const startDate = formData.get("startDate") as string;
		const expirationDate = formData.get("expirationDate") as string;

		const newDebt = {
			id: debts.length + 1,
			name: description,
			balance: amount,
			originalAmount: amount,
			interestRate,
			minimumPayment: Math.round(amount * 0.02), // Estimate 2% minimum payment
			dueDate: expirationDate,
			type,
			takenFrom,
			startDate,
		};

		debts = [...debts, newDebt];
		isAddDebtOpen = false;
		
		console.log(`Debt Added: ${description} with balance of $${amount}`);
	}

	function handlePayment(event: Event) {
		event.preventDefault();
		const formData = new FormData(event.target as HTMLFormElement);
		const amount = Number.parseFloat(formData.get("amount") as string);

		if (selectedDebt !== null) {
			debts = debts.map((debt) =>
				debt.id === selectedDebt ? { ...debt, balance: Math.max(0, debt.balance - amount) } : debt
			);

			const debtName = debts.find((d) => d.id === selectedDebt)?.name;
			isPaymentOpen = false;
			selectedDebt = null;
			
			console.log(`Payment Recorded: Payment of $${amount} applied to ${debtName}`);
		}
	}

	function setMinimumPayment(debtId: number) {
		const debt = debts.find(d => d.id === debtId);
		if (debt) {
			const input = document.getElementById("amount") as HTMLInputElement;
			if (input) input.value = debt.minimumPayment.toString();
		}
	}

	function setPayoffAmount(debtId: number) {
		const debt = debts.find(d => d.id === debtId);
		if (debt) {
			const input = document.getElementById("amount") as HTMLInputElement;
			if (input) input.value = debt.balance.toString();
		}
	}
</script>

<div class="flex-1 space-y-6 p-6">
	<!-- Header with Add Button -->
	<div class="flex items-center justify-between mb-6">
		<div>
			<h2 class="text-2xl font-bold text-white">Debt Management</h2>
			<p class="text-gray-400">Track and manage your debt payments</p>
		</div>
		
		<Dialog bind:open={isAddDebtOpen}>
			<Button 
				onclick={() => isAddDebtOpen = true}
				class="bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600"
			>
				<Plus class="h-4 w-4 mr-2" />
				Add Debt
			</Button>
			<DialogContent class="sm:max-w-[425px] bg-gray-800 border-gray-700 text-white">
				<DialogHeader>
					<DialogTitle>Add New Debt</DialogTitle>
					<DialogDescription class="text-gray-400">Record a new debt to track and manage</DialogDescription>
				</DialogHeader>
				<form onsubmit={handleAddDebt} class="space-y-4">
					<div class="space-y-2">
						<Label for="description">Description</Label>
						<Input
							id="description"
							name="description"
							placeholder="e.g., Credit Card, Student Loan"
							required
							class="bg-gray-700 border-gray-600"
						/>
					</div>

					<div class="space-y-2">
						<Label for="type">Type</Label>
						<select name="type" required class="bg-gray-700 border-gray-600 rounded px-3 py-2 text-white">
							<option value="">Select debt type</option>
							<option value="bank">Bank</option>
							<option value="personal">Personal</option>
						</select>
					</div>

					<div class="space-y-2">
						<Label for="amount">Amount</Label>
						<Input
							id="amount"
							name="amount"
							type="number"
							step="0.01"
							placeholder="0.00"
							required
							class="bg-gray-700 border-gray-600"
						/>
					</div>

					<div class="space-y-2">
						<Label for="interestRate">Interest Rate (%)</Label>
						<Input
							id="interestRate"
							name="interestRate"
							type="number"
							step="0.01"
							placeholder="0.00"
							required
							class="bg-gray-700 border-gray-600"
						/>
					</div>

					<div class="space-y-2">
						<Label for="takenFrom">Taken From</Label>
						<Input
							id="takenFrom"
							name="takenFrom"
							placeholder="e.g., Chase Bank, John Doe"
							required
							class="bg-gray-700 border-gray-600"
						/>
					</div>

					<div class="space-y-2">
						<Label for="startDate">Start Date</Label>
						<Input 
							id="startDate" 
							name="startDate" 
							type="date" 
							required 
							class="bg-gray-700 border-gray-600" 
						/>
					</div>

					<div class="space-y-2">
						<Label for="expirationDate">Expiration Date</Label>
						<Input
							id="expirationDate"
							name="expirationDate"
							type="date"
							required
							class="bg-gray-700 border-gray-600"
						/>
					</div>

					<Button
						type="submit"
						class="w-full bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600"
					>
						Add Debt
					</Button>
				</form>
			</DialogContent>
		</Dialog>
	</div>

	<!-- Debt Overview -->
	<div class="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
		<Card class="bg-gray-900 border-gray-800">
			<CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
				<CardTitle class="text-sm font-medium text-white">Total Debt</CardTitle>
				<Wallet class="h-4 w-4 text-gray-400" />
			</CardHeader>
			<CardContent>
				<div class="text-2xl font-bold text-red-600">${totalDebt.toLocaleString()}</div>
				<p class="text-xs text-gray-400">{debts.length} active debts</p>
			</CardContent>
		</Card>

		<Card class="bg-gray-900 border-gray-800">
			<CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
				<CardTitle class="text-sm font-medium text-white">Monthly Payments</CardTitle>
				<DollarSign class="h-4 w-4 text-gray-400" />
			</CardHeader>
			<CardContent>
				<div class="text-2xl font-bold text-white">${totalMinimumPayment}</div>
				<p class="text-xs text-gray-400">Minimum required</p>
			</CardContent>
		</Card>

		<Card class="bg-gray-900 border-gray-800">
			<CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
				<CardTitle class="text-sm font-medium text-white">Highest Interest</CardTitle>
				<TrendingDown class="h-4 w-4 text-gray-400" />
			</CardHeader>
			<CardContent>
				<div class="text-2xl font-bold text-white">{highestInterestRate}%</div>
				<p class="text-xs text-gray-400">{highestInterestDebt?.name || 'N/A'}</p>
			</CardContent>
		</Card>

		<Card class="bg-gray-900 border-gray-800">
			<CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
				<CardTitle class="text-sm font-medium text-white">Debt-Free Date</CardTitle>
				<CreditCard class="h-4 w-4 text-gray-400" />
			</CardHeader>
			<CardContent>
				<div class="text-2xl font-bold text-white">2029</div>
				<p class="text-xs text-gray-400">At current rate</p>
			</CardContent>
		</Card>
	</div>

	<!-- Debt List -->
	<Card class="bg-gray-900 border-gray-800">
		<CardHeader>
			<CardTitle class="text-white">Your Debts</CardTitle>
			<div class="flex items-center justify-between text-gray-400">
				<span>
					Showing {paginatedData.startIndex}-{paginatedData.endIndex} of {paginatedData.totalCount} debts
				</span>
				<span class="text-sm">
					Page {currentPage} of {paginatedData.totalPages}
				</span>
			</div>
		</CardHeader>
		<CardContent>
			<div class="space-y-6">
				{#each paginatedData.debts as debt (debt.id)}
					{@const payoffPercentage = ((debt.originalAmount - debt.balance) / debt.originalAmount) * 100}
					
					<div class="border border-gray-700 rounded-lg p-4 space-y-4 bg-gray-800">
						<div class="flex items-center justify-between">
							<div>
								<div class="flex items-center gap-2">
									<h3 class="font-semibold text-white">{debt.name}</h3>
									<Badge variant={debt.type === "bank" ? "default" : "secondary"}>{debt.type}</Badge>
								</div>
								<p class="text-sm text-gray-400">
									{debt.interestRate}% APR • Due: {debt.dueDate}
								</p>
								<p class="text-xs text-gray-500">From: {debt.takenFrom}</p>
							</div>
							<div class="text-right">
								<p class="text-lg font-bold text-white">${debt.balance.toLocaleString()}</p>
								<Badge variant="secondary">Min: ${debt.minimumPayment}</Badge>
							</div>
						</div>

						<div class="space-y-2">
							<div class="flex justify-between text-sm text-gray-300">
								<span>Progress</span>
								<span>{payoffPercentage.toFixed(1)}% paid off</span>
							</div>
							<Progress value={payoffPercentage} class="h-2" />
						</div>

						<div class="flex gap-2">
							<Dialog 
								bind:open={isPaymentOpen} 
								onOpenChange={(open) => {
									if (!open) selectedDebt = null;
								}}
							>
								<DialogTrigger asChild>
									<Button 
										variant="outline" 
										size="sm" 
										onclick={() => {
											selectedDebt = debt.id;
											isPaymentOpen = true;
										}}
										class="border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white"
									>
										Make Payment
									</Button>
								</DialogTrigger>
								{#if selectedDebt === debt.id}
									<DialogContent class="bg-gray-800 border-gray-700 text-white">
										<DialogHeader>
											<DialogTitle>Make Payment - {debt.name}</DialogTitle>
											<DialogDescription class="text-gray-400">
												Current balance: ${debt.balance.toLocaleString()}
											</DialogDescription>
										</DialogHeader>
										<form onsubmit={handlePayment} class="space-y-4">
											<div class="space-y-2">
												<Label for="amount">Payment Amount</Label>
												<Input
													id="amount"
													name="amount"
													type="number"
													step="0.01"
													placeholder={debt.minimumPayment.toString()}
													min={0}
													max={debt.balance}
													required
													class="bg-gray-700 border-gray-600"
												/>
											</div>
											<div class="flex gap-2">
												<Button
													type="button"
													variant="outline"
													onclick={() => setMinimumPayment(debt.id)}
													class="border-gray-600 text-gray-300 hover:bg-gray-700"
												>
													Minimum (${debt.minimumPayment})
												</Button>
												<Button
													type="button"
													variant="outline"
													onclick={() => setPayoffAmount(debt.id)}
													class="border-gray-600 text-gray-300 hover:bg-gray-700"
												>
													Pay Off (${debt.balance})
												</Button>
											</div>
											<Button 
												type="submit" 
												class="w-full bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600"
											>
												Record Payment
											</Button>
										</form>
									</DialogContent>
								{/if}
							</Dialog>

							<Button 
								variant="ghost" 
								size="sm"
								class="text-gray-400 hover:text-white hover:bg-gray-700"
							>
								View Details
							</Button>
						</div>
					</div>
				{/each}
			</div>

			{#if paginatedData.totalPages > 1}
				<div class="flex items-center justify-between pt-4 border-t border-gray-800">
					<div class="flex items-center gap-2">
						<Button
							variant="outline"
							size="sm"
							onclick={() => currentPage = Math.max(1, currentPage - 1)}
							disabled={currentPage === 1}
							class="border-gray-600 text-gray-300 hover:bg-gray-700"
						>
							Previous
						</Button>
						<Button
							variant="outline"
							size="sm"
							onclick={() => currentPage = Math.min(paginatedData.totalPages, currentPage + 1)}
							disabled={currentPage === paginatedData.totalPages}
							class="border-gray-600 text-gray-300 hover:bg-gray-700"
						>
							Next
						</Button>
					</div>
					
					<div class="flex items-center gap-1">
						{#each Array.from({ length: Math.min(5, paginatedData.totalPages) }, (_, i) => i + 1) as pageNum}
							{@const isActive = pageNum === currentPage}
							<Button
								variant={isActive ? "default" : "outline"}
								size="sm"
								onclick={() => currentPage = pageNum}
								class={isActive
									? "bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600"
									: "border-gray-600 text-gray-300 hover:bg-gray-700"}
							>
								{pageNum}
							</Button>
						{/each}
						
						{#if paginatedData.totalPages > 5}
							<span class="text-gray-400 px-2">...</span>
							<Button
								variant={currentPage === paginatedData.totalPages ? "default" : "outline"}
								size="sm"
								onclick={() => currentPage = paginatedData.totalPages}
								class={currentPage === paginatedData.totalPages
									? "bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600"
									: "border-gray-600 text-gray-300 hover:bg-gray-700"}
							>
								{paginatedData.totalPages}
							</Button>
						{/if}
					</div>
					
					<div class="text-sm text-gray-400">
						Showing {paginatedData.startIndex}-{paginatedData.endIndex} of {paginatedData.totalCount}
					</div>
				</div>
			{/if}
		</CardContent>
	</Card>

	<!-- Debt Payoff Strategy -->
	<Card class="bg-gray-900 border-gray-800">
		<CardHeader>
			<CardTitle class="text-white">Payoff Strategy</CardTitle>
			<div class="text-gray-400">AI-recommended debt payoff plan</div>
		</CardHeader>
		<CardContent>
			<div class="space-y-4">
				<div class="p-4 bg-blue-900/20 border border-blue-800 rounded-lg">
					<h4 class="font-semibold text-blue-300">Debt Avalanche Method Recommended</h4>
					<p class="text-sm text-blue-400 mt-1">
						Focus on paying off your Payday Loan first (35.0% interest) to save the most money on interest.
					</p>
				</div>

				<div class="space-y-3">
					<h4 class="font-medium text-white">Suggested Payment Order:</h4>
					<div class="space-y-2">
						<div class="flex items-center justify-between p-3 border border-gray-700 rounded bg-gray-800">
							<div>
								<span class="font-medium text-white">1. Payday Loan</span>
								<p class="text-sm text-gray-400">35.0% APR - Pay extra here first</p>
							</div>
							<Badge variant="destructive">High Priority</Badge>
						</div>
						<div class="flex items-center justify-between p-3 border border-gray-700 rounded bg-gray-800">
							<div>
								<span class="font-medium text-white">2. Store Credit Card</span>
								<p class="text-sm text-gray-400">24.99% APR - Pay minimum for now</p>
							</div>
							<Badge variant="destructive">High Priority</Badge>
						</div>
						<div class="flex items-center justify-between p-3 border border-gray-700 rounded bg-gray-800">
							<div>
								<span class="font-medium text-white">3. Credit Card</span>
								<p class="text-sm text-gray-400">18.99% APR - Pay minimum for now</p>
							</div>
							<Badge variant="secondary">Medium Priority</Badge>
						</div>
					</div>
				</div>
			</div>
		</CardContent>
	</Card>
</div> 