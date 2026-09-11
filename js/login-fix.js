(function () {

  async function doPicFlowLogin() {

    const email = document.getElementById("loginEmail").value.trim();
    const password = document.getElementById("loginPassword").value;

    if (!email) {
      alert("Please enter your email.");
      return;
    }

    if (!password) {
      alert("Please enter your password.");
      return;
    }

    if (!window.supabase) {
      alert("Supabase library load nahi hui.");
      return;
    }

    if (!window.SUPABASE_URL || !window.SUPABASE_PUBLISHABLE_KEY) {
      alert("Supabase configuration missing hai.");
      return;
    }

    const client = window.supabase.createClient(
      window.SUPABASE_URL,
      window.SUPABASE_PUBLISHABLE_KEY
    );

    const button = document.querySelector(".login-btn");

    if (button) {
      button.disabled = true;
      button.textContent = "Logging in...";
    }

    try {

      const { data, error } =
        await client.auth.signInWithPassword({
          email: email,
          password: password
        });

      if (error) {

        if (button) {
          button.disabled = false;
          button.textContent = "Login";
        }

        alert("Login failed:\n\n" + error.message);
        return;
      }

      if (!data || !data.session) {

        if (button) {
          button.disabled = false;
          button.textContent = "Login";
        }

        alert("Login failed: session nahi bana.");
        return;
      }

      localStorage.setItem(
        "picflow_logged_in",
        "true"
      );

      localStorage.setItem(
        "picflow_email",
        email
      );

      alert("Login successful! 🎉");

      location.reload();

    } catch (error) {

      if (button) {
        button.disabled = false;
        button.textContent = "Login";
      }

      alert(
        "Login error:\n\n" +
        (error.message || error)
      );

    }

  }

  window.loginUser = doPicFlowLogin;

  document.addEventListener(
    "DOMContentLoaded",
    function () {

      const button =
        document.querySelector(".login-btn");

      if (button) {

        button.onclick = function (event) {

          event.preventDefault();

          doPicFlowLogin();

        };

      }

    }
  );

})();
