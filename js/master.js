// --- Supabase Bridge Initialization ---
let supabaseClient = null;
if (typeof supabase !== 'undefined' && typeof SUPABASE_URL !== 'undefined' && typeof SUPABASE_KEY !== 'undefined') {
  try {
    supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
    console.log("Connected to Supabase Database successfully!");
  } catch (err) {
    console.warn("Supabase init error, running in Local fallback mode:", err);
  }
}

// --- Defaults ---
const SEED_POSTS = [
  {
    id: 101,
    username: "Subbhu7077",
    avatar: "https://picsum.photos/200/200?random=1",
    image: "https://picsum.photos/800/800?random=181",
    likes: 215,
    liked: false,
    saved: false,
    caption: "PicFlow Master V8 + Supabase Full Cloud Ready! 🔥⚡",
    comments: ["DP change is working smooth!", "Best clean Instagram clone"],
    date: "JUST NOW"
  },
  {
    id: 102,
    username: "travel_diaries",
    avatar: "https://picsum.photos/200/200?random=2",
    image: "https://picsum.photos/800/800?random=182",
    likes: 712,
    liked: false,
    saved: false,
    caption: "Chasing sunrises in the valley 🌄✨",
    comments: ["Location please?", "Super capture!"],
    date: "3 HOURS AGO"
  }
];

const SEED_STORIES = [
  { id: 1, user: "Your story", avatar: "https://picsum.photos/200/200?random=1", img: "https://picsum.photos/800/1200?random=191" },
  { id: 2, user: "neha_v", avatar: "https://picsum.photos/200/200?random=3", img: "https://picsum.photos/800/1200?random=192" },
  { id: 3, user: "rahul_k", avatar: "https://picsum.photos/200/200?random=4", img: "https://picsum.photos/800/1200?random=193" }
];

const SEED_NOTIFS = [
  { id: 1, user: "neha_v", avatar: "https://picsum.photos/200/200?random=3", text: "liked your post.", time: "4m", isFollow: false },
  { id: 2, user: "rahul_k", avatar: "https://picsum.photos/200/200?random=4", text: "started following you.", time: "25m", isFollow: true },
  { id: 3, user: "travel_diaries", avatar: "https://picsum.photos/200/200?random=2", text: "commented on your photo.", time: "1h", isFollow: false }
];

// Persistent State
let posts = JSON.parse(localStorage.getItem("pf_posts_v8")) || SEED_POSTS;
let stories = JSON.parse(localStorage.getItem("pf_stories_v8")) || SEED_STORIES;
let userProfile = JSON.parse(localStorage.getItem("pf_profile_v8")) || {
  name: "Subbhu7077",
  bio: "Photographer | Tech Explorer ⚡",
  avatar: "https://picsum.photos/200/200?random=1"
};

function persistAll() {
  localStorage.setItem("pf_posts_v8", JSON.stringify(posts));
  localStorage.setItem("pf_stories_v8", JSON.stringify(stories));
  localStorage.setItem("pf_profile_v8", JSON.stringify(userProfile));

  // Sync to Supabase if connected
  if (supabaseClient) {
    try {
      supabaseClient.from('profiles').upsert({
        id: 'primary_user',
        username: userProfile.name,
        bio: userProfile.bio,
        avatar_url: userProfile.avatar
      }).then();
    } catch (e) {
      console.log("Background Supabase sync:", e);
    }
  }
}

// Tab Switching
function switchView(viewId) {
  document.querySelectorAll(".tab-section").forEach(sec => sec.classList.remove("active"));
  const el = document.getElementById(viewId);
  if (el) el.classList.add("active");
  window.scrollTo({ top: 0, behavior: "smooth" });

  if (viewId === "exploreTab") renderExploreGrid();
  if (viewId === "profileTab") renderProfileSection();
  if (viewId === "notifTab") {
    renderNotifications();
    document.getElementById("notifBadge").style.display = "none";
  }
}

