// --- Initial State & Storage ---
const DEFAULT_POSTS = [
  {
    id: 101,
    username: "Subbhu7077",
    avatar: "https://picsum.photos/200/200?random=1",
    image: "https://picsum.photos/800/800?random=11",
    likes: 132,
    liked: false,
    saved: false,
    caption: "PicFlow V5 full master edition is live! ⚡🔥",
    comments: ["Working so smoothly!", "Best Instagram dark clone"],
    time: "JUST NOW"
  },
  {
    id: 102,
    username: "rohit_travels",
    avatar: "https://picsum.photos/200/200?random=2",
    image: "https://picsum.photos/800/800?random=22",
    likes: 412,
    liked: false,
    saved: false,
    caption: "Golden hour over the western ghats 🌄",
    comments: ["Location please?", "Stunning capture!"],
    time: "2 HOURS AGO"
  }
];

const DEFAULT_STORIES = [
  { id: 1, user: "Your Story", avatar: "https://picsum.photos/200/200?random=1", img: "https://picsum.photos/800/1200?random=31", isSelf: true },
  { id: 2, user: "aaron_v", avatar: "https://picsum.photos/200/200?random=3", img: "https://picsum.photos/800/1200?random=32", isSelf: false },
  { id: 3, user: "priya_art", avatar: "https://picsum.photos/200/200?random=4", img: "https://picsum.photos/800/1200?random=33", isSelf: false },
  { id: 4, user: "lens_king", avatar: "https://picsum.photos/200/200?random=5", img: "https://picsum.photos/800/1200?random=34", isSelf: false }
];

const DEFAULT_NOTIFS = [
  { id: 1, user: "priya_art", avatar: "https://picsum.photos/200/200?random=4", text: "liked your photo.", time: "10m", isFollow: false },
  { id: 2, user: "dev_ankit", avatar: "https://picsum.photos/200/200?random=6", text: "started following you.", time: "1h", isFollow: true },
  { id: 3, user: "rohit_travels", avatar: "https://picsum.photos/200/200?random=2", text: "commented: Stunning capture!", time: "2h", isFollow: false }
];

let posts = JSON.parse(localStorage.getItem("pf_posts")) || DEFAULT_POSTS;
let stories = JSON.parse(localStorage.getItem("pf_stories")) || DEFAULT_STORIES;
let userProfile = JSON.parse(localStorage.getItem("pf_profile")) || {
  name: "Subbhu7077",
  bio: "Full Stack Explorer | Capturing reality ✨"
};

function persist() {
  localStorage.setItem("pf_posts", JSON.stringify(posts));
  localStorage.setItem("pf_stories", JSON.stringify(stories));
  localStorage.setItem("pf_profile", JSON.stringify(userProfile));
}

// --- Tab Switching ---
function switchTab(tabId) {
  document.querySelectorAll(".tab-content").forEach(el => el.classList.remove("active"));
  const target = document.getElementById(tabId);
  if (target) target.classList.add("active");
  window.scrollTo({ top: 0, behavior: "smooth" });

  if (tabId === "exploreTab") renderExplore();
  if (tabId === "profileTab") renderProfile();
  if (tabId === "notifTab") renderNotifs();
}

// --- Stories Render & View ---
function renderStories() {
  const container = document.getElementById("storiesContainer");
  let html = `
    <div class="story-item" onclick="openStoryModal()">
      <div class="story-ring my-ring">
        <img class="story-thumb" src="https://picsum.photos/200/200?random=1" />
        <div class="add-badge">+</div>
      </div>
      <span>Your story</span>
    </div>
  `;

  stories.forEach(s => {
    html += `
      <div class="story-item" onclick="playStory('${s.img}', '${s.user}', '${s.avatar}')">
        <div class="story-ring">
          <img class="story-thumb" src="${s.avatar}" />
        </div>
        <span>${s.user}</span>
      </div>
    `;
  });
  container.innerHTML = html;
}

let storyTimer = null;
function playStory(imgUrl, username, avatar) {
  const player = document.getElementById("storyPlayer");
  const fill = document.getElementById("storyFill");
  document.getElementById("storyPlayerImg").src = imgUrl;
  document.getElementById("storyPlayerUser").innerText = username;
  document.getElementById("storyPlayerAvatar").src = avatar;

  player.style.display = "flex";
  fill.style.width = "0%";
  setTimeout(() => { fill.style.width = "100%"; }, 40);

  clearTimeout(storyTimer);
  storyTimer = setTimeout(closeStoryPlayer, 4050);
}

function closeStoryPlayer() {
  clearTimeout(storyTimer);
  document.getElementById("storyPlayer").style.display = "none";
  document.getElementById("storyFill").style.width = "0%";
}

