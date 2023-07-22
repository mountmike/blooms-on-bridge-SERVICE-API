module.exports = async function sendStoreOrderConfirmation(orderId) {
  try {
    const mjml2html = require("mjml");

    const { formatCurrency } = require("../../lib/currency");
    const { orders } = require("../crystallize");
    const { sendEmail } = require("./utils");

    const order = await orders.get(orderId);

    const isPickup = order.cart.filter(product => product.sku === "delivery-pickup-from-shop").length > 0
    const deliveryMethod = order.cart.filter(product => product.sku.startsWith("delivery"))[0]
    const { email, phone } = order.customer.addresses[0];
    const delivery = order.customer.addresses[1]

    if (!email) {
      return {
        success: false,
        error: "No email found for the customer",
      };
    }

    const { html } = mjml2html(`
      <mjml>
        <mj-body>
        <mj-section>
          <mj-column>
            <mj-text>
              <h1>New Order Alert</h1>
              <p>
                Order Number: <strong>#${order.id}</strong>
              </p>
              <h3>Customer Details:</h3>
              <p>
                First name: <strong>${order.customer.firstName}</strong><br />
                Last name: <strong>${order.customer.lastName}</strong><br />
                Email address: <strong>${email}</strong>
                Phone: <strong>${phone}</strong>
              </p>
              <p>
                Additional info: <br />
                <strong>#${order.additionalInformation}</strong>
              </p>
              <h2>Delivery Details:</h2>
              ${isPickup ?
              `
              <p>
                Delivery method: <strong>${deliveryMethod.name}</strong><br />
                Requested date: <strong>This is a placeholder</strong><br />
              </p>
              `
              :
              `
              <p>
                Delivery method: <strong>${deliveryMethod.name}</strong><br />
                Requested date: <strong>This is a placeholder</strong><br />
              </p>
              <p>
                Recipient first name: <strong>${delivery.firstName}</strong><br />
                Recipient last name: <strong>${delivery.lastName}</strong><br />
                Recipient email address: <strong>${delivery.email}</strong>
                Recipient phone: <strong>${delivery.phone}</strong>
              </p>
              `
              }
              <p>
                Total: <strong>${formatCurrency({
                  amount: order.total.gross,
                  currency: order.total.currency,
                })}</strong>
              </p>
            </mj-text>
            <mj-table>
              <tr style="border-bottom: 1px solid #ecedee; text-align: left;">
                <th style="padding: 0 15px 0 0;">Name</th>
                <th style="padding: 0 15px;">Quantity</th>
                <th style="padding: 0 0 0 15px;">Total</th>
              </tr>
              ${order.cart.map(
                (item) => `<tr>
                  <td style="padding: 0 15px 0 0;">${item.name} (${
                  item.sku
                })</td>
                  <td style="padding: 0 15px;">${item.quantity}</td>
                  <td style="padding: 0 0 0 15px;">${formatCurrency({
                    amount: item.price.gross * item.quantity,
                    currency: item.price.currency,
                  })}</td>
                </tr>`
              )}
            </mj-table>
          </mj-column>
        </mj-section>
        </mj-body>
      </mjml>
    `);

    await sendEmail({
      to: "tharratt.michael@gmail.com",
      from: 'micktharratt@hotmail.com',
      subject: `New Online Order: ${order.id}`,
      html,
    });

    return {
      success: true,
    };
  } catch (error) {
    console.log(error);
    return {
      success: false,
      error,
    };
  }
};
