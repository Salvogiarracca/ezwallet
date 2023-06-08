import request from 'supertest';
import { app } from '../app';
import { User, Group } from '../models/User.js';
import { transactions, categories } from '../models/model';
import mongoose, { Model } from 'mongoose';
import dotenv from 'dotenv';
import {newToken, newTokenAdHoc} from "../controllers/genericFunctions.js";
import {re} from "@babel/core/lib/vendor/import-meta-resolve.js";
import {application} from "express";

/**
 * Necessary setup in order to create a new database for testing purposes before starting the execution of test cases.
 * Each test suite has its own database in order to avoid different tests accessing the same database at the same time and expecting different data.
 */
dotenv.config();
beforeAll(async () => {
  const dbName = "testingDatabaseUsers";
  const url = `${process.env.MONGO_URI}/${dbName}`;

  await mongoose.connect(url, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

});

/**
 * After all test cases have been executed the database is deleted.
 * This is done so that subsequent executions of the test suite start with an empty database.
 */
afterAll(async () => {
  await mongoose.connection.db.dropDatabase();
  await mongoose.connection.close();
});

describe("getUsers", () => {
  /**
   * Database is cleared before each test case, in order to allow insertion of data tailored for each specific test case.
   */
  beforeEach(async () => {
    await User.deleteMany({})
  })

  test("should return empty list if ther are no users", async () => {
    const res = await request(app)
        .get('/api/users')
        .set("Cookie", [
            `accessToken=${newTokenAdHoc("testUser1", "Admin")}`,
            `refreshToken=${newTokenAdHoc("testUser1", "Admin")}`
        ])
    expect(res.status).toBe(200)
    expect(res.body).toEqual({ data : [] })
  })

  test("should return list of all users", async () => {
    const user1 = {
      username: "testUser1",
      email: "testUser1@example.com",
      password: "password",
      role: "Regular"
    }
    const user4 = {
      username: "testUser4",
      email: "testUser4@example.com",
      password: "password",
      role: "Regular"
    }
    await User.create(user1)
    await User.create(user4)
    const res = await request(app)
        .get('/api/users')
        .set("Cookie", [
          `accessToken=${newTokenAdHoc(user1.username, "Admin")}`,
          `refreshToken=${newTokenAdHoc(user1.username, "Admin")}`
        ])
    expect(res.status).toBe(200)
    expect(res.body).toEqual({
      data: [
        {...user1, password: undefined},
        {...user4, password: undefined}
      ]
    })
  })
})

describe("getUser", () => {
  beforeEach(async () => {
    await User.deleteMany({})
  })
  test("should be not authorized if no cookies are provided", async () => {
    const res = await request(app)
        .get('/api/users/:someUser')
    expect(res.status).toBe(401)
    expect(res.body).toEqual({ error: "Unauthorized" })
  })
  test("should be not authorized if asking for other user info (Regular user)", async () => {
    const user1 = {
      username: "testUser1",
      email: "testUser1@example.com",
      password: "password",
      role: "Regular"
    }
    await User.create(user1)
    const res = await request(app)
        .get('/api/users/:notCurrentUser')
        .set("Cookie", [
          `accessToken=${newTokenAdHoc(user1.username, "Regular")}`,
          `refreshToken=${newTokenAdHoc(user1.username, "Regular")}`
        ])
    expect(res.status).toBe(401)
    expect(res.body).toEqual({ error: "Unauthorized" })
  })
  test("should get own user info", async () => {
    const user1 = {
      username: "testUser1",
      email: "testUser1@example.com",
      password: "password",
      role: "Regular"
    }
    await User.create(user1)
    const res = await request(app)
        .get(`/api/users/${user1.username}`)
        .set("Cookie", [
          `accessToken=${newTokenAdHoc(user1.username, "Regular")}`,
          `refreshToken=${newTokenAdHoc(user1.username, "Regular")}`
        ])
    expect(res.status).toBe(200)
    expect(res.body).toEqual({
      data: {
        username: user1.username,
        email: user1.email,
        role: user1.role
      }
    })
  })
  test("should fail if resquested user does not exist (Admin)", async () => {
    const user1 = {
      username: "testUser1",
      email: "testUser1@example.com",
      password: "password",
      role: "Admin"
    }
    const user = User.create(user1)
    const res = await request(app)
        .get(`/api/users/NotAUser}`)
        .set("Cookie", [
          `accessToken=${newTokenAdHoc(user1.username, "Admin")}`,
          `refreshToken=${newTokenAdHoc(user1.username, "Admin")}`
        ])
    expect(res.status).toBe(400)
    expect(res.body).toEqual({ error: "User not found" })
  })
  test("should return other user data (Admin)", async () => {
    const user1 = {
      username: "testUser1",
      email: "testUser1@example.com",
      password: "password",
      role: "Admin"
    }
    const user2 = {
      username: "testUser2",
      email: "testUser2@example.com",
      password: "password",
      role: "Regular"
    }
    await User.create(user1)
    await User.create(user2)
    const res = await request(app)
        .get(`/api/users/${user2.username}`)
        .set("Cookie", [
          `accessToken=${newTokenAdHoc(user1.username, "Admin")}`,
          `refreshToken=${newTokenAdHoc(user1.username, "Admin")}`
        ])
    expect(res.status).toBe(200)
    expect(res.body).toEqual({
      data: {
        username: user2.username,
        email: user2.email,
        role: user2.role
      }
    })
  })
})

describe("createGroup", () => {
  beforeEach( async () => {
    await User.deleteMany({})
    await Group.deleteMany({})
  })
  test("should return unauthorized", async () => {
    const res = await request(app)
        .post('/api/groups')
    expect(res.status).toBe(401)
    expect(res.body).toEqual({error: "Unauthorized"})
  })

  test("should crete a new group", async () => {
    const user11 = {
      username: "testUser1",
      email: "testUser1@example.com",
      password: "password",
      role: "Admin"
    }
    const user22 = {
      username: "testUser2",
      email: "testUser2@example.com",
      password: "password",
      role: "Regular"
    }
    const user33 = {
      username: "testUser3",
      email: "testUser3@example.com",
      password: "password",
      role: "Regular"
    }
    const user1 = await User.create(user11)
    // const usr1 = new User(user1)
    // await usr1.save()
    const user2 = await User.create(user22)
    // const usr2 = new User(user2)
    // await usr2.save()
    const user3 = await User.create(user33)
    // const usr3 = new User(user3)
    // await usr3.save()

    const existingGroup = await Group.create({
      name: "existingGroup",
      members:[{email: user33.email, user: user33._id}]
    })
    const res = await request(app)
        .post('/api/groups')
        .set("Cookie", [
          `accessToken=${newTokenAdHoc(user1.username, "Admin")}`,
          `refreshToken=${newTokenAdHoc(user1.username, "Admin")}`
        ])
        .send({
          name: "exampleGroup",
          memberEmails: [ user2.email, user3.email, "notExistingEmail@example.com" ]
        })
    expect(res.status).toBe(200)
    expect(res.body).toEqual(
        expect.objectContaining({
          data: {
            group: {
              name: "exampleGroup",
              members: [{ email: user1.email }, { email: user2.email } ]
            },
            alreadyInGroup: [{ email: user3.email }],
            membersNotFound: [{ email: "notExistingEmail@example.com" }]
          }
        })
    )
  })

})

describe("getGroups", () => { })

describe("getGroup", () => { })

describe("addToGroup", () => { })

describe("removeFromGroup", () => { })

describe("deleteUser", () => { })

describe("deleteGroup", () => { })
