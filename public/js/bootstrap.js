document.getElementById("save").onclick = async () => {
  const title = document.getElementById("title").value;
  const content = document.getElementById("content").value;

  const slug = title
    ? title.toLowerCase().trim().replace(/\s+/g, "-")
    : "page-" + Date.now();

  await fetch(`/api/page/${slug}`, {
    method: "POST",
    body: JSON.stringify({ title, content })
  });

  window.location.href = "/";
};
