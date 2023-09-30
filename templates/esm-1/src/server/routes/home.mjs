import { $dist, $public } from '../utils/asset.mjs';
import { render, renderArray } from '../utils/view.mjs';

export const GET = async () => {
  const items = renderArray("item", [
    {
      name: "hello",
    },
    {
      name: "world",
    }
  ]);

  const html = render("home", {
    css: $dist("style.css"),
    favicon: $public("favicon.ico"),
    items,
  });

  return new Response(html, {
    headers: {
      "Content-Type": "text/html",
    },
  });
};