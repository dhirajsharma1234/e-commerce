import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 465,
            secure: true,
            auth: {
              user: process.env.USER,
              pass: process.env.PASS
            }
});

export { transporter };