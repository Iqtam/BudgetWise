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


<nav>
  <div class="nav-left">
    <a href="/">Home</a>
    <a href="/transactions">Transactions</a>
    <a href="/debt">Debt</a>
    <a href="/savings">Savings</a>
    <a href="/budget">Budget</a>
    <a href="/analytics">Analytics</a>
  </div>
  <div class="nav-right">
    <a href="/login">Login</a>
  </div>
</nav>

<slot /> <!-- This is where the page content will be injected -->

<footer>
  <p>&copy; 2025 BudgetWise</p>
</footer>

<style>
  nav {
    background-color: #4caf50;
    padding: 1rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .nav-left,
  .nav-right {
    display: flex;
    gap: 1rem;
  }

  nav a {
    color: white;
    text-decoration: none;
    padding: 0.5rem;
    border-radius: 4px;
    transition: background-color 0.2s;
  }

  nav a:hover {
    background-color: rgba(255, 255, 255, 0.1);
  }

  footer {
    margin-top: 2rem;
    text-align: center;
    color: #888;
  }
</style>