// --- Feed Render & Actions ---
function renderFeed() {
  const container = document.getElementById("feedContainer");
  container.innerHTML = posts.map(p => `
    <article class="post">
      <div class="post-header">
        <div class="post-user">
          <img src="${p.avatar}" class="post-avatar" />
          <span class="post-username">${p.username}</span>
        </div>
        <i class="fa-solid fa-trash-can" style="font-size: 14px; cursor: pointer; color: #888;" onclick="deletePost(${p.id})"></i>
      </div>

      <div class="post-img-box" ondblclick="doubleTapLike(${p.id})">
        <img src="${p.image}" loading="lazy" />
        <i class="fa-solid fa-heart heart-popup" id="heart-anim-${p.id}"></i>
      </div>

      <div class="post-actions">
        <div class="post-actions-left">
          <i class="${p.liked ? 'fa-solid fa-heart heart-liked' : 'fa-regular fa-heart'}" onclick="toggleLike(${p.id})"></i>
          <i class="fa-regular fa-comment" onclick="focusComment(${p.id})"></i>
          <i class="fa-regular fa-paper-plane" onclick="sharePostLink()"></i>
        </div>
        <i class="${p.saved ? 'fa-solid fa-bookmark saved-active' : 'fa-regular fa-bookmark'}" onclick="toggleSave(${p.id})"></i>
      </div>

      <div class="post-details">
        <div class="post-likes">${p.likes} likes</div>
        <div class="post-caption"><span>${p.username}</span>${p.caption}</div>
        <div class="comments-box">
          ${p.comments.map(c => `<div class="comment-item"><span>user</span>${c}</div>`).join("")}
        </div>
        <div class="post-time">${p.time}</div>
      </div>

      <div class="comment-bar">
        <input type="text" id="comment-input-${p.id}" placeholder="Add a comment..." onkeydown="if(event.key==='Enter') addComment(${p.id})" />
        <button onclick="addComment(${p.id})">Post</button>
      </div>
    </article>
  `).join("");
}

function toggleLike(id) {
  const p = posts.find(item => item.id === id);
  if (!p) return;
  p.liked = !p.liked;
  p.likes += p.liked ? 1 : -1;
  persist();
  renderFeed();
}

function doubleTapLike(id) {
  const anim = document.getElementById(`heart-anim-${id}`);
  if (anim) {
    anim.classList.add("pop");
    setTimeout(() => anim.classList.remove("pop"), 500);
  }
  const p = posts.find(item => item.id === id);
  if (p && !p.liked) {
    p.liked = true;
    p.likes += 1;
    persist();
    renderFeed();
  }
}

function toggleSave(id) {
  const p = posts.find(item => item.id === id);
  if (!p) return;
  p.saved = !p.saved;
  persist();
  renderFeed();
}

function addComment(id) {
  const input = document.getElementById(`comment-input-${id}`);
  if (!input || !input.value.trim()) return;
  const p = posts.find(item => item.id === id);
  if (p) {
    p.comments.push(input.value.trim());
    persist();
    renderFeed();
  }
}

function focusComment(id) {
  const el = document.getElementById(`comment-input-${id}`);
  if (el) el.focus();
}

function sharePostLink() {
  if (navigator.clipboard) navigator.clipboard.writeText(window.location.href);
  alert("Post link copied to clipboard! 🔗");
}

function deletePost(id) {
  if (confirm("Delete this post?")) {
    posts = posts.filter(p => p.id !== id);
    persist();
    renderFeed();
    renderProfile();
  }
}

// --- Upload Post & Story ---
function openPostModal() { document.getElementById("postModal").style.display = "flex"; }
function closePostModal() { document.getElementById("postModal").style.display = "none"; }
function openStoryModal() { document.getElementById("storyModal").style.display = "flex"; }
function closeStoryModal() { document.getElementById("storyModal").style.display = "none"; }

function publishPost() {
  const file = document.getElementById("postImgFile").files[0];
  const caption = document.getElementById("postCaption").value;
  if (!file) {
    alert("Please select a photo first!");
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
    persist();
    renderFeed();
    closePostModal();
    document.getElementById("postImgFile").value = "";
    document.getElementById("postCaption").value = "";
    switchTab("feedTab");
  };
  reader.readAsDataURL(file);
}

function publishStory() {
  const file = document.getElementById("storyImgFile").files[0];
  if (!file) {
    alert("Please select a story photo!");
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
    persist();
    renderStories();
    closeStoryModal();
    document.getElementById("storyImgFile").value = "";
  };
  reader.readAsDataURL(file);
}

