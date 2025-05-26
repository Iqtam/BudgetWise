<script lang="ts">
    import "../app.css";
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

