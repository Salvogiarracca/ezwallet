import request from 'supertest';
import { app } from '../app';
import {Group, User} from '../models/User.js';
import {createGroup, getGroup, getGroups, getUser, getUsers} from "../controllers/users.js";
import * as utils from "../controllers/utils.js"
import { newToken } from "../controllers/genericFunctions.js"

import {verifyAuth} from "../controllers/utils.js";

/**
 * In order to correctly mock the calls to external modules it is necessary to mock them using the following line.
 * Without this operation, it is not possible to replace the actual implementation of the external functions with the one
 * needed for the test cases.
 * `jest.mock()` must be called for every external module that is called in the functions under test.
 */
jest.mock("../models/User.js")

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

describe("getUsers", () => {
  test("should return empty list if there are no users", async () => {
    jest.spyOn(utils, "verifyAuth").mockReturnValue({ authorized: true, cause: "Authorized" })
    const mockReq = {
      cookies: {
        accessToken: newToken("Admin"),
        refreshToken: newToken("Admin")
      }
    };
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    }

    jest.spyOn(User, "find").mockResolvedValue([]);
    await getUsers(mockReq, mockRes);
    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
      data: [],
      refreshedTokenMessage: mockRes?.locals?.refreshedTokenMessage
    }))
  })

  test("should retrieve list of all users", async () => {
    jest.spyOn(utils, "verifyAuth").mockReturnValue( { authorized: true, cause: "Authorized" })
    const fakeRes = [
      {
        username: "testUser1",
        email: "testUser2@gmail.com",
        password: "hashedPassword",
        role: "Admin"
      },
      {
        username: "testUser2",
        email: "testUser2@gmail.com",
        password: "hashedPassword",
        role: "Regular"
      }
    ];
    const mockReq = {
      cookies:{
        accessToken: newToken("Admin"),
        refreshToken: newToken("Admin")
      }
    };
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    }

    jest.spyOn(User, "find").mockResolvedValueOnce(fakeRes);
    await getUsers(mockReq, mockRes);
    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
      data: fakeRes.map(user => {
        return { username: user.username, email: user.email, role: user.role };
      }),
      refreshedTokenMessage: mockRes?.locals?.refreshedTokenMessage
    }))
  })

  test("should be unauthorized if caller is not admin", async () => {
    jest.spyOn(utils, "verifyAuth").mockReturnValue({ authorized: false, cause: "Unauthorized" })
    const mockReq = {
      cookies: {
        accessToken: newToken("Regular"),
        refreshToken: newToken("Regular")
      }
    };
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    }

    await getUsers(mockReq, mockRes);
    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
      error: "Unauthorized"
    }))
  })

  //end describe getUsers
})

