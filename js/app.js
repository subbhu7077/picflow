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

    const app = document.querySelector(".app");
    app.prepend(post);

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

  count.textContent = number.toLocaleString() + (number === 1 ? " like" : " likes");
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
  showMessage(page);
}

document.addEventListener("DOMContentLoaded", function () {
  console.log("PicFlow App Loaded");
});
