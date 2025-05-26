<script lang="ts">
    import "../app.css";
    import { onMount } from "svelte";
    import { auth } from "$lib/firebase";
    import { user, loading } from "$lib/stores/auth";
    import { onAuthStateChanged } from "firebase/auth";

    onMount(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            user.set(currentUser);
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
