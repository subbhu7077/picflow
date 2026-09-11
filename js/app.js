document.addEventListener("DOMContentLoaded", () => {

  // CREATE BUTTON
  const createBtn = document.querySelector(".create-btn");

  if (createBtn) {
    createBtn.addEventListener("click", () => {

      const input = document.createElement("input");
      input.type = "file";
      input.accept = "image/*";

      input.onchange = (event) => {
        const file = event.target.files[0];

        if (!file) return;

        const imageURL = URL.createObjectURL(file);

        const post = document.createElement("div");
        post.className = "post";

        post.innerHTML = `
          <div class="post-header">
            <div class="avatar">Y</div>
            <div>
              <strong>You</strong>
              <small>Just now</small>
            </div>
          </div>

          <img class="post-image" src="${imageURL}" alt="Your post">

          <div class="post-actions">
            <button class="like-btn">♡</button>
            <button>💬</button>
            <button>↗</button>
          </div>

          <div class="post-info">
            <strong>0 likes</strong>
            <p>You just posted a photo 📸</p>
          </div>
        `;

        const feed = document.querySelector("main") || document.body;
        feed.appendChild(post);

        alert("Post created successfully! 🎉");
      };

      input.click();
    });
  }

  // LIKE BUTTON
  document.addEventListener("click", (event) => {
    if (!event.target.classList.contains("like-btn")) return;

    const button = event.target;
    const post = button.closest(".post");

    if (!post) return;

    const likeText = post.querySelector(".post-info strong");

    if (button.classList.contains("liked")) {
      button.classList.remove("liked");
      button.textContent = "♡";
      likeText.textContent = "0 likes";
    } else {
      button.classList.add("liked");
      button.textContent = "♥";
      likeText.textContent = "1 like";
    }
  });

});
