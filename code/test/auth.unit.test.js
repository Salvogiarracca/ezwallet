import { response } from 'express';
import request from 'supertest';
import { app } from '../app';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { login, logout, register, registerAdmin } from '../controllers/auth';
import { verifyEmail } from '../controllers/genericFunctions.js';
const bcrypt = require("bcryptjs")

jest.mock("bcryptjs")
jest.mock("../controllers/genericFunctions.js")
jest.mock('../models/User.js');
jest.mock("jsonwebtoken");

/**
 * Defines code to be executed before each test case is launched
 * In this case the mock implementation of `User.find()` is cleared, allowing the definition of a new mock implementation.
 * Not doing this `mockClear()` means that test cases may use a mock implementation intended for other test cases.
 */
beforeEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks()
    //additional `mockClear()` must be placed here
});

describe('register', () => {
    test('should handle errors and return a 500 code', async () => {
        const sentUser = {
            username : "Pippo",
            email : "s239834@studenti.polito.it",
            password : "12345"
        };

        //Since we are calling the function directly, we need to manually define a request object with all the necessary parameters (route params, body, cookies, url)
        const mockReq = {
            body: sentUser
        }

        //The same reasoning applies for the response object: we must manually define the functions used and then check if they are called (and with which values)
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: {
                //The name can also be message, what matters is consistency with the one used in the code
                refreshedTokenMessage: ""
            }
        };

        jest.spyOn(User, "findOne").mockRejectedValue(new Error("Database error"));
        await register(mockReq, mockRes)
        expect(mockRes.status).toHaveBeenCalledWith(500)
        expect(mockRes.json).toHaveBeenCalledWith("Database error")

    })
    test('should fail if email is not valid', async () => {
        const sentUser = {
            username : "Pippo",
            email : "s239834studenti.polito.it",
            password : "12345"
        };
        const createdUser = {
            id: "1",
            username : "Pippo",
            email : "s239834@studenti.polito.it",
            password : "12345",
            refreshToken: "",
            role: "Regular"
        };

        //Since we are calling the function directly, we need to manually define a request object with all the necessary parameters (route params, body, cookies, url)
        const mockReq = {
            body: sentUser
        }

        //The same reasoning applies for the response object: we must manually define the functions used and then check if they are called (and with which values)
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: {
                //The name can also be message, what matters is consistency with the one used in the code
                refreshedTokenMessage: ""
            }
        };

        // Mock DB-realted functions
        User.findOne.mockResolvedValue(false);
        User.create.mockResolvedValue(createdUser);
        await register(mockReq, mockRes)
        expect(mockRes.status).toHaveBeenCalledWith(400)
        expect(mockRes.json).toHaveBeenCalledWith({
            error: "The used email is not valid, please check it."
        })

    })
    // Regular user insertion tests
    test('Regular user registration', async () => {
        const mockUser = {};
        const sentUser = {
            username : "Pippo",
            email : "s239834@studenti.polito.it",
            password : "12345" 
        };
        const createdUser = {
            id: "1",
            username : "Pippo",
            email : "s239834@studenti.polito.it",
            password : "12345",
            refreshToken: "",
            role: "Regular"
        };

        //Since we are calling the function directly, we need to manually define a request object with all the necessary parameters (route params, body, cookies, url)
        const req = {
            body: sentUser
        }

        //The same reasoning applies for the response object: we must manually define the functions used and then check if they are called (and with which values)
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: {
                //The name can also be message, what matters is consistency with the one used in the code
                refreshedTokenMessage: ""
            }
        };

        // Mock DB-realted functions
        verifyEmail.mockImplementation(() => true);
        User.findOne.mockResolvedValue(false);
        User.create.mockResolvedValue(createdUser);
        
        // Call the function and test the result
        await register(req, res);        
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            data: expect.objectContaining({
                message: expect.any(String)
            })
        }));
    });

    // Exception cases
    test('Missing parameters: Error test #1', async () => {
        const mockUser = {};
        const sentUser = {
            username : "Pippo",
            password : "12345" 
        };

        //Since we are calling the function directly, we need to manually define a request object with all the necessary parameters (route params, body, cookies, url)
        const req = {
            body: sentUser
        }

        //The same reasoning applies for the response object: we must manually define the functions used and then check if they are called (and with which values)
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: {
                //The name can also be message, what matters is consistency with the one used in the code
                refreshedTokenMessage: ""
            }
        };

        // Call the function and test the result
        await register(req, res);        
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            error: expect.any(String)
        }));
    });

    test('Missing parameters: Error test #2', async () => {
        const mockUser = {};
        const sentUser = {
            username : "",
            email : "s239834@studenti.polito.it",
            password : "12345" 
        };

        //Since we are calling the function directly, we need to manually define a request object with all the necessary parameters (route params, body, cookies, url)
        const req = {
            body: sentUser
        }

        //The same reasoning applies for the response object: we must manually define the functions used and then check if they are called (and with which values)
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: {
                //The name can also be message, what matters is consistency with the one used in the code
                refreshedTokenMessage: ""
            }
        };

        // Call the function and test the result
        await register(req, res);        
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            error: expect.any(String)
        }));
    });

    test('Already existing username: Error test #1', async () => {
        const mockUser = {
            username : "Pippo",
            email : "s326712@studenti.polito.it",
            password : "12345" 
        };

        const sentUser = {
            username : "Pippo",
            email : "s239834@studenti.polito.it",
            password : "12345" 
        };

        //Since we are calling the function directly, we need to manually define a request object with all the necessary parameters (route params, body, cookies, url)
        const req = {
            body: sentUser
        }

        //The same reasoning applies for the response object: we must manually define the functions used and then check if they are called (and with which values)
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: {
                //The name can also be message, what matters is consistency with the one used in the code
                refreshedTokenMessage: ""
            }
        };

        // Mock DB-realted functions
        jest.spyOn(User, "findOne").mockImplementation(() => mockUser);

        // Call the function and test the result
        await register(req, res);        
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            error: expect.any(String)
        }));
    });
    
    test('Already existing email: Error test #1', async () => {
        const mockUser = {
            username : "Paperino",
            email : "s239834@studenti.polito.it",
            password : "12345" 
        };

        const sentUser = {
            username : "Pippo",
            email : "s239834@studenti.polito.it",
            password : "12345" 
        };

        //Since we are calling the function directly, we need to manually define a request object with all the necessary parameters (route params, body, cookies, url)
        const req = {
            body: sentUser
        }

        //The same reasoning applies for the response object: we must manually define the functions used and then check if they are called (and with which values)
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: {
                //The name can also be message, what matters is consistency with the one used in the code
                refreshedTokenMessage: ""
            }
        };

        // Mock DB-realted functions
        jest.spyOn(User, "findOne").mockImplementation(() => mockUser);

        // Call the function and test the result
        await register(req, res);        
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            error: expect.any(String)
        }));
    });
});

