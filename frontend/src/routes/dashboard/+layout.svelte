<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import Icon from '@iconify/svelte';
	import { Button } from '$lib/components/ui/button';
	import { Badge } from '$lib/components/ui/badge';
	import { Avatar, AvatarFallback } from '$lib/components/ui/avatar';
	import { signOut } from '$lib/services/auth';
	import { firebaseUser, backendUser } from '$lib/stores/auth';
	import UserProfile from '$lib/components/UserProfile.svelte';
	let sidebarOpen = $state(true);
	let notificationCount = $state(3);
	let theme = $state('dark');
	let profileDialogOpen = $state(false);

	const navigationItems = [
		{ title: 'Dashboard', url: '/dashboard', icon: 'lucide:home' },
		{ title: 'Transactions', url: '/dashboard/transactions', icon: 'lucide:credit-card' },
		{ title: 'Budget', url: '/dashboard/budget', icon: 'lucide:target' },
		{ title: 'Debt Management', url: '/dashboard/debt', icon: 'lucide:wallet' },
		{ title: 'Savings Goals', url: '/dashboard/goals', icon: 'lucide:goal' }
	];

	const financialToolsItems = [
		{ title: 'Analytics', url: '/dashboard/analytics', icon: 'lucide:bar-chart-3' }
	];

	const aiItems = [{ title: 'AI Assistant', url: '/dashboard/chat', icon: 'lucide:bot' }];
	async function handleSignOut() {
		// Show confirmation dialog
		const confirmed = confirm('Do you want to log out?');
		if (!confirmed) {
			return;
		}

		try {
			await signOut();
			goto('/signin');
		} catch (error) {
			console.error('Error signing out:', error);
		}
	}

	// Page mapping for dynamic titles
	const pageMap: Record<string, { title: string; subtitle?: string }> = {
		'/dashboard': {
			title: 'Dashboard',
			subtitle: 'Overview of your financial health'
		},
		'/dashboard/transactions': {
			title: 'Transactions',
			subtitle: 'Track and manage your transactions'
		},
		'/dashboard/budget': {
			title: 'Budget',
			subtitle: 'Set and monitor your spending limits'
		},
		'/dashboard/goals': {
			title: 'Savings Goals',
			subtitle: 'Track progress toward your financial goals'
		},
		'/dashboard/debt': {
			title: 'Debt Management',
			subtitle: 'Track and pay down your debts'
		},
		'/dashboard/savings': {
			title: 'Savings',
			subtitle: 'Build and manage your savings'
		},
		'/dashboard/chat': {
			title: 'AI Assistant',
			subtitle: 'Get personalized financial advice'
		},
		'/dashboard/analytics': {
			title: 'Analytics',
			subtitle: 'Detailed insights and reports'
		}
	};

	const currentPage = $derived(
		pageMap[$page.url.pathname] || { title: 'BudgetWise', subtitle: 'Personal Finance Management' }
	);

	function toggleSidebar() {
		sidebarOpen = !sidebarOpen;
	}

	function handleNotificationClick() {
		notificationCount = 0;
		console.log('Notifications clicked');
	}
	function handleThemeToggle() {
		theme = theme === 'dark' ? 'light' : 'dark';
		console.log(`Theme changed to ${theme}`);
	}

	function openProfileDialog() {
		profileDialogOpen = true;
	}

	function isActiveRoute(url: string) {
		return $page.url.pathname === url;
	}

	let { children } = $props();
</script>

