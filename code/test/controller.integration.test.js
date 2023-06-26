import request from "supertest";
import { app } from "../app";
import { categories, transactions } from "../models/model";
import { Group, User } from "../models/User";
import mongoose, { Model } from "mongoose";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import {verifyAuth} from "../controllers/utils.js";

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
  test("Category created by admin", async () => {
    const testAdmin = {
      username: "admin",
      email: "admin@test.com",
      password: "admin",
      refreshToken: adminAccessTokenValid,
    };
    const testCategory = {
      type: 'test',
      color: '#ff0000',
    };
    await request(app)
        .post("/api/categories") //Route to call
        .set(
            "Cookie",
            `accessToken=${adminAccessTokenValid}; refreshToken=${adminAccessTokenValid}`
        ) //Setting cookies in the request
        .send(testCategory) //Definition of the request body
        .then((response) => {
          //After obtaining the response, we check its actual body content
          //The status must represent successful execution
          expect(response.status).toBe(200);
          //The "data" object must have a field named "message" that confirms that changes are successful
          //The actual value of the field could be any string, so it's not checked
          expect(response.body).toHaveProperty("message");
          expect(response.body.data).toHaveProperty(
              'type',
              testCategory.type
          );
          expect(response.body.data).toHaveProperty(
              'color',
              testCategory.color
          );
          //Must be called at the end of every test or the test will fail while waiting for it to be called
          //done();
        });
  });

  test("Category created by unauthorized user", async () => {
    const testAdmin = {
      username: "test",
      email: "test@test.com",
      password: "notadmin",
      refreshToken: testerAccessTokenValid,
    };
    const testCategory = {
      type: 'test',
      color: '#ff0000',
    };
    await request(app)
        .post("/api/categories") //Route to call
        .set(
            "Cookie",
            `accessToken=${testerAccessTokenValid}; refreshToken=${testerAccessTokenValid}`
        ) //Setting cookies in the request
        .send(testCategory) //Definition of the request body
        .then((response) => {
          //After obtaining the response, we check its actual body content
          //The status must represent successful execution
          expect(response.status).toBe(401);
          //The "data" object must have a field named "message" that confirms that changes are successful
          //The actual value of the field could be any string, so it's not checked
          expect(response.body).toHaveProperty("message");
          //Must be called at the end of every test or the test will fail while waiting for it to be called
          //done();
        });
  });

  test("Missing attributes #1 [empty string]", async () => {
    const testAdmin = {
      username: "admin",
      email: "admin@test.com",
      password: "administrator",
      refreshToken: adminAccessTokenValid,
    };
    const testCategory = {
      type: '',
      color: '#ff0000',
    };
    await request(app)
        .post("/api/categories") //Route to call
        .set(
            "Cookie",
            `accessToken=${adminAccessTokenValid}; refreshToken=${adminAccessTokenValid}`
        ) //Setting cookies in the request
        .send(testCategory) //Definition of the request body
        .then((response) => {
          //After obtaining the response, we check its actual body content
          //The status must represent successful execution
          expect(response.status).toBe(400);
          //The "data" object must have a field named "message" that confirms that changes are successful
          //The actual value of the field could be any string, so it's not checked
          expect(response.body).toHaveProperty("error");
          //Must be called at the end of every test or the test will fail while waiting for it to be called
          //done();
        });
  });

  test("Category already exist", async () => {
    const testAdmin = {
      username: "admin",
      email: "admin@test.com",
      password: "administrator",
      refreshToken: adminAccessTokenValid,
    };
    const testCategory = {
      type: 'test',
      color: '#ff0000',
    };
    await categories.create(testCategory);
    await request(app)
        .post("/api/categories") //Route to call
        .set(
            "Cookie",
            `accessToken=${adminAccessTokenValid}; refreshToken=${adminAccessTokenValid}`
        ) //Setting cookies in the request
        .send(testCategory) //Definition of the request body
        .then((response) => {
          //After obtaining the response, we check its actual body content
          //The status must represent successful execution
          expect(response.status).toBe(400);
          //The "data" object must have a field named "message" that confirms that changes are successful
          //The actual value of the field could be any string, so it's not checked
          expect(response.body).toHaveProperty("error");
          //Must be called at the end of every test or the test will fail while waiting for it to be called
          //done();
        });
  });

  test("Missing attributes #2 [missing part]", async () => {
    const testAdmin = {
      username: "admin",
      email: "admin@test.com",
      password: "administrator",
      refreshToken: adminAccessTokenValid,
    };
    const testCategory = {
      color: '#ff0000',
    };
    await request(app)
        .post("/api/categories") //Route to call
        .set(
            "Cookie",
            `accessToken=${adminAccessTokenValid}; refreshToken=${adminAccessTokenValid}`
        ) //Setting cookies in the request
        .send(testCategory) //Definition of the request body
        .then((response) => {
          //After obtaining the response, we check its actual body content
          //The status must represent successful execution
          expect(response.status).toBe(400);
          //The "data" object must have a field named "message" that confirms that changes are successful
          //The actual value of the field could be any string, so it's not checked
          expect(response.body).toHaveProperty("error");
          //Must be called at the end of every test or the test will fail while waiting for it to be called
          //done();
        });
  });

  test("No access token", async () => {
    const testAdmin = {
      username: "test",
      email: "test@test.com",
      password: "notadmin",
      refreshToken: testerAccessTokenValid,
    };
    const testCategory = {
      type: 'test',
      color: '#ff0000',
    };
    await request(app)
        .post("/api/categories") //Route to call
        .set(
            "Cookie",
            `refreshToken=${testerAccessTokenValid}`
        ) //Setting cookies in the request
        .send(testCategory) //Definition of the request body
        .then((response) => {
          //After obtaining the response, we check its actual body content
          //The status must represent successful execution
          expect(response.status).toBe(401);
          //The "data" object must have a field named "message" that confirms that changes are successful
          //The actual value of the field could be any string, so it's not checked
          expect(response.body).toHaveProperty("message");
          //Must be called at the end of every test or the test will fail while waiting for it to be called
          //done();
        });
  });

});

