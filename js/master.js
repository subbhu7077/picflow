// --- Initial Seed State ---
const SEED_POSTS = [
  {
    id: 201,
    username: "Subbhu7077",
    avatar: "https://picsum.photos/200/200?random=1",
    image: "https://picsum.photos/800/800?random=81",
    likes: 184,
    liked: false,
    saved: false,
    caption: "PicFlow Master V7 live on GitHub Pages! Everything is fully functioning 🔥",
    comments: ["Smooth dark mode!", "Upload and stories are working great!"],
    date: "JUST NOW"
  },
  {
    id: 202,
    username: "wander_spirit",
    avatar: "https://picsum.photos/200/200?random=2",
    image: "https://picsum.photos/800/800?random=82",
    likes: 640,
    liked: false,
    saved: false,
    caption: "Misty mountains at dawn 🌄✨ #nature #peace",
    comments: ["Where was this taken?", "Incredible photography 👏"],
    date: "2 HOURS AGO"
  }
];

const SEED_STORIES = [
  { id: 1, user: "Your story", avatar: "https://picsum.photos/200/200?random=1", img: "https://picsum.photos/800/1200?random=91", isSelf: true },
  { id: 2, user: "neha_v", avatar: "https://picsum.photos/200/200?random=3", img: "https://picsum.photos/800/1200?random=92", isSelf: false },
  { id: 3, user: "rahul_k", avatar: "https://picsum.photos/200/200?random=4", img: "https://picsum.photos/800/1200?random=93", isSelf: false },
  { id: 4, user: "lens_art", avatar: "https://picsum.photos/200/200?random=5", img: "https://picsum.photos/800/1200?random=94", isSelf: false }
];

const SEED_NOTIFS = [
  { id: 1, user: "neha_v", avatar: "https://picsum.photos/200/200?random=3", text: "liked your photo.", time: "5m", isFollow: false },
  { id: 2, user: "rahul_k", avatar: "https://picsum.photos/200/200?random=4", text: "started following you.", time: "30m", isFollow: true },
  { id: 3, user: "wander_spirit", avatar: "https://picsum.photos/200/200?random=2", text: "commented on your post.", time: "1h", isFollow: false }
];

// Persistent State
let posts = JSON.parse(localStorage.getItem("pf_posts_v7")) || SEED_POSTS;
let stories = JSON.parse(localStorage.getItem("pf_stories_v7")) || SEED_STORIES;
let userProfile = JSON.parse(localStorage.getItem("pf_profile_v7")) || {
  name: "Subbhu7077",
  bio: "Photographer | Tech Enthusiast ⚡",
  avatar: "https://picsum.photos/200/200?random=1"
};

function commitState() {
  localStorage.setItem("pf_posts_v7", JSON.stringify(posts));
  localStorage.setItem("pf_stories_v7", JSON.stringify(stories));
  localStorage.setItem("pf_profile_v7", JSON.stringify(userProfile));
}

// Navigation Tab Switcher
function switchView(viewId) {
  document.querySelectorAll(".tab-section").forEach(sec => sec.classList.remove("active"));
  const el = document.getElementById(viewId);
  if (el) el.classList.add("active");
  window.scrollTo({ top: 0, behavior: "smooth" });

  if (viewId === "exploreTab") renderExploreGrid();
  if (viewId === "profileTab") renderProfileSection();
  if (viewId === "notifTab") {
    renderNotificationList();
    document.getElementById("notifBadge").style.display = "none";
  }
}

// Stories Tray
function renderStoriesTray() {
  const container = document.getElementById("storiesTray");
  let html = `
    <div class="story-slot" onclick="openCreateStorySheet()">
      <div class="story-ring-wrap self-empty">
        <img class="story-thumb-img" src="${userProfile.avatar}" />
        <div class="story-add-badge">+</div>
      </div>
      <span>Your story</span>
    </div>
  `;

  stories.forEach(s => {
    html += `
      <div class="story-slot" onclick="triggerStoryPlayer('${s.img}', '${s.user}', '${s.avatar}')">
        <div class="story-ring-wrap">
          <img class="story-thumb-img" src="${s.avatar}" />
        </div>
        <span>${s.user}</span>
      </div>
    `;
  });
  container.innerHTML = html;
}

