// --- Initial Seed Data ---
const DEFAULT_POSTS = [
  {
    id: 1001,
    username: "Subbhu7077",
    avatar: "https://picsum.photos/200/200?random=1",
    image: "https://picsum.photos/800/800?random=201",
    likes: 154,
    liked: false,
    saved: false,
    caption: "PicFlow Master V6 is live! Every single button is now functional 🔥⚡",
    comments: ["Working super fast!", "UI looks completely identical to Instagram"],
    time: "JUST NOW"
  },
  {
    id: 1002,
    username: "wander_soul",
    avatar: "https://picsum.photos/200/200?random=2",
    image: "https://picsum.photos/800/800?random=202",
    likes: 520,
    liked: false,
    saved: false,
    caption: "Golden hour hues somewhere in the mountains 🏔️🌄",
    comments: ["Heaven on earth!", "Incredible shot mate 👏"],
    time: "3 HOURS AGO"
  }
];

const DEFAULT_STORIES = [
  { id: 1, user: "Your Story", avatar: "https://picsum.photos/200/200?random=1", img: "https://picsum.photos/800/1200?random=301" },
  { id: 2, user: "aaron_v", avatar: "https://picsum.photos/200/200?random=3", img: "https://picsum.photos/800/1200?random=302" },
  { id: 3, user: "priya_art", avatar: "https://picsum.photos/200/200?random=4", img: "https://picsum.photos/800/1200?random=303" },
  { id: 4, user: "travel_geek", avatar: "https://picsum.photos/200/200?random=5", img: "https://picsum.photos/800/1200?random=304" }
];

const DEFAULT_NOTIFS = [
  { id: 1, user: "priya_art", avatar: "https://picsum.photos/200/200?random=4", msg: "liked your post.", time: "12m", isFollow: false },
  { id: 2, user: "aaron_v", avatar: "https://picsum.photos/200/200?random=3", msg: "started following you.", time: "45m", isFollow: true },
  { id: 3, user: "wander_soul", avatar: "https://picsum.photos/200/200?random=2", msg: "commented: 'Working super fast!'", time: "2h", isFollow: false }
];

// Persistent State
let posts = JSON.parse(localStorage.getItem("pf_posts")) || DEFAULT_POSTS;
let stories = JSON.parse(localStorage.getItem("pf_stories")) || DEFAULT_STORIES;
let userProfile = JSON.parse(localStorage.getItem("pf_profile")) || {
  name: "Subbhu7077",
  bio: "Tech Creator | Visual Storyteller ⚡"
};

function saveAll() {
  localStorage.setItem("pf_posts", JSON.stringify(posts));
  localStorage.setItem("pf_stories", JSON.stringify(stories));
  localStorage.setItem("pf_profile", JSON.stringify(userProfile));
}

// Tab Switching
function switchTab(tabId) {
  document.querySelectorAll(".tab-page").forEach(page => page.classList.remove("active"));
  const target = document.getElementById(tabId);
  if (target) target.classList.add("active");
  window.scrollTo({ top: 0, behavior: "smooth" });

  if (tabId === "exploreTab") renderExplore();
  if (tabId === "profileTab") renderProfile();
  if (tabId === "notifTab") renderNotifs();
}

// Stories Tray
function renderStories() {
  const box = document.getElementById("storiesContainer");
  let html = `
    <div class="story-card" onclick="openNewStoryModal()">
      <div class="story-ring-box self-ring">
        <img class="story-img-circle" src="https://picsum.photos/200/200?random=1" />
        <div class="story-plus">+</div>
      </div>
      <span>Your story</span>
    </div>
  `;

  stories.forEach(s => {
    html += `
      <div class="story-card" onclick="launchStoryViewer('${s.img}', '${s.user}', '${s.avatar}')">
        <div class="story-ring-box">
          <img class="story-img-circle" src="${s.avatar}" />
        </div>
        <span>${s.user}</span>
      </div>
    `;
  });
  box.innerHTML = html;
}

// Story Viewer
let storyTimeout = null;
function launchStoryViewer(img, user, avatar) {
  const viewer = document.getElementById("storyViewer");
  const fill = document.getElementById("storyProgFill");
  document.getElementById("storyDisplayImg").src = img;
  document.getElementById("storyAuthorName").innerText = user;
  document.getElementById("storyAuthorImg").src = avatar;

  viewer.style.display = "flex";
  fill.style.width = "0%";
  setTimeout(() => { fill.style.width = "100%"; }, 40);

  clearTimeout(storyTimeout);
  storyTimeout = setTimeout(closeStoryViewer, 4050);
}

function closeStoryViewer() {
  clearTimeout(storyTimeout);
  document.getElementById("storyViewer").style.display = "none";
  document.getElementById("storyProgFill").style.width = "0%";
}

