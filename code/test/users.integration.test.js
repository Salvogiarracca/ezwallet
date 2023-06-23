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
  test("should return unauthorized if missing cookies", async () => {
    const res = await request(app)
        .post('/api/groups')
    expect(res.status).toBe(401)
    expect(res.body).toEqual({error: "Unauthorized"})
  })

  test("should crete a new group", async () => {
    const user1 = {
      username: "testUser1",
      email: "testUser1@example.com",
      password: "password",
      role: "Admin",
      refreshToken: newTokenAdHoc("testUser1", "Admin")
    }
    const user2 = {
      username: "testUser2",
      email: "testUser2@example.com",
      password: "password",
      role: "Regular"
    }
    const user3 = {
      username: "testUser3",
      email: "testUser3@example.com",
      password: "password",
      role: "Regular"
    }
    await User.create(user1, user2, user3)

    const existingGroup = await Group.create({
      name: "existingGroup",
      members:[{email: user3.email, user: user3._id}]
    })

    const res = await request(app)
        .post('/api/groups')
        .set("Accept", "application/json")
        .set("Cookie", [
          `accessToken=${newTokenAdHoc(user1.username, "Admin")}`,
          `refreshToken=${user1.refreshToken}`
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

  test("should fail if only the caller is a valid user to add and all the members either do not exist or are already in a group", async () => {
    const user1 = {
      username: "testUser1",
      email: "testUser1@example.com",
      password: "password",
      role: "Admin",
      refreshToken: newTokenAdHoc("testUser1", "Admin")
    }
    const user2 = {
      username: "testUser2",
      email: "testUser2@example.com",
      password: "password",
      role: "Regular"
    }
    const user3 = {
      username: "testUser3",
      email: "testUser3@example.com",
      password: "password",
      role: "Regular"
    }
    await User.create(user1, user2, user3)

    const existingGroup = await Group.create({
      name: "existingGroup",
      members:[{email: user3.email, user: user3._id}, {email: user2.email, user: user2._id}]
    })

    const res = await request(app)
        .post('/api/groups')
        .set("Accept", "application/json")
        .set("Cookie", [
          `accessToken=${newTokenAdHoc(user1.username, "Admin")}`,
          `refreshToken=${user1.refreshToken}`
        ])
        .send({
          name: "exampleGroup",
          memberEmails: [ user2.email, user3.email, "notExistingEmail@example.com" ]
        })
    expect(res.status).toBe(400)
    expect(res.body).toEqual({
      error: "all the members either do not exist or are already in a group",
      alreadyInGroup: [{email: user2.email}, {email: user3.email}],
      membersNotFound: [{email: "notExistingEmail@example.com"}]
    })
  })

  test("should fail if at leas one email is not valid or an empty string", async () => {
    const user1 = {
      username: "testUser1",
      email: "testUser1@example.com",
      password: "password",
      role: "Admin",
      refreshToken: newTokenAdHoc("testUser1", "Admin")
    }
    const res = await request(app)
        .post('/api/groups')
        .set("Accept", "application/json")
        .set("Cookie", [
          `accessToken=${newTokenAdHoc(user1.username, "Admin")}`,
          `refreshToken=${user1.refreshToken}`
        ])
        .send({
          name: "exampleGroup",
          memberEmails: [ "", "notAnEmail.it", "notExistingEmail@example.com" ]
        })
    expect(res.status).toBe(400)
    expect(res.body).toEqual({
      error: "at least one of the members emails is not in a valid email format or is an empty string"
    })
  })

  test("should fail if the group already exists", async () => {
    const user1 = {
      username: "testUser1",
      email: "testUser1@example.com",
      password: "password",
      role: "Admin",
      refreshToken: newTokenAdHoc("testUser1", "Admin")
    }
    const user2 = {
      username: "testUser2",
      email: "testUser2@example.com",
      password: "password",
      role: "Regular"
    }
    const user3 = {
      username: "testUser3",
      email: "testUser3@example.com",
      password: "password",
      role: "Regular"
    }
    await User.create(user1, user2, user3)

    const existingGroup = await Group.create({
      name: "existingGroup",
      members:[{email: user3.email, user: user3._id}]
    })

    const res = await request(app)
        .post('/api/groups')
        .set("Accept", "application/json")
        .set("Cookie", [
          `accessToken=${newTokenAdHoc(user1.username, "Admin")}`,
          `refreshToken=${user1.refreshToken}`
        ])
        .send({
          name: "existingGroup",
          memberEmails: [ user2.email, user3.email, "notExistingEmail@example.com" ]
        })
    expect(res.status).toBe(400)
    expect(res.body).toEqual({
      error: "Group already exists"
    })
  })
})

describe("getGroups", () => {
  beforeEach(async () => {
    await User.deleteMany({});
    await Group.deleteMany({});
  })
  test("should return unauthorized if missing cookies", async () => {
    const res = await request(app)
        .get('/api/groups')
    expect(res.status).toBe(401)
    expect(res.body).toEqual({error: "Unauthorized"})
  })
  test("should return unauthorized if called by a Regular user", async () => {
    const user2 = {
      username: "testUser2",
      email: "testUser2@example.com",
      password: "password",
      role: "Regular",
      refreshToken: newTokenAdHoc("testUser2", "Regular")
    }
    await User.create(user2)
    const res = await request(app)
        .get('/api/groups')
        .set("Cookie", [
          `accessToken=${newTokenAdHoc(user2.username, "Regular")}`,
          `refreshToken=${user2.refreshToken}`
        ])
    expect(res.status).toBe(401)
    expect(res.body).toEqual({
      error: "Unauthorized"
    })
  })
  test("should return an empty list if no groups are present", async () => {
    const user1 = {
      username: "testUser1",
      email: "testUser1@example.com",
      password: "password",
      role: "Admin",
      refreshToken: newTokenAdHoc("testUser1", "Admin")
    }
    await User.create(user1)
    const res = await request(app)
        .get('/api/groups')
        .set("Cookie", [
          `accessToken=${newTokenAdHoc(user1.username, "Admin")}`,
          `refreshToken=${user1.refreshToken}`
        ])
    expect(res.status).toBe(200)
    expect(res.body).toEqual(expect.objectContaining({
      data: []
    }))
  })
  test("should return a list of groups", async () => {
    const user1 = {
      username: "testUser1",
      email: "testUser1@example.com",
      password: "password",
      role: "Admin",
      refreshToken: newTokenAdHoc("testUser1", "Admin")
    }
    const user2 = {
      username: "testUser2",
      email: "testUser2@example.com",
      password: "password",
      role: "Regular"
    }
    const user3 = {
      username: "testUser3",
      email: "testUser3@example.com",
      password: "password",
      role: "Regular"
    }
    const user4 = {
      username: "testUser4",
      email: "testUser4@example.com",
      password: "password",
      role: "Regular"
    }
    // await User.create(user1, user2, user3, user4)
    const users = [user1, user2, user3, user4]
    await User.insertMany(users)
    const group1 = {
      name: "group1",
      members: [
        {email: user2.email, user:user2._id},
        {email: user3.email, user:user3._id}
      ]
    }
    const group2 = {
      name: "group2",
      members: [
        {email: user4.email, user:user4._id}
      ]
    }
    await Group.create(group1)
    await Group.create(group2)
    const res = await request(app)
        .get('/api/groups')
        .set("Cookie", [
          `accessToken=${newTokenAdHoc(user1.username, "Admin")}`,
          `refreshToken=${user1.refreshToken}`
        ])
    expect(res.status).toBe(200)
    expect(res.body).toEqual(expect.objectContaining({
      data: [
        {
          name: group1.name,
          members: [
            {email: user2.email, user: user2._id},
            {email: user3.email, user: user3._id}
          ]
        },
        {
          name: group2.name,
          members: [
            {email: user4.email, user: user4._id}
          ]
        }
      ]
    }))
  })
})

describe("getGroup", () => {
  beforeEach(async () => {
    await User.deleteMany({});
    await Group.deleteMany({});
  })
  test("should be unauthorized if no cookies ar provided", async () => {
    const group = await Group.create({name: "group", members: []})
    const res = await request(app)
        .get(`/api/groups/${group.name}`)
    expect(res.status).toBe(401)
    expect(res.body).toEqual({
      error: "Unauthorized"
    })
  })
  test("should be unauthorized if user does not belongs to the group", async () => {
    const user2 = {
      username: "testUser2",
      email: "testUser2@example.com",
      password: "password",
      role: "Regular",
      refreshToken: newTokenAdHoc("testUser2", "Regular")
    }
    await User.create(user2)
    const group = await Group.create({name: "group", members: []})
    const res = await request(app)
        .get(`/api/groups/${group.name}`)
        .set("Cookie", [
          `accessToken=${newTokenAdHoc(user2.username, "Regular")}`,
          `refreshToken=${user2.refreshToken}`
        ])
    expect(res.status).toBe(401)
    expect(res.body).toEqual({
      error: "Unauthorized"
    })
  })
  test("should fail if requested group does not exist", async () => {
    const user2 = {
      username: "testUser2",
      email: "testUser2@example.com",
      password: "password",
      role: "Regular",
      refreshToken: newTokenAdHoc("testUser2", "Regular")
    }
    await User.create(user2)
    const group = await Group.create({name: "group", members: []})
    const res = await request(app)
        .get(`/api/groups/notAGroup}`)
        .set("Cookie", [
          `accessToken=${newTokenAdHoc(user2.username, "Regular")}`,
          `refreshToken=${user2.refreshToken}`
        ])
    expect(res.status).toBe(400)
    expect(res.body).toEqual({
      error: "Group does not exist"
    })
  })
  test("should be authorized also if he does not belong to the group (Admin)", async () => {
    const user1 = {
      username: "testUser1",
      email: "testUser1@example.com",
      password: "password",
      role: "Admin",
      refreshToken: newTokenAdHoc("testUser1", "Admin")
    }
    const user2 = {
      username: "testUser2",
      email: "testUser2@example.com",
      password: "password",
      role: "Regular"
    }
    await User.create(user1, user2)
    const group = await Group.create({name: "group", members: [{email: user2.email, user: user2._id}]})
    const res = await request(app)
        .get(`/api/groups/${group.name}`)
        .set("Cookie", [
          `accessToken=${newTokenAdHoc(user1.username, "Admin")}`,
          `refreshToken=${user1.refreshToken}`
        ])
    expect(res.status).toBe(200)
    expect(res.body).toEqual(expect.objectContaining({
      data:{
        group: {
          name: group.name,
          members: group.members.map(member => ({email: member.email}))
        }
      }
    }))
  })

})

describe("addToGroup", () => {
  beforeEach(async () => {
    await User.deleteMany({});
    await Group.deleteMany({});
  })
  test("should fail if not admin (insert route)", async () => {
    const user1 = {
      username: "testUser1",
      email: "testUser1@example.com",
      password: "password",
      role: "Admin",
      refreshToken: newTokenAdHoc("testUser1", "Admin")
    }
    const user2 = {
      username: "testUser2",
      email: "testUser2@example.com",
      password: "password",
      role: "Regular",
      refreshToken: newTokenAdHoc("testUser2", "Regular")
    }
    const user3 = {
      username: "testUser3",
      email: "testUser3@example.com",
      password: "password",
      role: "Regular"
    }
    const user4 = {
      username: "testUser4",
      email: "testUser4@example.com",
      password: "password",
      role: "Regular"
    }
    await User.create(user2, user3, user4)
    const group = await Group.create({
      name: "group",
      members: [{email: user3.email, user: user3._id}]
    })
    const res = await request(app)
        .patch(`/api/groups/${group.name}/insert`)
        .set("Cookie", [
          `accessToken=${newTokenAdHoc(user2.username, "Regular")}`,
          `refreshToken=${user2.refreshToken}`
        ])
        .send({
          emails: [
              user1.email, user2.email, user3.email, user4.email, "notAnUser@example.com"
          ]
        })
    expect(res.status).toBe(401)
    expect(res.body).toEqual({
      error: "Unauthorized, you are not an admin"
    })
  })
  test("should fail if user does not belongs to the group", async () => {
    const user2 = {
      username: "testUser2",
      email: "testUser2@example.com",
      password: "password",
      role: "Regular",
      refreshToken: newTokenAdHoc("testUser2", "Regular")
    }
    const user3 = {
      username: "testUser3",
      email: "testUser3@example.com",
      password: "password",
      role: "Regular"
    }
    await User.create(user2, user3)
    const group = await Group.create({
      name: "group",
      members: [{email: user3.email, user: user3._id}]
    })
    const res = await request(app)
        .patch(`/api/groups/${group.name}/add`)
        .set("Cookie", [
          `accessToken=${newTokenAdHoc(user2.username, "Regular")}`,
          `refreshToken=${user2.refreshToken}`
        ])
        .send({
          emails: [
            user2.email, "notAnUser@example.com"
          ]
        })
    expect(res.status).toBe(401)
    expect(res.body).toEqual({
      error: "Unauthorized, you are not a member of requested group"
    })
  })
  test("should fail if body is missng information", async () => {
    const user2 = {
      username: "testUser2",
      email: "testUser2@example.com",
      password: "password",
      role: "Regular",
      refreshToken: newTokenAdHoc("testUser2", "Regular")
    }
    const user3 = {
      username: "testUser3",
      email: "testUser3@example.com",
      password: "password",
      role: "Regular"
    }
    await User.create(user2, user3)
    const group = await Group.create({
      name: "group",
      members: [{email: user3.email, user: user3._id}]
    })
    const res = await request(app)
        .patch(`/api/groups/${group.name}/add`)
        .set("Cookie", [
          `accessToken=${newTokenAdHoc(user2.username, "Regular")}`,
          `refreshToken=${user2.refreshToken}`
        ])
        .send({
        })
    expect(res.status).toBe(400)
    expect(res.body).toEqual({
      error: "Request body does not contain all the necessary attributes"
    })
  })
  test("should fail if group does not exist", async () => {
    const user2 = {
      username: "testUser2",
      email: "testUser2@example.com",
      password: "password",
      role: "Regular",
      refreshToken: newTokenAdHoc("testUser2", "Regular")
    }
    const user3 = {
      username: "testUser3",
      email: "testUser3@example.com",
      password: "password",
      role: "Regular"
    }
    await User.create(user2, user3)

    const res = await request(app)
        .patch(`/api/groups/group/add`)
        .set("Cookie", [
          `accessToken=${newTokenAdHoc(user2.username, "Regular")}`,
          `refreshToken=${user2.refreshToken}`
        ])
        .send({
          emails: [
            user2.email, "notAnUser@example.com"
          ]
        })
    expect(res.status).toBe(400)
    expect(res.body).toEqual({
      error: "Group does not exist"
    })
  })
  test("should return the group with added members (Admin route)", async () => {
    const user1 = {
      username: "testUser1",
      email: "testUser1@example.com",
      password: "password",
      role: "Admin",
      refreshToken: newTokenAdHoc("testUser1", "Admin")
    }
    const user2 = {
      username: "testUser2",
      email: "testUser2@example.com",
      password: "password",
      role: "Regular"
    }
    const user3 = {
      username: "testUser3",
      email: "testUser3@example.com",
      password: "password",
      role: "Regular"
    }
    const user4 = {
      username: "testUser4",
      email: "testUser4@example.com",
      password: "password",
      role: "Regular"
    }
    await User.create(user1, user2, user3, user4)
    const group = await Group.create({
      name: "group",
      members: [{email: user3.email, user: user3._id}]
    })
    const res = await request(app)
        .patch(`/api/groups/${group.name}/insert`)
        .set("Cookie", [
          `accessToken=${newTokenAdHoc(user1.username, "Admin")}`,
          `refreshToken=${user1.refreshToken}`
        ])
        .send({
          emails: [
            user1.email, user2.email, user3.email, user4.email, "notAnUser@example.com"
          ]
        })
    expect(res.status).toBe(200)
    expect(res.body).toEqual(expect.objectContaining({
      data:{
        group: {
          name: group.name,
          members: [
            {email: user3.email},
            {email: user1.email},
            {email: user2.email},
            {email: user4.email}
          ]
        },
        alreadyInGroup: [user3.email],
        membersNotFound: ["notAnUser@example.com"]
      }
    }))

  })

})

describe("removeFromGroup", () => {
  beforeEach(async () => {
    await User.deleteMany({});
    await Group.deleteMany({});
  })
  test("should fail if group does not exist", async () => {
    const res = await request(app)
        .patch('/api/groups/notAGroup/remove')
        .send({
          emails: [ 'user@example.com' ]
        })
    expect(res.status).toBe(400)
    expect(res.body).toEqual({
      error: "Group does not exist"
    })
  })
  test("should fail if missing emails in body request", async () => {
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
      role: "Regular",
      refreshToken: newTokenAdHoc("testUser2", "Regular")
    }
    const user3 = {
      username: "testUser3",
      email: "testUser3@example.com",
      password: "password",
      role: "Regular"
    }
    const user4 = {
      username: "testUser4",
      email: "testUser4@example.com",
      password: "password",
      role: "Regular"
    }
    await User.create(user1, user2, user3, user4)
    const group = await Group.create({
      name: "group",
      members: [
        {email: user1.email, user: user1._id},
        {email: user2.email, user: user2._id},
        {email: user3.email, user: user3._id},
        {email: user4.email, user: user4._id}
      ]
    })
    const res = await request(app)
        .patch(`/api/groups/${group.name}/remove`)
        .set("Cookie", [
          `accessToken=${newTokenAdHoc(user2.username, "Regular")}`,
          `refreshToken=${user2.refreshToken}`
        ])
    expect(res.status).toBe(400)
    expect(res.body).toEqual({
      error: "Request body does not contain all the necessary attributes"
    })
  })
  test("should fail if user tries to remove member of another group", async () => {
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
      role: "Regular",
      refreshToken: newTokenAdHoc("testUser2", "Regular")
    }
    const user3 = {
      username: "testUser3",
      email: "testUser3@example.com",
      password: "password",
      role: "Regular"
    }
    const user4 = {
      username: "testUser4",
      email: "testUser4@example.com",
      password: "password",
      role: "Regular"
    }
    await User.create(user1, user2, user3, user4)
    const group = await Group.create({
      name: "group",
      members: [
        {email: user1.email, user: user1._id},
        {email: user3.email, user: user3._id},
        {email: user4.email, user: user4._id}
      ]
    })
    const res = await request(app)
        .patch(`/api/groups/${group.name}/remove`)
        .set("Cookie", [
          `accessToken=${newTokenAdHoc(user2.username, "Regular")}`,
          `refreshToken=${user2.refreshToken}`
        ])
        .send({
          emails: [user3.email]
        })
    expect(res.status).toBe(401)
    expect(res.body).toEqual({
      error: "Unauthorized, you are not a member of requested group"
    })
  })
  test("should fail if user is not an Admin (pull route)", async () => {
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
      role: "Regular",
      refreshToken: newTokenAdHoc("testUser2", "Regular")
    }
    const user3 = {
      username: "testUser3",
      email: "testUser3@example.com",
      password: "password",
      role: "Regular"
    }
    const user4 = {
      username: "testUser4",
      email: "testUser4@example.com",
      password: "password",
      role: "Regular"
    }
    await User.create(user1, user2, user3, user4)
    const group = await Group.create({
      name: "group",
      members: [
        {email: user1.email, user: user1._id},
        {email: user2.email, user: user2._id},
        {email: user3.email, user: user3._id},
        {email: user4.email, user: user4._id}
      ]
    })
    const res = await request(app)
        .patch(`/api/groups/${group.name}/pull`)
        .set("Cookie", [
          `accessToken=${newTokenAdHoc(user2.username, "Regular")}`,
          `refreshToken=${user2.refreshToken}`
        ])
        .send({
          emails: [user3.email]
        })
    expect(res.status).toBe(401)
    expect(res.body).toEqual({
      error: "Unauthorized, you are not an admin"
    })
  })
  test("should fail if all the members either do not exist or not in the group", async () => {
    const user1 = {
      username: "testUser1",
      email: "testUser1@example.com",
      password: "password",
      role: "Admin",
      refreshToken: newTokenAdHoc("testUser1", "Admin")
    }
    const user2 = {
      username: "testUser2",
      email: "testUser2@example.com",
      password: "password",
      role: "Regular"

    }
    const user3 = {
      username: "testUser3",
      email: "testUser3@example.com",
      password: "password",
      role: "Regular"
    }
    const user4 = {
      username: "testUser4",
      email: "testUser4@example.com",
      password: "password",
      role: "Regular"
    }
    await User.create(user1, user2, user3, user4)
    const group = await Group.create({
      name: "group",
      members: [
        {email: user1.email, user: user1._id},
        {email: user4.email, user: user4._id}
      ]
    })
    const res = await request(app)
        .patch(`/api/groups/${group.name}/pull`)
        .set("Cookie", [
          `accessToken=${newTokenAdHoc(user1.username, "Admin")}`,
          `refreshToken=${user1.refreshToken}`
        ])
        .send({
          emails: [user2.email, user3.email, "notAnUser@example.com"]
        })
    expect(res.status).toBe(400)
    expect(res.body).toEqual({
      error: "all the members either do not exist or not in the group",
      notInGroup: [user2.email, user3.email],
      membersNotFound: ["notAnUser@example.com"]
    })
  })
  test('should fail if the group has only one member before deleting someone', async () => {
    const user1 = {
      username: "testUser1",
      email: "testUser1@example.com",
      password: "password",
      role: "Admin",
      refreshToken: newTokenAdHoc("testUser1", "Admin")
    }
    const user2 = {
      username: "testUser2",
      email: "testUser2@example.com",
      password: "password",
      role: "Regular"

    }
    const user3 = {
      username: "testUser3",
      email: "testUser3@example.com",
      password: "password",
      role: "Regular"
    }
    const user4 = {
      username: "testUser4",
      email: "testUser4@example.com",
      password: "password",
      role: "Regular"
    }
    await User.create(user1, user2, user3, user4)
    const group = await Group.create({
      name: "group",
      members: [
        {email: user1.email, user: user1._id}
      ]
    })
    const res = await request(app)
        .patch(`/api/groups/${group.name}/pull`)
        .set("Cookie", [
          `accessToken=${newTokenAdHoc(user1.username, "Admin")}`,
          `refreshToken=${user1.refreshToken}`
        ])
        .send({
          emails: [user1.email, user2.email, user3.email, "notAnUser@example.com"]
        })
    expect(res.status).toBe(400)
    expect(res.body).toEqual({
      error: "the group contains only one member"
    })
  })
  test("should delete some of requested users", async () => {
    const user1 = {
      username: "testUser1",
      email: "testUser1@example.com",
      password: "password",
      role: "Admin",
      refreshToken: newTokenAdHoc("testUser1", "Admin")
    }
    const user2 = {
      username: "testUser2",
      email: "testUser2@example.com",
      password: "password",
      role: "Regular"

    }
    const user3 = {
      username: "testUser3",
      email: "testUser3@example.com",
      password: "password",
      role: "Regular"
    }
    const user4 = {
      username: "testUser4",
      email: "testUser4@example.com",
      password: "password",
      role: "Regular"
    }
    await User.create(user1, user2, user3, user4)
    const group = await Group.create({
      name: "group",
      members: [
        {email: user1.email, user: user1._id},
        {email: user2.email, user: user2._id},
        {email: user3.email, user: user3._id}
      ]
    })
    const res = await request(app)
        .patch(`/api/groups/${group.name}/pull`)
        .set("Cookie", [
          `accessToken=${newTokenAdHoc(user1.username, "Admin")}`,
          `refreshToken=${user1.refreshToken}`
        ])
        .send({
          emails: [user2.email, user3.email, user4.email, "notAnUser@example.com"]
        })
    expect(res.status).toBe(200)
    expect(res.body).toEqual(expect.objectContaining({
      data: {
        group: {
          name: group.name,
          members: [{email: user1.email}]
        },
        notInGroup: [user4.email],
        membersNotFound: ["notAnUser@example.com"]
      }
    }))
  })
})

