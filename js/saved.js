/* =========================================================
   PICFLOW SAVED POSTS
   ========================================================= */

(function () {

  if (window.picflowSavedLoaded) return;
  window.picflowSavedLoaded = true;

  function sb() {
    if (!window.supabase ||
        !window.SUPABASE_URL ||
        !window.SUPABASE_PUBLISHABLE_KEY) {
      return null;
    }

    return window.supabase.createClient(
      window.SUPABASE_URL,
      window.SUPABASE_PUBLISHABLE_KEY
    );
  }

  async function user() {
    const client = sb();
    if (!client) return null;

    const { data } = await client.auth.getUser();
    return data?.user || null;
  }

  /* SAVE / UNSAVE */

  async function toggleSave(postId, button) {

    const client = sb();
    const currentUser = await user();

    if (!client || !currentUser) {
      alert("Please login first.");
      return;
    }

    button.disabled = true;

    const existing = await client
      .from("saved_posts")
      .select("post_id")
      .eq("user_id", currentUser.id)
      .eq("post_id", postId)
      .maybeSingle();

    if (existing.error) {
      alert(existing.error.message);
      button.disabled = false;
      return;
    }

    if (existing.data) {

      const result = await client
        .from("saved_posts")
        .delete()
        .eq("user_id", currentUser.id)
        .eq("post_id", postId);

      if (result.error) {
        alert(result.error.message);
      } else {
        button.textContent = "🔖";
        button.dataset.saved = "false";
      }

    } else {

      const result = await client
        .from("saved_posts")
        .insert({
          user_id: currentUser.id,
          post_id: postId
        });

      if (result.error) {
        alert(result.error.message);
      } else {
        button.textContent = "📌";
        button.dataset.saved = "true";
      }
    }

    button.disabled = false;
  }


  /* CONNECT SAVE BUTTONS */

  async function setupSaveButtons() {

    const client = sb();
    const currentUser = await user();

    if (!client || !currentUser) return;

    document
      .querySelectorAll(".picflow-post-save")
      .forEach(async function (button) {

        if (button.dataset.savedReady) return;

        const post =
          button.closest(".picflow-real-post");

        if (!post) return;

        const postId =
          post.dataset.postId;

        if (!postId) return;

        button.dataset.savedReady = "true";

        const existing =
          await client
            .from("saved_posts")
            .select("post_id")
            .eq("user_id", currentUser.id)
            .eq("post_id", postId)
            .maybeSingle();

        button.textContent =
          existing.data ? "📌" : "🔖";

        button.dataset.saved =
          existing.data ? "true" : "false";

        button.onclick = function () {
          toggleSave(postId, button);
        };

      });
  }


  /* SAVED POSTS PAGE */

  async function showSavedPosts() {

    const client = sb();
    const currentUser = await user();

    if (!client || !currentUser) {
      alert("Please login first.");
      return;
    }

    const result =
      await client
        .from("saved_posts")
        .select("post_id, created_at")
        .eq("user_id", currentUser.id)
        .order("created_at", {
          ascending: false
        });

    if (result.error) {
      alert(
        "Saved posts failed:\n" +
        result.error.message
      );
      return;
    }

    const old =
      document.getElementById(
        "picflowSavedModal"
      );

    if (old) old.remove();

    const modal =
      document.createElement("div");

    modal.id =
      "picflowSavedModal";

    modal.style.cssText = `
      position:fixed;
      inset:0;
      z-index:60000;
      background:rgba(0,0,0,.6);
      display:flex;
      align-items:flex-end;
    `;

    const box =
      document.createElement("div");

    box.style.cssText = `
      background:#fff;
      width:100%;
      max-height:82vh;
      overflow:auto;
      border-radius:25px 25px 0 0;
      padding-bottom:25px;
    `;

    box.innerHTML = `
      <div style="
        display:flex;
        justify-content:space-between;
        align-items:center;
        padding:20px;
        border-bottom:1px solid #eee;
      ">
        <strong style="font-size:21px;">
          🔖 Saved Posts
        </strong>

        <button
          id="picflowCloseSaved"
          style="
            border:0;
            background:#eee;
            border-radius:50%;
            width:40px;
            height:40px;
            font-size:22px;
          "
        >×</button>
      </div>

      <div
        id="picflowSavedGrid"
        style="
          display:grid;
          grid-template-columns:repeat(3,1fr);
          gap:3px;
          padding:12px;
        "
      ></div>
    `;

    modal.appendChild(box);
    document.body.appendChild(modal);

    document
      .getElementById("picflowCloseSaved")
      .onclick = () => modal.remove();

    const grid =
      document.getElementById(
        "picflowSavedGrid"
      );

    const posts =
      result.data || [];

    if (!posts.length) {

      grid.innerHTML = `
        <div style="
          grid-column:1/4;
          text-align:center;
          padding:60px 20px;
          color:#888;
        ">
          <div style="font-size:45px;">🔖</div>
          <div style="
            margin-top:10px;
            font-size:18px;
          ">
            No saved posts yet
          </div>
        </div>
      `;

      return;
    }

    posts.forEach(function (item) {

      const card =
        document.createElement("div");

      card.style.cssText = `
        aspect-ratio:1;
        background:#f1f1f1;
        display:flex;
        align-items:center;
        justify-content:center;
        font-size:40px;
        cursor:pointer;
      `;

      card.innerHTML = "📸";

      card.onclick = function () {

        const original =
          document.querySelector(
            '[data-post-id="' +
            item.post_id +
            '"]'
          );

        if (original) {

          modal.remove();

          original.scrollIntoView({
            behavior:"smooth",
            block:"center"
          });

        } else {

          alert(
            "This saved post is not loaded on the current page yet."
          );

        }

      };

      grid.appendChild(card);

    });

  }


  window.showSavedPosts =
    showSavedPosts;

  window.picflowSetupSavedPosts =
    setupSaveButtons;


  /* OBSERVER */

  const observer =
    new MutationObserver(function () {
      setupSaveButtons();
    });

  observer.observe(
    document.body,
    {
      childList:true,
      subtree:true
    }
  );

  setTimeout(
    setupSaveButtons,
    1500
  );


  /* CREATE SAVED BUTTON */

  function createSavedButton() {

    if (
      document.getElementById(
        "picflowSavedButton"
      )
    ) return;

    const button =
      document.createElement("button");

    button.id =
      "picflowSavedButton";

    button.innerHTML =
      "🔖 Saved";

    button.style.cssText = `
      position:fixed;
      right:18px;
      bottom:90px;
      z-index:30000;
      border:0;
      background:#111;
      color:#fff;
      border-radius:25px;
      padding:12px 18px;
      font-size:15px;
      font-weight:bold;
      box-shadow:0 5px 20px rgba(0,0,0,.2);
    `;

    button.onclick =
      showSavedPosts;

    document.body.appendChild(button);
  }

  setTimeout(
    createSavedButton,
    1800
  );

})();
