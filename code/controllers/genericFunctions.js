/**
 * Perform email correctness verification
 * @param req : An object containing the 'email' parameter
 * @returns true if the email is compliant with the standard, false otherwise
 */
export function verifyEmail(req){

    const mail_regexp = new RegExp(/[A-Za-z0-9_.-]+@([A-Za-z0-9.-]+\.)+[A-Za-z]{2,}/, "gm");

    return mail_regexp.test(req.body.email);
}