import jwt from 'jsonwebtoken';
import { handleDateFilterParams, verifyAuth, handleAmountFilterParams } from '../controllers/utils';
jest.mock("jsonwebtoken");

beforeEach(() => {
    jest.restoreAllMocks();
});

describe("handleDateFilterParams", () => { 
    test('Dummy test, change it', () => {
        expect(true).toBe(true);
    });
})

describe("verifyAuth", () => { 

    beforeEach(() => {
        jest.restoreAllMocks();
    });

    test('Simple authentication', () => {
        const accessToken = "testAccessToken";
        const refreshToken = "testRefreshToken";

        const decodedAccessToken = {
            id: "123456",
            username: "Topolino",
            email: "s256789@studenti.polito.it",
            role: "Regular"
        }

        const decodedRefreshToken = {
            id: "123456",
            username: "Topolino",
            email: "s256789@studenti.polito.it",
            role: "Regular"
        }

        //Since we are calling the function directly, we need to manually define a request object with all the necessary parameters (route params, body, cookies, url)
        const req = {
            body: {},
            cookies: { accessToken: accessToken, refreshToken: refreshToken }
        }

        //The same reasoning applies for the response object: we must manually define the functions used and then check if they are called (and with which values)
        const res = {} 

        // Info object for the verifyAuth function
        const info = {
            authType: "Simple",
        }

        jwt.verify = jest.fn().mockReturnValueOnce(decodedAccessToken)
                              .mockReturnValue(decodedRefreshToken);
        
        // Call the function
        const result = verifyAuth(req, res, info);
        
        // Verify the results
        expect(result).toHaveProperty("authorized", true);
        expect(result).toHaveProperty("cause");
    });

    test('Simple authentication: access token and refresh token expired', () => {
        const accessToken = "testAccessToken";
        const refreshToken = "testRefreshToken";

        const decodedAccessToken = {
            id: "123456",
            username: "Topolino",
            email: "s256789@studenti.polito.it",
            role: "Regular"
        }

        const decodedRefreshToken = {
            id: "123456",
            username: "Pippo",
            email: "s256789@studenti.polito.it",
            role: "Regular"
        }

        //Since we are calling the function directly, we need to manually define a request object with all the necessary parameters (route params, body, cookies, url)
        const req = {
            body: {},
            cookies: { accessToken: accessToken, refreshToken: refreshToken }
        }

        //The same reasoning applies for the response object: we must manually define the functions used and then check if they are called (and with which values)
        const res = {} 

        // Info object for the verifyAuth function
        const info = {
            authType: "User",
            username: "Topolino"
        }

        jwt.verify = jest.fn().mockImplementation(() => {throw new Error("TokenExpiredError");});

        // Call the function
        const result = verifyAuth(req, res, info);
        
        // Verify the results
        expect(result).toHaveProperty("authorized", false);
        expect(result).toHaveProperty("cause");
    });

    test('User authentication', () => {
        const accessToken = "testAccessToken";
        const refreshToken = "testRefreshToken";

        const decodedAccessToken = {
            id: "123456",
            username: "Topolino",
            email: "s256789@studenti.polito.it",
            role: "Regular"
        }

        const decodedRefreshToken = {
            id: "123456",
            username: "Topolino",
            email: "s256789@studenti.polito.it",
            role: "Regular"
        }

        //Since we are calling the function directly, we need to manually define a request object with all the necessary parameters (route params, body, cookies, url)
        const req = {
            body: {},
            cookies: { accessToken: accessToken, refreshToken: refreshToken }
        }

        //The same reasoning applies for the response object: we must manually define the functions used and then check if they are called (and with which values)
        const res = {} 

        // Info object for the verifyAuth function
        const info = {
            authType: "User",
            username: "Topolino"
        }

        jwt.verify = jest.fn().mockReturnValueOnce(decodedAccessToken)
                              .mockReturnValue(decodedRefreshToken);
        
        // Call the function
        const result = verifyAuth(req, res, info);
        
        // Verify the results
        expect(result).toHaveProperty("authorized", true);
        expect(result).toHaveProperty("cause");
    });

    test('User authentication: access token expired and correct username', () => {
        const accessToken = "testAccessToken";
        const refreshToken = "testRefreshToken";

        const decodedAccessToken = {
            id: "123456",
            username: "Topolino",
            email: "s256789@studenti.polito.it",
            role: "Regular"
        }

        const decodedRefreshToken = {
            id: "123456",
            username: "Topolino",
            email: "s256789@studenti.polito.it",
            role: "Regular"
        }

        //Since we are calling the function directly, we need to manually define a request object with all the necessary parameters (route params, body, cookies, url)
        const req = {
            body: {},
            cookies: { accessToken: accessToken, refreshToken: refreshToken }
        }

        //The same reasoning applies for the response object: we must manually define the functions used and then check if they are called (and with which values)
        const res = {} 

        // Info object for the verifyAuth function
        const info = {
            authType: "User",
            username: "Topolino"
        }

        jwt.verify = jest.fn().mockImplementation(() => {throw new Error("TokenExpiredError");})
                              .mockImplementation(() => decodedRefreshToken);
        
        // Call the function
        const result = verifyAuth(req, res, info);
        
        // Verify the results
        expect(result).toHaveProperty("authorized", true);
        expect(result).toHaveProperty("cause");
    });

    test('User authentication: username of token doesnt match the request #1', () => {
        const accessToken = "testAccessToken";
        const refreshToken = "testRefreshToken";

        const decodedAccessToken = {
            id: "123456",
            username: "Pippo",
            email: "s256789@studenti.polito.it",
            role: "Regular"
        }

        const decodedRefreshToken = {
            id: "123456",
            username: "Topolino",
            email: "s256789@studenti.polito.it",
            role: "Regular"
        }

        //Since we are calling the function directly, we need to manually define a request object with all the necessary parameters (route params, body, cookies, url)
        const req = {
            body: {},
            cookies: { accessToken: accessToken, refreshToken: refreshToken }
        }

        //The same reasoning applies for the response object: we must manually define the functions used and then check if they are called (and with which values)
        const res = {} 

        // Info object for the verifyAuth function
        const info = {
            authType: "User",
            username: "Topolino"
        }

        jwt.verify = jest.fn().mockReturnValueOnce(decodedAccessToken)
                              .mockReturnValue(decodedRefreshToken);
        
        // Call the function
        const result = verifyAuth(req, res, info);
        
        // Verify the results
        expect(result).toHaveProperty("authorized", false);
        expect(result).toHaveProperty("cause");
    });

    test('User authentication: username of token doesnt match the request #2', () => {
        const accessToken = "testAccessToken";
        const refreshToken = "testRefreshToken";

        const decodedAccessToken = {
            id: "123456",
            username: "Topolino",
            email: "s256789@studenti.polito.it",
            role: "Regular"
        }

        const decodedRefreshToken = {
            id: "123456",
            username: "Pippo",
            email: "s256789@studenti.polito.it",
            role: "Regular"
        }

        //Since we are calling the function directly, we need to manually define a request object with all the necessary parameters (route params, body, cookies, url)
        const req = {
            body: {},
            cookies: { accessToken: accessToken, refreshToken: refreshToken }
        }

        //The same reasoning applies for the response object: we must manually define the functions used and then check if they are called (and with which values)
        const res = {} 

        // Info object for the verifyAuth function
        const info = {
            authType: "User",
            username: "Topolino"
        }

        jwt.verify = jest.fn().mockReturnValueOnce(decodedAccessToken)
                              .mockReturnValue(decodedRefreshToken);
        
        // Call the function
        const result = verifyAuth(req, res, info);
        
        // Verify the results
        expect(result).toHaveProperty("authorized", false);
        expect(result).toHaveProperty("cause");
    });

    test('User authentication: access token expired and incorrect username', () => {
        const accessToken = "testAccessToken";
        const refreshToken = "testRefreshToken";

        const decodedAccessToken = {
            id: "123456",
            username: "Topolino",
            email: "s256789@studenti.polito.it",
            role: "Regular"
        }

        const decodedRefreshToken = {
            id: "123456",
            username: "Pippo",
            email: "s256789@studenti.polito.it",
            role: "Regular"
        }

        //Since we are calling the function directly, we need to manually define a request object with all the necessary parameters (route params, body, cookies, url)
        const req = {
            body: {},
            cookies: { accessToken: accessToken, refreshToken: refreshToken }
        }

        //The same reasoning applies for the response object: we must manually define the functions used and then check if they are called (and with which values)
        const res = {} 

        // Info object for the verifyAuth function
        const info = {
            authType: "User",
            username: "Topolino"
        }

        jwt.verify = jest.fn().mockImplementation(() => {throw new Error("TokenExpiredError");})
                              .mockImplementation(() => decodedRefreshToken);
        
        // Call the function
        const result = verifyAuth(req, res, info);
        
        // Verify the results
        expect(result).toHaveProperty("authorized", false);
        expect(result).toHaveProperty("cause");
    });

    test('Administrator authentication', () => {
        const accessToken = "testAccessToken";
        const refreshToken = "testRefreshToken";

        const decodedAccessToken = {
            id: "123456",
            username: "Topolino",
            email: "a256789@studenti.polito.it",
            role: "Admin"
        }

        const decodedRefreshToken = {
            id: "123456",
            username: "Topolino",
            email: "a256789@studenti.polito.it",
            role: "Admin"
        }

        //Since we are calling the function directly, we need to manually define a request object with all the necessary parameters (route params, body, cookies, url)
        const req = {
            body: {},
            cookies: { accessToken: accessToken, refreshToken: refreshToken }
        }

        //The same reasoning applies for the response object: we must manually define the functions used and then check if they are called (and with which values)
        const res = {} 

        // Info object for the verifyAuth function
        const info = {
            authType: "Admin",
        }

        jwt.verify = jest.fn().mockReturnValueOnce(decodedAccessToken)
                              .mockReturnValue(decodedRefreshToken);
        
        // Call the function
        const result = verifyAuth(req, res, info);
        
        // Verify the results
        expect(result).toHaveProperty("authorized", true);
        expect(result).toHaveProperty("cause");
    });

    test('Administrator authentication: access token expired and refresh role correct', () => {
        const accessToken = "testAccessToken";
        const refreshToken = "testRefreshToken";

        const decodedAccessToken = {
            id: "123456",
            username: "Topolino",
            email: "a256789@studenti.polito.it",
            role: "Admin"
        }

        const decodedRefreshToken = {
            id: "123456",
            username: "Topolino",
            email: "a256789@studenti.polito.it",
            role: "Admin"
        }

        //Since we are calling the function directly, we need to manually define a request object with all the necessary parameters (route params, body, cookies, url)
        const req = {
            body: {},
            cookies: { accessToken: accessToken, refreshToken: refreshToken }
        }

        //The same reasoning applies for the response object: we must manually define the functions used and then check if they are called (and with which values)
        const res = {} 

        // Info object for the verifyAuth function
        const info = {
            authType: "Admin",
        }

        jwt.verify = jest.fn().mockImplementation(() => {throw new Error("TokenExpiredError");})
                              .mockImplementation(() => decodedRefreshToken);
        
        // Call the function
        const result = verifyAuth(req, res, info);
        
        // Verify the results
        expect(result).toHaveProperty("authorized", true);
        expect(result).toHaveProperty("cause");
    });

    test('Administrator authentication: role of token doesnt match the request #1', () => {
        const accessToken = "testAccessToken";
        const refreshToken = "testRefreshToken";

        const decodedAccessToken = {
            id: "123456",
            username: "Topolino",
            email: "a256789@studenti.polito.it",
            role: "Regular"
        }

        const decodedRefreshToken = {
            id: "123456",
            username: "Topolino",
            email: "a256789@studenti.polito.it",
            role: "Admin"
        }

        //Since we are calling the function directly, we need to manually define a request object with all the necessary parameters (route params, body, cookies, url)
        const req = {
            body: {},
            cookies: { accessToken: accessToken, refreshToken: refreshToken }
        }

        //The same reasoning applies for the response object: we must manually define the functions used and then check if they are called (and with which values)
        const res = {} 

        // Info object for the verifyAuth function
        const info = {
            authType: "Admin",
        }

        jwt.verify = jest.fn().mockReturnValueOnce(decodedAccessToken)
                              .mockReturnValue(decodedRefreshToken);
        
        // Call the function
        const result = verifyAuth(req, res, info);
        
        // Verify the results
        expect(result).toHaveProperty("authorized", false);
        expect(result).toHaveProperty("cause");
    });

    test('Administrator authentication: role of token doesnt match the request #2', () => {
        const accessToken = "testAccessToken";
        const refreshToken = "testRefreshToken";

        const decodedAccessToken = {
            id: "123456",
            username: "Topolino",
            email: "a256789@studenti.polito.it",
            role: "Admin"
        }

        const decodedRefreshToken = {
            id: "123456",
            username: "Topolino",
            email: "a256789@studenti.polito.it",
            role: "Regular"
        }

        //Since we are calling the function directly, we need to manually define a request object with all the necessary parameters (route params, body, cookies, url)
        const req = {
            body: {},
            cookies: { accessToken: accessToken, refreshToken: refreshToken }
        }

        //The same reasoning applies for the response object: we must manually define the functions used and then check if they are called (and with which values)
        const res = {} 

        // Info object for the verifyAuth function
        const info = {
            authType: "Admin",
        }

        jwt.verify = jest.fn().mockReturnValueOnce(decodedAccessToken)
                              .mockReturnValue(decodedRefreshToken);
        
        // Call the function
        const result = verifyAuth(req, res, info);
        
        // Verify the results
        expect(result).toHaveProperty("authorized", false);
        expect(result).toHaveProperty("cause");
    });

    test('Administrator authentication: access token expired and refresh role incorrect', () => {
        const accessToken = "testAccessToken";
        const refreshToken = "testRefreshToken";

        const decodedAccessToken = {
            id: "123456",
            username: "Topolino",
            email: "a256789@studenti.polito.it",
            role: "Admin"
        }

        const decodedRefreshToken = {
            id: "123456",
            username: "Topolino",
            email: "a256789@studenti.polito.it",
            role: "Regular"
        }

        //Since we are calling the function directly, we need to manually define a request object with all the necessary parameters (route params, body, cookies, url)
        const req = {
            body: {},
            cookies: { accessToken: accessToken, refreshToken: refreshToken }
        }

        //The same reasoning applies for the response object: we must manually define the functions used and then check if they are called (and with which values)
        const res = {} 

        // Info object for the verifyAuth function
        const info = {
            authType: "Admin",
        }

        jwt.verify = jest.fn().mockImplementation(() => {throw new Error("TokenExpiredError");})
                              .mockImplementation(() => decodedRefreshToken);
        
        // Call the function
        const result = verifyAuth(req, res, info);
        
        // Verify the results
        expect(result).toHaveProperty("authorized", false);
        expect(result).toHaveProperty("cause");
    });

    test('Group authentication', () => {
        const accessToken = "testAccessToken";
        const refreshToken = "testRefreshToken";

        const decodedAccessToken = {
            id: "123456",
            username: "Topolino",
            email: "s256789@studenti.polito.it",
            role: "Regular"
        }

        const decodedRefreshToken = {
            id: "123456",
            username: "Topolino",
            email: "s256789@studenti.polito.it",
            role: "Regular"
        }

        //Since we are calling the function directly, we need to manually define a request object with all the necessary parameters (route params, body, cookies, url)
        const req = {
            body: {},
            cookies: { accessToken: accessToken, refreshToken: refreshToken }
        }

        //The same reasoning applies for the response object: we must manually define the functions used and then check if they are called (and with which values)
        const res = {} 

        // Info object for the verifyAuth function
        const info = {
            authType: "Group",
            emails: ["s318927@studenti.polito.it", "s256987@studenti.polito.it", "s315468@studenti.polito.it",  "s256789@studenti.polito.it"]
        }

        jwt.verify = jest.fn().mockReturnValueOnce(decodedAccessToken)
                              .mockReturnValue(decodedRefreshToken);
        
        // Call the function
        const result = verifyAuth(req, res, info);
        
        // Verify the results
        expect(result).toHaveProperty("authorized", true);
        expect(result).toHaveProperty("cause");
    });

    test('Group authentication: access token expired and correct email', () => {
        const accessToken = "testAccessToken";
        const refreshToken = "testRefreshToken";

        const decodedAccessToken = {
            id: "123456",
            username: "Topolino",
            email: "s315468@studenti.polito.it",
            role: "Regular"
        }

        const decodedRefreshToken = {
            id: "123456",
            username: "Topolino",
            email: "s318927@studenti.polito.it",
            role: "Regular"
        }

        //Since we are calling the function directly, we need to manually define a request object with all the necessary parameters (route params, body, cookies, url)
        const req = {
            body: {},
            cookies: { accessToken: accessToken, refreshToken: refreshToken }
        }

        //The same reasoning applies for the response object: we must manually define the functions used and then check if they are called (and with which values)
        const res = {} 

        // Info object for the verifyAuth function
        const info = {
            authType: "Group",
            emails: ["s318927@studenti.polito.it", "s256987@studenti.polito.it", "s315468@studenti.polito.it",  "s256789@studenti.polito.it"]
        }

        jwt.verify = jest.fn().mockImplementation(() => {throw new Error("TokenExpiredError");})
                              .mockImplementation(() => decodedRefreshToken);
        
        // Call the function
        const result = verifyAuth(req, res, info);
        
        // Verify the results
        expect(result).toHaveProperty("authorized", true);
        expect(result).toHaveProperty("cause");
    });

    test('Group authentication: email not in emails group error #1', () => {
        const accessToken = "testAccessToken";
        const refreshToken = "testRefreshToken";

        const decodedAccessToken = {
            id: "123456",
            username: "Topolino",
            email: "s112112@studenti.polito.it",
            role: "Regular"
        }

        const decodedRefreshToken = {
            id: "123456",
            username: "Topolino",
            email: "s256789@studenti.polito.it",
            role: "Regular"
        }

        //Since we are calling the function directly, we need to manually define a request object with all the necessary parameters (route params, body, cookies, url)
        const req = {
            body: {},
            cookies: { accessToken: accessToken, refreshToken: refreshToken }
        }

        //The same reasoning applies for the response object: we must manually define the functions used and then check if they are called (and with which values)
        const res = {} 

        // Info object for the verifyAuth function
        const info = {
            authType: "Group",
            emails: ["s318927@studenti.polito.it", "s256987@studenti.polito.it", "s315468@studenti.polito.it",  "s256789@studenti.polito.it"]
        }

        jwt.verify = jest.fn().mockReturnValueOnce(decodedAccessToken)
                              .mockReturnValue(decodedRefreshToken);
        
        // Call the function
        const result = verifyAuth(req, res, info);
        
        // Verify the results
        expect(result).toHaveProperty("authorized", false);
        expect(result).toHaveProperty("cause");
    });

    test('Group authentication: email not in emails group error #2', () => {
        const accessToken = "testAccessToken";
        const refreshToken = "testRefreshToken";

        const decodedAccessToken = {
            id: "123456",
            username: "Topolino",
            email: "s315468@studenti.polito.it",
            role: "Regular"
        }

        const decodedRefreshToken = {
            id: "123456",
            username: "Topolino",
            email: "s112112@studenti.polito.it",
            role: "Regular"
        }

        //Since we are calling the function directly, we need to manually define a request object with all the necessary parameters (route params, body, cookies, url)
        const req = {
            body: {},
            cookies: { accessToken: accessToken, refreshToken: refreshToken }
        }

        //The same reasoning applies for the response object: we must manually define the functions used and then check if they are called (and with which values)
        const res = {} 

        // Info object for the verifyAuth function
        const info = {
            authType: "Group",
            emails: ["s318927@studenti.polito.it", "s256987@studenti.polito.it", "s315468@studenti.polito.it",  "s256789@studenti.polito.it"]
        }

        jwt.verify = jest.fn().mockReturnValueOnce(decodedAccessToken)
                              .mockReturnValue(decodedRefreshToken);
        
        // Call the function
        const result = verifyAuth(req, res, info);
        
        // Verify the results
        expect(result).toHaveProperty("authorized", false);
        expect(result).toHaveProperty("cause");
    });

    test('Group authentication: access token expired and incorrect email', () => {
        const accessToken = "testAccessToken";
        const refreshToken = "testRefreshToken";

        const decodedAccessToken = {
            id: "123456",
            username: "Topolino",
            email: "s315468@studenti.polito.it",
            role: "Regular"
        }

        const decodedRefreshToken = {
            id: "123456",
            username: "Topolino",
            email: "s112112@studenti.polito.it",
            role: "Regular"
        }

        //Since we are calling the function directly, we need to manually define a request object with all the necessary parameters (route params, body, cookies, url)
        const req = {
            body: {},
            cookies: { accessToken: accessToken, refreshToken: refreshToken }
        }

        //The same reasoning applies for the response object: we must manually define the functions used and then check if they are called (and with which values)
        const res = {} 

        // Info object for the verifyAuth function
        const info = {
            authType: "Group",
            emails: ["s318927@studenti.polito.it", "s256987@studenti.polito.it", "s315468@studenti.polito.it",  "s256789@studenti.polito.it"]
        }

        jwt.verify = jest.fn().mockImplementation(() => {throw new Error("TokenExpiredError");})
                              .mockImplementation(() => decodedRefreshToken);
        
        // Call the function
        const result = verifyAuth(req, res, info);
        
        // Verify the results
        expect(result).toHaveProperty("authorized", false);
        expect(result).toHaveProperty("cause");
    });
})

describe("handleAmountFilterParams", () => { 
    test('Dummy test, change it', () => {
        expect(true).toBe(true);
    });
})