describe("updateCategory", () => {
  test("Category created by unauthorized user", async () => {
    const testCategory = {
      type: 'test',
      color: '#ff0000',
    };
    const newValues = {
      type: 'newType',
      color: '#ff0000',
    };
    await categories.create(testCategory)
    await request(app)
        .patch("/api/categories/" + testCategory.type) //Route to call
        .set(
            "Cookie",
            `accessToken=${testerAccessTokenValid}; refreshToken=${testerAccessTokenValid}`
        ) //Setting cookies in the request
        .send(newValues) //Definition of the request body
        .then((response) => {
          //After obtaining the response, we check its actual body content
          //The status must represent successful execution
          expect(response.status).toBe(401);
          //The "data" object must have a field named "message" that confirms that changes are successful
          //The actual value of the field could be any string, so it's not checked
          expect(response.body).toHaveProperty("message");
          //Must be called at the end of every test or the test will fail while waiting for it to be called
          //done();
        });
  });

  test("Missing attributes #1 [empty string]", async () => {
    const testCategory = {
      type: 'test',
      color: '#ff0000',
    };
    const newValues = {
      type: '',
      color: '#ff0000',
    };
    await categories.create(testCategory)
    await request(app)
        .patch("/api/categories/" + testCategory.type) //Route to call
        .set(
            "Cookie",
            `accessToken=${adminAccessTokenValid}; refreshToken=${adminAccessTokenValid}`
        ) //Setting cookies in the request
        .send(newValues) //Definition of the request body
        .then((response) => {
          //After obtaining the response, we check its actual body content
          //The status must represent successful execution
          expect(response.status).toBe(400);
          //The "data" object must have a field named "message" that confirms that changes are successful
          //The actual value of the field could be any string, so it's not checked
          expect(response.body).toHaveProperty("error");
          //Must be called at the end of every test or the test will fail while waiting for it to be called
          //done();
        });
  });

  test("Missing attributes #2 [missing argument]", async () => {
    const testCategory = {
      type: 'test',
      color: '#ff0000',
    };
    const newValues = {
      color: '#ff0000',
    };
    await categories.create(testCategory);
    await request(app)
        .patch("/api/categories/" + testCategory.type) //Route to call
        .set(
            "Cookie",
            `accessToken=${adminAccessTokenValid}; refreshToken=${adminAccessTokenValid}`
        ) //Setting cookies in the request
        .send(newValues) //Definition of the request body
        .then((response) => {
          //After obtaining the response, we check its actual body content
          //The status must represent successful execution
          expect(response.status).toBe(400);
          //The "data" object must have a field named "message" that confirms that changes are successful
          //The actual value of the field could be any string, so it's not checked
          expect(response.body).toHaveProperty("error");
          //Must be called at the end of every test or the test will fail while waiting for it to be called
          //done();
        });
  });

  test("New type refers to existing category", async () => {
    const testCategory = {
      type: 'test',
      color: '#ff0000',
    };
    const newValues = {
      type: 'exists',
      color: '#ff0000',
    };
    await categories.create(testCategory);
    await categories.create(newValues);
    await request(app)
        .patch("/api/categories/" + testCategory.type) //Route to call
        .set(
            "Cookie",
            `accessToken=${adminAccessTokenValid}; refreshToken=${adminAccessTokenValid}`
        ) //Setting cookies in the request
        .send(newValues) //Definition of the request body
        .then((response) => {
          //After obtaining the response, we check its actual body content
          //The status must represent successful execution
          expect(response.status).toBe(400);
          //The "data" object must have a field named "message" that confirms that changes are successful
          //The actual value of the field could be any string, so it's not checked
          expect(response.body).toHaveProperty("error");
          //Must be called at the end of every test or the test will fail while waiting for it to be called
          //done();
        });
  });

  test("Route exists, category doesn't", async () => {
    const testCategory = {
      type: 'test',
      color: '#ff0000',
    };
    const newValues = {
      type: 'exists',
      color: '#ff0000',
    };
    await request(app)
        .patch("/api/categories/" + testCategory.type) //Route to call
        .set(
            "Cookie",
            `accessToken=${adminAccessTokenValid}; refreshToken=${adminAccessTokenValid}`
        ) //Setting cookies in the request
        .send(newValues) //Definition of the request body
        .then((response) => {
          //After obtaining the response, we check its actual body content
          //The status must represent successful execution
          expect(response.status).toBe(400);
          //The "data" object must have a field named "message" that confirms that changes are successful
          //The actual value of the field could be any string, so it's not checked
          expect(response.body).toHaveProperty("error");
          //Must be called at the end of every test or the test will fail while waiting for it to be called
          //done();
        });
  });

  test("Success", async () => {
    const testCategory = {
      type: 'test',
      color: '#ff0000',
    };
    const newValues = {
      type: 'exists',
      color: '#ff0000',
    };
    const testTransactions = [{
      username: "mock",
      amount: 9000,
      type: "test",
    }, {
      username: "mock",
      amount: 9000,
      type: "test",
    }, {
      username: "mock",
      amount: 9000,
      type: "test",
    }];
    await categories.create(testCategory);
    await transactions.insertMany(testTransactions);
    await request(app)
        .patch("/api/categories/" + testCategory.type) //Route to call
        .set(
            "Cookie",
            `accessToken=${adminAccessTokenValid}; refreshToken=${adminAccessTokenValid}`
        ) //Setting cookies in the request
        .send(newValues) //Definition of the request body
        .then((response) => {
          //After obtaining the response, we check its actual body content
          //The status must represent successful execution
          expect(response.status).toBe(200);
          //The "data" object must have a field named "message" that confirms that changes are successful
          //The actual value of the field could be any string, so it's not checked
          expect(response.body.data).toHaveProperty("message");
          expect(response.body.data).toHaveProperty("count");
          //Must be called at the end of every test or the test will fail while waiting for it to be called
          //done();
        });
  });

  test("Missing access token", async () => {
    const testCategory = {
      type: 'test',
      color: '#ff0000',
    };
    const newValues = {
      type: 'newType',
      color: '#ff0000',
    };
    await categories.create(testCategory)
    await request(app)
        .patch("/api/categories/" + testCategory.type) //Route to call
        .set(
            "Cookie",
            `refreshToken=${testerAccessTokenValid}`
        ) //Setting cookies in the request
        .send(newValues) //Definition of the request body
        .then((response) => {
          //After obtaining the response, we check its actual body content
          //The status must represent successful execution
          expect(response.status).toBe(401);
          //The "data" object must have a field named "message" that confirms that changes are successful
          //The actual value of the field could be any string, so it's not checked
          expect(response.body).toHaveProperty("message");
          //Must be called at the end of every test or the test will fail while waiting for it to be called
          //done();
        });
  });
});

