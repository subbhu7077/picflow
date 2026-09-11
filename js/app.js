function showMessage(message) {
  alert(message);
}

function createPost() {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = "image/*";

  input.onchange = function () {
    const file = input.files[0];
    if (!file) return;

    const imageURL = URL.createObjectURL(file);

    const post = document.createElement("article");
    post.className = "post";

    post.innerHTML = `
      <div class="post-header">
        <div class="user-info">
          <div class="avatar">Y</div>
          <div>
            <strong>You</strong>
            <small>Just now</small>
          </div>
        </div>
        <button class="more-btn" onclick="showMessage('Post options')">⋯</button>
      </div>

      <div class="post-image">
        <img src="${imageURL}" alt="Your post">
      </div>

      <div class="post-actions">
        <div class="left-actions">
          <button class="action-btn like-btn" onclick="toggleLike(this)">♡</button>
          <button class="action-btn" onclick="commentPost()">♧</button>
          <button class="action-btn" onclick="sharePost()">↗</button>
        </div>
        <button class="action-btn save-btn" onclick="toggleSave(this)">♧</button>
      </div>

      <div class="likes">
        <strong class="like-count">0 likes</strong>
      </div>

      <div class="caption">
        <strong>You</strong>
        My new PicFlow post 📸
      </div>

      <button class="comments-btn" onclick="commentPost()">
        Add a comment
      </button>

      <div class="time">JUST NOW</div>
    `;

    document.querySelector(".app").prepend(post);
    showMessage("Post created successfully! 🎉");
  };

  input.click();
}

function toggleLike(button) {
  const post = button.closest(".post");
  const count = post.querySelector(".like-count");

  let number = parseInt(count.textContent.replace(/,/g, "")) || 0;

  if (button.classList.contains("liked")) {
    button.classList.remove("liked");
    button.textContent = "♡";
    number--;
  } else {
    button.classList.add("liked");
    button.textContent = "♥";
    number++;
  }

  count.textContent =
    number.toLocaleString() +
    (number === 1 ? " like" : " likes");
}

function commentPost() {
  const comment = prompt("Write your comment:");

  if (comment && comment.trim()) {
    showMessage("Comment added! 💬");
  }
}

function sharePost() {
  if (navigator.share) {
    navigator.share({
      title: "PicFlow",
      text: "Check out this PicFlow post!"
    });
  } else {
    showMessage("Post link ready to share! ↗");
  }
}

function toggleSave(button) {
  if (button.classList.contains("saved")) {
    button.classList.remove("saved");
    button.textContent = "♧";
    showMessage("Removed from saved");
  } else {
    button.classList.add("saved");
    button.textContent = "♥";
    showMessage("Post saved! 🔖");
  }
}

function openStory(name) {
  showMessage(name + "'s story");
}

function navigate(page) {
  if (page === "Profile") {
    openProfile();
    return;
  }

  showMessage(page);
}

function openProfile() {
  if (document.querySelector(".profile-overlay")) return;

  const profile = document.createElement("div");
  profile.className = "profile-overlay";

  profile.innerHTML = `
    <div class="profile-top">
      <h2>Profile</h2>
      <button class="profile-close" onclick="closeProfile()">×</button>
    </div>

    <div class="profile-main">

      <section class="profile-header">

        <div class="profile-head-row">

          <div class="profile-avatar">Y</div>

          <div class="profile-stats">

            <div class="profile-stat">
              <strong>3</strong>
              <span>Posts</span>
            </div>

            <div class="profile-stat">
              <strong>248</strong>
              <span>Followers</span>
            </div>

            <div class="profile-stat">
              <strong>186</strong>
              <span>Following</span>
            </div>

          </div>

        </div>

        <div class="profile-name">
          <strong>Your Name</strong>
          <p>📸 Creator on PicFlow<br>
          Sharing moments, travel & creativity ✨</p>
        </div>

        <button class="edit-profile-btn" onclick="editProfile()">
          Edit Profile
        </button>

      </section>

      <div class="profile-tabs">
        <button class="profile-tab active">▦</button>
        <button class="profile-tab">♡</button>
      </div>

      <div class="profile-grid">

        <img src="https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&fit=crop&w=500&q=80">
        <img src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=500&q=80">
        <img src="https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=500&q=80">

      </div>

    </div>
  `;

  document.body.appendChild(profile);
  document.body.style.overflow = "hidden";
}

function closeProfile() {
  const profile = document.querySelector(".profile-overlay");

  if (profile) {
    profile.remove();
    document.body.style.overflow = "";
  }
}

function editProfile() {
  const box = document.createElement("div");
  box.className = "edit-box";

  box.innerHTML = `
    <div class="edit-card">

      <h3>Edit Profile</h3>

      <input id="editName" placeholder="Name" value="Your Name">

      <textarea id="editBio" rows="3"
        placeholder="Bio">📸 Creator on PicFlow
Sharing moments, travel & creativity ✨</textarea>

      <button class="edit-save" onclick="saveProfile()">
        Save Profile
      </button>

    </div>
  `;

  document.body.appendChild(box);
}

function saveProfile() {
  const name = document.getElementById("editName").value.trim();
  const bio = document.getElementById("editBio").value.trim();

  if (!name) {
    showMessage("Please enter your name");
    return;
  }

  const nameElement = document.querySelector(".profile-name strong");
  const bioElement = document.querySelector(".profile-name p");

  nameElement.textContent = name;
  bioElement.innerHTML = bio.replace(/\n/g, "<br>");

  document.querySelector(".edit-box").remove();

  showMessage("Profile updated! ✅");
}

document.addEventListener("DOMContentLoaded", function () {
  console.log("PicFlow App Loaded");
});