// Story Viewer
let storyCountdown = null;
function triggerStoryPlayer(imgUrl, userName, avatarUrl) {
  const player = document.getElementById("storyViewerApp");
  const meter = document.getElementById("storyMeterFill");
  document.getElementById("storyViewerTargetImg").src = imgUrl;
  document.getElementById("storyTargetUserName").innerText = userName;
  document.getElementById("storyTargetUserAvatar").src = avatarUrl;

  player.style.display = "flex";
  meter.style.width = "0%";
  setTimeout(() => { meter.style.width = "100%"; }, 40);

  clearTimeout(storyCountdown);
  storyCountdown = setTimeout(closeStoryPlayerApp, 4050);
}

function closeStoryPlayerApp() {
  clearTimeout(storyCountdown);
  document.getElementById("storyViewerApp").style.display = "none";
  document.getElementById("storyMeterFill").style.width = "0%";
}

// Feed Posts
function renderFeedPosts() {
  const wall = document.getElementById("postsContainer");
  wall.innerHTML = posts.map(p => `
    <article class="post-block" id="post-${p.id}">
      <div class="post-top">
        <div class="post-user-info" onclick="switchView('profileTab')">
          <img src="${p.avatar}" class="post-user-pfp" />
          <span class="post-author">${p.username}</span>
        </div>
        <i class="fa-solid fa-ellipsis post-more-btn" onclick="removePostItem(${p.id})"></i>
      </div>

      <div class="post-stage" ondblclick="fireDoubleTapHeart(${p.id})">
        <img src="${p.image}" loading="lazy" />
        <i class="fa-solid fa-heart heart-burst" id="burst-${p.id}"></i>
      </div>

      <div class="post-action-bar">
        <div class="post-action-left">
          <i class="${p.liked ? 'fa-solid fa-heart liked-red' : 'fa-regular fa-heart'}" onclick="togglePostLike(${p.id})"></i>
          <i class="fa-regular fa-comment" onclick="focusCommentInput(${p.id})"></i>
          <i class="fa-regular fa-paper-plane" onclick="sharePostPermalink()"></i>
        </div>
        <i class="${p.saved ? 'fa-solid fa-bookmark saved-gold' : 'fa-regular fa-bookmark'}" onclick="togglePostSave(${p.id})"></i>
      </div>

      <div class="post-caption-box">
        <div class="likes-stat">${p.likes} likes</div>
        <div class="caption-content"><span>${p.username}</span>${p.caption}</div>
        
        <div class="view-comments-btn" onclick="focusCommentInput(${p.id})">View all ${p.comments.length} comments</div>

        <div class="comments-stack">
          ${p.comments.map(c => `<div class="comment-entry"><span>user</span>${c}</div>`).join("")}
        </div>
        <div class="date-indicator">${p.date}</div>
      </div>

      <div class="quick-comment-bar">
        <input type="text" id="comment-box-${p.id}" placeholder="Add a comment..." onkeydown="if(event.key==='Enter') commitPostComment(${p.id})" />
        <button onclick="commitPostComment(${p.id})">Post</button>
      </div>
    </article>
  `).join("");
}

function togglePostLike(id) {
  const p = posts.find(item => item.id === id);
  if (!p) return;
  p.liked = !p.liked;
  p.likes += p.liked ? 1 : -1;
  commitState();
  renderFeedPosts();
}

function fireDoubleTapHeart(id) {
  const burst = document.getElementById(`burst-${id}`);
  if (burst) {
    burst.classList.add("pop");
    setTimeout(() => burst.classList.remove("pop"), 500);
  }
  const p = posts.find(item => item.id === id);
  if (p && !p.liked) {
    p.liked = true;
    p.likes += 1;
    commitState();
    renderFeedPosts();
  }
}

function togglePostSave(id) {
  const p = posts.find(item => item.id === id);
  if (!p) return;
  p.saved = !p.saved;
  commitState();
  renderFeedPosts();
}

function focusCommentInput(id) {
  const box = document.getElementById(`comment-box-${id}`);
  if (box) box.focus();
}

