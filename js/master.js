(() => {
  "use strict";

  /* =========================================================
     PICFLOW MASTER ENGINE
     Single-file Instagram-like app
     Supabase + GitHub Pages compatible
     ========================================================= */

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  const SUPABASE_URL = window.SUPABASE_URL;
  const SUPABASE_KEY = window.SUPABASE_PUBLISHABLE_KEY;

  if (!window.supabase || !SUPABASE_URL || !SUPABASE_KEY) {
    document.body.innerHTML = `
      <div style="background:#000;color:#fff;min-height:100vh;padding:30px;font-family:Arial">
        <h2>PicFlow configuration error</h2>
        <p>Supabase configuration load nahi hui.</p>
      </div>`;
    return;
  }

  const SB = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
  );

  let ME = null;
  let PROFILE = null;
  let CURRENT_PAGE = "home";
  let CURRENT_CHAT = null;

  /* =========================================================
     GLOBAL ERROR HANDLER
     ========================================================= */

  window.addEventListener("error", e => {
    console.error(e.error || e.message);
    toast("Error: " + (e.message || "Something went wrong"));
  });

  window.addEventListener("unhandledrejection", e => {
    console.error(e.reason);
    toast("Error: " + (e.reason?.message || "Something went wrong"));
  });

  /* =========================================================
     HELPERS
     ========================================================= */

  function esc(v = "") {
    return String(v)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function toast(msg) {
    let x = $("#pfToast");

    if (!x) {
      x = document.createElement("div");
      x.id = "pfToast";
      x.style.cssText = `
        position:fixed;
        left:50%;
        bottom:85px;
        transform:translateX(-50%);
        background:#fff;
        color:#000;
        padding:12px 18px;
        border-radius:999px;
        z-index:99999;
        font-size:14px;
        box-shadow:0 5px 25px rgba(0,0,0,.4);
        max-width:85%;
        text-align:center;
      `;
      document.body.appendChild(x);
    }

    x.textContent = msg;
    x.style.display = "block";

    clearTimeout(window.__toastTimer);
    window.__toastTimer = setTimeout(() => {
      x.style.display = "none";
    }, 2500);
  }

  function loading(text = "Loading...") {
    const app = $("#app");
    if (!app) return;
    app.innerHTML = `
      <div style="
        min-height:65vh;
        display:flex;
        align-items:center;
        justify-content:center;
        color:#aaa;
        font-size:15px
      ">${esc(text)}</div>`;
  }

  function formatDate(date) {
    if (!date) return "";
    const d = new Date(date);
    return d.toLocaleString([], {
      day:"numeric",
      month:"short",
      hour:"numeric",
      minute:"2-digit"
    });
  }

  function avatar(profile, size = 42) {
    const url = profile?.avatar_url;

    if (url) {
      return `
        <img
          src="${esc(url)}"
          style="
            width:${size}px;
            height:${size}px;
            border-radius:50%;
            object-fit:cover;
            background:#222
          "
        >`;
    }

    const letter = (profile?.username || "U")[0].toUpperCase();

    return `
      <div style="
        width:${size}px;
        height:${size}px;
        border-radius:50%;
        background:#333;
        display:flex;
        align-items:center;
        justify-content:center;
        font-weight:700;
        font-size:${Math.max(14, size / 2.5)}px
      ">${esc(letter)}</div>`;
  }

  async function getProfile(id) {
    const { data } = await SB
      .from("profiles")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    return data || {
      id,
      username: "user",
      bio: "",
      avatar_url: ""
    };
  }

  async function profilesMap(ids) {
    ids = [...new Set(ids.filter(Boolean))];

    if (!ids.length) return {};

    const { data } = await SB
      .from("profiles")
      .select("*")
      .in("id", ids);

    const map = {};

    (data || []).forEach(p => {
      map[p.id] = p;
    });

    return map;
  }

  async function uploadFile(bucket, file, folder) {
    if (!file) throw new Error("File select karo");

    const ext =
      file.name.includes(".")
        ? file.name.split(".").pop().toLowerCase()
        : "jpg";

    const path =
      `${folder}/${crypto.randomUUID()}.${ext}`;

    const { error } = await SB.storage
      .from(bucket)
      .upload(path, file, {
        upsert: false,
        contentType: file.type || undefined
      });

    if (error) throw error;

    const { data } = SB.storage
      .from(bucket)
      .getPublicUrl(path);

    return data.publicUrl;
  }

  /* =========================================================
     CSS
     ========================================================= */

  function injectCSS() {
    if ($("#pfCSS")) return;

    const style = document.createElement("style");
    style.id = "pfCSS";

    style.textContent = `
      *{box-sizing:border-box}

      html,body{
        margin:0;
        padding:0;
        background:#000;
        color:#fff;
        font-family:Arial,Helvetica,sans-serif
      }

      body{
        padding-bottom:65px
      }

      button,input,textarea{
        font:inherit
      }

      button{
        cursor:pointer
      }

      .pf-wrap{
        width:100%;
        max-width:650px;
        margin:auto
      }

      .pf-header{
        position:sticky;
        top:0;
        z-index:100;
        height:58px;
        background:#000;
        border-bottom:1px solid #222;
        display:flex;
        align-items:center;
        justify-content:space-between;
        padding:0 15px
      }

      .pf-logo{
        font-size:23px;
        font-weight:800;
        letter-spacing:-1px
      }

      .pf-head-icons{
        display:flex;
        gap:18px;
        font-size:22px
      }

      .pf-icon{
        border:0;
        background:none;
        color:#fff;
        padding:4px
      }

      .pf-stories{
        display:flex;
        gap:15px;
        overflow-x:auto;
        padding:13px 12px;
        border-bottom:1px solid #191919;
        scrollbar-width:none
      }

      .pf-stories::-webkit-scrollbar{
        display:none
      }

      .story{
        min-width:65px;
        text-align:center;
        font-size:11px;
        color:#bbb
      }

      .story-ring{
        width:57px;
        height:57px;
        padding:2px;
        margin:auto;
        border-radius:50%;
        background:linear-gradient(45deg,#feda75,#fa7e1e,#d62976,#962fbf,#4f5bd5)
      }

      .story-inner{
        width:100%;
        height:100%;
        border:2px solid #000;
        border-radius:50%;
        overflow:hidden;
        background:#222;
        display:flex;
        align-items:center;
        justify-content:center
      }

      .story-inner img{
        width:100%;
        height:100%;
        object-fit:cover
      }

      .create-box{
        margin:10px 12px;
        padding:10px;
        display:flex;
        align-items:center;
        gap:10px;
        border-bottom:1px solid #222
      }

      .create-input{
        flex:1;
        background:#181818;
        color:#aaa;
        border:1px solid #292929;
        border-radius:24px;
        padding:11px 15px
      }

      .post{
        border-bottom:1px solid #222;
        margin-bottom:8px
      }

      .post-head{
        display:flex;
        align-items:center;
        gap:10px;
        padding:10px 12px
      }

      .post-user{
        flex:1;
        font-weight:700
      }

      .post-media{
        width:100%;
        max-height:700px;
        background:#080808;
        display:block;
        object-fit:contain
      }

      .post-actions{
        display:flex;
        align-items:center;
        gap:17px;
        padding:10px 12px 5px;
        font-size:23px
      }

      .post-actions button{
        background:none;
        color:#fff;
        border:0;
        padding:0
      }

      .liked{
        color:#ff3040!important
      }

      .saved{
        color:#ffd54a!important
      }

      .caption{
        padding:2px 12px 8px;
        line-height:1.4
      }

      .time{
        padding:0 12px 10px;
        color:#777;
        font-size:11px
      }

      .bottom-nav{
        position:fixed;
        bottom:0;
        left:0;
        right:0;
        height:62px;
        background:#000;
        border-top:1px solid #222;
        display:flex;
        justify-content:space-around;
        align-items:center;
        z-index:1000
      }

      .bottom-nav button{
        background:none;
        border:0;
        color:#999;
        font-size:23px
      }

      .bottom-nav button.active{
        color:#fff
      }

      .bottom-label{
        display:block;
        font-size:9px;
        margin-top:2px
      }

      .modal{
        position:fixed;
        inset:0;
        background:rgba(0,0,0,.78);
        z-index:5000;
        display:flex;
        align-items:flex-end;
        justify-content:center
      }

      .sheet{
        width:100%;
        max-width:650px;
        max-height:92vh;
        overflow:auto;
        background:#111;
        border-radius:20px 20px 0 0;
        padding:18px
      }

      .modal-center{
        align-items:center
      }

      .modal-center .sheet{
        border-radius:18px;
        max-height:90vh
      }

      .close-row{
        display:flex;
        justify-content:space-between;
        align-items:center;
        margin-bottom:15px
      }

      .close{
        background:#222;
        border:0;
        color:#fff;
        width:34px;
        height:34px;
        border-radius:50%
      }

      .pf-input,.pf-textarea{
        width:100%;
        background:#191919;
        color:#fff;
        border:1px solid #333;
        border-radius:10px;
        padding:13px;
        margin:7px 0;
        outline:none
      }

      .pf-textarea{
        min-height:110px;
        resize:vertical
      }

      .pf-btn{
        width:100%;
        background:#fff;
        color:#000;
        border:0;
        border-radius:10px;
        padding:13px;
        font-weight:700;
        margin-top:8px
      }

      .pf-btn.secondary{
        background:#222;
        color:#fff
      }

      .pf-btn.danger{
        background:#d93025;
        color:#fff
      }

      .profile-head{
        padding:22px 15px 10px;
        display:flex;
        gap:20px;
        align-items:center
      }

      .profile-avatar{
        width:86px;
        height:86px;
        border-radius:50%;
        object-fit:cover;
        background:#222
      }

      .profile-stats{
        flex:1;
        display:flex;
        justify-content:space-around;
        text-align:center
      }

      .stat b{
        display:block;
        font-size:18px
      }

      .stat span{
        color:#aaa;
        font-size:12px
      }

      .profile-info{
        padding:5px 15px 15px
      }

      .profile-buttons{
        display:flex;
        gap:8px;
        padding:0 15px 15px
      }

      .profile-buttons button{
        flex:1;
        background:#222;
        color:#fff;
        border:0;
        border-radius:8px;
        padding:9px
      }

      .grid{
        display:grid;
        grid-template-columns:repeat(3,1fr);
        gap:2px
      }

      .grid-item{
        aspect-ratio:1;
        background:#111;
        overflow:hidden
      }

      .grid-item img,
      .grid-item video{
        width:100%;
        height:100%;
        object-fit:cover
      }

      .search-box{
        padding:12px
      }

      .search-result{
        display:flex;
        align-items:center;
        gap:12px;
        padding:12px;
        border-bottom:1px solid #222
      }

      .search-result-info{
        flex:1
      }

      .search-result button{
        background:#fff;
        color:#000;
        border:0;
        border-radius:8px;
        padding:7px 12px;
        font-weight:700
      }

      .list-row{
        display:flex;
        align-items:center;
        gap:12px;
        padding:12px 0;
        border-bottom:1px solid #222
      }

      .list-row .grow{
        flex:1
      }

      .comment{
        padding:10px 0;
        border-bottom:1px solid #222
      }

      .comment b{
        margin-right:5px
      }

      .empty{
        text-align:center;
        color:#777;
        padding:45px 15px
      }

      .auth{
        min-height:100vh;
        display:flex;
        justify-content:center;
        align-items:center;
        padding:20px
      }

      .auth-card{
        width:100%;
        max-width:390px;
        text-align:center
      }

      .auth-logo{
        font-size:38px;
        font-weight:900;
        margin-bottom:35px
      }

      .auth-switch{
        margin-top:18px;
        color:#aaa;
        font-size:14px
      }

      .auth-switch button{
        background:none;
        color:#fff;
        border:0;
        font-weight:700
      }

      .people-title{
        padding:18px 12px 5px;
        font-size:22px;
        font-weight:800
      }

      .notif{
        padding:14px 10px;
        border-bottom:1px solid #222;
        display:flex;
        gap:10px
      }

      .notif .grow{
        flex:1
      }

      .chat-list{
        padding:5px 12px
      }

      .chat-row{
        display:flex;
        gap:12px;
        align-items:center;
        padding:12px 0;
        border-bottom:1px solid #222
      }

      .chat-row .grow{
        flex:1
      }

      .message{
        display:flex;
        margin:8px 0
      }

      .message.me{
        justify-content:flex-end
      }

      .bubble{
        max-width:75%;
        padding:9px 12px;
        border-radius:18px;
        background:#222
      }

      .message.me .bubble{
        background:#fff;
        color:#000
      }

      .chat-input{
        position:sticky;
        bottom:0;
        display:flex;
        gap:7px;
        background:#111;
        padding-top:10px
      }

      .chat-input input{
        flex:1;
        background:#222;
        border:0;
        color:#fff;
        border-radius:20px;
        padding:11px 14px
      }

      .chat-input button{
        width:45px;
        border:0;
        border-radius:50%;
        background:#fff;
        color:#000
      }

      @media(min-width:700px){
        body{
          background:#050505
        }

        .bottom-nav{
          max-width:650px;
          left:50%;
          transform:translateX(-50%)
        }
      }
    `;

    document.head.appendChild(style);
  }

  /* =========================================================
     AUTH
     ========================================================= */

  function authScreen(mode = "login") {
    const app = $("#app");

    const signup = mode === "signup";

    app.innerHTML = `
      <div class="auth">
        <div class="auth-card">
          <div class="auth-logo">PicFlow</div>

          ${
            signup
              ? `
                <input id="suName" class="pf-input" placeholder="Username">
                <input id="suMobile" class="pf-input" placeholder="Mobile number">
              `
              : ""
          }

          <input id="authEmail" class="pf-input" type="email" placeholder="Email">
          <input id="authPassword" class="pf-input" type="password" placeholder="Password">

          ${
            signup
              ? `
                <button class="pf-btn" onclick="window.PF.signup()">
                  Create account
                </button>
              `
              : `
                <button class="pf-btn" onclick="window.PF.login()">
                  Login
                </button>

                <button class="pf-btn secondary" onclick="window.PF.forgot()">
                  Forgot password?
                </button>
              `
          }

          <div class="auth-switch">
            ${
              signup
                ? `
                  Already have account?
                  <button onclick="window.PF.auth('login')">Login</button>
                `
                : `
                  Don't have an account?
                  <button onclick="window.PF.auth('signup')">Sign up</button>
                `
            }
          </div>
        </div>
      </div>`;
  }

  async function login() {
    const email = $("#authEmail")?.value.trim();
    const password = $("#authPassword")?.value;

    if (!email || !password) {
      toast("Email aur password dono bharo");
      return;
    }

    toast("Logging in...");

    const { data, error } =
      await SB.auth.signInWithPassword({
        email,
        password
      });

    if (error) {
      toast(error.message);
      return;
    }

    ME = data.user;

    await loadMe();
    home();
  }

  async function signup() {
    const username = $("#suName")?.value.trim();
    const mobile = $("#suMobile")?.value.trim();
    const email = $("#authEmail")?.value.trim();
    const password = $("#authPassword")?.value;

    if (!username || !email || !password) {
      toast("Username, email aur password bharo");
      return;
    }

    if (password.length < 6) {
      toast("Password minimum 6 characters");
      return;
    }

    toast("Account create ho raha hai...");

    const { data, error } =
      await SB.auth.signUp({
        email,
        password,
        options:{
          data:{
            username,
            mobile:mobile || ""
          }
        }
      });

    if (error) {
      toast(error.message);
      return;
    }

    if (data.session) {
      ME = data.user;
      await loadMe();
      home();
    } else {
      toast("Account ban gaya. Email verify karke login karo.");
      authScreen("login");
    }
  }

  async function forgot() {
    const email = $("#authEmail")?.value.trim();

    if (!email) {
      toast("Pehle email enter karo");
      return;
    }

    const { error } =
      await SB.auth.resetPasswordForEmail(email, {
        redirectTo: location.origin + location.pathname
      });

    if (error) {
      toast(error.message);
      return;
    }

    toast("Password reset email bhej diya");
  }

  async function logout() {
    await SB.auth.signOut();
    ME = null;
    PROFILE = null;
    authScreen("login");
  }

  /* =========================================================
     CURRENT USER
     ========================================================= */

  async function loadMe() {
    if (!ME) return;

    PROFILE = await getProfile(ME.id);
  }

  /* =========================================================
     APP SHELL
     ========================================================= */

  function shell(content) {
    const app = $("#app");

    app.innerHTML = `
      <div class="pf-wrap">

        <header class="pf-header">
          <div class="pf-logo">PicFlow</div>

          <div class="pf-head-icons">
            <button class="pf-icon" onclick="window.PF.search()">⌕</button>
            <button class="pf-icon" onclick="window.PF.notifications()">♡</button>
            <button class="pf-icon" onclick="window.PF.inbox()">➤</button>
          </div>
        </header>

        <main>${content}</main>

        <nav class="bottom-nav">
          <button
            class="${CURRENT_PAGE === "home" ? "active" : ""}"
            onclick="window.PF.home()">
            🏠
            <span class="bottom-label">Home</span>
          </button>

          <button
            class="${CURRENT_PAGE === "search" ? "active" : ""}"
            onclick="window.PF.search()">
            🔎
            <span class="bottom-label">Search</span>
          </button>

          <button onclick="window.PF.createPost()">
            ➕
            <span class="bottom-label">Create</span>
          </button>

          <button
            class="${CURRENT_PAGE === "reels" ? "active" : ""}"
            onclick="window.PF.reels()">
            🎬
            <span class="bottom-label">Reels</span>
          </button>

          <button
            class="${CURRENT_PAGE === "profile" ? "active" : ""}"
            onclick="window.PF.profile()">
            👤
            <span class="bottom-label">Profile</span>
          </button>
        </nav>

      </div>`;
  }

  /* =========================================================
     HOME
     ========================================================= */

  async function home() {
    if (!ME) return authScreen("login");

    CURRENT_PAGE = "home";
    loading("Loading PicFlow...");

    const storiesHTML = await renderStories();

    const { data: posts, error } =
      await SB
        .from("posts")
        .select("*")
        .order("created_at", { ascending:false })
        .limit(50);

    if (error) {
      shell(`
        ${storiesHTML}
        <div class="empty">
          Feed load nahi hua.<br><br>
          ${esc(error.message)}
        </div>`);
      return;
    }

    const ids = (posts || []).map(p => p.user_id);
    const map = await profilesMap(ids);

    const postHTML = [];

    for (const post of posts || []) {
      postHTML.push(
        await postCard(post, map[post.user_id])
      );
    }

    shell(`
      ${storiesHTML}

      <div class="create-box">
        ${avatar(PROFILE, 38)}
        <button
          class="create-input"
          onclick="window.PF.createPost()">
          What's on your mind?
        </button>
      </div>

      ${
        postHTML.length
          ? postHTML.join("")
          : `<div class="empty">Abhi koi post nahi hai.</div>`
      }
    `);
  }

  /* =========================================================
     STORIES
     ========================================================= */

  async function renderStories() {
    const { data, error } =
      await SB
        .from("stories")
        .select("*")
        .gt("expires_at", new Date().toISOString())
        .order("created_at", { ascending:false })
        .limit(30);

    if (error) {
      return `
        <div class="pf-stories">
          <div class="story" onclick="window.PF.createStory()">
            <div class="story-ring">
              <div class="story-inner">
                ${avatar(PROFILE, 50)}
              </div>
            </div>
            <div>Your story</div>
          </div>
        </div>`;
    }

    const ids = (data || []).map(x => x.user_id);
    const map = await profilesMap(ids);

    const html = `
      <div class="pf-stories">

        <div class="story" onclick="window.PF.createStory()">
          <div class="story-ring">
            <div class="story-inner">
              ${avatar(PROFILE, 50)}
            </div>
          </div>
          <div>Your story</div>
        </div>

        ${(data || []).map(s => {
          const p = map[s.user_id];

          return `
            <div
              class="story"
              onclick='window.PF.viewStory(${JSON.stringify(s).replaceAll("'", "&#039;")})'>

              <div class="story-ring">
                <div class="story-inner">
                  ${
                    s.media_type === "video"
                      ? `<video src="${esc(s.media_url)}" muted></video>`
                      : `<img src="${esc(s.media_url)}">`
                  }
                </div>
              </div>

              <div>${esc(p?.username || "user")}</div>
            </div>`;
        }).join("")}

      </div>`;

    return html;
  }

  async function createStory() {
    openModal(`
      <div class="close-row">
        <h3>Add Story</h3>
        <button class="close" onclick="window.PF.closeModal()">×</button>
      </div>

      <input id="storyFile" class="pf-input" type="file" accept="image/*,video/*">

      <button class="pf-btn" onclick="window.PF.uploadStory()">
        Upload Story
      </button>
    `);
  }

  async function uploadStory() {
    const file = $("#storyFile")?.files?.[0];

    if (!file) {
      toast("Story file select karo");
      return;
    }

    try {
      toast("Uploading...");

      const mediaType =
        file.type.startsWith("video")
          ? "video"
          : "image";

      const url =
        await uploadFile(
          "posts",
          file,
          `stories/${ME.id}`
        );

      const expires =
        new Date(Date.now() + 24 * 60 * 60 * 1000)
          .toISOString();

      const { error } =
        await SB
          .from("stories")
          .insert({
            user_id:ME.id,
            media_url:url,
            media_type:mediaType,
            expires_at:expires
          });

      if (error) throw error;

      closeModal();
      toast("Story uploaded");
      home();

    } catch (e) {
      toast(e.message || "Story upload failed");
    }
  }

  function viewStory(story) {
    const media =
      story.media_type === "video"
        ? `
          <video
            src="${esc(story.media_url)}"
            controls
            autoplay
            style="width:100%;max-height:75vh">
          </video>`
        : `
          <img
            src="${esc(story.media_url)}"
            style="width:100%;max-height:75vh;object-fit:contain">`;

    openModal(`
      <div class="close-row">
        <h3>Story</h3>
        <button class="close" onclick="window.PF.closeModal()">×</button>
      </div>

      ${media}
    `, true);
  }

  /* =========================================================
     POST CARD
     ========================================================= */

  async function postCard(post, profile) {
    const { data: likes } =
      await SB
        .from("likes")
        .select("user_id")
        .eq("post_id", post.id);

    const { data: saved } =
      await SB
        .from("saved_posts")
        .select("post_id")
        .eq("post_id", post.id)
        .eq("user_id", ME.id)
        .maybeSingle();

    const { count: commentCount } =
      await SB
        .from("comments")
        .select("*", { count:"exact", head:true })
        .eq("post_id", post.id);

    const liked =
      (likes || []).some(x => x.user_id === ME.id);

    return `
      <article class="post">

        <div class="post-head">
          <button
            class="pf-icon"
            onclick="window.PF.publicProfile('${post.user_id}')">
            ${avatar(profile, 40)}
          </button>

          <div
            class="post-user"
            onclick="window.PF.publicProfile('${post.user_id}')">
            ${esc(profile?.username || "user")}
          </div>

          ${
            post.user_id === ME.id
              ? `
                <button
                  class="pf-icon"
                  onclick="window.PF.deletePost('${post.id}')">
                  ⋯
                </button>`
              : ""
          }
        </div>

        ${
          post.media_type === "video"
            ? `
              <video
                class="post-media"
                src="${esc(post.media_url)}"
                controls
                playsinline>
              </video>`
            : `
              <img
                class="post-media"
                src="${esc(post.media_url)}"
                loading="lazy">`
        }

        <div class="post-actions">

          <button
            class="${liked ? "liked" : ""}"
            onclick="window.PF.like('${post.id}')">
            ${liked ? "♥" : "♡"}
          </button>

          <button onclick="window.PF.comments('${post.id}')">
            💬
          </button>

          <button onclick="window.PF.share('${post.id}')">
            ➤
          </button>

          <button
            class="${saved ? "saved" : ""}"
            onclick="window.PF.save('${post.id}')">
            🔖
          </button>

        </div>

        <div class="caption">
          <b>${(likes || []).length} likes</b>
          <br>
          ${
            post.caption
              ? `<b>${esc(profile?.username || "user")}</b> ${esc(post.caption)}`
              : ""
          }
        </div>

        <button
          style="
            background:none;
            border:0;
            color:#777;
            padding:0 12px 8px
          "
          onclick="window.PF.comments('${post.id}')">
          View all ${commentCount || 0} comments
        </button>

        <div class="time">
          ${formatDate(post.created_at)}
        </div>

      </article>`;
  }

  /* =========================================================
     CREATE POST
     ========================================================= */

  function createPost() {
    openModal(`
      <div class="close-row">
        <h3>Create Post</h3>
        <button class="close" onclick="window.PF.closeModal()">×</button>
      </div>

      <input
        id="postFile"
        class="pf-input"
        type="file"
        accept="image/*,video/*">

      <textarea
        id="postCaption"
        class="pf-textarea"
        placeholder="Write a caption..."></textarea>

      <button class="pf-btn" onclick="window.PF.uploadPost()">
        Share Post
      </button>
    `);
  }

  async function uploadPost() {
    const file = $("#postFile")?.files?.[0];
    const caption = $("#postCaption")?.value.trim() || "";

    if (!file) {
      toast("Photo/video select karo");
      return;
    }

    try {
      toast("Uploading post...");

      const mediaType =
        file.type.startsWith("video")
          ? "video"
          : "image";

      const url =
        await uploadFile(
          "posts",
          file,
          ME.id
        );

      const { error } =
        await SB
          .from("posts")
          .insert({
            user_id:ME.id,
            media_url:url,
            media_type:mediaType,
            caption
          });

      if (error) throw error;

      closeModal();
      toast("Post shared");
      home();

    } catch (e) {
      console.error(e);
      toast(e.message || "Post upload failed");
    }
  }

  async function deletePost(id) {
    if (!confirm("Post delete karna hai?")) return;

    const { error } =
      await SB
        .from("posts")
        .delete()
        .eq("id", id)
        .eq("user_id", ME.id);

    if (error) {
      toast(error.message);
      return;
    }

    toast("Post deleted");
    home();
  }

  /* =========================================================
     LIKE
     ========================================================= */

  async function like(postId) {
    const { data: existing } =
      await SB
        .from("likes")
        .select("post_id")
        .eq("post_id", postId)
        .eq("user_id", ME.id)
        .maybeSingle();

    if (existing) {
      await SB
        .from("likes")
        .delete()
        .eq("post_id", postId)
        .eq("user_id", ME.id);
    } else {
      const { error } =
        await SB
          .from("likes")
          .insert({
            post_id:postId,
            user_id:ME.id
          });

      if (error) {
        toast(error.message);
        return;
      }
    }

    home();
  }

  /* =========================================================
     SAVE
     ========================================================= */

  async function save(postId) {
    const { data: existing } =
      await SB
        .from("saved_posts")
        .select("post_id")
        .eq("post_id", postId)
        .eq("user_id", ME.id)
        .maybeSingle();

    if (existing) {
      await SB
        .from("saved_posts")
        .delete()
        .eq("post_id", postId)
        .eq("user_id", ME.id);

      toast("Removed from saved");
    } else {
      const { error } =
        await SB
          .from("saved_posts")
          .insert({
            post_id:postId,
            user_id:ME.id
          });

      if (error) {
        toast(error.message);
        return;
      }

      toast("Saved");
    }

    home();
  }

  /* =========================================================
     SHARE
     ========================================================= */

  async function share(postId) {
    const url =
      location.origin +
      location.pathname +
      "?post=" +
      encodeURIComponent(postId);

    if (navigator.share) {
      try {
        await navigator.share({
          title:"PicFlow",
          text:"Check this PicFlow post",
          url
        });
      } catch {}
    } else {
      await navigator.clipboard?.writeText(url);
      toast("Post link copied");
    }
  }

  /* =========================================================
     COMMENTS
     ========================================================= */

  async function comments(postId) {
    openModal(`
      <div class="close-row">
        <h3>Comments</h3>
        <button class="close" onclick="window.PF.closeModal()">×</button>
      </div>

      <div id="commentsList">
        Loading...
      </div>

      <div style="
        display:flex;
        gap:8px;
        margin-top:12px
      ">
        <input
          id="commentInput"
          class="pf-input"
          placeholder="Add a comment..."
          style="margin:0">

        <button
          class="pf-btn"
          style="width:auto;margin:0"
          onclick="window.PF.addComment('${postId}')">
          Send
        </button>
      </div>
    `);

    await loadComments(postId);
  }

  async function loadComments(postId) {
    const box = $("#commentsList");
    if (!box) return;

    const { data, error } =
      await SB
        .from("comments")
        .select("*")
        .eq("post_id", postId)
        .order("created_at", { ascending:true });

    if (error) {
      box.innerHTML =
        `<div class="empty">${esc(error.message)}</div>`;
      return;
    }

    const map =
      await profilesMap((data || []).map(x => x.user_id));

    if (!data?.length) {
      box.innerHTML =
        `<div class="empty">No comments yet.</div>`;
      return;
    }

    box.innerHTML =
      data.map(c => `
        <div class="comment">
          <b>${esc(map[c.user_id]?.username || "user")}</b>
          ${esc(c.body)}
          <div style="color:#666;font-size:10px;margin-top:3px">
            ${formatDate(c.created_at)}
          </div>
        </div>
      `).join("");
  }

  async function addComment(postId) {
    const input = $("#commentInput");
    const body = input?.value.trim();

    if (!body) return;

    const { error } =
      await SB
        .from("comments")
        .insert({
          post_id:postId,
          user_id:ME.id,
          body
        });

    if (error) {
      toast(error.message);
      return;
    }

    input.value = "";
    await loadComments(postId);
  }

  /* =========================================================
     SEARCH
     ========================================================= */

  function search() {
    CURRENT_PAGE = "search";

    shell(`
      <div class="people-title">Search</div>

      <div class="search-box">
        <input
          id="searchInput"
          class="pf-input"
          placeholder="Search username..."
          oninput="window.PF.searchUsers()">
      </div>

      <div id="searchResults"></div>
    `);
  }

  async function searchUsers() {
    const q =
      $("#searchInput")?.value.trim();

    const box = $("#searchResults");

    if (!box) return;

    if (!q) {
      box.innerHTML = "";
      return;
    }

    const { data, error } =
      await SB
        .from("profiles")
        .select("*")
        .ilike("username", `%${q}%`)
        .limit(30);

    if (error) {
      box.innerHTML =
        `<div class="empty">${esc(error.message)}</div>`;
      return;
    }

    box.innerHTML =
      (data || []).map(p => `
        <div class="search-result">

          ${avatar(p, 45)}

          <div class="search-result-info">
            <b>${esc(p.username)}</b>
            <div style="color:#888;font-size:12px">
              ${esc(p.bio || "")}
            </div>
          </div>

          ${
            p.id !== ME.id
              ? `
                <button
                  onclick="window.PF.follow('${p.id}',this)">
                  Follow
                </button>`
              : ""
          }

        </div>
      `).join("");
  }

  /* =========================================================
     FOLLOW
     ========================================================= */

  async function follow(userId, button) {
    const { data: existing } =
      await SB
        .from("follows")
        .select("*")
        .eq("follower_id", ME.id)
        .eq("following_id", userId)
        .maybeSingle();

    if (existing) {
      const { error } =
        await SB
          .from("follows")
          .delete()
          .eq("follower_id", ME.id)
          .eq("following_id", userId);

      if (error) {
        toast(error.message);
        return;
      }

      if (button) button.textContent = "Follow";
      toast("Unfollowed");
    } else {
      const { error } =
        await SB
          .from("follows")
          .insert({
            follower_id:ME.id,
            following_id:userId
          });

      if (error) {
        toast(error.message);
        return;
      }

      if (button) button.textContent = "Following";
      toast("Following");
    }
  }

  async function followStatus(userId) {
    const { data } =
      await SB
        .from("follows")
        .select("*")
        .eq("follower_id", ME.id)
        .eq("following_id", userId)
        .maybeSingle();

    return !!data;
  }

  /* =========================================================
     PROFILE
     ========================================================= */

  async function profile() {
    await publicProfile(ME.id, true);
  }

  async function publicProfile(userId, own = false) {
    CURRENT_PAGE =
      userId === ME.id ? "profile" : "";

    loading("Loading profile...");

    const p = await getProfile(userId);

    const { count:postsCount } =
      await SB
        .from("posts")
        .select("*", { count:"exact", head:true })
        .eq("user_id", userId);

    const { count:followers } =
      await SB
        .from("follows")
        .select("*", { count:"exact", head:true })
        .eq("following_id", userId);

    const { count:following } =
      await SB
        .from("follows")
        .select("*", { count:"exact", head:true })
        .eq("follower_id", userId);

    const isFollowing =
      userId !== ME.id
        ? await followStatus(userId)
        : false;

    const { data:posts } =
      await SB
        .from("posts")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending:false });

    shell(`
      <div class="profile-head">

        ${
          p.avatar_url
            ? `
              <img
                class="profile-avatar"
                src="${esc(p.avatar_url)}">`
            : `
              <div class="profile-avatar"
                   style="
                     display:flex;
                     align-items:center;
                     justify-content:center;
                     font-size:32px">
                ${esc((p.username || "U")[0].toUpperCase())}
              </div>`
        }

        <div class="profile-stats">

          <div class="stat">
            <b>${postsCount || 0}</b>
            <span>Posts</span>
          </div>

          <div
            class="stat"
            onclick="window.PF.followers('${userId}')">
            <b>${followers || 0}</b>
            <span>Followers</span>
          </div>

          <div
            class="stat"
            onclick="window.PF.following('${userId}')">
            <b>${following || 0}</b>
            <span>Following</span>
          </div>

        </div>
      </div>

      <div class="profile-info">
        <b>${esc(p.username || "user")}</b>
        <div style="margin-top:5px;color:#ccc">
          ${esc(p.bio || "")}
        </div>
      </div>

      <div class="profile-buttons">

        ${
          userId === ME.id
            ? `
              <button onclick="window.PF.editProfile()">
                Edit Profile
              </button>

              <button onclick="window.PF.saved()">
                Saved
              </button>`
            : `
              <button
                onclick="window.PF.follow('${userId}',this)">
                ${isFollowing ? "Following" : "Follow"}
              </button>

              <button
                onclick="window.PF.openChat('${userId}')">
                Message
              </button>`
        }

      </div>

      <div class="grid">

        ${(posts || []).map(post => `
          <div
            class="grid-item"
            onclick="window.PF.openPost('${post.id}')">

            ${
              post.media_type === "video"
                ? `
                  <video
                    src="${esc(post.media_url)}"
                    muted>
                  </video>`
                : `
                  <img
                    src="${esc(post.media_url)}"
                    loading="lazy">`
            }

          </div>
        `).join("")}

      </div>
    `);
  }

  async function openPost(postId) {
    const { data:post } =
      await SB
        .from("posts")
        .select("*")
        .eq("id", postId)
        .maybeSingle();

    if (!post) {
      toast("Post not found");
      return;
    }

    const p = await getProfile(post.user_id);

    openModal(`
      <div class="close-row">
        <h3>${esc(p.username || "Post")}</h3>
        <button class="close" onclick="window.PF.closeModal()">×</button>
      </div>

      ${
        post.media_type === "video"
          ? `
            <video
              src="${esc(post.media_url)}"
              controls
              style="width:100%">
            </video>`
          : `
            <img
              src="${esc(post.media_url)}"
              style="width:100%">
          `
      }

      <div style="padding:12px 0">
        ${esc(post.caption || "")}
      </div>
    `, true);
  }

  /* =========================================================
     EDIT PROFILE
     ========================================================= */

  function editProfile() {
    openModal(`
      <div class="close-row">
        <h3>Edit Profile</h3>
        <button class="close" onclick="window.PF.closeModal()">×</button>
      </div>

      <label>Username</label>
      <input
        id="editUsername"
        class="pf-input"
        value="${esc(PROFILE?.username || "")}">

      <label>Bio</label>
      <textarea
        id="editBio"
        class="pf-textarea"
        placeholder="Bio...">${esc(PROFILE?.bio || "")}</textarea>

      <label>Mobile</label>
      <input
        id="editMobile"
        class="pf-input"
        value="${esc(PROFILE?.mobile || "")}">

      <label>Profile photo</label>
      <input
        id="dpFile"
        class="pf-input"
        type="file"
        accept="image/*">

      <button
        class="pf-btn"
        onclick="window.PF.saveProfile()">
        Save Profile
      </button>
    `);
  }

  async function saveProfile() {
    const username =
      $("#editUsername")?.value.trim();

    const bio =
      $("#editBio")?.value.trim() || "";

    const mobile =
      $("#editMobile")?.value.trim() || "";

    if (!username) {
      toast("Username required");
      return;
    }

    try {
      let avatarUrl = PROFILE?.avatar_url || "";

      const file =
        $("#dpFile")?.files?.[0];

      if (file) {
        avatarUrl =
          await uploadFile(
            "avatars",
            file,
            ME.id
          );
      }

      const { error } =
        await SB
          .from("profiles")
          .update({
            username,
            bio,
            mobile,
            avatar_url:avatarUrl,
            updated_at:new Date().toISOString()
          })
          .eq("id", ME.id);

      if (error) throw error;

      PROFILE = await getProfile(ME.id);

      closeModal();
      toast("Profile updated");

      await profile();

    } catch (e) {
      toast(e.message || "Profile update failed");
    }
  }

  /* =========================================================
     FOLLOWERS / FOLLOWING
     ========================================================= */

  async function followers(userId) {
    const { data, error } =
      await SB
        .from("follows")
        .select("follower_id")
        .eq("following_id", userId);

    if (error) {
      toast(error.message);
      return;
    }

    const map =
      await profilesMap(
        (data || []).map(x => x.follower_id)
      );

    openUserList(
      "Followers",
      (data || []).map(x => map[x.follower_id]).filter(Boolean)
    );
  }

  async function following(userId) {
    const { data, error } =
      await SB
        .from("follows")
        .select("following_id")
        .eq("follower_id", userId);

    if (error) {
      toast(error.message);
      return;
    }

    const map =
      await profilesMap(
        (data || []).map(x => x.following_id)
      );

    openUserList(
      "Following",
      (data || []).map(x => map[x.following_id]).filter(Boolean)
    );
  }

  function openUserList(title, users) {
    openModal(`
      <div class="close-row">
        <h3>${esc(title)}</h3>
        <button class="close" onclick="window.PF.closeModal()">×</button>
      </div>

      ${
        users.length
          ? users.map(p => `
              <div class="list-row">

                ${avatar(p, 45)}

                <div class="grow">
                  <b>${esc(p.username)}</b>
                  <div style="color:#888;font-size:12px">
                    ${esc(p.bio || "")}
                  </div>
                </div>

                <button
                  class="pf-btn"
                  style="width:auto;margin:0"
                  onclick="window.PF.publicProfile('${p.id}')">
                  View
                </button>

              </div>
            `).join("")
          : `<div class="empty">No users found</div>`
      }
    `);
  }

  /* =========================================================
     SAVED POSTS
     ========================================================= */

  async function saved() {
    CURRENT_PAGE = "profile";
    loading("Loading saved posts...");

    const { data:saves, error } =
      await SB
        .from("saved_posts")
        .select("post_id")
        .eq("user_id", ME.id)
        .order("post_id");

    if (error) {
      shell(`<div class="empty">${esc(error.message)}</div>`);
      return;
    }

    const ids =
      (saves || []).map(x => x.post_id);

    let posts = [];

    if (ids.length) {
      const result =
        await SB
          .from("posts")
          .select("*")
          .in("id", ids)
          .order("created_at", { ascending:false });

      posts = result.data || [];
    }

    const map =
      await profilesMap(posts.map(x => x.user_id));

    shell(`
      <div class="people-title">Saved</div>

      ${
        posts.length
          ? await Promise.all(
              posts.map(p => postCard(p, map[p.user_id]))
            ).then(x => x.join(""))
          : `<div class="empty">No saved posts</div>`
      }
    `);
  }

  /* =========================================================
     REELS
     ========================================================= */

  async function reels() {
    CURRENT_PAGE = "reels";
    loading("Loading reels...");

    const { data:posts, error } =
      await SB
        .from("posts")
        .select("*")
        .eq("media_type", "video")
        .order("created_at", { ascending:false })
        .limit(30);

    if (error) {
      shell(`<div class="empty">${esc(error.message)}</div>`);
      return;
    }

    const map =
      await profilesMap(
        (posts || []).map(p => p.user_id)
      );

    shell(`
      <div class="people-title">Reels</div>

      ${
        posts?.length
          ? posts.map(p => `
              <div style="
                min-height:75vh;
                border-bottom:1px solid #222;
                display:flex;
                flex-direction:column;
                justify-content:center">

                <video
                  src="${esc(p.media_url)}"
                  controls
                  autoplay
                  muted
                  loop
                  playsinline
                  style="
                    width:100%;
                    max-height:80vh;
                    object-fit:contain">
                </video>

                <div style="padding:12px">
                  <b>${esc(map[p.user_id]?.username || "user")}</b>
                  <div>${esc(p.caption || "")}</div>
                </div>

              </div>
            `).join("")
          : `<div class="empty">No reels yet</div>`
      }
    `);
  }

  /* =========================================================
     NOTIFICATIONS
     ========================================================= */

  async function notifications() {
    CURRENT_PAGE = "";
    loading("Loading notifications...");

    const { data, error } =
      await SB
        .from("notifications")
        .select("*")
        .eq("user_id", ME.id)
        .order("created_at", { ascending:false })
        .limit(50);

    if (error) {
      shell(`
        <div class="people-title">Notifications</div>
        <div class="empty">${esc(error.message)}</div>
      `);
      return;
    }

    const map =
      await profilesMap(
        (data || []).map(x => x.actor_id)
      );

    shell(`
      <div class="people-title">Notifications</div>

      ${
        data?.length
          ? data.map(n => `
              <div class="notif">

                ${avatar(map[n.actor_id], 42)}

                <div class="grow">
                  <b>${esc(map[n.actor_id]?.username || "Someone")}</b>

                  <div>
                    ${esc(n.message || n.type || "")}
                  </div>

                  <small style="color:#777">
                    ${formatDate(n.created_at)}
                  </small>
                </div>

              </div>
            `).join("")
          : `<div class="empty">No notifications</div>`
      }
    `);

    await SB
      .from("notifications")
      .update({ read:true })
      .eq("user_id", ME.id)
      .eq("read", false);
  }

  /* =========================================================
     MESSAGES
     ========================================================= */

  async function inbox() {
    CURRENT_PAGE = "";
    loading("Loading messages...");

    const { data, error } =
      await SB
        .from("messages")
        .select("*")
        .or(
          `sender_id.eq.${ME.id},receiver_id.eq.${ME.id}`
        )
        .order("created_at", { ascending:false })
        .limit(100);

    if (error) {
      shell(`
        <div class="people-title">Messages</div>
        <div class="empty">${esc(error.message)}</div>
      `);
      return;
    }

    const otherIds = [];

    (data || []).forEach(m => {
      const id =
        m.sender_id === ME.id
          ? m.receiver_id
          : m.sender_id;

      otherIds.push(id);
    });

    const map =
      await profilesMap(otherIds);

    const unique = [];
    const seen = new Set();

    for (const m of data || []) {
      const id =
        m.sender_id === ME.id
          ? m.receiver_id
          : m.sender_id;

      if (!seen.has(id)) {
        seen.add(id);
        unique.push(id);
      }
    }

    shell(`
      <div class="people-title">Messages</div>

      <div class="chat-list">

        ${
          unique.length
            ? unique.map(id => {
                const p = map[id];

                return `
                  <div
                    class="chat-row"
                    onclick="window.PF.openChat('${id}')">

                    ${avatar(p, 48)}

                    <div class="grow">
                      <b>${esc(p?.username || "user")}</b>
                    </div>

                    <span>›</span>
                  </div>`;
              }).join("")
            : `<div class="empty">No messages yet</div>`
        }

      </div>
    `);
  }

  async function openChat(userId) {
    CURRENT_CHAT = userId;

    const p = await getProfile(userId);

    openModal(`
      <div class="close-row">
        <h3>${esc(p.username || "Chat")}</h3>
        <button class="close" onclick="window.PF.closeModal()">×</button>
      </div>

      <div
        id="chatMessages"
        style="min-height:250px">
        Loading...
      </div>

      <div class="chat-input">

        <input
          id="chatInput"
          placeholder="Message...">

        <button onclick="window.PF.sendMessage()">
          ➤
        </button>

      </div>
    `);

    await loadChat(userId);
  }

  async function loadChat(userId) {
    const box = $("#chatMessages");
    if (!box) return;

    const { data, error } =
      await SB
        .from("messages")
        .select("*")
        .or(
          `and(sender_id.eq.${ME.id},receiver_id.eq.${userId}),and(sender_id.eq.${userId},receiver_id.eq.${ME.id})`
        )
        .order("created_at", { ascending:true });

    if (error) {
      box.innerHTML =
        `<div class="empty">${esc(error.message)}</div>`;
      return;
    }

    box.innerHTML =
      (data || []).map(m => `
        <div class="message ${m.sender_id === ME.id ? "me" : ""}">
          <div class="bubble">
            ${esc(m.body)}
          </div>
        </div>
      `).join("");

    box.scrollTop = box.scrollHeight;
  }

  async function sendMessage() {
    if (!CURRENT_CHAT) return;

    const input = $("#chatInput");
    const body = input?.value.trim();

    if (!body) return;

    const { error } =
      await SB
        .from("messages")
        .insert({
          sender_id:ME.id,
          receiver_id:CURRENT_CHAT,
          body
        });

    if (error) {
      toast(error.message);
      return;
    }

    input.value = "";
    await loadChat(CURRENT_CHAT);
  }

  /* =========================================================
     SETTINGS
     ========================================================= */

  function settings() {
    openModal(`
      <div class="close-row">
        <h3>Settings</h3>
        <button class="close" onclick="window.PF.closeModal()">×</button>
      </div>

      <button
        class="pf-btn secondary"
        onclick="window.PF.editProfile()">
        Edit Profile
      </button>

      <button
        class="pf-btn secondary"
        onclick="window.PF.saved();window.PF.closeModal()">
        Saved Posts
      </button>

      <button
        class="pf-btn danger"
        onclick="window.PF.logout()">
        Logout
      </button>
    `);
  }

  /* =========================================================
     MODALS
     ========================================================= */

  function openModal(content, center = false) {
    closeModal();

    const div = document.createElement("div");

    div.id = "pfModal";
    div.className =
      "modal " + (center ? "modal-center" : "");

    div.innerHTML = `
      <div class="sheet">
        ${content}
      </div>`;

    div.addEventListener("click", e => {
      if (e.target === div) closeModal();
    });

    document.body.appendChild(div);
  }

  function closeModal() {
    $("#pfModal")?.remove();
  }

  /* =========================================================
     AUTH STATE
     ========================================================= */

  async function boot() {
    injectCSS();

    const {
      data:{ session }
    } = await SB.auth.getSession();

    if (session?.user) {
      ME = session.user;
      await loadMe();
      await home();
    } else {
      authScreen("login");
    }

    SB.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT") {
        ME = null;
        PROFILE = null;
        authScreen("login");
      }
    });
  }

  /* =========================================================
     PUBLIC API
     ========================================================= */

  window.PF = {
    auth:authScreen,
    login,
    signup,
    forgot,
    logout,

    home,
    search,
    searchUsers,

    createPost,
    uploadPost,
    deletePost,

    like,
    save,
    comments,
    addComment,
    share,

    createStory,
    uploadStory,
    viewStory,

    profile,
    publicProfile,
    openPost,

    editProfile,
    saveProfile,

    follow,
    followers,
    following,

    saved,
    reels,

    notifications,

    inbox,
    openChat,
    sendMessage,

    settings,

    closeModal
  };

  /* =========================================================
     START
     ========================================================= */

  boot();

})();
