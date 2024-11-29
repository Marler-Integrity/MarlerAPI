// import getGraphClient from "../sp/msGraphClient";
const getDIRGraphClient = require('./dirGraphClient');


exports.getUserProfile = async(email) => {
    try {
        const client = await getDIRGraphClient();

        const user = await client.api(`/users/${email}`).get();
    
        return user;
    } catch (error) {
        console.log(error);
    }
}

// getUserProfile('bryan.lilly@marlerintegrity.com')