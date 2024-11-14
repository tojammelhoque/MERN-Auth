import { MailtrapClient } from "mailtrap";

const TOKEN = "578e49747b2fc9a1300dd31ac6a8b91a";

export const mailtrapClient = new MailtrapClient({
  token: TOKEN,
});

export const sender = {
  email: "hello@demomailtrap.com",
  name: "Tojammel Hoque Mailtrap Test",
};
// const recipients = [
//   {
//     email: "tojammelhoque05@gmail.com",
//   },
// ];

// client
//   .send({
//     from: sender,
//     to: recipients,
//     subject: "You are awesome!",
//     text: "Congrats for sending test email with Mailtrap!",
//     category: "Integration Test",
//   })
//   .then(console.log, console.error);
