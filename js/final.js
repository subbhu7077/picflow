/* =========================================================
   PICFLOW FINAL MASTER SYSTEM
   Instagram-style:
   Home • Search • Create • Like • Comment • Share
   Save • Profile • Follow • Followers • Following
   ========================================================= */

(function () {

  if (window.picflowFinalLoaded) return;
  window.picflowFinalLoaded = true;

  const SB = window.supabase?.createClient(
    window.SUPABASE_URL,
    window.SUPABASE_PUBLISHABLE_KEY
  );

  if (!SB) {
    console.error("PicFlow Supabase not available");
    return;
  }


  /* =======================================================
     HELPERS
     ======================================================= */

  async function user() {
    const r = await SB.auth.getUser();
    return r.data?.user || null;
  }

  function esc(v) {
    return String(v || "")
      .replace(/&/g,"&amp;")
      .replace(/</g,"&lt;")
      .replace(/>/g,"&gt;")
      .replace(/"/g,"&quot;")
      .replace(/'/g,"&#039;");
  }

  function avatar(profile, size=46) {

    if (profile?.avatar_url) {

      return `
        <img
          src="${esc(profile.avatar_url)}"
          style="
            width:${size}px;
            height:${size}px;
            border-radius:50%;
            object-fit:cover;
          "
        >
      `;

    }

    return `
      <div style="
        width:${size}px;
        height:${size}px;
        border-radius:50%;
        background:#111;
        color:white;
        display:flex;
        align-items:center;
        justify-content:center;
        font-weight:bold;
        font-size:${Math.round(size*.45)}px;
      ">
        ${esc(
          (profile?.username || "U")
          .charAt(0)
          .toUpperCase()
        )}
      </div>
    `;
  }


  async function profile(id) {

    const r =
      await SB
        .from("profiles")
        .select(
          "id,username,bio,avatar_url"
        )
        .eq("id",id)
        .maybeSingle();

    return r.data || {};
  }


  /* =======================================================
     HOME
     ======================================================= */

  async function home() {

    const main =
      document.querySelector("#mainApp main");

    if (!main) return;

    main.innerHTML = `
      <div id="pfFeed"
        style="
          padding-bottom:100px;
        ">
        <div style="
          text-align:center;
          padding:60px;
        ">
          Loading PicFlow... ⏳
        </div>
      </div>
    `;

    const r =
      await SB
        .from("posts")
        .select(
          "id,user_id,image_url,caption,created_at"
        )
        .order(
          "created_at",
          {ascending:false}
        )
        .limit(50);

    const feed =
      document.getElementById("pfFeed");

    if (r.error) {

      feed.innerHTML = `
        <div style="
          padding:50px 20px;
          text-align:center;
        ">
          ❌ Posts load failed
          <br><br>
          ${esc(r.error.message)}
        </div>
      `;

      return;
    }

    const posts = r.data || [];

    if (!posts.length) {

      feed.innerHTML = `
        <div style="
          padding:70px 20px;
          text-align:center;
        ">
          <div style="font-size:60px">📸</div>
          <h2>No posts yet</h2>
          <p>Create your first post.</p>
          <button
            onclick="window.picflowCreatePost()"
            style="
              padding:12px 25px;
              border:0;
              border-radius:12px;
              background:#111;
              color:#fff;
            "
          >
            Create Post
          </button>
        </div>
      `;

      return;
    }


    feed.innerHTML = "";


    for (const post of posts) {

      const p =
        await profile(post.user_id);

      const card =
        document.createElement("article");

      card.dataset.postId = post.id;

      card.style.cssText = `
        background:white;
        margin-bottom:10px;
        overflow:hidden;
      `;


      card.innerHTML = `

        <div style="
          display:flex;
          align-items:center;
          gap:12px;
          padding:14px;
        ">

          ${avatar(p,46)}

          <div
            class="pf-user"
            style="
              flex:1;
              cursor:pointer;
            "
          >
            <strong>
              ${esc(p.username || "User")}
            </strong>

            <small style="
              display:block;
              color:#888;
              margin-top:3px;
            ">
              PicFlow
            </small>
          </div>

        </div>


        <img
          src="${esc(post.image_url)}"
          style="
            width:100%;
            max-height:650px;
            object-fit:cover;
            display:block;
            background:#eee;
          "
        >


        <div style="
          padding:10px 15px;
        ">

          <div style="
            display:flex;
            gap:20px;
            align-items:center;
            font-size:26px;
          ">

            <button
              class="pf-like"
              style="
                border:0;
                background:none;
                font-size:25px;
              "
            >
              ♡
            </button>

            <button
              class="pf-comment"
              style="
                border:0;
                background:none;
                font-size:23px;
              "
            >
              💬
            </button>

            <button
              class="pf-share"
              style="
                border:0;
                background:none;
                font-size:23px;
              "
            >
              ✈
            </button>

            <button
              class="pf-save"
              style="
                border:0;
                background:none;
                font-size:23px;
                margin-left:auto;
              "
            >
              🔖
            </button>

          </div>

          <div class="pf-like-count"
            style="
              margin-top:7px;
              font-weight:bold;
            ">
            0 likes
          </div>

          <div style="
            margin-top:7px;
          ">
            <strong>
              ${esc(p.username || "User")}
            </strong>

            ${post.caption
              ? " " + esc(post.caption)
              : ""}
          </div>

        </div>
      `;


      feed.appendChild(card);


      /* USER PROFILE */

      card
        .querySelector(".pf-user")
        .onclick =
        () => openProfile(post.user_id);


      /* LIKE */

      card
        .querySelector(".pf-like")
        .onclick =
        () => toggleLike(
          post.id,
          card
        );


      /* COMMENT */

      card
        .querySelector(".pf-comment")
        .onclick =
        () => comments(post.id);


      /* SHARE */

      card
        .querySelector(".pf-share")
        .onclick =
        () => share(post);


      /* SAVE */

      card
        .querySelector(".pf-save")
        .onclick =
        () => toggleSave(
          post.id,
          card
        );


      await refreshPostState(
        post.id,
        card
      );
    }
  }


  /* =======================================================
     LIKE
     ======================================================= */

  async function toggleLike(
    postId,
    card
  ) {

    const u = await user();

    if (!u) {
      alert("Please login first.");
      return;
    }

    const check =
      await SB
        .from("likes")
        .select("post_id")
        .eq("user_id",u.id)
        .eq("post_id",postId)
        .maybeSingle();

    if (check.data) {

      await SB
        .from("likes")
        .delete()
        .eq("user_id",u.id)
        .eq("post_id",postId);

    } else {

      await SB
        .from("likes")
        .insert({
          user_id:u.id,
          post_id:postId
        });
    }

    await refreshPostState(
      postId,
      card
    );
  }


  async function refreshPostState(
    postId,
    card
  ) {

    const u = await user();

    const count =
      await SB
        .from("likes")
        .select("*",{count:"exact",head:true})
        .eq("post_id",postId);

    const likeCount =
      count.count || 0;

    const text =
      card.querySelector(".pf-like-count");

    if (text)
      text.textContent =
        likeCount + " likes";


    if (u) {

      const mine =
        await SB
          .from("likes")
          .select("post_id")
          .eq("user_id",u.id)
          .eq("post_id",postId)
          .maybeSingle();

      const btn =
        card.querySelector(".pf-like");

      if (btn)
        btn.textContent =
          mine.data ? "♥" : "♡";
    }


    if (u) {

      const saved =
        await SB
          .from("saved_posts")
          .select("post_id")
          .eq("user_id",u.id)
          .eq("post_id",postId)
          .maybeSingle();

      const btn =
        card.querySelector(".pf-save");

      if (btn)
        btn.textContent =
          saved.data ? "📌" : "🔖";
    }
  }


  /* =======================================================
     SAVE
     ======================================================= */

  async function toggleSave(
    postId,
    card
  ) {

    const u = await user();

    if (!u) {
      alert("Please login first.");
      return;
    }

    const check =
      await SB
        .from("saved_posts")
        .select("post_id")
        .eq("user_id",u.id)
        .eq("post_id",postId)
        .maybeSingle();

    if (check.data) {

      await SB
        .from("saved_posts")
        .delete()
        .eq("user_id",u.id)
        .eq("post_id",postId);

    } else {

      await SB
        .from("saved_posts")
        .insert({
          user_id:u.id,
          post_id:postId
        });
    }

    await refreshPostState(
      postId,
      card
    );
  }


  /* =======================================================
     COMMENTS
     ======================================================= */

  async function comments(postId) {

    const old =
      document.getElementById(
        "pfCommentModal"
      );

    if (old) old.remove();


    const modal =
      document.createElement("div");

    modal.id =
      "pfCommentModal";

    modal.style.cssText = `
      position:fixed;
      inset:0;
      z-index:999999;
      background:rgba(0,0,0,.65);
      display:flex;
      align-items:flex-end;
    `;


    modal.innerHTML = `
      <div style="
        width:100%;
        max-height:80vh;
        background:white;
        border-radius:25px 25px 0 0;
        overflow:auto;
      ">

        <div style="
          padding:18px;
          border-bottom:1px solid #eee;
          display:flex;
          justify-content:space-between;
        ">
          <strong>Comments</strong>

          <button
            id="pfCloseComments"
            style="
              border:0;
              background:#eee;
              border-radius:50%;
              width:38px;
              height:38px;
              font-size:22px;
            "
          >
            ×
          </button>
        </div>

        <div
          id="pfCommentsList"
          style="
            padding:15px;
          "
        >
          Loading...
        </div>

        <div style="
          position:sticky;
          bottom:0;
          background:white;
          padding:12px;
          display:flex;
          gap:8px;
          border-top:1px solid #eee;
        ">

          <input
            id="pfCommentInput"
            placeholder="Add a comment..."
            style="
              flex:1;
              padding:13px;
              border:1px solid #ddd;
              border-radius:20px;
            "
          >

          <button
            id="pfSendComment"
            style="
              border:0;
              border-radius:20px;
              padding:0 18px;
              background:#111;
              color:white;
            "
          >
            Send
          </button>

        </div>

      </div>
    `;


    document.body.appendChild(modal);


    document
      .getElementById(
        "pfCloseComments"
      )
      .onclick =
      () => modal.remove();


    const list =
      document.getElementById(
        "pfCommentsList"
      );


    const r =
      await SB
        .from("comments")
        .select(
          "id,user_id,comment,created_at"
        )
        .eq("post_id",postId)
        .order(
          "created_at",
          {ascending:true}
        );


    if (r.error) {

      list.innerHTML =
        "Comments load failed: " +
        esc(r.error.message);

    } else if (!r.data.length) {

      list.innerHTML =
        `<div style="
          text-align:center;
          color:#777;
          padding:30px;
        ">
          No comments yet 💬
        </div>`;

    } else {

      list.innerHTML = "";

      for (const c of r.data) {

        const p =
          await profile(c.user_id);

        const item =
          document.createElement("div");

        item.style.cssText = `
          display:flex;
          gap:10px;
          padding:12px 0;
          border-bottom:1px solid #eee;
        `;

        item.innerHTML = `
          ${avatar(p,38)}

          <div>
            <strong>
              ${esc(p.username || "User")}
            </strong>

            <div>
              ${esc(c.comment)}
            </div>
          </div>
        `;

        list.appendChild(item);
      }
    }


    document
      .getElementById(
        "pfSendComment"
      )
      .onclick =
      async function () {

        const u = await user();

        if (!u) {
          alert("Please login first.");
          return;
        }

        const input =
          document.getElementById(
            "pfCommentInput"
          );

        const text =
          input.value.trim();

        if (!text) return;


        const r =
          await SB
            .from("comments")
            .insert({
              user_id:u.id,
              post_id:postId,
              comment:text
            });


        if (r.error) {

          alert(
            "Comment failed:\n\n" +
            r.error.message
          );

          return;
        }


        input.value = "";

        modal.remove();

        comments(postId);
      };
  }


  /* =======================================================
     SHARE
     ======================================================= */

  async function share(post) {

    const url =
      location.origin +
      location.pathname +
      "?post=" +
      encodeURIComponent(post.id);


    if (navigator.share) {

      try {

        await navigator.share({
          title:"PicFlow",
          text:post.caption || "Check this post!",
          url:url
        });

        return;

      } catch(e) {}
    }


    try {

      await navigator.clipboard.writeText(url);

      alert("Post link copied! 🔗");

    } catch(e) {

      alert(url);

    }
  }


  /* =======================================================
     CREATE POST
     ======================================================= */

  window.picflowCreatePost =
    async function () {

      const u = await user();

      if (!u) {
        alert("Please login first.");
        return;
      }


      const input =
        document.createElement("input");

      input.type = "file";
      input.accept = "image/*";


      input.onchange =
        async function () {

          const file =
            input.files?.[0];

          if (!file) return;


          if (!file.type.startsWith("image/")) {
            alert("Please select an image.");
            return;
          }


          if (file.size > 10 * 1024 * 1024) {
            alert("Maximum 10 MB.");
            return;
          }


          const caption =
            prompt("Write caption:") || "";


          const ext =
            file.name
              .split(".")
              .pop()
              .toLowerCase()
              .replace(/[^a-z0-9]/g,"") ||
            "jpg";


          const path =
            u.id +
            "/" +
            Date.now() +
            "." +
            ext;


          const upload =
            await SB
              .storage
              .from("posts")
              .upload(
                path,
                file,
                {
                  upsert:false,
                  contentType:file.type
                }
              );


          if (upload.error) {

            alert(
              "Upload failed:\n\n" +
              upload.error.message
            );

            return;
          }


          const publicURL =
            SB.storage
              .from("posts")
              .getPublicUrl(path)
              .data
              .publicUrl;


          const r =
            await SB
              .from("posts")
              .insert({
                user_id:u.id,
                image_url:publicURL,
                caption:caption
              });


          if (r.error) {

            alert(
              "Post failed:\n\n" +
              r.error.message
            );

            return;
          }


          alert(
            "Post published! 🎉"
          );

          home();
        };


      input.click();
    };


  /* =======================================================
     PROFILE
     ======================================================= */

  async function openProfile(id) {

    const p =
      await profile(id);

    const followers =
      await SB
        .from("follows")
        .select("*",{count:"exact",head:true})
        .eq("following_id",id);


    const following =
      await SB
        .from("follows")
        .select("*",{count:"exact",head:true})
        .eq("follower_id",id);


    const posts =
      await SB
        .from("posts")
        .select(
          "id,image_url"
        )
        .eq("user_id",id)
        .order(
          "created_at",
          {ascending:false}
        );


    const old =
      document.getElementById(
        "pfProfileModal"
      );

    if (old) old.remove();


    const modal =
      document.createElement("div");

    modal.id =
      "pfProfileModal";

    modal.style.cssText = `
      position:fixed;
      inset:0;
      z-index:99999;
      background:rgba(0,0,0,.65);
      display:flex;
      align-items:flex-end;
    `;


    modal.innerHTML = `
      <div style="
        width:100%;
        max-height:90vh;
        overflow:auto;
        background:white;
        border-radius:28px 28px 0 0;
      ">

        <div style="
          padding:18px;
          display:flex;
          justify-content:space-between;
        ">

          <strong style="font-size:21px">
            ${esc(p.username || "User")}
          </strong>

          <button
            id="pfCloseProfile"
            style="
              border:0;
              background:#eee;
              border-radius:50%;
              width:40px;
              height:40px;
              font-size:23px;
            "
          >
            ×
          </button>

        </div>


        <div style="
          padding:20px;
          text-align:center;
        ">

          ${avatar(p,90)}

          <h2>
            ${esc(p.username || "User")}
          </h2>

          <p style="color:#777">
            ${esc(p.bio || "")}
          </p>


          <div style="
            display:flex;
            justify-content:space-around;
            margin:25px 0;
          ">

            <div>
              <strong>
                ${posts.data?.length || 0}
              </strong>
              <small style="display:block">
                Posts
              </small>
            </div>

            <div
              id="pfFollowers"
              style="cursor:pointer"
            >
              <strong>
                ${followers.count || 0}
              </strong>
              <small style="display:block">
                Followers
              </small>
            </div>

            <div
              id="pfFollowing"
              style="cursor:pointer"
            >
              <strong>
                ${following.count || 0}
              </strong>
              <small style="display:block">
                Following
              </small>
            </div>

          </div>


          ${
            (await user())?.id !== id
            ? `
              <button
                id="pfFollowButton"
                style="
                  width:100%;
                  padding:14px;
                  border:0;
                  border-radius:15px;
                  background:#111;
                  color:white;
                  font-size:16px;
                  font-weight:bold;
                "
              >
                Follow
              </button>
            `
            : ""
          }

        </div>


        <h3 style="padding:0 20px">
          Posts
        </h3>


        <div style="
          display:grid;
          grid-template-columns:repeat(3,1fr);
          gap:3px;
          padding:3px;
        ">

          ${
            (posts.data || []).map(
              x => `
                <img
                  src="${esc(x.image_url)}"
                  style="
                    width:100%;
                    aspect-ratio:1;
                    object-fit:cover;
                  "
                >
              `
            ).join("")
            ||
            `
              <div style="
                grid-column:1/-1;
                text-align:center;
                padding:50px;
                color:#777;
              ">
                No posts yet 📸
              </div>
            `
          }

        </div>

      </div>
    `;


    document.body.appendChild(modal);


    document
      .getElementById(
        "pfCloseProfile"
      )
      .onclick =
      () => modal.remove();


    const me =
      await user();


    if (me && me.id !== id) {

      const existing =
        await SB
          .from("follows")
          .select("*")
          .eq("follower_id",me.id)
          .eq("following_id",id)
          .maybeSingle();


      const btn =
        document.getElementById(
          "pfFollowButton"
        );


      if (btn) {

        btn.textContent =
          existing.data
          ? "Following"
          : "Follow";


        btn.onclick =
          async function () {

            if (existing.data) {

              await SB
                .from("follows")
                .delete()
                .eq(
                  "follower_id",
                  me.id
                )
                .eq(
                  "following_id",
                  id
                );

            } else {

              await SB
                .from("follows")
                .insert({
                  follower_id:me.id,
                  following_id:id
                });

            }

            modal.remove();

            openProfile(id);
          };
      }
    }


    document
      .getElementById(
        "pfFollowers"
      )
      ?.addEventListener(
        "click",
        () => followList(id,"followers")
      );


    document
      .getElementById(
        "pfFollowing"
      )
      ?.addEventListener(
        "click",
        () => followList(id,"following")
      );
  }


  /* =======================================================
     FOLLOW LIST
     ======================================================= */

  async function followList(
    userId,
    type
  ) {

    const column =
      type === "followers"
      ? "following_id"
      : "follower_id";

    const target =
      type === "followers"
      ? "follower_id"
      : "following_id";


    const r =
      await SB
        .from("follows")
        .select(
          "follower_id,following_id"
        )
        .eq(column,userId);


    const modal =
      document.createElement("div");

    modal.style.cssText = `
      position:fixed;
      inset:0;
      z-index:999999;
      background:white;
      overflow:auto;
    `;


    modal.innerHTML = `
      <div style="
        padding:20px;
        display:flex;
        justify-content:space-between;
        border-bottom:1px solid #eee;
      ">
        <strong>
          ${
            type === "followers"
            ? "Followers"
            : "Following"
          }
        </strong>

        <button
          id="pfCloseList"
          style="
            border:0;
            background:#eee;
            border-radius:50%;
            width:38px;
            height:38px;
            font-size:22px;
          "
        >
          ×
        </button>
      </div>

      <div
        id="pfList"
        style="padding:15px"
      >
        Loading...
      </div>
    `;


    document.body.appendChild(modal);


    document
      .getElementById("pfCloseList")
      .onclick =
      () => modal.remove();


    const list =
      document.getElementById(
        "pfList"
      );

    list.innerHTML = "";


    for (const row of r.data || []) {

      const id = row[target];

      const p =
        await profile(id);

      const item =
        document.createElement("div");

      item.style.cssText = `
        display:flex;
        align-items:center;
        gap:12px;
        padding:15px 5px;
        border-bottom:1px solid #eee;
      `;


      item.innerHTML = `
        ${avatar(p,50)}

        <strong style="flex:1">
          ${esc(p.username || "User")}
        </strong>

        <span>›</span>
      `;


      item.onclick =
        function () {

          modal.remove();

          openProfile(id);
        };


      list.appendChild(item);
    }


    if (!r.data?.length) {

      list.innerHTML = `
        <div style="
          text-align:center;
          padding:60px;
          color:#777;
        ">
          No users yet.
        </div>
      `;
    }
  }


  /* =======================================================
     SEARCH
     ======================================================= */

  async function search() {

    const old =
      document.getElementById(
        "pfSearchModal"
      );

    if (old) old.remove();


    const modal =
      document.createElement("div");

    modal.id =
      "pfSearchModal";

    modal.style.cssText = `
      position:fixed;
      inset:0;
      z-index:99998;
      background:white;
      overflow:auto;
    `;


    modal.innerHTML = `
      <div style="
        padding:20px;
        display:flex;
        gap:10px;
        align-items:center;
      ">

        <input
          id="pfSearchInput"
          placeholder="Search people..."
          style="
            flex:1;
            padding:14px 18px;
            border:1px solid #ddd;
            border-radius:25px;
            font-size:16px;
          "
        >

        <button
          id="pfCloseSearch"
          style="
            border:0;
            background:#eee;
            width:42px;
            height:42px;
            border-radius:50%;
            font-size:22px;
          "
        >
          ×
        </button>

      </div>

      <div
        id="pfSearchResults"
        style="padding:10px 20px"
      >
        Search for a username 🔍
      </div>
    `;


    document.body.appendChild(modal);


    document
      .getElementById(
        "pfCloseSearch"
      )
      .onclick =
      () => modal.remove();


    const input =
      document.getElementById(
        "pfSearchInput"
      );


    let timer;

    input.oninput =
      function () {

        clearTimeout(timer);

        timer =
          setTimeout(
            () => searchUsers(
              input.value
            ),
            350
          );
      };


    input.focus();
  }


  async function searchUsers(term) {

    const box =
      document.getElementById(
        "pfSearchResults"
      );

    if (!box) return;


    term = term.trim();


    if (!term) {

      box.innerHTML =
        "Search for a username 🔍";

      return;
    }


    const r =
      await SB
        .from("profiles")
        .select(
          "id,username,bio,avatar_url"
        )
        .ilike(
          "username",
          "%" + term + "%"
        )
        .limit(30);


    if (r.error) {

      box.innerHTML =
        esc(r.error.message);

      return;
    }


    box.innerHTML = "";


    if (!r.data.length) {

      box.innerHTML = `
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


    r.data.forEach(
      function (p) {

        const item =
          document.createElement("div");

        item.style.cssText = `
          display:flex;
          align-items:center;
          gap:12px;
          padding:15px 5px;
          border-bottom:1px solid #eee;
          cursor:pointer;
        `;


        item.innerHTML = `
          ${avatar(p,52)}

          <div style="flex:1">

            <strong>
              ${esc(p.username)}
            </strong>

            <div style="
              color:#777;
              margin-top:4px;
            ">
              ${esc(p.bio || "")}
            </div>

          </div>

          <span>›</span>
        `;


        item.onclick =
          function () {

            document
              .getElementById(
                "pfSearchModal"
              )
              ?.remove();

            openProfile(p.id);
          };


        box.appendChild(item);
      }
    );
  }


  /* =======================================================
     SAVED
     ======================================================= */

  async function saved() {

    const u = await user();

    if (!u) {
      alert("Please login first.");
      return;
    }


    const r =
      await SB
        .from("saved_posts")
        .select("post_id,created_at")
        .eq("user_id",u.id)
        .order(
          "created_at",
          {ascending:false}
        );


    const ids =
      (r.data || [])
        .map(x => x.post_id);


    const modal =
      document.createElement("div");

    modal.style.cssText = `
      position:fixed;
      inset:0;
      z-index:999999;
      background:white;
      overflow:auto;
    `;


    modal.innerHTML = `
      <div style="
        padding:20px;
        display:flex;
        justify-content:space-between;
        border-bottom:1px solid #eee;
      ">

        <strong>
          🔖 Saved Posts
        </strong>

        <button
          id="pfCloseSaved"
          style="
            border:0;
            background:#eee;
            width:40px;
            height:40px;
            border-radius:50%;
            font-size:22px;
          "
        >
          ×
        </button>

      </div>

      <div
        id="pfSavedGrid"
        style="
          display:grid;
          grid-template-columns:repeat(3,1fr);
          gap:3px;
          padding:3px;
        "
      ></div>
    `;


    document.body.appendChild(modal);


    document
      .getElementById("pfCloseSaved")
      .onclick =
      () => modal.remove();


    const grid =
      document.getElementById(
        "pfSavedGrid"
      );


    if (!ids.length) {

      grid.innerHTML = `
        <div style="
          grid-column:1/-1;
          text-align:center;
          padding:80px 20px;
          color:#777;
        ">
          <div style="font-size:55px">
            🔖
          </div>
          <h3>No saved posts</h3>
        </div>
      `;

      return;
    }


    const posts =
      await SB
        .from("posts")
        .select(
          "id,image_url"
        )
        .in("id",ids);


    (posts.data || []).forEach(
      function (p) {

        const img =
          document.createElement("img");

        img.src =
          p.image_url;

        img.style.cssText = `
          width:100%;
          aspect-ratio:1;
          object-fit:cover;
          cursor:pointer;
        `;

        img.onclick =
          function () {

            modal.remove();

            const original =
              document.querySelector(
                `[data-post-id="${p.id}"]`
              );

            if (original) {

              original.scrollIntoView({
                behavior:"smooth",
                block:"center"
              });

            } else {

              alert(
                "Saved post feed mein loaded nahi hai."
              );
            }
          };

        grid.appendChild(img);
      }
    );
  }


  /* =======================================================
     LOGOUT
     ======================================================= */

  window.picflowLogout =
    async function () {

      await SB.auth.signOut();

      location.reload();
    };


  /* =======================================================
     EXPOSE
     ======================================================= */

  window.picflowHome = home;
  window.picflowSearch = search;
  window.picflowSaved = saved;
  window.picflowProfile = openProfile;


  /* =======================================================
     REPLACE NAVIGATION
     ======================================================= */

  window.navigate =
    function (page) {

      if (page === "Home") {
        home();
        return;
      }

      if (page === "Profile") {

        user()
          .then(u => {

            if (u)
              openProfile(u.id);

          });

        return;
      }

      home();
    };


  /* =======================================================
     BUILD EXTRA BUTTONS
     ======================================================= */

  function buttons() {

    if (
      document.getElementById(
        "pfFinalButtons"
      )
    ) return;


    const box =
      document.createElement("div");

    box.id =
      "pfFinalButtons";

    box.style.cssText = `
      position:fixed;
      right:14px;
      bottom:145px;
      z-index:50000;
      display:flex;
      flex-direction:column;
      gap:8px;
    `;


    box.innerHTML = `

      <button
        id="pfSearchBtn"
        style="
          border:0;
          background:#111;
          color:white;
          padding:11px 16px;
          border-radius:25px;
          font-weight:bold;
        "
      >
        🔍 Search
      </button>

      <button
        id="pfSavedBtn"
        style="
          border:0;
          background:#111;
          color:white;
          padding:11px 16px;
          border-radius:25px;
          font-weight:bold;
        "
      >
        🔖 Saved
      </button>

      <button
        id="pfLogoutBtn"
        style="
          border:0;
          background:#d33;
          color:white;
          padding:11px 16px;
          border-radius:25px;
          font-weight:bold;
        "
      >
        Logout
      </button>

    `;


    document.body.appendChild(box);


    document
      .getElementById("pfSearchBtn")
      .onclick = search;


    document
      .getElementById("pfSavedBtn")
      .onclick = saved;


    document
      .getElementById("pfLogoutBtn")
      .onclick = picflowLogout;
  }


  /* =======================================================
     START
     ======================================================= */

  function start() {

    setTimeout(
      function () {

        const main =
          document.getElementById(
            "mainApp"
          );

        if (
          main &&
          main.style.display !== "none"
        ) {

          buttons();
          home();
        }

      },
      1500
    );
  }


  if (
    document.readyState === "loading"
  ) {

    document.addEventListener(
      "DOMContentLoaded",
      start
    );

  } else {

    start();
  }


})();
