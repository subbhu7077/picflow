/* =========================================================
   PICFLOW MONSTER ENGINE
   ONE MASTER SOCIAL SYSTEM
   ========================================================= */

(function(){

"use strict";

if(window.picflowMonsterLoaded)return;
window.picflowMonsterLoaded=true;

const SB=window.supabase.createClient(
  window.SUPABASE_URL,
  window.SUPABASE_PUBLISHABLE_KEY
);


/* ================= HELPERS ================= */

async function me(){
  const r=await SB.auth.getUser();
  return r.data?.user||null;
}

function esc(x){
  return String(x||"")
    .replace(/&/g,"&amp;")
    .replace(/</g,"&lt;")
    .replace(/>/g,"&gt;")
    .replace(/"/g,"&quot;")
    .replace(/'/g,"&#039;");
}

async function getProfile(id){
  const r=await SB
    .from("profiles")
    .select("id,username,bio,avatar_url")
    .eq("id",id)
    .maybeSingle();

  return r.data||{};
}

function avatar(p,size=48){

  if(p.avatar_url){
    return `
      <img src="${esc(p.avatar_url)}"
        style="
          width:${size}px;
          height:${size}px;
          border-radius:50%;
          object-fit:cover;
        ">
    `;
  }

  return `
    <div style="
      width:${size}px;
      height:${size}px;
      border-radius:50%;
      background:#111;
      color:#fff;
      display:flex;
      align-items:center;
      justify-content:center;
      font-weight:800;
      font-size:${Math.round(size*.42)}px;
    ">
      ${esc((p.username||"U")[0].toUpperCase())}
    </div>
  `;
}

function remove(id){
  document.getElementById(id)?.remove();
}


/* =========================================================
   UNIVERSAL MODAL
   ========================================================= */

function modal(id,html){

  remove(id);

  const x=document.createElement("div");

  x.id=id;

  x.innerHTML=html;

  document.body.appendChild(x);

  return x;
}


/* =========================================================
   FEED
   ========================================================= */

async function loadFeed(){

  const main=document.querySelector("#mainApp main");

  if(!main)return;

  main.innerHTML=`
    <div id="monsterFeed">
      <div style="
        text-align:center;
        padding:60px;
      ">
        Loading PicFlow... ⏳
      </div>
    </div>
  `;

  const feed=document.getElementById("monsterFeed");

  const r=await SB
    .from("posts")
    .select("id,user_id,image_url,caption,created_at")
    .order("created_at",{ascending:false})
    .limit(50);

  if(r.error){

    feed.innerHTML=`
      <div style="padding:40px;text-align:center">
        ❌ Feed error
        <br><br>
        ${esc(r.error.message)}
      </div>
    `;

    return;
  }

  if(!r.data?.length){

    feed.innerHTML=`
      <div style="
        text-align:center;
        padding:70px 20px;
      ">
        <div style="font-size:60px">📸</div>
        <h2>No posts yet</h2>
        <p>Create your first post.</p>
      </div>
    `;

    return;
  }

  feed.innerHTML="";

  for(const post of r.data){

    const p=await getProfile(post.user_id);

    const card=document.createElement("article");

    card.dataset.postId=post.id;

    card.style.cssText=`
      background:#fff;
      margin-bottom:8px;
      border-bottom:1px solid #eee;
    `;

    card.innerHTML=`

      <div style="
        display:flex;
        align-items:center;
        gap:12px;
        padding:13px;
      ">

        <div class="monster-user"
          style="cursor:pointer">
          ${avatar(p,46)}
        </div>

        <div
          class="monster-user-name"
          style="font-weight:800;cursor:pointer"
        >
          ${esc(p.username||"User")}
        </div>

      </div>


      <img
        src="${esc(post.image_url)}"
        loading="lazy"
        style="
          width:100%;
          max-height:650px;
          object-fit:cover;
          display:block;
          background:#eee;
        "
      >


      <div style="padding:12px 15px">

        <div style="
          display:flex;
          align-items:center;
          gap:18px;
          font-size:26px;
        ">

          <button class="m-like"
            style="border:0;background:none;font-size:28px">
            ♡
          </button>

          <button class="m-comment"
            style="border:0;background:none;font-size:25px">
            💬
          </button>

          <button class="m-share"
            style="border:0;background:none;font-size:25px">
            ✈
          </button>

          <button class="m-save"
            style="
              border:0;
              background:none;
              font-size:24px;
              margin-left:auto;
            ">
            🔖
          </button>

        </div>

        <div class="m-likes"
          style="font-weight:800;margin-top:7px">
          0 likes
        </div>

        <div style="margin-top:7px">
          <strong>${esc(p.username||"User")}</strong>
          ${post.caption?" "+esc(post.caption):""}
        </div>

      </div>
    `;

    feed.appendChild(card);

    card.querySelectorAll(".monster-user,.monster-user-name")
      .forEach(x=>{
        x.onclick=()=>openProfile(post.user_id);
      });

    card.querySelector(".m-like").onclick=
      ()=>like(post.id,card);

    card.querySelector(".m-comment").onclick=
      ()=>comments(post.id);

    card.querySelector(".m-share").onclick=
      ()=>share(post);

    card.querySelector(".m-save").onclick=
      ()=>save(post.id,card);

    await refreshState(post.id,card);
  }
}


/* =========================================================
   LIKE
   ========================================================= */

async function like(postId,card){

  const u=await me();

  if(!u){
    alert("Login first.");
    return;
  }

  const q=await SB
    .from("likes")
    .select("post_id")
    .eq("user_id",u.id)
    .eq("post_id",postId)
    .maybeSingle();

  if(q.data){

    await SB
      .from("likes")
      .delete()
      .eq("user_id",u.id)
      .eq("post_id",postId);

  }else{

    await SB
      .from("likes")
      .insert({
        user_id:u.id,
        post_id:postId
      });
  }

  await refreshState(postId,card);
}


async function refreshState(postId,card){

  const count=await SB
    .from("likes")
    .select("*",{count:"exact",head:true})
    .eq("post_id",postId);

  card.querySelector(".m-likes")
    .textContent=(count.count||0)+" likes";

  const u=await me();

  if(!u)return;

  const l=await SB
    .from("likes")
    .select("post_id")
    .eq("user_id",u.id)
    .eq("post_id",postId)
    .maybeSingle();

  card.querySelector(".m-like")
    .textContent=l.data?"♥":"♡";

  const s=await SB
    .from("saved_posts")
    .select("post_id")
    .eq("user_id",u.id)
    .eq("post_id",postId)
    .maybeSingle();

  card.querySelector(".m-save")
    .textContent=s.data?"📌":"🔖";
}


/* =========================================================
   SAVE
   ========================================================= */

async function save(postId,card){

  const u=await me();

  if(!u){
    alert("Login first.");
    return;
  }

  const q=await SB
    .from("saved_posts")
    .select("post_id")
    .eq("user_id",u.id)
    .eq("post_id",postId)
    .maybeSingle();

  if(q.data){

    await SB
      .from("saved_posts")
      .delete()
      .eq("user_id",u.id)
      .eq("post_id",postId);

  }else{

    await SB
      .from("saved_posts")
      .insert({
        user_id:u.id,
        post_id:postId
      });
  }

  await refreshState(postId,card);
}


/* =========================================================
   COMMENTS
   NO PROFILES JOIN = NO SCHEMA CACHE ERROR
   ========================================================= */

async function comments(postId){

  const box=modal("monsterComments",`
    <div style="
      position:fixed;
      inset:0;
      z-index:999999;
      background:rgba(0,0,0,.65);
      display:flex;
      align-items:flex-end;
    ">

      <div style="
        width:100%;
        max-height:82vh;
        background:white;
        border-radius:25px 25px 0 0;
        overflow:auto;
      ">

        <div style="
          padding:17px;
          display:flex;
          justify-content:space-between;
          border-bottom:1px solid #eee;
        ">
          <strong>Comments</strong>

          <button id="mCloseComment"
            style="
              border:0;
              background:#eee;
              width:40px;
              height:40px;
              border-radius:50%;
              font-size:23px;
            ">
            ×
          </button>
        </div>

        <div id="mCommentList"
          style="padding:15px">
          Loading...
        </div>

        <div style="
          display:flex;
          gap:8px;
          padding:12px;
          position:sticky;
          bottom:0;
          background:white;
          border-top:1px solid #eee;
        ">

          <input
            id="mCommentInput"
            placeholder="Write a comment..."
            style="
              flex:1;
              border:1px solid #ddd;
              border-radius:22px;
              padding:13px;
            "
          >

          <button id="mCommentSend"
            style="
              border:0;
              background:#111;
              color:#fff;
              border-radius:22px;
              padding:0 18px;
            ">
            Send
          </button>

        </div>

      </div>
    </div>
  `);

  box.querySelector("#mCloseComment").onclick=
    ()=>box.remove();

  const list=box.querySelector("#mCommentList");

  const r=await SB
    .from("comments")
    .select("id,user_id,comment,created_at")
    .eq("post_id",postId)
    .order("created_at",{ascending:true});

  if(r.error){

    list.innerHTML=`
      <div style="padding:30px;text-align:center">
        ❌ ${esc(r.error.message)}
      </div>
    `;

  }else if(!r.data.length){

    list.innerHTML=`
      <div style="
        padding:40px;
        text-align:center;
        color:#777
      ">
        No comments yet 💬
      </div>
    `;

  }else{

    list.innerHTML="";

    for(const c of r.data){

      const p=await getProfile(c.user_id);

      const item=document.createElement("div");

      item.style.cssText=`
        display:flex;
        gap:10px;
        padding:12px 0;
        border-bottom:1px solid #eee;
      `;

      item.innerHTML=`
        ${avatar(p,40)}

        <div>
          <strong>${esc(p.username||"User")}</strong>
          <div>${esc(c.comment)}</div>
        </div>
      `;

      list.appendChild(item);
    }
  }

  box.querySelector("#mCommentSend").onclick=
    async()=>{

      const u=await me();

      if(!u){
        alert("Login first.");
        return;
      }

      const input=box.querySelector("#mCommentInput");

      const text=input.value.trim();

      if(!text)return;

      const r=await SB
        .from("comments")
        .insert({
          user_id:u.id,
          post_id:postId,
          comment:text
        });

      if(r.error){
        alert(r.error.message);
        return;
      }

      box.remove();

      comments(postId);
    };
}


/* =========================================================
   SHARE
   ========================================================= */

async function share(post){

  const url=
    location.origin+
    location.pathname+
    "?post="+encodeURIComponent(post.id);

  if(navigator.share){

    try{
      await navigator.share({
        title:"PicFlow",
        text:post.caption||"Check this post!",
        url
      });

      return;
    }catch(e){}
  }

  try{

    await navigator.clipboard.writeText(url);

    alert("Post link copied 🔗");

  }catch(e){

    alert(url);
  }
}


/* =========================================================
   CREATE POST
   ========================================================= */

async function create(){

  const u=await me();

  if(!u){
    alert("Login first.");
    return;
  }

  const input=document.createElement("input");

  input.type="file";
  input.accept="image/*";

  input.onchange=async()=>{

    const file=input.files?.[0];

    if(!file)return;

    if(!file.type.startsWith("image/")){
      alert("Select an image.");
      return;
    }

    if(file.size>10*1024*1024){
      alert("Maximum 10 MB.");
      return;
    }

    const caption=
      prompt("Caption (optional):")||"";

    const ext=
      (file.name.split(".").pop()||"jpg")
      .toLowerCase()
      .replace(/[^a-z0-9]/g,"")||"jpg";

    const path=
      u.id+"/"+Date.now()+"."+ext;

    const upload=
      await SB.storage
        .from("posts")
        .upload(path,file,{
          cacheControl:"3600",
          contentType:file.type,
          upsert:false
        });

    if(upload.error){

      alert(
        "Upload failed:\n\n"+
        upload.error.message
      );

      return;
    }

    const url=
      SB.storage
        .from("posts")
        .getPublicUrl(path)
        .data.publicUrl;

    const r=
      await SB
        .from("posts")
        .insert({
          user_id:u.id,
          image_url:url,
          caption
        });

    if(r.error){

      alert(
        "Post save failed:\n\n"+
        r.error.message
      );

      return;
    }

    alert("Post published 🎉");

    loadFeed();
  };

  input.click();
}


/* =========================================================
   PROFILE
   ========================================================= */

async function openProfile(id){

  const p=await getProfile(id);

  if(!p.id){
    alert("User not found.");
    return;
  }

  const followers=await SB
    .from("follows")
    .select("*",{count:"exact",head:true})
    .eq("following_id",id);

  const following=await SB
    .from("follows")
    .select("*",{count:"exact",head:true})
    .eq("follower_id",id);

  const posts=await SB
    .from("posts")
    .select("id,image_url,caption")
    .eq("user_id",id)
    .order("created_at",{ascending:false});

  const u=await me();

  let followingMe=false;

  if(u && u.id!==id){

    const q=await SB
      .from("follows")
      .select("follower_id")
      .eq("follower_id",u.id)
      .eq("following_id",id)
      .maybeSingle();

    followingMe=!!q.data;
  }

  const box=modal("monsterProfile",`
    <div style="
      position:fixed;
      inset:0;
      z-index:999998;
      background:rgba(0,0,0,.7);
      display:flex;
      align-items:flex-end;
    ">

      <div style="
        width:100%;
        max-height:92vh;
        overflow:auto;
        background:#fff;
        border-radius:28px 28px 0 0;
      ">

        <div style="
          padding:17px 20px;
          display:flex;
          justify-content:space-between;
          border-bottom:1px solid #eee;
        ">

          <strong style="font-size:20px">
            ${esc(p.username)}
          </strong>

          <button id="mProfileClose"
            style="
              border:0;
              background:#eee;
              border-radius:50%;
              width:40px;
              height:40px;
              font-size:23px;
            ">
            ×
          </button>

        </div>


        <div style="padding:25px 20px">

          <div style="
            display:flex;
            align-items:center;
            gap:20px;
          ">

            ${avatar(p,95)}

            <div style="
              flex:1;
              display:flex;
              justify-content:space-around;
              text-align:center;
            ">

              <div>
                <strong>${posts.data?.length||0}</strong>
                <small style="display:block">Posts</small>
              </div>

              <button id="mFollowers"
                style="
                  border:0;
                  background:none;
                  font:inherit;
                ">
                <strong>${followers.count||0}</strong>
                <small style="display:block">Followers</small>
              </button>

              <button id="mFollowing"
                style="
                  border:0;
                  background:none;
                  font:inherit;
                ">
                <strong>${following.count||0}</strong>
                <small style="display:block">Following</small>
              </button>

            </div>
          </div>


          <h2>${esc(p.username)}</h2>

          <p style="color:#777">
            ${esc(p.bio||"Welcome to PicFlow ✨")}
          </p>

          ${
            u && u.id!==id
            ?`
              <button id="mFollow"
                style="
                  width:100%;
                  padding:14px;
                  border:0;
                  border-radius:15px;
                  background:${followingMe?"#eee":"#111"};
                  color:${followingMe?"#111":"#fff"};
                  font-weight:800;
                  font-size:16px;
                ">
                ${followingMe?"Following":"Follow"}
              </button>
            `
            :""
          }


          <h3 style="
            margin-top:30px;
            border-top:1px solid #eee;
            padding-top:20px;
          ">
            Posts
          </h3>

          <div id="mProfileGrid"
            style="
              display:grid;
              grid-template-columns:repeat(3,1fr);
              gap:3px;
            ">
          </div>

        </div>
      </div>
    </div>
  `);

  box.querySelector("#mProfileClose").onclick=
    ()=>box.remove();

  const grid=box.querySelector("#mProfileGrid");

  if(!posts.data?.length){

    grid.innerHTML=`
      <div style="
        grid-column:1/-1;
        text-align:center;
        padding:50px;
        color:#777;
      ">
        No posts yet 📸
      </div>
    `;

  }else{

    posts.data.forEach(post=>{

      const img=document.createElement("img");

      img.src=post.image_url;

      img.style.cssText=`
        width:100%;
        aspect-ratio:1;
        object-fit:cover;
      `;

      grid.appendChild(img);
    });
  }


  if(u && u.id!==id){

    let state=followingMe;

    box.querySelector("#mFollow").onclick=
      async()=>{

        const btn=box.querySelector("#mFollow");

        btn.disabled=true;

        if(state){

          await SB
            .from("follows")
            .delete()
            .eq("follower_id",u.id)
            .eq("following_id",id);

        }else{

          const r=await SB
            .from("follows")
            .insert({
              follower_id:u.id,
              following_id:id
            });

          if(r.error){
            alert(r.error.message);
            btn.disabled=false;
            return;
          }
        }

        state=!state;

        btn.textContent=
          state?"Following":"Follow";

        btn.style.background=
          state?"#eee":"#111";

        btn.style.color=
          state?"#111":"#fff";

        btn.disabled=false;
      };
  }


  box.querySelector("#mFollowers").onclick=
    ()=>followList(id,"followers");

  box.querySelector("#mFollowing").onclick=
    ()=>followList(id,"following");
}


/* =========================================================
   FOLLOW LIST
   ========================================================= */

async function followList(id,type){

  const column=
    type==="followers"
    ?"following_id"
    :"follower_id";

  const target=
    type==="followers"
    ?"follower_id"
    :"following_id";

  const r=await SB
    .from("follows")
    .select("follower_id,following_id")
    .eq(column,id);

  if(r.error){
    alert(r.error.message);
    return;
  }

  const box=modal("monsterFollowList",`
    <div style="
      position:fixed;
      inset:0;
      z-index:999999;
      background:rgba(0,0,0,.65);
      display:flex;
      align-items:flex-end;
    ">

      <div style="
        width:100%;
        max-height:80vh;
        overflow:auto;
        background:white;
        border-radius:25px 25px 0 0;
      ">

        <div style="
          padding:17px;
          display:flex;
          justify-content:space-between;
          border-bottom:1px solid #eee;
        ">
          <strong>
            ${type==="followers"?"Followers":"Following"}
          </strong>

          <button id="mListClose"
            style="
              border:0;
              background:#eee;
              border-radius:50%;
              width:40px;
              height:40px;
              font-size:23px;
            ">
            ×
          </button>
        </div>

        <div id="mListUsers"
          style="padding:10px 18px">
        </div>

      </div>
    </div>
  `);

  box.querySelector("#mListClose").onclick=
    ()=>box.remove();

  const list=box.querySelector("#mListUsers");

  if(!r.data?.length){

    list.innerHTML=`
      <div style="
        padding:50px;
        text-align:center;
        color:#777;
      ">
        No users yet.
      </div>
    `;

    return;
  }

  for(const row of r.data){

    const p=await getProfile(row[target]);

    const item=document.createElement("div");

    item.style.cssText=`
      display:flex;
      align-items:center;
      gap:12px;
      padding:14px 5px;
      border-bottom:1px solid #eee;
      cursor:pointer;
    `;

    item.innerHTML=`
      ${avatar(p,50)}

      <div style="flex:1">
        <strong>${esc(p.username||"User")}</strong>
        <small style="
          display:block;
          color:#888;
        ">
          ${esc(p.bio||"")}
        </small>
      </div>

      <span style="font-size:25px">›</span>
    `;

    item.onclick=()=>{
      box.remove();
      openProfile(p.id);
    };

    list.appendChild(item);
  }
}


/* =========================================================
   SEARCH
   ========================================================= */

async function search(){

  const box=modal("monsterSearch",`
    <div style="
      position:fixed;
      inset:0;
      z-index:999997;
      background:white;
      overflow:auto;
    ">

      <div style="
        padding:18px;
        display:flex;
        gap:8px;
      ">

        <input id="mSearchInput"
          placeholder="Search people..."
          style="
            flex:1;
            padding:14px 18px;
            border:1px solid #ddd;
            border-radius:25px;
            font-size:16px;
          ">

        <button id="mSearchClose"
          style="
            border:0;
            background:#eee;
            border-radius:50%;
            width:43px;
            height:43px;
            font-size:22px;
          ">
          ×
        </button>

      </div>

      <div id="mSearchResults"
        style="padding:5px 18px">
        Type a username 🔍
      </div>

    </div>
  `);

  box.querySelector("#mSearchClose").onclick=
    ()=>box.remove();

  const input=box.querySelector("#mSearchInput");

  let timer;

  input.oninput=()=>{

    clearTimeout(timer);

    timer=setTimeout(
      ()=>searchUsers(input.value),
      300
    );
  };

  input.focus();
}


async function searchUsers(text){

  const list=document.getElementById("mSearchResults");

  if(!list)return;

  text=text.trim();

  if(!text){

    list.innerHTML="Type a username 🔍";
    return;
  }

  const r=await SB
    .from("profiles")
    .select("id,username,bio,avatar_url")
    .ilike("username","%"+text+"%")
    .limit(30);

  if(r.error){

    list.innerHTML=esc(r.error.message);
    return;
  }

  list.innerHTML="";

  if(!r.data.length){

    list.innerHTML=`
      <div style="
        text-align:center;
        padding:50px;
        color:#777;
      ">
        No users found.
      </div>
    `;

    return;
  }

  r.data.forEach(p=>{

    const item=document.createElement("div");

    item.style.cssText=`
      display:flex;
      align-items:center;
      gap:12px;
      padding:14px 5px;
      border-bottom:1px solid #eee;
      cursor:pointer;
    `;

    item.innerHTML=`
      ${avatar(p,52)}

      <div style="flex:1">
        <strong>${esc(p.username)}</strong>
        <small style="
          display:block;
          color:#888;
        ">
          ${esc(p.bio||"")}
        </small>
      </div>

      <span style="font-size:25px">›</span>
    `;

    item.onclick=()=>{

      remove("monsterSearch");

      openProfile(p.id);
    };

    list.appendChild(item);
  });
}


/* =========================================================
   SAVED POSTS
   ========================================================= */

async function saved(){

  const u=await me();

  if(!u){
    alert("Login first.");
    return;
  }

  const r=await SB
    .from("saved_posts")
    .select("post_id")
    .eq("user_id",u.id);

  if(r.error){
    alert(r.error.message);
    return;
  }

  const ids=(r.data||[]).map(x=>x.post_id);

  const box=modal("monsterSaved",`
    <div style="
      position:fixed;
      inset:0;
      z-index:999999;
      background:white;
      overflow:auto;
    ">

      <div style="
        padding:18px;
        display:flex;
        justify-content:space-between;
        border-bottom:1px solid #eee;
      ">
        <strong>🔖 Saved Posts</strong>

        <button id="mSavedClose"
          style="
            border:0;
            background:#eee;
            border-radius:50%;
            width:40px;
            height:40px;
            font-size:23px;
          ">
          ×
        </button>
      </div>

      <div id="mSavedGrid"
        style="
          display:grid;
          grid-template-columns:repeat(3,1fr);
          gap:3px;
        ">
      </div>

    </div>
  `);

  box.querySelector("#mSavedClose").onclick=
    ()=>box.remove();

  const grid=box.querySelector("#mSavedGrid");

  if(!ids.length){

    grid.innerHTML=`
      <div style="
        grid-column:1/-1;
        text-align:center;
        padding:70px;
        color:#777;
      ">
        <div style="font-size:55px">🔖</div>
        No saved posts.
      </div>
    `;

    return;
  }

  const posts=await SB
    .from("posts")
    .select("id,image_url")
    .in("id",ids);

  (posts.data||[]).forEach(p=>{

    const img=document.createElement("img");

    img.src=p.image_url;

    img.style.cssText=`
      width:100%;
      aspect-ratio:1;
      object-fit:cover;
    `;

    grid.appendChild(img);
  });
}


/* =========================================================
   LOGOUT
   ========================================================= */

window.picflowLogout=async()=>{
  await SB.auth.signOut();
  location.reload();
};


/* =========================================================
   GLOBAL OVERRIDES
   ========================================================= */

window.createPost=create;
window.picflowCreateRealPost=create;

window.picflowOpenProfile=openProfile;

window.commentPost=function(){

  const post=
    document.querySelector(
      ".picflow-real-post,[data-post-id]"
    );

  if(post)
    comments(post.dataset.postId);
};

window.toggleLike=function(btn){

  const card=btn.closest("[data-post-id]");

  if(card)
    like(card.dataset.postId,card);
};

window.toggleSave=function(btn){

  const card=btn.closest("[data-post-id]");

  if(card)
    save(card.dataset.postId,card);
};

window.sharePost=function(){

  const card=
    document.querySelector("[data-post-id]");

  if(card)
    share({
      id:card.dataset.postId,
      caption:"PicFlow post"
    });
};

window.navigate=function(page){

  if(page==="Home"){
    loadFeed();
    return;
  }

  if(page==="Profile"){

    me().then(u=>{
      if(u)openProfile(u.id);
    });

    return;
  }

  if(page==="Search"){
    search();
    return;
  }

  loadFeed();
};


/* =========================================================
   MONSTER FLOAT MENU
   ========================================================= */

function menu(){

  if(document.getElementById("monsterMenu"))return;

  const box=document.createElement("div");

  box.id="monsterMenu";

  box.style.cssText=`
    position:fixed;
    right:14px;
    bottom:145px;
    z-index:90000;
    display:flex;
    flex-direction:column;
    gap:8px;
  `;

  box.innerHTML=`

    <button id="monsterSearchBtn"
      style="
        border:0;
        background:#111;
        color:white;
        padding:12px 18px;
        border-radius:25px;
        font-weight:800;
      ">
      🔍 Search
    </button>

    <button id="monsterSavedBtn"
      style="
        border:0;
        background:#111;
        color:white;
        padding:12px 18px;
        border-radius:25px;
        font-weight:800;
      ">
      🔖 Saved
    </button>

    <button id="monsterLogoutBtn"
      style="
        border:0;
        background:#e53935;
        color:white;
        padding:12px 18px;
        border-radius:25px;
        font-weight:800;
      ">
      Logout
    </button>

  `;

  document.body.appendChild(box);

  box.querySelector("#monsterSearchBtn").onclick=search;
  box.querySelector("#monsterSavedBtn").onclick=saved;
  box.querySelector("#monsterLogoutBtn").onclick=window.picflowLogout;
}


/* =========================================================
   START
   ========================================================= */

function start(){

  setTimeout(async()=>{

    const u=await me();

    if(u){

      menu();

      loadFeed();
    }

  },1200);
}


if(document.readyState==="loading"){

  document.addEventListener(
    "DOMContentLoaded",
    start
  );

}else{

  start();
}


})();
