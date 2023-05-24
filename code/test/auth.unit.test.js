import request from 'supertest';
import { app } from '../app';
import { User } from '../models/User.js';
import jwt from 'jsonwebtoken';
import { response } from 'express';
import mongoose from "mongoose";
const bcrypt = require("bcryptjs")

jest.mock("bcryptjs")
jest.mock('../models/User.js');
jest.mock("jsonwebtoken");

/**
 * Defines code to be executed before each test case is launched
 * In this case the mock implementation of `User.find()` is cleared, allowing the definition of a new mock implementation.
 * Not doing this `mockClear()` means that test cases may use a mock implementation intended for other test cases.
 */
beforeEach(() => {
    // Restore the implementations that are touched inside the tests for lack of DB
    User.findOne.mockRestore();
    //User.prototype.save.mockRestore();
    bcrypt.compare.mockRestore();
});

describe('register', () => { 

    // Regular user insertion tests
    test('Regular user Pippo registration: Test #1', async () => {
        await request(app).post("/api/register").send({
            username : "Pippo",
            email : "s239834@studenti.polito.it",
            password : "12345" 
        }).then(response => {
            expect(response.statusCode).toBe(200);
        }); 
    });

    test('Regular user Pluto registration: Test #2', async () => {
        await request(app).post("/api/register").send({
            username : "Pluto",
            email : "s392892@studenti.polito.it",
            password : "12345" 
        }).then(response => {
            expect(response.statusCode).toBe(200);
        }); 
    });

    // Mock the implementation of findOne in order to test the exceptional
    // test cases
    const testUser = {
        username : "Paperino",
        email : "s256652@studenti.polito.it",
        password : "12345"
    };

    // Exception cases
    test('Already existing username Paperino: Error test #1', async () => {
        jest.spyOn(User, "findOne").mockImplementation(() => testUser);

        await request(app).post("/api/register").send({
            username : "Paperino",
            email : "s573367@studenti.polito.it",
            password : "12345" 
        }).then(response => {
            expect(response.statusCode).toBe(400);
        }); 
    });
    
    test('Already existing email: Error test #1', async () => {
        jest.spyOn(User, "findOne").mockImplementation(() => testUser);

        await request(app).post("/api/register").send({
            username : "Topolino",
            email : "s256652@studenti.polito.it",
            password : "12345" 
        }).then(response => {
            expect(response.statusCode).toBe(400);
        }); 
    });
});

describe("registerAdmin", () => { 

    // Administrator insertion tests
    test('Regular admin Pippo registration: Test #1', async () => {
        await request(app).post("/api/admin").send({
            username : "PippoAdmin",
            email : "a239834@studenti.polito.it",
            password : "12345" 
        }).then(response => {
            expect(response.statusCode).toBe(200);
        }); 
    });

    test('Regular admin Pluto registration: Test #2', async () => {
        await request(app).post("/api/admin").send({
            username : "PlutoAdmin",
            email : "a392892@studenti.polito.it",
            password : "12345" 
        }).then(response => {
            expect(response.statusCode).toBe(200);
        }); 
    });

    // Mock the implementation of findOne in order to test the exceptional
    // test cases
    const testUser = {
        username : "PaperinoAdmin",
        email : "a256652@studenti.polito.it",
        password : "12345"
    };

    // Exception cases
    test('Already existing admin username Paperino: Error test #1', async () => {
        jest.spyOn(User, "findOne").mockImplementation(() => testUser);

        await request(app).post("/api/admin").send({
            username : "PaperinoAdmin",
            email : "a487828@studenti.polito.it",
            password : "12345" 
        }).then(response => {
            expect(response.statusCode).toBe(400);
        }); 
    });

    test('Already existing admin email: Error test #1', async () => {
        jest.spyOn(User, "findOne").mockImplementation(() => testUser);

        await request(app).post("/api/admin").send({
            username : "TopolinoAdmin",
            email : "a256652@studenti.polito.it",
            password : "12345" 
        }).then(response => {
            expect(response.statusCode).toBe(400);
        }); 
    });
})

