
/* =========================
   PICFLOW APP
========================= */

function showMessage(message) {
  alert(message);
}


/* =========================
   AUTH
========================= */

function loginUser() {

  const email = document.getElementById("loginEmail").value.trim();
  const mobile = document.getElementById("loginMobile").value.trim();
  const password = document.getElementById("loginPassword").value;

  if (!email && !mobile) {
    alert("Please enter Email or Mobile Number.");
    return;
  }

  if (!password) {
    alert("Please enter your password.");
    return;
  }

  if (mobile && !/^[0-9]{10}$/.test(mobile)) {
    alert("Please enter a valid 10 digit mobile number.");
    return;
  }

  /*
    TEMPORARY FRONTEND LOGIN

    Real secure authentication will be connected
    with Supabase in the next step.
  */

  localStorage.setItem("picflow_logged_in", "true");

  if (email) {
    localStorage.setItem("picflow_email", email);
  }

  if (mobile) {
    localStorage.setItem("picflow_mobile", mobile);
  }

  showMainApp();
}


function facebookLogin() {

  alert(
    "Facebook Login selected.\n\n" +
    "Real Facebook authentication will be connected " +
    "after the backend setup."
  );

}


function forgotPassword() {

  const email = prompt(
    "Enter your registered email address:"
  );

  if (!email) return;

  alert(
    "Password reset will be connected with the real " +
    "authentication system.\n\nEmail: " + email
  );

}


function showSignup() {

  alert(
    "Signup screen is the next step.\n\n" +
    "We will add:\n" +
    "Username\n" +
    "Email\n" +
    "Mobile Number\n" +
    "Password\n" +
    "Profile Photo"
  );

}


function togglePassword() {

  const password =
    document.getElementById("loginPassword");

  if (password.type === "password") {
    password.type = "text";
  } else {
    password.type = "password";
  }

}


/* =========================
   APP START
========================= */

document.addEventListener("DOMContentLoaded", function () {

  const loggedIn =
    localStorage.getItem("picflow_logged_in");

  if (loggedIn === "true") {
    showMainApp();
  }

});


function showMainApp() {

  const login =
    document.getElementById("loginScreen");

  const app =
    document.getElementById("mainApp");

  if (login) {
    login.style.display = "none";
  }

  if (app) {
    app.style.display = "block";
  }

  const email =
    localStorage.getItem("picflow_email");

  const username =
    localStorage.getItem("picflow_username") || "You";

  const homeUsername =
    document.getElementById("homeUsername");

  const postUsername =
    document.getElementById("postUsername");

  if (homeUsername) {
    homeUsername.textContent = username;
  }

  if (postUsername) {
    postUsername.textContent = username;
  }

}


/* =========================
   CREATE POST
========================= */

function createPost() {

  const input =
    document.createElement("input");

  input.type = "file";
  input.accept = "image/*";

  input.onchange = function () {

    const file = input.files[0];

    if (!file) return;

    const reader =
      new FileReader();

    reader.onload = function (e) {

      const image =
        e.target.result;

      const postImage =
        document.querySelector(".post-image");

      if (postImage) {

        postImage.innerHTML =
          '<img src="' +
          image +
          '" style="width:100%;height:100%;object-fit:cover;">';

      }

      showMessage("Post created! 📸");

    };

    reader.readAsDataURL(file);

  };

  input.click();

}


/* =========================
   LIKE
========================= */

function toggleLike(button) {

  const post =
    button.closest(".post");

  if (!post) return;

  const count =
    post.querySelector(".like-count");

  if (!count) return;

  let number =
    parseInt(count.textContent) || 0;

  if (button.dataset.liked === "true") {

    number--;

    button.dataset.liked = "false";
    button.textContent = "♡";

  } else {

    number++;

    button.dataset.liked = "true";
    button.textContent = "♥";

  }

  count.textContent = number;

}


/* =========================
   COMMENTS
========================= */

function commentPost() {

  const comment =
    prompt("Write your comment:");

  if (!comment) return;

  showMessage("Comment added: " + comment);

}


/* =========================
   SHARE
========================= */

function sharePost() {

  if (navigator.share) {

    navigator.share({
      title: "PicFlow",
      text: "Check this post on PicFlow!"
    });

  } else {

    showMessage("Post link copied! 🔗");

  }

}


/* =========================
   SAVE
========================= */

function toggleSave(button) {

  if (button.dataset.saved === "true") {

    button.dataset.saved = "false";
    button.textContent = "🔖";

    showMessage("Post unsaved");

  } else {

    button.dataset.saved = "true";
    button.textContent = "📌";

    showMessage("Post saved!");

  }

}


/* =========================
   STORIES
========================= */

function openStory(name) {

  showMessage(name + "'s story");

}


/* =========================
   NAVIGATION
========================= */

function navigate(page) {

  if (page === "Profile") {
    openProfile();
    return;
  }

  if (page === "Home") {
    location.reload();
    return;
  }

}


/* =========================
   PROFILE
========================= */

