/* =========================================================
   PICFLOW SOCIAL PROFILE
   Public Profile + Followers + Following
   ========================================================= */

(function () {

  if (window.picflowSocialLoaded) return;
  window.picflowSocialLoaded = true;

  function sb() {
    if (!window.supabase) return null;

    return window.supabase.createClient(
      window.SUPABASE_URL,
      window.SUPABASE_PUBLISHABLE_KEY
    );
  }

  async function currentUser() {
    const client = sb();
    if (!client) return null;

    const { data } = await client.auth.getUser();

    return data && data.user
      ? data.user
      : null;
  }

  function esc(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function avatar(url, username, size) {

    size = size || 70;

    if (url) {
      return `
        <img
          src="${esc(url)}"
          style="
            width:${size}px;
            height:${size}px;
            border-radius:50%;
            object-fit:cover;
            display:block;
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
        font-size:${Math.round(size / 2.4)}px;
        font-weight:800;
      ">
        ${esc(
          (username || "U")
            .charAt(0)
            .toUpperCase()
        )}
      </div>
    `;
  }


  /* =======================================================
     FOLLOW STATUS
     ======================================================= */

  async function isFollowing(targetId) {

    const client = sb();
    const me = await currentUser();

    if (!client || !me) return false;

    const { data } = await client
      .from("follows")
      .select("follower_id")
      .eq("follower_id", me.id)
      .eq("following_id", targetId)
      .maybeSingle();

    return !!data;
  }


  async function followStats(userId) {

    const client = sb();

    const [followers, following] =
      await Promise.all([

        client
          .from("follows")
          .select("*", {
            count:"exact",
            head:true
          })
          .eq("following_id", userId),

        client
          .from("follows")
          .select("*", {
            count:"exact",
            head:true
          })
          .eq("follower_id", userId)

      ]);

    return {
      followers: followers.count || 0,
      following: following.count || 0
    };
  }


  /* =======================================================
     PUBLIC PROFILE
     ======================================================= */

  window.picflowOpenProfile = async function (userId) {

    const client = sb();

    if (!client || !userId) {
      alert("Profile open failed.");
      return;
    }

    const old =
      document.getElementById(
        "picflowPublicProfile"
      );

    if (old) old.remove();


    const { data: profile, error } =
      await client
        .from("profiles")
        .select(
          "id,username,bio,avatar_url"
        )
        .eq("id", userId)
        .maybeSingle();


    if (error || !profile) {
      alert(
        "Profile load failed:\n\n" +
        (error ? error.message : "User not found")
      );
      return;
    }


    const me = await currentUser();

    const stats =
      await followStats(userId);

    const following =
      await isFollowing(userId);


    const modal =
      document.createElement("div");

    modal.id =
      "picflowPublicProfile";


    modal.innerHTML = `

      <div style="
        position:fixed;
        inset:0;
        z-index:15000;
        background:rgba(0,0,0,.65);
        display:flex;
        align-items:flex-end;
        justify-content:center;
      ">

        <div style="
          width:100%;
          max-width:600px;
          max-height:92vh;
          overflow:auto;
          background:#fff;
          border-radius:26px 26px 0 0;
        ">


          <!-- HEADER -->

          <div style="
            display:flex;
            align-items:center;
            justify-content:space-between;
            padding:16px 20px;
            border-bottom:1px solid #eee;
          ">

            <strong style="
              font-size:20px;
            ">
              ${esc(profile.username)}
            </strong>

            <button
              id="picflowProfileClose"
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


          <!-- PROFILE -->

          <div style="
            padding:25px 20px;
          ">


            <div style="
              display:flex;
              align-items:center;
              gap:20px;
            ">

              ${avatar(
                profile.avatar_url,
                profile.username,
                95
              )}


              <div style="
                flex:1;
                display:flex;
                justify-content:space-around;
                text-align:center;
              ">

                <div>
                  <strong style="font-size:18px;">
                    0
                  </strong>

                  <small style="
                    display:block;
                    color:#777;
                    margin-top:5px;
                  ">
                    Posts
                  </small>
                </div>


                <button
                  id="profileFollowers"
                  style="
                    border:0;
                    background:none;
                    padding:0;
                    font:inherit;
                    cursor:pointer;
                  "
                >

                  <strong
                    id="profileFollowersNumber"
                    style="font-size:18px;"
                  >
                    ${stats.followers}
                  </strong>

                  <small style="
                    display:block;
                    color:#777;
                    margin-top:5px;
                  ">
                    Followers
                  </small>

                </button>


                <button
                  id="profileFollowing"
                  style="
                    border:0;
                    background:none;
                    padding:0;
                    font:inherit;
                    cursor:pointer;
                  "
                >

                  <strong
                    style="font-size:18px;"
                  >
                    ${stats.following}
                  </strong>

                  <small style="
                    display:block;
                    color:#777;
                    margin-top:5px;
                  ">
                    Following
                  </small>

                </button>

              </div>

            </div>


            <div style="
              margin-top:20px;
            ">

              <strong style="
                font-size:18px;
              ">
                ${esc(profile.username)}
              </strong>

              <p style="
                color:#666;
                line-height:1.5;
                margin:7px 0 16px;
              ">
                ${esc(
                  profile.bio ||
                  "Welcome to PicFlow ✨"
                )}
              </p>


              ${
                me && me.id !== userId
                ? `

                  <button
                    id="picflowProfileFollow"
                    style="
                      width:100%;
                      padding:13px;
                      border:0;
                      border-radius:12px;
                      font-size:16px;
                      font-weight:800;
                      background:${following ? "#eee" : "#111"};
                      color:${following ? "#111" : "#fff"};
                    "
                  >
                    ${following ? "Following" : "Follow"}
                  </button>

                `
                : ""
              }

            </div>


            <!-- POSTS -->

            <div style="
              margin-top:28px;
              border-top:1px solid #eee;
              padding-top:18px;
            ">

              <h3 style="
                margin:0 0 12px;
              ">
                Posts
              </h3>


              <div style="
                display:grid;
                grid-template-columns:repeat(3,1fr);
                gap:3px;
              ">

                <div style="
                  aspect-ratio:1;
                  background:#f0f0f0;
                  display:flex;
                  align-items:center;
                  justify-content:center;
                  font-size:30px;
                ">
                  📸
                </div>

                <div style="
                  aspect-ratio:1;
                  background:#f0f0f0;
                  display:flex;
                  align-items:center;
                  justify-content:center;
                  font-size:30px;
                ">
                  🌄
                </div>

                <div style="
                  aspect-ratio:1;
                  background:#f0f0f0;
                  display:flex;
                  align-items:center;
                  justify-content:center;
                  font-size:30px;
                ">
                  ✨
                </div>

              </div>

            </div>

          </div>

        </div>

      </div>

    `;


    document.body.appendChild(modal);


    document
      .getElementById(
        "picflowProfileClose"
      )
      .onclick = function () {
        modal.remove();
      };


    /* FOLLOW */

    const followButton =
      document.getElementById(
        "picflowProfileFollow"
      );


    if (followButton && me) {

      let currentlyFollowing =
        following;


      followButton.onclick =
        async function () {

          followButton.disabled = true;
          followButton.textContent =
            "Please wait...";


          let result;


          if (currentlyFollowing) {

            result =
              await client
                .from("follows")
                .delete()
                .eq(
                  "follower_id",
                  me.id
                )
                .eq(
                  "following_id",
                  userId
                );

          } else {

            result =
              await client
                .from("follows")
                .insert({
                  follower_id: me.id,
                  following_id: userId
                });

          }


          if (result.error) {

            alert(
              result.error.message
            );

            followButton.disabled =
              false;

            followButton.textContent =
              currentlyFollowing
                ? "Following"
                : "Follow";

            return;
          }


          currentlyFollowing =
            !currentlyFollowing;


          followButton.textContent =
            currentlyFollowing
              ? "Following"
              : "Follow";


          followButton.style.background =
            currentlyFollowing
              ? "#eee"
              : "#111";


          followButton.style.color =
            currentlyFollowing
              ? "#111"
              : "#fff";


          const newStats =
            await followStats(userId);


          const followerNumber =
            document.getElementById(
              "profileFollowersNumber"
            );


          if (followerNumber) {

            followerNumber.textContent =
              newStats.followers;

          }


          followButton.disabled =
            false;

        };

    }


    /* FOLLOWERS LIST */

    document
      .getElementById(
        "profileFollowers"
      )
      .onclick = function () {

        openFollowList(
          userId,
          "followers"
        );

      };


    /* FOLLOWING LIST */

    document
      .getElementById(
        "profileFollowing"
      )
      .onclick = function () {

        openFollowList(
          userId,
          "following"
        );

      };

  };


  /* =======================================================
     FOLLOWERS / FOLLOWING
     ======================================================= */

  async function openFollowList(
    userId,
    type
  ) {

    const client = sb();

    const column =
      type === "followers"
        ? "following_id"
        : "follower_id";

    const target =
      type === "followers"
        ? "follower_id"
        : "following_id";


    const { data, error } =
      await client
        .from("follows")
        .select(target)
        .eq(column, userId);


    if (error) {

      alert(error.message);
      return;

    }


    const ids =
      (data || []).map(
        row => row[target]
      );


    const list =
      document.createElement("div");

    list.id =
      "picflowFollowList";


    list.innerHTML = `

      <div style="
        position:fixed;
        inset:0;
        z-index:16000;
        background:rgba(0,0,0,.65);
        display:flex;
        align-items:flex-end;
        justify-content:center;
      ">

        <div style="
          width:100%;
          max-width:600px;
          max-height:80vh;
          overflow:auto;
          background:#fff;
          border-radius:25px 25px 0 0;
        ">

          <div style="
            display:flex;
            justify-content:space-between;
            align-items:center;
            padding:16px 20px;
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
              id="picflowFollowListClose"
              style="
                width:38px;
                height:38px;
                border:0;
                border-radius:50%;
                background:#eee;
                font-size:22px;
              "
            >
              ×
            </button>

          </div>


          <div
            id="picflowFollowListItems"
            style="padding:10px 20px;"
          >
          </div>

        </div>

      </div>

    `;


    document.body.appendChild(list);


    document
      .getElementById(
        "picflowFollowListClose"
      )
      .onclick = function () {
        list.remove();
      };


    const container =
      document.getElementById(
        "picflowFollowListItems"
      );


    if (!ids.length) {

      container.innerHTML = `

        <div style="
          text-align:center;
          padding:40px 10px;
          color:#777;
        ">
          No ${
            type === "followers"
              ? "followers"
              : "following"
          } yet.
        </div>

      `;

      return;
    }


    const { data: profiles } =
      await client
        .from("profiles")
        .select(
          "id,username,bio,avatar_url"
        )
        .in("id", ids);


    (profiles || []).forEach(
      function (profile) {

        const row =
          document.createElement("div");


        row.style.cssText = `
          display:flex;
          align-items:center;
          gap:12px;
          padding:12px 0;
          border-bottom:1px solid #eee;
          cursor:pointer;
        `;


        row.innerHTML = `

          ${avatar(
            profile.avatar_url,
            profile.username,
            50
          )}

          <div style="flex:1;">

            <strong>
              ${esc(profile.username)}
            </strong>

            <div style="
              color:#777;
              font-size:13px;
              margin-top:3px;
            ">
              ${esc(profile.bio || "")}
            </div>

          </div>

          <span style="
            font-size:24px;
            color:#999;
          ">
            ›
          </span>

        `;


        row.onclick =
          function () {

            list.remove();

            window.picflowOpenProfile(
              profile.id
            );

          };


        container.appendChild(row);

      }
    );

  }


  /* =======================================================
     MAKE EXISTING PEOPLE CARDS CLICKABLE
     ======================================================= */

  function makePeopleCardsClickable() {

    const results =
      document.getElementById(
        "picflowPeopleResults"
      );

    if (!results) return;


    const cards =
      results.children;


    Array.from(cards).forEach(
      function (card) {

        if (
          card.dataset.picflowProfileReady
        ) return;


        const button =
          card.querySelector(
            ".picflow-follow-btn"
          );


        if (!button) return;


        const userId =
          button.dataset.userId;


        if (!userId) return;


        card.dataset.picflowProfileReady =
          "true";


        card.style.cursor =
          "pointer";


        card.addEventListener(
          "click",
          function (event) {

            if (
              event.target.closest(
                ".picflow-follow-btn"
              )
            ) {
              return;
            }


            window.picflowOpenProfile(
              userId
            );

          }
        );

      }
    );

  }


  /* Watch People search results */

  const observer =
    new MutationObserver(
      function () {

        makePeopleCardsClickable();

      }
    );


  function start() {

    const results =
      document.getElementById(
        "picflowPeopleResults"
      );


    if (results) {

      observer.observe(
        results,
        {
          childList:true,
          subtree:true
        }
      );

      makePeopleCardsClickable();

    }

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
