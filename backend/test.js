const nodemailer = require("nodemailer");
require("dotenv").config();

async function sendTestEmail() {
  console.log("📬 sending test email...");

  const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: process.env.MYEMAIL,
      pass: process.env.MYPASSWORD,
    },
    logger: true,
    debug: true,
  });

  try {
    const info = await transporter.sendMail({
      from: process.env.MYEMAIL,
      to: process.env.MYEMAIL, // test: send to self
      subject: "Test Email ✔️",
      text: "Hello, this is a Nodemailer test email.",
    });

    console.log("✅ Message sent successfully:", info);
  } catch (err) {
    console.error("❌ Error occurred while sending:", err.stack || err.message);
  }
}

sendTestEmail();
