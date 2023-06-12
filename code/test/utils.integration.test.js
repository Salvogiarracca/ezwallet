import request from 'supertest';
import { app } from "../app";
import { User } from '../models/User.js';
import mongoose, { Model } from 'mongoose';
import { handleDateFilterParams, verifyAuth, handleAmountFilterParams } from '../controllers/utils';
import bcrypt from 'bcryptjs';
import { newExpiringToken, newTokenWithMissingParams } from '../controllers/genericFunctions';
import dotenv from 'dotenv';

dotenv.config();

beforeAll(async () => {
    const dbName = "testingDatabaseUtils";
    const url = `${process.env.MONGO_URI}/${dbName}`;
  
    await mongoose.connect(url, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
});

afterAll(async () => {
await mongoose.connection.db.dropDatabase();
await mongoose.connection.close();
});

beforeEach(async () => {
    await User.deleteMany({});
    
    await User.insertMany([
        {
            username: "Pippo",
            email: "s315678@studenti.polito.it",
            password: await bcrypt.hash("12345", 12),
            role: "Regular"
        },
        {
            username: "Paperino",
            email: "s123456@studenti.polito.it",
            password: await bcrypt.hash("12345", 12),
            role: "Regular"
        },
        {
            username: "Topolino",
            email: "s127896@studenti.polito.it",
            password: await bcrypt.hash("12345", 12),
            role: "Regular"
        },
        {
            username: "Pluto",
            email: "a334278@studenti.polito.it",
            password: await bcrypt.hash("12345", 12),
            role: "Admin"
        }
    ]);
});

describe("handleDateFilterParams", () => { 
    test('Dummy test, change it', () => {
        expect(true).toBe(true);
    });
})

describe("verifyAuth", () => {

    test('Simple authentication', async () => {  
        const registeredUserSent = {
            email: "s315678@studenti.polito.it",
            password: "12345"
        };

        const response = await request(app).post("/api/login").send(registeredUserSent);
        const accessToken = response.body.data.accessToken;
        const refreshToken = response.body.data.refreshToken;

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
        
        // Call the function
        const result = verifyAuth(req, res, info);
        
        // Verify the results
        expect(result).toHaveProperty("authorized", true);
        expect(result).toHaveProperty("cause");
    });

    test('Simple authentication: missing parameter in the access token error', async () => {  
        const registeredUserSent = {
            email: "s315678@studenti.polito.it",
            password: "12345"
        };

        const response = await request(app).post("/api/login").send(registeredUserSent);
        const accessToken = newTokenWithMissingParams("Pippo", registeredUserSent.email, "Regular")
        const refreshToken = response.body.data.refreshToken;

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
        
        // Call the function
        const result = verifyAuth(req, res, info);
        
        // Verify the results
        expect(result).toHaveProperty("authorized", false);
        expect(result).toHaveProperty("cause");
    });

    test('Simple authentication: missing parameter in the refresh token error', async () => {  
        const registeredUserSent = {
            email: "s315678@studenti.polito.it",
            password: "12345"
        };

        const response = await request(app).post("/api/login").send(registeredUserSent);
        const accessToken = response.body.data.accessToken;
        const refreshToken = newTokenWithMissingParams("Pippo", registeredUserSent.email, "Regular");

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
        
        // Call the function
        const result = verifyAuth(req, res, info);
        
        // Verify the results
        expect(result).toHaveProperty("authorized", false);
        expect(result).toHaveProperty("cause");
    });

    test('Simple authentication: missing parameter in the refresh token error', async () => {  
        const registeredUserSent = {
            email: "s315678@studenti.polito.it",
            password: "12345"
        };

        const response = await request(app).post("/api/login").send(registeredUserSent);
        const accessToken = newExpiringToken("Pippo", registeredUserSent.email, "Regular")
        const refreshToken = response.body.data.refreshToken;

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
        
        // Call the function
        const result = verifyAuth(req, res, info);
        
        // Verify the results
        expect(result).toHaveProperty("authorized", false);
        expect(result).toHaveProperty("cause");
    });

    test('User authentication', async () => {  
        const registeredUserSent = {
            email: "s315678@studenti.polito.it",
            password: "12345"
        };

        const response = await request(app).post("/api/login").send(registeredUserSent);
        const accessToken = response.body.data.accessToken;
        const refreshToken = response.body.data.refreshToken;

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
            username: "Pippo"
        }
        
        // Call the function
        const result = verifyAuth(req, res, info);
        
        // Verify the results
        expect(result).toHaveProperty("authorized", true);
        expect(result).toHaveProperty("cause");
    });

    test('User authentication: access token expired and correct username', async () => {
        const registeredUserSent = {
            email: "s127896@studenti.polito.it",
            password: "12345"
        };

        const cookieMock = (name, value, options) => {
            res.cookieArgs = { name, value, options };
        }

        const response = await request(app).post("/api/login").send(registeredUserSent);
        const accessToken = newExpiringToken("Topolino", "s127896@studenti.polito.it", "Regular")
        const refreshToken = response.body.data.refreshToken;

        //Since we are calling the function directly, we need to manually define a request object with all the necessary parameters (route params, body, cookies, url)
        const req = {
            body: {},
            cookies: { accessToken: accessToken, refreshToken: refreshToken }
        }


        //The same reasoning applies for the response object: we must manually define the functions used and then check if they are called (and with which values)
        const res = {
            cookie: cookieMock,
            locals: {},
        }

        // Info object for the verifyAuth function
        const info = {
            authType: "User",
            username: "Topolino"
        }
        
        // Call the function
        const result = verifyAuth(req, res, info);
        
        // Verify the results
        expect(result).toHaveProperty("authorized", true);
        expect(result).toHaveProperty("cause");
    });

    test('User authentication: username of token doesnt match the request #1', async () => {  
        const registeredUserSent = {
            email: "s315678@studenti.polito.it",
            password: "12345"
        };

        const errorUser = {
            email: "s127896@studenti.polito.it",
            password: "12345"
        }

        const response = await request(app).post("/api/login").send(registeredUserSent);
        const refreshToken = response.body.data.refreshToken;

        const errResponse = await request(app).post("/api/login").send(errorUser);
        const accessToken = errResponse.body.data.accessToken;

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
            username: "Pippo"
        }
        
        // Call the function
        const result = verifyAuth(req, res, info);
        
        // Verify the results
        expect(result).toHaveProperty("authorized", false);
        expect(result).toHaveProperty("cause");
    });

    test('User authentication: username of token doesnt match the request #2', async () => {  
        const registeredUserSent = {
            email: "s315678@studenti.polito.it",
            password: "12345"
        };

        const errorUser = {
            email: "s127896@studenti.polito.it",
            password: "12345"
        }

        const response = await request(app).post("/api/login").send(registeredUserSent);
        const accessToken = response.body.data.accessToken;

        const errResponse = await request(app).post("/api/login").send(errorUser);
        const refreshToken = errResponse.body.data.refreshToken;

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
            username: "Pippo"
        }
        
        // Call the function
        const result = verifyAuth(req, res, info);
        
        // Verify the results
        expect(result).toHaveProperty("authorized", false);
        expect(result).toHaveProperty("cause");
    });

    test('User authentication: access token expired and incorrect username', async () => {
        const registeredUserSent = {
            email: "s127896@studenti.polito.it",
            password: "12345"
        };

        const cookieMock = (name, value, options) => {
            res.cookieArgs = { name, value, options };
        }

        const response = await request(app).post("/api/login").send(registeredUserSent);
        const accessToken = newExpiringToken("Topolino", "s127896@studenti.polito.it", "Regular")
        const refreshToken = response.body.data.refreshToken;

        //Since we are calling the function directly, we need to manually define a request object with all the necessary parameters (route params, body, cookies, url)
        const req = {
            body: {},
            cookies: { accessToken: accessToken, refreshToken: refreshToken }
        }

        //The same reasoning applies for the response object: we must manually define the functions used and then check if they are called (and with which values)
        const res = {
            cookie: cookieMock,
            locals: {},
        }

        // Info object for the verifyAuth function
        const info = {
            authType: "User",
            username: "Pippo"
        }
        
        // Call the function
        const result = verifyAuth(req, res, info);
        
        // Verify the results
        expect(result).toHaveProperty("authorized", false);
        expect(result).toHaveProperty("cause");
    });

    test('Administrator authentication', async () => {
        const registeredUserSent = {
            email: "a334278@studenti.polito.it",
            password: "12345"
        };

        const response = await request(app).post("/api/login").send(registeredUserSent);
        const accessToken = response.body.data.accessToken;
        const refreshToken = response.body.data.refreshToken;

        //Since we are calling the function directly, we need to manually define a request object with all the necessary parameters (route params, body, cookies, url)
        const req = {
            body: {},
            cookies: { accessToken: accessToken, refreshToken: refreshToken }
        }

        //The same reasoning applies for the response object: we must manually define the functions used and then check if they are called (and with which values)
        const res = {} 

        // Info object for the verifyAuth function
        const info = {
            authType: "Admin"
        }
        
        // Call the function
        const result = verifyAuth(req, res, info);
        
        // Verify the results
        expect(result).toHaveProperty("authorized", true);
        expect(result).toHaveProperty("cause");
    });

    test('Administrator authentication: access token expired and correct role', async () => {
        const registeredUserSent = {
            email: "a334278@studenti.polito.it",
            password: "12345"
        };

        const cookieMock = (name, value, options) => {
            res.cookieArgs = { name, value, options };
        }

        const response = await request(app).post("/api/login").send(registeredUserSent);
        const accessToken = newExpiringToken("Pluto", "a334278@studenti.polito.it", "Admin")
        const refreshToken = response.body.data.refreshToken;

        //Since we are calling the function directly, we need to manually define a request object with all the necessary parameters (route params, body, cookies, url)
        const req = {
            body: {},
            cookies: { accessToken: accessToken, refreshToken: refreshToken }
        }

        //The same reasoning applies for the response object: we must manually define the functions used and then check if they are called (and with which values)
        const res = {
            cookie: cookieMock,
            locals: {},
        }

        // Info object for the verifyAuth function
        const info = {
            authType: "Admin"
        }
        
        // Call the function
        const result = verifyAuth(req, res, info);
        
        // Verify the results
        expect(result).toHaveProperty("authorized", true);
        expect(result).toHaveProperty("cause");
    });

    test('Administrator authentication: role of token doesnt match the request #1', async () => {  
        const registeredUserSent = {
            email: "a334278@studenti.polito.it",
            password: "12345"
        };

        const errorUser = {
            email: "s127896@studenti.polito.it",
            password: "12345"
        }

        const response = await request(app).post("/api/login").send(registeredUserSent);
        const accessToken = response.body.data.accessToken;

        const errResponse = await request(app).post("/api/login").send(errorUser);
        const refreshToken = errResponse.body.data.refreshToken;

        //Since we are calling the function directly, we need to manually define a request object with all the necessary parameters (route params, body, cookies, url)
        const req = {
            body: {},
            cookies: { accessToken: accessToken, refreshToken: refreshToken }
        }

        //The same reasoning applies for the response object: we must manually define the functions used and then check if they are called (and with which values)
        const res = {} 

        // Info object for the verifyAuth function
        const info = {
            authType: "Admin"
        }
        
        // Call the function
        const result = verifyAuth(req, res, info);
        
        // Verify the results
        expect(result).toHaveProperty("authorized", false);
        expect(result).toHaveProperty("cause");
    });

    test('Administrator authentication: role of token doesnt match the request #2', async () => {  
        const registeredUserSent = {
            email: "a334278@studenti.polito.it",
            password: "12345"
        };

        const errorUser = {
            email: "s127896@studenti.polito.it",
            password: "12345"
        }

        const response = await request(app).post("/api/login").send(registeredUserSent);
        const refreshToken = response.body.data.refreshToken;

        const errResponse = await request(app).post("/api/login").send(errorUser);
        const accessToken = errResponse.body.data.accessToken;

        //Since we are calling the function directly, we need to manually define a request object with all the necessary parameters (route params, body, cookies, url)
        const req = {
            body: {},
            cookies: { accessToken: accessToken, refreshToken: refreshToken }
        }

        //The same reasoning applies for the response object: we must manually define the functions used and then check if they are called (and with which values)
        const res = {} 

        // Info object for the verifyAuth function
        const info = {
            authType: "Admin"
        }
        
        // Call the function
        const result = verifyAuth(req, res, info);
        
        // Verify the results
        expect(result).toHaveProperty("authorized", false);
        expect(result).toHaveProperty("cause");
    });

    test('Administrator authentication: access token expired and incorrect role', async () => {
        const errorUser = {
            email: "s127896@studenti.polito.it",
            password: "12345"
        }

        const cookieMock = (name, value, options) => {
            res.cookieArgs = { name, value, options };
        }
        
        const errResponse = await request(app).post("/api/login").send(errorUser);
        const accessToken = newExpiringToken("Pluto", "a334278@studenti.polito.it", "Admin")
        const refreshToken = errResponse.body.data.refreshToken;

        //Since we are calling the function directly, we need to manually define a request object with all the necessary parameters (route params, body, cookies, url)
        const req = {
            body: {},
            cookies: { accessToken: accessToken, refreshToken: refreshToken }
        }

        //The same reasoning applies for the response object: we must manually define the functions used and then check if they are called (and with which values)
        const res = {
            cookie: cookieMock,
            locals: {},
        } 

        // Info object for the verifyAuth function
        const info = {
            authType: "Admin"
        }
        
        // Call the function
        const result = verifyAuth(req, res, info);
        
        // Verify the results
        expect(result).toHaveProperty("authorized", false);
        expect(result).toHaveProperty("cause");
    });

    test('Group authentication', async () => {  
        const registeredUserSent = {
            email: "a334278@studenti.polito.it",
            password: "12345"
        };

        const response = await request(app).post("/api/login").send(registeredUserSent);
        const accessToken = response.body.data.accessToken;
        const refreshToken = response.body.data.refreshToken;

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
            emails: ["a334278@studenti.polito.it", "s123456@studenti.polito.it", "s315678@studenti.polito.it"]
        }
        
        // Call the function
        const result = verifyAuth(req, res, info);
        
        // Verify the results
        expect(result).toHaveProperty("authorized", true);
        expect(result).toHaveProperty("cause");
    });

    test('Group authentication: access token expired and correct email', async () => {  
        const registeredUserSent = {
            email: "a334278@studenti.polito.it",
            password: "12345"
        };

        const cookieMock = (name, value, options) => {
            res.cookieArgs = { name, value, options };
        }

        const response = await request(app).post("/api/login").send(registeredUserSent);
        const accessToken = newExpiringToken("Pluto", "a334278@studenti.polito.it", "Admin")
        const refreshToken = response.body.data.refreshToken;

        //Since we are calling the function directly, we need to manually define a request object with all the necessary parameters (route params, body, cookies, url)
        const req = {
            body: {},
            cookies: { accessToken: accessToken, refreshToken: refreshToken }
        }

        //The same reasoning applies for the response object: we must manually define the functions used and then check if they are called (and with which values)
        const res = {
            cookie: cookieMock,
            locals: {},
        }
        // Info object for the verifyAuth function
        const info = {
            authType: "Group",
            emails: ["a334278@studenti.polito.it", "s123456@studenti.polito.it", "s315678@studenti.polito.it"]
        }
        
        // Call the function
        const result = verifyAuth(req, res, info);
        
        // Verify the results
        expect(result).toHaveProperty("authorized", true);
        expect(result).toHaveProperty("cause");
    });

    test('Group authentication: email not in emails group error #1', async () => {  
        const registeredUserSent = {
            email: "a334278@studenti.polito.it",
            password: "12345"
        };

        const errorUser = {
            email: "s127896@studenti.polito.it",
            password: "12345"
        }

        const response = await request(app).post("/api/login").send(registeredUserSent);
        const accessToken = response.body.data.accessToken;

        const errResponse = await request(app).post("/api/login").send(errorUser);
        const refreshToken = errResponse.body.data.refreshToken;

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
            emails: ["a334278@studenti.polito.it", "s123456@studenti.polito.it", "s315678@studenti.polito.it"]
        }
        
        // Call the function
        const result = verifyAuth(req, res, info);
        
        // Verify the results
        expect(result).toHaveProperty("authorized", false);
        expect(result).toHaveProperty("cause");
    });

    test('Group authentication: email not in emails group error #2', async () => {  
        const registeredUserSent = {
            email: "a334278@studenti.polito.it",
            password: "12345"
        };

        const errorUser = {
            email: "s127896@studenti.polito.it",
            password: "12345"
        }

        const response = await request(app).post("/api/login").send(registeredUserSent);
        const refreshToken = response.body.data.refreshToken;

        const errResponse = await request(app).post("/api/login").send(errorUser);
        const accessToken = errResponse.body.data.accessToken;

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
            emails: ["a334278@studenti.polito.it", "s123456@studenti.polito.it", "s315678@studenti.polito.it"]
        }
        
        // Call the function
        const result = verifyAuth(req, res, info);
        
        // Verify the results
        expect(result).toHaveProperty("authorized", false);
        expect(result).toHaveProperty("cause");
    });

    test('Group authentication: access token expired and incorrect email', async () => {  
        const registeredUserSent = {
            email: "a334278@studenti.polito.it",
            password: "12345"
        };

        const cookieMock = (name, value, options) => {
            res.cookieArgs = { name, value, options };
        }

        const response = await request(app).post("/api/login").send(registeredUserSent);
        const accessToken = newExpiringToken("Pluto", "a334278@studenti.polito.it", "Admin")
        const refreshToken = response.body.data.refreshToken;

        //Since we are calling the function directly, we need to manually define a request object with all the necessary parameters (route params, body, cookies, url)
        const req = {
            body: {},
            cookies: { accessToken: accessToken, refreshToken: refreshToken }
        }

        //The same reasoning applies for the response object: we must manually define the functions used and then check if they are called (and with which values)
        const res = {
            cookie: cookieMock,
            locals: {},
        }

        // Info object for the verifyAuth function
        const info = {
            authType: "Group",
            emails: ["a322656@studenti.polito.it", "s123456@studenti.polito.it", "s315678@studenti.polito.it"]
        }
        
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
