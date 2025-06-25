<script lang="ts">
	import { goto } from '$app/navigation';
	import { Button } from '$lib/components/ui/button';
	import { Card, CardContent, CardHeader } from '$lib/components/ui/card';
	import { Input } from '$lib/components/ui/input';
	import { Separator } from '$lib/components/ui/separator';
	import { DollarSign, Eye, EyeOff, Mail, Lock } from 'lucide-svelte';	import { signUp, signInWithGoogle } from "$lib/services/auth";
	import { firebaseUser, backendUser, loading } from "$lib/stores/auth";

	let email = '';
	let password = '';
	let confirmPassword = '';
	let showPassword = false;
	let isLoading = false;
	let isGoogleLoading = false;
	let error = '';

	// Toast-like notification system (simplified)
	let notification = { show: false, title: '', description: '', variant: 'default' };

	// Reactive redirect after successful authentication
	$: if (!$loading && $firebaseUser && $backendUser) {
		goto('/dashboard');
	}

	function showToast(title: string, description: string, variant: string = 'default') {
		notification = { show: true, title, description, variant };
		setTimeout(() => {
			notification.show = false;
		}, 3000);
	}

	async function handleEmailSignUp(e: Event) {
		e.preventDefault();

		if (password.length < 8) {
			showToast('Weak password', 'Password must be at least 8 characters long.', 'destructive');
			return;
		}

		if (password !== confirmPassword) {
			showToast('Password mismatch', 'Passwords do not match', 'destructive');
			return;
		}
		try {
			error = "";
			isLoading = true;
			await signUp(email, password);
			showToast('Welcome to BudgetWise!', 'Your account has been created successfully.');
			// Redirect is handled by reactive statement above
		} catch (e) {
			if (e instanceof Error) {
				error = e.message;
				showToast('Sign up failed', e.message, 'destructive');
			} else {
				error = "Failed to create an account.";
				showToast('Sign up failed', 'Failed to create an account.', 'destructive');
			}
			console.error("Sign up failed:", e);
		} finally {
			isLoading = false;
		}
	}

	async function handleGoogleSignUp() {
		try {
			isGoogleLoading = true;
			error = "";
			await signInWithGoogle();
			showToast('Welcome to BudgetWise!', 'Your account has been created with Google.');
			// Redirect is handled by reactive statement above
		} catch (e) {
			if (e instanceof Error) {
				error = e.message;
				showToast('Sign up failed', e.message, 'destructive');
			} else {
				error = "Failed to sign up with Google.";
				showToast('Sign up failed', 'Failed to sign up with Google.', 'destructive');
			}
			console.error(e);
		} finally {
			isGoogleLoading = false;
		}
	}

	// Auto-redirect if already authenticated
	$: if ($firebaseUser && $backendUser) {
		goto("/dashboard");
	}
</script>

<svelte:head>
	<title>Sign Up - BudgetWise</title>
	<meta name="description" content="Create your BudgetWise account and start your journey to financial freedom" />
</svelte:head>