function commitPostComment(id) {
  const box = document.getElementById(`comment-box-${id}`);
  if (!box || !box.value.trim()) return;
  const p = posts.find(item => item.id === id);
  if (p) {
    p.comments.push(box.value.trim());
    commitState();
    renderFeedPosts();
  }
}

function sharePostPermalink() {
  if (navigator.clipboard) navigator.clipboard.writeText(window.location.href);
  alert("Post link copied to clipboard! 🔗 Share anywhere");
}

function removePostItem(id) {
  if (confirm("Delete this post?")) {
    posts = posts.filter(p => p.id !== id);
    commitState();
    renderFeedPosts();
    renderProfileSection();
  }
}

// Upload Post Modal
function openCreatePostSheet() { document.getElementById("createPostModal").style.display = "flex"; }
function closeCreatePostSheet() { document.getElementById("createPostModal").style.display = "none"; }

function dispatchNewPost() {
  const file = document.getElementById("postImageUploadInput").files[0];
  const caption = document.getElementById("postCaptionTextInput").value;
  if (!file) {
    alert("Please choose a photo from your gallery!");
    return;
  }
  const reader = new FileReader();
  reader.onload = function(e) {
    posts.unshift({
      id: Date.now(),
      username: userProfile.name,
      avatar: userProfile.avatar,
      image: e.target.result,
      likes: 0,
      liked: false,
      saved: false,
      caption: caption || "",
      comments: [],
      date: "JUST NOW"
    });
    commitState();
    renderFeedPosts();
    closeCreatePostSheet();
    document.getElementById("postImageUploadInput").value = "";
    document.getElementById("postCaptionTextInput").value = "";
    switchView("feedTab");
  };
  reader.readAsDataURL(file);
}

// Upload Story Modal
function openCreateStorySheet() { document.getElementById("createStoryModal").style.display = "flex"; }
function closeCreateStorySheet() { document.getElementById("createStoryModal").style.display = "none"; }

function dispatchNewStory() {
  const file = document.getElementById("storyImageUploadInput").files[0];
  if (!file) {
    alert("Please select a photo for your story!");
    return;
  }
  const reader = new FileReader();
  reader.onload = function(e) {
    stories.unshift({
      id: Date.now(),
      user: "Your story",
      avatar: userProfile.avatar,
      img: e.target.result
    });
    commitState();
    renderStoriesTray();
    closeCreateStorySheet();
    document.getElementById("storyImageUploadInput").value = "";
  };
  reader.readAsDataURL(file);
}

// Explore Section
const EXPLORE_PHOTOS = [
  "https://picsum.photos/400/400?random=111",
  "https://picsum.photos/400/400?random=112",
  "https://picsum.photos/400/400?random=113",
  "https://picsum.photos/400/400?random=114",
  "https://picsum.photos/400/400?random=115",
  "https://picsum.photos/400/400?random=116",
  "https://picsum.photos/400/400?random=117",
  "https://picsum.photos/400/400?random=118",
  "https://picsum.photos/400/400?random=119"
];

function renderExploreGrid() {
  const wall = document.getElementById("exploreGridWall");
  wall.innerHTML = EXPLORE_PHOTOS.map(url => `
    <img src="${url}" onclick="alert('Viewing explore snapshot!')" />
  `).join("");
}

function handleExploreSearchLive() {
  const q = document.getElementById("exploreSearchBox").value.toLowerCase();
  const wall = document.getElementById("exploreGridWall");
  if (!q) {
    renderExploreGrid();
    return;
  }
  wall.innerHTML = EXPLORE_PHOTOS.slice(0, 3).map(url => `
    <img src="${url}" onclick="alert('Search hit for: ' + '${q}')" />
  `).join("");
}

// Reels Logic
const REELS_LIBRARY = [
  { img: "https://picsum.photos/600/1000?random=601", user: "@subbhu_vibes", caption: "Drive into the neon lights 🚗✨ #picflow #master", likes: "4.8k" },
  { img: "https://picsum.photos/600/1000?random=602", user: "@chef_kunal", caption: "Street food secrets in Delhi 🍲🔥", likes: "18.4k" },
  { img: "https://picsum.photos/600/1000?random=603", user: "@wander_india", caption: "Tiger Point sunrise, Lonavala 🌄", likes: "9.2k" }
];
let currentReelIndex = 0;
let isCurrentReelLiked = false;