describe("registerAdmin", () => {
    test('should handle errors and return a 500 code', async () => {
        const sentUser = {
            username : "PlutoAdmin",
            email : "a392892studenti.polito.it",
            password : "12345"
        }
        //Since we are calling the function directly, we need to manually define a request object with all the necessary parameters (route params, body, cookies, url)
        const mockReq = {
            body: sentUser
        }

        //The same reasoning applies for the response object: we must manually define the functions used and then check if they are called (and with which values)
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: {
                //The name can also be message, what matters is consistency with the one used in the code
                refreshedTokenMessage: ""
            }
        };

        jest.spyOn(User, "findOne").mockRejectedValue(new Error("Database error"));
        await register(mockReq, mockRes)
        expect(mockRes.status).toHaveBeenCalledWith(500)
        expect(mockRes.json).toHaveBeenCalledWith("Database error")

    })
    test('should fail if email is not valid', async () => {
        const sentUser = {
            username : "PlutoAdmin",
            email : "a392892studenti.polito.it",
            password : "12345"
        };

        const createdUser = {
            id: "1",
            username : "PlutoAdmin",
            email : "a392892studenti.polito.it",
            password : "12345",
            refreshToken: "",
            role: "Admin"
        };

        //Since we are calling the function directly, we need to manually define a request object with all the necessary parameters (route params, body, cookies, url)
        const mockReq = {
            body: sentUser
        }

        //The same reasoning applies for the response object: we must manually define the functions used and then check if they are called (and with which values)
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: {
                //The name can also be message, what matters is consistency with the one used in the code
                refreshedTokenMessage: ""
            }
        };

        // Mock DB-realted functions
        User.findOne.mockResolvedValueOnce(false);
        User.findOne.mockResolvedValueOnce(false);
        User.create.mockResolvedValue(createdUser);
        await register(mockReq, mockRes)
        expect(mockRes.status).toHaveBeenCalledWith(400)
        expect(mockRes.json).toHaveBeenCalledWith({
            error: "The used email is not valid, please check it."
        })

    })
    // Administrator insertion tests
    test('Regular admin registration', async () => {
        const mockUser = {};
        const sentUser = {
            username : "PlutoAdmin",
            email : "a392892@studenti.polito.it",
            password : "12345" 
        };

        const createdUser = {
            id: "1",
            username : "PlutoAdmin",
            email : "a392892@studenti.polito.it",
            password : "12345",
            refreshToken: "",
            role: "Admin"
        };

        //Since we are calling the function directly, we need to manually define a request object with all the necessary parameters (route params, body, cookies, url)
        const req = {
            body: sentUser
        }

        //The same reasoning applies for the response object: we must manually define the functions used and then check if they are called (and with which values)
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: {
                //The name can also be message, what matters is consistency with the one used in the code
                refreshedTokenMessage: ""
            }
        };

        // Mock DB-realted functions
        verifyEmail.mockImplementation(() => true);
        User.findOne.mockResolvedValue(false);
        User.create.mockResolvedValue(createdUser);

        await registerAdmin(req, res);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            data: expect.objectContaining({
                message: expect.any(String)
            })
        }));
    });

    // Exception cases
    test('Missing parameters: Error test #1', async () => {
        const mockUser = {};
        const sentUser = {
            username : "PlutoAdmin",
            password : "12345" 
        };

        //Since we are calling the function directly, we need to manually define a request object with all the necessary parameters (route params, body, cookies, url)
        const req = {
            body: sentUser
        }

        //The same reasoning applies for the response object: we must manually define the functions used and then check if they are called (and with which values)
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: {
                //The name can also be message, what matters is consistency with the one used in the code
                refreshedTokenMessage: ""
            }
        };
        
        await registerAdmin(req, res);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            error: expect.any(String)
        }));
    });

    test('Missing parameters: Error test #2', async () => {
        const mockUser = {};
        const sentUser = {
            username : "",
            email : "a392892@studenti.polito.it",
            password : "12345" 
        };

        //Since we are calling the function directly, we need to manually define a request object with all the necessary parameters (route params, body, cookies, url)
        const req = {
            body: sentUser
        }

        //The same reasoning applies for the response object: we must manually define the functions used and then check if they are called (and with which values)
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: {
                //The name can also be message, what matters is consistency with the one used in the code
                refreshedTokenMessage: ""
            }
        };
        
        await registerAdmin(req, res);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            error: expect.any(String)
        }));
    });

    test('Already existing admin username: Error test #1', async () => {
        const mockUser = {
            username : "PlutoAdmin",
            email : "a382738@studenti.polito.it",
            password : "12345" 
        };

        const sentUser = {
            username : "PlutoAdmin",
            email : "a392892@studenti.polito.it",
            password : "12345" 
        };

        //Since we are calling the function directly, we need to manually define a request object with all the necessary parameters (route params, body, cookies, url)
        const req = {
            body: sentUser
        }

        //The same reasoning applies for the response object: we must manually define the functions used and then check if they are called (and with which values)
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: {
                //The name can also be message, what matters is consistency with the one used in the code
                refreshedTokenMessage: ""
            }
        };

        // Mock DB-realted functions
        jest.spyOn(User, "findOne").mockImplementation(() => mockUser);

        await registerAdmin(req, res);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            error: expect.any(String)
        }));
    });

    test('Already existing admin email: Error test #1', async () => {
        const mockUser = {
            username : "PaperinoAdmin",
            email : "a392892@studenti.polito.it",
            password : "12345" 
        };

        const sentUser = {
            username : "PlutoAdmin",
            email : "a392892@studenti.polito.it",
            password : "12345" 
        };

        //Since we are calling the function directly, we need to manually define a request object with all the necessary parameters (route params, body, cookies, url)
        const req = {
            body: sentUser
        }

        //The same reasoning applies for the response object: we must manually define the functions used and then check if they are called (and with which values)
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: {
                //The name can also be message, what matters is consistency with the one used in the code
                refreshedTokenMessage: ""
            }
        };

        // Mock DB-realted functions
        jest.spyOn(User, "findOne").mockImplementation(() => mockUser);

        await registerAdmin(req, res);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            error: expect.any(String)
        }));
    });
})

