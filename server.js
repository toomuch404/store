const express = require("express");
const app = express();
const { resolve } = require("path");
// Copy the .env.example in the root into a .env file in this folder

const env = require("dotenv").config({ patsetuph: "./.env" });
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

app.get("/", (_, res) => {
  const path = resolve("./client/index.html");
  res.sendFile(path);
});

app.use(express.static("./client"));
app.use(
  express.json({
    // We need the raw body to verify webhook signatures.
    // Let's compute it only when hitting the Stripe webhook endpoint.
    verify: function (req, res, buf) {
      if (req.originalUrl.startsWith("/webhook")) {
        req.rawBody = buf.toString();
      }
    },
  })
);

app.post("/create-checkout-session", async (req, res) => {
  const domainURL = req.headers.referer;
  const { priceId } = req.body;

  // Create new Checkout Session for the order
  // Other optional params include:
  // [billing_address_collection] - to display billing address details on the page
  // [customer] - if you have an existing Stripe Customer ID
  // [customer_email] - lets you prefill the email input in the form
  // For full details see https://stripe.com/docs/api/checkout/sessions/create
  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    payment_method_types: ["card"],
    billing_address_collection: "auto",
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    // ?session_id={CHECKOUT_SESSION_ID} means the redirect will have the session ID set as a query param
    success_url: `${domainURL}success.html?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${domainURL}cancelled.html`,
  });

  res.send({
    sessionId: session.id,
  });
});

app.get("/setup", async (req, res) => {
  const subscriptions = await stripe.plans.list({
    limit: 2,
  });

  // We should filter the inactive plans and create an array of plans with pricing details
  const listOfActivePlans = subscriptions.data
    .filter((plan) => plan.active)
    .map((plan) => {
      const currency = plan.currency.toUpperCase();
      const amount = (plan.amount / 100).toFixed(2);
      const price = `${currency} ${amount} per ${plan.interval}`;

      return {
        priceId: plan.id,
        price,
        metadata: plan.metadata,
      };
    });

  res.send({
    publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
    listOfActivePlans,
  });
});

// Webhook handler for asynchronous events.
app.post("/webhook", async (req, res) => {
  let eventType;
  // Check if webhook signing is configured.
  if (process.env.STRIPE_WEBHOOK_SECRET) {
    // Retrieve the event by verifying the signature using the raw body and secret.
    let event;
    let signature = req.headers["stripe-signature"];

    try {
      event = stripe.webhooks.constructEvent(
        req.rawBody,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      console.log(`⚠️  Webhook signature verification failed.`);
      return res.sendStatus(400);
    }
    // Extract the object from the event.
    eventType = event.type;
  } else {
    // Webhook signing is recommended, but if the secret is not configured in `config.js`,
    // retrieve the event data directly from the request body.
    eventType = req.body.type;
  }

  if (eventType === "checkout.session.completed") {
    console.log(`🔔  Payment received!`);
  }

  res.sendStatus(200);
});

// Redirect to 404 pages for unhandled URL
app.get("*", (_, res) => {
  const path = resolve("./client/404.html");
  res.sendFile(path);
});

app.listen(4242, () => console.log(`Node server listening on port ${4242}!`));
