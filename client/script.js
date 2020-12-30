// Create a Checkout Session with the selected plan ID
var createCheckoutSession = function (priceId) {
  return fetch("/create-checkout-session", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      priceId: priceId,
    }),
  }).then(function (result) {
    return result.json();
  });
};

// Handle any errors returned from Checkout
var handleResult = function (result) {
  if (result.error) {
    var displayError = document.getElementById("error-message");
    displayError.textContent = result.error.message;
  }
};

/* Get your Stripe publishable key to initialize Stripe.js */
fetch("/setup")
  .then(function (result) {
    return result.json();
  })
  .then(function (json) {
    var publishableKey = json.publishableKey;
    var listOfActivePlans = json.listOfActivePlans;

    updateSubscriptionPlans(listOfActivePlans);

    var stripe = Stripe(publishableKey);
    // Setup event handler to create a Checkout Session when button is clicked
    document.querySelectorAll(".plan-button").forEach((button) => {
      button.addEventListener("click", function (evt) {
        var priceId = evt.target.id;
        createCheckoutSession(priceId).then(function (data) {
          // Call Stripe.js method to redirect to the new Checkout page
          stripe
            .redirectToCheckout({
              sessionId: data.sessionId,
            })
            .then(handleResult);
        });
      });
    });
  });

function updateSubscriptionPlans(listOfActivePlans) {
  var planContainer = document.getElementById("plans");
  var planClone = planContainer.children[0];
  var numberOfPlaceholder = planContainer.children.length;

  for (var index = 0; index < numberOfPlaceholder; index++) {
    planContainer.children[0].remove();
  }

  listOfActivePlans.forEach((plan, id) => {
    var newPlan = planClone.cloneNode(true);
    var title = newPlan.querySelector(".plan-title");
    var description = newPlan.querySelector(".plan-description");
    var button = newPlan.querySelector(".plan-button");
    var image = newPlan.querySelector(".plan-image");

    title.innerText = plan.metadata.item_title;
    description.innerText = plan.metadata.item_description;
    button.innerText = plan.price;
    button.id = plan.priceId;
    // Get a different picsum image by passing a different id
    image.src = image.src.split("=")[0] + id;
    planContainer.appendChild(newPlan);
  });
}