describe("deleteCategory", () => {
  test("Category created by unauthorized user", async () => {
    const mockReq = { types: ['test', "fuel"] };
    const oldCategories = [{
      type: "test",
      color: "#ff1234"
    },
      {
      type: "fuel",
      color: "#ff1234"
    },
      {
        type: "supermarket",
        color: "#ff1234"
      },
      {
        type: "bills",
        color: "#ff1234"
      },
      {
        type: "pharmacy",
        color: "#ff1234"
      }]
    await categories.insertMany(oldCategories)
    await request(app)
        .delete("/api/categories") //Route to call
        .set(
            "Cookie",
            `accessToken=${testerAccessTokenValid}; refreshToken=${testerAccessTokenValid}`
        ) //Setting cookies in the request
        .send(mockReq) //Definition of the request body
        .then((response) => {
          //After obtaining the response, we check its actual body content
          //The status must represent successful execution
          expect(response.status).toBe(401);
          //The "data" object must have a field named "message" that confirms that changes are successful
          //The actual value of the field could be any string, so it's not checked
          expect(response.body).toHaveProperty("message");
          //Must be called at the end of every test or the test will fail while waiting for it to be called
          //done();
        });
  });

  test("Empty array", async () => {
    const mockReq = { types: [] };
    const oldCategories = [{
      type: "test",
      color: "#ff1234"
    },
      {
        type: "fuel",
        color: "#ff1234"
      },
      {
        type: "supermarket",
        color: "#ff1234"
      },
      {
        type: "bills",
        color: "#ff1234"
      },
      {
        type: "pharmacy",
        color: "#ff1234"
      }]
    await categories.insertMany(oldCategories)
    await request(app)
        .delete("/api/categories") //Route to call
        .set(
            "Cookie",
            `accessToken=${adminAccessTokenValid}; refreshToken=${adminAccessTokenValid}`
        ) //Setting cookies in the request
        .send(mockReq) //Definition of the request body
        .then((response) => {
          //After obtaining the response, we check its actual body content
          //The status must represent successful execution
          expect(response.status).toBe(400);
          //The "data" object must have a field named "message" that confirms that changes are successful
          //The actual value of the field could be any string, so it's not checked
          expect(response.body).toHaveProperty("error");
          //Must be called at the end of every test or the test will fail while waiting for it to be called
          //done();
        });
  });

  test("Missing array", async () => {
    const mockReq = { };
    const oldCategories = [{
      type: "test",
      color: "#ff1234"
    },
      {
        type: "fuel",
        color: "#ff1234"
      },
      {
        type: "supermarket",
        color: "#ff1234"
      },
      {
        type: "bills",
        color: "#ff1234"
      },
      {
        type: "pharmacy",
        color: "#ff1234"
      }]
    await categories.insertMany(oldCategories)
    await request(app)
        .delete("/api/categories") //Route to call
        .set(
            "Cookie",
            `accessToken=${adminAccessTokenValid}; refreshToken=${adminAccessTokenValid}`
        ) //Setting cookies in the request
        .send(mockReq) //Definition of the request body
        .then((response) => {
          //After obtaining the response, we check its actual body content
          //The status must represent successful execution
          expect(response.status).toBe(400);
          //The "data" object must have a field named "message" that confirms that changes are successful
          //The actual value of the field could be any string, so it's not checked
          expect(response.body).toHaveProperty("error");
          //Must be called at the end of every test or the test will fail while waiting for it to be called
          //done();
        });
  });

  test("Empty string in array", async () => {
    const mockReq = { types: ['test', ""] };
    const oldCategories = [{
      type: "test",
      color: "#ff1234"
    },
      {
        type: "fuel",
        color: "#ff1234"
      },
      {
        type: "supermarket",
        color: "#ff1234"
      },
      {
        type: "bills",
        color: "#ff1234"
      },
      {
        type: "pharmacy",
        color: "#ff1234"
      }]
    await categories.insertMany(oldCategories)
    await request(app)
        .delete("/api/categories") //Route to call
        .set(
            "Cookie",
            `accessToken=${adminAccessTokenValid}; refreshToken=${adminAccessTokenValid}`
        ) //Setting cookies in the request
        .send(mockReq) //Definition of the request body
        .then((response) => {
          //After obtaining the response, we check its actual body content
          //The status must represent successful execution
          expect(response.status).toBe(400);
          //The "data" object must have a field named "message" that confirms that changes are successful
          //The actual value of the field could be any string, so it's not checked
          expect(response.body).toHaveProperty("error");
          //Must be called at the end of every test or the test will fail while waiting for it to be called
          //done();
        });
  });

  test("One category in array does not exist", async () => {
    const mockReq = {types: ["test", "notExisting"]};
    const oldCategories = [{
      type: "test",
      color: "#ff1234"
    },
      {
        type: "fuel",
        color: "#ff1234"
      },
      {
        type: "supermarket",
        color: "#ff1234"
      },
      {
        type: "bills",
        color: "#ff1234"
      },
      {
        type: "pharmacy",
        color: "#ff1234"
      }]
    await categories.insertMany(oldCategories)
    await request(app)
        .delete("/api/categories") //Route to call
        .set(
            "Cookie",
            `accessToken=${adminAccessTokenValid}; refreshToken=${adminAccessTokenValid}`
        ) //Setting cookies in the request
        .send(mockReq) //Definition of the request body
        .then((response) => {
          //After obtaining the response, we check its actual body content
          //The status must represent successful execution
          expect(response.status).toBe(400);
          //The "data" object must have a field named "message" that confirms that changes are successful
          //The actual value of the field could be any string, so it's not checked
          expect(response.body).toHaveProperty("error");
          //Must be called at the end of every test or the test will fail while waiting for it to be called
          //done();
        });
  });

  test("One category in db", async () => {
    const mockReq = { types: ['test',] };
    const oldCategories = [{
      type: "test",
      color: "#ff1234"
    }]
    await categories.insertMany(oldCategories)
    await request(app)
        .delete("/api/categories") //Route to call
        .set(
            "Cookie",
            `accessToken=${adminAccessTokenValid}; refreshToken=${adminAccessTokenValid}`
        ) //Setting cookies in the request
        .send(mockReq) //Definition of the request body
        .then((response) => {
          //After obtaining the response, we check its actual body content
          //The status must represent successful execution
          expect(response.status).toBe(400);
          //The "data" object must have a field named "message" that confirms that changes are successful
          //The actual value of the field could be any string, so it's not checked
          expect(response.body).toHaveProperty("error");
          //Must be called at the end of every test or the test will fail while waiting for it to be called
          //done();
        });
  });

  test("Success N>T", async () => {
    const mockReq = { types: ['test', "fuel"] };
    const oldCategories = [{
      type: "test",
      color: "#ff1234"
    },
      {
        type: "fuel",
        color: "#ff1234"
      },
      {
        type: "supermarket",
        color: "#ff1234"
      },
      {
        type: "bills",
        color: "#ff1234"
      },
      {
        type: "pharmacy",
        color: "#ff1234"
      }];
    const transactionsToAdd = [
      {
        username: "mock",
        amount: 9000,
        type: "test",
      },
      {
        username: "mock",
        amount: 9000,
        type: "fuel",
      },
      {
        username: "mock",
        amount: 9000,
        type: "fuel",
      },
      {
        username: "mock",
        amount: 9000,
        type: "supermarket",
      },
      {
        username: "mock",
        amount: 9000,
        type: "test",
      },
      {
        username: "mock",
        amount: 9000,
        type: "bills",
      },
      {
        username: "mock",
        amount: 9000,
        type: "pharmacy",
      }
    ];
    await transactions.insertMany(transactionsToAdd);
    await categories.insertMany(oldCategories);
    await request(app)
        .delete("/api/categories") //Route to call
        .set(
            "Cookie",
            `accessToken=${adminAccessTokenValid}; refreshToken=${adminAccessTokenValid}`
        ) //Setting cookies in the request
        .send(mockReq) //Definition of the request body
        .then((response) => {
          //After obtaining the response, we check its actual body content
          //The status must represent successful execution
          expect(response.status).toBe(200);
          //The "data" object must have a field named "message" that confirms that changes are successful
          //The actual value of the field could be any string, so it's not checked
          expect(response.body.data).toHaveProperty("message");
          expect(response.body.data).toHaveProperty("count", 4)
          //Must be called at the end of every test or the test will fail while waiting for it to be called
          //done();
        });
  });

  test("Success N==T", async () => {
    const mockReq = { types: ['test', "fuel"] };
    const oldCategories = [{
      type: "test",
      color: "#ff1234"
    },
      {
        type: "fuel",
        color: "#ff1234"
      },];
    const transactionsToAdd = [
      {
        username: "mock",
        amount: 9000,
        type: "test",
      },
      {
        username: "mock",
        amount: 9000,
        type: "fuel",
      },
      {
        username: "mock",
        amount: 9000,
        type: "fuel",
      },
      {
        username: "mock",
        amount: 9000,
        type: "fuel",
      },
      {
        username: "mock",
        amount: 9000,
        type: "test",
      },
      {
        username: "mock",
        amount: 9000,
        type: "test",
      },
      {
        username: "mock",
        amount: 9000,
        type: "fuel",
      }
    ];
    await transactions.insertMany(transactionsToAdd);
    await categories.insertMany(oldCategories);
    await request(app)
        .delete("/api/categories") //Route to call
        .set(
            "Cookie",
            `accessToken=${adminAccessTokenValid}; refreshToken=${adminAccessTokenValid}`
        ) //Setting cookies in the request
        .send(mockReq) //Definition of the request body
        .then((response) => {
          //After obtaining the response, we check its actual body content
          //The status must represent successful execution
          expect(response.status).toBe(200);
          //The "data" object must have a field named "message" that confirms that changes are successful
          //The actual value of the field could be any string, so it's not checked
          expect(response.body.data).toHaveProperty("message");
          expect(response.body.data).toHaveProperty("count", 4)
          //Must be called at the end of every test or the test will fail while waiting for it to be called
          //done();
        });
  });

  test("Category created by unauthorized user (missing accessToken)", async () => {
    const mockReq = { types: ['test', "fuel"] };
    const oldCategories = [{
      type: "test",
      color: "#ff1234"
    },
      {
        type: "fuel",
        color: "#ff1234"
      },
      {
        type: "supermarket",
        color: "#ff1234"
      },
      {
        type: "bills",
        color: "#ff1234"
      },
      {
        type: "pharmacy",
        color: "#ff1234"
      }]
    await categories.insertMany(oldCategories)
    await request(app)
        .delete("/api/categories") //Route to call
        .set(
            "Cookie",
            `refreshToken=${testerAccessTokenValid}`
        ) //Setting cookies in the request
        .send(mockReq) //Definition of the request body
        .then((response) => {
          //After obtaining the response, we check its actual body content
          //The status must represent successful execution
          expect(response.status).toBe(401);
          //The "data" object must have a field named "message" that confirms that changes are successful
          //The actual value of the field could be any string, so it's not checked
          expect(response.body).toHaveProperty("message");
          //Must be called at the end of every test or the test will fail while waiting for it to be called
          //done();
        });
  });

  test("Fail N<T", async () => {
    const mockReq = { types: ['test', "fuel", "bills"] };
    const oldCategories = [{
      type: "test",
      color: "#ff1234"
    },
      {
        type: "fuel",
        color: "#ff1234"
      },
    ];
    await categories.insertMany(oldCategories);
    await request(app)
        .delete("/api/categories") //Route to call
        .set(
            "Cookie",
            `accessToken=${adminAccessTokenValid}; refreshToken=${adminAccessTokenValid}`
        ) //Setting cookies in the request
        .send(mockReq) //Definition of the request body
        .then((response) => {
          //After obtaining the response, we check its actual body content
          //The status must represent successful execution
          expect(response.status).toBe(400);
          //The "data" object must have a field named "message" that confirms that changes are successful
          //The actual value of the field could be any string, so it's not checked
          expect(response.body).toHaveProperty("error");
          expect(response.body).toHaveProperty("error", "More categories to delete than actual!")
          //Must be called at the end of every test or the test will fail while waiting for it to be called
          //done();
        });
  });
});

describe("getCategories", () => {
  test("Retrieved all categories", async () => {
      const testCategories = [
          {
              type: "test",
              color: "#ff0000",
          },
          {
              type: "fuel",
              color: "#002aff",
          },
      ];
      await categories.insertMany(testCategories);
      await request(app)
          .get("/api/categories") //Route to call
          .set(
              "Cookie",
              `accessToken=${testerAccessTokenValid}; refreshToken=${testerAccessTokenValid}`
          ) //Setting cookies in the request
          .send()
          .then((response) => {
              expect(response.status).toBe(200);
              expect(response.body).toHaveProperty("message");
              expect(
                  response.body.data.map((obj) => {
                      return {
                          type: obj.type,
                          color: obj.color,
                      };
                  })
              ).toEqual(testCategories);
          });
  });

  test("Unauthorized user", async () => {
      const testCategories = [
          {
              type: "test",
              color: "#ff0000",
          },
          {
              type: "fuel",
              color: "#002aff",
          },
      ];
      await categories.insertMany(testCategories);
      await request(app)
          .get("/api/categories") //Route to call
          .set(
              "Cookie",
              `accessToken=${testerAccessTokenEmpty}; refreshToken=${testerAccessTokenEmpty}`
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
              //Must be called at the end of every test or the test will fail while waiting for it to be called
              //done();
          });
  });

  test("Retrieved empty array", async () => {
      await request(app)
          .get("/api/categories") //Route to call
          .set(
              "Cookie",
              `accessToken=${testerAccessTokenValid}; refreshToken=${testerAccessTokenValid}`
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
              expect(
                  response.body.data
              ).toEqual([]);
              //Must be called at the end of every test or the test will fail while waiting for it to be called
              //done();
          });
  });

  test("No access token", async () => {
    const testCategories = [
      {
        type: "test",
        color: "#ff0000",
      },
      {
        type: "fuel",
        color: "#002aff",
      },
    ];
    await categories.insertMany(testCategories);
    await request(app)
        .get("/api/categories") //Route to call
        .set(
            "Cookie",
            `refreshToken=${testerAccessTokenEmpty}`
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
          //Must be called at the end of every test or the test will fail while waiting for it to be called
          //done();
        });
  });
});

