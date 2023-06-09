import jwt from "jsonwebtoken";

/**
 * Perform email correctness verification
 * @param req : An object containing the 'email' parameter
 * @returns true if the email is compliant with the standard, false otherwise
 */
export function verifyEmail(req){

    const mail_regexp = new RegExp(/[A-Za-z0-9_.-]+@([A-Za-z0-9.-]+\.)+[A-Za-z]{2,}/, "gm");

    return mail_regexp.test(req.body.email);
}

///create a token on the fly passing "Admin" or "Regular"
export function newToken(role){
    const token = jwt.sign(
        {
            username: "testUser",
            email: "testUser@example.com",
            id: "123456789",
            role: role
        },
        "EZWALLET",
        {
            expiresIn: "7d"
        }
    );
    return token;
}

export function newTokenAdHoc(username, role){
    const token = jwt.sign(
        {
            username: username,
            email: `${username}@example.com`,
            id: "123456789",
            role: role
        },
        "EZWALLET",
        {
            expiresIn: "7d"
        }
    );
    return token;
}

export function newExpiringToken(username, email, role){
    const token = jwt.sign({
            id: "123456789",
            username: username,
            email: email,
            role: role
        }, "EZWALLET", { expiresIn: "0d" });
    return token;
}

export function newTokenWithMissingParams(username, email, role){
    const token = jwt.sign({
            id: "123456789",
            username: "",
            email: email,
            role: role
        }, "EZWALLET", { expiresIn: "0d" });
    return token;
}