/* =========================================================
   PICFLOW REAL POSTS SYSTEM
   Supabase Database + Storage
   ========================================================= */

(function () {

  if (window.picflowPostsLoaded) return;
  window.picflowPostsLoaded = true;


  function getSB() {

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


  function formatDate(date) {

    const d = new Date(date);

    if (isNaN(d.getTime())) {
      return "";
    }

    return d.toLocaleDateString(
      "en-IN",
      {
        day: "numeric",
        month: "short",
        year: "numeric"
      }
    );
  }


  /* =======================================================
     CREATE REAL POST
     ======================================================= */

  window.picflowCreateRealPost =
    async function () {

      const client = getSB();

      const user = await getUser();

      if (!client || !user) {

        alert(
          "Please login first."
        );

        return;

      }


      const input =
        document.createElement("input");

      input.type = "file";
      input.accept = "image/*";


      input.onchange =
        async function () {

          const file =
            input.files &&
            input.files[0];


          if (!file) return;


          if (!file.type.startsWith("image/")) {

            alert(
              "Please select an image."
            );

            return;

          }


          if (file.size > 10 * 1024 * 1024) {

            alert(
              "Maximum image size is 10 MB."
            );

            return;

          }


          const caption =
            prompt(
              "Write a caption (optional):"
            );


          const extension =
            (
              file.name
                .split(".")
                .pop() ||
              "jpg"
            )
            .toLowerCase()
            .replace(/[^a-z0-9]/g, "");


          const filePath =
            user.id +
            "/" +
            Date.now() +
            "-" +
            Math.random()
              .toString(36)
              .slice(2) +
            "." +
            extension;


          alert(
            "Uploading your post... 📸"
          );


          const upload =
            await client
              .storage
              .from("posts")
              .upload(
                filePath,
                file,
                {
                  cacheControl: "3600",
                  contentType: file.type,
                  upsert: false
                }
              );


          if (upload.error) {

            console.error(
              upload.error
            );

            alert(
              "Image upload failed:\n\n" +
              upload.error.message
            );

            return;

          }


          const publicURL =
            client
              .storage
              .from("posts")
              .getPublicUrl(
                filePath
              );


          const imageUrl =
            publicURL.data.publicUrl;


          const post =
            await client
              .from("posts")
              .insert({
                user_id: user.id,
                image_url: imageUrl,
                caption: caption || ""
              })
              .select()
              .single();


          if (post.error) {

            console.error(
              post.error
            );


            /* cleanup uploaded image */

            await client
              .storage
              .from("posts")
              .remove([
                filePath
              ]);


            alert(
              "Post save failed:\n\n" +
              post.error.message
            );

            return;

          }


          alert(
            "Post published successfully! 🎉"
          );


          await loadFeed();

        };


      input.click();

    };


  /* =======================================================
     OVERRIDE CREATE BUTTON
     ======================================================= */

  window.createPost =
    function () {

      window.picflowCreateRealPost();

    };


  /* =======================================================
     LOAD HOME FEED
     ======================================================= */

  async function loadFeed() {

    const client = getSB();

    if (!client) return;


    const main =
      document.querySelector(
        "#mainApp main"
      );


    if (!main) return;


    main.innerHTML = `

      <div
        id="picflowRealFeed"
        style="
          padding:10px 0 90px;
        "
      >

        <div style="
          text-align:center;
          padding:30px;
        ">
          Loading posts... ⏳
        </div>

      </div>

    `;


    const feed =
      document.getElementById(
        "picflowRealFeed"
      );


    const result =
      await client
        .from("posts")
        .select(`
          id,
          user_id,
          image_url,
          caption,
          created_at
        `)
        .order(
          "created_at",
          {
            ascending:false
          }
        )
        .limit(50);


    if (result.error) {

      console.error(
        result.error
      );


      feed.innerHTML = `

        <div style="
          text-align:center;
          padding:40px 20px;
          color:#d00;
        ">
          Failed to load posts.
          <br><br>
          ${esc(
            result.error.message
          )}
        </div>

      `;

      return;

    }


    const posts =
      result.data || [];


    if (!posts.length) {

      feed.innerHTML = `

        <div style="
          text-align:center;
          padding:60px 20px;
        ">

          <div style="
            font-size:50px;
          ">
            📸
          </div>

          <h3>
            No posts yet
          </h3>

          <p style="
            color:#777;
          ">
            Create your first PicFlow post!
          </p>

          <button
            onclick="picflowCreateRealPost()"
            style="
              border:0;
              background:#111;
              color:white;
              padding:12px 25px;
              border-radius:12px;
              font-weight:bold;
            "
          >
            Create Post
          </button>

        </div>

      `;

      return;

    }


    /* get profiles */

    const userIds =
      [
        ...new Set(
          posts.map(
            p => p.user_id
          )
        )
      ];


    const profilesResult =
      await client
        .from("profiles")
        .select(
          "id,username,bio,avatar_url"
        )
        .in(
          "id",
          userIds
        );


    const profiles =
      profilesResult.data || [];


    const profileMap =
      {};


    profiles.forEach(
      function (profile) {

        profileMap[
          profile.id
        ] = profile;

      }
    );


    feed.innerHTML = "";


    posts.forEach(
      function (post) {

        const profile =
          profileMap[
            post.user_id
          ] || {};


        const card =
          document.createElement(
            "article"
          );


        card.className =
          "picflow-real-post";


        card.dataset.postId =
          post.id;


        card.style.cssText = `
          background:white;
          border-bottom:8px solid #f5f5f5;
          padding-bottom:16px;
        `;


        const username =
          profile.username ||
          "User";


        const avatarHTML =
          profile.avatar_url

          ? `
            <img
              src="${esc(
                profile.avatar_url
              )}"
              style="
                width:42px;
                height:42px;
                border-radius:50%;
                object-fit:cover;
              "
            >
          `

          : `
            <div style="
              width:42px;
              height:42px;
              border-radius:50%;
              background:#111;
              color:white;
              display:flex;
              align-items:center;
              justify-content:center;
              font-weight:bold;
            ">
              ${esc(
                username
                  .charAt(0)
                  .toUpperCase()
              )}
            </div>
          `;


        card.innerHTML = `

          <div style="
            display:flex;
            align-items:center;
            gap:12px;
            padding:12px 15px;
          ">

            ${avatarHTML}

            <div style="flex:1;">

              <strong>
                ${esc(username)}
              </strong>

              <small style="
                display:block;
                color:#888;
                margin-top:3px;
              ">
                ${formatDate(
                  post.created_at
                )}
              </small>

            </div>

          </div>


          <img
            src="${esc(
              post.image_url
            )}"
            loading="lazy"
            style="
              width:100%;
              max-height:650px;
              object-fit:cover;
              display:block;
              background:#eee;
            "
          >


          <div style="
            padding:10px 15px 0;
          ">

            <div style="
              display:flex;
              gap:18px;
              font-size:25px;
            ">

              <button
                class="picflow-post-like"
                style="
                  border:0;
                  background:none;
                  font-size:25px;
                  padding:0;
                "
              >
                ♡
              </button>

              <button
                class="picflow-post-comment"
                style="
                  border:0;
                  background:none;
                  font-size:24px;
                  padding:0;
                "
              >
                💬
              </button>

              <button
                class="picflow-post-share"
                style="
                  border:0;
                  background:none;
                  font-size:24px;
                  padding:0;
                "
              >
                ✈
              </button>

            </div>


            <div style="
              margin-top:8px;
              font-size:14px;
            ">

              <strong>
                ${esc(username)}
              </strong>

              ${
                post.caption
                  ? " " +
                    esc(
                      post.caption
                    )
                  : ""
              }

            </div>

          </div>

        `;


        /* open profile */

        card
          .querySelector(
            "strong"
          )
          .onclick =
          function () {

            if (
              window.picflowOpenProfile
            ) {

              window.picflowOpenProfile(
                post.user_id
              );

            }

          };


        card
          .querySelector(
            ".picflow-post-share"
          )
          .onclick =
          async function () {

            const shareData = {

              title:
                "PicFlow",

              text:
                "Check this post on PicFlow!",

              url:
                location.href

            };


            if (
              navigator.share
            ) {

              try {

                await navigator.share(
                  shareData
                );

              } catch (e) {}

            } else {

              try {

                await navigator.clipboard.writeText(
                  location.href
                );

                alert(
                  "Post link copied! 🔗"
                );

              } catch (e) {

                alert(
                  "Share link: " +
                  location.href
                );

              }

            }

          };


        feed.appendChild(
          card
        );

      }
    );

  }


  /* =======================================================
     REAL PROFILE POSTS
     ======================================================= */

  async function loadProfilePosts(
    userId
  ) {

    const client = getSB();

    if (!client) return;


    const result =
      await client
        .from("posts")
        .select(
          "id,image_url,caption,created_at"
        )
        .eq(
          "user_id",
          userId
        )
        .order(
          "created_at",
          {
            ascending:false
          }
        );


    if (result.error) {

      console.error(
        result.error
      );

      return;

    }


    const posts =
      result.data || [];


    const modal =
      document.getElementById(
        "picflowPublicProfile"
      );


    if (!modal) return;


    /* Find Posts heading */

    const headings =
      Array.from(
        modal.querySelectorAll(
          "h3"
        )
      );


    const heading =
      headings.find(
        h =>
          h.textContent
            .trim()
            .toLowerCase()
            === "posts"
      );


    if (!heading) return;


    const oldGrid =
      heading.nextElementSibling;


    if (
      oldGrid
    ) {

      oldGrid.remove();

    }


    const grid =
      document.createElement(
        "div"
      );


    grid.style.cssText = `
      display:grid;
      grid-template-columns:repeat(3,1fr);
      gap:3px;
    `;


    if (!posts.length) {

      grid.innerHTML = `

        <div style="
          grid-column:1 / -1;
          text-align:center;
          padding:40px 10px;
          color:#777;
        ">
          No posts yet 📸
        </div>

      `;

    } else {

      posts.forEach(
        function (post) {

          const item =
            document.createElement(
              "div"
            );


          item.style.cssText = `
            aspect-ratio:1;
            overflow:hidden;
            background:#eee;
            cursor:pointer;
          `;


          item.innerHTML = `

            <img
              src="${esc(
                post.image_url
              )}"
              loading="lazy"
              style="
                width:100%;
                height:100%;
                object-fit:cover;
              "
            >

          `;


          item.onclick =
            function () {

              window.picflowOpenPostImage(
                post.image_url,
                post.caption || ""
              );

            };


          grid.appendChild(
            item
          );

        }
      );

    }


    heading.parentNode.appendChild(
      grid
    );

  }


  /* =======================================================
     POST IMAGE VIEWER
     ======================================================= */

  window.picflowOpenPostImage =
    function (
      imageUrl,
      caption
    ) {

      const old =
        document.getElementById(
          "picflowPostViewer"
        );

      if (old) old.remove();


      const viewer =
        document.createElement(
          "div"
        );


      viewer.id =
        "picflowPostViewer";


      viewer.innerHTML = `

        <div style="
          position:fixed;
          inset:0;
          z-index:30000;
          background:rgba(0,0,0,.95);
          display:flex;
          align-items:center;
          justify-content:center;
          flex-direction:column;
          padding:20px;
        ">

          <button
            id="closePicflowPost"
            style="
              position:absolute;
              top:20px;
              right:20px;
              width:42px;
              height:42px;
              border:0;
              border-radius:50%;
              background:white;
              font-size:25px;
            "
          >
            ×
          </button>


          <img
            src="${esc(imageUrl)}"
            style="
              max-width:100%;
              max-height:75vh;
              object-fit:contain;
            "
          >


          ${
            caption
              ? `
                <div style="
                  color:white;
                  margin-top:15px;
                  text-align:center;
                ">
                  ${esc(caption)}
                </div>
              `
              : ""
          }

        </div>

      `;


      document.body.appendChild(
        viewer
      );


      document
        .getElementById(
          "closePicflowPost"
        )
        .onclick =
        function () {

          viewer.remove();

        };

    };


  /* =======================================================
     WATCH PUBLIC PROFILE MODAL
     ======================================================= */

  function watchProfiles() {

    const observer =
      new MutationObserver(
        function () {

          const modal =
            document.getElementById(
              "picflowPublicProfile"
            );


          if (
            modal &&
            !modal.dataset.postsLoaded
          ) {

            modal.dataset.postsLoaded =
              "true";


            /* Try to find username */

            const buttons =
              modal.querySelectorAll(
                "button"
              );


            /* social.js doesn't expose id,
               so use wrapper when possible */

            if (
              window.picflowCurrentProfileId
            ) {

              loadProfilePosts(
                window.picflowCurrentProfileId
              );

            }

          }

        }
      );


    observer.observe(
      document.body,
      {
        childList:true,
        subtree:true
      }
    );

  }


  /* =======================================================
     WRAP PUBLIC PROFILE FUNCTION
     ======================================================= */

  function wrapProfile() {

    if (
      !window.picflowOpenProfile
    ) {

      setTimeout(
        wrapProfile,
        300
      );

      return;

    }


    if (
      window.picflowPostsProfileWrapped
    ) return;


    const original =
      window.picflowOpenProfile;


    window.picflowOpenProfile =
      async function (
        userId
      ) {

        window.picflowCurrentProfileId =
          userId;


        await original(
          userId
        );


        await loadProfilePosts(
          userId
        );

      };


    window.picflowPostsProfileWrapped =
      true;

  }


  function start() {

    wrapProfile();

    watchProfiles();

    loadFeed();

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
