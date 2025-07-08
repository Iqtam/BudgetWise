<script lang="ts">
	import { onMount } from 'svelte';
	import { Card, CardContent } from '$lib/components/ui/card';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import Icon from '@iconify/svelte';
	import AnimatedCounter from '$lib/components/AnimatedCounter.svelte';
	import TestimonialsCarousel from '$lib/components/TestimonialsCarousel.svelte';

	const features = [
		{
			icon: 'lucide:bot',
			title: 'AI-Powered Insights',
			description:
				'Get personalized financial advice and automated transaction categorization with intelligent AI.'
		},
		{
			icon: 'lucide:credit-card',
			title: 'Smart Transaction Tracking',
			description:
				'Log expenses through chat, OCR receipt scanning, or manual entry. Never miss a transaction.'
		},
		{
			icon: 'lucide:target',
			title: 'Goal-Based Budgeting',
			description:
				'Set realistic budgets and savings goals with AI recommendations based on your patterns.'
		},
		{
			icon: 'lucide:piggy-bank',
			title: 'Debt & Savings Management',
			description: 'Track debts, plan payoffs, and grow your savings with intelligent strategies.'
		},
		{
			icon: 'lucide:bar-chart-3',
			title: 'Advanced Analytics',
			description:
				'Visualize your financial health with detailed charts, trends, and spending analysis.'
		},
		{
			icon: 'lucide:shield',
			title: 'Bank-Level Security',
			description:
				'Your financial data is protected with enterprise-grade encryption and security measures.'
		}
	];

	const stats = [
		{ number: 50000, suffix: 'K+', label: 'Active Users' },
		{ number: 2000000, prefix: '$', suffix: 'M+', label: 'Money Saved' },
		{ number: 4.9, suffix: '/5', label: 'App Rating' },
		{ number: 99.9, suffix: '%', label: 'Uptime' }
	];

	let mounted = false;

	onMount(() => {
		mounted = true;
	});
</script>

<svelte:head>
	<title>BudgetWise - AI-Powered Personal Finance</title>
	<meta
		name="description"
		content="Take control of your financial future with AI-powered insights, smart tracking, and goal-based budgeting."
	/>
</svelte:head>

