// --- Supabase Client Safe Bridge ---
let supabaseClient = null;
if (typeof supabase !== 'undefined' && typeof SUPABASE_URL !== 'undefined' && typeof SUPABASE_KEY !== 'undefined') {
  try {
    supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
    console.log("Supabase active");
  } catch (e) {
    console.warn("Supabase init bypassed:", e);
  }
}

const DEFAULT_AVATAR = "https://picsum.photos/200/200?random=1";

const SEED_POSTS = [
  {
    id: 101,
    username: "Subbhu7077",
    avatar: DEFAULT_AVATAR,
    image: "https://picsum.photos/800/800?random=181",
    likes: 215,
    liked: false,
    saved: false,
    caption: "PicFlow Master V10 - Profile Edit & DP Fixed! 🔥⚡",
    comments: ["Working 100%!", "Smooth UI"],
    time: "JUST NOW"
  }
];

const SEED_STORIES = [
  { id: 1, user: "Your story", avatar: DEFAULT_AVATAR, img: "https://picsum.photos/800/1200?random=191" },
  { id: 2, user: "neha_v", avatar: "https://picsum.photos/200/200?random=3", img: "https://picsum.photos/800/1200?random=192" }
];

// Persistent State
let posts = JSON.parse(localStorage.getItem("pf_v10_posts")) || SEED_POSTS;
let stories = JSON.parse(localStorage.getItem("pf_v10_stories")) || SEED_STORIES;
let userProfile = JSON.parse(localStorage.getItem("pf_v10_profile")) || {
  name: "Subbhu7077",
  bio: "Photographer | Tech Explorer ⚡",
  avatar: DEFAULT_AVATAR
};

function saveState() {
  localStorage.setItem("pf_v10_posts", JSON.stringify(posts));
  localStorage.setItem("pf_v10_stories", JSON.stringify(stories));
  localStorage.setItem("pf_v10_profile", JSON.stringify(userProfile));

  // Background Cloud Sync
  if (supabaseClient) {
    supabaseClient.from("profiles").upsert({
      id: "subbhu_primary",
      username: userProfile.name,
      bio: userProfile.bio,
      avatar_url: userProfile.avatar,
      updated_at: new Date().toISOString()
    }).then().catch(err => console.log("Cloud sync pass:", err));
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
}

// Stories Tray
function renderStories() {
  const container = document.getElementById("storiesTray");
  if (!container) return;
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
  if (!wall) return;
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
          ${p.comments.map(c => `<div class="comment-entry"><span>User</span>${c}</div>`).join("")}
        </div>
        <div class="date-indicator">${p.time}</div>
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
  saveState();
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
    saveState();
    renderFeed();
  }
}

function togglePostSave(id) {
  const p = posts.find(item => item.id === id);
  if (!p) return;
  p.saved = !p.saved;
  saveState();
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
    saveState();
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
    saveState();
    renderFeed();
    renderProfileSection();
  }
}

// Profile Section & Real-time Edit
function renderProfileSection() {
  document.getElementById("profileHeroName").innerText = userProfile.name;
  document.getElementById("profileHeroBio").innerText = userProfile.bio;
  document.getElementById("profileHeroPic").src = userProfile.avatar;
  document.getElementById("profileDockAvatar").src = userProfile.avatar;
  document.getElementById("mindBarAvatar").src = userProfile.avatar;
  document.getElementById("profilePostCountNumber").innerText = posts.length;

  const grid = document.getElementById("profileGridWall");
  if (grid) {
    grid.innerHTML = posts.map(p => `<img src="${p.image}" />`).join("");
  }
}

function openProfileEditSheet() {
  document.getElementById("editProfileDisplayName").value = userProfile.name;
  document.getElementById("editProfileBioDetails").value = userProfile.bio;
  document.getElementById("editProfilePicFile").value = "";
  document.getElementById("editProfileModal").style.display = "flex";
}
function closeProfileEditSheet() { 
  document.getElementById("editProfileModal").style.display = "none"; 
}

