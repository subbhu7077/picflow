/* =========================================================
   PICFLOW - REAL INSTAGRAM STYLE SAVED POSTS
   ========================================================= */

(function () {

  if (window.picflowSavedV2Loaded) return;
  window.picflowSavedV2Loaded = true;

  function getClient() {
    if (
      !window.supabase ||
      !window.SUPABASE_URL ||
      !window.SUPABASE_PUBLISHABLE_KEY
    ) {
      return null;
    }

    return window.supabase.createClient(
      window.SUPABASE_URL,
      window.SUPABASE_PUBLISHABLE_KEY
    );
  }


  async function getUser() {

    const client = getClient();

    if (!client) return null;

    const result =
      await client.auth.getUser();

    return result.data?.user || null;
  }


  /* =======================================================
     CHECK IF POST IS SAVED
     ======================================================= */

  async function isSaved(postId) {

    const client = getClient();
    const user = await getUser();

    if (!client || !user || !postId) {
      return false;
    }

    const result =
      await client
        .from("saved_posts")
        .select("post_id")
        .eq("user_id", user.id)
        .eq("post_id", postId)
        .maybeSingle();

    if (result.error) {
      console.error(
        "Save check:",
        result.error
      );

      return false;
    }

    return !!result.data;
  }


  /* =======================================================
     SAVE / UNSAVE
     ======================================================= */

  async function changeSave(
    postId,
    button
  ) {

    const client = getClient();
    const user = await getUser();

    if (!client || !user) {

      alert(
        "Please login first."
      );

      return;
    }

    if (!postId) {

      alert(
        "Post ID missing."
      );

      return;
    }

    button.disabled = true;

    const saved =
      await isSaved(postId);

    let result;

    if (saved) {

      result =
        await client
          .from("saved_posts")
          .delete()
          .eq(
            "user_id",
            user.id
          )
          .eq(
            "post_id",
            postId
          );

    } else {

      result =
        await client
          .from("saved_posts")
          .insert({
            user_id: user.id,
            post_id: postId
          });

    }


    if (result.error) {

      console.error(
        "Save error:",
        result.error
      );

      alert(
        "Save failed:\n\n" +
        result.error.message
      );

      button.disabled = false;

      return;
    }


    button.dataset.saved =
      saved ? "false" : "true";

    button.textContent =
      saved ? "🔖" : "📌";

    button.setAttribute(
      "aria-label",
      saved
        ? "Save post"
        : "Remove from saved"
    );

    button.disabled = false;
  }


  /* =======================================================
     CREATE SAVE BUTTON INSIDE REAL POSTS
     ======================================================= */

  async function setupPostButtons() {

    const posts =
      document.querySelectorAll(
        ".picflow-real-post"
      );

    if (!posts.length) return;


    for (const post of posts) {

      const postId =
        post.dataset.postId;

      if (!postId) continue;


      /* find action row */

      const actionRow =
        post.querySelector(
          ".picflow-post-like"
        )?.parentElement;

      if (!actionRow) continue;


      /* already created */

      let button =
        post.querySelector(
          ".picflow-post-save"
        );


      if (!button) {

        button =
          document.createElement(
            "button"
          );

        button.className =
          "picflow-post-save";

        button.type = "button";

        button.style.cssText = `
          border:0;
          background:none;
          font-size:24px;
          padding:0;
          cursor:pointer;
          margin-left:auto;
        `;

        actionRow.appendChild(
          button
        );

        button.onclick =
          function (event) {

            event.preventDefault();
            event.stopPropagation();

            changeSave(
              postId,
              button
            );

          };
      }


      if (
        button.dataset.loaded === "true"
      ) {
        continue;
      }

      button.dataset.loaded =
        "true";


      const saved =
        await isSaved(postId);


      button.dataset.saved =
        saved ? "true" : "false";

      button.textContent =
        saved ? "📌" : "🔖";

      button.setAttribute(
        "aria-label",
        saved
          ? "Remove from saved"
          : "Save post"
      );
    }
  }


  /* =======================================================
     OVERRIDE OLD toggleSave()
     ======================================================= */

  window.toggleSave =
    async function (button) {

      const post =
        button?.closest(
          ".picflow-real-post"
        );

      if (post) {

        const postId =
          post.dataset.postId;

        if (postId) {

          await changeSave(
            postId,
            button
          );

          return;
        }
      }


      /* old demo post support */

      const allPosts =
        document.querySelectorAll(
          ".picflow-real-post"
        );

      if (
        allPosts.length === 0
      ) {

        alert(
          "Real post system is loading..."
        );

      }
    };


  /* =======================================================
     SAVED POSTS MODAL
     ======================================================= */

  async function openSavedPosts() {

    const client = getClient();
    const user = await getUser();

    if (!client || !user) {

      alert(
        "Please login first."
      );

      return;
    }


    const result =
      await client
        .from("saved_posts")
        .select(
          "post_id,created_at"
        )
        .eq(
          "user_id",
          user.id
        )
        .order(
          "created_at",
          {
            ascending: false
          }
        );


    if (result.error) {

      alert(
        "Saved posts failed:\n\n" +
        result.error.message
      );

      return;
    }


    const saved =
      result.data || [];

    const postIds =
      saved.map(
        item => item.post_id
      );


    const old =
      document.getElementById(
        "picflowSavedModal"
      );

    if (old) old.remove();


    const modal =
      document.createElement(
        "div"
      );

    modal.id =
      "picflowSavedModal";

    modal.style.cssText = `
      position:fixed;
      inset:0;
      z-index:99999;
      background:rgba(0,0,0,.65);
      display:flex;
      align-items:flex-end;
      justify-content:center;
    `;


    const sheet =
      document.createElement(
        "div"
      );

    sheet.style.cssText = `
      width:100%;
      max-width:700px;
      max-height:88vh;
      overflow:auto;
      background:#fff;
      border-radius:28px 28px 0 0;
      padding-bottom:30px;
    `;


    sheet.innerHTML = `
      <div style="
        position:sticky;
        top:0;
        z-index:2;
        background:#fff;
        display:flex;
        align-items:center;
        justify-content:space-between;
        padding:18px 20px;
        border-bottom:1px solid #eee;
      ">

        <strong style="
          font-size:21px;
        ">
          🔖 Saved
        </strong>

        <button
          id="picflowCloseSaved"
          style="
            width:40px;
            height:40px;
            border:0;
            border-radius:50%;
            background:#eee;
            font-size:25px;
          "
        >
          ×
        </button>

      </div>

      <div
        id="picflowSavedGrid"
        style="
          display:grid;
          grid-template-columns:repeat(3,1fr);
          gap:3px;
          padding:3px;
        "
      ></div>
    `;


    modal.appendChild(sheet);

    document.body.appendChild(
      modal
    );


    document
      .getElementById(
        "picflowCloseSaved"
      )
      .onclick =
      function () {
        modal.remove();
      };


    const grid =
      document.getElementById(
        "picflowSavedGrid"
      );


    if (!postIds.length) {

      grid.innerHTML = `
        <div style="
          grid-column:1/-1;
          text-align:center;
          padding:80px 20px;
          color:#777;
        ">

          <div style="
            font-size:55px;
          ">
            🔖
          </div>

          <div style="
            margin-top:12px;
            font-size:18px;
            font-weight:bold;
          ">
            No saved posts
          </div>

          <div style="
            margin-top:6px;
            font-size:14px;
          ">
            Posts you save will appear here.
          </div>

        </div>
      `;

      return;
    }


    /* get actual posts */

    const postsResult =
      await client
        .from("posts")
        .select(
          "id,image_url,caption,user_id"
        )
        .in(
          "id",
          postIds
        );


    if (postsResult.error) {

      alert(
        "Could not load saved posts:\n\n" +
        postsResult.error.message
      );

      return;
    }


    const posts =
      postsResult.data || [];


    const map = {};

    posts.forEach(
      function (post) {
        map[post.id] = post;
      }
    );


    postIds.forEach(
      function (postId) {

        const post =
          map[postId];

        if (!post) return;


        const item =
          document.createElement(
            "div"
          );

        item.style.cssText = `
          aspect-ratio:1;
          overflow:hidden;
          background:#eee;
          cursor:pointer;
          position:relative;
        `;


        item.innerHTML = `
          <img
            src="${String(
              post.image_url
            )
              .replace(/"/g,"&quot;")
            }"
            style="
              width:100%;
              height:100%;
              object-fit:cover;
              display:block;
            "
            loading="lazy"
          >
        `;


        item.onclick =
          function () {

            modal.remove();


            const original =
              document.querySelector(
                '[data-post-id="' +
                post.id +
                '"]'
              );


            if (original) {

              original.scrollIntoView({
                behavior:"smooth",
                block:"center"
              });


              original.style.transition =
                "box-shadow .3s";

              original.style.boxShadow =
                "0 0 0 4px #111";

              setTimeout(
                function () {
                  original.style.boxShadow =
                    "";
                },
                1200
              );

            } else {

              alert(
                "Saved post hai, lekin Home feed mein abhi loaded nahi hai."
              );

            }

          };


        grid.appendChild(
          item
        );

      }
    );

  }


  window.openSavedPosts =
    openSavedPosts;


  /* =======================================================
     SAVED BUTTON
     ======================================================= */

  function createSavedButton() {

    if (
      document.getElementById(
        "picflowSavedButton"
      )
    ) return;


    const button =
      document.createElement(
        "button"
      );

    button.id =
      "picflowSavedButton";

    button.innerHTML =
      "🔖 Saved";


    button.style.cssText = `
      position:fixed;
      right:16px;
      bottom:145px;
      z-index:40000;
      border:0;
      background:#111;
      color:#fff;
      padding:12px 18px;
      border-radius:24px;
      font-size:15px;
      font-weight:bold;
      box-shadow:0 5px 20px rgba(0,0,0,.25);
      cursor:pointer;
    `;


    button.onclick =
      openSavedPosts;


    document.body.appendChild(
      button
    );
  }


  /* =======================================================
     WATCH FOR POSTS LOADING
     ======================================================= */

  const observer =
    new MutationObserver(
      function () {

        setupPostButtons();

      }
    );


  observer.observe(
    document.body,
    {
      childList:true,
      subtree:true
    }
  );


  setTimeout(
    function () {

      createSavedButton();
      setupPostButtons();

    },
    1800
  );


})();
