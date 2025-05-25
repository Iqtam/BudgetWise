<script>
  import Login from "./lib/components/Login.svelte";
  import Register from "./lib/components/Register.svelte";
  import EmailVerification from "./lib/components/EmailVerification.svelte";
  import PasswordReset from "./lib/components/PasswordReset.svelte";
  import { getCurrentUser, logout } from "./lib/services/authService";
  import { onMount } from "svelte";

  let currentUser = getCurrentUser();
  let currentView = "login";
  let verificationEmail = "";
  let resetToken = null;

  onMount(() => {
    // Check for verification token in URL
    const urlParams = new URLSearchParams(window.location.search);
    const verifyToken = urlParams.get("verify");
    const resetTokenParam = urlParams.get("reset");

    if (verifyToken) {
      currentView = "verify";
      resetToken = verifyToken;
    } else if (resetTokenParam) {
      currentView = "reset";
      resetToken = resetTokenParam;
    }
  });

  function handleLogin(event) {
    currentUser = event.detail;
  }

  function handleRegister(event) {
    verificationEmail = event.detail.email;
    currentView = "checkEmail";
  }

  function handleLogout() {
    logout();
    currentUser = null;
  }

  function handleNeedsVerification(event) {
    verificationEmail = event.detail.email;
    currentView = "checkEmail";
  }

  function handleForgotPassword() {
    currentView = "requestReset";
  }

  function handleResetComplete() {
    currentView = "login";
    resetToken = null;
  }

  function navigateTo(view) {
    currentView = view;
  }
</script>

<main>
  <div class="container">
    {#if currentUser}
      <div class="welcome">
        <h1>Welcome!</h1>
        <p>Email: {currentUser.email}</p>
        <button on:click={handleLogout}>Logout</button>
      </div>
    {:else}
      <div class="auth-container">
        {#if currentView === "login"}
          <Login
            on:login={handleLogin}
            on:needsVerification={handleNeedsVerification}
            on:forgotPassword={handleForgotPassword}
          />
          <p>
            Don't have an account?
            <button class="link-button" on:click={() => navigateTo("register")}
              >Register here</button
            >
          </p>
        {:else if currentView === "register"}
          <Register on:register={handleRegister} />
          <p>
            Already have an account?
            <button class="link-button" on:click={() => navigateTo("login")}
              >Login here</button
            >
          </p>
        {:else if currentView === "verify"}
          <EmailVerification token={resetToken} />
        {:else if currentView === "checkEmail"}
          <div class="message-container">
            <h2>Check Your Email</h2>
            <p>We've sent a verification link to {verificationEmail}</p>
            <p>
              Please check your email and click the verification link to
              continue.
            </p>
            <button class="link-button" on:click={() => navigateTo("login")}>
              Back to Login
            </button>
          </div>
        {:else if currentView === "requestReset" || currentView === "reset"}
          <PasswordReset
            token={resetToken}
            on:resetComplete={handleResetComplete}
          />
          <p>
            <button class="link-button" on:click={() => navigateTo("login")}>
              Back to Login
            </button>
          </p>
        {/if}
      </div>
    {/if}
  </div>
</main>

<style>
  .container {
    max-width: 800px;
    margin: 0 auto;
    padding: 20px;
  }

  .welcome {
    text-align: center;
    margin-top: 50px;
  }

  .auth-container {
    margin-top: 50px;
  }

  .message-container {
    max-width: 400px;
    margin: 0 auto;
    padding: 20px;
    text-align: center;
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  .link-button {
    background: none;
    border: none;
    color: #4caf50;
    text-decoration: underline;
    cursor: pointer;
    padding: 0;
    font: inherit;
  }

  .link-button:hover {
    color: #45a049;
  }

  p {
    text-align: center;
    margin-top: 20px;
  }

  button {
    padding: 10px 20px;
    background-color: #4caf50;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }

  button:hover {
    background-color: #45a049;
  }

  h2 {
    color: #333;
    margin-bottom: 20px;
  }
</style>
