import request from 'supertest';
import { app } from '../app';
import { User } from '../models/User.js';
import {getUser, getUsers} from "../controllers/users.js";
import * as utils from "../controllers/utils.js"
import { newToken } from "../controllers/genericFunctions.js"

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
      data: []
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
      })
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
    jest.spyOn(User, "findOne").mockResolvedValueOnce(fakeRes.user)
    await getUser(mockReq, mockRes)
    expect(mockRes.status).toHaveBeenCalledWith(200)
    expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
      data: fakeRes.user
    }))
  })
})

describe("createGroup", () => { })

describe("getGroups", () => { })

describe("getGroup", () => { })

describe("addToGroup", () => { })

describe("removeFromGroup", () => { })

describe("deleteUser", () => { })

describe("deleteGroup", () => { })