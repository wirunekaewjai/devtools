import dotenv from "dotenv";
import { Router } from "itty-router";
import { URL } from "node:url";
import { env } from "./app-info";
import { createDynamicRoutes } from "./dependencies/create-dynamic-routes";
import { createHttpServer } from "./dependencies/create-http-server";
import { createStaticRoute } from "./dependencies/create-static-route";
import { startHttpServer } from "./dependencies/start-http-server";

dotenv.config();

const AUTO_REFRESH_SCRIPT =
`<script>
async function onTick() {
  try {
    const res = await fetch('/___AUTO_REFRESH___?v=${env.id}');
    
    if (res.ok) {
      window.location.reload();
      return;
    }
  } catch {}

  setTimeout(onTick, 500);
}

document.addEventListener('DOMContentLoaded', () => {
  setTimeout(onTick, 500);
});
</script>`;

const router = Router();

router.get("/___AUTO_REFRESH___", async (req) => {
  const url = new URL(req.url);
  const v = url.searchParams.get("v");

  if (v === env.id) {
    // LONG_POLLING
    await new Promise((resolve) => setTimeout(resolve, 300_000));

    return new Response(null, {
      status: 400,
    });
  }

  return new Response(null, {
    status: 200,
  });
});

createStaticRoute(router);
createDynamicRoutes(router, async (res) => {
  const { headers, status, statusText } = res;

  if (headers.get('Content-Type') === 'text/html') {
    let text = await res.text();

    text = text.replace('</head>', `${AUTO_REFRESH_SCRIPT}</head>`);

    return new Response(text, {
      headers: Object.fromEntries(headers.entries()),
      status,
      statusText,
    });
  }

  return res;
});

const server = createHttpServer(router);

startHttpServer(server);
