import request from 'supertest';
import { app } from '../app';
import {Group, User} from '../models/User.js';
import {
  addToGroup,
  createGroup, deleteGroup, deleteUser,
  getGroup,
  getGroups,
  getUser,
  getUsers,
  removeFromGroup
} from "../controllers/users.js";
import * as utils from "../controllers/utils.js"
import { newToken } from "../controllers/genericFunctions.js"

import {verifyAuth} from "../controllers/utils.js";
import {transactions} from "../models/model.js";

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
  test("should handle errors and return a 500 code", async () => {
    const mockReq = {}; // Mock the request object
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    }; // Mock the response object

    jest.spyOn(utils, "verifyAuth").mockReturnValue({authorized: true, cause: "Authorized"})
    jest.spyOn(User, "find").mockRejectedValue(new Error("Database error"))
    await getUsers(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.json).toHaveBeenCalledWith('Database error');
  })
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
  test("should handle errors and return a 500 code", async () => {
    jest.spyOn(utils, "verifyAuth").mockReturnValue({authorized: true, cause: "Authorized"})
    const mockReq = {
      params: { username: "testUser" }
    }
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    }; // Mock the response object
    jest.spyOn(User, "findOne").mockRejectedValue(new Error("Database error"))
    await getUser(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.json).toHaveBeenCalledWith('Database error');
  })
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
  test("should handle errors and return a 500 code", async () => {
    jest.spyOn(utils, "verifyAuth").mockReturnValue({authorized: true, cause: "Authorized"})
    const mockReq = {
      body: {
        name: "testGroup",
        memberEmails: ["testUser1@gmail.com"]
      }
    }
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    }; // Mock the response object
    jest.spyOn(Group, "findOne").mockRejectedValue(new Error("Database error"))
    await createGroup(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.json).toHaveBeenCalledWith('Database error');
  })
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
          "testUser1@example.com",
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
        .mockResolvedValueOnce(user1)
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
      },
      refreshedTokenMessage: mockRes?.locals?.refreshedTokenMessage
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
  test("should handle errors and return a 500 code", async () => {
    jest.spyOn(utils, "verifyAuth").mockReturnValue({authorized: true, cause: "Authorized"})
    const mockReq = {}
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    }; // Mock the response object
    jest.spyOn(Group, "find").mockRejectedValue(new Error("Database error"))
    await getGroups(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.json).toHaveBeenCalledWith('Database error');
  })
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
  test("should handle errors and return a 500 code", async () => {
    jest.spyOn(utils, "verifyAuth").mockReturnValue({authorized: true, cause: "Authorized"})
    const mockReq = {
      params:{ name: "testGroup" }
    }
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    }; // Mock the response object
    jest.spyOn(Group, "findOne").mockRejectedValue(new Error("Database error"))
    await getGroup(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.json).toHaveBeenCalledWith('Database error');
  })
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
    jest.spyOn(utils, "verifyAuth").mockReturnValue({ authorized: true, cause: "Authorized" })
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
  test("should handle errors and return a 500 code", async () => {
    const group1 = {
      name: "testGroup1",
      members: [
        {email: "testUser1@example.com", user: "11111"}
      ]
    }
    jest.spyOn(utils, "verifyAuth").mockReturnValue({authorized: true, cause: "Authorized"})
    const mockReq = {
      params:{ name: "testGroup" },
      body: {
        emails: ["testUser1@example.com", "testUser2@example.com"]
      },
      originalUrl: "fakeRoute"
    }
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    }; // Mock the response object
    jest.spyOn(Group, "findOne").mockReturnValueOnce(group1)
    jest.spyOn(Group, "find").mockReturnValueOnce([group1])
    await addToGroup(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.json).toHaveBeenCalledWith("invalid route");
  })
  test("should add users to own group (User)", async () => {
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

    const group1 = {
      name: "testGroup1",
      members: [
        {email: "testUser1@example.com", user: "11111"}
      ]
    }
    const group2 = {
      name: "testGroup2",
      members: [
        {email: "testUser2@example.com", user: "22222"},
        {email: "testUser5@example.com", user: "55555"}
      ]
    }
    jest.spyOn(utils, "verifyAuth").mockReturnValue({authorized: true, cause: "Authorized"})
    const mockReq = {
      originalUrl: `/api/groups/${group1.name}/add`,
      cookies: {
        accessToken: newToken("Regular"),
        refreshToken: newToken("Regular")
      },
      body: {
        emails: [
            user1.email,
            user2.email,
            user3.email,
            user4.email
        ]
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
    jest.spyOn(Group, "find").mockResolvedValueOnce([group1, group2])
    jest.spyOn(User, "findOne").mockResolvedValueOnce(user1)
        .mockResolvedValueOnce(user2)
        .mockResolvedValueOnce(user3)
        .mockResolvedValueOnce(null)
    jest.spyOn(Group, "findOneAndUpdate").mockResolvedValueOnce(group1)
    await addToGroup(mockReq, mockRes)
    expect(mockRes.status).toHaveBeenCalledWith(200)
    expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
      data:{
        group:{
          name: group1.name,
          members: group1.members.map(member => ({email: member.email}))
        },
        alreadyInGroup: [user1.email, user2.email],
        membersNotFound: [user4.email]
      },
      refreshedTokenMessage: mockRes?.locals?.refreshedTokenMessage
    }))
  })

  test("should add users to a group (Admin)", async () => {
    const user1 = {
      _id: "11111",
      username: "testUser1",
      email: "testUser1@example.com",
      role: "Admin"
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

    const group1 = {
      name: "testGroup1",
      members: [
        {email: "testUser1@example.com", user: "11111"}
      ]
    }
    const group2 = {
      name: "testGroup2",
      members: [
        {email: "testUser2@example.com", user: "22222"},
        {email: "testUser5@example.com", user: "55555"}
      ]
    }
    jest.spyOn(utils, "verifyAuth").mockReturnValue({authorized: true, cause: "Authorized"})
    const mockReq = {
      originalUrl: `/api/groups/${group2.name}/insert`,
      cookies: {
        accessToken: newToken("Admin"),
        refreshToken: newToken("Admin")
      },
      body: {
        emails: [
          user1.email,
          user2.email,
          user3.email,
          user4.email
        ]
      },
      params: { name: group2.name }
    }
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: jest.fn().mockReturnThis(),
      refreshedTokenMessage: jest.fn()
    }
    jest.spyOn(Group, "findOne").mockResolvedValueOnce(group2)
    jest.spyOn(Group, "find").mockResolvedValueOnce([group1, group2])
    jest.spyOn(User, "findOne").mockResolvedValueOnce(user1)
        .mockResolvedValueOnce(user2)
        .mockResolvedValueOnce(user3)
        .mockResolvedValueOnce(null)
    jest.spyOn(Group, "findOneAndUpdate").mockResolvedValueOnce(group2)
    await addToGroup(mockReq, mockRes)
    expect(mockRes.status).toHaveBeenCalledWith(200)
    expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
      data:{
        group:{
          name: group2.name,
          members: group2.members.map(member => ({email: member.email}))
        },
        alreadyInGroup: [user1.email, user2.email],
        membersNotFound: [user4.email]
      },
      refreshedTokenMessage: mockRes?.locals?.refreshedTokenMessage
    }))
  })
  test("should not add users to a group and suggests to change api (Admin)", async () => {
    const user1 = {
      _id: "11111",
      username: "testUser1",
      email: "testUser1@example.com",
      role: "Admin"
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

    const group1 = {
      name: "testGroup1",
      members: [
        {email: "testUser1@example.com", user: "11111"}
      ]
    }
    const group2 = {
      name: "testGroup2",
      members: [
        {email: "testUser2@example.com", user: "22222"},
        {email: "testUser5@example.com", user: "55555"}
      ]
    }
    jest.spyOn(utils, "verifyAuth")
        .mockReturnValueOnce({authorized: false, cause: "Unauthorized"})
        .mockReturnValueOnce({authorized: true, cause: "Authorized"})
    const mockReq = {
      originalUrl: `/api/groups/${group2.name}/add`,
      cookies: {
        accessToken: newToken("Admin"),
        refreshToken: newToken("Admin")
      },
      body: {
        emails: [
          user1.email,
          user2.email,
          user3.email,
          user4.email
        ]
      },
      params: { name: group2.name }
    }
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: jest.fn().mockReturnThis(),
      refreshedTokenMessage: jest.fn()
    }
    jest.spyOn(Group, "findOne").mockResolvedValueOnce(group2)
    jest.spyOn(Group, "find").mockResolvedValueOnce([
      {
        name:"testg1",
        members: [{email: "testman1@example.com", user: "12345"}]
      },
      {
        name:"testg2",
        members: [{email: "testman2@example.com", user: "54321"}]
      }
    ])
    await addToGroup(mockReq, mockRes)
    expect(mockRes.status).toHaveBeenCalledWith(400)
    expect(mockRes.json).toHaveBeenCalledWith({
      message: `You must use a different url (api/groups/${group2.name}/insert)`
    })
  })

  test("should fail if user is not part of the group", async () => {
    const user1 = {
      _id: "11111",
      username: "testUser1",
      email: "testUser1@example.com",
      role: "Admin"
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
    const group1 = {
      name: "testGroup1",
      members: [
        {email: "testUser1@example.com", user: "11111"}
      ]
    }
    const group2 = {
      name: "testGroup2",
      members: [
        {email: "testUser2@example.com", user: "22222"},
        {email: "testUser5@example.com", user: "55555"}
      ]
    }
    const mockReq = {
      originalUrl: `/api/groups/${group2.name}/add`,
      cookies: {
        accessToken: newToken("Regular"),
        refreshToken: newToken("Regular")
      },
      body: {
        emails: [
          user1.email,
          user2.email,
          user3.email,
          user4.email
        ]
      },
      params: { name: group2.name }
    }
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: jest.fn().mockReturnThis(),
      refreshedTokenMessage: jest.fn()
    }
    const auth = jest.spyOn(utils, "verifyAuth")
        .mockReturnValueOnce({ authorized: false, cause: "Unauthorized" })
        .mockReturnValueOnce({ authorized: false, cause: "Unauthorized" })
    jest.spyOn(Group, "findOne").mockResolvedValueOnce(group2)
    jest.spyOn(Group, "find").mockResolvedValueOnce([group1, group2])
    await addToGroup(mockReq, mockRes)
    expect(auth).toHaveBeenCalledWith(mockReq, mockRes, {
      authType: "Group",
      emails: group2.members.map(member => member.email)
    })
    expect(mockRes.status).toHaveBeenCalledWith(401)
    expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
      error: "Unauthorized, you are not a member of requested group"
    }))
  })

  test("should fail if insert is called by a Regular user", async () => {
    const user1 = {
      _id: "11111",
      username: "testUser1",
      email: "testUser1@example.com",
      role: "Admin"
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
    const group1 = {
      name: "testGroup1",
      members: [
        {email: "testUser1@example.com", user: "11111"}
      ]
    }
    const group2 = {
      name: "testGroup2",
      members: [
        {email: "testUser2@example.com", user: "22222"},
        {email: "testUser5@example.com", user: "55555"}
      ]
    }
    const mockReq = {
      originalUrl: `/api/groups/${group2.name}/insert`,
      cookies: {
        accessToken: newToken("Regular"),
        refreshToken: newToken("Regular")
      },
      body: {
        emails: [
          user1.email,
          user2.email,
          user3.email,
          user4.email
        ]
      },
      params: { name: group2.name }
    }
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: jest.fn().mockReturnThis(),
      refreshedTokenMessage: jest.fn()
    }
    const auth = jest.spyOn(utils, "verifyAuth")
        .mockReturnValueOnce({ authorized: false, cause: "Unauthorized" })
    jest.spyOn(Group, "findOne").mockResolvedValueOnce(group2)
    jest.spyOn(Group, "find").mockResolvedValueOnce([group1, group2])
    await addToGroup(mockReq, mockRes)
    expect(auth).toHaveBeenCalledWith(mockReq, mockRes, { authType: "Admin" })
    expect(mockRes.status).toHaveBeenCalledWith(401)
    expect(mockRes.json).toHaveBeenCalledWith({
      error: "Unauthorized, you are not an admin"
    })
  })

  test("should fail if group does not exist", async () => {
    const mockReq = {
      originalUrl: `/api/groups/NotAGroup/add`,
      cookies: {
        accessToken: newToken("Regular"),
        refreshToken: newToken("Regular")
      },
      body: {
        emails: [
          "testUser1@example.com",
          "testUser2@example.com"
        ]
      },
      params: { name: "NotAGroup" }
    }
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: jest.fn().mockReturnThis(),
      refreshedTokenMessage: jest.fn()
    }

    jest.spyOn(Group, "findOne").mockResolvedValueOnce(null)
    await addToGroup(mockReq, mockRes)
    expect(mockRes.status).toHaveBeenCalledWith(400)
    expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
      error: "Group does not exist"
    }))
  })

  test("should fail if missing fields in the body", async () => {
    const group1 = {
      name: "testGroup1",
      members: [
        {email: "testUser1@example.com", user: "11111"}
      ]
    }
    const mockReq = {
      originalUrl: `/api/groups/testGroup/add`,
      cookies: {
        accessToken: newToken("Regular"),
        refreshToken: newToken("Regular")
      },
      body: {},
      params: { name: "testGroup" }
    }
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: jest.fn().mockReturnThis(),
      refreshedTokenMessage: jest.fn()
    }
    jest.spyOn(Group, "findOne").mockResolvedValueOnce(group1)
    await addToGroup(mockReq, mockRes)
    expect(mockRes.status).toHaveBeenCalledWith(400)
    expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
      error: "Request body does not contain all the necessary attributes"
    }))
  })

  test("should fail if all the members either do not exist or are already in a group (Group)", async () => {
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

    const group1 = {
      name: "testGroup1",
      members: [
        {email: "testUser1@example.com", user: "11111"},
        {email: "testUser3@example.com", user: "33333"}
      ]
    }
    const group2 = {
      name: "testGroup2",
      members: [
        {email: "testUser2@example.com", user: "22222"},
        {email: "testUser5@example.com", user: "55555"}
      ]
    }
    jest.spyOn(utils, "verifyAuth").mockReturnValue({authorized: true, cause: "Authorized"})
    const mockReq = {
      originalUrl: `/api/groups/${group1.name}/add`,
      cookies: {
        accessToken: newToken("Regular"),
        refreshToken: newToken("Regular")
      },
      body: {
        emails: [
          user1.email,
          user2.email,
          user3.email,
          user4.email
        ]
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
    jest.spyOn(Group, "find").mockResolvedValueOnce([group1, group2])
    jest.spyOn(User, "findOne").mockResolvedValueOnce(user1)
        .mockResolvedValueOnce(user2)
        .mockResolvedValueOnce(user3)
        .mockResolvedValueOnce(null)
    jest.spyOn(Group, "findOneAndUpdate").mockResolvedValueOnce(group1)
    await addToGroup(mockReq, mockRes)
    expect(mockRes.status).toHaveBeenCalledWith(400)
    expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
      error: "all the members either do not exist or are already in a group",
      alreadyInGroup: [user1.email, user2.email, user3.email],
      membersNotFound: [user4.email]
    }))
  })

  test("should fail if all the members either do not exist or are already in a group (Admin)", async () => {
    const user1 = {
      _id: "11111",
      username: "testUser1",
      email: "testUser1@example.com",
      role: "Admin"
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

    const group1 = {
      name: "testGroup1",
      members: [
        {email: "testUser1@example.com", user: "11111"},
        {email: "testUser3@example.com", user: "33333"}
      ]
    }
    const group2 = {
      name: "testGroup2",
      members: [
        {email: "testUser2@example.com", user: "22222"},
        {email: "testUser5@example.com", user: "55555"}
      ]
    }
    jest.spyOn(utils, "verifyAuth").mockReturnValue({authorized: true, cause: "Authorized"})
    const mockReq = {
      originalUrl: `/api/groups/${group2.name}/insert`,
      cookies: {
        accessToken: newToken("Admin"),
        refreshToken: newToken("Admin")
      },
      body: {
        emails: [
          user1.email,
          user2.email,
          user3.email,
          user4.email
        ]
      },
      params: { name: group2.name }
    }
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: jest.fn().mockReturnThis(),
      refreshedTokenMessage: jest.fn()
    }
    jest.spyOn(Group, "findOne").mockResolvedValueOnce(group2)
    jest.spyOn(Group, "find").mockResolvedValueOnce([group1, group2])
    jest.spyOn(User, "findOne").mockResolvedValueOnce(user1)
        .mockResolvedValueOnce(user2)
        .mockResolvedValueOnce(user3)
        .mockResolvedValueOnce(null)
    jest.spyOn(Group, "findOneAndUpdate").mockResolvedValueOnce(group2)
    await addToGroup(mockReq, mockRes)
    expect(mockRes.status).toHaveBeenCalledWith(400)
    expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
      error: "all the members either do not exist or are already in a group",
      alreadyInGroup: [user1.email, user2.email, user3.email],
      membersNotFound: [user4.email]
    }))
  })

  test("should fail if at least one email is not in a valid format or is an empty string", async () => {
    const group1 = {
      name: "testGroup1",
      members: [
        {email: "testUser1@example.com", user: "11111"}
      ]
    }
    const mockReq = {
      originalUrl: `/api/groups/testGroup/add`,
      cookies: {
        accessToken: newToken("Regular"),
        refreshToken: newToken("Regular")
      },
      body: {
        emails: [
            "email@example.com",
            "userexample.com"
            ]
      },
      params: { name: "testGroup" }
    }
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: jest.fn().mockReturnThis(),
      refreshedTokenMessage: jest.fn()
    }
    await addToGroup(mockReq, mockRes)
    expect(mockRes.status).toHaveBeenCalledWith(400)
    expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
      error: "at least one of the members emails is not in a valid email format or is an empty string"
    }))
  })
})

