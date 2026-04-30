export function getNav(path) {
  if (path === "/editor") {
    return `<a href="/" class="ui-link">Save</a>`;
  }

  return `<a href="/editor" class="ui-link">New</a>`;
}
