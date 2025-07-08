<script lang="ts">
	import {
		Dialog,
		DialogContent,
		DialogDescription,
		DialogHeader,
		DialogTitle,
		DialogTrigger
	} from '$lib/components/ui/dialog';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Avatar, AvatarFallback } from '$lib/components/ui/avatar';
	import { Badge } from '$lib/components/ui/badge';
	import {
		Card,
		CardContent,
		CardDescription,
		CardHeader,
		CardTitle
	} from '$lib/components/ui/card';
	import { Tabs, TabsContent, TabsList, TabsTrigger } from '$lib/components/ui/tabs';
	import Icon from '@iconify/svelte';
	import { firebaseUser, backendUser } from '$lib/stores/auth';
	import { signOut } from '$lib/services/auth';
	import { userProfileService } from '$lib/services/userProfile';
	import { goto } from '$app/navigation';

	let { open = $bindable(false) } = $props();
	let isEditing = $state(false);
	let showPasswordFields = $state(false);

	// Form fields for editing
	let editFullName = $state('');
	let editEmail = $state('');
	let currentPassword = $state('');
	let newPassword = $state('');
	let confirmPassword = $state('');

	// Initialize form fields when opening
	$effect(() => {
		if (open && $backendUser) {
			editFullName = $backendUser.UserProfile?.full_name || '';
			editEmail = $backendUser.email || '';
		}
	});

	function startEditing() {
		isEditing = true;
	}

	function cancelEditing() {
		isEditing = false;
		showPasswordFields = false;
		// Reset form fields
		editFullName = $backendUser?.UserProfile?.full_name || '';
		editEmail = $backendUser?.email || '';
		currentPassword = '';
		newPassword = '';
		confirmPassword = '';
	}

	async function saveProfile() {
		try {
			// Validate password fields if changing password
			if (showPasswordFields && newPassword) {
				if (newPassword !== confirmPassword) {
					alert('New passwords do not match');
					return;
				}
				if (newPassword.length < 6) {
					alert('New password must be at least 6 characters long');
					return;
				}
				if (!currentPassword) {
					alert('Current password is required to change password');
					return;
				}
			}

			// Update profile information
			if (editFullName !== ($backendUser?.UserProfile?.full_name || '')) {
				await userProfileService.updateProfile({
					full_name: editFullName
				});
			}

			// Update password if provided
			if (showPasswordFields && newPassword) {
				await userProfileService.updatePassword({
					currentPassword,
					newPassword
				});
			}

			// Refresh user data
			const updatedUser = await userProfileService.getUserProfile();
			backendUser.set(updatedUser);

			isEditing = false;
			showPasswordFields = false;
			currentPassword = '';
			newPassword = '';
			confirmPassword = '';

			// Show success message (you can implement toast notifications)
			alert('Profile updated successfully!');
		} catch (error) {
			console.error('Error updating profile:', error);
			alert(
				`Failed to update profile: ${error instanceof Error ? error.message : 'Please try again.'}`
			);
		}
	}

	async function handleSignOut() {
		// Show confirmation dialog
		const confirmed = confirm('Are you sure you want to sign out?');
		if (!confirmed) return;

		try {
			await signOut();
			goto('/signin');
		} catch (error) {
			console.error('Error signing out:', error);
		}
	}

	function formatDate(dateString: string) {
		return new Date(dateString).toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'long',
			day: 'numeric'
		});
	}

	function formatDateTime(dateString: string) {
		return new Date(dateString).toLocaleString('en-US', {
			year: 'numeric',
			month: 'short',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	}

	function getInitials(name: string) {
		return name
			.split(' ')
			.map((n) => n[0])
			.join('')
			.toUpperCase()
			.slice(0, 2);
	}
</script>

<Dialog bind:open>
	<DialogContent class="border-gray-700 bg-gray-800 text-white sm:max-w-[500px]">
		<DialogHeader>
			<DialogTitle class="text-xl font-bold text-white">User Profile</DialogTitle>
			<DialogDescription class="text-gray-400">
				View and manage your account information
			</DialogDescription>
		</DialogHeader>

		<Tabs value="profile" class="w-full">
			<TabsList class="grid w-full grid-cols-2 bg-gray-700">
				<TabsTrigger
					value="profile"
					class="text-gray-300 data-[state=active]:bg-gray-600 data-[state=active]:text-white"
				>
					Profile
				</TabsTrigger>
				<TabsTrigger
					value="settings"
					class="text-gray-300 data-[state=active]:bg-gray-600 data-[state=active]:text-white"
				>
					Settings
				</TabsTrigger>
			</TabsList>

			<TabsContent value="profile" class="space-y-6">
				<!-- Profile Header -->
				<div class="flex items-center space-x-4">
					<Avatar class="h-20 w-20 shadow-xl ring-2 ring-amber-400/50">
						<AvatarFallback
							class="bg-gradient-to-br from-amber-600 via-orange-500 to-amber-700 text-lg font-bold text-white shadow-lg"
						>
							{$backendUser?.UserProfile?.full_name
								? getInitials($backendUser.UserProfile.full_name)
								: $backendUser?.email?.charAt(0).toUpperCase() || 'U'}
						</AvatarFallback>
					</Avatar>
					<div class="flex-1">
						<div class="flex items-center gap-2">
							<h3 class="text-lg font-bold text-white">
								{$backendUser?.UserProfile?.full_name || 'User'}
							</h3>
							<Badge
								variant="outline"
								class="border-violet-400/50 bg-gradient-to-r from-violet-500/20 to-blue-500/20 text-violet-200 shadow-lg backdrop-blur-sm"
							>
								<Icon icon="lucide:user" class="mr-1 h-3 w-3" />
								{$backendUser?.role || 'Member'}
							</Badge>
						</div>
						<p class="text-sm text-gray-400">{$backendUser?.email}</p>
						{#if $firebaseUser?.metadata?.creationTime}
							<p class="text-xs text-gray-500">
								Member since {formatDate($firebaseUser.metadata.creationTime)}
							</p>
						{/if}
					</div>
					{#if !isEditing}
						<Button
							variant="outline"
							size="sm"
							onclick={startEditing}
							class="min-w-[90px] border-2 border-emerald-400 bg-transparent font-semibold text-emerald-300 shadow-lg transition-all duration-200 hover:border-emerald-300 hover:bg-emerald-400/20 hover:text-emerald-200"
						>
							<Icon icon="lucide:edit-3" class="mr-2 h-4 w-4" />
							Edit
						</Button>
					{/if}
				</div>

				{#if isEditing}
					<!-- Edit Form -->
					<div class="space-y-4">
						<div class="space-y-2">
							<Label for="fullName">Full Name</Label>
							<Input
								id="fullName"
								bind:value={editFullName}
								placeholder="Enter your full name"
								class="border-gray-600 bg-gray-700 text-white"
							/>
						</div>

						<div class="space-y-2">
							<Label for="email">Email</Label>
							<Input
								id="email"
								type="email"
								bind:value={editEmail}
								placeholder="Enter your email"
								class="border-gray-600 bg-gray-700 text-white"
								disabled
							/>
							<p class="text-xs text-gray-500">Email cannot be changed</p>
						</div>

						<div class="flex items-center justify-between">
							<Label>Change Password</Label>
							<Button
								variant="ghost"
								size="sm"
								onclick={() => (showPasswordFields = !showPasswordFields)}
								class="text-blue-400 hover:text-blue-300"
							>
								{showPasswordFields ? 'Hide' : 'Show'} Password Fields
							</Button>
						</div>

						{#if showPasswordFields}
							<div class="space-y-3 border-t border-gray-700 pt-4">
								<div class="space-y-2">
									<Label for="currentPassword">Current Password</Label>
									<Input
										id="currentPassword"
										type="password"
										bind:value={currentPassword}
										placeholder="Enter current password"
										class="border-gray-600 bg-gray-700 text-white"
									/>
								</div>

								<div class="space-y-2">
									<Label for="newPassword">New Password</Label>
									<Input
										id="newPassword"
										type="password"
										bind:value={newPassword}
										placeholder="Enter new password"
										class="border-gray-600 bg-gray-700 text-white"
									/>
								</div>

								<div class="space-y-2">
									<Label for="confirmPassword">Confirm New Password</Label>
									<Input
										id="confirmPassword"
										type="password"
										bind:value={confirmPassword}
										placeholder="Confirm new password"
										class="border-gray-600 bg-gray-700 text-white"
									/>
								</div>
							</div>
						{/if}

						<div class="flex justify-end gap-2">
							<Button
								variant="outline"
								onclick={cancelEditing}
								class="border-gray-600 text-gray-300 hover:bg-gray-700"
							>
								<Icon icon="lucide:x" class="mr-2 h-4 w-4" />
								Cancel
							</Button>
							<Button onclick={saveProfile} class="bg-blue-600 hover:bg-blue-700">
								<Icon icon="lucide:save" class="mr-2 h-4 w-4" />
								Save Changes
							</Button>
						</div>
					</div>
				{:else}
					<!-- Profile Info Cards -->
					<div class="grid gap-4">
						<Card class="border-gray-600 bg-gray-700">
							<CardHeader class="pb-3">
								<CardTitle class="flex items-center gap-2 text-sm font-medium text-gray-300">
									<Icon icon="lucide:user" class="h-4 w-4" />
									Personal Information
								</CardTitle>
							</CardHeader>
							<CardContent class="space-y-3">
								<div class="flex justify-between">
									<span class="text-sm text-gray-400">Full Name</span>
									<span class="text-sm font-medium text-white"
										>{$backendUser?.UserProfile?.full_name || 'Not set'}</span
									>
								</div>
								<div class="flex justify-between">
									<span class="text-sm text-gray-400">Email</span>
									<span class="text-sm font-medium text-white">{$backendUser?.email}</span>
								</div>
								<div class="flex justify-between">
									<span class="text-sm text-gray-400">Role</span>
									<Badge
										variant="outline"
										class="border-violet-400/50 bg-gradient-to-r from-violet-500/20 to-blue-500/20 text-xs text-violet-200 shadow-lg backdrop-blur-sm"
									>
										<Icon icon="lucide:user" class="mr-1 h-3 w-3" />
										{$backendUser?.role || 'Member'}
									</Badge>
								</div>
							</CardContent>
						</Card>

						<Card class="border-gray-600 bg-gray-700">
							<CardHeader class="pb-3">
								<CardTitle class="flex items-center gap-2 text-sm font-medium text-gray-300">
									<Icon icon="lucide:shield" class="h-4 w-4" />
									Account Security
								</CardTitle>
							</CardHeader>
							<CardContent class="space-y-3">
								<div class="flex justify-between">
									<span class="text-sm text-gray-400">Account Status</span>
									<Badge
										variant="outline"
										class="flex items-center gap-1 border-green-400/50 bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-xs text-green-200 shadow-lg backdrop-blur-sm"
									>
										<Icon icon="lucide:circle" class="h-2 w-2 fill-current" />
										Active
									</Badge>
								</div>
								{#if $firebaseUser?.metadata?.lastSignInTime}
									<div class="flex justify-between">
										<span class="text-sm text-gray-400">Last Sign In</span>
										<span class="text-sm font-medium text-white"
											>{formatDateTime($firebaseUser.metadata.lastSignInTime)}</span
										>
									</div>
								{/if}
							</CardContent>
						</Card>
					</div>
				{/if}
			</TabsContent>

			<TabsContent value="settings" class="space-y-6">
				<div class="space-y-4">
					<Card class="border-gray-600 bg-gray-700">
						<CardHeader>
							<CardTitle class="text-sm font-medium text-gray-300">Account Actions</CardTitle>
							<CardDescription class="text-gray-400">
								Manage your account settings and preferences
							</CardDescription>
						</CardHeader>
						<CardContent class="space-y-3">
							<Button
								variant="outline"
								class="w-full justify-start border-black bg-black font-bold text-white hover:bg-gray-900"
							>
								<Icon icon="lucide:camera" class="mr-2 h-4 w-4" />
								Upload Profile Picture
							</Button>
							<Button
								variant="outline"
								class="w-full justify-start border-black bg-black font-bold text-amber-600 hover:bg-gray-900"
							>
								<Icon icon="lucide:download" class="mr-2 h-4 w-4" />
								Export Data
							</Button>
							<Button
								variant="destructive"
								onclick={handleSignOut}
								class="w-full justify-start bg-red-600 font-bold text-white hover:bg-red-700"
							>
								Sign Out
							</Button>
						</CardContent>
					</Card>
				</div>
			</TabsContent>
		</Tabs>
	</DialogContent>
</Dialog>
