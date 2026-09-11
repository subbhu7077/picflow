/* PICFLOW LOGIN FIX */

(function () {

  async function doPicFlowLogin() {

    const emailEl = document.getElementById("loginEmail");
    const mobileEl = document.getElementById("loginMobile");
    const passwordEl = document.getElementById("loginPassword");

    const email = emailEl ? emailEl.value.trim() : "";
    const mobile = mobileEl ? mobileEl.value.trim() : "";
    const password = passwordEl ? passwordEl.value : "";

    if (!email) {
      alert("Please enter your email.");
      return;
    }

    if (!password) {
      alert("Please enter your password.");
      return;
    }

    if (typeof window.supabase === "undefined") {
      alert("Supabase library load nahi hui. Page refresh karo.");
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

    const buttons = document.querySelectorAll("button");

    buttons.forEach(function (btn) {
      if (
        btn.textContent.trim().toLowerCase() === "login"
      ) {
        btn.disabled = true;
        btn.textContent = "Logging in...";
      }
    });

    try {

      const result = await client.auth.signInWithPassword({
        email: email,
        password: password
      });

      if (result.error) {
        alert("Login failed:\n\n" + result.error.message);

        buttons.forEach(function (btn) {
          if (
            btn.textContent.trim().toLowerCase() === "logging in..."
          ) {
            btn.disabled = false;
            btn.textContent = "Login";
          }
        });

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

      if (typeof window.showMainApp === "function") {
        window.showMainApp();
      } else {
        location.reload();
      }

    } catch (error) {

      console.error(error);

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

      const loginButtons =
        document.querySelectorAll("button");

      loginButtons.forEach(function (button) {

        if (
          button.textContent
            .trim()
            .toLowerCase() === "login"
        ) {

          button.onclick = function (event) {

            event.preventDefault();

            doPicFlowLogin();

          };

        }

      });

    }
  );

})();