describe("getUser", () => {
  test("should return caller user info", async () => {
    jest.spyOn(utils, "verifyAuth").mockReturnValue({ authorized: true, cause: "Authorized" })
    const fakeRes = {
      user: {
        username: "testUser",
        email: "testUser@example.com",
        role: "Regular"
      }
    }
    const mockReq = {
      cookies: {
        accessToken: newToken("Regular"),
        refreshToken: newToken("Regular")
      },
      params: { username: "testUser" }
    }
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    }
    jest.spyOn(User, "findOne").mockResolvedValue(fakeRes.user)
    await getUser(mockReq, mockRes)
    expect(mockRes.status).toHaveBeenCalledWith(200)
    expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
      data: fakeRes.user,
      refreshedTokenMessage: mockRes?.locals?.refreshedTokenMessage
    }))
  })

  test("should return info of requested user if caller is admin", async () => {
    jest.spyOn(utils, "verifyAuth").mockReturnValue({ authorized: true, cause: "Authorized" })
    const fakeResUser = {
      user: {
        username: "testUser2",
        email: "testUser2@example.com",
        role: "Regular"
      }
    }
    const fakeResAdmin = {
      user: {
        username: "testAdmin1",
        email: "testAdmin1@example.com",
        role: "Admin"
      }
    }
    const mockReq = {
      params: { username: "testUser2" },
      cookies: {
        accessToken: newToken("Admin"),
        refreshToken: newToken("Admin")
      }
    }
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    }
    jest.spyOn(User, "findOne").mockResolvedValueOnce(fakeResUser.user).mockResolvedValueOnce(fakeResAdmin.user)
    await getUser(mockReq, mockRes)
    expect(mockRes.status).toHaveBeenCalledWith(200)
    expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
      data: fakeResUser.user,
      refreshedTokenMessage: mockRes?.locals?.refreshedTokenMessage
    }))

  })

  test("should fail if user does not exist", async () => {
    jest.spyOn(utils, "verifyAuth").mockReturnValue({ authorized: true, cause: "Authorized" })
    const fakeRes = {
      error: "User not found"
    }
    const mockReq = {
      params: { username: "testUser" },
      cookies: {
        accessToken: newToken("Regular"),
        refreshToken: newToken("Regular")
      }
    }
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    }
    jest.spyOn(User, "findOne").mockResolvedValue(fakeRes.user)
    await getUser(mockReq, mockRes)
    expect(mockRes.status).toHaveBeenCalledWith(400)
    expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
      error: "User not found"
    }))
  })

  test("should fail if Regular user requests other users info", async () => {
    jest.spyOn(utils, "verifyAuth").mockReturnValue({ authorized: false, cause: "Unauthorized" })
    const fakeUser = {
      user: {
        username: "testUser4",
        email: "testUser4@example.com",
        role: "Regular"
      }
    }
    const mockReq = {
      params: { username: "testUser" },
      cookies: {
        accessToken: newToken("Regular"),
        refreshToken: newToken("Regular")
      }
    }
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    }
    jest.spyOn(User, "findOne").mockReturnValue(fakeUser.user)
    await getUser(mockReq, mockRes)
    expect(mockRes.status).toHaveBeenCalledWith(401)
    expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
      error: "Unauthorized"
    }))
  })

  //end getUser
})

