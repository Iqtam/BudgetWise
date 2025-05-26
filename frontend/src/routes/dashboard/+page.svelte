<script lang="ts">
  import { firebaseUser, backendUser } from "$lib/stores/auth";
  import { signOut } from "$lib/services/auth";
  import { goto } from "$app/navigation";

  async function handleSignOut() {
    try {
      await signOut();
      goto("/login");
    } catch (e) {
      console.error("Failed to sign out:", e);
    }
  }

  $: if (!$firebaseUser || !$backendUser) {
    goto("/login");
  }
</script>

<div class="dashboard">
  <header>
    <h1>Dashboard</h1>
    <div class="user-info">
      {#if $firebaseUser && $backendUser}
        <div class="user-details">
          <span class="email">{$firebaseUser.email}</span>
          <span class="role">Role: {$backendUser.role}</span>
        </div>
        <button class="btn" on:click={handleSignOut}>Sign Out</button>
      {/if}
    </div>
  </header>
  <main>
    <h2>Welcome to BudgetWise</h2>
    <p>Start managing your finances today!</p>
  </main>
</div>

<style>
  .dashboard {
    padding: 1rem;
    max-width: 1200px;
    margin: 0 auto;
  }

  header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
    padding: 1rem;
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  .user-info {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .user-details {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 0.25rem;
  }

  .email {
    font-weight: 500;
  }

  .role {
    font-size: 0.875rem;
    color: #666;
  }

  .btn {
    padding: 0.5rem 1rem;
    border: none;
    border-radius: 4px;
    background-color: var(--color-primary);
    color: white;
    cursor: pointer;
    transition: background-color 0.2s;
  }

  .btn:hover {
    background-color: #e63600;
  }

  main {
    background: white;
    padding: 2rem;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  h1 {
    margin: 0;
    color: var(--color-primary);
  }

  h2 {
    color: var(--color-text);
    margin-bottom: 1rem;
  }
</style>
