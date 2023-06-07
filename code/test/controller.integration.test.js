import request from "supertest";
import { app } from "../app";
import { categories, transactions } from "../models/model";
import { Group, User } from "../models/User";
import mongoose, { Model } from "mongoose";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

beforeAll(async () => {
  const dbName = "testingDatabaseController";
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

//necessary setup to ensure that each test can insert the data it needs
beforeEach(async () => {
  await categories.deleteMany({});
  await transactions.deleteMany({});
  await User.deleteMany({});
  await Group.deleteMany({});
});
/**
 * Alternate way to create the necessary tokens for authentication without using the website
 */
const adminAccessTokenValid = jwt.sign(
  {
    email: "admin@email.com",
    //id: existingUser.id, The id field is not required in any check, so it can be omitted
    username: "admin",
    role: "Admin",
  },
  process.env.ACCESS_KEY,
  { expiresIn: "1y" }
);
const testerAccessTokenValid = jwt.sign(
  {
    email: "tester@test.com",
    username: "tester",
    role: "Regular",
  },
  process.env.ACCESS_KEY,
  { expiresIn: "1y" }
);
//These tokens can be used in order to test the specific authentication error scenarios inside verifyAuth (no need to have multiple authentication error tests for the same route)
const testerAccessTokenExpired = jwt.sign(
  {
    email: "tester@test.com",
    username: "tester",
    role: "Regular",
  },
  process.env.ACCESS_KEY,
  { expiresIn: "0s" }
);

const testerAccessTokenEmpty = jwt.sign({}, process.env.ACCESS_KEY, {
  expiresIn: "1y",
});

describe("createCategory", () => {
  test("Dummy test, change it", () => {
    expect(true).toBe(true);
  });
});

describe("updateCategory", () => {
  test("Dummy test, change it", () => {
    expect(true).toBe(true);
  });
});

describe("deleteCategory", () => {
  test("Dummy test, change it", () => {
    expect(true).toBe(true);
  });
});

describe("getCategories", () => {
  test("Dummy test, change it", () => {
    expect(true).toBe(true);
  });
});

describe("createTransaction", () => {
  test("Transaction created by user", async () => {
    const testUser = {
      username: "tester",
      email: "tester@test.com",
      password: "tester",
      refreshToken: testerAccessTokenValid,
    };
    const testTransaction = {
      username: testUser.username,
      amount: 9000,
      type: "test",
    };
    const testCategory = {
      type: "test",
      color: "green",
    };
    await categories.create(testCategory);
    await User.create(testUser);
    await request(app)
      .post("/api/users/" + testUser.username + "/transactions") //Route to call
      .set(
        "Cookie",
        `accessToken=${testerAccessTokenValid}; refreshToken=${testerAccessTokenValid}`
      ) //Setting cookies in the request
      .send(testTransaction) //Definition of the request body
      .then((response) => {
        //After obtaining the response, we check its actual body content
        //The status must represent successful execution
        //console.log(response)
        expect(response.status).toBe(200);
        //The "data" object must have a field named "message" that confirms that changes are successful
        //The actual value of the field could be any string, so it's not checked
        expect(response.body).toHaveProperty("message");
        //We expect the count of edited transactions returned to be equal to 2 (the two transactions we placed in the database)
        expect(response.body.data).toHaveProperty(
          "username",
          testTransaction.username
        );
        expect(response.body.data).toHaveProperty(
          "amount",
          testTransaction.amount
        );
        expect(response.body.data).toHaveProperty("type", testTransaction.type);
        //Must be called at the end of every test or the test will fail while waiting for it to be called
        //done();
      });
  });

  test("Different user from url", async () => {
    const testUser = {
      username: "tester",
      email: "tester@test.com",
      password: "tester",
      refreshToken: testerAccessTokenValid,
    };
    const otherUser = {
      username: "otherTester",
      email: "otherTester@test.com",
      password: "tester",
      refreshToken: testerAccessTokenValid,
    };
    const testTransaction = {
      username: otherUser.username,
      amount: 9000,
      type: "test",
    };
    const testCategory = {
      type: "test",
      color: "green",
    };
    const expectedResponse = {
      message: "Username dosen't match transaction's username",
    };
    await categories.create(testCategory);
    await User.create(testUser);
    await User.create(otherUser);
    await request(app)
      .post("/api/users/" + testUser.username + "/transactions") //Route to call
      .set(
        "Cookie",
        `accessToken=${testerAccessTokenValid}; refreshToken=${testerAccessTokenValid}`
      ) //Setting cookies in the request
      .send(testTransaction) //Definition of the request body
      .then((response) => {
        //After obtaining the response, we check its actual body content
        //The status must represent successful execution
        //console.log(response)
        expect(response.status).toBe(400);
        //The "data" object must have a field named "message" that confirms that changes are successful
        //The actual value of the field could be any string, so it's not checked
        expect(response.body).toHaveProperty("message");
        expect(response.body).toEqual(expectedResponse);
        //We expect the count of edited transactions returned to be equal to 2 (the two transactions we placed in the database)
        //done();
      });
  });

  test("Invalid parameters", async () => {
    const testUser = {
      username: "tester",
      email: "tester@test.com",
      password: "tester",
      refreshToken: testerAccessTokenValid,
    };
    const testTransaction = {
      username: testUser.username,
      amount: 9000,
    };
    const testCategory = {
      type: "test",
      color: "green",
    };
    const expectedResponse = {
      message: "Invalid parameters",
    };
    await categories.create(testCategory);
    await User.create(testUser);
    await request(app)
      .post("/api/users/" + testUser.username + "/transactions") //Route to call
      .set(
        "Cookie",
        `accessToken=${testerAccessTokenValid}; refreshToken=${testerAccessTokenValid}`
      ) //Setting cookies in the request
      .send(testTransaction) //Definition of the request body
      .then((response) => {
        //After obtaining the response, we check its actual body content
        //The status must represent successful execution
        //console.log(response)
        expect(response.status).toBe(400);
        //The "data" object must have a field named "message" that confirms that changes are successful
        //The actual value of the field could be any string, so it's not checked
        expect(response.body).toHaveProperty("message");
        expect(response.body).toEqual(expectedResponse);
        //We expect the count of edited transactions returned to be equal to 2 (the two transactions we placed in the database)
        //done();
      });
  });

  test("Category dosen't exist", async () => {
    const testUser = {
      username: "tester",
      email: "tester@test.com",
      password: "tester",
      refreshToken: testerAccessTokenValid,
    };
    const testTransaction = {
      username: testUser.username,
      amount: 9000,
      type: "Food",
    };
    const testCategory = {
      type: "test",
      color: "green",
    };
    const expectedResponse = {
      message: "Category or User dosen't exist",
    };
    await User.create(testUser);
    await request(app)
      .post("/api/users/" + testUser.username + "/transactions") //Route to call
      .set(
        "Cookie",
        `accessToken=${testerAccessTokenValid}; refreshToken=${testerAccessTokenValid}`
      ) //Setting cookies in the request
      .send(testTransaction) //Definition of the request body
      .then((response) => {
        //After obtaining the response, we check its actual body content
        //The status must represent successful execution
        //console.log(response)
        expect(response.status).toBe(400);
        //The "data" object must have a field named "message" that confirms that changes are successful
        //The actual value of the field could be any string, so it's not checked
        expect(response.body).toHaveProperty("message");
        expect(response.body).toEqual(expectedResponse);
        //We expect the count of edited transactions returned to be equal to 2 (the two transactions we placed in the database)
        //done();
      });
  });

  test("Unauthorized User", async () => {
    const testUser = {
      username: "tester",
      email: "tester@test.com",
      password: "tester",
      refreshToken: testerAccessTokenValid,
    };
    const testTransaction = {
      username: testUser.username,
      amount: 9000,
      type: "test",
    };
    const testCategory = {
      type: "test",
      color: "green",
    };
    const expectedResponse = {
      message: "Unauthorized",
    };
    await categories.create(testCategory);
    await User.create(testUser);
    await request(app)
      .post("/api/users/" + testUser.username + "/transactions") //Route to call
      .set(
        "Cookie",
        `accessToken=${testerAccessTokenExpired}; refreshToken=${testerAccessTokenExpired}`
      ) //Setting cookies in the request
      .send(testTransaction) //Definition of the request body
      .then((response) => {
        //After obtaining the response, we check its actual body content
        //The status must represent successful execution
        //console.log(response)
        expect(response.status).toBe(401);
        //The "data" object must have a field named "message" that confirms that changes are successful
        //The actual value of the field could be any string, so it's not checked
        expect(response.body).toHaveProperty("message");
        expect(response.body).toEqual(expectedResponse);
        //We expect the count of edited transactions returned to be equal to 2 (the two transactions we placed in the database)
        //done();
      });
  });

  test("Transaction created by admin", async () => {
    const testUser = {
      username: "tester",
      email: "tester@test.com",
      password: "tester",
      refreshToken: adminAccessTokenValid,
    };
    const testTransaction = {
      username: testUser.username,
      amount: 9000,
      type: "test",
    };
    const testCategory = {
      type: "test",
      color: "green",
    };
    await categories.create(testCategory);
    await User.create(testUser);
    await request(app)
      .post("/api/users/" + testUser.username + "/transactions") //Route to call
      .set(
        "Cookie",
        `accessToken=${adminAccessTokenValid}; refreshToken=${adminAccessTokenValid}`
      ) //Setting cookies in the request
      .send(testTransaction) //Definition of the request body
      .then((response) => {
        //After obtaining the response, we check its actual body content
        //The status must represent successful execution
        //console.log(response)
        expect(response.status).toBe(200);
        //The "data" object must have a field named "message" that confirms that changes are successful
        //The actual value of the field could be any string, so it's not checked
        expect(response.body).toHaveProperty("message");
        //We expect the count of edited transactions returned to be equal to 2 (the two transactions we placed in the database)
        expect(response.body.data).toHaveProperty(
          "username",
          testTransaction.username
        );
        expect(response.body.data).toHaveProperty(
          "amount",
          testTransaction.amount
        );
        expect(response.body.data).toHaveProperty("type", testTransaction.type);
        //Must be called at the end of every test or the test will fail while waiting for it to be called
        //done();
      });
  });

  test("Transaction for another user created by admin", async () => {
    const testUser = {
      username: "tester",
      email: "tester@test.com",
      password: "tester",
      refreshToken: adminAccessTokenValid,
    };
    const otherUser = {
      username: "otherUser",
      email: "otherUser@test.com",
      password: "tester",
      refreshToken: testerAccessTokenValid,
    };
    const testTransaction = {
      username: otherUser.username,
      amount: 9000,
      type: "test",
    };
    const testCategory = {
      type: "test",
      color: "green",
    };
    await categories.create(testCategory);
    await User.create(testUser);
    await User.create(otherUser);
    await request(app)
      .post("/api/users/" + testUser.username + "/transactions") //Route to call
      .set(
        "Cookie",
        `accessToken=${adminAccessTokenValid}; refreshToken=${adminAccessTokenValid}`
      ) //Setting cookies in the request
      .send(testTransaction) //Definition of the request body
      .then((response) => {
        //After obtaining the response, we check its actual body content
        //The status must represent successful execution
        //console.log(response)
        expect(response.status).toBe(200);
        //The "data" object must have a field named "message" that confirms that changes are successful
        //The actual value of the field could be any string, so it's not checked
        expect(response.body).toHaveProperty("message");
        //We expect the count of edited transactions returned to be equal to 2 (the two transactions we placed in the database)
        expect(response.body.data).toHaveProperty(
          "username",
          testTransaction.username
        );
        expect(response.body.data).toHaveProperty(
          "amount",
          testTransaction.amount
        );
        expect(response.body.data).toHaveProperty("type", testTransaction.type);
        //Must be called at the end of every test or the test will fail while waiting for it to be called
        //done();
      });
  });
});

describe("getAllTransactions", () => {
  test("Retrieved all transactions", async () => {
    const testUsers = [
      {
        username: "tester1",
        email: "tester1@test.com",
        password: "tester",
        refreshToken: adminAccessTokenValid,
      },
      {
        username: "tester2",
        email: "tester2@test.com",
        password: "tester",
        refreshToken: testerAccessTokenValid,
      },
    ];
    const testTransactions = [
      {
        username: "tester1",
        amount: 9000,
        type: "test",
      },
      {
        username: "tester2",
        amount: 9000,
        type: "test",
      },
    ];
    const testCategory = {
      type: "test",
      color: "green",
    };
    await categories.create(testCategory);
    await User.insertMany(testUsers);
    await transactions.insertMany(testTransactions);
    await request(app)
      .get("/api/transactions") //Route to call
      .set(
        "Cookie",
        `accessToken=${adminAccessTokenValid}; refreshToken=${adminAccessTokenValid}`
      ) //Setting cookies in the request
      .send()
      .then((response) => {
        //After obtaining the response, we check its actual body content
        //The status must represent successful execution
        //console.log(response)
        expect(response.status).toBe(200);
        //The "data" object must have a field named "message" that confirms that changes are successful
        //The actual value of the field could be any string, so it's not checked
        expect(response.body).toHaveProperty("message");
        //We expect the count of edited transactions returned to be equal to 2 (the two transactions we placed in the database)
        expect(response.body.data.map((obj)=>{return {amount:obj.amount,type:obj.type,username:obj.username}})).toEqual(testTransactions);
        //Must be called at the end of every test or the test will fail while waiting for it to be called
        //done();
      });
  });

  test("Unauthorized admin", async () => {
    const testUsers = [
      {
        username: "tester1",
        email: "tester1@test.com",
        password: "tester",
        refreshToken: testerAccessTokenValid,
      },
      {
        username: "tester2",
        email: "tester2@test.com",
        password: "tester",
        refreshToken: testerAccessTokenValid,
      },
    ];
    const testTransactions = [
      {
        username: "tester1",
        amount: 9000,
        type: "test",
      },
      {
        username: "tester2",
        amount: 9000,
        type: "test",
      },
    ];
    const testCategory = {
      type: "test",
      color: "green",
    };
    await categories.create(testCategory);
    await User.insertMany(testUsers);
    await transactions.insertMany(testTransactions);
    await request(app)
      .get("/api/transactions") //Route to call
      .set(
        "Cookie",
        `accessToken=${testerAccessTokenValid}; refreshToken=${testerAccessTokenValid}`
      ) //Setting cookies in the request
      .send()
      .then((response) => {
        //After obtaining the response, we check its actual body content
        //The status must represent successful execution
        //console.log(response)
        expect(response.status).toBe(401);
        //The "data" object must have a field named "message" that confirms that changes are successful
        //The actual value of the field could be any string, so it's not checked
        expect(response.body).toHaveProperty("message");
        expect(response.body.message).toEqual("Unauthorized");
      });
  });
});

describe("getTransactionsByUser", () => {
  test("Successful user request", async () => {
    const testAdmin = {
      username: "admin",
      email: "admin@test.com",
      password: "tester",
      refreshToken: adminAccessTokenValid,
    };
    const testUser = {
      username: "tester",
      email: "tester@test.com",
      password: "tester",
      refreshToken: testerAccessTokenValid,
    };
    const testUsers = [testAdmin,testUser];
    const testUserTransactions=[{
      username: "tester",
      amount: 9000,
      type: "test",
    },
    {
      username: "tester",
      amount: 3000,
      type: "test",
    }]
    const testAdminTransactions=[{
      username: "admin",
      amount: 12000,
      type: "test",
    },
    {
      username: "admin",
      amount: 1000,
      type: "test",
    }]
    const testTransactions=[...testAdminTransactions,...testUserTransactions]
    const testCategory = {
      type: "test",
      color: "green",
    };
    await categories.create(testCategory);
    await User.insertMany(testUsers);
    console.log(testTransactions)
    await transactions.insertMany(testTransactions);
    await request(app)
      .get("/api/users/" + testUser.username + "/transactions") //Route to call
      .set(
        "Cookie",
        `accessToken=${testerAccessTokenValid}; refreshToken=${testerAccessTokenValid}`
      ) //Setting cookies in the request
      .send()
      .then((response) => {
        expect(response.status).toBe(200);
        expect(response.body.message).toEqual("Authorized");
        expect(response.body.data.map((obj)=>{return {amount:obj.amount,type:obj.type,username:obj.username}})).toEqual(testUserTransactions);
      });
  });

  test("Unauthorized user request", async () => {
    const testAdmin = {
      username: "admin",
      email: "admin@test.com",
      password: "tester",
      refreshToken: adminAccessTokenValid,
    };
    const testUser = {
      username: "tester",
      email: "tester@test.com",
      password: "tester",
      refreshToken: testerAccessTokenValid,
    };
    const testUsers = [testAdmin,testUser];
    const testUserTransactions=[{
      username: "tester",
      amount: 9000,
      type: "test",
    },
    {
      username: "tester",
      amount: 3000,
      type: "test",
    }]
    const testAdminTransactions=[{
      username: "admin",
      amount: 12000,
      type: "test",
    },
    {
      username: "admin",
      amount: 1000,
      type: "test",
    }]
    const testTransactions=[...testAdminTransactions,...testUserTransactions]
    const testCategory = {
      type: "test",
      color: "green",
    };
    await categories.create(testCategory);
    await User.insertMany(testUsers);
    console.log(testTransactions)
    await transactions.insertMany(testTransactions);
    await request(app)
      .get("/api/users/" + testUser.username + "/transactions") //Route to call
      .set(
        "Cookie",
        `accessToken=${testerAccessTokenExpired}; refreshToken=${testerAccessTokenExpired}`
      ) //Setting cookies in the request
      .send()
      .then((response) => {
        expect(response.status).toBe(401);
        expect(response.body).toHaveProperty("message");
      });
  });

  test("Successful admin request", async () => {
    const testAdmin = {
      username: "admin",
      email: "admin@test.com",
      password: "tester",
      refreshToken: adminAccessTokenValid,
    };
    const testUser = {
      username: "tester",
      email: "tester@test.com",
      password: "tester",
      refreshToken: testerAccessTokenValid,
    };
    const testUsers = [testAdmin,testUser];
    const testUserTransactions=[{
      username: "tester",
      amount: 9000,
      type: "test",
    },
    {
      username: "tester",
      amount: 3000,
      type: "test",
    }]
    const testAdminTransactions=[{
      username: "admin",
      amount: 12000,
      type: "test",
    },
    {
      username: "admin",
      amount: 1000,
      type: "test",
    }]
    const testTransactions=[...testAdminTransactions,...testUserTransactions]
    const testCategory = {
      type: "test",
      color: "green",
    };
    await categories.create(testCategory);
    await User.insertMany(testUsers);
    console.log(testTransactions)
    await transactions.insertMany(testTransactions);
    await request(app)
      .get("/api/transactions/users/" + testUser.username) //Route to call
      .set(
        "Cookie",
        `accessToken=${adminAccessTokenValid}; refreshToken=${adminAccessTokenValid}`
      ) //Setting cookies in the request
      .send()
      .then((response) => {
        expect(response.status).toBe(200);
        expect(response.body.message).toEqual("Authorized");
        expect(response.body.data.map((obj)=>{return {amount:obj.amount,type:obj.type,username:obj.username}})).toEqual(testUserTransactions);
      });
  });

  test("Unauthorized admin request", async () => {
    const testAdmin = {
      username: "admin",
      email: "admin@test.com",
      password: "tester",
      refreshToken: adminAccessTokenValid,
    };
    const testUser = {
      username: "tester",
      email: "tester@test.com",
      password: "tester",
      refreshToken: testerAccessTokenValid,
    };
    const testUsers = [testAdmin,testUser];
    const testUserTransactions=[{
      username: "tester",
      amount: 9000,
      type: "test",
    },
    {
      username: "tester",
      amount: 3000,
      type: "test",
    }]
    const testAdminTransactions=[{
      username: "admin",
      amount: 12000,
      type: "test",
    },
    {
      username: "admin",
      amount: 1000,
      type: "test",
    }]
    const testTransactions=[...testAdminTransactions,...testUserTransactions]
    const testCategory = {
      type: "test",
      color: "green",
    };
    await categories.create(testCategory);
    await User.insertMany(testUsers);
    console.log(testTransactions)
    await transactions.insertMany(testTransactions);
    await request(app)
      .get("/api/transactions/users/" + testUser.username) //Route to call
      .set(
        "Cookie",
        `accessToken=${testerAccessTokenValid}; refreshToken=${testerAccessTokenValid}`
      ) //Setting cookies in the request
      .send()
      .then((response) => {
        expect(response.status).toBe(401);
        expect(response.body).toHaveProperty("message");
        expect(response.body.message).toEqual("Unauthorized");
      });
  });

  test("User not found", async () => {
    const testAdmin = {
      username: "admin",
      email: "admin@test.com",
      password: "tester",
      refreshToken: adminAccessTokenValid,
    };
    const testUser = {
      username: "tester",
      email: "tester@test.com",
      password: "tester",
      refreshToken: testerAccessTokenValid,
    };
    const testUsers = [testAdmin];
    const testUserTransactions=[{
      username: "tester",
      amount: 9000,
      type: "test",
    },
    {
      username: "tester",
      amount: 3000,
      type: "test",
    }]
    const testAdminTransactions=[{
      username: "admin",
      amount: 12000,
      type: "test",
    },
    {
      username: "admin",
      amount: 1000,
      type: "test",
    }]
    const testTransactions=[...testAdminTransactions,...testUserTransactions]
    const testCategory = {
      type: "test",
      color: "green",
    };
    await categories.create(testCategory);
    await User.insertMany(testUsers);
    console.log(testTransactions)
    await transactions.insertMany(testTransactions);
    await request(app)
      .get("/api/transactions/users/" + testUser.username) //Route to call
      .set(
        "Cookie",
        `accessToken=${adminAccessTokenValid}; refreshToken=${adminAccessTokenValid}`
      ) //Setting cookies in the request
      .send()
      .then((response) => {
        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty("message");
        expect(response.body.message).toEqual("User not found");
      });
  });

});

//Voy aca
describe("getTransactionsByUserByCategory", () => {
  test("Dummy test, change it", () => {
    expect(true).toBe(true);
  });
});

describe("getTransactionsByGroup", () => {
  test("Dummy test, change it", () => {
    expect(true).toBe(true);
  });
});

describe("getTransactionsByGroupByCategory", () => {
  test("Dummy test, change it", () => {
    expect(true).toBe(true);
  });
});

describe("deleteTransaction", () => {
  test("Dummy test, change it", () => {
    expect(true).toBe(true);
  });
});

describe("deleteTransactions", () => {
  test("Dummy test, change it", () => {
    expect(true).toBe(true);
  });
});
