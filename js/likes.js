/* =========================================================
   PICFLOW REAL LIKES
   ========================================================= */

(function () {

  if (window.picflowLikesLoaded) return;
  window.picflowLikesLoaded = true;

  function sb() {
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
    const client = sb();
    if (!client) return null;

    const { data } =
      await client.auth.getUser();

    return data?.user || null;
  }

  async function updateLike(postId, button, countElement) {

    const client = sb();
    const user = await getUser();

    if (!client || !user) {
      alert("Please login first.");
      return;
    }

    button.disabled = true;

    const existing =
      await client
        .from("likes")
        .select("post_id")
        .eq("post_id", postId)
        .eq("user_id", user.id)
        .maybeSingle();

    if (existing.error) {
      alert(existing.error.message);
      button.disabled = false;
      return;
    }

    let error = null;

    if (existing.data) {

      const result =
        await client
          .from("likes")
          .delete()
          .eq("post_id", postId)
          .eq("user_id", user.id);

      error = result.error;

      if (!error) {
        button.textContent = "♡";
      }

    } else {

      const result =
        await client
          .from("likes")
          .insert({
            post_id: postId,
            user_id: user.id
          });

      error = result.error;

      if (!error) {
        button.textContent = "♥";
      }
    }

    if (error) {
      alert(error.message);
      button.disabled = false;
      return;
    }

    const count =
      await client
        .from("likes")
        .select("*", {
          count: "exact",
          head: true
        })
        .eq("post_id", postId);

    if (!count.error && countElement) {
      countElement.textContent =
        count.count || 0;
    }

    button.disabled = false;
  }


  async function setupLikes() {

    const client = sb();
    if (!client) return;

    const buttons =
      document.querySelectorAll(
        ".picflow-post-like"
      );

    for (const button of buttons) {

      const card =
        button.closest(
          ".picflow-real-post"
        );

      if (!card) continue;

      const postId =
        card.dataset.postId;

      if (!postId) continue;

      let countElement =
        card.querySelector(
          ".picflow-like-count"
        );

      if (!countElement) {

        countElement =
          document.createElement("span");

        countElement.className =
          "picflow-like-count";

        countElement.style.cssText =
          "font-size:14px;margin-left:5px;";

        button.parentElement.appendChild(
          countElement
        );
      }

      const count =
        await client
          .from("likes")
          .select("*", {
            count: "exact",
            head: true
          })
          .eq("post_id", postId);

      if (!count.error) {
        countElement.textContent =
          count.count || 0;
      }

      const user =
        await getUser();

      if (user) {

        const mine =
          await client
            .from("likes")
            .select("post_id")
            .eq("post_id", postId)
            .eq("user_id", user.id)
            .maybeSingle();

        button.textContent =
          mine.data ? "♥" : "♡";
      }

      button.onclick =
        function () {

          updateLike(
            postId,
            button,
            countElement
          );

        };
    }
  }


  window.picflowSetupLikes =
    setupLikes;


  const observer =
    new MutationObserver(
      function () {
        setupLikes();
      }
    );

  observer.observe(
    document.body,
    {
      childList: true,
      subtree: true
    }
  );

  setTimeout(
    setupLikes,
    1500
  );

})();