function openProfile() {

  const old =
    document.querySelector(".profile-overlay");

  if (old) old.remove();

  const username =
    localStorage.getItem("picflow_username") || "You";

  const bio =
    localStorage.getItem("picflow_bio") ||
    "Welcome to my PicFlow profile ✨";

  const dp =
    localStorage.getItem("picflow_dp");

  const avatar =
    dp
      ? '<img src="' + dp + '" alt="Profile photo">'
      : username.charAt(0).toUpperCase();

  const overlay =
    document.createElement("div");

  overlay.className =
    "profile-overlay";

  overlay.innerHTML = `

    <div class="profile-top">

      <h2>${username}</h2>

      <button
        class="profile-close"
        onclick="closeProfile()">
        ×
      </button>

    </div>

    <div class="profile-main">

      <div class="profile-header">

        <div class="profile-head-row">

          <div class="profile-avatar">
            ${avatar}
          </div>

          <div class="profile-stats">

            <div class="profile-stat">
              <strong>3</strong>
              <span>Posts</span>
            </div>

            <div class="profile-stat">
              <strong>120</strong>
              <span>Followers</span>
            </div>

            <div class="profile-stat">
              <strong>85</strong>
              <span>Following</span>
            </div>

          </div>

        </div>

        <div class="profile-name">
          <strong>${username}</strong>
          <p>${bio}</p>
        </div>

        <button
          class="edit-profile-btn"
          onclick="editProfile()">
          Edit Profile
        </button>

      </div>

      <div class="profile-tabs">
        <button class="profile-tab active">▦</button>
        <button class="profile-tab">▶</button>
        <button class="profile-tab">♡</button>
      </div>

      <div class="profile-grid">

        <div>📸</div>
        <div>🌄</div>
        <div>✨</div>

      </div>

      <button
        onclick="logoutUser()"
        style="
          width:100%;
          margin-top:20px;
          padding:12px;
          border:1px solid #ddd;
          border-radius:10px;
          background:white;
          color:#e53935;
          font-weight:bold;
        ">
        Logout
      </button>

    </div>
  `;

  document.body.appendChild(overlay);

  loadSavedDP();

}


function closeProfile() {

  const profile =
    document.querySelector(".profile-overlay");

  if (profile) {
    profile.remove();
  }

}


/* =========================
   EDIT PROFILE
========================= */

function editProfile() {

  const username =
    localStorage.getItem("picflow_username") || "You";

  const bio =
    localStorage.getItem("picflow_bio") ||
    "Welcome to my PicFlow profile ✨";

  const box =
    document.createElement("div");

  box.className =
    "profile-overlay";

  box.innerHTML = `

    <div class="profile-top">

      <h2>Edit Profile</h2>

      <button
        class="profile-close"
        onclick="this.closest('.profile-overlay').remove()">
        ×
      </button>

    </div>

    <div class="profile-main">

      <div class="edit-box">

        <div
          class="dp-upload-area"
          onclick="changeDP()">

          <div
            class="dp-preview"
            id="dpPreview">

            ${localStorage.getItem("picflow_dp")
              ? '<img src="' +
                localStorage.getItem("picflow_dp") +
                '" alt="Profile preview">'
              : username.charAt(0).toUpperCase()
            }

          </div>

          <div>

            <strong>
              Change Profile Photo
            </strong>

            <small>
              Tap to choose a photo
            </small>

          </div>

        </div>


        <div class="edit-card">

          <label>Username</label>

          <input
            id="editUsername"
            value="${username}"
            placeholder="Username"
          >

        </div>


        <div class="edit-card">

          <label>Bio</label>

          <textarea
            id="editBio"
            placeholder="Write your bio..."
          >${bio}</textarea>

        </div>


        <button
          class="edit-save"
          onclick="saveProfile()">

          Save Profile

        </button>

      </div>

    </div>
  `;

  document.body.appendChild(box);

}


function saveProfile() {

  const username =
    document.getElementById("editUsername").value.trim();

  const bio =
    document.getElementById("editBio").value.trim();

  if (!username) {

    alert("Username cannot be empty.");

    return;

  }

  localStorage.setItem(
    "picflow_username",
    username
  );

  localStorage.setItem(
    "picflow_bio",
    bio
  );

  document.querySelectorAll(
    ".profile-overlay"
  ).forEach(function (el) {
    el.remove();
  });

  showMessage("Profile saved! ✅");

}


/* =========================
   PROFILE PHOTO
========================= */

function changeDP() {

  const input =
    document.createElement("input");

  input.type = "file";
  input.accept = "image/*";

  input.onchange = function () {

    const file =
      input.files[0];

    if (!file) return;

    const reader =
      new FileReader();

    reader.onload = function (e) {

      const image =
        e.target.result;

      localStorage.setItem(
        "picflow_dp",
        image
      );

      const preview =
        document.querySelector("#dpPreview");

      if (preview) {

        preview.innerHTML =
          '<img src="' +
          image +
          '" alt="Profile preview">';

      }

      document.querySelectorAll(
        ".avatar"
      ).forEach(function (el) {

        el.innerHTML =
          '<img src="' +
          image +
          '" alt="Profile photo">';

      });

      showMessage(
        "Profile photo updated! 📸"
      );

    };

    reader.readAsDataURL(file);

  };

  input.click();

}


function loadSavedDP() {

  const image =
    localStorage.getItem("picflow_dp");

  if (!image) return;

  document.querySelectorAll(
    ".avatar"
  ).forEach(function (el) {

    el.innerHTML =
      '<img src="' +
      image +
      '" alt="Profile photo">';

  });

  const profileAvatar =
    document.querySelector(".profile-avatar");

  if (profileAvatar) {

    profileAvatar.innerHTML =
      '<img src="' +
      image +
      '" alt="Profile photo">';

  }

}


/* =========================
   LOGOUT
========================= */

function logoutUser() {

  localStorage.removeItem(
    "picflow_logged_in"
  );

  location.reload();

}



/* =========================
   SIGNUP
========================= */

function showSignup() {

  const login =
    document.getElementById("loginScreen");

  const signup =
    document.getElementById("signupScreen");

  const app =
    document.getElementById("mainApp");

  if (login) login.style.display = "none";
  if (app) app.style.display = "none";
  if (signup) signup.style.display = "flex";

}


function showLogin() {

  const login =
    document.getElementById("loginScreen");

  const signup =
    document.getElementById("signupScreen");

  if (signup) signup.style.display = "none";
  if (login) login.style.display = "flex";

}