describe('login', () => {
    
    test('Log in: Test #1', async () => {
        const mockUser = {
            id: "12345",
            username: "Paperino",
            email : "s256652@studenti.polito.it",
            password : "12345",
            role: "Regular"
        };

        const sentUser = {
            email : "s256652@studenti.polito.it",
            password : "12345"
        };

        // Access token to confirm the result data of the method
        const accessToken = "testAccessToken"

        // Refresh token to confirm the result data of the method
        const refreshToken = "testRefreshToken"

        //Since we are calling the function directly, we need to manually define a request object with all the necessary parameters (route params, body, cookies, url)
        const req = {
            body: sentUser,
            cookies: { accessToken: accessToken, refreshToken: refreshToken }
        }

        //The same reasoning applies for the response object: we must manually define the functions used and then check if they are called (and with which values)
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            cookie: jest.fn(),
            locals: {
                //The name can also be message, what matters is consistency with the one used in the code
                refreshedTokenMessage: ""
            }
        };

        // Method to override since they depend on the DB
        verifyEmail.mockImplementation(() => true);
        mockUser.save = jest.fn();
        jest.spyOn(User, "findOne").mockImplementation(() => mockUser);
        jest.spyOn(bcrypt, "compare").mockImplementation(() => true);
        jwt.sign = jest.fn().mockReturnValue(accessToken).mockReturnValue(refreshToken);

        await login(req, res);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            data: expect.objectContaining({
                accessToken: expect.any(String),
                refreshToken: expect.any(String)
            })
        }));
    });
    
    test('Log in error test: Missing parameters #1', async () => {
        const mockUser = {};

        // Sent credentials
        const sentUser = {
            password : "12345" 
        };

        //Since we are calling the function directly, we need to manually define a request object with all the necessary parameters (route params, body, cookies, url)
        const req = {
            body: sentUser
        }

        //The same reasoning applies for the response object: we must manually define the functions used and then check if they are called (and with which values)
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            cookie: jest.fn(),
            locals: {
                //The name can also be message, what matters is consistency with the one used in the code
                refreshedTokenMessage: ""
            }
        };

        jest.spyOn(User, "findOne").mockImplementation(() => mockUser);

        await login(req, res);
        expect(res.status).toHaveBeenCalledWith(400);
    });

    
    test('Log in error test: Missing parameters #2', async () => {
        // Sent credentials
        const sentUser = {
            email : "",
            password : "12345" 
        };

        //Since we are calling the function directly, we need to manually define a request object with all the necessary parameters (route params, body, cookies, url)
        const req = {
            body: sentUser
        }

        //The same reasoning applies for the response object: we must manually define the functions used and then check if they are called (and with which values)
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            cookies: jest.fn(),
            locals: {
                //The name can also be message, what matters is consistency with the one used in the code
                refreshedTokenMessage: ""
            }
        };

        await login(req, res);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            error: expect.any(String)
        }));
    });

    test('Invalid email', async () => {
        // Sent credentials
        const sentUser = {
            email : "notAnEmail.com",
            password : "12345"
        };

        //Since we are calling the function directly, we need to manually define a request object with all the necessary parameters (route params, body, cookies, url)
        const req = {
            body: sentUser
        }

        //The same reasoning applies for the response object: we must manually define the functions used and then check if they are called (and with which values)
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            cookies: jest.fn(),
            locals: {
                //The name can also be message, what matters is consistency with the one used in the code
                refreshedTokenMessage: ""
            }
        };

        await login(req, res);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            error: "The email is not valid, please check it"
        }));
    });
    
    test('Log in error test: User not found #1', async () => {
        const mockUser = {};

        const sentUser = {
            email : "s256652@studenti.polito.it",
            password : "12345"
        };

        //Since we are calling the function directly, we need to manually define a request object with all the necessary parameters (route params, body, cookies, url)
        const req = {
            body: sentUser
        }

        //The same reasoning applies for the response object: we must manually define the functions used and then check if they are called (and with which values)
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            cookie: jest.fn(),
            locals: {
                //The name can also be message, what matters is consistency with the one used in the code
                refreshedTokenMessage: ""
            }
        };

        // Method to override since they depend on the DB
        verifyEmail.mockImplementation(() => true);
        jest.spyOn(User, "findOne").mockImplementation(() => mockUser);
        jest.spyOn(User.prototype, "save").mockResolvedValue(true);
        jest.spyOn(bcrypt, "compare").mockImplementation(() => true);

        await login(req, res);
        expect(res.status).toHaveBeenCalledWith(400);
    });

    test('Log in error test: Password mismatch #1', async () => {
        const mockUser = {
            id: "12345",
            username: "Paperino",
            email : "s256652@studenti.polito.it",
            password : "45678",
            role: "Regular"
        };

        const sentUser = {
            email : "s256652@studenti.polito.it",
            password : "12345"
        };

        //Since we are calling the function directly, we need to manually define a request object with all the necessary parameters (route params, body, cookies, url)
        const req = {
            body: sentUser
        }

        //The same reasoning applies for the response object: we must manually define the functions used and then check if they are called (and with which values)
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            cookie: jest.fn(),
            locals: {
                //The name can also be message, what matters is consistency with the one used in the code
                refreshedTokenMessage: ""
            }
        };

        // Method to override since they depend on the DB
        verifyEmail.mockImplementation(() => true);
        jest.spyOn(User, "findOne").mockImplementation(() => mockUser);
        jest.spyOn(User.prototype, "save").mockResolvedValue(true);
        jest.spyOn(bcrypt, "compare").mockImplementation(() => false);

        await login(req, res);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            error: expect.any(String)
        }));
    });
});