// --- Explore & Search ---
const explorePhotos = [
  "https://picsum.photos/400/400?random=50",
  "https://picsum.photos/400/400?random=51",
  "https://picsum.photos/400/400?random=52",
  "https://picsum.photos/400/400?random=53",
  "https://picsum.photos/400/400?random=54",
  "https://picsum.photos/400/400?random=55",
  "https://picsum.photos/400/400?random=56",
  "https://picsum.photos/400/400?random=57",
  "https://picsum.photos/400/400?random=58"
];

function renderExplore() {
  const container = document.getElementById("exploreContainer");
  container.innerHTML = explorePhotos.map(url => `
    <img src="${url}" onclick="alert('Viewing explore snapshot!')" />
  `).join("");
}

function filterExplore() {
  const q = document.getElementById("exploreSearchInput").value.toLowerCase();
  const container = document.getElementById("exploreContainer");
  if (!q) {
    renderExplore();
    return;
  }
  container.innerHTML = explorePhotos.slice(0, 3).map(url => `
    <img src="${url}" onclick="alert('Result for: ' + '${q}')" />
  `).join("");
}

// --- Reels System ---
const reelsData = [
  { img: "https://picsum.photos/600/1000?random=71", user: "@vibes_creator", caption: "Night drives in Mumbai 🚗✨ #reels", likes: "3.2k" },
  { img: "https://picsum.photos/600/1000?random=72", user: "@chef_ravi", caption: "Authentic Biryani in 60 seconds 🥘🔥", likes: "12.4k" },
  { img: "https://picsum.photos/600/1000?random=73", user: "@travel_diaries", caption: "Snow in Manali ❄️🏔️ #peace", likes: "8.1k" }
];
let currentReelIndex = 0;
let reelLiked = false;

function nextReel() {
  currentReelIndex = (currentReelIndex + 1) % reelsData.length;
  const reel = reelsData[currentReelIndex];
  document.getElementById("currentReelImg").src = reel.img;
  document.getElementById("reelUsername").innerText = reel.user;
  document.getElementById("reelCaption").innerText = reel.caption;
  document.getElementById("reelLikeCount").innerText = reel.likes;
  reelLiked = false;
  document.getElementById("reelLikeIcon").style.color = "#fff";
}

function likeCurrentReel() {
  reelLiked = !reelLiked;
  document.getElementById("reelLikeIcon").style.color = reelLiked ? "#ed4956" : "#fff";
}

// --- Notifications ---
function renderNotifs() {
  const container = document.getElementById("notifContainer");
  container.innerHTML = DEFAULT_NOTIFS.map(n => `
    <div class="notif-item">
      <div class="notif-left">
        <img src="${n.avatar}" class="notif-avatar" />
        <div><strong>${n.user}</strong> ${n.text} <span style="color:#777;">${n.time}</span></div>
      </div>
      ${n.isFollow ? `<button class="notif-btn" onclick="this.innerText='Following'">Follow</button>` : `<i class="fa-solid fa-heart" style="color: #ed4956;"></i>`}
    </div>
  `).join("");
}

// --- Profile & Edit Profile ---
function renderProfile() {
  document.getElementById("profileDisplayName").innerText = userProfile.name;
  document.getElementById("profileBioText").innerText = userProfile.bio;
  document.getElementById("profilePostCount").innerText = posts.length;

  const grid = document.getElementById("profileGrid");
  grid.innerHTML = posts.map(p => `<img src="${p.image}" />`).join("");
}

function openEditProfileModal() {
  document.getElementById("editName").value = userProfile.name;
  document.getElementById("editBio").value = userProfile.bio;
  document.getElementById("editProfileModal").style.display = "flex";
}
function closeEditProfileModal() { document.getElementById("editProfileModal").style.display = "none"; }

function saveProfile() {
  const name = document.getElementById("editName").value;
  const bio = document.getElementById("editBio").value;
  if (name.trim()) userProfile.name = name;
  userProfile.bio = bio;
  persist();
  renderProfile();
  closeEditProfileModal();
}

// --- Direct Messages (DM) ---
function openDM() { document.getElementById("dmSheet").style.display = "flex"; }
function closeDM() { document.getElementById("dmSheet").style.display = "none"; }

function sendDM() {
  const input = document.getElementById("dmInput");
  const text = input.value.trim();
  if (!text) return;

  const box = document.getElementById("dmBox");
  box.innerHTML += `<div class="dm-bubble sent">${text}</div>`;
  input.value = "";
  box.scrollTop = box.scrollHeight;

  setTimeout(() => {
    box.innerHTML += `<div class="dm-bubble received">Delivered ✅</div>`;
    box.scrollTop = box.scrollHeight;
  }, 700);
}

// --- Initial Boot ---
renderStories();
renderFeed();
renderProfile();