function chooseSignupPhoto() {

  const input =
    document.createElement("input");

  input.type = "file";
  input.accept = "image/*";

  input.onchange = function () {

    const file = input.files[0];

    if (!file) return;

    const reader =
      new FileReader();

    reader.onload = function (e) {

      const image = e.target.result;

      localStorage.setItem(
        "picflow_signup_dp",
        image
      );

      const preview =
        document.getElementById(
          "signupPhotoPreview"
        );

      if (preview) {

        preview.innerHTML =
          '<img src="' +
          image +
          '" alt="Profile photo">';

      }

    };

    reader.readAsDataURL(file);

  };

  input.click();

}


function toggleSignupPassword() {

  const input =
    document.getElementById(
      "signupPassword"
    );

  if (!input) return;

  input.type =
    input.type === "password"
      ? "text"
      : "password";

}


function toggleConfirmPassword() {

  const input =
    document.getElementById(
      "signupConfirmPassword"
    );

  if (!input) return;

  input.type =
    input.type === "password"
      ? "text"
      : "password";

}


function createAccount() {

  const username =
    document.getElementById(
      "signupUsername"
    ).value.trim();

  const email =
    document.getElementById(
      "signupEmail"
    ).value.trim();

  const mobile =
    document.getElementById(
      "signupMobile"
    ).value.trim();

  const password =
    document.getElementById(
      "signupPassword"
    ).value;

  const confirmPassword =
    document.getElementById(
      "signupConfirmPassword"
    ).value;


  /* VALIDATION */

  if (!username) {
    alert("Please enter a username.");
    return;
  }

  if (username.length < 3) {
    alert("Username must be at least 3 characters.");
    return;
  }

  if (!email) {
    alert("Please enter your email.");
    return;
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    alert("Please enter a valid email.");
    return;
  }

  if (!mobile) {
    alert("Please enter your mobile number.");
    return;
  }

  if (!/^[0-9]{10}$/.test(mobile)) {
    alert("Mobile number must be 10 digits.");
    return;
  }

  if (!password) {
    alert("Please create a password.");
    return;
  }

  if (password.length < 6) {
    alert("Password must be at least 6 characters.");
    return;
  }

  if (password !== confirmPassword) {
    alert("Passwords do not match.");
    return;
  }


  /* SAVE ACCOUNT LOCALLY */

  localStorage.setItem(
    "picflow_username",
    username
  );

  localStorage.setItem(
    "picflow_email",
    email
  );

  localStorage.setItem(
    "picflow_mobile",
    mobile
  );

  localStorage.setItem(
    "picflow_password",
    password
  );


  const signupDP =
    localStorage.getItem(
      "picflow_signup_dp"
    );

  if (signupDP) {

    localStorage.setItem(
      "picflow_dp",
      signupDP
    );

  }


  localStorage.setItem(
    "picflow_bio",
    "Welcome to my PicFlow profile ✨"
  );

  localStorage.setItem(
    "picflow_logged_in",
    "true"
  );


  alert(
    "Account created successfully! 🎉"
  );


  showMainApp();

}


/* =========================
   LOAD SIGNUP PHOTO
========================= */

function loadSignupPhoto() {

  const image =
    localStorage.getItem(
      "picflow_signup_dp"
    );

  if (!image) return;

  const preview =
    document.getElementById(
      "signupPhotoPreview"
    );

  if (preview) {

    preview.innerHTML =
      '<img src="' +
      image +
      '" alt="Profile photo">';

  }

}



/* ===== FORCE SIGNUP SCREEN ===== */

window.showSignup = function () {

  const login = document.getElementById("loginScreen");
  const signup = document.getElementById("signupScreen");
  const app = document.getElementById("mainApp");

  if (login) login.style.display = "none";
  if (app) app.style.display = "none";

  if (signup) {
    signup.style.display = "flex";
    return;
  }

  alert("Signup screen code is not present in index.html. Run the latest index update.");
};


window.showLogin = function () {

  const signup = document.getElementById("signupScreen");
  const login = document.getElementById("loginScreen");

  if (signup) signup.style.display = "none";
  if (login) login.style.display = "flex";

};


window.chooseSignupPhoto = function () {

  const input = document.createElement("input");

  input.type = "file";
  input.accept = "image/*";

  input.onchange = function () {

    const file = input.files[0];

    if (!file) return;

    const reader = new FileReader();

    reader.onload = function (e) {

      localStorage.setItem(
        "picflow_signup_dp",
        e.target.result
      );

      const preview =
        document.getElementById("signupPhotoPreview");

      if (preview) {
        preview.innerHTML =
          '<img src="' +
          e.target.result +
          '" alt="Profile photo">';
      }

    };

    reader.readAsDataURL(file);

  };

  input.click();

};


window.createAccount = function () {

  const username =
    document.getElementById("signupUsername")?.value.trim();

  const email =
    document.getElementById("signupEmail")?.value.trim();

  const mobile =
    document.getElementById("signupMobile")?.value.trim();

  const password =
    document.getElementById("signupPassword")?.value;

  const confirm =
    document.getElementById("signupConfirmPassword")?.value;


  if (!username) {
    alert("Please enter username.");
    return;
  }

  if (!email) {
    alert("Please enter email.");
    return;
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    alert("Please enter a valid email.");
    return;
  }

  if (!/^[0-9]{10}$/.test(mobile)) {
    alert("Please enter a valid 10 digit mobile number.");
    return;
  }

  if (!password || password.length < 6) {
    alert("Password must be at least 6 characters.");
    return;
  }

  if (password !== confirm) {
    alert("Passwords do not match.");
    return;
  }


  localStorage.setItem("picflow_username", username);
  localStorage.setItem("picflow_email", email);
  localStorage.setItem("picflow_mobile", mobile);
  localStorage.setItem("picflow_password", password);
  localStorage.setItem("picflow_logged_in", "true");

  const dp =
    localStorage.getItem("picflow_signup_dp");

  if (dp) {
    localStorage.setItem("picflow_dp", dp);
  }

  localStorage.setItem(
    "picflow_bio",
    "Welcome to my PicFlow profile ✨"
  );


  alert("Account created successfully! 🎉");

  if (typeof showMainApp === "function") {
    showMainApp();
  } else {
    location.reload();
  }

};