// Feed Posts
function renderFeed() {
  const feed = document.getElementById("feedContainer");
  feed.innerHTML = posts.map(p => `
    <article class="post-card" id="post-${p.id}">
      <div class="post-head">
        <div class="post-head-user" onclick="switchTab('profileTab')">
          <img src="${p.avatar}" class="post-avatar" />
          <span class="post-name">${p.username}</span>
        </div>
        <i class="fa-solid fa-ellipsis post-more" onclick="deletePostItem(${p.id})"></i>
      </div>

      <div class="post-media" ondblclick="triggerDoubleTapHeart(${p.id})">
        <img src="${p.image}" loading="lazy" />
        <i class="fa-solid fa-heart heart-pop" id="heart-anim-${p.id}"></i>
      </div>

      <div class="post-actions-row">
        <div class="post-actions-left">
          <i class="${p.liked ? 'fa-solid fa-heart liked-red' : 'fa-regular fa-heart'}" onclick="togglePostLike(${p.id})"></i>
          <i class="fa-regular fa-comment" onclick="focusPostComment(${p.id})"></i>
          <i class="fa-regular fa-paper-plane" onclick="sharePostUrl()"></i>
        </div>
        <i class="${p.saved ? 'fa-solid fa-bookmark saved-white' : 'fa-regular fa-bookmark'}" onclick="togglePostSave(${p.id})"></i>
      </div>

      <div class="post-info">
        <div class="likes-text">${p.likes} likes</div>
        <div class="caption-text"><span>${p.username}</span>${p.caption}</div>
        <div class="comments-tray">
          ${p.comments.map(c => `<div class="comment-line"><span>User</span>${c}</div>`).join("")}
        </div>
        <div class="time-text">${p.time}</div>
      </div>

      <div class="comment-input-area">
        <input type="text" id="comment-field-${p.id}" placeholder="Add a comment..." onkeydown="if(event.key==='Enter') submitPostComment(${p.id})" />
        <button onclick="submitPostComment(${p.id})">Post</button>
      </div>
    </article>
  `).join("");
}

function togglePostLike(id) {
  const p = posts.find(item => item.id === id);
  if (!p) return;
  p.liked = !p.liked;
  p.likes += p.liked ? 1 : -1;
  saveAll();
  renderFeed();
}

function triggerDoubleTapHeart(id) {
  const heart = document.getElementById(`heart-anim-${id}`);
  if (heart) {
    heart.classList.add("active");
    setTimeout(() => heart.classList.remove("active"), 500);
  }
  const p = posts.find(item => item.id === id);
  if (p && !p.liked) {
    p.liked = true;
    p.likes += 1;
    saveAll();
    renderFeed();
  }
}

function togglePostSave(id) {
  const p = posts.find(item => item.id === id);
  if (!p) return;
  p.saved = !p.saved;
  saveAll();
  renderFeed();
}

function focusPostComment(id) {
  const field = document.getElementById(`comment-field-${id}`);
  if (field) field.focus();
}

function submitPostComment(id) {
  const field = document.getElementById(`comment-field-${id}`);
  if (!field || !field.value.trim()) return;
  const p = posts.find(item => item.id === id);
  if (p) {
    p.comments.push(field.value.trim());
    saveAll();
    renderFeed();
  }
}

function sharePostUrl() {
  if (navigator.clipboard) navigator.clipboard.writeText(window.location.href);
  alert("Link copied to clipboard! 🔗 Share anywhere");
}

function deletePostItem(id) {
  if (confirm("Delete this post from PicFlow?")) {
    posts = posts.filter(p => p.id !== id);
    saveAll();
    renderFeed();
    renderProfile();
  }
}

// Upload Post Modal
function openNewPostModal() { document.getElementById("newPostModal").style.display = "flex"; }
function closeNewPostModal() { document.getElementById("newPostModal").style.display = "none"; }

function submitPostCreation() {
  const file = document.getElementById("newPostFileInput").files[0];
  const caption = document.getElementById("newPostCaptionInput").value;
  if (!file) {
    alert("Please choose a picture first!");
    return;
  }
  const reader = new FileReader();
  reader.onload = function(e) {
    posts.unshift({
      id: Date.now(),
      username: userProfile.name,
      avatar: "https://picsum.photos/200/200?random=1",
      image: e.target.result,
      likes: 0,
      liked: false,
      saved: false,
      caption: caption || "",
      comments: [],
      time: "JUST NOW"
    });
    saveAll();
    renderFeed();
    closeNewPostModal();
    document.getElementById("newPostFileInput").value = "";
    document.getElementById("newPostCaptionInput").value = "";
    switchTab("feedTab");
  };
  reader.readAsDataURL(file);
}

// Upload Story Modal
function openNewStoryModal() { document.getElementById("newStoryModal").style.display = "flex"; }
function closeNewStoryModal() { document.getElementById("newStoryModal").style.display = "none"; }

function submitStoryCreation() {
  const file = document.getElementById("newStoryFileInput").files[0];
  if (!file) {
    alert("Please select a story picture!");
    return;
  }
  const reader = new FileReader();
  reader.onload = function(e) {
    stories.unshift({
      id: Date.now(),
      user: "Your Story",
      avatar: "https://picsum.photos/200/200?random=1",
      img: e.target.result
    });
    saveAll();
    renderStories();
    closeNewStoryModal();
    document.getElementById("newStoryFileInput").value = "";
  };
  reader.readAsDataURL(file);
}

