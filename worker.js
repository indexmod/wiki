import { editorRoute } from "./engine/editor/route.js";

export default {
  async fetch(req, env) {
    const url = new URL(req.url);

    if (url.pathname === "/editor") {
      return new Response("EDITOR ISOLATED OK");
    }

    return new Response("OK");
  }
};