describe("removeFromGroup", () => {
  beforeEach(() => { jest.restoreAllMocks()})
  test("should handle errors and return a 500 code", async () => {
    const group1 = {
      name: "testGroup1",
      members: [
        {email: "testUser1@example.com", user: "11111"},
        {email: "testUser2@example.com", user: "22222"}
      ]
    }
    jest.spyOn(utils, "verifyAuth").mockReturnValue({authorized: true, cause: "Authorized"})
    const mockReq = {
      params:{ name: "testGroup" },
      body: {
        emails: ["testUser1@example.com", "testUser2@example.com"]
      },
      originalUrl: "fakeRoute"
    }
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    }; // Mock the response object
    jest.spyOn(Group, "findOne").mockReturnValueOnce(group1)
    jest.spyOn(Group, "find").mockReturnValueOnce([group1])
    await removeFromGroup(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.json).toHaveBeenCalledWith("invalid route");
  })
  test("should remove a member of own group (User)", async () => {
    const user1 = {
      _id: "11111",
      username: "testUser1",
      email: "testUser1@example.com",
      role: "Admin"
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

    const group1 = {
      name: "testGroup1",
      members: [
        {email: "testUser1@example.com", user: "11111"},
        {email: "testUser3@example.com", user: "33333"}
      ]
    }
    const group2 = {
      name: "testGroup2",
      members: [
        {email: "testUser2@example.com", user: "22222"},
        {email: "testUser4@example.com", user: "44444"},
        {email: "testUser5@example.com", user: "55555"}
      ]
    }
    const auth = jest.spyOn(utils, "verifyAuth").mockReturnValueOnce({ authorized: true, cause: "Authorized" })
    const mockReq = {
      originalUrl: `/api/groups/${group2.name}/remove`,
      cookies: {
        accessToken: newToken("Regular"),
        refreshToken: newToken("Regular")
      },
      body: {
        emails: [
            user1.email,
            user4.email,
            "notFoundEmail@example.com"
        ]
      },
      params: { name: group2.name }
    }
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: jest.fn().mockReturnThis(),
      refreshedTokenMessage: jest.fn()
    }
    jest.spyOn(Group, "findOne").mockResolvedValueOnce(group2)
    jest.spyOn(User, "findOne").mockResolvedValueOnce(user1)
        .mockResolvedValueOnce(user4)
        .mockResolvedValueOnce(null)
    jest.spyOn(Group, "updateOne").mockResolvedValueOnce(group2)
    await removeFromGroup(mockReq, mockRes)
    expect(mockRes.status).toHaveBeenCalledWith(200)
    expect(auth).toHaveBeenCalledWith(mockReq, mockRes, {
      authType: "Group",
      emails: [
        "testUser2@example.com",
        "testUser4@example.com",
        "testUser5@example.com",
      ]
    })
    expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
      data:{
        group:{
          name: group2.name,
          members: group2.members.map(member => ({email: member.email}))
        },
        notInGroup: [user1.email],
        membersNotFound: ["notFoundEmail@example.com"]
      },
      refreshedTokenMessage: mockRes?.locals?.refreshedTokenMessage
    }))
  })

  test("should remove a member of a group (Admin)", async () => {
    const user1 = {
      _id: "11111",
      username: "testUser1",
      email: "testUser1@example.com",
      role: "Admin"
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

    const group1 = {
      name: "testGroup1",
      members: [
        {email: "testUser1@example.com", user: "11111"},
        {email: "testUser3@example.com", user: "33333"}
      ]
    }
    const group2 = {
      name: "testGroup2",
      members: [
        {email: "testUser2@example.com", user: "22222"},
        {email: "testUser4@example.com", user: "44444"},
        {email: "testUser5@example.com", user: "55555"}
      ]
    }
    const auth = jest.spyOn(utils, "verifyAuth").mockReturnValueOnce({ authorized: true, cause: "Authorized" })
    const mockReq = {
      originalUrl: `/api/groups/${group2.name}/pull`,
      cookies: {
        accessToken: newToken("Admin"),
        refreshToken: newToken("Admin")
      },
      body: {
        emails: [
          user1.email,
          user4.email,
          "notFoundEmail@example.com"
        ]
      },
      params: { name: group2.name }
    }
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: jest.fn().mockReturnThis(),
      refreshedTokenMessage: jest.fn()
    }
    jest.spyOn(Group, "findOne").mockResolvedValueOnce(group2)
    jest.spyOn(User, "findOne").mockResolvedValueOnce(user1)
        .mockResolvedValueOnce(user4)
        .mockResolvedValueOnce(null)
    jest.spyOn(Group, "updateOne").mockResolvedValueOnce(group2)
    await removeFromGroup(mockReq, mockRes)
    expect(mockRes.status).toHaveBeenCalledWith(200)
    expect(auth).toHaveBeenCalledWith(mockReq, mockRes, {
      authType: "Admin"
    })
    expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
      data:{
        group:{
          name: group2.name,
          members: group2.members.map(member => ({email: member.email}))
        },
        notInGroup: [user1.email],
        membersNotFound: ["notFoundEmail@example.com"]
      },
      refreshedTokenMessage: mockRes?.locals?.refreshedTokenMessage
    }))
  })

  test("should not remove users from group and suggests to change api (Admin)", async () => {
    const user1 = {
      _id: "11111",
      username: "testUser1",
      email: "testUser1@example.com",
      role: "Admin"
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

    const group2 = {
      name: "testGroup2",
      members: [
        {email: "testUser2@example.com", user: "22222"},
        {email: "testUser5@example.com", user: "55555"}
      ]
    }
    jest.spyOn(utils, "verifyAuth")
        .mockReturnValueOnce({authorized: false, cause: "Unauthorized"})
        .mockReturnValueOnce({authorized: true, cause: "Authorized"})
    const mockReq = {
      originalUrl: `/api/groups/${group2.name}/remove`,
      cookies: {
        accessToken: newToken("Admin"),
        refreshToken: newToken("Admin")
      },
      body: {
        emails: [
          user2.email
        ]
      },
      params: { name: group2.name }
    }
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: jest.fn().mockReturnThis(),
      refreshedTokenMessage: jest.fn()
    }
    jest.spyOn(Group, "findOne").mockResolvedValueOnce(group2)
    await removeFromGroup(mockReq, mockRes)
    expect(mockRes.status).toHaveBeenCalledWith(400)
    expect(mockRes.json).toHaveBeenCalledWith({
      message: `You must use a different url (api/groups/${group2.name}/pull)`
    })
  })
  test("should fail if the user is not part of the group (Group)", async () => {
    const user1 = {
      _id: "11111",
      username: "testUser1",
      email: "testUser1@example.com",
      role: "Admin"
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

    const group1 = {
      name: "testGroup1",
      members: [
        {email: "testUser1@example.com", user: "11111"},
        {email: "testUser3@example.com", user: "33333"}
      ]
    }
    const group2 = {
      name: "testGroup2",
      members: [
        {email: "testUser2@example.com", user: "22222"},
        {email: "testUser4@example.com", user: "44444"},
        {email: "testUser5@example.com", user: "55555"}
      ]
    }
    const auth = jest.spyOn(utils, "verifyAuth").mockReturnValueOnce({ authorized: false, cause: "Unauthorized" })
    const mockReq = {
      originalUrl: `/api/groups/${group2.name}/remove`,
      cookies: {
        accessToken: newToken("Regular"),
        refreshToken: newToken("Regular")
      },
      body: {
        emails: [
          user1.email,
          user4.email,
          "notFoundEmail@example.com"
        ]
      },
      params: { name: group2.name }
    }
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: jest.fn().mockReturnThis(),
      refreshedTokenMessage: jest.fn()
    }
    jest.spyOn(Group, "findOne").mockResolvedValueOnce(group2)
    await removeFromGroup(mockReq, mockRes)
    expect(auth).toHaveBeenCalledWith(mockReq, mockRes, { authType: "Group", emails: group2.members.map(member => member.email) })
    expect(mockRes.status).toHaveBeenCalledWith(401)
    expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
      error: "Unauthorized, you are not a member of requested group"
    }))
  })

  test("should fail if user is not an admin", async () => {
    const auth = jest.spyOn(utils, "verifyAuth").mockReturnValueOnce({ authorized: false, cause: "Unauthorized" })
    const group1 = {
      name: "testGroup1",
      members: [
        {email: "testUser1@example.com", user: "11111"},
        {email: "testUser3@example.com", user: "33333"}
      ]
    }
    const mockReq = {
      originalUrl: `/api/groups/${group1.name}/pull`,
      cookies: {
        accessToken: newToken("Regular"),
        refreshToken: newToken("Regular")
      },
      body: {
        emails:["example1@example.com", "example2@example.com"],
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
    await removeFromGroup(mockReq, mockRes)
    expect(mockRes.status).toHaveBeenCalledWith(401)
    expect(auth).toHaveBeenCalledWith(mockReq, mockRes, { authType: "Admin" })
    expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
      error: "Unauthorized, you are not an admin"
    }))
  })

  test("should fail if group does not exist", async () => {
    const auth = jest.spyOn(utils, "verifyAuth").mockReturnValueOnce({ authorized: true, cause: "Authorized" })
    const mockReq = {
      originalUrl: `/api/groups/NotAGroup/remove`,
      cookies: {
        accessToken: newToken("Regular"),
        refreshToken: newToken("Regular")
      },
      body: {
        emails:["example1@example.com", "example2@example.com"],
      },
      params: { name: "NotAGroup" }
    }
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: jest.fn().mockReturnThis(),
      refreshedTokenMessage: jest.fn()
    }
    jest.spyOn(Group, "findOne").mockResolvedValueOnce(null)
    await removeFromGroup(mockReq, mockRes)
    expect(mockRes.status).toHaveBeenCalledWith(400)
    expect(auth).not.toHaveBeenCalled()
    expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
      error: "Group does not exist"
    }))
  })

  test("shoud fail if request body does not contain all the necessary attributes", async () => {
    const mockReq = {
      originalUrl: `/api/groups/NotAGroup/remove`,
      cookies: {
        accessToken: newToken("Regular"),
        refreshToken: newToken("Regular")
      },
      body: {
      },
      params: { name: "NotAGroup" }
    }
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: jest.fn().mockReturnThis(),
      refreshedTokenMessage: jest.fn()
    }
    await removeFromGroup(mockReq, mockRes)
    expect(mockRes.status).toHaveBeenCalledWith(400)
    expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
      error: "Request body does not contain all the necessary attributes"
    }))
  })

  test("should fail if at least one email is an empty string is not valid", async () => {
    const mockReq = {
      originalUrl: `/api/groups/NotAGroup/remove`,
      cookies: {
        accessToken: newToken("Regular"),
        refreshToken: newToken("Regular")
      },
      body: {
        emails:["example1@example.com", ""],
      },
      params: { name: "NotAGroup" }
    }
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: jest.fn().mockReturnThis(),
      refreshedTokenMessage: jest.fn()
    }
    await removeFromGroup(mockReq, mockRes)
    expect(mockRes.status).toHaveBeenCalledWith(400)
    expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
      error: "At least one of the members emails is not in a valid email format or is an empty string"
    }))
  })

  test("should fail if all the members either do not exist or not in the group", async () => {
    const user1 = {
      _id: "11111",
      username: "testUser1",
      email: "testUser1@example.com",
      role: "Regular"
    }
    const user4 = {
      _id: "44444",
      username: "testUser4",
      email: "testUser4@example.com",
      role: "Regular"
    }
    const user5 = {
      _id: "55555",
      username: "testUser5",
      email: "testUser5@example.com",
      role: "Regular"
    }

    const group1 = {
      name: "testGroup1",
      members: [
        {email: "testUser1@example.com", user: "11111"},
        {email: "testUser3@example.com", user: "33333"}
      ]
    }
    const group2 = {
      name: "testGroup2",
      members: [
        {email: "testUser2@example.com", user: "22222"},
        {email: "testUser4@example.com", user: "44444"},
        {email: "testUser5@example.com", user: "55555"}
      ]
    }
    const auth = jest.spyOn(utils, "verifyAuth").mockReturnValueOnce({ authorized: true, cause: "Authorized" })
    const mockReq = {
      originalUrl: `/api/groups/${group1.name}/remove`,
      cookies: {
        accessToken: newToken("Regular"),
        refreshToken: newToken("Regular")
      },
      body: {
        emails: [
          "testUser5@example.com",
          user4.email,
          "notFoundEmail@example.com"
        ]
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
    jest.spyOn(User, "findOne").mockResolvedValueOnce(user5)
        .mockResolvedValueOnce(user4)
        .mockResolvedValueOnce(null)
    await removeFromGroup(mockReq, mockRes)
    expect(mockRes.status).toHaveBeenCalledWith(400)
    expect(auth).toHaveBeenCalledWith(mockReq, mockRes, { authType: "Group", emails: group1.members.map(member => member.email) })
    expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
      error: "all the members either do not exist or not in the group",
      notInGroup: [user5.email, user4.email],
      membersNotFound: ["notFoundEmail@example.com"]
    }))
  })

  test("should fail if group contains only one member", async () => {
    const group1 = {
      name: "testGroup1",
      members: [
        {email: "testUser1@example.com", user: "11111"}
      ]
    }
    const mockReq = {
      originalUrl: `/api/groups/${group1.name}/pull`,
      cookies: {
        accessToken: newToken("Admin"),
        refreshToken: newToken("Admin")
      },
      body: {
        emails:["example1@example.com", "example2@example.com", "example3@example.com"],
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
    await removeFromGroup(mockReq, mockRes)
    expect(mockRes.status).toHaveBeenCalledWith(400)
    expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
      error: "the group contains only one member"
    }))
  })
})

