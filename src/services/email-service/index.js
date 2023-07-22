const { sendEmail } = require("./utils");

const sendStoreOrderConfirmation = require("./store-order-confirmation");
const sendCustomerOrderConfirmation = require("./customer-order-confirmation");
const sendUserMagicLink = require("./user-magic-link");

module.exports = {
  sendEmail,
  sendStoreOrderConfirmation,
  sendCustomerOrderConfirmation,
  sendUserMagicLink,
};