describe("deleteUser", () => {
  beforeEach(async () => {
    await User.deleteMany({});
    await Group.deleteMany({});
  })
  test('should fail if user is not authenticated', async () => {
    const res = await request(app)
        .delete('/api/users')
        .send({
          email: "user@example.com"
        })
    expect(res.status).toBe(401)
    expect(res.body).toEqual({
      error: "Unauthorized"
    })
  })
  test("should fail if user is not an admin", async () => {
    const user2 = {
      username: "testUser2",
      email: "testUser2@example.com",
      password: "password",
      role: "Regular",
      refreshToken: newTokenAdHoc("testUser2", "Regular")
    }
    await User.create(user2)
    const res = await request(app)
        .delete("/api/users")
        .set("Cookie", [
          `accessToken=${newTokenAdHoc(user2.username, "Regular")}`,
          `refreshToken=${user2.refreshToken}`
        ])
        .send({
          email: "testUser@example.com"
        })
    expect(res.status).toBe(401)
    expect(res.body).toEqual({
      error: "Unauthorized"
    })
  })
  test('should delete the requested user that belongs to a group and should remove the group as well', async () => {
    const user1 = {
      username: "testUser1",
      email: "testUser1@example.com",
      password: "password",
      role: "Admin",
      refreshToken: newTokenAdHoc("testUser1", "Admin")
    }
    const user2 = {
      username: "testUser2",
      email: "testUser2@example.com",
      password: "password",
      role: "Regular"
    }
    await User.create(user1, user2)
    const group = await Group.create({
      name: "testGroup",
      members: [{email: user2.email, user: user2._id}]
    })
    const res = await request(app)
        .delete("/api/users")
        .set("Cookie", [
          `accessToken=${newTokenAdHoc(user1.username, "Admin")}`,
          `refreshToken=${user1.refreshToken}`
        ])
        .send({
          email: user2.email
        })
    expect(res.status).toBe(200)
    expect(res.body).toEqual(expect.objectContaining({
      data: {
        deletedTransactions: 0,
        deletedFromGroup: true
      }
    }))
  })
  test('should delete the requested user', async () => {
    const user1 = {
      username: "testUser1",
      email: "testUser1@example.com",
      password: "password",
      role: "Admin",
      refreshToken: newTokenAdHoc("testUser1", "Admin")
    }
    const user2 = {
      username: "testUser2",
      email: "testUser2@example.com",
      password: "password",
      role: "Regular"
    }
    await User.create(user1, user2)
    const res = await request(app)
        .delete("/api/users")
        .set("Cookie", [
          `accessToken=${newTokenAdHoc(user1.username, "Admin")}`,
          `refreshToken=${user1.refreshToken}`
        ])
        .send({
          email: user2.email
        })
    expect(res.status).toBe(200)
    expect(res.body).toEqual(expect.objectContaining({
      data: {
        deletedTransactions: 0,
        deletedFromGroup: false
      }
    }))
  })
})

