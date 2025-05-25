<script>
    import { login } from "../services/authService";
    import { createEventDispatcher } from "svelte";

    const dispatch = createEventDispatcher();

    let email = "";
    let password = "";
    let error = "";
    let loading = false;
    let showPasswordReset = false;

    async function handleSubmit() {
        error = "";
        loading = true;

        try {
            const userData = await login(email, password);
            dispatch("login", userData);
        } catch (err) {
            error = err.message;
            if (err.message.includes("verify your email")) {
                dispatch("needsVerification", { email });
            }
        } finally {
            loading = false;
        }
    }

    function handleForgotPassword() {
        dispatch("forgotPassword");
    }
</script>

<div class="login-form">
    <h2>Login</h2>

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
            <button
                type="button"
                class="forgot-password"
                on:click={handleForgotPassword}
            >
                Forgot Password?
            </button>
        </div>

        <button type="submit" disabled={loading}>
            {loading ? "Processing..." : "Login"}
        </button>
    </form>
</div>

<style>
    .login-form {
        max-width: 400px;
        margin: 0 auto;
        padding: 20px;
    }

    .form-group {
        margin-bottom: 15px;
    }

    label {
        display: block;
        margin-bottom: 5px;
    }

    input {
        width: 100%;
        padding: 8px;
        border: 1px solid #ddd;
        border-radius: 4px;
    }

    button {
        width: 100%;
        padding: 10px;
        background-color: #4caf50;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
    }

    button:disabled {
        background-color: #cccccc;
        cursor: not-allowed;
    }

    .error {
        color: #e74c3c;
        margin-bottom: 10px;
        padding: 10px;
        background-color: #fde8e8;
        border-radius: 4px;
    }

    .forgot-password {
        width: auto;
        background: none;
        color: #3498db;
        padding: 0;
        margin-top: 5px;
        text-align: right;
        font-size: 0.9em;
    }

    .forgot-password:hover {
        color: #2980b9;
        text-decoration: underline;
    }
</style>
