import type { IncomingMessage, Server, ServerResponse } from "node:http";

export function startHttpServer(
  server: Server<typeof IncomingMessage, typeof ServerResponse>
) {
  const HOST = "0.0.0.0";
  const PORT = Number(process.env.PORT || 3000);

  server.listen(PORT, HOST, () => {
    console.log();
    console.log(`Listening on http://${HOST}:${PORT}`);
  });
}
