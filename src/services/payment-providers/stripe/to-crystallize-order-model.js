module.exports = async function stripeToCrystallizeOrderModel({
  basket,
  checkoutModel,
  paymentIntentId,
  customerIdentifier,
}) {
  const { getClient } = require("./utils");

  const paymentIntent = await getClient().paymentIntents.retrieve(
    paymentIntentId, {
    expand: ['latest_charge']
    }
  );

  const charge = paymentIntent.latest_charge;
  const { addresses } = checkoutModel.customer
  const metadata = `DELIVERY DATE ${checkoutModel.customer.deliveryDate} CUSTOMER NOTES: ${checkoutModel.customer.notes}`

  const customerName = charge.billing_details.name.split(" ");
  let email = charge.receipt_email;
  if (!email && checkoutModel.customer && checkoutModel.customer.addresses) {
    const addressWithEmail = checkoutModel.customer.addresses.find(
      (a) => !!a.email
    );
    if (addressWithEmail) {
      email = addressWithEmail.email;
    }
  }

  const meta = [];
  if (paymentIntent.merchant_data) {
    meta.push({
      key: "stripeMerchantData",
      value: JSON.stringify(paymentIntent.merchant_data),
    });
  }

  return {
    cart: basket.cart,
    total: basket.total,
    meta,
    customer: {
      identifier: customerIdentifier,
      firstName: customerName[0],
      middleName: customerName.slice(1, customerName.length - 1).join(),
      lastName: customerName[customerName.length - 1],
      birthDate: Date,
      addresses: [
        {
          type: "billing",
          firstName: customerName[0],
          middleName: customerName.slice(1, customerName.length - 1).join(),
          lastName: customerName[customerName.length - 1],
          street: addresses[0].unitNumber,
          street2: addresses[0].streetNumber + " " + addresses[0].streetName,
          postalCode: addresses[0].postcode,
          city: addresses[0].suburb,
          state: addresses[0].territory,
          country: charge.billing_details.address.country,
          phone: addresses[0].phone,
          email: addresses[0].email,
        },
        {
          type: "delivery",
          firstName: customerName[0],
          middleName: customerName.slice(1, customerName.length - 1).join(),
          lastName: customerName[customerName.length - 1],
          street: addresses[1].unitNumber,
          street2: addresses[1].streetNumber + " " + addresses[1].streetName,
          postalCode: addresses[1].postcode,
          city: addresses[1].suburb,
          state: addresses[1].territory,
          country: charge.billing_details.address.country,
          phone: addresses[1].phone,
          email: addresses[1].email,
        },
      ],
    },
    payment: [
      {
        provider: "stripe",
        stripe: {
          stripe: charge.id,
          customerId: charge.customer,
          orderId: charge.payment_intent,
          paymentMethod: charge.payment_method_details.type,
          paymentMethodId: charge.payment_method,
          paymentIntentId: charge.payment_intent,
          subscriptionId: charge.subscription,
          metadata,
        },
      },
    ],
  };
};
