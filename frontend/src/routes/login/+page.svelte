<script lang="ts">
  import { signIn, signInWithGoogle } from "$lib/services/auth";
  import { goto } from "$app/navigation";
  import { firebaseUser, backendUser } from "$lib/stores/auth";

  let email = "";
  let password = "";
  let error = "";
  let loading = false;

  async function handleSubmit() {
    try {
      loading = true;
      error = "";
      await signIn(email, password);
      goto("/dashboard");
    } catch (e) {
      if (e instanceof Error) {
        error = e.message;
      } else {
        error = "Failed to sign in. Please check your credentials.";
      }
      console.error(e);
    } finally {
      loading = false;
    }
  }

  async function handleGoogleSignIn() {
    try {
      loading = true;
      error = "";
      await signInWithGoogle();
      goto("/dashboard");
    } catch (e) {
      if (e instanceof Error) {
        error = e.message;
      } else {
        error = "Failed to sign in with Google.";
      }
      console.error(e);
    } finally {
      loading = false;
    }
  }

  $: if ($firebaseUser && $backendUser) {
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
          disabled={loading}
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
          disabled={loading}
        />
      </div>
      <button type="submit" class="btn primary" disabled={loading}>
        {loading ? "Signing in..." : "Sign In"}
      </button>
    </form>
    <div class="divider">or</div>
    <button class="btn google" on:click={handleGoogleSignIn} disabled={loading}>
      {loading ? "Signing in..." : "Sign in with Google"}
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

  input:disabled {
    background-color: #f5f5f5;
    cursor: not-allowed;
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

  .btn:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }

  .primary {
    background-color: var(--color-primary);
    color: white;
  }

  .primary:hover:not(:disabled) {
    background-color: #e63600;
  }

  .google {
    background-color: #4285f4;
    color: white;
  }

  .google:hover:not(:disabled) {
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