window.toggleSignupPassword = function () {

  const input =
    document.getElementById("signupPassword");

  if (input) {
    input.type =
      input.type === "password"
        ? "text"
        : "password";
  }

};


window.toggleConfirmPassword = function () {

  const input =
    document.getElementById("signupConfirmPassword");

  if (input) {
    input.type =
      input.type === "password"
        ? "text"
        : "password";
  }

};



/* =========================================
   SUPABASE REAL AUTH + PROFILE
========================================= */

let picflowSupabase = null;

function initSupabase() {

  if (!window.supabase) {
    console.error("Supabase library not loaded");
    return;
  }

  if (!window.SUPABASE_URL || !window.SUPABASE_PUBLISHABLE_KEY) {
    console.error("Supabase configuration missing");
    return;
  }

  picflowSupabase = window.supabase.createClient(
    window.SUPABASE_URL,
    window.SUPABASE_PUBLISHABLE_KEY
  );

  picflowSupabase.auth.onAuthStateChange(function(event, session) {

    if (session && session.user) {

      localStorage.setItem("picflow_logged_in", "true");
      localStorage.setItem("picflow_email", session.user.email || "");

      showMainApp();

      setTimeout(function() {
        loadSupabaseProfile();
      }, 0);

    } else {

      localStorage.removeItem("picflow_logged_in");

    }

  });

}


/* REAL LOGIN */

window.loginUser = async function() {

  const email =
    document.getElementById("loginEmail").value.trim();

  const mobile =
    document.getElementById("loginMobile").value.trim();

  const password =
    document.getElementById("loginPassword").value;

  if (!email && !mobile) {
    alert("Please enter Email or Mobile Number.");
    return;
  }

  if (!password) {
    alert("Please enter your password.");
    return;
  }

  if (mobile && !email) {
    alert("Mobile login will be enabled after Phone OTP setup. Please login with Email for now.");
    return;
  }

  if (!picflowSupabase) {
    alert("Supabase is not loaded. Please refresh the page.");
    return;
  }

  const result =
    await picflowSupabase.auth.signInWithPassword({
      email: email,
      password: password
    });

  if (result.error) {
    alert("Login failed: " + result.error.message);
    return;
  }

  alert("Login successful! 🎉");

};


/* REAL SIGNUP */

window.createAccount = async function() {

  const username =
    document.getElementById("signupUsername").value.trim();

  const email =
    document.getElementById("signupEmail").value.trim();

  const mobile =
    document.getElementById("signupMobile").value.trim();

  const password =
    document.getElementById("signupPassword").value;

  const confirmPassword =
    document.getElementById("signupConfirmPassword").value;

  if (!username) {
    alert("Please enter username.");
    return;
  }

  if (!email) {
    alert("Please enter email.");
    return;
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    alert("Please enter a valid email.");
    return;
  }

  if (!/^[0-9]{10}$/.test(mobile)) {
    alert("Please enter a valid 10 digit mobile number.");
    return;
  }

  if (password.length < 6) {
    alert("Password must be at least 6 characters.");
    return;
  }

  if (password !== confirmPassword) {
    alert("Passwords do not match.");
    return;
  }

  if (!picflowSupabase) {
    alert("Supabase is not loaded. Please refresh the page.");
    return;
  }

  const result =
    await picflowSupabase.auth.signUp({
      email: email,
      password: password,
      options: {
        data: {
          username: username,
          mobile: mobile
        }
      }
    });

  if (result.error) {
    alert("Signup failed: " + result.error.message);
    return;
  }

  localStorage.setItem("picflow_username", username);
  localStorage.setItem("picflow_mobile", mobile);

  if (result.data.session) {

    alert("Account created successfully! 🎉");

    showMainApp();

    await loadSupabaseProfile();

  } else {

    alert(
      "Account created successfully! 🎉\n\n" +
      "Please confirm your email, then login."
    );

    showLogin();

  }

};


/* LOAD PROFILE FROM SUPABASE */

async function loadSupabaseProfile() {

  if (!picflowSupabase) return;

  const userResult =
    await picflowSupabase.auth.getUser();

  if (userResult.error || !userResult.data.user) return;

  const user =
    userResult.data.user;

  const profileResult =
    await picflowSupabase
      .from("profiles")
      .select("username,bio,mobile,avatar_url")
      .eq("id", user.id)
      .maybeSingle();

  if (profileResult.error) {
    console.error(profileResult.error);
    return;
  }

  if (!profileResult.data) return;

  const profile =
    profileResult.data;

  localStorage.setItem(
    "picflow_username",
    profile.username || "You"
  );

  localStorage.setItem(
    "picflow_bio",
    profile.bio || ""
  );

  if (profile.mobile) {
    localStorage.setItem(
      "picflow_mobile",
      profile.mobile
    );
  }

  const homeUsername =
    document.getElementById("homeUsername");

  const postUsername =
    document.getElementById("postUsername");

  if (homeUsername) {
    homeUsername.textContent =
      profile.username || "You";
  }

  if (postUsername) {
    postUsername.textContent =
      profile.username || "You";
  }

}


/* SAVE PROFILE TO SUPABASE */

