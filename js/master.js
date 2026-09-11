// --- Initial Default State ---
const DEFAULT_POSTS = [
  {
    id: 101,
    username: "Subbhu7077",
    avatar: "https://picsum.photos/200/200?random=1",
    image: "https://picsum.photos/800/800?random=10",
    likes: 124,
    liked: false,
    saved: false,
    caption: "Working session live on PicFlow! 🚀✨",
    comments: ["Looking sick!", "Smooth dark theme bro 🔥"],
    date: "JUST NOW"
  },
  {
    id: 102,
    username: "wanderlust",
    avatar: "https://picsum.photos/200/200?random=2",
    image: "https://picsum.photos/800/800?random=20",
    likes: 389,
    liked: false,
    saved: false,
    caption: "Sunset road trip vibes 🌄🚗",
    comments: ["Where is this?", "Incredible colors!"],
    date: "2 HOURS AGO"
  }
];

const DEFAULT_STORIES = [
  { id: 1, user: "Subbhu", avatar: "https://picsum.photos/200/200?random=1", img: "https://picsum.photos/800/1200?random=30" },
  { id: 2, user: "alex", avatar: "https://picsum.photos/200/200?random=3", img: "https://picsum.photos/800/1200?random=31" },
  { id: 3, user: "priya_k", avatar: "https://picsum.photos/200/200?random=4", img: "https://picsum.photos/800/1200?random=32" },
  { id: 4, user: "rohit_v", avatar: "https://picsum.photos/200/200?random=5", img: "https://picsum.photos/800/1200?random=33" }
];

// Persistent State
let posts = JSON.parse(localStorage.getItem("picflow_posts")) || DEFAULT_POSTS;
let stories = JSON.parse(localStorage.getItem("picflow_stories")) || DEFAULT_STORIES;

function saveState() {
  localStorage.setItem("picflow_posts", JSON.stringify(posts));
  localStorage.setItem("picflow_stories", JSON.stringify(stories));
}

// Switch Tabs
function switchTab(tabId) {
  document.querySelectorAll(".tab-view").forEach(tab => tab.classList.remove("active"));
  const target = document.getElementById(tabId);
  if (target) target.classList.add("active");
  window.scrollTo({ top: 0, behavior: "smooth" });
  if (tabId === "exploreTab") renderExplore();
  if (tabId === "profileTab") renderProfile();
}

// Render Stories Tray
function renderStories() {
  const container = document.getElementById("storiesContainer");
  let html = `
    <div class="story-node" onclick="openStoryModal()">
      <div class="ring add-ring">
        <img class="story-avatar" src="https://picsum.photos/200/200?random=1" />
        <div class="plus-badge">+</div>
      </div>
      <span>Your story</span>
    </div>
  `;

  stories.forEach(s => {
    html += `
      <div class="story-node" onclick="playStory('${s.img}', '${s.user}', '${s.avatar}')">
        <div class="ring">
          <img class="story-avatar" src="${s.avatar}" />
        </div>
        <span>${s.user}</span>
      </div>
    `;
  });

  container.innerHTML = html;
}

// Render Posts Feed
function renderFeed() {
  const container = document.getElementById("feedContainer");
  container.innerHTML = posts.map(p => `
    <article class="post" id="post-${p.id}">
      <div class="post-head">
        <div class="post-head-left">
          <img class="post-head-avatar" src="${p.avatar}" />
          <span class="post-username">${p.username}</span>
        </div>
        <i class="fa-solid fa-ellipsis" style="cursor: pointer;" onclick="deletePost(${p.id})"></i>
      </div>

      <div class="post-body" ondblclick="doubleTapLike(${p.id})">
        <img src="${p.image}" loading="lazy" />
        <i class="fa-solid fa-heart floating-heart" id="heart-anim-${p.id}"></i>
      </div>

      <div class="post-buttons">
        <div class="post-buttons-left">
          <i class="${p.liked ? 'fa-solid fa-heart liked-btn' : 'fa-regular fa-heart'}" onclick="toggleLike(${p.id})"></i>
          <i class="fa-regular fa-comment" onclick="focusComment(${p.id})"></i>
          <i class="fa-regular fa-paper-plane" onclick="sharePost()"></i>
        </div>
        <i class="${p.saved ? 'fa-solid fa-bookmark saved-btn' : 'fa-regular fa-bookmark'}" onclick="toggleSave(${p.id})"></i>
      </div>

      <div class="post-details">
        <div class="likes-line">${p.likes} likes</div>
        <div class="caption-line"><span>${p.username}</span>${p.caption}</div>
        
        <div class="comments-view">
          ${p.comments.map(c => `<div><span>subbhu</span>${c}</div>`).join("")}
        </div>
        <div class="post-timestamp">${p.date}</div>
      </div>

      <div class="quick-comment-box">
        <input type="text" id="comment-input-${p.id}" placeholder="Add a comment..." onkeydown="if(event.key==='Enter') addComment(${p.id})" />
        <button onclick="addComment(${p.id})">Post</button>
      </div>
    </article>
  `).join("");
}

