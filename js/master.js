const DEFAULT_AVATAR = "https://picsum.photos/200/200?random=1";

const DEFAULT_POSTS = [
  {
    id: 101,
    username: "Subbhu7077",
    avatar: DEFAULT_AVATAR,
    image: "https://picsum.photos/800/800?random=201",
    likes: 154,
    liked: false,
    saved: false,
    caption: "PicFlow Master V9 with Supabase Cloud DB is Live! 🔥⚡",
    comments: ["DP issue fixed!", "Working smoothly bro"],
    time: "JUST NOW"
  }
];

const DEFAULT_STORIES = [
  { id: 1, user: "Your story", avatar: DEFAULT_AVATAR, img: "https://picsum.photos/800/1200?random=301" },
  { id: 2, user: "aaron_v", avatar: "https://picsum.photos/200/200?random=3", img: "https://picsum.photos/800/1200?random=302" }
];

let posts = JSON.parse(localStorage.getItem("pf_live_posts")) || DEFAULT_POSTS;
let stories = JSON.parse(localStorage.getItem("pf_live_stories")) || DEFAULT_STORIES;
let userProfile = JSON.parse(localStorage.getItem("pf_live_profile")) || {
  id: "subbhu_master",
  name: "Subbhu7077",
  bio: "Photographer & Tech Enthusiast ⚡",
  avatar: DEFAULT_AVATAR
};

function persistLocal() {
  localStorage.setItem("pf_live_posts", JSON.stringify(posts));
  localStorage.setItem("pf_live_stories", JSON.stringify(stories));
  localStorage.setItem("pf_live_profile", JSON.stringify(userProfile));
}

async function syncProfileToSupabase() {
  if (!supabaseClient) return;
  try {
    await supabaseClient.from("profiles").upsert({
      id: userProfile.id,
      username: userProfile.name,
      bio: userProfile.bio,
      avatar_url: userProfile.avatar,
      updated_at: new Date()
    });
  } catch (err) {
    console.warn("Supabase upsert sync failed, cached locally:", err);
  }
}

async function loadProfileFromSupabase() {
  if (!supabaseClient) return;
  try {
    const { data, error } = await supabaseClient
      .from("profiles")
      .select("*")
      .eq("id", userProfile.id)
      .single();

    if (data && !error) {
      if (data.avatar_url) userProfile.avatar = data.avatar_url;
      if (data.username) userProfile.name = data.username;
      if (data.bio) userProfile.bio = data.bio;
      persistLocal();
      renderProfileSection();
      renderStoriesTray();
    }
  } catch (err) {
    console.warn("Supabase fetch failed, relying on local state:", err);
  }
}

function switchView(viewId) {
  document.querySelectorAll(".tab-section").forEach(sec => sec.classList.remove("active"));
  const el = document.getElementById(viewId);
  if (el) el.classList.add("active");
  window.scrollTo({ top: 0, behavior: "smooth" });

  if (viewId === "profileTab") renderProfileSection();
  if (viewId === "exploreTab") renderExploreGrid();
}

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

let storyTimer = null;
function triggerStoryPlayer(imgUrl, userName, avatarUrl) {
  const player = document.getElementById("storyViewerApp");
  const meter = document.getElementById("storyMeterFill");
  document.getElementById("storyViewerTargetImg").src = imgUrl;
  document.getElementById("storyTargetUserName").innerText = userName;
  document.getElementById("storyTargetUserAvatar").src = avatarUrl;

  player.style.display = "flex";
  meter.style.width = "0%";
  setTimeout(() => { meter.style.width = "100%"; }, 40);

  clearTimeout(storyTimer);
  storyTimer = setTimeout(closeStoryPlayerApp, 4050);
}

function closeStoryPlayerApp() {
  clearTimeout(storyTimer);
  document.getElementById("storyViewerApp").style.display = "none";
  document.getElementById("storyMeterFill").style.width = "0%";
}

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
        <div class="comments-stack">
          ${p.comments.map(c => `<div class="comment-entry"><span>user</span>${c}</div>`).join("")}
        </div>
        <div class="date-indicator">${p.time}</div>
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
  persistLocal();
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
    persistLocal();
    renderFeedPosts();
  }
}

function togglePostSave(id) {
  const p = posts.find(item => item.id === id);
  if (!p) return;
  p.saved = !p.saved;
  persistLocal();
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
    persistLocal();
    renderFeedPosts();
  }
}

function sharePostPermalink() {
  if (navigator.clipboard) navigator.clipboard.writeText(window.location.href);
  alert("Link copied to clipboard! 🔗");
}

function removePostItem(id) {
  if (confirm("Delete this post?")) {
    posts = posts.filter(p => p.id !== id);
    persistLocal();
    renderFeedPosts();
    renderProfileSection();
  }
}

function quickChangeDP() {
  document.getElementById("directDpFileInput").click();
}

function handleDirectDP(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = async function(e) {
    userProfile.avatar = e.target.result;
    persistLocal();
    renderProfileSection();
    renderStoriesTray();
    await syncProfileToSupabase();
    alert("DP successfully updated & saved to Supabase! 📸");
  };
  reader.readAsDataURL(file);
}

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

async function saveProfileDetails() {
  const name = document.getElementById("editProfileDisplayName").value;
  const bio = document.getElementById("editProfileBioDetails").value;
  const picFile = document.getElementById("editProfilePicFile").files[0];

  if (name.trim()) userProfile.name = name;
  userProfile.bio = bio;

  if (picFile) {
    const reader = new FileReader();
    reader.onload = async function(e) {
      userProfile.avatar = e.target.result;
      persistLocal();
      renderProfileSection();
      renderStoriesTray();
      await syncProfileToSupabase();
      closeProfileEditSheet();
    };
    reader.readAsDataURL(picFile);
  } else {
    persistLocal();
    renderProfileSection();
    await syncProfileToSupabase();
    closeProfileEditSheet();
  }
}

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
    persistLocal();
    renderFeedPosts();
    closeCreatePostSheet();
    document.getElementById("postImageUploadInput").value = "";
    document.getElementById("postCaptionTextInput").value = "";
    switchView("feedTab");
  };
  reader.readAsDataURL(file);
}

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
    persistLocal();
    renderStoriesTray();
    closeCreateStorySheet();
    document.getElementById("storyImageUploadInput").value = "";
  };
  reader.readAsDataURL(file);
}

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
    <img src="${url}" />
  `).join("");
}

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

// Startup Flow
renderProfileSection();
renderStoriesTray();
renderFeedPosts();
loadProfileFromSupabase();