// Stories Tray
function renderStories() {
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
function renderFeed() {
  const wall = document.getElementById("postsContainer");
  wall.innerHTML = posts.map(p => `
    <article class="post-block" id="post-${p.id}">
      <div class="post-top">
        <div class="post-user-info" onclick="switchView('profileTab')">
          <img src="${p.avatar}" class="post-user-pfp" />
          <span class="post-author">${p.username}</span>
        </div>
        <i class="fa-solid fa-ellipsis post-more-btn" onclick="removePost(${p.id})"></i>
      </div>

      <div class="post-stage" ondblclick="fireDoubleTapHeart(${p.id})">
        <img src="${p.image}" loading="lazy" />
        <i class="fa-solid fa-heart heart-burst" id="burst-${p.id}"></i>
      </div>

      <div class="post-action-bar">
        <div class="post-action-left">
          <i class="${p.liked ? 'fa-solid fa-heart liked-red' : 'fa-regular fa-heart'}" onclick="togglePostLike(${p.id})"></i>
          <i class="fa-regular fa-comment" onclick="focusComment(${p.id})"></i>
          <i class="fa-regular fa-paper-plane" onclick="sharePost()"></i>
        </div>
        <i class="${p.saved ? 'fa-solid fa-bookmark saved-gold' : 'fa-regular fa-bookmark'}" onclick="togglePostSave(${p.id})"></i>
      </div>

      <div class="post-caption-box">
        <div class="likes-stat">${p.likes} likes</div>
        <div class="caption-content"><span>${p.username}</span>${p.caption}</div>
        <div class="view-comments-btn" onclick="focusComment(${p.id})">View all ${p.comments.length} comments</div>
        <div class="comments-stack">
          ${p.comments.map(c => `<div class="comment-entry"><span>user</span>${c}</div>`).join("")}
        </div>
        <div class="date-indicator">${p.date}</div>
      </div>

      <div class="quick-comment-bar">
        <input type="text" id="comment-box-${p.id}" placeholder="Add a comment..." onkeydown="if(event.key==='Enter') commitComment(${p.id})" />
        <button onclick="commitComment(${p.id})">Post</button>
      </div>
    </article>
  `).join("");
}

function togglePostLike(id) {
  const p = posts.find(item => item.id === id);
  if (!p) return;
  p.liked = !p.liked;
  p.likes += p.liked ? 1 : -1;
  persistAll();
  renderFeed();
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
    persistAll();
    renderFeed();
  }
}

function togglePostSave(id) {
  const p = posts.find(item => item.id === id);
  if (!p) return;
  p.saved = !p.saved;
  persistAll();
  renderFeed();
}

function focusComment(id) {
  const box = document.getElementById(`comment-box-${id}`);
  if (box) box.focus();
}

function commitComment(id) {
  const box = document.getElementById(`comment-box-${id}`);
  if (!box || !box.value.trim()) return;
  const p = posts.find(item => item.id === id);
  if (p) {
    p.comments.push(box.value.trim());
    persistAll();
    renderFeed();
  }
}

function sharePost() {
  if (navigator.clipboard) navigator.clipboard.writeText(window.location.href);
  alert("Post link copied to clipboard! 🔗");
}

function removePost(id) {
  if (confirm("Delete this post?")) {
    posts = posts.filter(p => p.id !== id);
    persistAll();
    renderFeed();
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
    persistAll();
    renderFeed();
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
    alert("Please select a story image!");
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
    persistAll();
    renderStories();
    closeCreateStorySheet();
    document.getElementById("storyImageUploadInput").value = "";
  };
  reader.readAsDataURL(file);
}

// Explore Section
const EXPLORE_PHOTOS = [
  "https://picsum.photos/400/400?random=211",
  "https://picsum.photos/400/400?random=212",
  "https://picsum.photos/400/400?random=213",
  "https://picsum.photos/400/400?random=214",
  "https://picsum.photos/400/400?random=215",
  "https://picsum.photos/400/400?random=216",
  "https://picsum.photos/400/400?random=217",
  "https://picsum.photos/400/400?random=218",
  "https://picsum.photos/400/400?random=219"
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
  { img: "https://picsum.photos/600/1000?random=701", user: "@subbhu_vibes", caption: "Drive into the neon lights 🚗✨ #picflow #master", likes: "5.1k" },
  { img: "https://picsum.photos/600/1000?random=702", user: "@chef_kunal", caption: "Street food secrets in Delhi 🍲🔥", likes: "21.4k" },
  { img: "https://picsum.photos/600/1000?random=703", user: "@wander_india", caption: "Tiger Point sunrise, Lonavala 🌄", likes: "10.2k" }
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
function renderNotifications() {
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

// Direct DP Change Handler (Camera Tap)
function quickChangeDP() {
  document.getElementById("directDpFileInput").click();
}

function handleDirectDP(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function(e) {
    userProfile.avatar = e.target.result;
    persistAll();
    renderProfileSection();
    renderStories();
    alert("Profile Picture (DP) Updated Successfully! 📸");
  };
  reader.readAsDataURL(file);
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
      persistAll();
      renderProfileSection();
      renderStories();
      closeProfileEditSheet();
    };
    reader.readAsDataURL(picFile);
  } else {
    persistAll();
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
renderStories();
renderFeed();
renderProfileSection();
