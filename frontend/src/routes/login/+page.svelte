<script lang="ts">
    import { signIn, signInWithGoogle } from "$lib/services/auth";
    import { goto } from "$app/navigation";
    import { user } from "$lib/stores/auth";

    let email = "";
    let password = "";
    let error = "";

    async function handleSubmit() {
        try {
            error = "";
            await signIn(email, password);
            goto("/dashboard");
        } catch (e) {
            error = "Failed to sign in. Please check your credentials.";
            console.error(e);
        }
    }

    async function handleGoogleSignIn() {
        try {
            error = "";
            await signInWithGoogle();
            goto("/dashboard");
        } catch (e) {
            error = "Failed to sign in with Google.";
            console.error(e);
        }
    }

    $: if ($user) {
        goto("/dashboard");
    }
</script>

<div class="container">
    <div class="login-box">
        <h1>Login</h1>
        {#if error}
            <div class="error">{error}</div>
        {/if}
        <form on:submit|preventDefault={handleSubmit}>
            <div class="form-group">
                <label for="email">Email</label>
                <input
                    type="email"
                    id="email"
                    bind:value={email}
                    required
                    placeholder="Enter your email"
                />
            </div>
            <div class="form-group">
                <label for="password">Password</label>
                <input
                    type="password"
                    id="password"
                    bind:value={password}
                    required
                    placeholder="Enter your password"
                />
            </div>
            <button type="submit" class="btn primary">Sign In</button>
        </form>
        <div class="divider">or</div>
        <button class="btn google" on:click={handleGoogleSignIn}>
            Sign in with Google
        </button>
        <p class="signup-link">
            Don't have an account? <a href="/signup">Sign up</a>
        </p>
    </div>
</div>

<style>
    .container {
        display: flex;
        justify-content: center;
        align-items: center;
        min-height: 100vh;
        padding: 1rem;
    }

    .login-box {
        background: white;
        padding: 2rem;
        border-radius: 8px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        width: 100%;
        max-width: 400px;
    }

    h1 {
        text-align: center;
        margin-bottom: 1.5rem;
        color: var(--color-primary);
    }

    .form-group {
        margin-bottom: 1rem;
    }

    label {
        display: block;
        margin-bottom: 0.5rem;
        color: var(--color-text);
    }

    input {
        width: 100%;
        padding: 0.5rem;
        border: 1px solid #ddd;
        border-radius: 4px;
        margin-bottom: 0.5rem;
    }

    .btn {
        width: 100%;
        padding: 0.75rem;
        border: none;
        border-radius: 4px;
        font-weight: 600;
        cursor: pointer;
        transition: background-color 0.2s;
    }

    .primary {
        background-color: var(--color-primary);
        color: white;
    }

    .primary:hover {
        background-color: #e63600;
    }

    .google {
        background-color: #4285f4;
        color: white;
    }

    .google:hover {
        background-color: #3367d6;
    }

    .divider {
        text-align: center;
        margin: 1rem 0;
        color: #666;
    }

    .error {
        background-color: #fee;
        color: #c00;
        padding: 0.5rem;
        border-radius: 4px;
        margin-bottom: 1rem;
        text-align: center;
    }

    .signup-link {
        text-align: center;
        margin-top: 1rem;
    }
</style>