<div class="min-h-screen bg-gray-900 text-white">
	<!-- Navigation -->
	<nav class="sticky top-0 z-50 border-b border-gray-800 bg-gray-900/80 backdrop-blur-sm">
		<div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
			<div class="flex h-16 items-center justify-between">
				<div class="flex items-center gap-2">
					<div
						class="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-r from-blue-500 to-green-500"
					>
						<Icon icon="lucide:dollar-sign" class="h-4 w-4 text-white" />
					</div>
					<span class="text-xl font-bold">BudgetWise</span>
				</div>
				<div class="hidden items-center space-x-8 md:flex">
					<a href="#features" class="text-gray-300 transition-colors hover:text-white">Features</a>
					<a href="#testimonials" class="text-gray-300 transition-colors hover:text-white"
						>Reviews</a
					>
					<a href="#pricing" class="text-gray-300 transition-colors hover:text-white">Pricing</a>
					<Button
						variant="secondary"
						class="border-gray-600 bg-gray-800 text-white hover:bg-gray-700"
					>
						<a href="/signin">Sign In</a>
					</Button>
					<Button
						class="bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600"
					>
						<a href="/signup">Get Started</a>
					</Button>
				</div>
			</div>
		</div>
	</nav>

	<!-- Hero Section -->
	<section class="relative overflow-hidden py-20 lg:py-32">
		<div
			class="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-gray-900 to-green-900/20"
		></div>
		<div class="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
			<div class="text-center">
				<Badge variant="secondary" class="mb-6 border-gray-700 bg-gray-800 text-gray-300">
					<Icon icon="lucide:zap" class="mr-1 h-3 w-3" />
					AI-Powered Finance Management
				</Badge>
				<h1 class="mb-6 text-4xl font-bold md:text-6xl lg:text-7xl">
					Take Control of Your
					<span
						class="block bg-gradient-to-r from-blue-400 to-green-400 bg-clip-text text-transparent"
					>
						Financial Future
					</span>
				</h1>
				<p class="mx-auto mb-8 max-w-3xl text-xl leading-relaxed text-gray-300">
					BudgetWise is an AI-powered personal finance platform that helps you track income,
					expenses, debt, and savings automatically. Get intelligent insights and achieve your
					financial goals.
				</p>
				<div class="mb-16 flex flex-col items-center justify-center gap-4 sm:flex-row">
					<Button
						size="lg"
						class="bg-gradient-to-r from-blue-500 to-green-500 px-8 py-4 text-lg hover:from-blue-600 hover:to-green-600"
					>
						<a href="/signup" class="flex items-center">
							Start Free Trial
							<Icon icon="lucide:arrow-right" class="ml-2 h-5 w-5" />
						</a>
					</Button>
					<Button
						size="lg"
						variant="secondary"
						class="border-gray-600 bg-gray-800 px-8 py-4 text-lg text-white hover:bg-gray-700"
					>
						<a href="#demo">Watch Demo</a>
					</Button>
				</div>
			</div>
		</div>
	</section>

	<!-- Stats Section -->
	<section class="bg-gray-800/50 py-20">
		<div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
			<div class="grid grid-cols-2 gap-8 md:grid-cols-4">
				{#each stats as stat, index}
					<div class="text-center">
						<div
							class="mb-2 bg-gradient-to-r from-blue-400 to-green-400 bg-clip-text text-3xl font-bold text-transparent md:text-4xl lg:text-5xl"
						>
							{#if mounted}
								<AnimatedCounter
									value={stat.number}
									prefix={stat.prefix}
									suffix={stat.suffix}
									duration={10000}
									delay={index * 50}
								/>
							{/if}
						</div>
						<div class="text-lg text-gray-400">{stat.label}</div>
					</div>
				{/each}
			</div>
		</div>
	</section>

	<!-- Features Section -->
	<section id="features" class="py-20">
		<div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
			<div class="mb-16 text-center">
				<h2 class="mb-4 text-3xl font-bold md:text-4xl lg:text-5xl">
					Everything You Need to
					<span
						class="block bg-gradient-to-r from-blue-400 to-green-400 bg-clip-text text-transparent"
					>
						Master Your Money
					</span>
				</h2>
				<p class="mx-auto max-w-3xl text-xl text-gray-300">
					From AI-powered insights to automated tracking, BudgetWise provides all the tools you need
					for complete financial control.
				</p>
			</div>
			<!-- <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
				{#each features as feature, index}
					<Card class="bg-gray-800/50 border-gray-700 hover:bg-gray-800/70 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-blue-500/10">
						<CardContent class="p-6">
							<div class="flex items-center gap-4 mb-4">
								<div
									class="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-r from-blue-500/20 to-green-500/20 border border-blue-500/30"
								>
									<svelte:component this={feature.icon} class="h-6 w-6 text-blue-400" />
								</div>
								<h3 class="text-xl font-semibold text-white">{feature.title}</h3>
							</div>
							<p class="text-gray-300 leading-relaxed">{feature.description}</p>
						</CardContent>
					</Card>
				{/each}
			</div> -->
		</div>
	</section>

	<!-- Testimonials Section -->
	<section id="testimonials" class="bg-gray-800/30 py-20">
		<div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
			<div class="mb-16 text-center">
				<h2 class="mb-4 text-3xl font-bold md:text-4xl lg:text-5xl">
					Loved by
					<span class="bg-gradient-to-r from-blue-400 to-green-400 bg-clip-text text-transparent">
						Thousands
					</span>
					of Users
				</h2>
				<p class="text-xl text-gray-300">See what our users are saying about BudgetWise</p>
			</div>
			<TestimonialsCarousel />
		</div>
	</section>

	<!-- CTA Section -->
	<section class="bg-gradient-to-r from-blue-900/50 to-green-900/50 py-20">
		<div class="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
			<h2 class="mb-6 text-3xl font-bold text-white md:text-4xl lg:text-5xl">
				Ready to Transform Your
				<span
					class="block bg-gradient-to-r from-blue-400 to-green-400 bg-clip-text text-transparent"
				>
					Financial Life?
				</span>
			</h2>
			<p class="mb-8 text-xl text-gray-300">
				Join thousands of users who have already taken control of their finances with BudgetWise.
			</p>
			<Button
				size="lg"
				class="bg-gradient-to-r from-blue-500 to-green-500 px-8 py-4 text-lg hover:from-blue-600 hover:to-green-600"
			>
				<a href="/signup" class="flex items-center">
					Start Your Free Trial
					<Icon icon="lucide:arrow-right" class="ml-2 h-5 w-5" />
				</a>
			</Button>
			<p class="mt-4 text-sm text-gray-400">
				Start your 30-day free trial. No credit card required.
			</p>
		</div>
	</section>

	<!-- Footer -->
	<footer class="border-t border-gray-800 bg-gray-900 py-12">
		<div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
			<div class="grid gap-8 md:grid-cols-4">
				<div>
					<div class="mb-4 flex items-center gap-2">
						<div
							class="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-r from-blue-500 to-green-500"
						>
							<Icon icon="lucide:dollar-sign" class="h-4 w-4 text-white" />
						</div>
						<span class="text-xl font-bold">BudgetWise</span>
					</div>
					<p class="mb-4 text-gray-400">
						AI-powered personal finance management that helps you take control of your financial
						future.
					</p>
				</div>
				<div>
					<h3 class="mb-4 font-semibold text-white">Product</h3>
					<ul class="space-y-2 text-gray-400">
						<li><a href="#features" class="transition-colors hover:text-white">Features</a></li>
						<li><a href="#pricing" class="transition-colors hover:text-white">Pricing</a></li>
						<li><a href="/security" class="transition-colors hover:text-white">Security</a></li>
						<li><a href="/api" class="transition-colors hover:text-white">API</a></li>
					</ul>
				</div>
				<div>
					<h3 class="mb-4 font-semibold text-white">Company</h3>
					<ul class="space-y-2 text-gray-400">
						<li><a href="/about" class="transition-colors hover:text-white">About</a></li>
						<li><a href="/blog" class="transition-colors hover:text-white">Blog</a></li>
						<li><a href="/careers" class="transition-colors hover:text-white">Careers</a></li>
						<li><a href="/contact" class="transition-colors hover:text-white">Contact</a></li>
					</ul>
				</div>
				<div>
					<h3 class="mb-4 font-semibold text-white">Support</h3>
					<ul class="space-y-2 text-gray-400">
						<li><a href="/help" class="transition-colors hover:text-white">Help Center</a></li>
						<li>
							<a href="/privacy" class="transition-colors hover:text-white">Privacy Policy</a>
						</li>
						<li>
							<a href="/terms" class="transition-colors hover:text-white">Terms of Service</a>
						</li>
						<li><a href="/status" class="transition-colors hover:text-white">Status</a></li>
					</ul>
				</div>
			</div>
			<div class="mt-8 border-t border-gray-800 pt-8 text-center text-gray-400">
				<p>&copy; 2024 BudgetWise. All rights reserved.</p>
			</div>
		</div>
	</footer>
</div>
