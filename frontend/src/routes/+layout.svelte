<script lang="ts">
  import "../app.css";
  import { onMount } from "svelte";
  import { auth } from "$lib/firebase";
  import { firebaseUser, backendUser, loading } from "$lib/stores/auth";
  import { onAuthStateChanged } from "firebase/auth";
  import { getCurrentUser } from "$lib/services/auth";

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
</script>

{#if $loading}
  <div class="loading">Loading...</div>
{:else}
  <slot />
{/if}

<style>
  .loading {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
    font-size: 1.2rem;
  }
</style>