describe('login', () => { 
    // Mock the implementation of findOne in order to return a user for testing
    const testUser = {
        id: "12345",
        username: "Paperino",
        email : "s256652@studenti.polito.it",
        password : "12345",
        role: "Regular"
    };

    test('Log in: Test #1', async () => {
        // Sent credentials
        const registeredUserSent = {
            email : "s256652@studenti.polito.it",
            password : "12345"
        }

        // Access token to confirm the result data of the method
        const accessToken = jwt.sign({
            email: testUser.email,
            id: testUser.id,
            username: testUser.username,
            role: testUser.role
        }, process.env.ACCESS_KEY, { expiresIn: '1h' })

        // Refresh token to confirm the result data of the method
        const refreshToken = jwt.sign({
            email: testUser.email,
            id: testUser.id,
            username: testUser.username,
            role: testUser.role
        }, process.env.ACCESS_KEY, { expiresIn: '7d' })

        // Method to override since they depend on the DB
        jest.spyOn(User, "findOne").mockImplementation(() => testUser);
        jest.spyOn(bcrypt, "compare").mockImplementation(() => true);
        jest.spyOn(User.prototype, "save").mockImplementation(() => testUser);
        
        await request(app).post("/api/login").send(testUser).then(response => {
            console.log(response.body);
            expect(response.statusCode).toBe(200);
            expect(response.body.data.accessToken).toEqual(accessToken);
            expect(response.body.data.refreshToken).toEqual(refreshToken);
        });
    });

    test('Log in error test: User not found #1', async () => {
        // Sent credentials
        const registeredUserSent = {
            email : "s256652@studenti.polito.it",
            password : "12345"
        }

        // Method to override since they depend on the DB
        jest.spyOn(User, "findOne").mockImplementation(() => {});
        jest.spyOn(bcrypt, "compare").mockImplementation(() => true);
        
        await request(app).post("/api/login").send(testUser).then(response => {
            expect(response.statusCode).toBe(400);
        });
    });

    test('Log in error test: Password mismatch #1', async () => {
        // Sent credentials
        const registeredUserSent = {
            email : "s256652@studenti.polito.it",
            password : "456789"
        }

        // Method to override since they depend on the DB
        jest.spyOn(User, "findOne").mockImplementation(() => testUser);
        jest.spyOn(bcrypt, "compare").mockImplementation(() => false);
        
        await request(app).post("/api/login").send(testUser).then(response => {
            expect(response.statusCode).toBe(400);
        });
    });
});

describe('logout', () => { 
    // Mock the implementation of findOne in order to return a user for testing
    const testUser = {
        id: "12345",
        username: "Paperino",
        email : "s256652@studenti.polito.it",
        password : "12345",
        role: "Regular"
    };

    // Refresh token to perform the checks inside the method
    const refreshToken = jwt.sign({
        email: testUser.email,
        id: testUser.id,
        username: testUser.username,
        role: testUser.role
    }, process.env.ACCESS_KEY, { expiresIn: '7d' })


    test('Log out: Test #1', async () => {
        jest.spyOn(User, "findOne").mockImplementation(() => testUser);
        jest.spyOn(User, "save").mockImplementation(() => testUser);

        await request(app).get("/api/logout").set("Cookie", "refreshToken=${refreshToken}")
            .then(response => {
                expect(response.statusCode).toBe(200);
        });
    });

    test("Log out error test: User not found #1", async () =>{
        jest.spyOn(User, "findOne").mockImplementation(() => {});
        
        await request(app).get("/api/logout").set("Cookie", "refreshToken=${refreshToken}")
            .then(response => {
                expect(response.statusCode).toBe(400);
        });
    });

    test("Log out error test: User not found #2", async () =>{
        jest.spyOn(User, "findOne").mockImplementation(() => testUser);
        
        await request(app).get("/api/logout").set("Cookie", "refreshToken=")
            .then(response => {
                expect(response.statusCode).toBe(400);
        });
    });
});