describe("deleteUser", () => {
  test("should handle errors and return a 500 code", async () => {
    jest.spyOn(utils, "verifyAuth").mockReturnValue({authorized: true, cause: "Authorized"})
    const mockReq = {
      body: {
        email: "testUser1@example.com"
      }
    }
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    }; // Mock the response object
    jest.spyOn(User, "findOne").mockRejectedValue(new Error("Database error"))
    await deleteUser(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.json).toHaveBeenCalledWith("Database error");
  })
  test("should fail if the user is not an admin", async () => {
    jest.spyOn(utils, "verifyAuth").mockReturnValue({authorized: false, cause: "Unauthorized" })
    const mockReq = {
      cookies: {
        accessToken: newToken("Regular"),
        refreshToken: newToken("Regular")
      },
      body: {
        email:"example2@example.com",
      }
    }
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    }
    await deleteUser(mockReq, mockRes)
    expect(mockRes.status).toHaveBeenCalledWith(401)
    expect(mockRes.json).toHaveBeenCalledWith({
      error: "Unauthorized"
    })
  })
  test("shoud delete user succesfully and delete the group because last one", async () => {
    const user1 = {
      _id: "11111",
      username: "testUser1",
      email: "testUser1@example.com",
      role: "Admin"
    }
    const user2 = {
      _id: "22222",
      username: "testUser2",
      email: "testUser2@example.com",
      role: "Regular"
    }
    const group1 = {
      name: "testGroup1",
      members: [
        {email: "testUser2@example.com", user: "22222"}
      ]
    }
    jest.spyOn(utils, "verifyAuth").mockReturnValue({authorized: true, cause: "Authorized" })
    const mockReq = {
      cookies: {
        accessToken: newToken("Admin"),
        refreshToken: newToken("Admin")
      },
      body: {
        email: "example2@example.com"
      }
    }
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    }
    jest.spyOn(User, "findOne").mockResolvedValueOnce(user2)
    jest.spyOn(Group, "findOne").mockResolvedValueOnce(group1)
    //jest.spyOn(User, "deleteOne").mockResolvedValueOnce({deletedCount: 1})
    jest.spyOn(Group, "deleteOne").mockResolvedValueOnce({deletedCount: 1})
    jest.spyOn(User, "deleteOne").mockResolvedValueOnce({deletedCount: 1})
    jest.spyOn(transactions, "deleteMany").mockResolvedValueOnce({deletedCount: 8})
    await deleteUser(mockReq, mockRes)
    expect(mockRes.status).toHaveBeenCalledWith(200)
    expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
      data: {
        deletedTransactions: 8,
        deletedFromGroup: true
      },
      refreshedTokenMessage: mockRes?.locals?.refreshedTokenMessage
    }))
  })
  test("should fail if missing attributes in the body", async () => {
    jest.spyOn(utils, "verifyAuth").mockReturnValue({authorized: true, cause: "Authorized"})
    const mockReq = {
      cookies: {
        accessToken: newToken("Admin"),
        refreshToken: newToken("Admin")
      },
      body: {
        username: "user"
      }
    }
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    }
    await deleteUser(mockReq, mockRes)
    expect(mockRes.status).toHaveBeenCalledWith(400)
    expect(mockRes.json).toHaveBeenCalledWith({
      error: "Request body does not contain all the necessary attributes"
    })
  })
  test("should fail if email is not valid or is an empty string", async () => {
    jest.spyOn(utils, "verifyAuth").mockReturnValue({authorized: true, cause: "Authorized"})
    const mockReq = {
      cookies: {
        accessToken: newToken("Admin"),
        refreshToken: newToken("Admin")
      },
      body: {
        email: "notAnEmail.com"
      }
    }
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    }
    await deleteUser(mockReq, mockRes)
    expect(mockRes.status).toHaveBeenCalledWith(400)
    expect(mockRes.json).toHaveBeenCalledWith({
      error: "Email is not valid or is an empty string"
    })
  })
  test("should fail if email do not belongs to any user in the database", async () => {
    jest.spyOn(utils, "verifyAuth").mockReturnValue({authorized: true, cause: "Authorized"})
    const mockReq = {
      body: {
        email: "test@example.com"
      }
    }
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    }
    jest.spyOn(User, "findOne").mockResolvedValueOnce(null)
    await deleteUser(mockReq, mockRes)
    expect(mockRes.status).toHaveBeenCalledWith(400)
    expect(mockRes.json).toHaveBeenCalledWith({
      error: "User not found"
    })
  })
  test("should delete the user and update the database if is not the last one", async () => {
    const user1 = {
      _id: "11111",
      username: "testUser1",
      email: "testUser1@example.com",
      role: "Admin"
    }
    const user2 = {
      _id: "22222",
      username: "testUser2",
      email: "testUser2@example.com",
      role: "Regular"
    }
    const group1 = {
      name: "testGroup1",
      members: [
        {email: "testUser2@example.com", user: "22222"},
        {email: "testUser3@example.com", user: "33333"}
      ]
    }
    jest.spyOn(utils, "verifyAuth").mockReturnValue({authorized: true, cause: "Authorized" })
    const mockReq = {
      cookies: {
        accessToken: newToken("Admin"),
        refreshToken: newToken("Admin")
      },
      body: {
        email: "example2@example.com"
      }
    }
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    }
    jest.spyOn(User, "findOne").mockResolvedValueOnce(user2)
    jest.spyOn(Group, "findOne").mockResolvedValueOnce(group1)
    jest.spyOn(Group, "updateOne").mockResolvedValueOnce(group1)
    jest.spyOn(User, "deleteOne").mockResolvedValueOnce({deletedCount: 1})
    jest.spyOn(transactions, "deleteMany").mockResolvedValueOnce({deletedCount: 8})
    await deleteUser(mockReq, mockRes)
    expect(mockRes.status).toHaveBeenCalledWith(200)
    expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
      data: {
        deletedTransactions: 8,
        deletedFromGroup: true
      },
      refreshedTokenMessage: mockRes?.locals?.refreshedTokenMessage
    }))
  })
  test("should delete the user that not belongs to any group", async () => {
    const user1 = {
      _id: "11111",
      username: "testUser1",
      email: "testUser1@example.com",
      role: "Admin"
    }
    const user2 = {
      _id: "22222",
      username: "testUser2",
      email: "testUser2@example.com",
      role: "Regular"
    }
    jest.spyOn(utils, "verifyAuth").mockReturnValue({authorized: true, cause: "Authorized" })
    const mockReq = {
      cookies: {
        accessToken: newToken("Admin"),
        refreshToken: newToken("Admin")
      },
      body: {
        email: "example2@example.com"
      }
    }
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    }
    jest.spyOn(User, "findOne").mockResolvedValueOnce(user2)
    jest.spyOn(Group, "findOne").mockResolvedValueOnce(null)
    jest.spyOn(User, "deleteOne").mockResolvedValueOnce({deletedCount: 1})
    jest.spyOn(transactions, "deleteMany").mockResolvedValueOnce({deletedCount: 8})
    await deleteUser(mockReq, mockRes)
    expect(mockRes.status).toHaveBeenCalledWith(200)
    expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
      data: {
        deletedTransactions: 8,
        deletedFromGroup: false
      },
      refreshedTokenMessage: mockRes?.locals?.refreshedTokenMessage
    }))
  })
})