describe("createGroup", () => {
  test("should create a new group", async () => {
    const user1 = {
      _id: "11111",
      username: "testUser1",
      email: "testUser1@example.com",
      role: "Regular"
    }
    const user2 = {
      _id: "22222",
      username: "testUser2",
      email: "testUser2@example.com",
      role: "Regular"
    }
    const user3 = {
      _id: "33333",
      username: "testUser3",
      email: "testUser3@example.com",
      role: "Regular"
    }
    const user4 = {
      _id: "44444",
      username: "testUser4",
      email: "testUser4@example.com",
      role: "Regular"
    }
    jest.spyOn(utils, "verifyAuth").mockReturnValue({ authorized: true, cause: "Authorized" })
    const mockReq = {
      body: {
        name: "testGroup",
        memberEmails: [
          "testUser2@example.com",
          "testUser3@example.com",
          "testUser4@example.com"
        ]
      },
      cookies: {
        accessToken: newToken("Regular"),
        refreshToken: newToken("Regular")
      }
    }
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    }
    jest.spyOn(Group, "findOne").mockResolvedValueOnce(undefined)
    jest.spyOn(User, "findOne").mockResolvedValueOnce(user1)
    jest.spyOn(Group, "find").mockResolvedValueOnce(
        [{
          name: "testGroup2",
          members: [{ email: 'testUser2@example.com', user: "12345" }]
        }])


    jest.spyOn(User, "findOne").mockResolvedValueOnce(user1)
        .mockResolvedValueOnce(user3) //toadd
        .mockResolvedValueOnce(null) //notExist
        .mockResolvedValueOnce(user2) //inGroup
    const fakeRes = {
      name: "testGroup",
      members: [
        { email: user1.email },
        { email: user3.email }
      ]
    }
    jest.spyOn(Group, "create").mockResolvedValue(fakeRes)
    await createGroup(mockReq, mockRes)
    expect(mockRes.status).toHaveBeenCalledWith(200)
    expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
      data: {
        group: fakeRes,
        alreadyInGroup: [{ email: user2.email }],
        membersNotFound: [{ email: user4.email }],
      }

    }))
  })

  test("should fail if user is not authenticated", async () => {
    jest.spyOn(utils, "verifyAuth").mockReturnValue({ authorized: false, cause: "Unauthorized" })
    const user1 = {
      _id: "11111",
      username: "testUser1",
      email: "testUser1@example.com",
      role: "Regular"
    }
    const user2 = {
      _id: "22222",
      username: "testUser2",
      email: "testUser2@example.com",
      role: "Regular"
    }
    const mockReq = {
      body: {
        name: "testGroup",
        memberEmails: [
            user1.email,
            user2.email
        ]
      }
    }
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    }
    await createGroup(mockReq, mockRes);
    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({ error: "Unauthorized" });
  })

  test("should fail if missing attributes", async () => {
    jest.spyOn(utils, "verifyAuth").mockReturnValue({ authorized: true, cause: "Authorized" })
    const mockReq = {
      body: {
        name: "testGroup"
      }
    }
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    }
    await createGroup(mockReq, mockRes);
    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({ error: 'request body does not contain all the necessary attributes' });
  })

  test("should fail if name is an empty string", async () => {
    jest.spyOn(utils, "verifyAuth").mockReturnValue({ authorized: true, cause: "Authorized" })
    const mockReq = {
      body: {
        name: "",
        memberEmails: [
          "testUser2@example.com",
          "testUser3@example.com",
          "testUser4@example.com"
        ]
      }
    }
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    }
    await createGroup(mockReq, mockRes);
    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({ error: 'request body does not contain all the necessary attributes' });
  })

  test("should fail if an email is an empty string or invalid", async () => {
    jest.spyOn(utils, "verifyAuth").mockReturnValue({ authorized: true, cause: "Authorized" })
    const mockReq = {
      body: {
        name: "testGroup",
        memberEmails: [
          "testUser2@example.com",
          "testUser3@example.com",
          ""
        ]
      }
    }
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    }
    await createGroup(mockReq, mockRes);
    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({ error: 'at least one of the members emails is not in a valid email format or is an empty string' });
  })

  test("should fail if calling user is already in a group", async () => {
    jest.spyOn(utils, "verifyAuth").mockReturnValue({ authorized: true, cause: "Authorized" })
    const user1 = {
      _id: "11111",
      username: "testUser1",
      email: "testUser1@example.com",
      role: "Regular"
    }
    const mockReq = {
      body: {
        name: "testGroup",
        memberEmails: [
          "testUser2@example.com",
          "testUser3@example.com",
          "testUser4@example.com"
        ]
      },
      cookies: {
        accessToken: newToken("Regular"),
        refreshToken: newToken("Regular")
      }
    }
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    }
    jest.spyOn(Group, "findOne").mockResolvedValueOnce(undefined)
    jest.spyOn(User, "findOne").mockResolvedValueOnce(user1)
    jest.spyOn(Group, "find").mockResolvedValueOnce(
        [{
          name: "testGroup2",
          members: [
            { email: 'testUser1@example.com', user: "11111" },
            { email: 'testUser3@example.com', user: "33333" }]
        }])

    await createGroup(mockReq, mockRes)
    expect(mockRes.status).toHaveBeenCalledWith(400)
    expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
      error: 'You are already in a group'
    }))
  })

  test("should fail if all the members either do not exist or are already in a group", async () => {
    const user1 = {
      _id: "11111",
      username: "testUser1",
      email: "testUser1@example.com",
      role: "Regular"
    }
    const user2 = {
      _id: "22222",
      username: "testUser2",
      email: "testUser2@example.com",
      role: "Regular"
    }
    const user3 = {
      _id: "33333",
      username: "testUser3",
      email: "testUser3@example.com",
      role: "Regular"
    }
    const user4 = {
      _id: "44444",
      username: "testUser4",
      email: "testUser4@example.com",
      role: "Regular"
    }
    jest.spyOn(utils, "verifyAuth").mockReturnValue({ authorized: true, cause: "Authorized" })
    const mockReq = {
      body: {
        name: "testGroup",
        memberEmails: [
          "testUser2@example.com",
          "testUser3@example.com",
          "testUser4@example.com"
        ]
      },
      cookies: {
        accessToken: newToken("Regular"),
        refreshToken: newToken("Regular")
      }
    }
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    }
    jest.spyOn(Group, "findOne").mockResolvedValueOnce(undefined)
    jest.spyOn(User, "findOne").mockResolvedValueOnce(user1)
    jest.spyOn(Group, "find").mockResolvedValueOnce(
        [{
          name: "testGroup2",
          members: [
              { email: 'testUser2@example.com', user: "22222" },
              { email: 'testUser3@example.com', user: "33333" }]
        }])
    jest.spyOn(User, "findOne")
        .mockResolvedValueOnce(user3)
        .mockResolvedValueOnce(user2)
        .mockResolvedValueOnce(null)

    await createGroup(mockReq, mockRes)
    expect(mockRes.status).toHaveBeenCalledWith(400)
    expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
      error: 'all the members either do not exist or are already in a group',
      alreadyInGroup: [
        { email: user2.email },
        { email: user3.email }
      ],
      membersNotFound: [{ email: user4.email }],

    }))
  })

  test('should fail if a group with the same name already exists', async () => {
    jest.spyOn(utils, "verifyAuth").mockReturnValue({ authorized: true, cause: "Authorized" })
    const mockReq = {
      body: {
        name: "testGroup",
        memberEmails: [
          "testUser2@example.com",
          "testUser3@example.com",
          "testUser4@example.com"
        ]
      },
      cookies: {
        accessToken: newToken("Regular"),
        refreshToken: newToken("Regular")
      }
    }
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    }
    jest.spyOn(Group, "findOne").mockResolvedValueOnce({
      name: "testGroup",
      memberEmails: [
        "testUser2@example.com",
        "testUser3@example.com",
        "testUser4@example.com"
      ]
    })
    await createGroup(mockReq, mockRes)
    expect(mockRes.status).toHaveBeenCalledWith(400)
    expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
      error: 'Group already exists'
    }))
  })

})

