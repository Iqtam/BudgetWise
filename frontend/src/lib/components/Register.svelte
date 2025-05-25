<script>
    import { register } from "../services/authService";
    import { createEventDispatcher } from "svelte";

    const dispatch = createEventDispatcher();

    let email = "";
    let password = "";
    let confirmPassword = "";
    let error = "";
    let success = "";
    let loading = false;

    async function handleSubmit() {
        error = "";
        success = "";

        if (password !== confirmPassword) {
            error = "Passwords do not match";
            return;
        }

        if (password.length < 8) {
            error = "Password must be at least 8 characters long";
            return;
        }

        loading = true;

        try {
            const response = await register(email, password);
            success = response.message;
            dispatch("register", { email });
        } catch (err) {
            error = err.message;
        } finally {
            loading = false;
        }
    }
</script>

<div class="register-form">
    <h2>Register</h2>

    {#if error}
        <div class="error">{error}</div>
    {/if}

    {#if success}
        <div class="success">
            <p>{success}</p>
            <p class="info">Please check your email to verify your account.</p>
        </div>
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
                placeholder="Choose a password"
            />
        </div>

        <div class="form-group">
            <label for="confirmPassword">Confirm Password</label>
            <input
                type="password"
                id="confirmPassword"
                bind:value={confirmPassword}
                required
                placeholder="Confirm your password"
            />
        </div>

        <button type="submit" disabled={loading}>
            {loading ? "Processing..." : "Register"}
        </button>
    </form>
</div>

<style>
    .register-form {
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

    .success {
        color: #2ecc71;
        margin-bottom: 10px;
        padding: 10px;
        background-color: #e8f8e8;
        border-radius: 4px;
    }

    .info {
        margin-top: 10px;
        font-size: 0.9em;
        color: #666;
    }
</style>