describe("deleteGroup", () => {
  beforeEach(async () => {
    await User.deleteMany({});
    await Group.deleteMany({});
  });
  test('should fail if not authenticated', async () => {
    const res = await request(app)
        .delete('/api/groups')
        .send({
          name: "testGroup"
        })
    expect(res.status).toBe(401)
    expect(res.body).toEqual({
      error: "Unauthorized"
    })
  })
  test('should fail if user is not an admin', async () => {
    const user2 = {
      username: "testUser2",
      email: "testUser2@example.com",
      password: "password",
      role: "Regular",
      refreshToken: newTokenAdHoc("testUser2", "Regular")
    }
    await User.create(user2)
    const res = await request(app)
        .delete("/api/groups")
        .set("Cookie", [
          `accessToken=${newTokenAdHoc(user2.username, "Regular")}`,
          `refreshToken=${user2.refreshToken}`
        ])
        .send({
          name: "testGroups"
        })
    expect(res.status).toBe(401)
    expect(res.body).toEqual({
      error: "Unauthorized"
    })
  })
  test("should fail if the body does not contain all the necessary attributes", async () => {
    const user1 = {
      username: "testUser1",
      email: "testUser1@example.com",
      password: "password",
      role: "Admin",
      refreshToken: newTokenAdHoc("testUser1", "Admin")
    }
    await User.create(user1)
    const res = await request(app)
        .delete("/api/groups")
        .set("Cookie", [
          `accessToken=${newTokenAdHoc(user1.username, "Admin")}`,
          `refreshToken=${user1.refreshToken}`
        ])
        .send({})
    expect(res.status).toBe(400)
    expect(res.body).toEqual({
      error: "Request body does not contain all the necessary attributes"
    })
  })
  test("should fail if group not found", async () => {
    const user1 = {
      username: "testUser1",
      email: "testUser1@example.com",
      password: "password",
      role: "Admin",
      refreshToken: newTokenAdHoc("testUser1", "Admin")
    }
    await User.create(user1)
    const res = await request(app)
        .delete("/api/groups")
        .set("Cookie", [
          `accessToken=${newTokenAdHoc(user1.username, "Admin")}`,
          `refreshToken=${user1.refreshToken}`
        ])
        .send({
          name: "notAGroup"
        })
    expect(res.status).toBe(400)
    expect(res.body).toEqual({
      error: "Group does not exist"
    })
  })
  test("should delete the group", async () => {
    const user1 = {
      username: "testUser1",
      email: "testUser1@example.com",
      password: "password",
      role: "Admin",
      refreshToken: newTokenAdHoc("testUser1", "Admin")
    }
    await User.create(user1)
    const group = await Group.create({
      name: "testGroup",
      members: [] // only for test purposes
    })
    const res = await request(app)
        .delete("/api/groups")
        .set("Cookie", [
          `accessToken=${newTokenAdHoc(user1.username, "Admin")}`,
          `refreshToken=${user1.refreshToken}`
        ])
        .send({
          name: "testGroup"
        })
    expect(res.status).toBe(200)
    expect(res.body).toEqual(expect.objectContaining({
      data: {
        message: "Group deleted successfully"
      }
    }))
  })
})