window.saveProfile = async function() {

  const username =
    document.getElementById("editUsername").value.trim();

  const bio =
    document.getElementById("editBio").value.trim();

  if (!username) {
    alert("Username cannot be empty.");
    return;
  }

  if (!picflowSupabase) {
    alert("Supabase is not loaded. Please refresh.");
    return;
  }

  const userResult =
    await picflowSupabase.auth.getUser();

  if (userResult.error || !userResult.data.user) {
    alert("Please login again.");
    return;
  }

  const user =
    userResult.data.user;

  const result =
    await picflowSupabase
      .from("profiles")
      .update({
        username: username,
        bio: bio,
        updated_at: new Date().toISOString()
      })
      .eq("id", user.id);

  if (result.error) {
    alert("Profile save failed: " + result.error.message);
    return;
  }

  localStorage.setItem("picflow_username", username);
  localStorage.setItem("picflow_bio", bio);

  document
    .querySelectorAll(".profile-overlay")
    .forEach(function(el) {
      el.remove();
    });

  showMessage("Profile saved to Supabase! ☁️✅");

  await loadSupabaseProfile();

};


/* REAL LOGOUT */

window.logoutUser = async function() {

  if (picflowSupabase) {
    await picflowSupabase.auth.signOut();
  }

  localStorage.removeItem("picflow_logged_in");
  localStorage.removeItem("picflow_email");

  location.reload();

};


/* REAL FORGOT PASSWORD */

window.forgotPassword = async function() {

  const email =
    prompt("Enter your registered email address:");

  if (!email) return;

  if (!picflowSupabase) {
    alert("Supabase is not loaded. Please refresh.");
    return;
  }

  const result =
    await picflowSupabase.auth.resetPasswordForEmail(
      email,
      {
        redirectTo:
          window.location.origin +
          window.location.pathname
      }
    );

  if (result.error) {
    alert("Reset failed: " + result.error.message);
    return;
  }

  alert(
    "Password reset link sent! 📧\n\n" +
    "Check your email."
  );

};


/* START SUPABASE */

document.addEventListener(
  "DOMContentLoaded",
  function() {
    initSupabase();
  }
);



/* =========================================
   SUPABASE ONLINE PROFILE PHOTO
========================================= */

window.changeDP = async function() {

  const input = document.createElement("input");

  input.type = "file";
  input.accept = "image/*";

  input.onchange = async function() {

    const file = input.files[0];

    if (!file) return;

    if (!picflowSupabase) {
      alert("Supabase is not loaded. Please refresh.");
      return;
    }

    if (!file.type.startsWith("image/")) {
      alert("Please select an image.");
      return;
    }

    if (file.size > 6 * 1024 * 1024) {
      alert("Photo must be smaller than 6MB.");
      return;
    }

    const userResult =
      await picflowSupabase.auth.getUser();

    if (userResult.error || !userResult.data.user) {
      alert("Please login again.");
      return;
    }

    const user =
      userResult.data.user;

    showMessage("Uploading profile photo... 📤");

    const extension =
      file.name.split(".").pop().toLowerCase() || "jpg";

    const filePath =
      user.id + "/" +
      Date.now() + "." +
      extension;

    const uploadResult =
      await picflowSupabase
        .storage
        .from("avatars")
        .upload(
          filePath,
          file,
          {
            cacheControl: "3600",
            contentType: file.type,
            upsert: false
          }
        );

    if (uploadResult.error) {
      console.error(uploadResult.error);

      alert(
        "Photo upload failed:\n\n" +
        uploadResult.error.message
      );

      return;
    }

    const publicResult =
      picflowSupabase
        .storage
        .from("avatars")
        .getPublicUrl(filePath);

    const publicUrl =
      publicResult.data.publicUrl;

    const profileResult =
      await picflowSupabase
        .from("profiles")
        .update({
          avatar_url: publicUrl,
          updated_at: new Date().toISOString()
        })
        .eq("id", user.id);

    if (profileResult.error) {

      console.error(profileResult.error);

      alert(
        "Photo uploaded, but profile update failed:\n\n" +
        profileResult.error.message
      );

      return;
    }

    localStorage.setItem(
      "picflow_dp",
      publicUrl
    );

    /* Update edit preview */

    const preview =
      document.getElementById("dpPreview");

    if (preview) {

      preview.innerHTML =
        '<img src="' +
        publicUrl +
        '" alt="Profile preview">';
    }


    /* Update all avatars */

    document
      .querySelectorAll(".avatar")
      .forEach(function(el) {

        el.innerHTML =
          '<img src="' +
          publicUrl +
          '" alt="Profile photo">';

      });


    /* Update profile avatar */

    const profileAvatar =
      document.querySelector(".profile-avatar");

    if (profileAvatar) {

      profileAvatar.innerHTML =
        '<img src="' +
        publicUrl +
        '" alt="Profile photo">';

    }


    showMessage(
      "Profile photo saved online! ☁️📸"
    );

  };

  input.click();

};


/* =========================================
   LOAD ONLINE PROFILE PHOTO
========================================= */

async function loadSupabaseAvatar() {

  if (!picflowSupabase) return;

  const userResult =
    await picflowSupabase.auth.getUser();

  if (
    userResult.error ||
    !userResult.data.user
  ) {
    return;
  }

  const user =
    userResult.data.user;

  const result =
    await picflowSupabase
      .from("profiles")
      .select("avatar_url")
      .eq("id", user.id)
      .maybeSingle();

  if (result.error) {
    console.error(result.error);
    return;
  }

  if (!result.data || !result.data.avatar_url) {
    return;
  }

  const image =
    result.data.avatar_url;

  localStorage.setItem(
    "picflow_dp",
    image
  );

  document
    .querySelectorAll(".avatar")
    .forEach(function(el) {

      el.innerHTML =
        '<img src="' +
        image +
        '" alt="Profile photo">';

    });

  const profileAvatar =
    document.querySelector(".profile-avatar");

  if (profileAvatar) {

    profileAvatar.innerHTML =
      '<img src="' +
      image +
      '" alt="Profile photo">';

  }

  const preview =
    document.getElementById("dpPreview");

  if (preview) {

    preview.innerHTML =
      '<img src="' +
      image +
      '" alt="Profile preview">';

  }

}


