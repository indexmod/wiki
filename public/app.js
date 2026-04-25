async function save() {
  const value = document.getElementById("text").value;

  await fetch("/api/save", {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({
      key: "page1",
      value
    })
  });

  alert("saved");
}

async function load() {
  const res = await fetch("/api/get?key=page1");
  const text = await res.text();

  document.getElementById("text").value = text;
}

load();