describe("getGroups", () => {

  test("should fail if caller is not an Admin", async () => {
    jest.spyOn(utils, "verifyAuth").mockReturnValue({ authorized: false, cause: "Unauthorized" })
    const mockReq = {
      cookies: {
        accessToken: newToken("Regular"),
        refreshToken: newToken("Regular")
      }
    }
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    }
    await  getGroups(mockReq, mockRes)
    expect(mockRes.status).toHaveBeenCalledWith(401)
    expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
      error: "Unauthorized"
    }))
  })

  test("should return all the groups", async () => {
    const group1 = {
      name: "testGroup1",
      members: [
        {email: "testUser1@example.com"},
        {email: "testUser2@example.com"}
      ]
    }
    const group2 = {
      name: "testGroup2",
      members: [
        {email: "testUser3@example.com"},
        {email: "testUser4@example.com"}
      ]
    }

    jest.spyOn(utils, "verifyAuth").mockReturnValue({ authorized: true, cause: "Authorized" })

    const mockReq = {
      cookies: {
        accessToken: newToken("Admin"),
        refreshToken: newToken("Admin")
      }
    }
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    }
    jest.spyOn(Group, "find").mockResolvedValue([
        group1,
        group2
    ])
    await getGroups(mockReq, mockRes)
    expect(mockRes.status).toHaveBeenCalledWith(200)
    expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
      data: [
          group1,
          group2
      ],
      refreshedTokenMessage: mockRes?.locals?.refreshedTokenMessage
    }))
  })
})