/* Load online DP after app starts */

document.addEventListener(
  "DOMContentLoaded",
  function() {

    setTimeout(
      loadSupabaseAvatar,
      1200
    );

  }
);


/* =========================================================
   PICFLOW FOLLOW / FOLLOWING SYSTEM
   ========================================================= */

(function () {
  if (window.picflowFollowSystemLoaded) return;
  window.picflowFollowSystemLoaded = true;

  let followClient = null;

  function getSupabase() {
    if (followClient) return followClient;

    if (
      typeof window.supabase === "undefined" ||
      !window.SUPABASE_URL ||
      !window.SUPABASE_PUBLISHABLE_KEY ||
      window.SUPABASE_PUBLISHABLE_KEY === "YOUR_PUBLISHABLE_KEY"
    ) {
      console.error("PicFlow: Supabase is not configured.");
      return null;
    }

    followClient = window.supabase.createClient(
      window.SUPABASE_URL,
      window.SUPABASE_PUBLISHABLE_KEY
    );

    return followClient;
  }

  async function getCurrentUser() {
    const sb = getSupabase();
    if (!sb) return null;

    const result = await sb.auth.getUser();

    if (result.error) {
      console.error(result.error);
      return null;
    }

    return result.data.user;
  }

  function esc(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function avatarHTML(url, username) {
    if (url) {
      return `
        <img
          src="${esc(url)}"
          alt="${esc(username)}"
          style="
            width:58px;
            height:58px;
            border-radius:50%;
            object-fit:cover;
            border:1px solid #ddd;
          "
        >
      `;
    }

    return `
      <div style="
        width:58px;
        height:58px;
        border-radius:50%;
        background:#111;
        color:#fff;
        display:flex;
        align-items:center;
        justify-content:center;
        font-size:22px;
        font-weight:700;
      ">
        ${esc((username || "U").charAt(0).toUpperCase())}
      </div>
    `;
  }

  async function getFollowStats(userId) {
    const sb = getSupabase();
    if (!sb) return { followers: 0, following: 0 };

    const [followersResult, followingResult] = await Promise.all([
      sb
        .from("follows")
        .select("*", { count: "exact", head: true })
        .eq("following_id", userId),

      sb
        .from("follows")
        .select("*", { count: "exact", head: true })
        .eq("follower_id", userId)
    ]);

    return {
      followers: followersResult.count || 0,
      following: followingResult.count || 0
    };
  }

  async function isFollowing(targetId) {
    const sb = getSupabase();
    const user = await getCurrentUser();

    if (!sb || !user || !targetId) return false;

    const { data, error } = await sb
      .from("follows")
      .select("follower_id")
      .eq("follower_id", user.id)
      .eq("following_id", targetId)
      .maybeSingle();

    if (error) {
      console.error("Follow check:", error);
      return false;
    }

    return !!data;
  }

  async function followUser(targetId) {
    const sb = getSupabase();
    const user = await getCurrentUser();

    if (!sb || !user) {
      alert("Please login first.");
      return false;
    }

    if (user.id === targetId) {
      alert("You cannot follow yourself.");
      return false;
    }

    const { error } = await sb
      .from("follows")
      .insert({
        follower_id: user.id,
        following_id: targetId
      });

    if (error) {
      console.error(error);
      alert("Follow failed: " + error.message);
      return false;
    }

    return true;
  }

  async function unfollowUser(targetId) {
    const sb = getSupabase();
    const user = await getCurrentUser();

    if (!sb || !user) return false;

    const { error } = await sb
      .from("follows")
      .delete()
      .eq("follower_id", user.id)
      .eq("following_id", targetId);

    if (error) {
      console.error(error);
      alert("Unfollow failed: " + error.message);
      return false;
    }

    return true;
  }

  function createPeopleButton() {
    if (document.getElementById("picflowPeopleButton")) return;

    const button = document.createElement("button");

    button.id = "picflowPeopleButton";
    button.innerHTML = "👥 People";

    button.style.cssText = `
      position:fixed;
      right:16px;
      bottom:88px;
      z-index:9998;
      border:0;
      border-radius:24px;
      padding:12px 18px;
      background:#111;
      color:#fff;
      font-size:15px;
      font-weight:700;
      box-shadow:0 5px 20px rgba(0,0,0,.2);
      cursor:pointer;
    `;

    button.onclick = window.openPeople;

    document.body.appendChild(button);
  }

  function createPeopleModal() {
    if (document.getElementById("picflowPeopleModal")) return;

    const modal = document.createElement("div");

    modal.id = "picflowPeopleModal";

    modal.innerHTML = `
      <div style="
        position:fixed;
        inset:0;
        background:rgba(0,0,0,.55);
        z-index:9999;
        display:flex;
        align-items:flex-end;
        justify-content:center;
      ">
        <div style="
          width:100%;
          max-width:600px;
          max-height:90vh;
          background:#fff;
          border-radius:28px 28px 0 0;
          padding:20px;
          box-sizing:border-box;
          overflow:auto;
        ">

          <div style="
            display:flex;
            align-items:center;
            justify-content:space-between;
            margin-bottom:18px;
          ">
            <h2 style="
              margin:0;
              font-size:24px;
              color:#111;
            ">
              Find People
            </h2>

            <button
              onclick="window.closePeople()"
              style="
                border:0;
                background:#eee;
                width:40px;
                height:40px;
                border-radius:50%;
                font-size:20px;
              "
            >
              ✕
            </button>
          </div>

          <div style="
            display:flex;
            gap:8px;
            margin-bottom:18px;
          ">
            <input
              id="picflowPeopleSearch"
              type="text"
              placeholder="Search username..."
              style="
                flex:1;
                padding:14px;
                border:1px solid #ddd;
                border-radius:15px;
                font-size:16px;
                outline:none;
                box-sizing:border-box;
              "
            >

            <button
              onclick="window.searchPeople()"
              style="
                padding:0 18px;
                border:0;
                border-radius:15px;
                background:#111;
                color:#fff;
                font-weight:700;
              "
            >
              Search
            </button>
          </div>

          <div id="picflowPeopleResults">
            <div style="
              text-align:center;
              color:#777;
              padding:30px 10px;
            ">
              Search for people on PicFlow 🔎
            </div>
          </div>

        </div>
      </div>
    `;

    document.body.appendChild(modal);

    const input = document.getElementById("picflowPeopleSearch");

    input.addEventListener("keydown", function (event) {
      if (event.key === "Enter") {
        window.searchPeople();
      }
    });
  }

  window.openPeople = function () {
    createPeopleModal();

    const modal = document.getElementById("picflowPeopleModal");

    if (modal) {
      modal.style.display = "flex";
    }

    setTimeout(() => {
      const input = document.getElementById("picflowPeopleSearch");
      if (input) input.focus();
    }, 100);
  };

  window.closePeople = function () {
    const modal = document.getElementById("picflowPeopleModal");

    if (modal) {
      modal.style.display = "none";
    }
  };

  window.searchPeople = async function () {
    const sb = getSupabase();
    const user = await getCurrentUser();

    const input = document.getElementById("picflowPeopleSearch");
    const results = document.getElementById("picflowPeopleResults");

    if (!results) return;

    const searchText = input
      ? input.value.trim()
      : "";

    if (!user) {
      results.innerHTML = `
        <div style="
          text-align:center;
          padding:30px;
          color:#777;
        ">
          Please login first 🔐
        </div>
      `;
      return;
    }

    if (!searchText) {
      results.innerHTML = `
        <div style="
          text-align:center;
          padding:30px;
          color:#777;
        ">
          Username enter karo 🔎
        </div>
      `;
      return;
    }

    results.innerHTML = `
      <div style="
        text-align:center;
        padding:30px;
        color:#777;
      ">
        Searching... ⏳
      </div>
    `;

    const { data, error } = await sb
      .from("profiles")
      .select("id, username, bio, avatar_url")
      .ilike("username", "%" + searchText + "%")
      .neq("id", user.id)
      .limit(20);

    if (error) {
      console.error(error);

      results.innerHTML = `
        <div style="
          text-align:center;
          padding:30px;
          color:#d00;
        ">
          Search failed.<br>
          ${esc(error.message)}
        </div>
      `;

      return;
    }

    if (!data || data.length === 0) {
      results.innerHTML = `
        <div style="
          text-align:center;
          padding:35px 10px;
          color:#777;
        ">
          <div style="font-size:40px;">😕</div>
          <div style="margin-top:10px;">
            No user found
          </div>
        </div>
      `;

      return;
    }

    results.innerHTML = "";

    for (const profile of data) {
      const stats = await getFollowStats(profile.id);
      const following = await isFollowing(profile.id);

      const card = document.createElement("div");

      card.style.cssText = `
        display:flex;
        align-items:center;
        gap:12px;
        padding:14px 4px;
        border-bottom:1px solid #eee;
      `;

      card.innerHTML = `
        ${avatarHTML(profile.avatar_url, profile.username)}

        <div style="
          flex:1;
          min-width:0;
        ">
          <div style="
            font-weight:800;
            color:#111;
            font-size:16px;
            overflow:hidden;
            text-overflow:ellipsis;
          ">
            ${esc(profile.username)}
          </div>

          <div style="
            color:#777;
            font-size:13px;
            margin-top:4px;
          ">
            ${esc(profile.bio || "PicFlow user")}
          </div>

          <div style="
            color:#777;
            font-size:12px;
            margin-top:5px;
          ">
            ${stats.followers} followers · ${stats.following} following
          </div>
        </div>

        <button
          class="picflow-follow-btn"
          data-user-id="${esc(profile.id)}"
          data-following="${following ? "true" : "false"}"
          style="
            border:0;
            border-radius:12px;
            padding:10px 15px;
            min-width:88px;
            background:${following ? "#eee" : "#111"};
            color:${following ? "#111" : "#fff"};
            font-weight:700;
          "
        >
          ${following ? "Following" : "Follow"}
        </button>
      `;

      const followButton = card.querySelector(".picflow-follow-btn");

      followButton.onclick = async function () {
        followButton.disabled = true;
        followButton.textContent = "Wait...";

        const targetId = profile.id;
        const currentlyFollowing =
          followButton.dataset.following === "true";

        let success;

        if (currentlyFollowing) {
          success = await unfollowUser(targetId);
        } else {
          success = await followUser(targetId);
        }

        if (success) {
          const newFollowing = !currentlyFollowing;

          followButton.dataset.following =
            newFollowing ? "true" : "false";

          followButton.textContent =
            newFollowing ? "Following" : "Follow";

          followButton.style.background =
            newFollowing ? "#eee" : "#111";

          followButton.style.color =
            newFollowing ? "#111" : "#fff";

          const newStats = await getFollowStats(targetId);

          const statElement =
            card.querySelector(".picflow-user-stats");

          if (statElement) {
            statElement.textContent =
              `${newStats.followers} followers · ${newStats.following} following`;
          }

          const allText = card.querySelectorAll("div");

          for (const element of allText) {
            if (
              element.textContent.includes("followers ·") &&
              element !== card.querySelector(".picflow-user-stats")
            ) {
              element.textContent =
                `${newStats.followers} followers · ${newStats.following} following`;
            }
          }
        }

        followButton.disabled = false;
      };

      results.appendChild(card);
    }
  };

  async function updateMyFollowCounts() {
    const user = await getCurrentUser();

    if (!user) return;

    const stats = await getFollowStats(user.id);

    console.log(
      "PicFlow Follow Stats:",
      stats.followers,
      "followers",
      stats.following,
      "following"
    );

    /*
      Try to update common profile count elements.
      Existing UI can continue working even if these
      elements don't exist.
    */

    const text = document.body.innerText;

    const elements = document.querySelectorAll(
      ".followers-count, .following-count, #followersCount, #followingCount"
    );

    elements.forEach(function (element) {
      const id = element.id || "";
      const cls = element.className || "";

      if (
        id.toLowerCase().includes("follower") ||
        String(cls).toLowerCase().includes("follower")
      ) {
        element.textContent = stats.followers;
      }

      if (
        id.toLowerCase().includes("following") ||
        String(cls).toLowerCase().includes("following")
      ) {
        element.textContent = stats.following;
      }
    });
  }

  function startFollowSystem() {
    createPeopleButton();
    createPeopleModal();

    setTimeout(updateMyFollowCounts, 1500);
  }

  if (document.readyState === "loading") {
    document.addEventListener(
      "DOMContentLoaded",
      startFollowSystem
    );
  } else {
    startFollowSystem();
  }

  window.picflowFollowUser = followUser;
  window.picflowUnfollowUser = unfollowUser;
  window.picflowGetFollowStats = getFollowStats;
  window.picflowIsFollowing = isFollowing;

})();

/* =========================================================
   END FOLLOW / FOLLOWING SYSTEM
   ========================================================= */

/* =========================================================
   PICFLOW - LIVE PROFILE FOLLOW COUNTS
   ========================================================= */

(function () {

  async function updateLiveProfileCounts() {

    try {

      if (
        typeof window.supabase === "undefined" ||
        !window.SUPABASE_URL ||
        !window.SUPABASE_PUBLISHABLE_KEY ||
        window.SUPABASE_PUBLISHABLE_KEY === "YOUR_PUBLISHABLE_KEY"
      ) {
        console.log("Supabase not ready");
        return;
      }

      const sb = window.supabase.createClient(
        window.SUPABASE_URL,
        window.SUPABASE_PUBLISHABLE_KEY
      );

      const {
        data: userData,
        error: userError
      } = await sb.auth.getUser();

      if (userError || !userData || !userData.user) {
        console.log("No logged-in user");
        return;
      }

      const userId = userData.user.id;

      const [
        followersResult,
        followingResult
      ] = await Promise.all([

        sb
          .from("follows")
          .select("*", { count: "exact", head: true })
          .eq("following_id", userId),

        sb
          .from("follows")
          .select("*", { count: "exact", head: true })
          .eq("follower_id", userId)

      ]);

      if (followersResult.error) {
        console.error(
          "Followers count error:",
          followersResult.error
        );
      }

      if (followingResult.error) {
        console.error(
          "Following count error:",
          followingResult.error
        );
      }

      const followers =
        followersResult.count || 0;

      const following =
        followingResult.count || 0;

      console.log(
        "LIVE PROFILE:",
        followers,
        "followers",
        following,
        "following"
      );

      /*
        Find profile stats by looking for text
        containing Followers / Following.
      */

      const allElements =
        document.querySelectorAll("*");

      allElements.forEach(function (el) {

        if (el.children.length > 0) return;

        const text =
          (el.textContent || "").trim();

        if (!text) return;

        /*
          Replace old static follower number.
          Example:
          120
          Followers
        */

        if (
          text.toLowerCase() === "followers"
        ) {

          const parent =
            el.parentElement;

          if (parent) {

            const number =
              parent.querySelector(
                "strong, b, span"
              );

            if (number && number !== el) {
              number.textContent = followers;
            }

          }

        }

        /*
          Replace old static following number.
        */

        if (
          text.toLowerCase() === "following"
        ) {

          const parent =
            el.parentElement;

          if (parent) {

            const number =
              parent.querySelector(
                "strong, b, span"
              );

            if (number && number !== el) {
              number.textContent = following;
            }

          }

        }

      });

      /*
        Also replace common classes/IDs if they exist.
      */

      const followerSelectors = [
        "#followersCount",
        ".followers-count",
        ".followersCount"
      ];

      const followingSelectors = [
        "#followingCount",
        ".following-count",
        ".followingCount"
      ];

      followerSelectors.forEach(function (selector) {

        document
          .querySelectorAll(selector)
          .forEach(function (el) {

            el.textContent = followers;

          });

      });

      followingSelectors.forEach(function (selector) {

        document
          .querySelectorAll(selector)
          .forEach(function (el) {

            el.textContent = following;

          });

      });

    } catch (error) {

      console.error(
        "Live profile count error:",
        error
      );

    }

  }

  /*
    Run after page loads.
  */

  if (document.readyState === "loading") {

    document.addEventListener(
      "DOMContentLoaded",
      function () {

        setTimeout(
          updateLiveProfileCounts,
          1800
        );

      }
    );

  } else {

    setTimeout(
      updateLiveProfileCounts,
      1800
    );

  }

  /*
    Make function available globally.
  */

  window.updateLiveProfileCounts =
    updateLiveProfileCounts;

})();

/* =========================================================
   END LIVE PROFILE FOLLOW COUNTS
   ========================================================= */

