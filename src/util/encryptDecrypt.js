import bcryptjs from "bcryptjs";


const encryptPass = async(pass) =>{
    try {
        const password = await bcryptjs.hash(pass,12);
        return password;
    } catch (error) {
        throw new Error(error.message);
    }
}

const decryptPass = async(userPass,encryptPass) =>{
    try {
        console.log(userPass,encryptPass);
        const password = await bcryptjs.compare(userPass,encryptPass);
        return password;
    } catch (error) {
        console.log(error);
        throw new Error(error.message);
    }
}

export { encryptPass,decryptPass };