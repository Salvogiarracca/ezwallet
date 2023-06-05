import request from 'supertest';
import { app } from '../app';
import { User } from '../models/User.js';
import {getUser, getUsers} from "../controllers/users.js";
import * as utils from "../controllers/utils.js"
import { newToken } from "../controllers/genericFunctions.js"
import * as util from "util";
import {expectedError} from "@babel/core/lib/errors/rewrite-stack-trace.js";
import {get} from "mongoose";

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

describe("createGroup", () => {})

describe("getGroups", () => { })

describe("getGroup", () => { })

describe("addToGroup", () => { })

describe("removeFromGroup", () => { })

describe("deleteUser", () => { })

describe("deleteGroup", () => { })