// Explore Section
const exploreImages = [
  "https://picsum.photos/400/400?random=401",
  "https://picsum.photos/400/400?random=402",
  "https://picsum.photos/400/400?random=403",
  "https://picsum.photos/400/400?random=404",
  "https://picsum.photos/400/400?random=405",
  "https://picsum.photos/400/400?random=406",
  "https://picsum.photos/400/400?random=407",
  "https://picsum.photos/400/400?random=408",
  "https://picsum.photos/400/400?random=409"
];

function renderExplore() {
  const box = document.getElementById("exploreContainer");
  box.innerHTML = exploreImages.map(url => `
    <img src="${url}" onclick="alert('Viewing explore snapshot!')" />
  `).join("");
}

function handleExploreSearch() {
  const query = document.getElementById("exploreSearchInput").value.toLowerCase();
  const box = document.getElementById("exploreContainer");
  if (!query) {
    renderExplore();
    return;
  }
  box.innerHTML = exploreImages.slice(0, 3).map(url => `
    <img src="${url}" onclick="alert('Search hit for: ' + '${query}')" />
  `).join("");
}

// Reels Logic
const reelsCollection = [
  { img: "https://picsum.photos/600/1000?random=501", user: "@subbhu_vibes", caption: "Midnight drive vibes 🌃🚗 #picflow #reels", likes: "4.5k" },
  { img: "https://picsum.photos/600/1000?random=502", user: "@chef_kunal", caption: "Street food secrets in Delhi 🍲🔥", likes: "19.8k" },
  { img: "https://picsum.photos/600/1000?random=503", user: "@wanderer_india", caption: "Sunrise at Tiger Point, Lonavala 🌄", likes: "7.3k" }
];
let reelIndex = 0;
let isReelLiked = false;

function nextReelCard() {
  reelIndex = (reelIndex + 1) % reelsCollection.length;
  const current = reelsCollection[reelIndex];
  document.getElementById("activeReelImg").src = current.img;
  document.getElementById("activeReelUser").innerText = current.user;
  document.getElementById("activeReelText").innerText = current.caption;
  document.getElementById("activeReelLikes").innerText = current.likes;
  isReelLiked = false;
  document.getElementById("reelHeartIcon").style.color = "#fff";
}

function toggleReelHeart() {
  isReelLiked = !isReelLiked;
  document.getElementById("reelHeartIcon").style.color = isReelLiked ? "#ed4956" : "#fff";
}

// Notifications
function renderNotifs() {
  const box = document.getElementById("notifContainer");
  box.innerHTML = DEFAULT_NOTIFS.map(n => `
    <div class="notif-row">
      <div class="notif-user-box">
        <img src="${n.avatar}" class="notif-user-avatar" />
        <div><strong>${n.user}</strong> ${n.msg} <span style="color:#777;">${n.time}</span></div>
      </div>
      ${n.isFollow ? `<button class="notif-follow-btn" onclick="this.innerText='Following'">Follow</button>` : `<i class="fa-solid fa-heart" style="color: #ed4956;"></i>`}
    </div>
  `).join("");
}

// Profile Section & Edit
function renderProfile() {
  document.getElementById("profileDisplayName").innerText = userProfile.name;
  document.getElementById("profileBioText").innerText = userProfile.bio;
  document.getElementById("profilePostCount").innerText = posts.length;

  const grid = document.getElementById("profileGrid");
  grid.innerHTML = posts.map(p => `<img src="${p.image}" />`).join("");
}

function openProfileEditModal() {
  document.getElementById("editProfileNameInput").value = userProfile.name;
  document.getElementById("editProfileBioInput").value = userProfile.bio;
  document.getElementById("editProfileModal").style.display = "flex";
}
function closeProfileEditModal() { document.getElementById("editProfileModal").style.display = "none"; }

function saveProfileChanges() {
  const name = document.getElementById("editProfileNameInput").value;
  const bio = document.getElementById("editProfileBioInput").value;
  if (name.trim()) userProfile.name = name;
  userProfile.bio = bio;
  saveAll();
  renderProfile();
  closeProfileEditModal();
}

// Direct Messages
function openChat() { document.getElementById("chatDrawer").style.display = "flex"; }
function closeChat() { document.getElementById("chatDrawer").style.display = "none"; }

function sendChatMessage() {
  const input = document.getElementById("chatMsgInput");
  const msg = input.value.trim();
  if (!msg) return;

  const stream = document.getElementById("chatStream");
  stream.innerHTML += `<div class="msg-bubble mine">${msg}</div>`;
  input.value = "";
  stream.scrollTop = stream.scrollHeight;

  setTimeout(() => {
    stream.innerHTML += `<div class="msg-bubble theirs">Received: "${msg}" 👍</div>`;
    stream.scrollTop = stream.scrollHeight;
  }, 600);
}

// Boot PicFlow
renderStories();
renderFeed();
renderProfile();