describe("deleteGroup", () => {
  test("should handle errors and return a 500 code", async () => {
    jest.spyOn(utils, "verifyAuth").mockReturnValue({authorized: true, cause: "Authorized"})
    const mockReq = {
      body: {
        name: "testGroup"
      }
    }
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    }; // Mock the response object
    jest.spyOn(Group, "findOne").mockRejectedValue(new Error("Database error"))
    await deleteGroup(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.json).toHaveBeenCalledWith("Database error");
  })
  test("should fail if user is not an admin", async () => {
    jest.spyOn(utils, "verifyAuth").mockReturnValue({authorized: false, cause: "Unauthorized" })
    const mockReq = {
      cookies: {
        accessToken: newToken("Regular"),
        refreshToken: newToken("Regular")
      },
      body: {
        name: "testGroup",
      }
    }
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    }
    await deleteGroup(mockReq, mockRes)
    expect(mockRes.status).toHaveBeenCalledWith(401)
    expect(mockRes.json).toHaveBeenCalledWith({
      error: "Unauthorized"
    })
  })
  test("should fail if missing name or is an empty string", async () => {
    const mockReq = {
      body: {
        name: "",
      }
    }
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    }
    await deleteGroup(mockReq, mockRes)
    expect(mockRes.status).toHaveBeenCalledWith(400)
    expect(mockRes.json).toHaveBeenCalledWith({
      error: "Request body does not contain all the necessary attributes"
    })
  })
  test("should fail if group does not exist", async () => {
    jest.spyOn(utils, "verifyAuth").mockReturnValue({authorized: true, cause: "Authorized" })
    const mockReq = {
      cookies: {
        accessToken: newToken("Admin"),
        refreshToken: newToken("Admin")
      },
      body: {
        name: "testGroup",
      }
    }
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    }
    jest.spyOn(Group, "findOne").mockResolvedValueOnce(null)
    await deleteGroup(mockReq, mockRes)
    expect(mockRes.status).toHaveBeenCalledWith(400)
    expect(mockRes.json).toHaveBeenCalledWith({
      error: "Group does not exist"
    })
  })
  test("should delete the group", async () => {
    jest.spyOn(utils, "verifyAuth").mockReturnValue({authorized: true, cause: "Authorized" })
    const mockReq = {
      cookies: {
        accessToken: newToken("Admin"),
        refreshToken: newToken("Admin")
      },
      body: {
        name: "testGroup",
      }
    }
    const group = {
      name: "testGroup",
      members: [
        {email: "testUser1@example.com", user: "11111"},
        {email: "testUser2@example.com", user: "22222"}
      ]
    }
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    }
    jest.spyOn(Group, "findOne").mockResolvedValueOnce(group)
    jest.spyOn(Group, "deleteOne").mockResolvedValueOnce({deletedCount: 1})
    await deleteGroup(mockReq, mockRes)
    expect(mockRes.status).toHaveBeenCalledWith(200)
    expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
      data: {
        message: "Group deleted successfully"
      },
      refreshedTokenMessage: mockRes?.locals?.refreshedTokenMessage
    }))
  })
})