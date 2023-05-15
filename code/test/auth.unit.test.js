import request from 'supertest';
import { app } from '../app';
import { User } from '../models/User.js';
import jwt from 'jsonwebtoken';
import { response } from 'express';
const bcrypt = require("bcryptjs")

jest.mock("bcryptjs")
jest.mock('../models/User.js');

describe('register', () => { 
    // Set up some data inside the database before running the test
    // Since the tests do not save data
    beforeEach( async () => {
        let testUser = {
            username : "Paperino",
            email : "s256652@studenti.polito.it",
            password : "12345"
        };

        await User.create(testUser);
    });
    
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

    // Exception cases
    test('Already existing username Paperino: Error test #1', async () => {
        await request(app).post("/api/register").send({
            username : "Paperino",
            email : "s573367@studenti.polito.it",
            password : "12345" 
        }).then(response => {
            expect(response.statusCode).toBe(400);
        }); 
    });
    
    test('Already existing email: Error test #1', async () => {
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
    // Set up some data inside the database before running the test
    // Since the tests do not save data
    beforeEach( async () => {
        let testUser = {
            username : "PaperinoAdmin",
            email : "a256652@studenti.polito.it",
            password : "12345",
            role : "Admin"
        };

        await User.create(testUser);
    });

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

    // Exception cases
    test('Already existing admin username Paperino: Error test #1', async () => {
        await request(app).post("/api/admin").send({
            username : "PaperinoAdmin",
            email : "a573367@studenti.polito.it",
            password : "12345" 
        }).then(response => {
            expect(response.statusCode).toBe(400);
        }); 
    });

    test('Already existing admin email: Error test #1', async () => {
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
    test('Dummy test, change it', () => {
        expect(true).toBe(true);
    });
});

describe('logout', () => { 
    test('Dummy test, change it', () => {
        expect(true).toBe(true);
    });
});
