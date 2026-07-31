// Cloudflare Pages Function — creates a recurring Stripe Checkout Session
// for a Comunidad plan and redirects the browser to Stripe's hosted payment
// page. Linked from the "Unirme" buttons in es/comunidad.html and
// en/community.html as a plain GET link (no client-side JS needed):
// /api/create-subscription-session?plan=mensual&lang=es
//
// Requires the same STRIPE_SECRET_KEY secret as the Kit checkout function.

const PLAN_PRICE_ID = {
  mensual: "price_1TvfjxAojxoltlLLjEyb8JVu",
  semestral: "price_1TvfjxAojxoltlLLp7YFWTDk",
  anual: "price_1TvfjxAojxoltlLLVaWa2bvM",
  monthly: "price_1TvfjxAojxoltlLLjEyb8JVu",
  semiannual: "price_1TvfjxAojxoltlLLp7YFWTDk",
  annual: "price_1TvfjxAojxoltlLLVaWa2bvM",
};

const THANK_YOU_PATH = {
  es: "/es/gracias-comunidad",
  en: "/en/thank-you-community",
};

const COMMUNITY_PAGE_PATH = {
  es: "/es/comunidad",
  en: "/en/community",
};

export async function onRequestGet(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const langParam = url.searchParams.get("lang");
  const lang = langParam === "en" ? "en" : "es";
  const plan = url.searchParams.get("plan");
  const priceId = PLAN_PRICE_ID[plan];

  if (!priceId) {
    return new Response("Plan desconocido", { status: 400 });
  }

  if (!env.STRIPE_SECRET_KEY) {
    return new Response("Falta configurar STRIPE_SECRET_KEY", { status: 500 });
  }

  const successUrl =
    `${url.origin}${THANK_YOU_PATH[lang]}?session_id={CHECKOUT_SESSION_ID}`;
  const cancelUrl = `${url.origin}${COMMUNITY_PAGE_PATH[lang]}`;

  const body = new URLSearchParams({
    mode: "subscription",
    "line_items[0][price]": priceId,
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
    return new Response(`No se pudo iniciar la suscripción: ${errText}`, { status: 502 });
  }

  const session = await stripeRes.json();

  return Response.redirect(session.url, 303);
}
