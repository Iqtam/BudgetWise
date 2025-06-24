<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { firebaseUser, backendUser, loading } from '$lib/stores/auth';

  let showError = false;
  let isChecking = true;

  // Check authentication status
  $: if (!$loading) {
    isChecking = false;
    if (!$firebaseUser || !$backendUser) {
      showError = true;
      // Redirect to login after showing error briefly
      setTimeout(() => {
        goto('/login');
      }, 2000);
    } else {
      showError = false;
    }
  }
</script>

{#if isChecking}
  <div class="loading">
    <p>Loading...</p>
  </div>
{:else if showError}
  <div class="error-container">
    <div class="error-message">
      <h2>🔒 Access Denied</h2>
      <p>You must log in first to access this page</p>
      <p>Redirecting to login...</p>
    </div>
  </div>
{:else}
  <slot />
{/if}

<style>
  .loading {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 50vh;
  }

  .error-container {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 50vh;
    padding: 2rem;
  }

  .error-message {
    text-align: center;
    background-color: #fee;
    border: 2px solid #fcc;
    border-radius: 8px;
    padding: 2rem;
    max-width: 400px;
  }

  .error-message h2 {
    color: #c33;
    margin-bottom: 1rem;
  }

  .error-message p {
    color: #666;
    margin-bottom: 0.5rem;
  }
</style>
