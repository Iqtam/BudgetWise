<script>
    import { verifyEmail } from "../services/authService";
    import { onMount } from "svelte";

    export let token = "";
    let status = "verifying";
    let message = "";

    onMount(async () => {
        try {
            await verifyEmail(token);
            status = "success";
            message = "Email verified successfully! You can now login.";
        } catch (error) {
            status = "error";
            message = error.message;
        }
    });
</script>

<div class="verification-container">
    {#if status === "verifying"}
        <div class="loading">
            <h2>Verifying your email...</h2>
            <div class="spinner"></div>
        </div>
    {:else if status === "success"}
        <div class="success">
            <h2>✓ Verification Complete</h2>
            <p>{message}</p>
            <a href="/" class="button">Go to Login</a>
        </div>
    {:else}
        <div class="error">
            <h2>Verification Failed</h2>
            <p>{message}</p>
            <a href="/" class="button">Try Again</a>
        </div>
    {/if}
</div>

<style>
    .verification-container {
        max-width: 400px;
        margin: 40px auto;
        padding: 20px;
        text-align: center;
        background: white;
        border-radius: 8px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    h2 {
        margin-bottom: 20px;
        color: #333;
    }

    p {
        margin-bottom: 20px;
        color: #666;
    }

    .loading {
        display: flex;
        flex-direction: column;
        align-items: center;
    }

    .spinner {
        width: 40px;
        height: 40px;
        border: 4px solid #f3f3f3;
        border-top: 4px solid #3498db;
        border-radius: 50%;
        animation: spin 1s linear infinite;
    }

    @keyframes spin {
        0% {
            transform: rotate(0deg);
        }
        100% {
            transform: rotate(360deg);
        }
    }

    .success h2 {
        color: #2ecc71;
    }

    .error h2 {
        color: #e74c3c;
    }

    .button {
        display: inline-block;
        padding: 10px 20px;
        background-color: #3498db;
        color: white;
        text-decoration: none;
        border-radius: 4px;
        transition: background-color 0.3s;
    }

    .button:hover {
        background-color: #2980b9;
    }
</style>