function advanceNextReel() {
  currentReelIndex = (currentReelIndex + 1) % REELS_LIBRARY.length;
  const item = REELS_LIBRARY[currentReelIndex];
  document.getElementById("reelBgMedia").src = item.img;
  document.getElementById("reelCreatorTag").innerText = item.user;
  document.getElementById("reelTitle").innerText = item.caption;
  document.getElementById("reelLikesStat").innerText = item.likes;
  isCurrentReelLiked = false;
  document.getElementById("reelHeartIcon").style.color = "#fff";
}

function toggleReelHeart() {
  isCurrentReelLiked = !isCurrentReelLiked;
  document.getElementById("reelHeartIcon").style.color = isCurrentReelLiked ? "#ed4956" : "#fff";
}

// Notifications
function renderNotificationList() {
  const list = document.getElementById("notifListContainer");
  list.innerHTML = SEED_NOTIFS.map(n => `
    <div class="notif-card">
      <div class="notif-left-data">
        <img src="${n.avatar}" class="notif-pfp" />
        <div><strong>${n.user}</strong> ${n.text} <span style="color:#777;">${n.time}</span></div>
      </div>
      ${n.isFollow ? `<button class="notif-btn-action" onclick="this.innerText='Following'">Follow</button>` : `<i class="fa-solid fa-heart" style="color: #ed4956;"></i>`}
    </div>
  `).join("");
}

// Profile Section & Edit
function renderProfileSection() {
  document.getElementById("profileHeroName").innerText = userProfile.name;
  document.getElementById("profileHeroBio").innerText = userProfile.bio;
  document.getElementById("profileHeroPic").src = userProfile.avatar;
  document.getElementById("profileDockAvatar").src = userProfile.avatar;
  document.getElementById("mindBarAvatar").src = userProfile.avatar;
  document.getElementById("profilePostCountNumber").innerText = posts.length;

  const grid = document.getElementById("profileGridWall");
  grid.innerHTML = posts.map(p => `<img src="${p.image}" />`).join("");
}

function openProfileEditSheet() {
  document.getElementById("editProfileDisplayName").value = userProfile.name;
  document.getElementById("editProfileBioDetails").value = userProfile.bio;
  document.getElementById("editProfileModal").style.display = "flex";
}
function closeProfileEditSheet() { document.getElementById("editProfileModal").style.display = "none"; }

function saveProfileDetails() {
  const name = document.getElementById("editProfileDisplayName").value;
  const bio = document.getElementById("editProfileBioDetails").value;
  const picFile = document.getElementById("editProfilePicFile").files[0];

  if (name.trim()) userProfile.name = name;
  userProfile.bio = bio;

  if (picFile) {
    const reader = new FileReader();
    reader.onload = function(e) {
      userProfile.avatar = e.target.result;
      commitState();
      renderProfileSection();
      renderStoriesTray();
      closeProfileEditSheet();
    };
    reader.readAsDataURL(picFile);
  } else {
    commitState();
    renderProfileSection();
    closeProfileEditSheet();
  }
}

// Direct Messages
function openMessenger() {
  document.getElementById("dmDrawer").style.display = "flex";
  document.getElementById("msgBadge").style.display = "none";
}
function closeMessenger() { document.getElementById("dmDrawer").style.display = "none"; }

function dispatchDirectMessage() {
  const input = document.getElementById("dmInputMessage");
  const msg = input.value.trim();
  if (!msg) return;

  const scroll = document.getElementById("dmChatScroll");
  scroll.innerHTML += `<div class="chat-bubble me">${msg}</div>`;
  input.value = "";
  scroll.scrollTop = scroll.scrollHeight;

  setTimeout(() => {
    scroll.innerHTML += `<div class="chat-bubble them">Received: "${msg}" 👍</div>`;
    scroll.scrollTop = scroll.scrollHeight;
  }, 600);
}

// Initial Boot
renderStoriesTray();
renderFeedPosts();
renderProfileSection();
