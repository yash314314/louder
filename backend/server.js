const express = require("express");
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");
const cron = require("node-cron");
const scrapeEventbrite = require("./scrapper/sites/eventbrite.js");
const z = require("zod");
const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, "scrapper", "events.json");
const email_file = path.join(__dirname, "email.json");
const nodemailer = require("nodemailer"); 
const cors = require("cors");
const runScraper = require("./scrapper/scrape.js");
const emailSchema = z.object({
  email: z.string().email(),
  emailId: z.string()
});
app.use(cors());
console.log("email file", email_file);
dotenv.config();
app.use(express.json());
app.get("/api/events", (req, res) => {
  try {
    const events = JSON.parse(fs.readFileSync(DATA_FILE, "utf-8"));
    console.log("backend was hit for events");
    res.json(events);
  } catch (err) {
    console.error("Error reading events file:", err);
    res.status(500).json({ error: "Failed to load events" });
  }
});

const loadEmails = () => {
  if (!fs.existsSync(email_file)) return [];
  return JSON.parse(fs.readFileSync(email_file, "utf-8"));
};
function writeUsers(users) {
  fs.writeFileSync(email_file, JSON.stringify(users, null, 2));
}



async function sendConfirmationEmail(email, token) {
  // Validate inputs
  if (!email || !token) {
    throw new Error("Missing email or token");
  }

  if (!process.env.MYEMAIL || !process.env.MYPASSWORD) {
    throw new Error("Missing environment variables MYEMAIL or MYPASSWORD");
  }

  try {
    console.log("📬 Attempting to send confirmation email...");
    
    // Create transporter with more robust configuration
    let transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.MYEMAIL,
    pass: process.env.MYPASSWORD
  }
    });

    // Verify connection configuration
    transporter.verify((error, success) => {
      if (error) {
        console.error('❌ Server verification failed:', error);
      } else {
        console.log('✅ Server is ready to take our messages');
      }
    });

    const confirmUrl = `http://localhost:3000/confirm?token=${token}`;

    // Email options with HTML alternative
    const mailOptions = {
      from: `"Your App Name" <${process.env.MYEMAIL}>`,
      to: process.env.MYEMAIL, // test: send to self
      subject: "Please confirm your email",
      text: `Click this link to confirm your signup: ${confirmUrl}`,
      html: `<p>Click <a href="${confirmUrl}">this link</a> to confirm your signup</p>`
    };

    // Send email
    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Email sent successfully:", info.messageId);
    console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
    
    return info;
  } catch (err) {
    console.error("❌ Failed to send confirmation email");
    console.error("Full error:", err);
    throw err; // Re-throw to allow caller to handle
  }
}

// POST /signup
app.post("/signup", async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: "Email is required" });
  }
  const emails = JSON.parse(fs.readFileSync("email.json", "utf-8"));

  if (emails.includes(email)) {
    return res.status(400).json({ error: "Email already registered" });
  }


  emails.push(email);
  fs.writeFileSync("email.json", JSON.stringify(emails, null, 2));

  res.json({ message: "✅ You are signed up!" });

});

app.get("/confirm", (req, res) => {
  const { token } = req.query;
  if (!token) return res.status(400).send("Token is required");

  const emails = loadEmails();

  const email = emails.find((u) => u.token === token);

  if (!email) {
    return res.status(400).send("Invalid or expired token.");
  }

  if (email.confirmed) {
    return res.send("Email already confirmed.");
  }

  email.confirmed = true;

  writeUsers(emails);

  res.send("Thank you! Your email is confirmed.");
});

setInterval(async () => {
  try {
    console.log("⏳ Running scheduled scrape...");
    const events = await runScraper();
    console.log(`✅ Scraped ${events.length} events`);
  } catch (err) {
    console.error("❌ Scheduled scrape failed:", err.message);
  }
}, 10 * 60 * 1000);
app.listen(PORT, () => {
  console.log(` Server running on http://localhost:${PORT}`);
});
