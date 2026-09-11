let stories = [
  { id: 1, user: "your_story", avatar: "https://picsum.photos/100/100?random=1", img: "https://picsum.photos/600/900?random=1" },
  { id: 2, user: "traveler", avatar: "https://picsum.photos/100/100?random=2", img: "https://picsum.photos/600/900?random=2" },
  { id: 3, user: "lensman", avatar: "https://picsum.photos/100/100?random=3", img: "https://picsum.photos/600/900?random=3" }
];

let posts = [
  {
    id: 1,
    username: "subbhu",
    avatar: "https://picsum.photos/100/100?random=5",
    image: "https://picsum.photos/600/600?random=10",
    likes: 24,
    liked: false,
    caption: "PicFlow master setup live ✨",
    comments: ["Awesome layout!", "Working smooth"]
  }
];

const storiesContainer = document.getElementById("storiesContainer");
const feedContainer = document.getElementById("feedContainer");
const createModal = document.getElementById("createModal");
const storyViewer = document.getElementById("storyViewer");
const activeStoryImg = document.getElementById("activeStoryImg");

function renderStories() {
  storiesContainer.innerHTML = stories.map(s => `
    <div class="story" onclick="viewStory('${s.img}')">
      <div class="story-ring">
        <img class="story-img" src="${s.avatar}" alt="${s.user}">
      </div>
      <span>${s.user}</span>
    </div>
  `).join("");
}

function renderFeed() {
  feedContainer.innerHTML = posts.map(p => `
    <article class="post">
      <div class="post-header">
        <div class="post-user">
          <img src="${p.avatar}" class="post-avatar" alt="${p.username}">
          <span class="post-username">${p.username}</span>
        </div>
        <i class="fa-solid fa-ellipsis"></i>
      </div>
      <img src="${p.image}" class="post-image" alt="Post">
      <div class="post-actions">
        <div class="post-actions-left">
          <i class="${p.liked ? 'fa-solid fa-heart liked' : 'fa-regular fa-heart'}" onclick="toggleLike(${p.id})"></i>
          <i class="fa-regular fa-comment" onclick="focusComment(${p.id})"></i>
          <i class="fa-regular fa-paper-plane" onclick="alert('Post Link Copied!')"></i>
        </div>
        <i class="fa-regular fa-bookmark" onclick="this.classList.toggle('fa-solid')"></i>
      </div>
      <div class="post-meta">
        <div class="likes-count">${p.likes} likes</div>
        <div class="caption"><span>${p.username}</span>${p.caption}</div>
        <div class="comments-list">
          ${p.comments.map(c => `<div><strong>user:</strong> ${c}</div>`).join("")}
        </div>
      </div>
      <div class="add-comment">
        <input type="text" id="comment-input-${p.id}" placeholder="Add a comment..." />
        <button onclick="addComment(${p.id})">Post</button>
      </div>
    </article>
  `).join("");
}

function toggleLike(postId) {
  const post = posts.find(p => p.id === postId);
  if (!post) return;
  post.liked = !post.liked;
  post.likes += post.liked ? 1 : -1;
  renderFeed();
}

function focusComment(postId) {
  const input = document.getElementById(`comment-input-${postId}`);
  if (input) input.focus();
}

function addComment(postId) {
  const input = document.getElementById(`comment-input-${postId}`);
  if (!input || !input.value.trim()) return;
  const post = posts.find(p => p.id === postId);
  if (post) {
    post.comments.push(input.value.trim());
    renderFeed();
  }
}

function openCreateModal() { createModal.style.display = "flex"; }
function closeCreateModal() { createModal.style.display = "none"; }

function submitPost() {
  const fileInput = document.getElementById("postImageInput");
  const captionInput = document.getElementById("postCaptionInput");

  if (!fileInput.files || !fileInput.files[0]) {
    alert("Please select an image!");
    return;
  }

  const reader = new FileReader();
  reader.onload = function (e) {
    posts.unshift({
      id: Date.now(),
      username: "you",
      avatar: "https://picsum.photos/100/100?random=99",
      image: e.target.result,
      likes: 0,
      liked: false,
      caption: captionInput.value || "",
      comments: []
    });
    renderFeed();
    closeCreateModal();
    fileInput.value = "";
    captionInput.value = "";
  };
  reader.readAsDataURL(fileInput.files[0]);
}

function viewStory(url) {
  activeStoryImg.src = url;
  storyViewer.style.display = "flex";
}

function closeStoryViewer() {
  storyViewer.style.display = "none";
  activeStoryImg.src = "";
}

renderStories();
renderFeed();