// Like Interactions
function toggleLike(postId) {
  const p = posts.find(item => item.id === postId);
  if (!p) return;
  p.liked = !p.liked;
  p.likes += p.liked ? 1 : -1;
  saveState();
  renderFeed();
}

function doubleTapLike(postId) {
  const heart = document.getElementById(`heart-anim-${postId}`);
  if (heart) {
    heart.classList.add("animate");
    setTimeout(() => heart.classList.remove("animate"), 600);
  }
  const p = posts.find(item => item.id === postId);
  if (p && !p.liked) {
    p.liked = true;
    p.likes += 1;
    saveState();
    renderFeed();
  }
}

function toggleSave(postId) {
  const p = posts.find(item => item.id === postId);
  if (!p) return;
  p.saved = !p.saved;
  saveState();
  renderFeed();
}

function addComment(postId) {
  const input = document.getElementById(`comment-input-${postId}`);
  if (!input || !input.value.trim()) return;
  const p = posts.find(item => item.id === postId);
  if (p) {
    p.comments.push(input.value.trim());
    saveState();
    renderFeed();
  }
}

function focusComment(postId) {
  const input = document.getElementById(`comment-input-${postId}`);
  if (input) input.focus();
}

function sharePost() {
  if (navigator.clipboard) {
    navigator.clipboard.writeText(window.location.href);
    alert("Post link copied!");
  }
}

function deletePost(id) {
  if (confirm("Delete this post?")) {
    posts = posts.filter(p => p.id !== id);
    saveState();
    renderFeed();
    renderProfile();
  }
}

// Render Explore & Profile
function renderExplore() {
  const container = document.getElementById("exploreContainer");
  const randomImages = [
    "https://picsum.photos/400/400?random=11",
    "https://picsum.photos/400/400?random=12",
    "https://picsum.photos/400/400?random=13",
    "https://picsum.photos/400/400?random=14",
    "https://picsum.photos/400/400?random=15",
    "https://picsum.photos/400/400?random=16",
    "https://picsum.photos/400/400?random=17",
    "https://picsum.photos/400/400?random=18",
    "https://picsum.photos/400/400?random=19"
  ];
  container.innerHTML = randomImages.map(img => `<img src="${img}" loading="lazy" />`).join("");
}

function renderProfile() {
  document.getElementById("userPostCount").innerText = posts.length;
  const grid = document.getElementById("profilePostsGrid");
  grid.innerHTML = posts.map(p => `<img src="${p.image}" loading="lazy" />`).join("");
}

// Modals: Post & Story Creation
function openCreateModal() { document.getElementById("createPostModal").style.display = "flex"; }
function closeCreateModal() { document.getElementById("createPostModal").style.display = "none"; }
function openStoryModal() { document.getElementById("createStoryModal").style.display = "flex"; }
function closeStoryModal() { document.getElementById("createStoryModal").style.display = "none"; }

function submitNewPost() {
  const file = document.getElementById("postFileInput").files[0];
  const caption = document.getElementById("postCaptionInput").value;
  if (!file) {
    alert("Please select an image first!");
    return;
  }

  const reader = new FileReader();
  reader.onload = function (e) {
    const newPost = {
      id: Date.now(),
      username: "Subbhu7077",
      avatar: "https://picsum.photos/200/200?random=1",
      image: e.target.result,
      likes: 0,
      liked: false,
      saved: false,
      caption: caption || "",
      comments: [],
      date: "JUST NOW"
    };
    posts.unshift(newPost);
    saveState();
    renderFeed();
    closeCreateModal();
    document.getElementById("postFileInput").value = "";
    document.getElementById("postCaptionInput").value = "";
    switchTab("feedTab");
  };
  reader.readAsDataURL(file);
}

function submitNewStory() {
  const file = document.getElementById("storyFileInput").files[0];
  if (!file) {
    alert("Please select a story image!");
    return;
  }

  const reader = new FileReader();
  reader.onload = function (e) {
    stories.unshift({
      id: Date.now(),
      user: "Subbhu",
      avatar: "https://picsum.photos/200/200?random=1",
      img: e.target.result
    });
    saveState();
    renderStories();
    closeStoryModal();
    document.getElementById("storyFileInput").value = "";
  };
  reader.readAsDataURL(file);
}

// Story Player
let storyTimer = null;
function playStory(imgUrl, userName, avatar) {
  const player = document.getElementById("storyPlayer");
  const fill = document.getElementById("storyFill");
  document.getElementById("storyPlayerImg").src = imgUrl;
  document.getElementById("storyViewerName").innerText = userName;
  document.getElementById("storyViewerAvatar").src = avatar;

  player.style.display = "flex";
  fill.style.width = "0%";
  setTimeout(() => { fill.style.width = "100%"; }, 50);

  clearTimeout(storyTimer);
  storyTimer = setTimeout(() => {
    closeStoryViewer();
  }, 4050);
}

function closeStoryViewer() {
  clearTimeout(storyTimer);
  document.getElementById("storyPlayer").style.display = "none";
  document.getElementById("storyFill").style.width = "0%";
}

// Bootstrap
renderStories();
renderFeed();
