<script lang="ts">
  import { signUp, signInWithGoogle } from "$lib/services/auth";
  import { goto } from "$app/navigation";
  import { user } from "$lib/stores/auth";

  let email = "";
  let password = "";
  let confirmPassword = "";
  let error = "";

  async function handleSubmit() {
    try {
      error = "";
      if (password !== confirmPassword) {
        error = "Passwords do not match";
        return;
      }
      await signUp(email, password);
      goto("/dashboard");
    } catch (e) {
      if (e instanceof Error) {
        error = e.message; // Show Firebase error
      } else {
        error = "Failed to create an account.";
      }
      console.error("Sign up failed:", e);
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
  <div class="signup-box">
    <h1>Sign Up</h1>
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
      <div class="form-group">
        <label for="confirm-password">Confirm Password</label>
        <input
          type="password"
          id="confirm-password"
          bind:value={confirmPassword}
          required
          placeholder="Confirm your password"
        />
      </div>
      <button type="submit" class="btn primary">Sign Up</button>
    </form>
    <div class="divider">or</div>
    <button class="btn google" on:click={handleGoogleSignIn}>
      Sign up with Google
    </button>
    <p class="login-link">
      Already have an account? <a href="/login">Log in</a>
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

  .signup-box {
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

  .login-link {
    text-align: center;
    margin-top: 1rem;
  }
</style>
