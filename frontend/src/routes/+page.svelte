<script lang="ts">
    const title = "Welcome to BudgetWise!";
</script>

<svelte:head>
    <title>{title}</title>
</svelte:head>

<div class="container">
    <h1>{title}</h1>
    <p>Your personal finance management solution</p>
</div>

<style>
    .container {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        min-height: 100vh;
        padding: 1rem;
    }

    h1 {
        font-size: 2.5rem;
        margin-bottom: 1rem;
        color: var(--color-primary);
    }

    p {
        font-size: 1.25rem;
        color: var(--color-text);
        margin: 0;
    }
</style>
