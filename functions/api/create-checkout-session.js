// Cloudflare Pages Function — creates a Stripe Checkout Session for the
// Kit de Mudanza and redirects the browser straight to Stripe's hosted
// payment page. Linked from the "Comprar ahora" / "Buy now" button in
// es/kit.html and en/kit.html as a plain GET link (no client-side JS
// needed): /api/create-checkout-session?lang=es
//
// Requires the same STRIPE_SECRET_KEY secret as download-kit.js.

const KIT_PRICE_ID = "price_1TvfjyAojxoltlLL5l9ZQUA5";

const THANK_YOU_PATH = {
  es: "/es/gracias-kit",
  en: "/en/thank-you-kit",
};

const KIT_PAGE_PATH = {
  es: "/es/kit",
  en: "/en/kit",
};

export async function onRequestGet(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const langParam = url.searchParams.get("lang");
  const lang = langParam === "en" ? "en" : "es";

  if (!env.STRIPE_SECRET_KEY) {
    return new Response("Falta configurar STRIPE_SECRET_KEY", { status: 500 });
  }

  const successUrl =
    `${url.origin}${THANK_YOU_PATH[lang]}?session_id={CHECKOUT_SESSION_ID}`;
  const cancelUrl = `${url.origin}${KIT_PAGE_PATH[lang]}`;

  const body = new URLSearchParams({
    mode: "payment",
    "line_items[0][price]": KIT_PRICE_ID,
    "line_items[0][quantity]": "1",
    success_url: successUrl,
    cancel_url: cancelUrl,
  });

  const stripeRes = await fetch("https://api.stripe.com/v1/checkout/sessions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.STRIPE_SECRET_KEY}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: body.toString(),
  });

  if (!stripeRes.ok) {
    const errText = await stripeRes.text();
    return new Response(`No se pudo iniciar el pago: ${errText}`, { status: 502 });
  }

  const session = await stripeRes.json();

  return Response.redirect(session.url, 303);
}
