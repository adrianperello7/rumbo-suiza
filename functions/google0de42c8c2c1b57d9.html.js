export async function onRequestGet() {
  return new Response("google-site-verification: google0de42c8c2c1b57d9.html\n", {
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}
