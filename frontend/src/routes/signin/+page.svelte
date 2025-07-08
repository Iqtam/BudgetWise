<script lang="ts">
	import { goto } from '$app/navigation';
	import { Button } from '$lib/components/ui/button';
	import {
		Card,
		CardContent,
		CardDescription,
		CardHeader,
		CardTitle
	} from '$lib/components/ui/card';
	import { Input } from '$lib/components/ui/input';
	import { Separator } from '$lib/components/ui/separator';
	import Icon from '@iconify/svelte';
	import { signIn, signInWithGoogle } from '$lib/services/auth';
	import { firebaseUser, backendUser, loading } from '$lib/stores/auth';

	let email = '';
	let password = '';
	let showPassword = false;
	let rememberMe = false;
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
	async function handleEmailSignIn(e: Event) {
		e.preventDefault();
		try {
			isLoading = true;
			error = '';
			await signIn(email, password);
			showToast('Welcome back!', 'You have successfully signed in to BudgetWise.');
			// Redirect is handled by reactive statement above
		} catch (e) {
			if (e instanceof Error) {
				error = e.message;
				showToast('Sign in failed', e.message, 'destructive');
			} else {
				error = 'Failed to sign in. Please check your credentials.';
				showToast('Sign in failed', 'Please check your email and password.', 'destructive');
			}
			console.error(e);
		} finally {
			isLoading = false;
		}
	}

	async function handleGoogleSignIn() {
		try {
			isGoogleLoading = true;
			error = '';

			console.log('Attempting Google sign-in...');
			await signInWithGoogle();
			showToast('Welcome back!', 'You have successfully signed in with Google.');
			// Redirect is handled by reactive statement above
		} catch (e) {
			console.error('Google sign-in error:', e);

			if (e instanceof Error) {
				// Handle specific error case for redirect
				if (e.message === 'Redirect initiated. Please wait for page to reload.') {
					showToast('Redirecting...', 'Please wait while we redirect you to Google.', 'default');
					// Don't set error in this case
					return;
				}

				error = e.message;
				showToast('Sign in failed', e.message, 'destructive');
			} else {
				error = 'Failed to sign in with Google.';
				showToast('Sign in failed', 'Failed to sign in with Google.', 'destructive');
			}
		} finally {
			isGoogleLoading = false;
		}
	}

	// Auto-redirect if already authenticated
	$: if ($firebaseUser && $backendUser) {
		goto('/dashboard');
	}
</script>

<svelte:head>
	<title>Sign In - BudgetWise</title>
	<meta
		name="description"
		content="Sign in to your BudgetWise account to continue your financial journey"
	/>
</svelte:head>

<div class="flex min-h-screen items-center justify-center bg-gray-900 p-4 text-white">
	{#if notification.show}
		<div
			class="fixed right-4 top-4 z-50 rounded-lg p-4 shadow-lg {notification.variant ===
			'destructive'
				? 'bg-red-600 text-white'
				: 'bg-green-600 text-white'}"
		>
			<div class="font-semibold">{notification.title}</div>
			<div class="text-sm">{notification.description}</div>
		</div>
	{/if}

	<div class="w-full max-w-md">
		<!-- Header -->
		<Card class="border-gray-700 bg-gray-800 shadow-lg">
			<CardHeader class="py-8 text-center">
				<div class="mb-6 flex justify-center">
					<a href="/" class="flex items-center gap-2 transition-opacity hover:opacity-80">
						<div
							class="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-r from-blue-500 to-green-500"
						>
							<Icon icon="lucide:dollar-sign" class="h-5 w-5 text-white" />
						</div>
						<span class="text-2xl font-bold text-white">BudgetWise</span>
					</a>
				</div>
				<h1 class="mb-2 text-2xl font-bold text-white">Welcome Back</h1>
				<p class="text-gray-400">Sign in to continue to your dashboard</p>
			</CardHeader>
			<CardContent class="space-y-6 px-8 pb-8">
				<!-- Email/Password Form -->
				<form on:submit={handleEmailSignIn} class="space-y-6">
					<div class="space-y-2">
						<label for="email" class="text-sm font-medium text-gray-300">Email</label>
						<div class="relative">
							<Icon
								icon="lucide:mail"
								class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
							/>
							<Input
								id="email"
								type="email"
								placeholder="Enter your email"
								bind:value={email}
								class="h-12 border-gray-600 bg-gray-700 pl-10 text-white placeholder-gray-400"
								required
								disabled={isLoading || isGoogleLoading}
							/>
						</div>
					</div>

					<div class="space-y-2">
						<label for="password" class="text-sm font-medium text-gray-300">Password</label>
						<div class="relative">
							<Icon
								icon="lucide:lock"
								class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
							/>
							<Input
								id="password"
								type={showPassword ? 'text' : 'password'}
								placeholder="Enter your password"
								bind:value={password}
								class="h-12 border-gray-600 bg-gray-700 pl-10 pr-10 text-white placeholder-gray-400"
								required
								disabled={isLoading || isGoogleLoading}
							/>
							<button
								type="button"
								class="absolute right-0 top-0 h-full cursor-pointer rounded-r-md border-none bg-transparent px-3 py-2 transition-colors hover:bg-gray-600"
								on:click={() => (showPassword = !showPassword)}
								disabled={isLoading || isGoogleLoading}
							>
								{#if showPassword}
									<Icon icon="lucide:eye-off" class="h-4 w-4 text-gray-400 hover:text-gray-200" />
								{:else}
									<Icon icon="lucide:eye" class="h-4 w-4 text-gray-400 hover:text-gray-200" />
								{/if}
							</button>
						</div>
					</div>

					<Button
						type="submit"
						class="h-12 w-full bg-gradient-to-r from-blue-500 to-green-500 text-base font-medium text-white hover:from-blue-600 hover:to-green-600"
						disabled={isLoading || isGoogleLoading}
					>
						{#if isLoading}
							<div
								class="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"
							></div>
							Signing in...
						{:else}
							Sign In
						{/if}
					</Button>
				</form>

				<div class="relative">
					<div class="absolute inset-0 flex items-center">
						<Separator class="w-full border-gray-600" />
					</div>
					<div class="relative flex justify-center text-xs uppercase">
						<span class="bg-gray-800 px-2 text-gray-400">Or continue with</span>
					</div>
				</div>

				<!-- Google Sign In -->
				<Button
					variant="outline"
					class="h-12 w-full border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
					onclick={handleGoogleSignIn}
					disabled={isGoogleLoading || isLoading}
				>
					{#if isGoogleLoading}
						<div
							class="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600"
						></div>
					{:else}
						<svg class="mr-2 h-5 w-5" viewBox="0 0 24 24">
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

				<div class="mt-6 text-center text-sm text-gray-400">
					Don't have an account? <a href="/signup" class="font-medium text-blue-400 hover:underline"
						>Sign Up</a
					>
				</div>

				<div class="mt-4 flex items-center justify-center gap-1 text-center text-xs text-gray-500">
					<svg class="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
						<path
							fill-rule="evenodd"
							d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
							clip-rule="evenodd"
						/>
					</svg>
					Secure authentication. No credit card required.
				</div>
			</CardContent>
		</Card>

		<!-- Footer -->
		<div class="mt-6 text-center text-xs text-gray-500">
			<p>
				By continuing, you agree to our <a href="/terms" class="text-gray-400 hover:underline"
					>Terms of Service</a
				>
				and <a href="/privacy" class="text-gray-400 hover:underline">Privacy Policy</a>
			</p>
		</div>
	</div>
</div>