describe("getGroup", () => {

  test("should return own group info", async () => {
    const group1 = {
      name: "testGroup1",
      members: [
        {email: "testUser1@example.com"},
        {email: "testUser2@example.com"}
      ]
    }

    const mockReq = {
      url: `/api/groups/${group1.name}`,
      cookies: {
        accessToken: newToken("Regular"),
        refreshToken: newToken("Regular")
      },
      params: { name: group1.name }
    }

    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: jest.fn().mockReturnThis(),
      refreshedTokenMessage: jest.fn()
    }

    jest.spyOn(Group, "findOne").mockResolvedValueOnce(group1)
    const auth = jest.spyOn(utils, "verifyAuth").mockReturnValue({ authorized: true, cause: "Authorized" })
    await getGroup(mockReq, mockRes)
    expect(mockRes.status).toHaveBeenCalledWith(200)
    expect(auth).toHaveBeenCalledWith(mockReq, mockRes, {
      authType: "Group",
      emails: group1.members.map(member => member.email)
    })
    expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
      data: {
        group: group1
      },
      refreshedTokenMessage: mockRes?.locals?.refreshedTokenMessage
    }))
  })

  test("should return any group info if Admin", async () => {
    const group1 = {
      name: "testGroup1",
      members: [
        {email: "testUser1@example.com"},
        {email: "testUser2@example.com"}
      ]
    }

    const mockReq = {
      url: `/api/groups/${group1.name}`,
      cookies: {
        accessToken: newToken("Admin"),
        refreshToken: newToken("Admin")
      },
      params: { name: group1.name }
    }

    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: jest.fn().mockReturnThis(),
      refreshedTokenMessage: jest.fn()
    }

    jest.spyOn(Group, "findOne").mockResolvedValueOnce(group1)
    const auth = jest.spyOn(utils, "verifyAuth")
        .mockReturnValueOnce({authorized: false, cause: "Unauthorized"})
        .mockReturnValueOnce({authorized: true, cause: "Authorized"})
    await getGroup(mockReq, mockRes)
    expect(mockRes.status).toHaveBeenCalledWith(200)
    expect(auth).toHaveBeenCalledWith(mockReq, mockRes, {
      authType: "Admin"
    })
    expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
      data: {
        group: group1
      },
      refreshedTokenMessage: mockRes?.locals?.refreshedTokenMessage
    }))
  })

  test("should fail if group does not exist", async () => {
    const group1 = {
      name: "testGroup1",
      members: [
        {email: "testUser1@example.com"},
        {email: "testUser2@example.com"}
      ]
    }

    const mockReq = {
      url: `/api/groups/${group1.name}`,
      cookies: {
        accessToken: newToken("Regular"),
        refreshToken: newToken("Regular")
      },
      params: { name: group1.name }
    }

    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: jest.fn().mockReturnThis(),
      refreshedTokenMessage: jest.fn()
    }

    jest.spyOn(Group, "findOne").mockResolvedValueOnce(null)
    const auth = jest.spyOn(utils, "verifyAuth").mockReturnValue({ authorized: true, cause: "Authorized" })
    await getGroup(mockReq, mockRes)
    expect(mockRes.status).toHaveBeenCalledWith(400)
    expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
      error: "Group does not exist"
    }))
  })

  test("should fail if not authenticated as Group", async () => {
    const group1 = {
      name: "testGroup1",
      members: [
        {email: "testUser1@example.com"},
        {email: "testUser2@example.com"}
      ]
    }

    const mockReq = {
      url: `/api/groups/${group1.name}`,
      cookies: {
        accessToken: newToken("Regular"),
        refreshToken: newToken("Regular")
      },
      params: { name: group1.name }
    }

    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: jest.fn().mockReturnThis(),
      refreshedTokenMessage: jest.fn()
    }

    jest.spyOn(Group, "findOne").mockResolvedValueOnce(group1)
    const auth = jest.spyOn(utils, "verifyAuth").mockReturnValue({ authorized: false, cause: "Unauthorized" })
    await getGroup(mockReq, mockRes)
    expect(mockRes.status).toHaveBeenCalledWith(401)
    expect(auth).toHaveBeenCalledWith(mockReq, mockRes, {
      authType: "Group",
      emails: group1.members.map(member => member.email)
    })
    expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
      error: "Unauthorized"
    }))
  })
})

describe("addToGroup", () => {

})

describe("removeFromGroup", () => { })

describe("deleteUser", () => { })

describe("deleteGroup", () => { })