// SAFE PROFILE SAVER: Handles RAW, JPG, PNG & Text with Guarantee
function saveProfileDetails() {
  const nameInput = document.getElementById("editProfileDisplayName").value;
  const bioInput = document.getElementById("editProfileBioDetails").value;
  const picFile = document.getElementById("editProfilePicFile").files[0];
  const saveBtn = document.querySelector("#editProfileModal .btn-theme-blue");

  if (nameInput.trim()) userProfile.name = nameInput.trim();
  userProfile.bio = bioInput.trim();

  // If user selected a photo
  if (picFile) {
    const fileName = picFile.name.toLowerCase();
    // Validate standard image format
    if (fileName.endsWith('.cr2') || fileName.endsWith('.nef') || fileName.endsWith('.arw')) {
      alert("⚠️ RAW photo format (.cr2) browser me support nahi hoti! Kripya standard JPG ya PNG image chunein.");
      return;
    }

    if (saveBtn) saveBtn.innerText = "Saving Profile...";

    const reader = new FileReader();
    reader.onload = function(e) {
      userProfile.avatar = e.target.result;
      finalizeProfileSave(saveBtn);
    };
    reader.onerror = function() {
      alert("Photo read karne me error hua. Kripya doosri photo chunein.");
      if (saveBtn) saveBtn.innerText = "Save Profile Changes";
    };
    reader.readAsDataURL(picFile);
  } else {
    finalizeProfileSave(saveBtn);
  }
}

function finalizeProfileSave(btn) {
  saveState();
  renderProfileSection();
  renderStories();
  closeProfileEditSheet();
  if (btn) btn.innerText = "Save Profile Changes";
  alert("Profile & DP updated successfully! 🚀");
}

function quickChangeDP() {
  document.getElementById("directDpFileInput").click();
}

function handleDirectDP(event) {
  const file = event.target.files[0];
  if (!file) return;

  const fileName = file.name.toLowerCase();
  if (fileName.endsWith('.cr2') || fileName.endsWith('.nef') || fileName.endsWith('.arw')) {
    alert("⚠️ RAW format (.cr2) support nahi hai. JPG ya PNG chunein!");
    return;
  }

  const reader = new FileReader();
  reader.onload = function(e) {
    userProfile.avatar = e.target.result;
    saveState();
    renderProfileSection();
    renderStories();
    alert("DP Updated! 📸");
  };
  reader.readAsDataURL(file);
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
      time: "JUST NOW"
    });
    saveState();
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
    saveState();
    renderStories();
    closeCreateStorySheet();
    document.getElementById("storyImageUploadInput").value = "";
  };
  reader.readAsDataURL(file);
}

// Explore Grid
const EXPLORE_PHOTOS = [
  "https://picsum.photos/400/400?random=11",
  "https://picsum.photos/400/400?random=12",
  "https://picsum.photos/400/400?random=13",
  "https://picsum.photos/400/400?random=14",
  "https://picsum.photos/400/400?random=15",
  "https://picsum.photos/400/400?random=16"
];

function renderExploreGrid() {
  const wall = document.getElementById("exploreGridWall");
  if (!wall) return;
  wall.innerHTML = EXPLORE_PHOTOS.map(url => `
    <img src="${url}" onclick="alert('Viewing explore photo!')" />
  `).join("");
}

function handleExploreSearchLive() {
  const q = document.getElementById("exploreSearchBox").value.toLowerCase();
  const wall = document.getElementById("exploreGridWall");
  if (!q) {
    renderExploreGrid();
    return;
  }
  wall.innerHTML = EXPLORE_PHOTOS.slice(0, 3).map(url => `<img src="${url}" />`).join("");
}

// Reels Tab
const REELS = [
  { img: "https://picsum.photos/600/1000?random=601", user: "@subbhu_vibes", caption: "Night drives in Mumbai 🚗✨ #reels", likes: "4.8k" },
  { img: "https://picsum.photos/600/1000?random=602", user: "@chef_kunal", caption: "Street food specials 🍲🔥", likes: "18.4k" }
];
let rIdx = 0;
let rLiked = false;

function advanceNextReel() {
  rIdx = (rIdx + 1) % REELS.length;
  document.getElementById("reelBgMedia").src = REELS[rIdx].img;
  document.getElementById("reelCreatorTag").innerText = REELS[rIdx].user;
  document.getElementById("reelTitle").innerText = REELS[rIdx].caption;
  document.getElementById("reelLikesStat").innerText = REELS[rIdx].likes;
  rLiked = false;
  document.getElementById("reelHeartIcon").style.color = "#fff";
}

function toggleReelHeart() {
  rLiked = !rLiked;
  document.getElementById("reelHeartIcon").style.color = rLiked ? "#ed4956" : "#fff";
}

// Messenger
function openMessenger() { document.getElementById("dmDrawer").style.display = "flex"; }
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
renderProfileSection();
renderStories();
renderFeed();
