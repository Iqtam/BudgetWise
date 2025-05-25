<script>
    import {
        requestPasswordReset,
        resetPassword,
    } from "../services/authService";
    import { createEventDispatcher } from "svelte";

    const dispatch = createEventDispatcher();

    export let token = null;
    let email = "";
    let newPassword = "";
    let confirmPassword = "";
    let error = "";
    let success = "";
    let loading = false;

    async function handleRequestReset() {
        if (!email) {
            error = "Please enter your email address";
            return;
        }

        loading = true;
        error = "";
        success = "";

        try {
            await requestPasswordReset(email);
            success =
                "Password reset instructions have been sent to your email";
        } catch (err) {
            error = err.message;
        } finally {
            loading = false;
        }
    }

    async function handleResetPassword() {
        if (newPassword !== confirmPassword) {
            error = "Passwords do not match";
            return;
        }

        if (newPassword.length < 8) {
            error = "Password must be at least 8 characters long";
            return;
        }

        loading = true;
        error = "";
        success = "";

        try {
            await resetPassword(token, newPassword);
            success = "Password has been reset successfully";
            setTimeout(() => {
                dispatch("resetComplete");
            }, 2000);
        } catch (err) {
            error = err.message;
        } finally {
            loading = false;
        }
    }
</script>

<div class="password-reset-form">
    <h2>{token ? "Reset Password" : "Request Password Reset"}</h2>

    {#if error}
        <div class="error">{error}</div>
    {/if}

    {#if success}
        <div class="success">{success}</div>
    {/if}

    {#if !token}
        <form on:submit|preventDefault={handleRequestReset}>
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

            <button type="submit" disabled={loading}>
                {loading ? "Processing..." : "Request Reset"}
            </button>
        </form>
    {:else}
        <form on:submit|preventDefault={handleResetPassword}>
            <div class="form-group">
                <label for="newPassword">New Password</label>
                <input
                    type="password"
                    id="newPassword"
                    bind:value={newPassword}
                    required
                    placeholder="Enter new password"
                />
            </div>

            <div class="form-group">
                <label for="confirmPassword">Confirm Password</label>
                <input
                    type="password"
                    id="confirmPassword"
                    bind:value={confirmPassword}
                    required
                    placeholder="Confirm new password"
                />
            </div>

            <button type="submit" disabled={loading}>
                {loading ? "Processing..." : "Reset Password"}
            </button>
        </form>
    {/if}
</div>

<style>
    .password-reset-form {
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
</style>
