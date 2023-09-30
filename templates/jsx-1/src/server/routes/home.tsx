import { $dist, $public } from "../utils/asset";

export const GET = async () => {
  const html = (
    <html lang="th">
      <head>
        <link rel="icon" src={$public("favicon.ico")} />
        <link rel="stylesheet" href={$dist("style.css")} />
        <title>Hello, World</title>
      </head>
      <body class="bg-gray-200 p-4">
        <div>Boiler Plate</div>
      </body>
    </html>
  );

  return new Response(html, {
    headers: {
      "Content-Type": "text/html",
    },
  });
};