<div class="flex h-screen w-full bg-gray-950">
	<!-- Sidebar -->
	<div
		class={`${sidebarOpen ? 'w-64' : 'w-16'} flex h-full flex-col border-r border-gray-800 bg-gray-900 transition-all duration-300`}
	>
		<!-- Sidebar Header -->
		<div class="flex-shrink-0 border-b border-gray-800 p-4">
			<div class="flex items-center justify-between">
				<a href="/" class="flex items-center gap-2">
					<div
						class="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-r from-blue-500 to-green-500"
					>
						<Icon icon="lucide:dollar-sign" class="h-4 w-4 text-white" />
					</div>
					{#if sidebarOpen}
						<div class="flex flex-col">
							<span class="text-lg font-semibold text-white">BudgetWise</span>
							<span class="text-xs text-gray-400">AI Finance Manager</span>
						</div>
					{/if}
				</a>
				{#if sidebarOpen}
					<Button
						variant="ghost"
						size="sm"
						onclick={toggleSidebar}
						class="h-8 w-8 text-gray-400 hover:bg-gray-800 hover:text-white"
					>
						<Icon icon="lucide:menu" class="h-4 w-4" />
					</Button>
				{/if}
			</div>
		</div>

		<!-- Sidebar Content -->
		<div class="flex-1 overflow-auto p-4">
			<!-- Navigation Section -->
			<div class="mb-6">
				{#if sidebarOpen}
					<h3 class="mb-2 text-xs font-medium uppercase tracking-wider text-gray-400">
						Navigation
					</h3>
				{/if}
				<nav class="space-y-1">
					{#each navigationItems as item}
						<a
							href={item.url}
							class={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
								isActiveRoute(item.url)
									? 'border-r-2 border-blue-500 bg-gradient-to-r from-blue-500/20 to-green-500/20 text-white'
									: 'text-gray-300 hover:bg-gray-800 hover:text-white'
							}`}
						>
							<Icon icon={item.icon} class="h-4 w-4" />
							{#if sidebarOpen}
								<span>{item.title}</span>
							{/if}
						</a>
					{/each}
				</nav>
			</div>

			<!-- Financial Tools Section -->
			<div class="mb-6">
				{#if sidebarOpen}
					<h3 class="mb-2 text-xs font-medium uppercase tracking-wider text-gray-400">
						Financial Tools
					</h3>
				{/if}
				<nav class="space-y-1">
					{#each financialToolsItems as item}
						<a
							href={item.url}
							class={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
								isActiveRoute(item.url)
									? 'border-r-2 border-blue-500 bg-gradient-to-r from-blue-500/20 to-green-500/20 text-white'
									: 'text-gray-300 hover:bg-gray-800 hover:text-white'
							}`}
						>
							<Icon icon={item.icon} class="h-4 w-4" />
							{#if sidebarOpen}
								<span>{item.title}</span>
							{/if}
						</a>
					{/each}
				</nav>
			</div>

			<!-- AI Section -->
			<div>
				{#if sidebarOpen}
					<h3 class="mb-2 text-xs font-medium uppercase tracking-wider text-gray-400">
						AI Assistant
					</h3>
				{/if}
				<nav class="space-y-1">
					{#each aiItems as item}
						<a
							href={item.url}
							class={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
								isActiveRoute(item.url)
									? 'border-r-2 border-blue-500 bg-gradient-to-r from-blue-500/20 to-green-500/20 text-white'
									: 'text-gray-300 hover:bg-gray-800 hover:text-white'
							}`}
						>
							<Icon icon={item.icon} class="h-4 w-4" />
							{#if sidebarOpen}
								<span>{item.title}</span>
							{/if}
						</a>
					{/each}
				</nav>
			</div>
		</div>
		<!-- Sidebar Footer -->
		<div class="flex-shrink-0 border-t border-gray-800 p-4">
			<div class="flex items-center justify-between gap-2">
				<button
					class="flex flex-1 cursor-pointer items-center gap-2 rounded-lg p-2 text-left transition-colors hover:bg-gray-800"
					onclick={openProfileDialog}
				>
					<Avatar class="h-8 w-8">
						<AvatarFallback class="bg-gradient-to-r from-blue-500 to-green-500 text-sm text-white">
							{$backendUser?.email?.charAt(0).toUpperCase() || 'U'}
						</AvatarFallback>
					</Avatar>
					{#if sidebarOpen}
						<div class="flex flex-col">
							<span class="text-sm font-medium text-white">{$backendUser?.email || 'User'}</span>
							<span class="text-xs text-gray-400">{$backendUser?.role || 'Member'}</span>
						</div>
					{/if}
				</button>
				{#if sidebarOpen}
					<Button
						variant="ghost"
						size="sm"
						class="text-gray-400 hover:bg-gray-800 hover:text-white"
						onclick={handleSignOut}
					>
						<Icon icon="lucide:log-out" class="h-4 w-4" />
					</Button>
				{/if}
			</div>
		</div>
	</div>

	<!-- Main Content -->
	<div class="flex h-full flex-1 flex-col overflow-hidden">
		<!-- Top Bar -->
		<header
			class="flex h-16 shrink-0 items-center gap-2 border-b border-gray-800 bg-gray-900/95 px-4 backdrop-blur-sm"
		>
			<!-- Sidebar Toggle Button - Only show when sidebar is closed -->
			{#if !sidebarOpen}
				<Button
					variant="ghost"
					size="sm"
					class="h-9 w-9 text-gray-400 hover:bg-gray-800 hover:text-white"
					onclick={toggleSidebar}
				>
					<Icon icon="lucide:menu" class="h-4 w-4" />
				</Button>
			{/if}

			<div class="flex flex-1 items-center justify-between">
				<div class="flex flex-col">
					<h1 class="text-lg font-semibold text-white">{currentPage.title}</h1>
					{#if currentPage.subtitle}
						<p class="text-sm text-gray-400">{currentPage.subtitle}</p>
					{/if}
				</div>

				<div class="flex items-center gap-2">
					<!-- Notifications -->
					<!-- <Button
						variant="ghost"
						size="sm"
						class="relative h-9 w-9 text-gray-400 hover:bg-gray-800 hover:text-white"
						onclick={handleNotificationClick}
					>
						<Icon icon="lucide:bell" class="h-4 w-4" />
						{#if notificationCount > 0}
							<Badge
								class="absolute -right-1 -top-1 h-5 w-5 rounded-full bg-red-500 p-0 text-xs text-white"
							>
								{notificationCount}
							</Badge>
						{/if}
					</Button> -->

					<!-- Theme Toggle -->
					<!-- <Button
						variant="ghost"
						size="sm"
						class="h-9 w-9 text-gray-400 hover:bg-gray-800 hover:text-white"
						onclick={handleThemeToggle}
					>
						{#if theme === 'dark'}
							<Icon icon="lucide:sun" class="h-4 w-4" />
						{:else}
							<Icon icon="lucide:moon" class="h-4 w-4" />
						{/if}
					</Button> -->
					<!-- Logout Button -->
					<Button
						variant="ghost"
						size="sm"
						class="flex h-9 items-center gap-2 px-3 text-gray-400 hover:bg-gray-800 hover:text-white"
						onclick={handleSignOut}
					>
						<Icon icon="lucide:log-out" class="h-4 w-4" />
						<span class="text-sm">Logout</span>
					</Button>
				</div>
			</div>
		</header>
		<!-- Main Content Area -->
		<main class="flex-1 overflow-auto bg-gray-950">
			{@render children()}
		</main>
	</div>
</div>

<!-- User Profile Dialog -->
<UserProfile bind:open={profileDialogOpen} />
