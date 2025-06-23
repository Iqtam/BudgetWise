<script lang="ts">
  import "../app.css";
  import { onMount } from "svelte";
  import { page } from "$app/stores";
  import { goto } from "$app/navigation";
  import { auth } from "$lib/firebase";
  import { firebaseUser, backendUser, loading } from "$lib/stores/auth";
  import { onAuthStateChanged } from "firebase/auth";
  import { getCurrentUser, signOut } from "$lib/services/auth";

  // Define protected routes
  const protectedRoutes = ['/transactions', '/debt', '/savings', '/budget', '/analytics', '/dashboard'];
  
  // Check if current route is protected
  $: isProtectedRoute = protectedRoutes.some(route => $page.url.pathname.startsWith(route));
  
  // Check if we're on dashboard routes (which have their own navigation)
  $: isDashboardRoute = $page.url.pathname.startsWith('/dashboard');
  
  // Redirect to login if accessing protected route without authentication
  $: if (!$loading && isProtectedRoute && !$firebaseUser) {
    alert("You must log in first to access this page");
    goto('/signin');
  }

  onMount(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      firebaseUser.set(user);

      if (user) {
        try {
          // Get user profile from backend
          const profile = await getCurrentUser();
          backendUser.set(profile);
        } catch (error) {
          console.error("Error getting user profile:", error);
          backendUser.set(null);
        }
      } else {
        backendUser.set(null);
      }

      loading.set(false);
    });

    return () => unsubscribe();
  });

  async function handleLogout() {
    try {
      await signOut();
      goto('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  }
</script>

<slot /> <!-- This is where the page content will be injected -->

<style>
  /* Global styles can go here if needed */
</style>

