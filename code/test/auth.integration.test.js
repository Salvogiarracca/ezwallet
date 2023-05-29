import request from 'supertest';
import { app } from '../app';
import { User } from '../models/User.js';
import jwt from 'jsonwebtoken';
const bcrypt = require("bcryptjs")
import mongoose, { Model } from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

beforeAll(async () => {
  const dbName = "testingDatabaseAuth";
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

    test('Regular user Paperino registration: Test #2', async () => {
        await request(app).post("/api/register").send({
            username : "Paperino",
            email : "s256652@studenti.polito.it",
            password : "12345" 
        }).then(response => {
            expect(response.statusCode).toBe(200);
        }); 
    });

    // Exception cases
    test('Missing parameters: Error test #1', async () => {
        await request(app).post("/api/register").send({
            username : "Paperino",
            password : "12345" 
        }).then(response => {
            expect(response.statusCode).toBe(400);
        }); 
    });

    test('Missing parameters: Error test #2', async () => {
        await request(app).post("/api/register").send({
            username : "",
            email : "s256652@studenti.polito.it",
            password : "12345" 
        }).then(response => {
            expect(response.statusCode).toBe(400);
        }); 
    });

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
    test('Missing parameters: Error test #1', async () => {
        await request(app).post("/api/admin").send({
            username : "PaperinoAdmin",
            password : "12345" 
        }).then(response => {
            expect(response.statusCode).toBe(400);
        }); 
    });

    test('Missing parameters: Error test #2', async () => {
        await request(app).post("/api/admin").send({
            username : "",
            email : "a256652@studenti.polito.it",
            password : "12345" 
        }).then(response => {
            expect(response.statusCode).toBe(400);
        }); 
    });

    test('Already existing admin username Pippo: Error test #1', async () => {
        await request(app).post("/api/admin").send({
            username : "PippoAdmin",
            email : "a487828@studenti.polito.it",
            password : "12345" 
        }).then(response => {
            expect(response.statusCode).toBe(400);
        }); 
    });

    test('Already existing admin email: Error test #1', async () => {
        await request(app).post("/api/admin").send({
            username : "TopolinoAdmin",
            email : "a239834@studenti.polito.it",
            password : "12345" 
        }).then(response => {
            expect(response.statusCode).toBe(400);
        }); 
    });
})

describe('login', () => { 

    test('Log in: Test #1', async () => {
        // Sent credentials
        const registeredUserSent = {
            email : "s239834@studenti.polito.it",
            password : "12345"
        }
        
        await request(app).post("/api/login").send(registeredUserSent).then(response => {
            expect(response.statusCode).toBe(200);
        });
    });

    test('Log in error test: Missing parameters #1', async () => {
        // Sent credentials
        const registeredUserSent = {
            password : "12345"
        }

        await request(app).post("/api/login").send(registeredUserSent).then(response => {
            expect(response.statusCode).toBe(400);
        });
    });

    test('Log in error test: Missing parameters #2', async () => {
        // Sent credentials
        const registeredUserSent = {
            email : "s239834@studenti.polito.it",
            password : ""
        }

        await request(app).post("/api/login").send(registeredUserSent).then(response => {
            expect(response.statusCode).toBe(400);
        });
    });

    test('Log in error test: User not found #1', async () => {
        // Sent credentials
        const registeredUserSent = {
            email : "s989899@studenti.polito.it",
            password : "12345"
        }
        
        await request(app).post("/api/login").send(registeredUserSent).then(response => {
            expect(response.statusCode).toBe(400);
        });
    });

    test('Log in error test: Password mismatch #1', async () => {
        // Sent credentials
        const registeredUserSent = {
            email : "s256652@studenti.polito.it",
            password : "456789"
        }
        
        await request(app).post("/api/login").send(registeredUserSent).then(response => {
            expect(response.statusCode).toBe(400);
        });
    });

});

describe('logout', () => {

    test('Log out: Test #1', async () => {
        const registeredUserSent = {
            email : "s239834@studenti.polito.it",
            password : "12345"
        }
        
        const response = await request(app).post("/api/login").send(registeredUserSent);
        const refreshToken = response.body.data.refreshToken;

        await request(app).get("/api/logout").set("Cookie", `refreshToken=${refreshToken}`)
            .then(response => {
                expect(response.statusCode).toBe(200);
        });
    });

    test("Log out error test: User not found #1", async () =>{
        const refreshToken = "error";

        await request(app).get("/api/logout").set("Cookie", `refreshToken=${refreshToken}`)
            .then(response => {
                expect(response.statusCode).toBe(400);
        });
    });

    test("Log out error test: User not found #2", async () =>{        
        await request(app).get("/api/logout").set("Cookie", "refreshToken=")
            .then(response => {
                expect(response.statusCode).toBe(400);
        });
    });

});
