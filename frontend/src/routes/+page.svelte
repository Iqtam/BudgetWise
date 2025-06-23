<script lang="ts">
	import { onMount } from 'svelte';
	import { Card, CardContent } from '$lib/components/ui/card';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import {
		ArrowRight,
		BarChart3,
		Bot,
		CreditCard,
		DollarSign,
		PiggyBank,
		Shield,
		Target,
		Zap,
		Star
	} from 'lucide-svelte';
	import AnimatedCounter from '$lib/components/AnimatedCounter.svelte';
	import TestimonialsCarousel from '$lib/components/TestimonialsCarousel.svelte';

	const features = [
		{
			icon: Bot,
			title: 'AI-Powered Insights',
			description:
				'Get personalized financial advice and automated transaction categorization with intelligent AI.'
		},
		{
			icon: CreditCard,
			title: 'Smart Transaction Tracking',
			description:
				'Log expenses through chat, OCR receipt scanning, or manual entry. Never miss a transaction.'
		},
		{
			icon: Target,
			title: 'Goal-Based Budgeting',
			description:
				'Set realistic budgets and savings goals with AI recommendations based on your patterns.'
		},
		{
			icon: PiggyBank,
			title: 'Debt & Savings Management',
			description: 'Track debts, plan payoffs, and grow your savings with intelligent strategies.'
		},
		{
			icon: BarChart3,
			title: 'Advanced Analytics',
			description:
				'Visualize your financial health with detailed charts, trends, and spending analysis.'
		},
		{
			icon: Shield,
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
	<nav class="border-b border-gray-800 bg-gray-900/80 backdrop-blur-sm sticky top-0 z-50">
		<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
			<div class="flex justify-between items-center h-16">
				<div class="flex items-center gap-2">
					<div
						class="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-r from-blue-500 to-green-500"
					>
						<DollarSign class="h-4 w-4 text-white" />
					</div>
					<span class="text-xl font-bold">BudgetWise</span>
				</div>
				<div class="hidden md:flex items-center space-x-8">
					<a href="#features" class="text-gray-300 hover:text-white transition-colors">Features</a>
					<a href="#testimonials" class="text-gray-300 hover:text-white transition-colors"
						>Reviews</a>
					<a href="#pricing" class="text-gray-300 hover:text-white transition-colors">Pricing</a>
					<Button variant="secondary" class="bg-gray-800 text-white hover:bg-gray-700 border-gray-600">
						<a href="/signin">Sign In</a>
					</Button>
					<Button class="bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600">
						<a href="/signup">Get Started</a>
					</Button>
				</div>
			</div>
		</div>
	</nav>

	<!-- Hero Section -->
	<section class="relative py-20 lg:py-32 overflow-hidden">
		<div class="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-gray-900 to-green-900/20"></div>
		<div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
			<div class="text-center">
				<Badge variant="secondary" class="mb-6 bg-gray-800 text-gray-300 border-gray-700">
					<Zap class="h-3 w-3 mr-1" />
					AI-Powered Finance Management
				</Badge>
				<h1 class="text-4xl md:text-6xl lg:text-7xl font-bold mb-6">
					Take Control of Your
					<span
						class="block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-green-400"
					>
						Financial Future
					</span>
				</h1>
				<p class="text-xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
					BudgetWise is an AI-powered personal finance platform that helps you track income,
					expenses, debt, and savings automatically. Get intelligent insights and achieve your
					financial goals.
				</p>
				<div class="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
					<Button
						size="lg"
						class="text-lg px-8 py-4 bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600"
					>
						<a href="/signup" class="flex items-center">
							Start Free Trial
							<ArrowRight class="ml-2 h-5 w-5" />
						</a>
					</Button>
					<Button
						size="lg"
						variant="secondary"
						class="text-lg px-8 py-4 bg-gray-800 text-white hover:bg-gray-700 border-gray-600"
					>
						<a href="#demo">Watch Demo</a>
					</Button>
				</div>
			</div>
		</div>
	</section>

	<!-- Stats Section -->
	<section class="py-20 bg-gray-800/50">
		<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
			<div class="grid grid-cols-2 md:grid-cols-4 gap-8">
				{#each stats as stat, index}
					<div class="text-center">
						<div
							class="text-3xl md:text-4xl lg:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-green-400 mb-2"
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
						<div class="text-gray-400 text-lg">{stat.label}</div>
					</div>
				{/each}
			</div>
		</div>
	</section>

	<!-- Features Section -->
	<section id="features" class="py-20">
		<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
			<div class="text-center mb-16">
				<h2 class="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
					Everything You Need to
					<span
						class="block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-green-400"
					>
						Master Your Money
					</span>
				</h2>
				<p class="text-xl text-gray-300 max-w-3xl mx-auto">
					From AI-powered insights to automated tracking, BudgetWise provides all the tools you need
					for complete financial control.
				</p>
			</div>
			<div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
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
			</div>
		</div>
	</section>

	<!-- Testimonials Section -->
	<section id="testimonials" class="py-20 bg-gray-800/30">
		<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
			<div class="text-center mb-16">
				<h2 class="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
					Loved by
					<span class="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-green-400">
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
	<section class="py-20 bg-gradient-to-r from-blue-900/50 to-green-900/50">
		<div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
			<h2 class="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6">
				Ready to Transform Your
				<span
					class="block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-green-400"
				>
					Financial Life?
				</span>
			</h2>
			<p class="text-xl text-gray-300 mb-8">
				Join thousands of users who have already taken control of their finances with BudgetWise.
			</p>
			<Button
				size="lg"
				class="text-lg px-8 py-4 bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600"
			>
				<a href="/signup" class="flex items-center">
					Start Your Free Trial
					<ArrowRight class="ml-2 h-5 w-5" />
				</a>
			</Button>
			<p class="text-sm text-gray-400 mt-4">Start your 30-day free trial. No credit card required.</p>
		</div>
	</section>

	<!-- Footer -->
	<footer class="bg-gray-900 border-t border-gray-800 py-12">
		<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
			<div class="grid md:grid-cols-4 gap-8">
				<div>
					<div class="flex items-center gap-2 mb-4">
						<div
							class="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-r from-blue-500 to-green-500"
						>
							<DollarSign class="h-4 w-4 text-white" />
						</div>
						<span class="text-xl font-bold">BudgetWise</span>
					</div>
					<p class="text-gray-400 mb-4">
						AI-powered personal finance management that helps you take control of your financial
						future.
					</p>
				</div>
				<div>
					<h3 class="font-semibold mb-4 text-white">Product</h3>
					<ul class="space-y-2 text-gray-400">
						<li><a href="#features" class="hover:text-white transition-colors">Features</a></li>
						<li><a href="#pricing" class="hover:text-white transition-colors">Pricing</a></li>
						<li><a href="/security" class="hover:text-white transition-colors">Security</a></li>
						<li><a href="/api" class="hover:text-white transition-colors">API</a></li>
					</ul>
				</div>
				<div>
					<h3 class="font-semibold mb-4 text-white">Company</h3>
					<ul class="space-y-2 text-gray-400">
						<li><a href="/about" class="hover:text-white transition-colors">About</a></li>
						<li><a href="/blog" class="hover:text-white transition-colors">Blog</a></li>
						<li><a href="/careers" class="hover:text-white transition-colors">Careers</a></li>
						<li><a href="/contact" class="hover:text-white transition-colors">Contact</a></li>
					</ul>
				</div>
				<div>
					<h3 class="font-semibold mb-4 text-white">Support</h3>
					<ul class="space-y-2 text-gray-400">
						<li><a href="/help" class="hover:text-white transition-colors">Help Center</a></li>
						<li><a href="/privacy" class="hover:text-white transition-colors">Privacy Policy</a></li>
						<li><a href="/terms" class="hover:text-white transition-colors">Terms of Service</a></li>
						<li><a href="/status" class="hover:text-white transition-colors">Status</a></li>
					</ul>
				</div>
			</div>
			<div class="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
				<p>&copy; 2024 BudgetWise. All rights reserved.</p>
			</div>
		</div>
	</footer>
</div>
