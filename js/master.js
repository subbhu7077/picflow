(() => {
"use strict";

/* ============================================================
   PICFLOW MASTER V5
   Instagram-style Social App
   Supabase + GitHub Pages
   ============================================================ */

const SB = window.supabase.createClient(
  window.SUPABASE_URL,
  window.SUPABASE_PUBLISHABLE_KEY
);

let ME = null;
let PROFILE = null;
let PAGE = "home";
let CHAT_USER = null;

/* =========================
   HELPERS
========================= */

const $ = (s) => document.querySelector(s);

function esc(x=""){
  return String(x)
    .replaceAll("&","&amp;")
    .replaceAll("<","&lt;")
    .replaceAll(">","&gt;")
    .replaceAll('"',"&quot;")
    .replaceAll("'","&#039;");
}

function toast(msg){
  let t=$("#pfToast");
  if(!t){
    t=document.createElement("div");
    t.id="pfToast";
    t.style=`
      position:fixed;left:50%;bottom:80px;
      transform:translateX(-50%);
      background:#fff;color:#000;
      padding:12px 18px;border-radius:30px;
      z-index:999999;font-size:14px;
      max-width:90%;text-align:center;
    `;
    document.body.appendChild(t);
  }
  t.textContent=msg;
  t.style.display="block";
  clearTimeout(window.__toast);
  window.__toast=setTimeout(()=>t.style.display="none",2500);
}

function loading(){
  $("#app").innerHTML=`
    <div style="
      min-height:70vh;
      display:flex;
      align-items:center;
      justify-content:center;
      color:#aaa">
      Loading...
    </div>`;
}

function dateText(x){
  if(!x)return "";
  return new Date(x).toLocaleString([],{
    day:"numeric",
    month:"short",
    hour:"numeric",
    minute:"2-digit"
  });
}

async function profileOf(id){
  const {data}=await SB
    .from("profiles")
    .select("*")
    .eq("id",id)
    .maybeSingle();

  return data||{
    id,
    username:"user",
    bio:"",
    avatar_url:""
  };
}

async function profileMap(ids){
  ids=[...new Set(ids.filter(Boolean))];
  if(!ids.length)return {};

  const {data}=await SB
    .from("profiles")
    .select("*")
    .in("id",ids);

  const m={};
  (data||[]).forEach(x=>m[x.id]=x);
  return m;
}

function avatar(p,size=44){
  if(p?.avatar_url){
    return `<img src="${esc(p.avatar_url)}"
      style="
      width:${size}px;height:${size}px;
      border-radius:50%;object-fit:cover;
      background:#222">`;
  }

  return `<div style="
    width:${size}px;height:${size}px;
    border-radius:50%;background:#292929;
    display:flex;align-items:center;
    justify-content:center;font-weight:700">
    ${esc((p?.username||"U")[0].toUpperCase())}
  </div>`;
}

async function upload(bucket,file,path){
  if(!file)throw new Error("File select karo");

  const ext=file.name.includes(".")
    ? file.name.split(".").pop().toLowerCase()
    : "jpg";

  const full=`${path}/${crypto.randomUUID()}.${ext}`;

  const {error}=await SB.storage
    .from(bucket)
    .upload(full,file,{
      upsert:false,
      contentType:file.type
    });

  if(error)throw error;

  return SB.storage
    .from(bucket)
    .getPublicUrl(full).data.publicUrl;
}

/* =========================
   STYLE
========================= */

function css(){

if($("#pfStyle"))return;

const s=document.createElement("style");
s.id="pfStyle";

s.textContent=`

*{box-sizing:border-box}

html,body{
 margin:0;
 padding:0;
 background:#000;
 color:#fff;
 font-family:Arial,Helvetica,sans-serif
}

body{padding-bottom:65px}

button,input,textarea{
 font:inherit
}

button{cursor:pointer}

.pf{
 width:100%;
 max-width:650px;
 margin:auto
}

.header{
 height:58px;
 position:sticky;
 top:0;
 z-index:1000;
 background:#000;
 border-bottom:1px solid #222;
 display:flex;
 align-items:center;
 justify-content:space-between;
 padding:0 14px
}

.logo{
 font-size:23px;
 font-weight:900
}

.hicons{
 display:flex;
 gap:17px
}

.icon{
 background:none;
 border:0;
 color:#fff;
 font-size:22px;
 padding:3px
}

.stories{
 display:flex;
 gap:14px;
 overflow-x:auto;
 padding:12px;
 border-bottom:1px solid #1c1c1c
}

.story{
 min-width:64px;
 text-align:center;
 font-size:11px;
 color:#aaa
}

.ring{
 width:58px;
 height:58px;
 border-radius:50%;
 padding:2px;
 margin:auto;
 background:linear-gradient(
  45deg,#feda75,#fa7e1e,
  #d62976,#962fbf,#4f5bd5)
}

.storyin{
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

.storyin img,
.storyin video{
 width:100%;
 height:100%;
 object-fit:cover
}

.create{
 margin:10px 12px;
 display:flex;
 align-items:center;
 gap:10px;
 padding:8px 0
}

.createBtn{
 flex:1;
 background:#181818;
 border:1px solid #282828;
 color:#888;
 border-radius:30px;
 padding:11px 15px;
 text-align:left
}

.post{
 border-bottom:1px solid #222;
 margin-bottom:7px
}

.postHead{
 display:flex;
 align-items:center;
 gap:10px;
 padding:10px 12px
}

.postUser{
 flex:1;
 font-weight:700
}

.media{
 display:block;
 width:100%;
 max-height:720px;
 object-fit:contain;
 background:#050505
}

.actions{
 display:flex;
 gap:17px;
 padding:9px 12px 5px
}

.actions button{
 background:none;
 border:0;
 color:#fff;
 font-size:23px
}

.red{color:#ff3040!important}
.yellow{color:#ffd43b!important}

.caption{
 padding:2px 12px 8px;
 line-height:1.45
}

.time{
 color:#666;
 padding:0 12px 10px;
 font-size:11px
}

.bottom{
 position:fixed;
 left:0;
 right:0;
 bottom:0;
 height:64px;
 background:#000;
 border-top:1px solid #222;
 display:flex;
 justify-content:space-around;
 align-items:center;
 z-index:5000
}

.bottom button{
 background:none;
 border:0;
 color:#888;
 font-size:22px
}

.bottom .on{color:#fff}

.bottom small{
 display:block;
 font-size:9px
}

.sheetBg{
 position:fixed;
 inset:0;
 z-index:9000;
 background:rgba(0,0,0,.8);
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

.center{
 align-items:center
}

.center .sheet{
 border-radius:18px
}

.closeRow{
 display:flex;
 justify-content:space-between;
 align-items:center;
 margin-bottom:15px
}

.close{
 width:34px;
 height:34px;
 border:0;
 border-radius:50%;
 background:#292929;
 color:#fff
}

.input,.textarea{
 width:100%;
 background:#191919;
 border:1px solid #333;
 color:#fff;
 border-radius:10px;
 padding:12px;
 margin:6px 0
}

.textarea{
 min-height:110px;
 resize:vertical
}

.btn{
 width:100%;
 padding:12px;
 border:0;
 border-radius:10px;
 background:#fff;
 color:#000;
 font-weight:700;
 margin-top:7px
}

.darkbtn{
 background:#252525;
 color:#fff
}

.danger{
 background:#d93025;
 color:#fff
}

.title{
 font-size:22px;
 font-weight:800;
 padding:18px 12px 7px
}

.empty{
 text-align:center;
 color:#777;
 padding:45px 15px
}

.profileTop{
 padding:22px 15px 10px;
 display:flex;
 align-items:center;
 gap:18px
}

.pavatar{
 width:86px;
 height:86px;
 border-radius:50%;
 object-fit:cover;
 background:#222
}

.stats{
 flex:1;
 display:flex;
 justify-content:space-around;
 text-align:center
}

.stats b{
 display:block;
 font-size:18px
}

.stats span{
 font-size:11px;
 color:#888
}

.bio{
 padding:5px 15px 15px
}

.profileBtns{
 display:flex;
 gap:8px;
 padding:0 15px 15px
}

.profileBtns button{
 flex:1;
 padding:9px;
 border:0;
 border-radius:8px;
 background:#222;
 color:#fff
}

.grid{
 display:grid;
 grid-template-columns:repeat(3,1fr);
 gap:2px
}

.grid div{
 aspect-ratio:1;
 overflow:hidden;
 background:#111
}

.grid img,.grid video{
 width:100%;
 height:100%;
 object-fit:cover
}

.result{
 display:flex;
 align-items:center;
 gap:11px;
 padding:12px;
 border-bottom:1px solid #222
}

.grow{flex:1}

.result button{
 border:0;
 border-radius:8px;
 background:#fff;
 color:#000;
 padding:7px 12px;
 font-weight:700
}

.comment{
 padding:10px 0;
 border-bottom:1px solid #222
}

.notification{
 display:flex;
 gap:10px;
 padding:13px 10px;
 border-bottom:1px solid #222
}

.message{
 display:flex;
 margin:7px 0
}

.message.me{
 justify-content:flex-end
}

.bubble{
 max-width:75%;
 padding:9px 13px;
 border-radius:18px;
 background:#252525
}

.message.me .bubble{
 background:#fff;
 color:#000
}

.chatInput{
 display:flex;
 gap:7px;
 position:sticky;
 bottom:0;
 background:#111;
 padding-top:8px
}

.chatInput input{
 flex:1;
 background:#222;
 border:0;
 color:#fff;
 border-radius:20px;
 padding:11px
}

.chatInput button{
 width:45px;
 border:0;
 border-radius:50%;
 background:#fff
}

.auth{
 min-height:100vh;
 display:flex;
 align-items:center;
 justify-content:center;
 padding:20px
}

.authCard{
 width:100%;
 max-width:390px;
 text-align:center
}

.authLogo{
 font-size:40px;
 font-weight:900;
 margin-bottom:30px
}

`;

document.head.appendChild(s);
}

/* =========================
   AUTH
========================= */

function auth(type="login"){

const signup=type==="signup";

$("#app").innerHTML=`
<div class="auth">
 <div class="authCard">

  <div class="authLogo">PicFlow</div>

  ${
   signup?`
   <input id="username"
    class="input"
    placeholder="Username">

   <input id="mobile"
    class="input"
    placeholder="Mobile number">
   `:""
  }

  <input id="email"
   class="input"
   type="email"
   placeholder="Email">

  <input id="password"
   class="input"
   type="password"
   placeholder="Password">

  <button class="btn"
   onclick="PF.${signup?"signup":"login"}()">
   ${signup?"Create account":"Login"}
  </button>

  ${
   !signup?`
   <button class="btn darkbtn"
    onclick="PF.forgot()">
    Forgot password
   </button>`:""
  }

  <div style="margin-top:18px;color:#888">
   ${
    signup
     ? `Already have account?
        <button class="icon"
        onclick="PF.auth('login')">
        Login
        </button>`
     : `Don't have account?
        <button class="icon"
        onclick="PF.auth('signup')">
        Sign up
        </button>`
   }
  </div>

 </div>
</div>`;
}

async function login(){

const email=$("#email")?.value.trim();
const password=$("#password")?.value;

if(!email||!password){
 toast("Email aur password bharo");
 return;
}

const {data,error}=await SB.auth.signInWithPassword({
 email,password
});

if(error){
 toast(error.message);
 return;
}

ME=data.user;
await loadMe();
home();
}

async function signup(){

const username=$("#username")?.value.trim();
const mobile=$("#mobile")?.value.trim();
const email=$("#email")?.value.trim();
const password=$("#password")?.value;

if(!username||!email||!password){
 toast("Username, email aur password bharo");
 return;
}

if(password.length<6){
 toast("Password minimum 6 characters");
 return;
}

const {data,error}=await SB.auth.signUp({
 email,
 password,
 options:{
  data:{
   username,
   mobile:mobile||""
  }
 }
});

if(error){
 toast(error.message);
 return;
}

if(data.session){
 ME=data.user;
 await loadMe();
 home();
}else{
 toast("Email verify karke login karo");
 auth("login");
}
}

async function forgot(){

const email=$("#email")?.value.trim();

if(!email){
 toast("Email enter karo");
 return;
}

const {error}=await SB.auth.resetPasswordForEmail(email,{
 redirectTo:location.href
});

if(error)toast(error.message);
else toast("Reset email sent");
}

async function logout(){

await SB.auth.signOut();
ME=null;
PROFILE=null;
auth("login");
}

async function loadMe(){
if(!ME)return;
PROFILE=await profileOf(ME.id);
}

/* =========================
   APP SHELL
========================= */

function shell(content){

$("#app").innerHTML=`
<div class="pf">

<header class="header">

 <div class="logo">PicFlow</div>

 <div class="hicons">

  <button class="icon"
   onclick="PF.search()">⌕</button>

  <button class="icon"
   onclick="PF.notifications()">♡</button>

  <button class="icon"
   onclick="PF.inbox()">➤</button>

 </div>

</header>

${content}

<nav class="bottom">

 <button class="${PAGE==="home"?"on":""}"
 onclick="PF.home()">
 🏠
 <small>Home</small>
 </button>

 <button class="${PAGE==="search"?"on":""}"
 onclick="PF.search()">
 🔎
 <small>Search</small>
 </button>

 <button onclick="PF.createPost()">
 ➕
 <small>Create</small>
 </button>

 <button class="${PAGE==="reels"?"on":""}"
 onclick="PF.reels()">
 🎬
 <small>Reels</small>
 </button>

 <button class="${PAGE==="profile"?"on":""}"
 onclick="PF.profile()">
 👤
 <small>Profile</small>
 </button>

</nav>

</div>`;
}

/* =========================
   HOME
========================= */

async function home(){

if(!ME)return auth();

PAGE="home";
loading();

const stories=await storiesHTML();

const {data,error}=await SB
 .from("posts")
 .select("*")
 .order("created_at",{ascending:false})
 .limit(50);

if(error){
 shell(`
 ${stories}
 <div class="empty">
 ${esc(error.message)}
 </div>`);
 return;
}

const map=await profileMap(
 (data||[]).map(x=>x.user_id)
);

let posts="";

for(const p of data||[]){
 posts+=await postHTML(p,map[p.user_id]);
}

shell(`
${stories}

<div class="create">
 ${avatar(PROFILE,38)}

 <button class="createBtn"
 onclick="PF.createPost()">
 What's on your mind?
 </button>
</div>

${posts||`<div class="empty">No posts yet</div>`}
`);
}

/* =========================
   STORIES
========================= */

async function storiesHTML(){

const {data,error}=await SB
 .from("stories")
 .select("*")
 .gt("expires_at",new Date().toISOString())
 .order("created_at",{ascending:false})
 .limit(30);

if(error){
 return `<div class="stories">
 <div class="story"
 onclick="PF.createStory()">
 <div class="ring">
 <div class="storyin">
 ${avatar(PROFILE,50)}
 </div>
 </div>
 <div>Your story</div>
 </div>
 </div>`;
}

const map=await profileMap(
 (data||[]).map(x=>x.user_id)
);

return `
<div class="stories">

<div class="story"
 onclick="PF.createStory()">

 <div class="ring">
  <div class="storyin">
   ${avatar(PROFILE,50)}
  </div>
 </div>

 <div>Your story</div>

</div>

${(data||[]).map(s=>`

<div class="story"
 onclick="PF.viewStory('${s.id}')">

 <div class="ring">
  <div class="storyin">

   ${
    s.media_type==="video"
     ? `<video src="${esc(s.media_url)}" muted></video>`
     : `<img src="${esc(s.media_url)}">`
   }

  </div>
 </div>

 <div>${esc(map[s.user_id]?.username||"user")}</div>

</div>

`).join("")}

</div>`;
}

async function createStory(){

modal(`
<div class="closeRow">
 <h3>Add Story</h3>
 <button class="close"
 onclick="PF.closeModal()">×</button>
</div>

<input id="storyFile"
 class="input"
 type="file"
 accept="image/*,video/*">

<button class="btn"
 onclick="PF.uploadStory()">
 Upload Story
</button>
`);
}

async function uploadStory(){

const file=$("#storyFile")?.files?.[0];

if(!file){
 toast("Story file select karo");
 return;
}

try{

toast("Uploading story...");

const type=file.type.startsWith("video")
 ?"video":"image";

const url=await upload(
 "posts",
 file,
 `stories/${ME.id}`
);

const expires=new Date(
 Date.now()+86400000
).toISOString();

const {error}=await SB
 .from("stories")
 .insert({
  user_id:ME.id,
  media_url:url,
  media_type:type,
  expires_at:expires
 });

if(error)throw error;

closeModal();
toast("Story uploaded");
home();

}catch(e){
 toast(e.message);
}
}

async function viewStory(id){

const {data:s}=await SB
 .from("stories")
 .select("*")
 .eq("id",id)
 .maybeSingle();

if(!s){
 toast("Story not found");
 return;
}

modal(`
<div class="closeRow">
 <h3>Story</h3>
 <button class="close"
 onclick="PF.closeModal()">×</button>
</div>

${
 s.media_type==="video"
 ? `<video
    src="${esc(s.media_url)}"
    controls autoplay
    style="width:100%;max-height:75vh">
    </video>`
 : `<img
    src="${esc(s.media_url)}"
    style="width:100%;max-height:75vh;object-fit:contain">`
}
`,true);
}

/* =========================
   POSTS
========================= */

async function postHTML(post,p){

const {data:likes}=await SB
 .from("likes")
 .select("user_id")
 .eq("post_id",post.id);

const {data:saved}=await SB
 .from("saved_posts")
 .select("post_id")
 .eq("post_id",post.id)
 .eq("user_id",ME.id)
 .maybeSingle();

const liked=(likes||[])
 .some(x=>x.user_id===ME.id);

const {count:comments}=await SB
 .from("comments")
 .select("*",{count:"exact",head:true})
 .eq("post_id",post.id);

return `
<article class="post">

<div class="postHead">

<button class="icon"
 onclick="PF.publicProfile('${post.user_id}')">
 ${avatar(p,40)}
</button>

<div class="postUser"
 onclick="PF.publicProfile('${post.user_id}')">
 ${esc(p?.username||"user")}
</div>

${
 post.user_id===ME.id
 ? `<button class="icon"
    onclick="PF.deletePost('${post.id}')">
    ⋯
    </button>`
 : ""
}

</div>

${
 post.media_type==="video"
 ? `<video
    class="media"
    src="${esc(post.media_url)}"
    controls playsinline>
    </video>`
 : `<img
    class="media"
    src="${esc(post.media_url)}"
    loading="lazy">`
}

<div class="actions">

<button class="${liked?"red":""}"
 onclick="PF.like('${post.id}')">
 ${liked?"♥":"♡"}
</button>

<button onclick="PF.comments('${post.id}')">
 💬
</button>

<button onclick="PF.share('${post.id}')">
 ➤
</button>

<button class="${saved?"yellow":""}"
 onclick="PF.save('${post.id}')">
 🔖
</button>

</div>

<div class="caption">
 <b>${(likes||[]).length} likes</b><br>

 ${
  post.caption
  ? `<b>${esc(p?.username||"user")}</b>
     ${esc(post.caption)}`
  : ""
 }
</div>

<button class="icon"
 style="color:#777;font-size:13px;padding:0 12px 8px"
 onclick="PF.comments('${post.id}')">
 View all ${comments||0} comments
</button>

<div class="time">
 ${dateText(post.created_at)}
</div>

</article>`;
}

async function createPost(){

modal(`
<div class="closeRow">
 <h3>Create Post</h3>
 <button class="close"
 onclick="PF.closeModal()">×</button>
</div>

<input id="postFile"
 class="input"
 type="file"
 accept="image/*,video/*">

<textarea id="caption"
 class="textarea"
 placeholder="Write caption..."></textarea>

<button class="btn"
 onclick="PF.uploadPost()">
 Upload Post
</button>
`);
}

async function uploadPost(){

const file=$("#postFile")?.files?.[0];
const caption=$("#caption")?.value.trim()||"";

if(!file){
 toast("Photo/video select karo");
 return;
}

try{

toast("Uploading...");

const type=file.type.startsWith("video")
 ?"video":"image";

const url=await upload(
 "posts",
 file,
 ME.id
);

const {error}=await SB
 .from("posts")
 .insert({
  user_id:ME.id,
  media_url:url,
  media_type:type,
  caption
 });

if(error)throw error;

closeModal();
toast("Post uploaded");
home();

}catch(e){
 toast(e.message);
}
}

async function deletePost(id){

if(!confirm("Delete post?"))return;

const {error}=await SB
 .from("posts")
 .delete()
 .eq("id",id)
 .eq("user_id",ME.id);

if(error){
 toast(error.message);
 return;
}

toast("Post deleted");
home();
}

/* =========================
   LIKE
========================= */

async function like(id){

const {data}=await SB
 .from("likes")
 .select("*")
 .eq("post_id",id)
 .eq("user_id",ME.id)
 .maybeSingle();

if(data){

await SB.from("likes")
 .delete()
 .eq("post_id",id)
 .eq("user_id",ME.id);

}else{

const {error}=await SB
 .from("likes")
 .insert({
  post_id:id,
  user_id:ME.id
 });

if(error){
 toast(error.message);
 return;
}
}

home();
}

/* =========================
   SAVE
========================= */

async function save(id){

const {data}=await SB
 .from("saved_posts")
 .select("*")
 .eq("post_id",id)
 .eq("user_id",ME.id)
 .maybeSingle();

if(data){

await SB.from("saved_posts")
 .delete()
 .eq("post_id",id)
 .eq("user_id",ME.id);

toast("Removed from saved");

}else{

const {error}=await SB
 .from("saved_posts")
 .insert({
  post_id:id,
  user_id:ME.id
 });

if(error){
 toast(error.message);
 return;
}

toast("Saved");
}

home();
}

/* =========================
   SHARE
========================= */

async function share(id){

const url=location.origin+
 location.pathname+
 "?post="+encodeURIComponent(id);

if(navigator.share){

try{
 await navigator.share({
  title:"PicFlow",
  text:"Check this post",
  url
 });
}catch{}

}else{

try{
 await navigator.clipboard.writeText(url);
 toast("Link copied");
}catch{
 toast(url);
}

}
}

/* =========================
   COMMENTS
========================= */

async function comments(id){

modal(`
<div class="closeRow">
 <h3>Comments</h3>
 <button class="close"
 onclick="PF.closeModal()">×</button>
</div>

<div id="commentsBox">
 Loading...
</div>

<div style="display:flex;gap:7px">

<input id="commentText"
 class="input"
 placeholder="Add comment..."
 style="margin:0">

<button class="btn"
 style="width:auto;margin:0"
 onclick="PF.addComment('${id}')">
 Send
</button>

</div>
`);

await loadComments(id);
}

async function loadComments(id){

const box=$("#commentsBox");
if(!box)return;

const {data,error}=await SB
 .from("comments")
 .select("*")
 .eq("post_id",id)
 .order("created_at",{ascending:true});

if(error){
 box.innerHTML=`<div class="empty">
 ${esc(error.message)}
 </div>`;
 return;
}

const map=await profileMap(
 (data||[]).map(x=>x.user_id)
);

box.innerHTML=(data||[]).length
 ? data.map(c=>`
   <div class="comment">
    <b>${esc(map[c.user_id]?.username||"user")}</b>
    ${esc(c.body)}
    <div style="font-size:10px;color:#666">
     ${dateText(c.created_at)}
    </div>
   </div>
 `).join("")
 : `<div class="empty">No comments</div>`;
}

async function addComment(id){

const input=$("#commentText");
const body=input?.value.trim();

if(!body)return;

const {error}=await SB
 .from("comments")
 .insert({
  post_id:id,
  user_id:ME.id,
  body
 });

if(error){
 toast(error.message);
 return;
}

input.value="";
await loadComments(id);
}

/* =========================
   SEARCH
========================= */

function search(){

PAGE="search";

shell(`
<div class="title">Search</div>

<div style="padding:12px">
 <input id="searchInput"
  class="input"
  placeholder="Search username..."
  oninput="PF.searchUsers()">
</div>

<div id="searchResults"></div>
`);
}

async function searchUsers(){

const q=$("#searchInput")?.value.trim();
const box=$("#searchResults");

if(!box)return;

if(!q){
 box.innerHTML="";
 return;
}

const {data,error}=await SB
 .from("profiles")
 .select("*")
 .ilike("username",`%${q}%`)
 .limit(30);

if(error){
 box.innerHTML=
 `<div class="empty">${esc(error.message)}</div>`;
 return;
}

box.innerHTML=(data||[]).map(p=>`
<div class="result">

 ${avatar(p,45)}

 <div class="grow">
  <b>${esc(p.username)}</b>
  <div style="color:#777;font-size:12px">
   ${esc(p.bio||"")}
  </div>
 </div>

 ${
  p.id!==ME.id
  ? `<button
     onclick="PF.toggleFollow('${p.id}',this)">
     Follow
     </button>`
  : ""
 }

</div>
`).join("");
}

/* =========================
   FOLLOW
========================= */

async function isFollowing(id){

const {data}=await SB
 .from("follows")
 .select("*")
 .eq("follower_id",ME.id)
 .eq("following_id",id)
 .maybeSingle();

return !!data;
}

async function toggleFollow(id,button){

const following=await isFollowing(id);

if(following){

const {error}=await SB
 .from("follows")
 .delete()
 .eq("follower_id",ME.id)
 .eq("following_id",id);

if(error){
 toast(error.message);
 return;
}

if(button)button.textContent="Follow";
toast("Unfollowed");

}else{

const {error}=await SB
 .from("follows")
 .insert({
  follower_id:ME.id,
  following_id:id
 });

if(error){
 toast(error.message);
 return;
}

if(button)button.textContent="Following";
toast("Following");
}
}

/* =========================
   PROFILE
========================= */

async function profile(){
await publicProfile(ME.id);
}

async function publicProfile(id){

PAGE=id===ME.id?"profile":"";

loading();

const p=await profileOf(id);

const {count:posts}=await SB
 .from("posts")
 .select("*",{count:"exact",head:true})
 .eq("user_id",id);

const {count:followers}=await SB
 .from("follows")
 .select("*",{count:"exact",head:true})
 .eq("following_id",id);

const {count:following}=await SB
 .from("follows")
 .select("*",{count:"exact",head:true})
 .eq("follower_id",id);

const followingMe=id!==ME.id
 ? await isFollowing(id)
 : false;

const {data:postsData}=await SB
 .from("posts")
 .select("*")
 .eq("user_id",id)
 .order("created_at",{ascending:false});

shell(`
<div class="profileTop">

 ${
  p.avatar_url
  ? `<img class="pavatar"
     src="${esc(p.avatar_url)}">`
  : `<div class="pavatar"
     style="display:flex;align-items:center;
     justify-content:center;font-size:30px">
     ${esc((p.username||"U")[0].toUpperCase())}
     </div>`
 }

 <div class="stats">

  <div>
   <b>${posts||0}</b>
   <span>Posts</span>
  </div>

  <div onclick="PF.followers('${id}')">
   <b>${followers||0}</b>
   <span>Followers</span>
  </div>

  <div onclick="PF.following('${id}')">
   <b>${following||0}</b>
   <span>Following</span>
  </div>

 </div>

</div>

<div class="bio">
 <b>${esc(p.username||"user")}</b>
 <div style="margin-top:5px;color:#bbb">
  ${esc(p.bio||"")}
 </div>
</div>

<div class="profileBtns">

 ${
  id===ME.id
  ? `
   <button onclick="PF.editProfile()">
    Edit Profile
   </button>

   <button onclick="PF.saved()">
    Saved
   </button>

   <button onclick="PF.settings()">
    Settings
   </button>
  `
  : `
   <button onclick="PF.toggleFollow('${id}',this)">
    ${followingMe?"Following":"Follow"}
   </button>

   <button onclick="PF.openChat('${id}')">
    Message
   </button>
  `
 }

</div>

<div class="grid">

${(postsData||[]).map(p=>`
 <div onclick="PF.openPost('${p.id}')">

 ${
  p.media_type==="video"
  ? `<video src="${esc(p.media_url)}" muted></video>`
  : `<img src="${esc(p.media_url)}">`
 }

 </div>
`).join("")}

</div>
`);
}

/* =========================
   EDIT PROFILE
========================= */

function editProfile(){

modal(`
<div class="closeRow">
 <h3>Edit Profile</h3>
 <button class="close"
 onclick="PF.closeModal()">×</button>
</div>

<input id="newUsername"
 class="input"
 value="${esc(PROFILE?.username||"")}"
 placeholder="Username">

<textarea id="newBio"
 class="textarea"
 placeholder="Bio">${esc(PROFILE?.bio||"")}</textarea>

<input id="newMobile"
 class="input"
 value="${esc(PROFILE?.mobile||"")}"
 placeholder="Mobile">

<input id="avatarFile"
 class="input"
 type="file"
 accept="image/*">

<button class="btn"
 onclick="PF.updateProfile()">
 Save Profile
</button>
`);
}

async function updateProfile(){

try{

const username=$("#newUsername")?.value.trim();
const bio=$("#newBio")?.value.trim()||"";
const mobile=$("#newMobile")?.value.trim()||"";

if(!username){
 toast("Username required");
 return;
}

let avatarUrl=PROFILE?.avatar_url||"";

const file=$("#avatarFile")?.files?.[0];

if(file){
 avatarUrl=await upload(
  "avatars",
  file,
  ME.id
 );
}

const {error}=await SB
 .from("profiles")
 .update({
  username,
  bio,
  mobile,
  avatar_url:avatarUrl,
  updated_at:new Date().toISOString()
 })
 .eq("id",ME.id);

if(error)throw error;

PROFILE=await profileOf(ME.id);

closeModal();
toast("Profile saved");

profile();

}catch(e){
 toast(e.message);
}
}

/* =========================
   FOLLOWERS
========================= */

async function followers(id){

const {data,error}=await SB
 .from("follows")
 .select("follower_id")
 .eq("following_id",id);

if(error){
 toast(error.message);
 return;
}

const map=await profileMap(
 (data||[]).map(x=>x.follower_id)
);

userList(
 "Followers",
 (data||[])
 .map(x=>map[x.follower_id])
 .filter(Boolean)
);
}

async function following(id){

const {data,error}=await SB
 .from("follows")
 .select("following_id")
 .eq("follower_id",id);

if(error){
 toast(error.message);
 return;
}

const map=await profileMap(
 (data||[]).map(x=>x.following_id)
);

userList(
 "Following",
 (data||[])
 .map(x=>map[x.following_id])
 .filter(Boolean)
);
}

function userList(title,users){

modal(`
<div class="closeRow">
 <h3>${esc(title)}</h3>
 <button class="close"
 onclick="PF.closeModal()">×</button>
</div>

${
 users.length
 ? users.map(p=>`
  <div class="result">

   ${avatar(p,45)}

   <div class="grow">
    <b>${esc(p.username)}</b>
    <div style="font-size:12px;color:#777">
     ${esc(p.bio||"")}
    </div>
   </div>

   <button onclick="PF.publicProfile('${p.id}')">
    View
   </button>

  </div>
 `).join("")
 : `<div class="empty">No users</div>`
}
`);
}

/* =========================
   SAVED
========================= */

async function saved(){

PAGE="profile";
loading();

const {data:saves,error}=await SB
 .from("saved_posts")
 .select("post_id")
 .eq("user_id",ME.id);

if(error){
 shell(`<div class="empty">${esc(error.message)}</div>`);
 return;
}

const ids=(saves||[]).map(x=>x.post_id);

if(!ids.length){
 shell(`
 <div class="title">Saved</div>
 <div class="empty">No saved posts</div>
 `);
 return;
}

const {data:posts}=await SB
 .from("posts")
 .select("*")
 .in("id",ids)
 .order("created_at",{ascending:false});

const map=await profileMap(
 (posts||[]).map(x=>x.user_id)
);

let html="";

for(const p of posts||[]){
 html+=await postHTML(p,map[p.user_id]);
}

shell(`
<div class="title">Saved</div>
${html}
`);
}

/* =========================
   REELS
========================= */

async function reels(){

PAGE="reels";
loading();

const {data,error}=await SB
 .from("posts")
 .select("*")
 .eq("media_type","video")
 .order("created_at",{ascending:false})
 .limit(50);

if(error){
 shell(`<div class="empty">${esc(error.message)}</div>`);
 return;
}

const map=await profileMap(
 (data||[]).map(x=>x.user_id)
);

shell(`
<div class="title">Reels</div>

${
 data?.length
 ? data.map(p=>`
  <div style="
   min-height:78vh;
   border-bottom:1px solid #222;
   display:flex;
   flex-direction:column;
   justify-content:center">

   <video
    src="${esc(p.media_url)}"
    controls autoplay muted loop playsinline
    style="
     width:100%;
     max-height:80vh;
     object-fit:contain">
   </video>

   <div style="padding:12px">
    <b>${esc(map[p.user_id]?.username||"user")}</b>
    <div>${esc(p.caption||"")}</div>
   </div>

  </div>
 `).join("")
 : `<div class="empty">
    No reels yet.<br>
    Create a video post to make a Reel.
   </div>`
}
`);
}

/* =========================
   NOTIFICATIONS
========================= */

async function notifications(){

loading();

const {data,error}=await SB
 .from("notifications")
 .select("*")
 .eq("user_id",ME.id)
 .order("created_at",{ascending:false})
 .limit(50);

if(error){
 shell(`
 <div class="title">Notifications</div>
 <div class="empty">${esc(error.message)}</div>
 `);
 return;
}

const map=await profileMap(
 (data||[]).map(x=>x.actor_id)
);

shell(`
<div class="title">Notifications</div>

${
 data?.length
 ? data.map(n=>`
  <div class="notification">

   ${avatar(map[n.actor_id],42)}

   <div class="grow">
    <b>${esc(map[n.actor_id]?.username||"Someone")}</b>
    <div>${esc(n.message||n.type||"")}</div>
    <small style="color:#666">
     ${dateText(n.created_at)}
    </small>
   </div>

  </div>
 `).join("")
 : `<div class="empty">No notifications</div>`
}
`);

await SB
 .from("notifications")
 .update({read:true})
 .eq("user_id",ME.id)
 .eq("read",false);
}

/* =========================
   MESSAGES
========================= */

async function inbox(){

loading();

const {data,error}=await SB
 .from("messages")
 .select("*")
 .or(
  `sender_id.eq.${ME.id},receiver_id.eq.${ME.id}`
 )
 .order("created_at",{ascending:false})
 .limit(100);

if(error){
 shell(`
 <div class="title">Messages</div>
 <div class="empty">${esc(error.message)}</div>
 `);
 return;
}

const ids=[];
const seen=new Set();

for(const m of data||[]){

const id=m.sender_id===ME.id
 ?m.receiver_id
 :m.sender_id;

if(!seen.has(id)){
 seen.add(id);
 ids.push(id);
}
}

const map=await profileMap(ids);

shell(`
<div class="title">Messages</div>

${
 ids.length
 ? ids.map(id=>`
  <div class="result"
   onclick="PF.openChat('${id}')">

   ${avatar(map[id],48)}

   <div class="grow">
    <b>${esc(map[id]?.username||"user")}</b>
   </div>

   <span>›</span>

  </div>
 `).join("")
 : `<div class="empty">No messages yet</div>`
}
`);
}

async function openChat(id){

CHAT_USER=id;

const p=await profileOf(id);

modal(`
<div class="closeRow">
 <h3>${esc(p.username||"Chat")}</h3>
 <button class="close"
 onclick="PF.closeModal()">×</button>
</div>

<div id="chatBox">
 Loading...
</div>

<div class="chatInput">

<input id="messageInput"
 placeholder="Message...">

<button onclick="PF.sendMessage()">
 ➤
</button>

</div>
`);

await loadChat(id);
}

async function loadChat(id){

const box=$("#chatBox");
if(!box)return;

const {data,error}=await SB
 .from("messages")
 .select("*")
 .or(
 `and(sender_id.eq.${ME.id},receiver_id.eq.${id}),
  and(sender_id.eq.${id},receiver_id.eq.${ME.id})`
 )
 .order("created_at",{ascending:true});

if(error){
 box.innerHTML=
 `<div class="empty">${esc(error.message)}</div>`;
 return;
}

box.innerHTML=(data||[]).map(m=>`
 <div class="message ${m.sender_id===ME.id?"me":""}">
  <div class="bubble">
   ${esc(m.body)}
  </div>
 </div>
`).join("");

box.scrollTop=box.scrollHeight;
}

async function sendMessage(){

if(!CHAT_USER)return;

const input=$("#messageInput");
const body=input?.value.trim();

if(!body)return;

const {error}=await SB
 .from("messages")
 .insert({
  sender_id:ME.id,
  receiver_id:CHAT_USER,
  body
 });

if(error){
 toast(error.message);
 return;
}

input.value="";
await loadChat(CHAT_USER);
}

/* =========================
   OPEN POST
========================= */

async function openPost(id){

const {data:p}=await SB
 .from("posts")
 .select("*")
 .eq("id",id)
 .maybeSingle();

if(!p){
 toast("Post not found");
 return;
}

modal(`
<div class="closeRow">
 <h3>Post</h3>
 <button class="close"
 onclick="PF.closeModal()">×</button>
</div>

${
 p.media_type==="video"
 ? `<video
    src="${esc(p.media_url)}"
    controls
    style="width:100%">
    </video>`
 : `<img
    src="${esc(p.media_url)}"
    style="width:100%">`
}

<div style="padding:12px">
 ${esc(p.caption||"")}
</div>
`,true);
}

/* =========================
   SETTINGS
========================= */

function settings(){

modal(`
<div class="closeRow">
 <h3>Settings</h3>
 <button class="close"
 onclick="PF.closeModal()">×</button>
</div>

<button class="btn darkbtn"
 onclick="PF.editProfile()">
 Edit Profile
</button>

<button class="btn darkbtn"
 onclick="PF.saved();PF.closeModal()">
 Saved Posts
</button>

<button class="btn danger"
 onclick="PF.logout()">
 Logout
</button>
`);
}

/* =========================
   MODAL
========================= */

function modal(html,center=false){

closeModal();

const m=document.createElement("div");

m.id="pfModal";
m.className="sheetBg"+(center?" center":"");

m.innerHTML=`<div class="sheet">${html}</div>`;

m.onclick=e=>{
 if(e.target===m)closeModal();
};

document.body.appendChild(m);
}

function closeModal(){
$("#pfModal")?.remove();
}

/* =========================
   PUBLIC API
========================= */

window.PF={
 auth,
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
 share,

 comments,
 addComment,

 createStory,
 uploadStory,
 viewStory,

 profile,
 publicProfile,
 openPost,

 editProfile,
 updateProfile,

 toggleFollow,
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

/* =========================
   ERROR HANDLING
========================= */

window.addEventListener("error",e=>{
 console.error(e.error||e.message);
 toast("App error: "+(e.message||"Unknown error"));
});

window.addEventListener("unhandledrejection",e=>{
 console.error(e.reason);
 toast(
  "App error: "+
  (e.reason?.message||"Unknown error")
 );
});

/* =========================
   BOOT
========================= */

async function boot(){

css();

const {
 data:{session}
}=await SB.auth.getSession();

if(session?.user){

ME=session.user;

await loadMe();

await home();

}else{

auth("login");

}

SB.auth.onAuthStateChange((event,session)=>{

if(event==="SIGNED_OUT"){

ME=null;
PROFILE=null;

auth("login");

}

});

}

boot();

})();
