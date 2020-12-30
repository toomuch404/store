# Store

### [Live Demo](https://idpi0.sse.codesandbox.io/) or Fork at [CodeSandbox](https://codesandbox.io/s/toomuch-store-idpi0)

Subscribe to my kisses monthly or annually. 😬

## Tech Stack

1. Vanila JavaScript (Frontend)
1. Express (Backend)
1. Stripe Checkout (Payment)

## Setup

1. **Create a [Stripe account](https://dashboard.stripe.com) and [add two payment options](https://dashboard.stripe.com/products/create).** We are adding metadata to the plans; `plan_description` and `plan_title`.

   Warning: you might have to use API calls to update the plans detail. Updating directly from Stripe Dashboard does not work for me. Go to the [Plan API docs](https://stripe.com/docs/api/plans/update) and grab the `cURL` example at the right side of the page. If you are logged in to Stripe, the secret key is already appended in the document. Very noice.

   Change the priceId `price_123` for the respectively plan and secret key `sk_test_123`.

   ### Add metadata:

   ```
   curl https://api.stripe.com/v1/plans/price_123 \
   -u sk_test_123: \
   -d "metadata[plan_description]"="1 kiss per month"

   curl https://api.stripe.com/v1/plans/price_123 \
   -u sk_test_123: \
   -d "metadata[plan_title]"="Monthly Plan"
   ```

   ### Remove metadata:

   ```
   curl https://api.stripe.com/v1/plans/price_123 \
   -u sk_test_123: \
   -d "metadata[plan_description]"=

   curl https://api.stripe.com/v1/plans/price_123 \
   -u sk_test_123: \
   -d "metadata[plan_title]"=
   ```

2. **Test locally**

   ```
   npm install
   npm run env // Remember to update your secrets
   npm dev
   ```

3. Test with Fake Credit Card Number with any CVC and future expiry date, duh

   ```
   4242 4242 4242 4242
   ```

## References

[OG demo](https://github.com/stripe-samples/checkout-single-subscription)

## Others

P/S: What's with stripe and 4242?
