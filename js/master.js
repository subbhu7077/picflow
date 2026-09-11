const SB=window.supabase.createClient(
 window.SUPABASE_URL,
 window.SUPABASE_PUBLISHABLE_KEY
);

let ME=null;
let MYPROFILE=null;

const $=id=>document.getElementById(id);

function esc(x){
 return String(x??"")
 .replace(/&/g,"&amp;")
 .replace(/</g,"&lt;")
 .replace(/>/g,"&gt;")
 .replace(/"/g,"&quot;");
}

function avatar(url,name){
 return url||"https://ui-avatars.com/api/?name="+encodeURIComponent(name||"P")+"&background=222&color=fff";
}

function toast(text){
 const x=document.createElement("div");
 x.className="toast";
 x.textContent=text;
 document.body.appendChild(x);
 setTimeout(()=>x.remove(),2200);
}

function modal(html){
 closeModal();

 const m=document.createElement("div");
 m.id="picModal";
 m.className="modal";
 m.innerHTML=`<div class="sheet">
   <button class="close" onclick="closeModal()">×</button>
   ${html}
 </div>`;

 m.onclick=e=>{if(e.target===m)closeModal()};
 document.body.appendChild(m);
}

function closeModal(){
 $("picModal")?.remove();
}

async function getMe(){
 const {data}=await SB.auth.getUser();
 return data.user;
}

async function loadMyProfile(){
 if(!ME)return;

 const {data}=await SB.from("profiles")
 .select("*")
 .eq("id",ME.id)
 .maybeSingle();

 MYPROFILE=data||{
  id:ME.id,
  username:ME.user_metadata?.username||ME.email?.split("@")[0]||"user",
  bio:"",
  avatar_url:""
 };
}

function auth(){
 $("app").innerHTML=`
 <div class="auth">
  <div class="authbox">
   <div class="logo">PicFlow</div>

   <input id="email" class="input" placeholder="Email">
   <input id="password" class="input" type="password" placeholder="Password">

   <button class="primary" onclick="login()">Log in</button>

   <div class="link" onclick="forgotPassword()">Forgot password?</div>

   <button class="secondary" onclick="signupPage()">Create new account</button>
  </div>
 </div>`;
}

function signupPage(){
 $("app").innerHTML=`
 <div class="auth">
  <div class="authbox">
   <div class="logo">PicFlow</div>

   <input id="username" class="input" placeholder="Username">
   <input id="email" class="input" placeholder="Email">
   <input id="mobile" class="input" placeholder="Mobile Number">
   <input id="password" class="input" type="password" placeholder="Password">
   <input id="password2" class="input" type="password" placeholder="Confirm Password">

   <button class="primary" onclick="signup()">Create Account</button>
   <button class="secondary" onclick="auth()">Back to Login</button>
  </div>
 </div>`;
}

async function login(){
 const email=$("email").value.trim();
 const password=$("password").value;

 if(!email||!password)return toast("Email + password required");

 const {error}=await SB.auth.signInWithPassword({email,password});

 if(error)return toast(error.message);

 ME=await getMe();
 await loadMyProfile();
 render();
}

async function signup(){
 const username=$("username").value.trim();
 const email=$("email").value.trim();
 const mobile=$("mobile").value.trim();
 const password=$("password").value;
 const password2=$("password2").value;

 if(!username||!email||!mobile||!password)
  return toast("All fields required");

 if(password!==password2)
  return toast("Passwords do not match");

 if(password.length<6)
  return toast("Password minimum 6 characters");

 const {data,error}=await SB.auth.signUp({
  email,
  password,
  options:{data:{username,mobile}}
 });

 if(error)return toast(error.message);

 if(data.session){
  ME=data.user;
  await loadMyProfile();
  render();
 }else{
  toast("Confirm your email first");
  auth();
 }
}

async function forgotPassword(){
 const email=prompt("Enter your email");
 if(!email)return;

 const {error}=await SB.auth.resetPasswordForEmail(email,{
  redirectTo:location.origin+location.pathname
 });

 if(error)return toast(error.message);
 toast("Reset email sent 📧");
}

async function logout(){
 await SB.auth.signOut();
 ME=null;
 MYPROFILE=null;
 auth();
}

function layout(){
 $("app").innerHTML=`
 <div class="top">
  <div class="logo2">PicFlow</div>

  <div class="topicons">
   <span onclick="searchPage()">⌕</span>
   <span onclick="notifications()">♡</span>
   <span onclick="inbox()">✈</span>
  </div>
 </div>

 <div id="page"></div>

 <div class="bottom">
  <div class="nav active" onclick="home()">⌂<small>Home</small></div>
  <div class="nav" onclick="searchPage()">⌕<small>Search</small></div>
  <div class="nav" onclick="createMenu()">＋<small>Create</small></div>
  <div class="nav" onclick="reels()">▶<small>Reels</small></div>
  <div class="nav" onclick="profile(ME.id)">◉<small>Profile</small></div>
 </div>`;
}

async function render(){
 if(!ME)return auth();
 layout();
 await home();
}

async function home(){
 const page=$("page");

 page.innerHTML=`
 <div class="stories" id="stories">
  <div class="story" onclick="storyCreate()">
   <div class="storyring">
    <img src="${avatar(MYPROFILE?.avatar_url,MYPROFILE?.username)}">
   </div>
   Your story
  </div>
 </div>

 <div class="create">
  <img class="avatar" src="${avatar(MYPROFILE?.avatar_url,MYPROFILE?.username)}">
  <div class="fakeinput" onclick="createMenu()">What's on your mind?</div>
  <button onclick="createMenu()" style="background:none;border:0;color:#fff;font-size:23px">📷</button>
 </div>

 <div id="feed"><div class="empty">Loading...</div></div>`;

 await stories();
 await feed();
}

async function stories(){
 const {data,error}=await SB.from("stories")
 .select("*")
 .gt("expires_at",new Date().toISOString())
 .order("created_at",{ascending:false})
 .limit(30);

 if(error)return;

 const box=$("stories");

 for(const s of data||[]){
  const {data:p}=await SB.from("profiles")
   .select("username,avatar_url")
   .eq("id",s.user_id)
   .maybeSingle();

  box.insertAdjacentHTML("beforeend",`
   <div class="story" onclick="viewStory('${esc(s.media_url)}')">
    <div class="storyring">
     <img src="${avatar(p?.avatar_url,p?.username)}">
    </div>
    ${esc(p?.username||"user")}
   </div>`);
 }
}

async function feed(){
 const box=$("feed");

 const {data,error}=await SB.from("posts")
 .select("*")
 .order("created_at",{ascending:false})
 .limit(50);

 if(error){
  console.error(error);
  box.innerHTML='<div class="empty">Unable to load posts</div>';
  return;
 }

 if(!data?.length){
  box.innerHTML='<div class="empty">No posts yet 🚀<br>Create your first post.</div>';
  return;
 }

 box.innerHTML="";

 for(const p of data){
  const {data:pr}=await SB.from("profiles")
   .select("username,avatar_url")
   .eq("id",p.user_id)
   .maybeSingle();

  const {count:likes}=await SB.from("likes")
   .select("*",{count:"exact",head:true})
   .eq("post_id",p.id);

  const {data:liked}=await SB.from("likes")
   .select("post_id")
   .eq("post_id",p.id)
   .eq("user_id",ME.id)
   .maybeSingle();

  const {count:comments}=await SB.from("comments")
   .select("*",{count:"exact",head:true})
   .eq("post_id",p.id);

  const {data:saved}=await SB.from("saved_posts")
   .select("post_id")
   .eq("post_id",p.id)
   .eq("user_id",ME.id)
   .maybeSingle();

  box.insertAdjacentHTML("beforeend",postCard(
   p,pr||{},likes||0,!!liked,comments||0,!!saved
  ));
 }
}

function postCard(p,pr,likes,liked,comments,saved){
 const media=p.media_type==="video"
 ? `<video class="postmedia" src="${esc(p.media_url)}" controls playsinline></video>`
 : `<img class="postmedia" src="${esc(p.media_url)}">`;

 return `
 <article class="post">
  <div class="posthead">
   <img class="avatar" src="${avatar(pr.avatar_url,pr.username)}"
    onclick="profile('${p.user_id}')">

   <div class="postuser" onclick="profile('${p.user_id}')">
    ${esc(pr.username||"user")}
   </div>

   <span>•••</span>
  </div>

  ${media}

  <div class="actions">
   <span class="action" onclick="like('${p.id}',this)">
    ${liked?"❤️":"♡"}
   </span>

   <span class="action" onclick="comments('${p.id}')">💬</span>

   <span class="action" onclick="share('${p.id}')">➤</span>

   <span class="action" onclick="save('${p.id}',this)" style="margin-left:auto">
    ${saved?"🔖":"🔖"}
   </span>
  </div>

  <div class="info">
   <div class="likes">${likes} likes</div>

   <div class="caption">
    <b>${esc(pr.username||"user")}</b>
    ${esc(p.caption||"")}
   </div>

   <div class="commentlink" onclick="comments('${p.id}')">
    View all ${comments} comments
   </div>
  </div>
 </article>`;
}

function createMenu(){
 modal(`
  <div class="title">Create</div>

  <div class="setting" onclick="postCreate()">
   <span>📸 Photo / Video Post</span><span>›</span>
  </div>

  <div class="setting" onclick="storyCreate()">
   <span>📖 Story</span><span>›</span>
  </div>

  <div class="setting" onclick="reelCreate()">
   <span>🎬 Reel</span><span>›</span>
  </div>
 `);
}

function postCreate(){
 modal(`
  <div class="title">Create Post</div>

  <input id="media" class="input" type="file"
   accept="image/*,video/*">

  <textarea id="caption" class="input"
   style="height:100px" placeholder="Write a caption..."></textarea>

  <button class="primary" onclick="uploadPost()">Share Post</button>
 `);
}

async function uploadPost(){
 const file=$("media")?.files?.[0];
 const caption=$("caption")?.value?.trim()||"";

 if(!file)return toast("Select image/video");

 if(file.size>50*1024*1024)
  return toast("Maximum 50MB");

 const path=ME.id+"/posts/"+Date.now()+"."+file.name.split(".").pop();

 toast("Uploading...");

 const {error}=await SB.storage.from("posts").upload(
  path,file,
  {upsert:false,contentType:file.type,cacheControl:"3600"}
 );

 if(error)return toast(error.message);

 const {data}=SB.storage.from("posts").getPublicUrl(path);

 const {error:db}=await SB.from("posts").insert({
  user_id:ME.id,
  media_url:data.publicUrl,
  media_type:file.type.startsWith("video")?"video":"image",
  caption
 });

 if(db)return toast(db.message);

 closeModal();
 toast("Post published 🎉");
 await home();
}

function storyCreate(){
 modal(`
  <div class="title">Add Story</div>

  <input id="storyFile" class="input" type="file"
   accept="image/*,video/*">

  <button class="primary" onclick="uploadStory()">Add Story</button>
 `);
}

async function uploadStory(){
 const file=$("storyFile")?.files?.[0];

 if(!file)return toast("Choose image/video");

 if(file.size>50*1024*1024)
  return toast("Maximum 50MB");

 const path=ME.id+"/stories/"+Date.now()+"."+file.name.split(".").pop();

 toast("Uploading story...");

 const {error}=await SB.storage.from("posts").upload(
  path,file,
  {upsert:false,contentType:file.type}
 );

 if(error)return toast(error.message);

 const {data}=SB.storage.from("posts").getPublicUrl(path);

 const {error:db}=await SB.from("stories").insert({
  user_id:ME.id,
  media_url:data.publicUrl,
  media_type:file.type.startsWith("video")?"video":"image",
  expires_at:new Date(Date.now()+24*60*60*1000).toISOString()
 });

 if(db)return toast(db.message);

 closeModal();
 toast("Story added 📖");
 await home();
}

function viewStory(url){
 modal(`
  <div class="title">Story</div>
  <img src="${esc(url)}" style="width:100%;max-height:70vh;object-fit:contain">
 `);
}

function reelCreate(){
 modal(`
  <div class="title">Create Reel 🎬</div>

  <input id="reelFile" class="input" type="file" accept="video/*">

  <textarea id="reelCaption" class="input"
   style="height:90px" placeholder="Caption"></textarea>

  <button class="primary" onclick="uploadReel()">Publish Reel</button>
 `);
}

async function uploadReel(){
 const file=$("reelFile")?.files?.[0];

 if(!file)return toast("Choose a video");

 if(!file.type.startsWith("video"))
  return toast("Video only");

 const path=ME.id+"/reels/"+Date.now()+"."+file.name.split(".").pop();

 toast("Uploading Reel...");

 const {error}=await SB.storage.from("posts").upload(
  path,file,
  {upsert:false,contentType:file.type}
 );

 if(error)return toast(error.message);

 const {data}=SB.storage.from("posts").getPublicUrl(path);

 const {error:db}=await SB.from("posts").insert({
  user_id:ME.id,
  media_url:data.publicUrl,
  media_type:"video",
  caption:$("reelCaption").value.trim()
 });

 if(db)return toast(db.message);

 closeModal();
 toast("Reel published 🎬");
 await home();
}

async function like(id,el){
 const {data:old}=await SB.from("likes")
 .select("*")
 .eq("post_id",id)
 .eq("user_id",ME.id)
 .maybeSingle();

 if(old){
  await SB.from("likes").delete()
   .eq("post_id",id).eq("user_id",ME.id);

  el.textContent="♡";
 }else{
  await SB.from("likes").insert({
   post_id:id,
   user_id:ME.id
  });

  el.textContent="❤️";
 }

 const {count}=await SB.from("likes")
 .select("*",{count:"exact",head:true})
 .eq("post_id",id);

 el.closest(".post").querySelector(".likes").textContent=(count||0)+" likes";
}

async function save(id,el){
 const {data:old}=await SB.from("saved_posts")
 .select("*")
 .eq("post_id",id)
 .eq("user_id",ME.id)
 .maybeSingle();

 if(old){
  await SB.from("saved_posts").delete()
   .eq("post_id",id).eq("user_id",ME.id);
  toast("Removed from Saved");
 }else{
  await SB.from("saved_posts").insert({
   post_id:id,user_id:ME.id
  });
  toast("Saved 🔖");
 }
}

async function comments(id){
 const {data,error}=await SB.from("comments")
 .select("*")
 .eq("post_id",id)
 .order("created_at",{ascending:true});

 if(error)return toast(error.message);

 let html=`<div class="title">Comments</div>`;

 for(const c of data||[]){
  const {data:p}=await SB.from("profiles")
   .select("username")
   .eq("id",c.user_id)
   .maybeSingle();

  html+=`
   <div class="person">
    <div class="personinfo">
     <b>${esc(p?.username||"user")}</b>
     <span>${esc(c.body)}</span>
    </div>
   </div>`;
 }

 html+=`
  <textarea id="comment" class="input"
   style="height:90px" placeholder="Write comment..."></textarea>

  <button class="primary" onclick="addComment('${id}')">
   Comment
  </button>`;

 modal(html);
}

async function addComment(id){
 const body=$("comment").value.trim();

 if(!body)return toast("Write something");

 const {error}=await SB.from("comments").insert({
  post_id:id,
  user_id:ME.id,
  body
 });

 if(error)return toast(error.message);

 toast("Comment added 💬");
 comments(id);
}

async function share(id){
 const url=location.origin+location.pathname+"?post="+id;

 try{
  if(navigator.share){
   await navigator.share({title:"PicFlow",url});
  }else{
   await navigator.clipboard.writeText(url);
   toast("Link copied 📤");
  }
 }catch(e){}
}

async function searchPage(){
 modal(`
  <div class="title">Search Users</div>

  <input id="search" class="input"
   placeholder="Search username..."
   oninput="searchUsers()">

  <div id="results"></div>
 `);
}

let searchDelay;

async function searchUsers(){
 clearTimeout(searchDelay);

 searchDelay=setTimeout(async()=>{
  const q=$("search").value.trim();

  if(!q){
   $("results").innerHTML="";
   return;
  }

  const {data,error}=await SB.from("profiles")
   .select("*")
   .ilike("username","%"+q+"%")
   .neq("id",ME.id)
   .limit(30);

  if(error)return toast(error.message);

  $("results").innerHTML="";

  for(const p of data||[]){
   const {data:f}=await SB.from("follows")
    .select("*")
    .eq("follower_id",ME.id)
    .eq("following_id",p.id)
    .maybeSingle();

   $("results").insertAdjacentHTML("beforeend",`
    <div class="person">
     <img class="avatar" src="${avatar(p.avatar_url,p.username)}">

     <div class="personinfo" onclick="profile('${p.id}')">
      <b>${esc(p.username)}</b>
      <span>${esc(p.bio||"PicFlow user")}</span>
     </div>

     <button class="follow ${f?"following":""}"
      onclick="follow('${p.id}',this)">
      ${f?"Following":"Follow"}
     </button>
    </div>`);
  }

  if(!data?.length)
   $("results").innerHTML='<div class="empty">No users found</div>';
 },250);
}

async function follow(uid,btn){
 const {data:old}=await SB.from("follows")
 .select("*")
 .eq("follower_id",ME.id)
 .eq("following_id",uid)
 .maybeSingle();

 if(old){
  await SB.from("follows").delete()
   .eq("follower_id",ME.id)
   .eq("following_id",uid);

  btn.textContent="Follow";
  btn.classList.remove("following");
 }else{
  await SB.from("follows").insert({
   follower_id:ME.id,
   following_id:uid
  });

  btn.textContent="Following";
  btn.classList.add("following");
 }
}

async function profile(uid){
 const {data:p,error}=await SB.from("profiles")
 .select("*").eq("id",uid).maybeSingle();

 if(error||!p)return toast("Profile not found");

 const {count:followers}=await SB.from("follows")
 .select("*",{count:"exact",head:true})
 .eq("following_id",uid);

 const {count:following}=await SB.from("follows")
 .select("*",{count:"exact",head:true})
 .eq("follower_id",uid);

 const {data:posts}=await SB.from("posts")
 .select("*")
 .eq("user_id",uid)
 .order("created_at",{ascending:false});

 let followButton="";

 if(uid===ME.id){
  followButton=`<button class="secondary" onclick="editProfile()">✏️ Edit Profile</button>`;
 }else{
  const {data:f}=await SB.from("follows")
   .select("*")
   .eq("follower_id",ME.id)
   .eq("following_id",uid)
   .maybeSingle();

  followButton=`
   <button id="profileFollow" class="follow ${f?"following":""}"
    onclick="follow('${uid}',this)">
    ${f?"Following":"Follow"}
   </button>

   <button class="secondary" onclick="openChat('${uid}')">
    💬 Message
   </button>`;
 }

 let grid="";

 for(const p2 of posts||[]){
  grid+=p2.media_type==="video"
   ? `<video src="${esc(p2.media_url)}" controls></video>`
   : `<img src="${esc(p2.media_url)}">`;
 }

 modal(`
  <div class="title">Profile</div>

  <div class="profilehead">
   <img class="bigavatar" src="${avatar(p.avatar_url,p.username)}">

   <div class="stats">
    <div><b>${posts?.length||0}</b><span>Posts</span></div>
    <div onclick="followersList('${uid}','followers')">
     <b>${followers||0}</b><span>Followers</span>
    </div>
    <div onclick="followersList('${uid}','following')">
     <b>${following||0}</b><span>Following</span>
    </div>
   </div>
  </div>

  <b style="font-size:20px">${esc(p.username)}</b>

  <div style="color:#aaa;margin:7px 0 15px">
   ${esc(p.bio||"")}
  </div>

  ${followButton}

  <div class="grid">${grid||"<div class='empty'>No posts</div>"}</div>
 `);
}

async function editProfile(){
 const {data:p}=await SB.from("profiles")
 .select("*").eq("id",ME.id).maybeSingle();

 modal(`
  <div class="title">Edit Profile</div>

  <img id="editAvatar" class="bigavatar"
   src="${avatar(p?.avatar_url,p?.username)}">

  <input id="avatarFile" class="input"
   type="file" accept="image/*">

  <input id="newUsername" class="input"
   value="${esc(p?.username||"")}" placeholder="Username">

  <textarea id="newBio" class="input"
   style="height:100px"
   placeholder="Bio">${esc(p?.bio||"")}</textarea>

  <button class="primary" onclick="saveProfile()">Save Profile</button>
 `);
}

async function saveProfile(){
 const username=$("newUsername").value.trim();
 const bio=$("newBio").value.trim();
 const file=$("avatarFile").files[0];

 if(!username)return toast("Username required");

 let avatarUrl=MYPROFILE.avatar_url;

 if(file){
  if(file.size>6*1024*1024)
   return toast("DP maximum 6MB");

  const path=ME.id+"/avatars/"+Date.now()+"."+file.name.split(".").pop();

  const {error}=await SB.storage.from("avatars").upload(
   path,file,{upsert:false,contentType:file.type}
  );

  if(error)return toast(error.message);

  const {data}=SB.storage.from("avatars").getPublicUrl(path);
  avatarUrl=data.publicUrl;
 }

 const {error}=await SB.from("profiles").update({
  username,
  bio,
  avatar_url:avatarUrl,
  updated_at:new Date().toISOString()
 }).eq("id",ME.id);

 if(error)return toast(error.message);

 await loadMyProfile();
 closeModal();
 toast("Profile updated ✅");
 await home();
}

async function followersList(uid,type){
 const column=type==="followers"?"following_id":"follower_id";
 const target=type==="followers"?"follower_id":"following_id";

 const {data:rows}=await SB.from("follows")
  .select("*").eq(column,uid);

 let html=`<div class="title">${type==="followers"?"Followers":"Following"}</div>`;

 for(const r of rows||[]){
  const id=r[target];

  const {data:p}=await SB.from("profiles")
   .select("*").eq("id",id).maybeSingle();

  if(p){
   html+=`
    <div class="person">
     <img class="avatar" src="${avatar(p.avatar_url,p.username)}">
     <div class="personinfo"><b>${esc(p.username)}</b></div>
     <button class="follow" onclick="profile('${p.id}')">View</button>
    </div>`;
  }
 }

 modal(html);
}

async function saved(){
 const {data:rows}=await SB.from("saved_posts")
  .select("post_id")
  .eq("user_id",ME.id);

 if(!rows?.length)
  return modal(`
   <div class="title">Saved</div>
   <div class="empty">No saved posts 🔖</div>`);

 const ids=rows.map(x=>x.post_id);

 const {data}=await SB.from("posts")
  .select("*").in("id",ids)
  .order("created_at",{ascending:false});

 let grid="";

 for(const p of data||[]){
  grid+=p.media_type==="video"
   ? `<video src="${esc(p.media_url)}" controls></video>`
   : `<img src="${esc(p.media_url)}">`;
 }

 modal(`
  <div class="title">Saved 🔖</div>
  <div class="grid">${grid}</div>
 `);
}

async function reels(){
 const {data}=await SB.from("posts")
  .select("*")
  .eq("media_type","video")
  .order("created_at",{ascending:false})
  .limit(50);

 $("page").innerHTML=`
  <div style="padding:15px">
   <div class="title">🎬 Reels</div>

   ${(data||[]).map(p=>`
    <div class="post">
     <video class="postmedia" src="${esc(p.media_url)}"
      controls playsinline loop></video>
     <div class="info">${esc(p.caption||"")}</div>
    </div>
   `).join("")||'<div class="empty">No Reels yet</div>'}
  </div>`;
}

async function notifications(){
 const {data,error}=await SB.from("notifications")
  .select("*")
  .eq("user_id",ME.id)
  .order("created_at",{ascending:false})
  .limit(50);

 if(error)return toast(error.message);

 let html='<div class="title">Notifications 🔔</div>';

 for(const n of data||[]){
  html+=`
   <div class="person">
    <div style="font-size:25px">🔔</div>
    <div class="personinfo">
     <b>${esc(n.message||"New activity")}</b>
     <span>${new Date(n.created_at).toLocaleString()}</span>
    </div>
   </div>`;
 }

 if(!data?.length)
  html+='<div class="empty">No notifications yet</div>';

 modal(html);
}

async function inbox(){
 const {data:rows,error}=await SB.from("messages")
  .select("*")
  .or(`sender_id.eq.${ME.id},receiver_id.eq.${ME.id}`)
  .order("created_at",{ascending:false})
  .limit(100);

 if(error)return toast(error.message);

 const people={};

 for(const m of rows||[]){
  const id=m.sender_id===ME.id?m.receiver_id:m.sender_id;
  if(!people[id])people[id]=m;
 }

 let html='<div class="title">Messages 💬</div>';

 for(const id of Object.keys(people)){
  const {data:p}=await SB.from("profiles")
   .select("*").eq("id",id).maybeSingle();

  if(p){
   html+=`
    <div class="person" onclick="openChat('${id}')">
     <img class="avatar" src="${avatar(p.avatar_url,p.username)}">
     <div class="personinfo">
      <b>${esc(p.username)}</b>
      <span>Open conversation</span>
     </div>
     <span>›</span>
    </div>`;
  }
 }

 if(!Object.keys(people).length)
  html+='<div class="empty">No conversations yet.<br>Search a user and tap Message.</div>';

 modal(html);
}

async function openChat(uid){
 const {data:p}=await SB.from("profiles")
  .select("*").eq("id",uid).maybeSingle();

 if(!p)return toast("User not found");

 const load=async()=>{
  const {data:msgs}=await SB.from("messages")
   .select("*")
   .or(
    `and(sender_id.eq.${ME.id},receiver_id.eq.${uid}),and(sender_id.eq.${uid},receiver_id.eq.${ME.id})`
   )
   .order("created_at",{ascending:true});

  const box=$("chatbox");
  if(!box)return;

  box.innerHTML=(msgs||[]).map(m=>`
   <div class="bubble ${m.sender_id===ME.id?"me":""}">
    ${esc(m.body)}
   </div>`).join("")||'<div class="empty">Start the conversation 👋</div>';

  box.scrollTop=box.scrollHeight;
 };

 modal(`
  <div class="title">💬 ${esc(p.username)}</div>

  <div id="chatbox" class="chat"></div>

  <div class="chatbar">
   <input id="messageText" class="input" placeholder="Message...">
   <button onclick="sendMessage('${uid}')">➤</button>
  </div>
 `);

 await load();
}

async function sendMessage(uid){
 const body=$("messageText").value.trim();

 if(!body)return;

 const {error}=await SB.from("messages").insert({
  sender_id:ME.id,
  receiver_id:uid,
  body
 });

 if(error)return toast(error.message);

 $("messageText").value="";

 const box=$("chatbox");

 const {data:msgs}=await SB.from("messages")
  .select("*")
  .or(
   `and(sender_id.eq.${ME.id},receiver_id.eq.${uid}),and(sender_id.eq.${uid},receiver_id.eq.${ME.id})`
  )
  .order("created_at",{ascending:true});

 box.innerHTML=(msgs||[]).map(m=>`
  <div class="bubble ${m.sender_id===ME.id?"me":""}">
   ${esc(m.body)}
  </div>`).join("");

 box.scrollTop=box.scrollHeight;
}

function settings(){
 modal(`
  <div class="title">Settings ⚙️</div>

  <div class="setting" onclick="editProfile()">
   <span>Edit Profile</span><span>✏️</span>
  </div>

  <div class="setting" onclick="saved()">
   <span>Saved</span><span>🔖</span>
  </div>

  <div class="setting">
   <span>Privacy</span><span>🔒</span>
  </div>

  <div class="setting">
   <span>Notifications</span><span>🔔</span>
  </div>

  <div class="setting" onclick="logout()">
   <span>Logout</span><span>🚪</span>
  </div>
 `);
}

function moreMenu(){
 modal(`
  <div class="title">PicFlow</div>

  <div class="setting" onclick="saved()">
   <span>🔖 Saved</span><span>›</span>
  </div>

  <div class="setting" onclick="notifications()">
   <span>🔔 Notifications</span><span>›</span>
  </div>

  <div class="setting" onclick="inbox()">
   <span>💬 Messages</span><span>›</span>
  </div>

  <div class="setting" onclick="settings()">
   <span>⚙️ Settings</span><span>›</span>
  </div>

  <div class="setting" onclick="logout()">
   <span>🚪 Logout</span><span>›</span>
  </div>
 `);
}

SB.auth.onAuthStateChange(async(event,session)=>{
 if(session){
  ME=session.user;
  await loadMyProfile();

  if(!$("page"))render();
 }else{
  ME=null;
  MYPROFILE=null;
  auth();
 }
});

(async()=>{
 ME=await getMe();

 if(ME){
  await loadMyProfile();
  render();
 }else{
  auth();
 }
})();
