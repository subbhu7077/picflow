/* =========================================================
   PICFLOW REAL LIKES + COMMENTS + SAVES
   ========================================================= */

(function () {

  if (window.picflowInteractionsLoaded) return;
  window.picflowInteractionsLoaded = true;

  function getSB() {
    if (
      !window.supabase ||
      !window.SUPABASE_URL ||
      !window.SUPABASE_PUBLISHABLE_KEY
    ) return null;

    return window.supabase.createClient(
      window.SUPABASE_URL,
      window.SUPABASE_PUBLISHABLE_KEY
    );
  }


  async function getUser() {

    const client = getSB();
    if (!client) return null;

    const { data, error } =
      await client.auth.getUser();

    if (error) {
      console.error(error);
      return null;
    }

    return data.user || null;
  }


  function esc(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }


  /* =======================================================
     LIKE
     ======================================================= */

  async function setupLike(button, postId) {

    const client = getSB();
    const user = await getUser();

    if (!client || !user) return;


    const check =
      await client
        .from("post_likes")
        .select("post_id")
        .eq("post_id", postId)
        .eq("user_id", user.id)
        .maybeSingle();


    if (check.data) {
      button.textContent = "♥";
      button.dataset.liked = "true";
    } else {
      button.textContent = "♡";
      button.dataset.liked = "false";
    }


    const countResult =
      await client
        .from("post_likes")
        .select("*", {
          count: "exact",
          head: true
        })
        .eq("post_id", postId);


    const count =
      button
        .closest(".picflow-real-post")
        ?.querySelector(".picflow-like-count");


    if (count) {
      count.textContent =
        countResult.count || 0;
    }


    button.onclick =
      async function () {

        button.disabled = true;

        try {

          if (
            button.dataset.liked === "true"
          ) {

            const result =
              await client
                .from("post_likes")
                .delete()
                .eq("post_id", postId)
                .eq("user_id", user.id);


            if (result.error)
              throw result.error;


            button.textContent = "♡";
            button.dataset.liked = "false";

          } else {

            const result =
              await client
                .from("post_likes")
                .insert({
                  post_id: postId,
                  user_id: user.id
                });


            if (result.error)
              throw result.error;


            button.textContent = "♥";
            button.dataset.liked = "true";
          }


          const newCount =
            await client
              .from("post_likes")
              .select("*", {
                count: "exact",
                head: true
              })
              .eq("post_id", postId);


          if (count) {
            count.textContent =
              newCount.count || 0;
          }

        } catch (error) {

          console.error(error);

          alert(
            "Like failed:\n" +
            error.message
          );

        }


        button.disabled = false;

      };

  }


  /* =======================================================
     COMMENTS
     ======================================================= */

  async function openComments(postId) {

    const client = getSB();
    const user = await getUser();

    if (!client || !user) {
      alert("Please login first.");
      return;
    }


    const result =
      await client
        .from("comments")
        .select("id, comment, user_id, created_at")
        .eq("post_id", postId)
        .order(
          "created_at",
          { ascending: true }
        );


    if (result.error) {

      alert(
        "Comments load failed:\n" +
        result.error.message
      );

      return;
    }


    const comments =
      result.data || [];


    const old =
      document.getElementById(
        "picflowCommentsModal"
      );

    if (old) old.remove();


    const modal =
      document.createElement("div");

    modal.id =
      "picflowCommentsModal";


    modal.style.cssText = `
      position:fixed;
      inset:0;
      z-index:50000;
      background:rgba(0,0,0,.55);
      display:flex;
      align-items:flex-end;
    `;


    const box =
      document.createElement("div");


    box.style.cssText = `
      background:white;
      width:100%;
      max-height:75vh;
      border-radius:25px 25px 0 0;
      overflow:hidden;
    `;


    box.innerHTML = `

      <div style="
        display:flex;
        justify-content:space-between;
        align-items:center;
        padding:18px;
        border-bottom:1px solid #eee;
      ">

        <strong style="font-size:20px;">
          Comments 💬
        </strong>

        <button
          id="closeComments"
          style="
            border:0;
            background:#eee;
            width:38px;
            height:38px;
            border-radius:50%;
            font-size:22px;
          "
        >
          ×
        </button>

      </div>


      <div
        id="picflowCommentsList"
        style="
          max-height:52vh;
          overflow:auto;
          padding:10px 18px;
        "
      ></div>


      <div style="
        display:flex;
        gap:8px;
        padding:12px;
        border-top:1px solid #eee;
      ">

        <input
          id="picflowCommentInput"
          placeholder="Write a comment..."
          maxlength="500"
          style="
            flex:1;
            border:1px solid #ddd;
            border-radius:22px;
            padding:12px 16px;
            outline:none;
          "
        >

        <button
          id="picflowCommentSend"
          style="
            border:0;
            background:#111;
            color:white;
            border-radius:22px;
            padding:0 18px;
            font-weight:bold;
          "
        >
          Send
        </button>

      </div>

    `;


    modal.appendChild(box);
    document.body.appendChild(modal);


    document
      .getElementById("closeComments")
      .onclick =
      () => modal.remove();


    const list =
      document.getElementById(
        "picflowCommentsList"
      );


    if (!comments.length) {

      list.innerHTML = `
        <div style="
          text-align:center;
          color:#888;
          padding:35px;
        ">
          No comments yet 💬
        </div>
      `;

    } else {

      comments.forEach(
        async function (item) {

          const row =
            document.createElement("div");


          row.style.cssText = `
            padding:12px 0;
            border-bottom:1px solid #eee;
          `;


          let username = "User";

          try {
            const profileResult =
              await client
                .from("profiles")
                .select("username")
                .eq("id", item.user_id)
                .maybeSingle();

            if (
              profileResult.data &&
              profileResult.data.username
            ) {
              username =
                profileResult.data.username;
            }
          } catch (e) {
            console.error(
              "Profile name error:",
              e
            );
          }


          row.innerHTML = `
            <strong>
              ${esc(username)}
            </strong>

            <div style="
              margin-top:4px;
            ">
              ${esc(item.comment)}
            </div>
          `;


          list.appendChild(row);

        }
      );

    }


    document
      .getElementById(
        "picflowCommentSend"
      )
      .onclick =
      async function () {

        const input =
          document.getElementById(
            "picflowCommentInput"
          );


        const text =
          input.value.trim();


        if (!text) return;


        this.disabled = true;


        const insert =
          await client
            .from("comments")
            .insert({
              post_id: postId,
              user_id: user.id,
              comment: text
            });


        if (insert.error) {

          alert(
            "Comment failed:\n" +
            insert.error.message
          );

          this.disabled = false;
          return;

        }


        input.value = "";

        modal.remove();

        openComments(postId);

      };

  }


  /* =======================================================
     SAVE
     ======================================================= */

  async function setupSave(
    button,
    postId
  ) {

    const client = getSB();
    const user = await getUser();

    if (!client || !user) return;


    const check =
      await client
        .from("post_saves")
        .select("post_id")
        .eq("post_id", postId)
        .eq("user_id", user.id)
        .maybeSingle();


    if (check.data) {

      button.textContent = "📌";
      button.dataset.saved = "true";

    } else {

      button.textContent = "🔖";
      button.dataset.saved = "false";

    }


    button.onclick =
      async function () {

        button.disabled = true;


        try {

          if (
            button.dataset.saved === "true"
          ) {

            const result =
              await client
                .from("post_saves")
                .delete()
                .eq("post_id", postId)
                .eq("user_id", user.id);


            if (result.error)
              throw result.error;


            button.textContent = "🔖";
            button.dataset.saved = "false";


          } else {

            const result =
              await client
                .from("post_saves")
                .insert({
                  post_id: postId,
                  user_id: user.id
                });


            if (result.error)
              throw result.error;


            button.textContent = "📌";
            button.dataset.saved = "true";

          }

        } catch (error) {

          console.error(error);

          alert(
            "Save failed:\n" +
            error.message
          );

        }


        button.disabled = false;

      };

  }


  /* =======================================================
     WATCH REAL POSTS
     ======================================================= */

  function setupPosts() {

    document
      .querySelectorAll(
        ".picflow-real-post"
      )
      .forEach(
        function (post) {

          if (
            post.dataset.interactionsReady
          ) return;


          const postId =
            post.dataset.postId;


          if (!postId) return;


          post.dataset.interactionsReady =
            "true";


          const like =
            post.querySelector(
              ".picflow-post-like"
            );


          const comment =
            post.querySelector(
              ".picflow-post-comment"
            );


          if (like) {

            const old =
              like.parentNode;

            const wrapper =
              document.createElement("div");

            wrapper.style.cssText =
              "display:inline-flex;align-items:center;gap:4px;";


            like.remove();

            wrapper.appendChild(like);


            const count =
              document.createElement("span");


            count.className =
              "picflow-like-count";


            count.textContent =
              "0";


            count.style.cssText =
              "font-size:13px;color:#555;";


            wrapper.appendChild(count);


            old.appendChild(wrapper);


            setupLike(
              like,
              postId
            );

          }


          if (comment) {

            comment.onclick =
              function () {

                openComments(
                  postId
                );

              };

          }


          const save =
            post.querySelector(
              ".picflow-post-save"
            );


          if (save) {

            setupSave(
              save,
              postId
            );

          }

        }
      );

  }


  /* =======================================================
     OBSERVER
     ======================================================= */

  const observer =
    new MutationObserver(
      function () {
        setupPosts();
      }
    );


  function start() {

    setupPosts();

    observer.observe(
      document.body,
      {
        childList:true,
        subtree:true
      }
    );

  }


  if (
    document.readyState ===
    "loading"
  ) {

    document.addEventListener(
      "DOMContentLoaded",
      start
    );

  } else {

    start();

  }


})();
