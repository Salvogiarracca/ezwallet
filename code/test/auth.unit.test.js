import request from 'supertest';
import { app } from '../app';
import { User } from '../models/User.js';
import jwt from 'jsonwebtoken';
import { response } from 'express';
const bcrypt = require("bcryptjs")

jest.mock("bcryptjs")
jest.mock('../models/User.js');

describe('register', () => { 
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

    test('Regular user Paperino registration: Test #3', async () => {
        await request(app).post("/api/register").send({
            username : "Paperino",
            email : "s498239@studenti.polito.it",
            password : "12345" 
        }).then(response => {
            expect(response.statusCode).toBe(200);
        }); 
    });

    test('Already existing username Pluto: Error test #1', async () => {
        await request(app).post("/api/register").send({
            username : "Pluto",
            email : "s573367@studenti.polito.it",
            password : "12345" 
        }).then(response => {
            console.log('Response Body :', JSON.stringify(response.body, null, 2));
            expect(response.statusCode).toBe(400);
        }); 
    });

    test('Already existing email: Error test #1', async () => {
        await request(app).post("/api/register").send({
            username : "Topolino",
            email : "s498239@studenti.polito.it",
            password : "12345" 
        }).then(response => {
            console.log('Response Body :', JSON.stringify(response.body, null, 2));
            expect(response.statusCode).toBe(400);
        }); 
    });
});

describe("registerAdmin", () => { 
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

    test('Regular admin Paperino registration: Test #3', async () => {
        await request(app).post("/api/admin").send({
            username : "PaperinoAdmin",
            email : "a498239@studenti.polito.it",
            password : "12345" 
        }).then(response => {
            expect(response.statusCode).toBe(200);
        }); 
    });

    test('Already existing admin username Pluto: Error test #1', async () => {
        await request(app).post("/api/admin").send({
            username : "PlutoAdmin",
            email : "a573367@studenti.polito.it",
            password : "12345" 
        }).then(response => {
            console.log('Response Body :', JSON.stringify(response.body, null, 2));
            expect(response.statusCode).toBe(400);
        }); 
    });

    test('Already existing admin email: Error test #1', async () => {
        await request(app).post("/api/admin").send({
            username : "TopolinoAdmin",
            email : "a498239@studenti.polito.it",
            password : "12345" 
        }).then(response => {
            console.log('Response Body :', JSON.stringify(response.body, null, 2));
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
