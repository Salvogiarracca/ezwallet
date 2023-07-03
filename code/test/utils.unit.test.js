import jwt from 'jsonwebtoken';
import { handleDateFilterParams, verifyAuth, handleAmountFilterParams } from '../controllers/utils';
jest.mock("jsonwebtoken");

beforeEach(() => {
    jest.restoreAllMocks();
});

describe("handleDateFilterParams", () => { 
    test('Test #1 - wrong date format', () => {
        const mockReq = {
            query: {from: '26-08-2000'},
        };
        try{
            handleDateFilterParams(mockReq);
        }catch(e){
            expect(e.message).toEqual('Invalid date');
        }
    });

    test('Test #2 - wrong body', () => {
        const mockReq = {
            query: {from: '2023-01-01', upTo: '2023-06-08', date: '2022-12-31'},
        };
        try{
            handleDateFilterParams(mockReq);
        }catch(e){
            expect(e.message).toEqual('Invalid attribute date in query');
        }
    });

    test('Test #3 - $gte', () => {
        const mockReq = {
            query: {from: '2023-01-01'},
        };
        const expectedResponse= {date: {$gte: new Date("2023-01-01T00:00:00.000Z")}};
        const res = handleDateFilterParams(mockReq);
        expect(res).toEqual(expectedResponse);
    });

    test('Test #4 - $lte', () => {
        const mockReq = {
            query: {upTo: '2023-04-01'},
        };
        const expectedResponse= {date: {$lte: new Date("2023-04-01T23:59:59.999Z")}};
        const res = handleDateFilterParams(mockReq);
        expect(res).toEqual(expectedResponse);
    });

    test('Test #5 - $gte and $lte', () => {
        const mockReq = {
            query: {from: '2023-01-01',
                upTo: '2023-04-01'},
        };
        const expectedResponse= {date: {$gte: new Date("2023-01-01T00:00:00.000Z"), $lte: new Date("2023-04-01T23:59:59.999Z")}};
        const res = handleDateFilterParams(mockReq);
        expect(res).toEqual(expectedResponse);
    });

    test('Test #6 - upTo before from', () => {
        const mockReq = {
            query: {from: '2023-04-01',
                upTo: '2023-01-01'},
        };
        const expectedResponse= 'Invalid dates';
        try{
            handleDateFilterParams(mockReq);
        }catch(e){
            expect(e.message).toEqual('Invalid dates');
        }
    });

    test('Test #7 - upTo and from - Invalid date', () => {
        const mockReq = {
            query: {from: '01-01-2000',
                upTo: '2023-01-01'},
        };
        try{
            handleDateFilterParams(mockReq);
        }catch(e){
            expect(e.message).toEqual('Invalid date');
        }
    });

    test('Test #8 - upTo - Invalid date', () => {
        const mockReq = {
            query: {
                upTo: '01-01-2000'},
        };
        try{
            handleDateFilterParams(mockReq);
        }catch(e){
            expect(e.message).toEqual('Invalid date');
        }
    });

    test('Test #9 - upTo - dd > 31', () => {
        const mockReq = {
            query: {
                upTo: '2000-01-32'},
        };
        try{
            handleDateFilterParams(mockReq);
        }catch(e){
            expect(e.message).toEqual('Invalid date');
        }
    });

    test('Test #10 - upTo - mm > 12', () => {
        const mockReq = {
            query: {
                upTo: '2000-13-31'},
        };
        try{
            handleDateFilterParams(mockReq);
        }catch(e){
            expect(e.message).toEqual('Invalid date');
        }
    });

    test('Test #11 - wrong leap year', () => {
        const mockReq = {
            query: {
                upTo: '2021-02-29'},
        };
        try{
            handleDateFilterParams(mockReq);
        }catch(e){
            expect(e.message).toEqual('Invalid date');
        }
    });

    test('Test #12 - dd > 30 for april', () => {
        const mockReq = {
            query: {
                upTo: '2021-04-31'},
        };
        try{
            handleDateFilterParams(mockReq);
        }catch(e){
            expect(e.message).toEqual('Invalid date');
        }
    });

    test('Test #13 - upTo before from', () => {
        const mockReq = {
            query: {from: '2023-04-01',
                upTo: '2022-01-01'},
        };
        try{
            handleDateFilterParams(mockReq);
        }catch(e){
            expect(e.message).toEqual('Invalid dates');
        }
    });

    test('Test #14 - upTo before from', () => {
        const mockReq = {
            query: {from: '2023-04-04',
                upTo: '2023-04-02'},
        };
        try{
            handleDateFilterParams(mockReq);
        }catch(e){
            expect(e.message).toEqual('Invalid dates');
        }
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

    test('Simple authentication: missing parameter in the access token error', () => {
        const accessToken = "testAccessToken";
        const refreshToken = "testRefreshToken";

        const decodedAccessToken = {
            id: "123456",
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
            authType: "Simple"
        }

        jwt.verify = jest.fn().mockImplementation(decodedAccessToken)
                              .mockImplementation(decodedRefreshToken);

        // Call the function
        const result = verifyAuth(req, res, info);
        
        // Verify the results
        expect(result).toHaveProperty("authorized", false);
        expect(result).toHaveProperty("cause");
    });

    test('Simple authentication: missing parameter in the refresh token error', () => {
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
            authType: "Simple"
        }

        jwt.verify = jest.fn().mockImplementation(decodedAccessToken)
                              .mockImplementation(decodedRefreshToken);

        // Call the function
        const result = verifyAuth(req, res, info);
        
        // Verify the results
        expect(result).toHaveProperty("authorized", false);
        expect(result).toHaveProperty("cause");
    });

    test('Simple authentication: access token expired', () => {
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
        const res = {
            cookies: jest.fn()
        } 

        // Info object for the verifyAuth function
        const info = {
            authType: "Simple"
        }

        jwt.verify = jest.fn().mockImplementation(() => {throw new Error("TokenExpiredError");})
                              .mockImplementation(() => decodedRefreshToken);

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
    test('Test #1, $gte', () => {
        const mockReq = {
            query: {min: 20},
        };
        const expectedResponse = {amount: {$gte: 20} };
        const res = handleAmountFilterParams(mockReq);
        expect(res).toEqual(expectedResponse);
    });

    test('Test #2, $lte', () => {
        const mockReq = {
            query: {max: 20},
        };
        const expectedResponse = {amount: {$lte: 20} };
        const res = handleAmountFilterParams(mockReq);
        expect(res).toEqual(expectedResponse);
    });

    test('Test #3, $gte and $lte', () => {
        const mockReq = {
            query: {min: 10,
                max: 20},
        };
        const expectedResponse = {amount: {$gte: 10, $lte: 20} };
        const res = handleAmountFilterParams(mockReq);
        expect(res).toEqual(expectedResponse);
    });

    test('Test #4, NaN', () => {
        const mockReq = {
            query: {min: 'abcde',
                max: 20},
        };
        try{
            handleDateFilterParams(mockReq);
        }catch (e){
            expect(e).toEqual("One or more parameters are not a number!");
        }
    });

    test('Test #5, min bigger than max', () => {
        const mockReq = {
            query: {min: 200,
                max: 20},
        };
        try{
            handleDateFilterParams(mockReq);
        }catch (e){
            expect(e).toEqual("min can't be bigger than max!");
        }
    });

    test('Test #6, NaN (min)', () => {
        const mockReq = {
            query: {min: 'abcde'},
        };
        try{
            handleDateFilterParams(mockReq);
        }catch(e){
            expect(e).toEqual("min is not a number!");
        }
    });

    test('Test #7, NaN (max)', () => {
        const mockReq = {
            query: {max: 'abcde'},
        };
        try{
            handleDateFilterParams(mockReq);
        }catch(e){
            expect(e).toEqual("max is not a number!");
        }
    });

})