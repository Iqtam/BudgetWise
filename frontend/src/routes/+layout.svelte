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
  <a href="/">Home</a>
  <a href="/transactions">Transactions</a>
</nav>

<slot /> <!-- This is where the page content will be injected -->

<footer>
  <p>&copy; 2025 BudgetWise</p>
</footer>

<style>
  nav {
    background-color: #4caf50;
    padding: 1rem;
  }

  nav a {
    margin-right: 1rem;
    color: white;
    text-decoration: none;
  }

  footer {
    margin-top: 2rem;
    text-align: center;
    color: #888;
  }
</style>

