import { transporter } from "./nodemailer.js";

const sendingMail = async(type,user,link) =>{
    try {
        if(type === "FORGET_PASS") {
            await transporter.sendMail(
                {
                    from: process.env.USER, // sender address
                    to: user.email, // list of receivers
                    subject: "Hello ✔", // Subject line
                    text: "Hello world?", // plain text body
                    html: `<b>Reset:</b><p>${link}</p>`, // html body
                }
            );
            return;
        }
    } catch (error) {
        throw new Error(error.message);
    }
}

export { sendingMail };