<div class="min-h-screen bg-slate-900 flex items-center justify-center p-4">
	{#if notification.show}
		<div
			class="fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg {notification.variant === 'destructive'
				? 'bg-red-600 text-white'
				: 'bg-green-600 text-white'}"
		>
			<div class="font-semibold">{notification.title}</div>
			<div class="text-sm">{notification.description}</div>
		</div>
	{/if}

	<div class="w-full max-w-md">
		<Card class="bg-slate-800 border-slate-700 shadow-2xl">
			<CardHeader class="text-center py-8">
				<div class="flex justify-center items-center gap-3 mb-6">
					<div
						class="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-r from-blue-500 to-green-500"
					>
						<DollarSign class="h-6 w-6 text-white" />
					</div>
					<span class="text-3xl font-bold text-white">BudgetWise</span>
				</div>
				<h1 class="text-2xl font-bold text-white mb-2">Create Account</h1>
				<p class="text-slate-400">Start your journey to financial freedom</p>
			</CardHeader>
			<CardContent class="space-y-6 px-8 pb-8">
				<!-- Email/Password Form -->
				<form on:submit={handleEmailSignUp} class="space-y-6">
					<div class="space-y-2">
						<label for="email" class="text-sm font-medium text-white">Email</label>
						<div class="relative">
							<Mail class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />							<Input
								id="email"
								type="email"
								placeholder="Enter your email"
								bind:value={email}
								class="pl-10 h-12 bg-slate-700 border-slate-600 text-white placeholder-slate-400 focus:border-blue-500"
								required
								disabled={isLoading || isGoogleLoading}
							/>
						</div>
					</div>

					<div class="space-y-2">
						<label for="password" class="text-sm font-medium text-white">Password</label>
						<div class="relative">
							<Lock class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />							<Input
								id="password"
								type={showPassword ? 'text' : 'password'}
								placeholder="Create a strong password"
								bind:value={password}
								class="pl-10 pr-10 h-12 bg-slate-700 border-slate-600 text-white placeholder-slate-400 focus:border-blue-500"
								required
								disabled={isLoading || isGoogleLoading}
							/>
							<Button
								type="button"
								variant="ghost"
								size="sm"
								class="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
								on:click={() => (showPassword = !showPassword)}
								disabled={isLoading || isGoogleLoading}
							>
								{#if showPassword}
									<EyeOff class="h-4 w-4 text-slate-400" />
								{:else}
									<Eye class="h-4 w-4 text-slate-400" />
								{/if}							</Button>
						</div>
					</div>

					<div class="space-y-2">
						<label for="confirmPassword" class="text-sm font-medium text-white">Confirm Password</label>
						<div class="relative">
							<Lock class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
							<Input
								id="confirmPassword"
								type="password"
								placeholder="Confirm your password"
								bind:value={confirmPassword}
								class="pl-10 h-12 bg-slate-700 border-slate-600 text-white placeholder-slate-400 focus:border-blue-500"
								required
								disabled={isLoading || isGoogleLoading}
							/>
						</div>
					</div>

					<Button
						type="submit"
						class="w-full h-12 bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600 text-white font-medium text-base"
						disabled={isLoading || isGoogleLoading}
					>
						{#if isLoading}
							<div
								class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"
							></div>
							Creating account...
						{:else}
							Sign Up
						{/if}
					</Button>
				</form>

				<div class="relative">
					<div class="absolute inset-0 flex items-center">
						<Separator class="w-full border-slate-600" />
					</div>
					<div class="relative flex justify-center text-xs uppercase">
						<span class="bg-slate-800 px-3 text-slate-400">OR CONTINUE WITH</span>
					</div>
				</div>

				<!-- Google Sign Up -->
				<Button
					variant="outline"
					class="w-full h-12 bg-slate-700 border-slate-600 text-white hover:bg-slate-600"
					on:click={handleGoogleSignUp}
					disabled={isGoogleLoading || isLoading}
				>
					{#if isGoogleLoading}
						<div
							class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"
						></div>
					{:else}
						<svg class="w-5 h-5 mr-2" viewBox="0 0 24 24">
							<path
								fill="#4285F4"
								d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
							/>
							<path
								fill="#34A853"
								d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
							/>
							<path
								fill="#FBBC05"
								d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
							/>
							<path
								fill="#EA4335"
								d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
							/>
						</svg>
					{/if}
					Continue with Google
				</Button>

				<div class="text-center text-sm text-slate-400 mt-6">
					Already have an account? <a href="/signin" class="text-blue-400 hover:underline font-medium">Sign In</a>
				</div>

				<div class="text-center text-xs text-slate-500 mt-4 flex items-center justify-center gap-1">
					<svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
						<path fill-rule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clip-rule="evenodd" />
					</svg>
					Secure authentication. No credit card required.
				</div>
			</CardContent>
		</Card>

		<!-- Footer -->
		<div class="mt-6 text-center text-xs text-slate-500">
			<p>
				By continuing, you agree to our <a href="/terms" class="hover:underline text-slate-400">Terms of Service</a>
				and <a href="/privacy" class="hover:underline text-slate-400">Privacy Policy</a>
			</p>
		</div>
	</div>
</div> 