describe("createTransaction", () => {
  test("Transaction created by user [createTransaction] - Integration Test #1", async () => {
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

  test("Different url [createTransaction] - Integration Test #2", async () => {
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
        expect(response.status).toBe(400);
        //The "data" object must have a field named "message" that confirms that changes are successful
        //The actual value of the field could be any string, so it's not checked
        expect(response.body).toHaveProperty("message");
        expect(response.body).toEqual(expectedResponse);
        //We expect the count of edited transactions returned to be equal to 2 (the two transactions we placed in the database)
        //done();
      });
  });

  test("Invalid parameters [createTransaction] - Integration Test #3", async () => {
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

  test("Category dosen't exist [createTransaction] - Integration Test #4", async () => {
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

  test("Unauthorized User [createTransaction] - Integration Test #5", async () => {
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
        `accessToken=${testerAccessTokenEmpty}; refreshToken=${testerAccessTokenEmpty}`
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

  test("Transaction created by admin [createTransaction] - Integration Test #6", async () => {
    const testUser = {
      username: "admin",
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

  test("Transaction for another user created by admin [createTransaction] - Integration Test #7", async () => {
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
        expect(response.status).toBe(400);
        //The "data" object must have a field named "message" that confirms that changes are successful
        //The actual value of the field could be any string, so it's not checked
        expect(response.body).toHaveProperty("message");
        //We expect the count of edited transactions returned to be equal to 2 (the two transactions we placed in the database)
      });
  });
});

describe("getAllTransactions", () => {
  test("Retrieved all transactions [getAllTransactions] - Integration Test #1", async () => {
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
        expect(
          response.body.data.map((obj) => {
            return {
              amount: obj.amount,
              type: obj.type,
              username: obj.username,
            };
          })
        ).toEqual(testTransactions);
        //Must be called at the end of every test or the test will fail while waiting for it to be called
        //done();
      });
  });

  test("Unauthorized admin [getAllTransactions] - Integration Test #2", async () => {
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
  test("Successful user request [getTransactionsByUser] - Integration Test #1", async () => {
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
    const testUsers = [testAdmin, testUser];
    const testUserTransactions = [
      {
        username: "tester",
        amount: 9000,
        type: "test",
      },
      {
        username: "tester",
        amount: 3000,
        type: "test",
      },
    ];
    const testAdminTransactions = [
      {
        username: "admin",
        amount: 12000,
        type: "test",
      },
      {
        username: "admin",
        amount: 1000,
        type: "test",
      },
    ];
    const testTransactions = [
      ...testAdminTransactions,
      ...testUserTransactions,
    ];
    const testCategory = {
      type: "test",
      color: "green",
    };
    await categories.create(testCategory);
    await User.insertMany(testUsers);
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
        expect(
          response.body.data.map((obj) => {
            return {
              amount: obj.amount,
              type: obj.type,
              username: obj.username,
            };
          })
        ).toEqual(testUserTransactions);
      });
  });

  test("Unauthorized user request [getTransactionsByUser] - Integration Test #2", async () => {
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
    const testUsers = [testAdmin, testUser];
    const testUserTransactions = [
      {
        username: "tester",
        amount: 9000,
        type: "test",
      },
      {
        username: "tester",
        amount: 3000,
        type: "test",
      },
    ];
    const testAdminTransactions = [
      {
        username: "admin",
        amount: 12000,
        type: "test",
      },
      {
        username: "admin",
        amount: 1000,
        type: "test",
      },
    ];
    const testTransactions = [
      ...testAdminTransactions,
      ...testUserTransactions,
    ];
    const testCategory = {
      type: "test",
      color: "green",
    };
    await categories.create(testCategory);
    await User.insertMany(testUsers);
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

  test("Successful admin request [getTransactionsByUser] - Integration Test #3", async () => {
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
    const testUsers = [testAdmin, testUser];
    const testUserTransactions = [
      {
        username: "tester",
        amount: 9000,
        type: "test",
      },
      {
        username: "tester",
        amount: 3000,
        type: "test",
      },
    ];
    const testAdminTransactions = [
      {
        username: "admin",
        amount: 12000,
        type: "test",
      },
      {
        username: "admin",
        amount: 1000,
        type: "test",
      },
    ];
    const testTransactions = [
      ...testAdminTransactions,
      ...testUserTransactions,
    ];
    const testCategory = {
      type: "test",
      color: "green",
    };
    await categories.create(testCategory);
    await User.insertMany(testUsers);
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
        expect(
          response.body.data.map((obj) => {
            return {
              amount: obj.amount,
              type: obj.type,
              username: obj.username,
            };
          })
        ).toEqual(testUserTransactions);
      });
  });

  test("Unauthorized admin request [getTransactionsByUser] - Integration Test #4", async () => {
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
    const testUsers = [testAdmin, testUser];
    const testUserTransactions = [
      {
        username: "tester",
        amount: 9000,
        type: "test",
      },
      {
        username: "tester",
        amount: 3000,
        type: "test",
      },
    ];
    const testAdminTransactions = [
      {
        username: "admin",
        amount: 12000,
        type: "test",
      },
      {
        username: "admin",
        amount: 1000,
        type: "test",
      },
    ];
    const testTransactions = [
      ...testAdminTransactions,
      ...testUserTransactions,
    ];
    const testCategory = {
      type: "test",
      color: "green",
    };
    await categories.create(testCategory);
    await User.insertMany(testUsers);
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

  test("User not found [getTransactionsByUser] - Integration Test #5", async () => {
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
    const testUserTransactions = [
      {
        username: "tester",
        amount: 9000,
        type: "test",
      },
      {
        username: "tester",
        amount: 3000,
        type: "test",
      },
    ];
    const testAdminTransactions = [
      {
        username: "admin",
        amount: 12000,
        type: "test",
      },
      {
        username: "admin",
        amount: 1000,
        type: "test",
      },
    ];
    const testTransactions = [
      ...testAdminTransactions,
      ...testUserTransactions,
    ];
    const testCategory = {
      type: "test",
      color: "green",
    };
    await categories.create(testCategory);
    await User.insertMany(testUsers);
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

describe("getTransactionsByUserByCategory", () => {
  test("Successful user request [getTransactionsByUserByCategory] - Integration Test #1", async () => {
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
    const testUsers = [testAdmin, testUser];
    const testUserTransactions = [
      {
        username: "tester",
        amount: 9000,
        type: "test",
      },
      {
        username: "tester",
        amount: 5000,
        type: "home",
      },
      {
        username: "tester",
        amount: 3000,
        type: "test",
      },
    ];
    const testAdminTransactions = [
      {
        username: "admin",
        amount: 12000,
        type: "test",
      },
      {
        username: "admin",
        amount: 1000,
        type: "test",
      },
    ];
    const testTransactions = [
      ...testAdminTransactions,
      ...testUserTransactions,
    ];
    const testCategories = [
      {
        type: "test",
        color: "green",
      },
      {
        type: "home",
        color: "green",
      },
    ];
    await categories.insertMany(testCategories);
    await User.insertMany(testUsers);
    await transactions.insertMany(testTransactions);
    await request(app)
      .get(
        "/api/users/" +
          testUser.username +
          "/transactions/category/" +
          testCategories[0].type
      ) //Route to call
      .set(
        "Cookie",
        `accessToken=${testerAccessTokenValid}; refreshToken=${testerAccessTokenValid}`
      ) //Setting cookies in the request
      .send()
      .then((response) => {
        expect(response.status).toBe(200);
        expect(response.body.message).toEqual("Authorized");
        expect(
          response.body.data.map((obj) => {
            return {
              amount: obj.amount,
              type: obj.type,
              username: obj.username,
            };
          })
        ).toEqual(
          testUserTransactions.filter(
            (trans) => trans.type === testCategories[0].type
          )
        );
      });
  });

  test("Unauthorized user request [getTransactionsByUserByCategory] - Integration Test #2", async () => {
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
    const testUsers = [testAdmin, testUser];
    const testUserTransactions = [
      {
        username: "tester",
        amount: 9000,
        type: "test",
      },
      {
        username: "tester",
        amount: 5000,
        type: "home",
      },
      {
        username: "tester",
        amount: 3000,
        type: "test",
      },
    ];
    const testAdminTransactions = [
      {
        username: "admin",
        amount: 12000,
        type: "test",
      },
      {
        username: "admin",
        amount: 1000,
        type: "test",
      },
    ];
    const testTransactions = [
      ...testAdminTransactions,
      ...testUserTransactions,
    ];
    const testCategories = [
      {
        type: "test",
        color: "green",
      },
      {
        type: "home",
        color: "green",
      },
    ];
    await categories.insertMany(testCategories);
    await User.insertMany(testUsers);
    await transactions.insertMany(testTransactions);
    await request(app)
      .get(
        "/api/users/" +
          testUser.username +
          "/transactions/category/" +
          testCategories[0].type
      ) //Route to call
      .set(
        "Cookie",
        `accessToken=${adminAccessTokenValid}; refreshToken=${adminAccessTokenValid}`
      ) //Setting cookies in the request
      .send()
      .then((response) => {
        expect(response.status).toBe(401);
        expect(response.body.message).toEqual("Unauthorized");
        //expect(response.body.data.map((obj)=>{return {amount:obj.amount,type:obj.type,username:obj.username}})).toEqual(testUserTransactions.filter((trans)=>trans.type===testCategories[0].type));
      });
  });

  test("Successful admin request [getTransactionsByUserByCategory] - Integration Test #3", async () => {
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
    const testUsers = [testAdmin, testUser];
    const testUserTransactions = [
      {
        username: "tester",
        amount: 9000,
        type: "test",
      },
      {
        username: "tester",
        amount: 5000,
        type: "home",
      },
      {
        username: "tester",
        amount: 3000,
        type: "test",
      },
    ];
    const testAdminTransactions = [
      {
        username: "admin",
        amount: 12000,
        type: "test",
      },
      {
        username: "admin",
        amount: 1000,
        type: "test",
      },
    ];
    const testTransactions = [
      ...testAdminTransactions,
      ...testUserTransactions,
    ];
    const testCategories = [
      {
        type: "test",
        color: "green",
      },
      {
        type: "home",
        color: "green",
      },
    ];
    await categories.insertMany(testCategories);
    await User.insertMany(testUsers);
    await transactions.insertMany(testTransactions);
    await request(app)
      .get(
        "/api/transactions/users/" +
          testUser.username +
          "/category/" +
          testCategories[0].type
      ) //Route to call
      .set(
        "Cookie",
        `accessToken=${adminAccessTokenValid}; refreshToken=${adminAccessTokenValid}`
      ) //Setting cookies in the request
      .send()
      .then((response) => {
        expect(response.status).toBe(200);
        expect(response.body.message).toEqual("Authorized");
        expect(
          response.body.data.map((obj) => {
            return {
              amount: obj.amount,
              type: obj.type,
              username: obj.username,
            };
          })
        ).toEqual(
          testUserTransactions.filter(
            (trans) => trans.type === testCategories[0].type
          )
        );
      });
  });

  test("Unauthorized admin request [getTransactionsByUserByCategory] - Integration Test #4", async () => {
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
    const testUsers = [testAdmin, testUser];
    const testUserTransactions = [
      {
        username: "tester",
        amount: 9000,
        type: "test",
      },
      {
        username: "tester",
        amount: 5000,
        type: "home",
      },
      {
        username: "tester",
        amount: 3000,
        type: "test",
      },
    ];
    const testAdminTransactions = [
      {
        username: "admin",
        amount: 12000,
        type: "test",
      },
      {
        username: "admin",
        amount: 1000,
        type: "test",
      },
    ];
    const testTransactions = [
      ...testAdminTransactions,
      ...testUserTransactions,
    ];
    const testCategories = [
      {
        type: "test",
        color: "green",
      },
      {
        type: "home",
        color: "green",
      },
    ];
    await categories.insertMany(testCategories);
    await User.insertMany(testUsers);
    await transactions.insertMany(testTransactions);
    await request(app)
      .get(
        "/api/transactions/users/" +
          testUser.username +
          "/category/" +
          testCategories[0].type
      ) //Route to call
      .set(
        "Cookie",
        `accessToken=${testerAccessTokenValid}; refreshToken=${testerAccessTokenValid}`
      ) //Setting cookies in the request
      .send()
      .then((response) => {
        expect(response.status).toBe(401);
        expect(response.body.message).toEqual("Unauthorized");
        //expect(response.body.data.map((obj)=>{return {amount:obj.amount,type:obj.type,username:obj.username}})).toEqual(testUserTransactions.filter((trans)=>trans.type===testCategories[0].type));
      });
  });

  test("User not found request [getTransactionsByUserByCategory] - Integration Test #5", async () => {
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
    const testUsers = [testAdmin, testUser];
    const testUserTransactions = [
      {
        username: "tester",
        amount: 9000,
        type: "test",
      },
      {
        username: "tester",
        amount: 5000,
        type: "home",
      },
      {
        username: "tester",
        amount: 3000,
        type: "test",
      },
    ];
    const testAdminTransactions = [
      {
        username: "admin",
        amount: 12000,
        type: "test",
      },
      {
        username: "admin",
        amount: 1000,
        type: "test",
      },
    ];
    const testTransactions = [
      ...testAdminTransactions,
      ...testUserTransactions,
    ];
    const testCategories = [
      {
        type: "test",
        color: "green",
      },
      {
        type: "home",
        color: "green",
      },
    ];
    await categories.insertMany(testCategories);
    //await User.insertMany(testUsers);
    await transactions.insertMany(testTransactions);
    await request(app)
      .get(
        "/api/users/" +
          testUser.username +
          "/transactions/category/" +
          testCategories[0].type
      ) //Route to call
      .set(
        "Cookie",
        `accessToken=${testerAccessTokenValid}; refreshToken=${testerAccessTokenValid}`
      ) //Setting cookies in the request
      .send()
      .then((response) => {
        expect(response.status).toBe(400);
        expect(response.body.message).toEqual("User or category not found");
        //expect(response.body.data.map((obj)=>{return {amount:obj.amount,type:obj.type,username:obj.username}})).toEqual(testUserTransactions.filter((trans)=>trans.type===testCategories[0].type));
      });
  });

  test("Category not found request [getTransactionsByUserByCategory] - Integration Test #6", async () => {
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
    const testUsers = [testAdmin, testUser];
    const testUserTransactions = [
      {
        username: "tester",
        amount: 9000,
        type: "test",
      },
      {
        username: "tester",
        amount: 5000,
        type: "home",
      },
      {
        username: "tester",
        amount: 3000,
        type: "test",
      },
    ];
    const testAdminTransactions = [
      {
        username: "admin",
        amount: 12000,
        type: "test",
      },
      {
        username: "admin",
        amount: 1000,
        type: "test",
      },
    ];
    const testTransactions = [
      ...testAdminTransactions,
      ...testUserTransactions,
    ];
    const testCategories = [
      {
        type: "test",
        color: "green",
      },
      {
        type: "home",
        color: "green",
      },
    ];
    //await categories.insertMany(testCategories);
    await User.insertMany(testUsers);
    await transactions.insertMany(testTransactions);
    await request(app)
      .get(
        "/api/users/" +
          testUser.username +
          "/transactions/category/" +
          testCategories[0].type
      ) //Route to call
      .set(
        "Cookie",
        `accessToken=${testerAccessTokenValid}; refreshToken=${testerAccessTokenValid}`
      ) //Setting cookies in the request
      .send()
      .then((response) => {
        expect(response.status).toBe(400);
        expect(response.body.message).toEqual("User or category not found");
        //expect(response.body.data.map((obj)=>{return {amount:obj.amount,type:obj.type,username:obj.username}})).toEqual(testUserTransactions.filter((trans)=>trans.type===testCategories[0].type));
      });
  });
});

describe("getTransactionsByGroup", () => {
  test("Successful user request [getTransactionsByGroup] - Integration Test #1", async () => {
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
    const testUsers = [testAdmin, testUser];
    const testUserTransactions = [
      {
        username: "tester",
        amount: 9000,
        type: "test",
      },
      {
        username: "tester",
        amount: 3000,
        type: "test",
      },
    ];
    const testAdminTransactions = [
      {
        username: "admin",
        amount: 12000,
        type: "test",
      },
      {
        username: "admin",
        amount: 1000,
        type: "test",
      },
    ];
    const testTransactions = [
      ...testAdminTransactions,
      ...testUserTransactions,
    ];
    const testCategory = {
      type: "test",
      color: "green",
    };
    await categories.create(testCategory);
    await User.insertMany(testUsers);
    const testGroup = {
      name: "testGroup",
      members: [
        {
          email: testAdmin.email,
          //user: await User.find({username:testAdmin.username}._id)
        },
        {
          email: testUser.email,
          //user: await User.find({username:testUser.username}._id)
        },
      ],
    };
    await Group.create(testGroup);
    await transactions.insertMany(testTransactions);
    await request(app)
      .get("/api/groups/" + testGroup.name + "/transactions") //Route to call
      .set(
        "Cookie",
        `accessToken=${testerAccessTokenValid}; refreshToken=${testerAccessTokenValid}`
      ) //Setting cookies in the request
      .send()
      .then((response) => {
        expect(response.status).toBe(200);
        expect(response.body.message).toEqual("Authorized");
        expect(
          response.body.data.map((obj) => {
            return {
              amount: obj.amount,
              type: obj.type,
              username: obj.username,
            };
          })
        ).toEqual(testTransactions);
      });
  });

  test("Unauthorized user request [getTransactionsByGroup] - Integration Test #2", async () => {
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
    const testUsers = [testAdmin, testUser];
    const testUserTransactions = [
      {
        username: "tester",
        amount: 9000,
        type: "test",
      },
      {
        username: "tester",
        amount: 3000,
        type: "test",
      },
    ];
    const testAdminTransactions = [
      {
        username: "admin",
        amount: 12000,
        type: "test",
      },
      {
        username: "admin",
        amount: 1000,
        type: "test",
      },
    ];
    const testTransactions = [
      ...testAdminTransactions,
      ...testUserTransactions,
    ];
    const testCategory = {
      type: "test",
      color: "green",
    };
    await categories.create(testCategory);
    await User.insertMany(testUsers);
    const testGroup = {
      name: "testGroup",
      members: [
        {
          email: testAdmin.email,
          //user: await User.find({username:testAdmin.username}._id)
        },
        {
          email: testUser.email,
          //user: await User.find({username:testUser.username}._id)
        },
      ],
    };
    await Group.create(testGroup);
    await transactions.insertMany(testTransactions);
    await request(app)
      .get("/api/groups/" + testGroup.name + "/transactions") //Route to call
      .set(
        "Cookie",
        `accessToken=${adminAccessTokenValid}; refreshToken=${adminAccessTokenValid}`
      ) //Setting cookies in the request
      .send()
      .then((response) => {
        expect(response.status).toBe(401);
        expect(response.body.message).toEqual("Unauthorized");
        //expect(response.body.data.map((obj)=>{return {amount:obj.amount,type:obj.type,username:obj.username}})).toEqual(testTransactions);
      });
  });

  test("Successful admin request [getTransactionsByGroup] - Integration Test #3", async () => {
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
    const testUsers = [testAdmin, testUser];
    const testUserTransactions = [
      {
        username: "tester",
        amount: 9000,
        type: "test",
      },
      {
        username: "tester",
        amount: 3000,
        type: "test",
      },
    ];
    const testAdminTransactions = [
      {
        username: "admin",
        amount: 12000,
        type: "test",
      },
      {
        username: "admin",
        amount: 1000,
        type: "test",
      },
    ];
    const testTransactions = [
      ...testAdminTransactions,
      ...testUserTransactions,
    ];
    const testCategory = {
      type: "test",
      color: "green",
    };
    await categories.create(testCategory);
    await User.insertMany(testUsers);
    const testGroup = {
      name: "testGroup",
      members: [
        {
          email: testAdmin.email,
          //user: await User.find({username:testAdmin.username}._id)
        },
        {
          email: testUser.email,
          //user: await User.find({username:testUser.username}._id)
        },
      ],
    };
    await Group.create(testGroup);
    await transactions.insertMany(testTransactions);
    await request(app)
      .get("/api/transactions/groups/" + testGroup.name) //Route to call
      .set(
        "Cookie",
        `accessToken=${adminAccessTokenValid}; refreshToken=${adminAccessTokenValid}`
      ) //Setting cookies in the request
      .send()
      .then((response) => {
        expect(response.status).toBe(200);
        expect(response.body.message).toEqual("Authorized");
        expect(
          response.body.data.map((obj) => {
            return {
              amount: obj.amount,
              type: obj.type,
              username: obj.username,
            };
          })
        ).toEqual(testTransactions);
      });
  });

  test("Unauthorized admin request [getTransactionsByGroup] - Integration Test #4", async () => {
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
    const testUsers = [testAdmin, testUser];
    const testUserTransactions = [
      {
        username: "tester",
        amount: 9000,
        type: "test",
      },
      {
        username: "tester",
        amount: 3000,
        type: "test",
      },
    ];
    const testAdminTransactions = [
      {
        username: "admin",
        amount: 12000,
        type: "test",
      },
      {
        username: "admin",
        amount: 1000,
        type: "test",
      },
    ];
    const testTransactions = [
      ...testAdminTransactions,
      ...testUserTransactions,
    ];
    const testCategory = {
      type: "test",
      color: "green",
    };
    await categories.create(testCategory);
    await User.insertMany(testUsers);
    const testGroup = {
      name: "testGroup",
      members: [
        {
          email: testAdmin.email,
          //user: await User.find({username:testAdmin.username}._id)
        },
        {
          email: testUser.email,
          //user: await User.find({username:testUser.username}._id)
        },
      ],
    };
    await Group.create(testGroup);
    await transactions.insertMany(testTransactions);
    await request(app)
      .get("/api/transactions/groups/" + testGroup.name) //Route to call
      .set(
        "Cookie",
        `accessToken=${testerAccessTokenValid}; refreshToken=${testerAccessTokenValid}`
      ) //Setting cookies in the request
      .send()
      .then((response) => {
        expect(response.status).toBe(401);
        expect(response.body.message).toEqual("Unauthorized");
        //expect(response.body.data.map((obj)=>{return {amount:obj.amount,type:obj.type,username:obj.username}})).toEqual(testTransactions);
      });
  });

  test("Group not found [getTransactionsByGroup] - Integration Test #5", async () => {
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
    const testUsers = [testAdmin, testUser];
    const testUserTransactions = [
      {
        username: "tester",
        amount: 9000,
        type: "test",
      },
      {
        username: "tester",
        amount: 3000,
        type: "test",
      },
    ];
    const testAdminTransactions = [
      {
        username: "admin",
        amount: 12000,
        type: "test",
      },
      {
        username: "admin",
        amount: 1000,
        type: "test",
      },
    ];
    const testTransactions = [
      ...testAdminTransactions,
      ...testUserTransactions,
    ];
    const testCategory = {
      type: "test",
      color: "green",
    };
    await categories.create(testCategory);
    await User.insertMany(testUsers);
    const testGroup = {
      name: "testGroup",
      members: [
        {
          email: testAdmin.email,
          //user: await User.find({username:testAdmin.username}._id)
        },
        {
          email: testUser.email,
          //user: await User.find({username:testUser.username}._id)
        },
      ],
    };
    //await Group.create(testGroup);
    await transactions.insertMany(testTransactions);
    await request(app)
      .get("/api/groups/" + testGroup.name + "/transactions") //Route to call
      .set(
        "Cookie",
        `accessToken=${testerAccessTokenValid}; refreshToken=${testerAccessTokenValid}`
      ) //Setting cookies in the request
      .send()
      .then((response) => {
        expect(response.status).toBe(400);
        expect(response.body.message).toEqual("Group not found");
        //expect(response.body.data.map((obj)=>{return {amount:obj.amount,type:obj.type,username:obj.username}})).toEqual(testTransactions);
      });
  });
});

describe("getTransactionsByGroupByCategory", () => {
  test("Successful user request [getTransactionsByGroupByCategory] - Integration Test #1", async () => {
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
    const testUsers = [testAdmin, testUser];
    const testUserTransactions = [
      {
        username: "tester",
        amount: 9000,
        type: "test",
      },
      {
        username: "tester",
        amount: 5000,
        type: "home",
      },
      {
        username: "tester",
        amount: 3000,
        type: "test",
      },
    ];
    const testAdminTransactions = [
      {
        username: "admin",
        amount: 12000,
        type: "test",
      },
      {
        username: "admin",
        amount: 1000,
        type: "test",
      },
    ];
    const testTransactions = [
      ...testAdminTransactions,
      ...testUserTransactions,
    ];
    const testCategories = [
      {
        type: "test",
        color: "green",
      },
      {
        type: "home",
        color: "green",
      },
    ];
    await categories.insertMany(testCategories);
    await User.insertMany(testUsers);
    await transactions.insertMany(testTransactions);
    const testGroup = {
      name: "testGroup",
      members: [
        {
          email: testAdmin.email,
          //user: await User.find({username:testAdmin.username}._id)
        },
        {
          email: testUser.email,
          //user: await User.find({username:testUser.username}._id)
        },
      ],
    };
    await Group.create(testGroup);
    await request(app)
      .get(
        "/api/groups/" +
          testGroup.name +
          "/transactions/category/" +
          testCategories[0].type
      ) //Route to call
      .set(
        "Cookie",
        `accessToken=${testerAccessTokenValid}; refreshToken=${testerAccessTokenValid}`
      ) //Setting cookies in the request
      .send()
      .then((response) => {
        expect(response.status).toBe(200);
        expect(response.body.message).toEqual("Authorized");
        expect(
          response.body.data.map((obj) => {
            return {
              amount: obj.amount,
              type: obj.type,
              username: obj.username,
            };
          })
        ).toEqual(
          testTransactions.filter(
            (trans) => trans.type === testCategories[0].type
          )
        );
      });
  });

  test("Unauthorized user request [getTransactionsByGroupByCategory] - Integration Test #2", async () => {
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
    const testUsers = [testAdmin, testUser];
    const testUserTransactions = [
      {
        username: "tester",
        amount: 9000,
        type: "test",
      },
      {
        username: "tester",
        amount: 5000,
        type: "home",
      },
      {
        username: "tester",
        amount: 3000,
        type: "test",
      },
    ];
    const testAdminTransactions = [
      {
        username: "admin",
        amount: 12000,
        type: "test",
      },
      {
        username: "admin",
        amount: 1000,
        type: "test",
      },
    ];
    const testTransactions = [
      ...testAdminTransactions,
      ...testUserTransactions,
    ];
    const testCategories = [
      {
        type: "test",
        color: "green",
      },
      {
        type: "home",
        color: "green",
      },
    ];
    await categories.insertMany(testCategories);
    await User.insertMany(testUsers);
    await transactions.insertMany(testTransactions);
    const testGroup = {
      name: "testGroup",
      members: [
        {
          email: testAdmin.email,
          //user: await User.find({username:testAdmin.username}._id)
        },
        {
          email: testUser.email,
          //user: await User.find({username:testUser.username}._id)
        },
      ],
    };
    await Group.create(testGroup);
    await request(app)
      .get(
        "/api/groups/" +
          testGroup.name +
          "/transactions/category/" +
          testCategories[0].type
      ) //Route to call
      .set(
        "Cookie",
        `accessToken=${adminAccessTokenValid}; refreshToken=${adminAccessTokenValid}`
      ) //Setting cookies in the request
      .send()
      .then((response) => {
        expect(response.status).toBe(401);
        expect(response.body.message).toEqual("Unauthorized");
      });
  });

  test("Successful admin request [getTransactionsByGroupByCategory] - Integration Test #3", async () => {
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
    const testUsers = [testAdmin, testUser];
    const testUserTransactions = [
      {
        username: "tester",
        amount: 9000,
        type: "test",
      },
      {
        username: "tester",
        amount: 5000,
        type: "home",
      },
      {
        username: "tester",
        amount: 3000,
        type: "test",
      },
    ];
    const testAdminTransactions = [
      {
        username: "admin",
        amount: 12000,
        type: "test",
      },
      {
        username: "admin",
        amount: 1000,
        type: "test",
      },
    ];
    const testTransactions = [
      ...testAdminTransactions,
      ...testUserTransactions,
    ];
    const testCategories = [
      {
        type: "test",
        color: "green",
      },
      {
        type: "home",
        color: "green",
      },
    ];
    await categories.insertMany(testCategories);
    await User.insertMany(testUsers);
    await transactions.insertMany(testTransactions);
    const testGroup = {
      name: "testGroup",
      members: [
        {
          email: testAdmin.email,
          //user: await User.find({username:testAdmin.username}._id)
        },
        {
          email: testUser.email,
          //user: await User.find({username:testUser.username}._id)
        },
      ],
    };
    await Group.create(testGroup);
    await request(app)
      .get(
        "/api/transactions/groups/" +
          testGroup.name +
          "/category/" +
          testCategories[0].type
      ) //Route to call
      .set(
        "Cookie",
        `accessToken=${adminAccessTokenValid}; refreshToken=${adminAccessTokenValid}`
      ) //Setting cookies in the request
      .send()
      .then((response) => {
        expect(response.status).toBe(200);
        expect(response.body.message).toEqual("Authorized");
        expect(
          response.body.data.map((obj) => {
            return {
              amount: obj.amount,
              type: obj.type,
              username: obj.username,
            };
          })
        ).toEqual(
          testTransactions.filter(
            (trans) => trans.type === testCategories[0].type
          )
        );
      });
  });

  test("Unauthorized admin request [getTransactionsByGroupByCategory] - Integration Test #4", async () => {
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
    const testUsers = [testAdmin, testUser];
    const testUserTransactions = [
      {
        username: "tester",
        amount: 9000,
        type: "test",
      },
      {
        username: "tester",
        amount: 5000,
        type: "home",
      },
      {
        username: "tester",
        amount: 3000,
        type: "test",
      },
    ];
    const testAdminTransactions = [
      {
        username: "admin",
        amount: 12000,
        type: "test",
      },
      {
        username: "admin",
        amount: 1000,
        type: "test",
      },
    ];
    const testTransactions = [
      ...testAdminTransactions,
      ...testUserTransactions,
    ];
    const testCategories = [
      {
        type: "test",
        color: "green",
      },
      {
        type: "home",
        color: "green",
      },
    ];
    await categories.insertMany(testCategories);
    await User.insertMany(testUsers);
    await transactions.insertMany(testTransactions);
    const testGroup = {
      name: "testGroup",
      members: [
        {
          email: testAdmin.email,
          //user: await User.find({username:testAdmin.username}._id)
        },
        {
          email: testUser.email,
          //user: await User.find({username:testUser.username}._id)
        },
      ],
    };
    await Group.create(testGroup);
    await request(app)
      .get(
        "/api/transactions/groups/" +
          testGroup.name +
          "/category/" +
          testCategories[0].type
      ) //Route to call
      .set(
        "Cookie",
        `accessToken=${testerAccessTokenValid}; refreshToken=${testerAccessTokenValid}`
      ) //Setting cookies in the request
      .send()
      .then((response) => {
        expect(response.status).toBe(401);
        expect(response.body.message).toEqual("Unauthorized");
      });
  });

  test("Group not found request [getTransactionsByGroupByCategory] - Integration Test #5", async () => {
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
    const testUsers = [testAdmin, testUser];
    const testUserTransactions = [
      {
        username: "tester",
        amount: 9000,
        type: "test",
      },
      {
        username: "tester",
        amount: 5000,
        type: "home",
      },
      {
        username: "tester",
        amount: 3000,
        type: "test",
      },
    ];
    const testAdminTransactions = [
      {
        username: "admin",
        amount: 12000,
        type: "test",
      },
      {
        username: "admin",
        amount: 1000,
        type: "test",
      },
    ];
    const testTransactions = [
      ...testAdminTransactions,
      ...testUserTransactions,
    ];
    const testCategories = [
      {
        type: "test",
        color: "green",
      },
      {
        type: "home",
        color: "green",
      },
    ];
    await categories.insertMany(testCategories);
    await User.insertMany(testUsers);
    await transactions.insertMany(testTransactions);
    const testGroup = {
      name: "testGroup",
      members: [
        {
          email: testAdmin.email,
          //user: await User.find({username:testAdmin.username}._id)
        },
        {
          email: testUser.email,
          //user: await User.find({username:testUser.username}._id)
        },
      ],
    };
    //await Group.create(testGroup);
    await request(app)
      .get(
        "/api/groups/" +
          testGroup.name +
          "/transactions/category/" +
          testCategories[0].type
      ) //Route to call
      .set(
        "Cookie",
        `accessToken=${testerAccessTokenValid}; refreshToken=${testerAccessTokenValid}`
      ) //Setting cookies in the request
      .send()
      .then((response) => {
        expect(response.status).toBe(400);
        expect(response.body.message).toEqual("Group or category not found");
      });
  });

  test("Category not found request [getTransactionsByGroupByCategory] - Integration Test #6", async () => {
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
    const testUsers = [testAdmin, testUser];
    const testUserTransactions = [
      {
        username: "tester",
        amount: 9000,
        type: "test",
      },
      {
        username: "tester",
        amount: 5000,
        type: "home",
      },
      {
        username: "tester",
        amount: 3000,
        type: "test",
      },
    ];
    const testAdminTransactions = [
      {
        username: "admin",
        amount: 12000,
        type: "test",
      },
      {
        username: "admin",
        amount: 1000,
        type: "test",
      },
    ];
    const testTransactions = [
      ...testAdminTransactions,
      ...testUserTransactions,
    ];
    const testCategories = [
      {
        type: "test",
        color: "green",
      },
      {
        type: "home",
        color: "green",
      },
    ];
    //await categories.insertMany(testCategories);
    await User.insertMany(testUsers);
    await transactions.insertMany(testTransactions);
    const testGroup = {
      name: "testGroup",
      members: [
        {
          email: testAdmin.email,
          //user: await User.find({username:testAdmin.username}._id)
        },
        {
          email: testUser.email,
          //user: await User.find({username:testUser.username}._id)
        },
      ],
    };
    await Group.create(testGroup);
    await request(app)
      .get(
        "/api/groups/" +
          testGroup.name +
          "/transactions/category/" +
          testCategories[0].type
      ) //Route to call
      .set(
        "Cookie",
        `accessToken=${testerAccessTokenValid}; refreshToken=${testerAccessTokenValid}`
      ) //Setting cookies in the request
      .send()
      .then((response) => {
        expect(response.status).toBe(400);
        expect(response.body.message).toEqual("Group or category not found");
      });
  });
});

describe("deleteTransaction", () => {
  test("Transaction deleted by user [deleteTransaction] - Integration Test #1", async () => {
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
    const createdTransaction = await transactions.create(testTransaction);
    const createdID = createdTransaction._id.toString();
    await request(app)
      .delete("/api/users/" + testUser.username + "/transactions") //Route to call
      .set(
        "Cookie",
        `accessToken=${testerAccessTokenValid}; refreshToken=${testerAccessTokenValid}`
      ) //Setting cookies in the request
      .send({ _id: createdID }) //Definition of the request body
      .then((response) => {
        expect(response.status).toBe(200);
        expect(response.body.message).toEqual("Transaction deleted");
        expect(response.body.data).toEqual({
          acknowledged: true,
          deletedCount: 1,
          message: "Transaction deleted"
        });
      });
  });

  test("Transaction deleted by admin [deleteTransaction] - Integration Test #2", async () => {
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
    const createdTransaction = await transactions.create(testTransaction);
    const createdID = createdTransaction._id.toString();
    await request(app)
      .delete("/api/users/" + testUser.username + "/transactions") //Route to call
      .set(
        "Cookie",
        `accessToken=${adminAccessTokenValid}; refreshToken=${adminAccessTokenValid}`
      ) //Setting cookies in the request
      .send({ _id: createdID }) //Definition of the request body
      .then((response) => {
        expect(response.status).toBe(200);
        expect(response.body.message).toEqual("Transaction deleted");
        expect(response.body.data).toEqual({
          acknowledged: true,
          deletedCount: 1,
        });
      });
  });

  test("User not authorized [deleteTransaction] - Integration Test #3", async () => {
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
    const testTransaction = {
      username: testAdmin.username,
      amount: 9000,
      type: "test",
    };
    const testCategory = {
      type: "test",
      color: "green",
    };
    await categories.create(testCategory);
    await User.create(testUser);
    await User.create(testAdmin);
    const createdTransaction = await transactions.create(testTransaction);
    const createdID = createdTransaction._id.toString();
    await request(app)
      .delete("/api/users/" + testAdmin.username + "/transactions") //Route to call
      .set(
        "Cookie",
        `accessToken=${testerAccessTokenValid}; refreshToken=${testerAccessTokenValid}`
      ) //Setting cookies in the request
      .send({ _id: createdID }) //Definition of the request body
      .then((response) => {
        expect(response.status).toBe(401);
        expect(response.body.message).toEqual("Unauthorized");
      });
  });

  test("User not found [deleteTransaction] - Integration Test #4", async () => {
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
    //await User.create(testUser);
    const createdTransaction = await transactions.create(testTransaction);
    const createdID = createdTransaction._id.toString();
    await request(app)
      .delete("/api/users/" + testUser.username + "/transactions") //Route to call
      .set(
        "Cookie",
        `accessToken=${testerAccessTokenValid}; refreshToken=${testerAccessTokenValid}`
      ) //Setting cookies in the request
      .send({ _id: createdID }) //Definition of the request body
      .then((response) => {
        expect(response.status).toBe(400);
        expect(response.body.message).toEqual("User not found");
      });
  });

  test("Transaction not found [deleteTransaction] - Integration Test #5", async () => {
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
    const createdID = "507f1f77bcf86cd799439011";
    await request(app)
      .delete("/api/users/" + testUser.username + "/transactions") //Route to call
      .set(
        "Cookie",
        `accessToken=${testerAccessTokenValid}; refreshToken=${testerAccessTokenValid}`
      ) //Setting cookies in the request
      .send({ _id: createdID }) //Definition of the request body
      .then((response) => {
        expect(response.status).toBe(400);
        expect(response.body.message).toEqual("Transaction not found");
      });
  });

  test("Missing ID [deleteTransaction] - Integration Test #6", async () => {
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
    const createdTransaction = await transactions.create(testTransaction);
    const createdID = createdTransaction._id.toString();
    await request(app)
      .delete("/api/users/" + testUser.username + "/transactions") //Route to call
      .set(
        "Cookie",
        `accessToken=${testerAccessTokenValid}; refreshToken=${testerAccessTokenValid}`
      ) //Setting cookies in the request
      .send() //Definition of the request body
      .then((response) => {
        expect(response.status).toBe(400);
        expect(response.body.message).toEqual("Missing parameters");
      });
  });
});

describe("deleteTransactions", () => {
  test("Transactions deleted by admin [deleteTransactions] - Integration Test #1", async () => {
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
    const testTransactions = [{
      username: testUser.username,
      amount: 9000,
      type: "test",
    },{
      username: testUser.username,
      amount: 3000,
      type: "test",
    },{
      username: testUser.username,
      amount: 6000,
      type: "test",
    }];
    const testCategory = {
      type: "test",
      color: "green",
    };
    await categories.create(testCategory);
    await User.create(testUser);
    const createdTransactions = await transactions.insertMany(testTransactions);
    const createdIDs = createdTransactions.map((t)=>t._id.toString());
    await request(app)
      .delete("/api/transactions") //Route to call
      .set(
        "Cookie",
        `accessToken=${adminAccessTokenValid}; refreshToken=${adminAccessTokenValid}`
      ) //Setting cookies in the request
      .send({ _ids: createdIDs }) //Definition of the request body
      .then((response) => {
        expect(response.status).toBe(200);
        expect(response.body.message).toEqual("Transactions deleted");
        expect(response.body.data).toEqual({
          acknowledged: true,
          deletedCount: createdIDs.length,
          message:"Transactions deleted"
        });
      });
  });

  test("Unauthorized admin [deleteTransactions] - Integration Test #2", async () => {
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
    const testTransactions = [{
      username: testUser.username,
      amount: 9000,
      type: "test",
    },{
      username: testUser.username,
      amount: 3000,
      type: "test",
    },{
      username: testUser.username,
      amount: 6000,
      type: "test",
    }];
    const testCategory = {
      type: "test",
      color: "green",
    };
    await categories.create(testCategory);
    await User.create(testUser);
    const createdTransactions = await transactions.insertMany(testTransactions);
    const createdIDs = createdTransactions.map((t)=>t._id.toString());
    await request(app)
      .delete("/api/transactions") //Route to call
      .set(
        "Cookie",
        `accessToken=${testerAccessTokenValid}; refreshToken=${testerAccessTokenValid}`
      ) //Setting cookies in the request
      .send({ _ids: createdIDs }) //Definition of the request body
      .then((response) => {
        expect(response.status).toBe(401);
        expect(response.body.message).toEqual("Unauthorized");
      });
  });

  test("Invalid transaction [deleteTransactions] - Integration Test #3", async () => {
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
    const testTransactions = [{
      username: testUser.username,
      amount: 9000,
      type: "test",
    },{
      username: testUser.username,
      amount: 3000,
      type: "test",
    },{
      username: testUser.username,
      amount: 6000,
      type: "test",
    }];
    const testCategory = {
      type: "test",
      color: "green",
    };
    await categories.create(testCategory);
    await User.create(testUser);
    const createdTransactions = await transactions.insertMany(testTransactions);
    let createdIDs = createdTransactions.map((t)=>t._id.toString());
    createdIDs.push("507f1f77bcf86cd799439011")
    await request(app)
      .delete("/api/transactions") //Route to call
      .set(
        "Cookie",
        `accessToken=${adminAccessTokenValid}; refreshToken=${adminAccessTokenValid}`
      ) //Setting cookies in the request
      .send({ _ids: createdIDs }) //Definition of the request body
      .then((response) => {
        expect(response.status).toBe(400);
        expect(response.body.message).toEqual("Invalid ID:"+"507f1f77bcf86cd799439011");
      });
  });

  test("Invalid ids [deleteTransactions] - Integration Test #4", async () => {
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
    const testTransactions = [{
      username: testUser.username,
      amount: 9000,
      type: "test",
    },{
      username: testUser.username,
      amount: 3000,
      type: "test",
    },{
      username: testUser.username,
      amount: 6000,
      type: "test",
    }];
    const testCategory = {
      type: "test",
      color: "green",
    };
    await categories.create(testCategory);
    await User.create(testUser);
    const createdTransactions = await transactions.insertMany(testTransactions);
    await request(app)
      .delete("/api/transactions") //Route to call
      .set(
        "Cookie",
        `accessToken=${adminAccessTokenValid}; refreshToken=${adminAccessTokenValid}`
      ) //Setting cookies in the request
      .send() //Definition of the request body
      .then((response) => {
        expect(response.status).toBe(400);
        expect(response.body.message).toEqual("Invalid IDS");
      });
  });
});