describe('logout', () => {

    test('Log out: Test #1', async () => {
        // Mock the implementation of findOne in order to return a user for testing
        const mockUser = {
            id: "12345",
            username: "Paperino",
            email : "s256652@studenti.polito.it",
            password : "12345",
            role: "Regular"
        };

        // Refresh token to perform the checks inside the method
        const refreshToken = "testRefreshToken"

        //Since we are calling the function directly, we need to manually define a request object with all the necessary parameters (route params, body, cookies, url)
        const req = {
            cookies: {
                refreshToken: refreshToken
            }
        }

        //The same reasoning applies for the response object: we must manually define the functions used and then check if they are called (and with which values)
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            cookie: jest.fn(),
            locals: {
                //The name can also be message, what matters is consistency with the one used in the code
                refreshedTokenMessage: ""
            }
        };

        mockUser.save = jest.fn();
        jest.spyOn(User, "findOne").mockImplementation(() => mockUser);
        jwt.verify = jest.fn().mockReturnValue({
            username: "Paperino",
            email : "s256652@studenti.polito.it",
            password : "12345",
        });

        await logout(req, res);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            data: expect.objectContaining({
                message: expect.any(String)
            })
        }));
    });

    test("Log out error test: User not found #1", async () =>{
        // Mock the implementation of findOne in order to return a user for testing
        const testUser = {
            id: "12345",
            username: "Paperino",
            email : "s256652@studenti.polito.it",
            password : "12345",
            role: "Regular"
        };

        // Refresh token to perform the checks inside the method
        const refreshToken = "testRefreshToken"

        // Mock the implementation of findOne in order to return a user for testing
        const mockUser = {};

        //Since we are calling the function directly, we need to manually define a request object with all the necessary parameters (route params, body, cookies, url)
        const req = {
            cookies: {
                refreshToken: refreshToken
            }
        }

        //The same reasoning applies for the response object: we must manually define the functions used and then check if they are called (and with which values)
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            cookie: jest.fn(),
            locals: {
                //The name can also be message, what matters is consistency with the one used in the code
                refreshedTokenMessage: ""
            }
        };

        jest.spyOn(User, "findOne").mockImplementation(() => mockUser);
        
        await logout(req, res);
        expect(res.status).toHaveBeenCalledWith(400);
    });

    test("Log out error test: User not found #2", async () =>{
        // Mock the implementation of findOne in order to return a user for testing
        const mockUser = {};

        //Since we are calling the function directly, we need to manually define a request object with all the necessary parameters (route params, body, cookies, url)
        const req = {
            cookies: {
                refreshToken: ""
            }
        }

        //The same reasoning applies for the response object: we must manually define the functions used and then check if they are called (and with which values)
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            cookie: jest.fn(),
            locals: {
                //The name can also be message, what matters is consistency with the one used in the code
                refreshedTokenMessage: ""
            }
        };

        jest.spyOn(User, "findOne").mockImplementation(() => mockUser);
        
        await logout(req, res);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            error: expect.any(String)
        }));
    });
});
