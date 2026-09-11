
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

