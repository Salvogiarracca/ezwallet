import request from "supertest";
import { app } from "../app";
import { categories, transactions } from "../models/model";
import jwt from "jsonwebtoken";
import {
  getCategories,
  createCategory,
  createTransaction,
  deleteTransaction,
  deleteTransactions,
  getAllTransactions,
  getTransactionsByGroup,
  getTransactionsByGroupByCategory,
  getTransactionsByUser,
  getTransactionsByUserByCategory,
} from "../controllers/controller";
import { handleAmountFilterParams, handleDateFilterParams,verifyAuth } from "../controllers/utils";
import { Group, User } from "../models/User";

jest.mock("../models/model");
jest.mock("jsonwebtoken");
jest.mock("../controllers/utils.js", () => ({
  verifyAuth: jest.fn(),
  handleAmountFilterParams: jest.fn(),
  handleDateFilterParams: jest.fn()
}));

beforeEach(() => {
  categories.find.mockClear();
  categories.prototype.save.mockClear();
  transactions.find.mockClear();
  transactions.deleteOne.mockClear();
  transactions.aggregate.mockClear();
  transactions.prototype.save.mockClear();
  handleAmountFilterParams.mockResolvedValue({});
  handleDateFilterParams.mockResolvedValue({});
});

describe("createCategory", () => {
  test("Successful User [createCategory] - Test #1", async () => {
    const testCategory = {
      type: "investment",
      color: "#ff0000",
    };
    const expectedResponse = {
      data: testCategory,
      message: "Category created!",
    };
    const mockReq = {
      body: testCategory,
      params: { username: "Pippo" },
      cookies: {
        accessToken: "adminAccessTokenValid",
        refreshToken: "adminRefreshTokenValid",
      },
    };
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    jest
        .spyOn(categories.prototype, "save")
        .mockResolvedValue(testCategory);
    jest
        .spyOn(categories, 'findOne')
        .mockReturnValue(null);
    verifyAuth.mockImplementation((mockReq, mockRes, params) => {
      if (params.authType == "Admin") {
        return { authorized: true, cause: "authorized" };
      } else {
        return { authorized: false, cause: "unauthorized" };
      }
    });
    await createCategory(mockReq, mockRes);
    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.json).toHaveBeenCalledWith(expectedResponse);
  });

  test("Unauthorized User [createCategory] - Test #2", async () => {
    const testCategory = {
      type: "investment",
      color: "#ff0000",
    };
    const expectedResponse = {
      message: "Unauthorized",
    };
    const mockReq = {
      body: testCategory,
      params: { username: "Pippo" },
      cookies: {
        accessToken: "adminAccessTokenValid",
        refreshToken: "adminRefreshTokenValid",
      },
    };
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    jest
        .spyOn(categories.prototype, "save")
        .mockResolvedValue(testCategory);
    verifyAuth.mockImplementation((mockReq, mockRes, params) => {
      if (params.authType == "Admin") {
        return { authorized: false, cause: "unauthorized" };
      } else {
        return { authorized: false, cause: "unauthorized" };
      }
    });
    await createCategory(mockReq, mockRes);
    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith(expectedResponse);
  });

  test("Missing attributes [createCategory] - Test #3", async () => {
    const testCategory = {
      type: "investment",
    };
    const expectedResponse = {
      error: "Missing attributes",
    };
    const mockReq = {
      body: testCategory,
      params: { username: "Pippo" },
      cookies: {
        accessToken: "adminAccessTokenValid",
        refreshToken: "adminRefreshTokenValid",
      },
    };
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    jest
        .spyOn(categories.prototype, "save")
        .mockResolvedValue(testCategory);
    verifyAuth.mockImplementation((mockReq, mockRes, params) => {
      if (params.authType == "Admin") {
        return { authorized: true, cause: "unauthorized" };
      } else {
        return { authorized: false, cause: "unauthorized" };
      }
    });
    await createCategory(mockReq, mockRes);
    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith(expectedResponse);

  });

  test("Empty string attribute [createCategory] - Test #4", async () => {
    const testCategory = {
      type: "investment",
      color: "",
    };
    const expectedResponse = {
      error: "Missing attributes",
    };
    const mockReq = {
      body: testCategory,
      params: { username: "Pippo" },
      cookies: {
        accessToken: "adminAccessTokenValid",
        refreshToken: "adminRefreshTokenValid",
      },
    };
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    jest
        .spyOn(categories.prototype, "save")
        .mockResolvedValue(testCategory);
    verifyAuth.mockImplementation((mockReq, mockRes, params) => {
      if (params.authType == "Admin") {
        return { authorized: true, cause: "authorized" };
      } else {
        return { authorized: false, cause: "unauthorized" };
      }
    });
    await createCategory(mockReq, mockRes);
    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith(expectedResponse);

  })

  test("Existing category [createCategory] - Test #5", async () => {
    const testCategory = {
      type: "investment",
      color: "#ff0000",
    };
    const expectedResponse = {
      error: "Category already exists",
    };
    const mockReq = {
      body: testCategory,
      params: { username: "Pippo" },
      cookies: {
        accessToken: "adminAccessTokenValid",
        refreshToken: "adminRefreshTokenValid",
      },
    };
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    jest
        .spyOn(categories.prototype, "save")
        .mockResolvedValue(testCategory);
    verifyAuth.mockImplementation(() => {
      return { authorized: true, cause: "authorized" };
    });
    categories.findOne.mockImplementation(() => {
      return {type: "investment", color: "#ff0000"};
    });
    await createCategory(mockReq, mockRes);
    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith(expectedResponse);
  });

});

describe("updateCategory", () => {
  test("Missing attributes (empty string) [updateCategory] - Test #1", async () => {
    const mockReq = {
      params: {username: "testuser", type: "test"},
      cookies: {
        accessToken: "adminAccessTokenValid",
        refreshToken: "adminRefreshTokenValid",
      },
      body: {
        type: "",
        color: "",
      }
    };
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    const expectedResponse = {
      error: "Missing attributes",
    };
    verifyAuth.mockImplementation((mockReq, mockRes, params) => {
      if (params.authType == "Admin") {
        return {authorized: true, cause: "authorized"};
      } else {
        return {authorized: false, cause: "authorized"};
      }
    });

    await updateCategory(mockReq, mockRes);
    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith(expectedResponse);
  });

  test("Missing attributes (no body) [updateCategory] - Test #2", async () => {
    const mockReq = {
      params: {username: "testuser", type: "test"},
      cookies: {
        accessToken: "adminAccessTokenValid",
        refreshToken: "adminRefreshTokenValid",
      },
    };
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    const expectedResponse = {
      error: "body is not defined",
    };
    verifyAuth.mockImplementation((mockReq, mockRes, params) => {
      if (params.authType == "Admin") {
        return {authorized: true, cause: "authorized"};
      } else {
        return {authorized: false, cause: "authorized"};
      }
    });

    await updateCategory(mockReq, mockRes);
    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith(expectedResponse);
  });

  test("Category does not exist [updateCategory] - Test #3", async () => {
    const mockReq = {
      params: {username: "testuser", type: "noexist"},
      body: {type: 'investment',
        color: '#ff0000'},
      cookies: {
        accessToken: "adminAccessTokenValid",
        refreshToken: "adminRefreshTokenValid",
      },
    };
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    const expectedResponse = {
      error: "Old category type does not exist",
    };
    verifyAuth.mockImplementation((mockReq, mockRes, params) => {
      if (params.authType == "Admin") {
        return {authorized: true, cause: "authorized"};
      } else {
        return {authorized: false, cause: "authorized"};
      }
    });
    jest.spyOn(categories, 'findOne').mockReturnValue({})
    await updateCategory(mockReq, mockRes);
    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith(expectedResponse);
  });

  test("New category type already defined [updateCategory] - Test #4", async () => {
    const mockReq = {
      params: {username: "testuser", type: "noexist"},
      body: {type: 'investment',
        color: '#ff0000'},
      cookies: {
        accessToken: "adminAccessTokenValid",
        refreshToken: "adminRefreshTokenValid",
      },
    };
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    const expectedResponse = {
      error: "new type invalid, category already exists",
    };
    verifyAuth.mockImplementation((mockReq, mockRes, params) => {
      if (params.authType == "Admin") {
        return {authorized: true, cause: "authorized"};
      } else {
        return {authorized: false, cause: "authorized"};
      }
    });
    jest.spyOn(categories, 'findOne').mockReturnValue({type: 'exists', color: '#ffffff'})
    await updateCategory(mockReq, mockRes);
    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith(expectedResponse);
  });

  test("Admin auth [updateCategory] - Test #5", async () => {
    const mockReq = {
      params: {username: "testuser", type: "noexist"},
      body: {type: 'investment',
        color: '#ff0000'},
      cookies: {
        accessToken: "adminAccessTokenValid",
        refreshToken: "adminRefreshTokenValid",
      },
    };
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    const expectedResponse = {
      message: "Unauthorized",
    };
    verifyAuth.mockImplementation((mockReq, mockRes, params) => {
      if (params.authType == "Admin") {
        return {authorized: false, cause: "Unauthorized"};
      } else {
        return {authorized: false, cause: "Unauthorized"};
      }
    });
    jest.spyOn(categories, 'findOne').mockReturnValue({type: 'exists', color: '#ffffff'})
    await updateCategory(mockReq, mockRes);
    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith(expectedResponse);
  });

  test("Success [updateCategory] - Test #6", async() =>{
    const mockReq = {
      params: {username: "testuser", type: "test"},
      body: {type: 'investment',
        color: '#ff0000'},
      cookies: {
        accessToken: "adminAccessTokenValid",
        refreshToken: "adminRefreshTokenValid",
      },
    };
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    const expectedResponse = {
      message: "Update completed successfully",
      count: 15
    };
    verifyAuth.mockImplementation((mockReq, mockRes, params) => {
      if (params.authType == "Admin") {
        return {authorized: true, cause: "authorized"};
      } else {
        return {authorized: false, cause: "authorized"};
      }
    });
    jest.spyOn(categories, 'findOne').mockReturnValueOnce({type: 'exists', color: '#ffffff'})
        .mockReturnValueOnce(null);
    jest.spyOn(categories, 'findOneAndUpdate').mockReturnValue({type: 'investment', color: '#ff0000'});
    jest.spyOn(transactions, 'updateMany').mockReturnValue({modifiedCount: 15});
    await updateCategory(mockReq, mockRes);
    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.json).toHaveBeenCalledWith(expectedResponse);
  });

  test("Wrong color format [updateCategory] - Test #7", async() =>{
    const mockReq = {
      params: {username: "testuser", type: "test"},
      body: {type: 'investment',
        color: 'abcde'},
      cookies: {
        accessToken: "adminAccessTokenValid",
        refreshToken: "adminRefreshTokenValid",
      },
    };
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    const expectedResponse = {
      error: "Wrong format for color",
    };
    verifyAuth.mockImplementation((mockReq, mockRes, params) => {
      if (params.authType == "Admin") {
        return {authorized: true, cause: "authorized"};
      } else {
        return {authorized: false, cause: "authorized"};
      }
    });
    jest.spyOn(categories, 'findOne').mockReturnValueOnce({type: 'exists', color: '#ffffff'})
        .mockReturnValueOnce(null);
    jest.spyOn(categories, 'findOneAndUpdate').mockReturnValue({type: 'investment', color: '#ff0000'});
    jest.spyOn(transactions, 'updateMany').mockReturnValue({modifiedCount: 15});
    await updateCategory(mockReq, mockRes);
    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith(expectedResponse);
  });

  test("Mismatched types [updateCategory] - Test #8", async() =>{
    const mockReq = {
      params: {username: "testuser", type: "test"},
      body: {type: 10,
        color: '#ff5455'},
      cookies: {
        accessToken: "adminAccessTokenValid",
        refreshToken: "adminRefreshTokenValid",
      },
    };
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    const expectedResponse = {
      error: "Mismatched types in req.body!",
    };
    verifyAuth.mockImplementation((mockReq, mockRes, params) => {
      if (params.authType == "Admin") {
        return {authorized: true, cause: "authorized"};
      } else {
        return {authorized: false, cause: "authorized"};
      }
    });
    await updateCategory(mockReq, mockRes);
    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith(expectedResponse);
  });
});

describe("deleteCategory", () => {
  test("Missing attributes [deleteCategory] - Test #1", async () => {
    const mockReq = {
      params: {username: "testuser"},
      cookies: {
        accessToken: "adminAccessTokenValid",
        refreshToken: "adminRefreshTokenValid",
      },
    };
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    const expectedResponse = {
      error: "Missing attributes",
    };
    verifyAuth.mockImplementation((mockReq, mockRes, params) => {
      if (params.authType == "Admin") {
        return {authorized: true, cause: "authorized"};
      } else {
        return {authorized: false, cause: "authorized"};
      }
    });

    await deleteCategory(mockReq, mockRes);
    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith(expectedResponse);
  });

  test("Only one category [deleteCategory] - Test #2", async () => {
    const mockReq = {
      params: {username: "testuser"},
      body: {
        types: ["investment", "fuel"],
      },
      cookies: {
        accessToken: "adminAccessTokenValid",
        refreshToken: "adminRefreshTokenValid",
      },
    };
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    const expectedResponse = {
      error: "Only one category, deletion not possible!",
    };
    verifyAuth.mockImplementation((mockReq, mockRes, params) => {
      if (params.authType == "Admin") {
        return {authorized: true, cause: "authorized"};
      } else {
        return {authorized: false, cause: "authorized"};
      }
    });
    jest.spyOn(categories, 'countDocuments').mockImplementation(() => 1);
    await deleteCategory(mockReq, mockRes);
    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith(expectedResponse);
  });

  test("Empty string [deleteCategory] - Test #3", async () => {
    const mockReq = {
      params: {username: "testuser"},
      body: {
        types: ["investment", "", "fuel"],
      },
      cookies: {
        accessToken: "adminAccessTokenValid",
        refreshToken: "adminRefreshTokenValid",
      },
    };
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    const expectedResponse = {
      error: "Empty string in array",
    };
    verifyAuth.mockImplementation((mockReq, mockRes, params) => {
      if (params.authType == "Admin") {
        return {authorized: true, cause: "authorized"};
      } else {
        return {authorized: false, cause: "authorized"};
      }
    });
    jest.spyOn(categories, 'countDocuments').mockImplementation(() => 4);
    jest.spyOn(categories, 'findOne').mockImplementation(() => ({type: 'test', color: "#ff0000"}));
    await deleteCategory(mockReq, mockRes);
    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith(expectedResponse);
  });

  test("Category does not exist [deleteCategory] - Test #4", async () => {
    const mockReq = {
      params: {username: "testuser"},
      body: {
        types: ["investment", "test", "fuel"],
      },
      cookies: {
        accessToken: "adminAccessTokenValid",
        refreshToken: "adminRefreshTokenValid",
      },
    };
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    const expectedResponse = {
      error: "Category does not exist, deletion not possible!",
    };
    verifyAuth.mockImplementation((mockReq, mockRes, params) => {
      if (params.authType == "Admin") {
        return {authorized: true, cause: "authorized"};
      } else {
        return {authorized: false, cause: "authorized"};
      }
    });
    jest.spyOn(categories, 'countDocuments').mockImplementation(() => 4);
    jest.spyOn(categories, 'findOne').mockReturnValueOnce({type: 'test', color: '#ffffff'})
        .mockReturnValueOnce(null)
        .mockReturnValue({type: 'test', color: '#ff0000'});
    await deleteCategory(mockReq, mockRes);
    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith(expectedResponse);
  });

  test("Success N>T [deleteCategory] - Test #5", async () => {
    const mockReq = {
      params: {username: "testuser"},
      body: {
        types: ["fuel"],
      },
      cookies: {
        accessToken: "adminAccessTokenValid",
        refreshToken: "adminRefreshTokenValid",
      },
    };
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    const expectedResponse = {
      message: "Deletion completed successfully",
      count: 23,
    };
    verifyAuth.mockImplementation((mockReq, mockRes, params) => {
      if (params.authType == "Admin") {
        return {authorized: true, cause: "authorized"};
      } else {
        return {authorized: false, cause: "authorized"};
      }
    });
    jest.spyOn(categories, 'countDocuments').mockImplementation(() => 5);
    jest.spyOn(categories, 'findOne').mockReturnValue({type: 'test', color: '#ffffff'});
    jest.spyOn(categories, 'findOneAndRemove').mockImplementation(() => ({}));
    jest.spyOn(categories, 'find').mockImplementation(() => ({type: 'oldest', color: '#ffffff'}));
    jest.spyOn(transactions, 'updateMany').mockImplementation(() => ({modifiedCount: 23}));
    jest.spyOn(categories, "find").mockImplementation(() => ({
      sort: () => ({
        limit: () => [{
          type: 'oldest',
          color: '#cc1b1b'
        }],
      }),
    }));

    await deleteCategory(mockReq, mockRes);
    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.json).toHaveBeenCalledWith(expectedResponse);
  });

  test("Success N=T [deleteCategory] - Test #6", async () => {
    const mockReq = {
      params: {username: "testuser"},
      body: {
        types: ["fuel", "investment", "supermarket", "test"],
      },
      cookies: {
        accessToken: "adminAccessTokenValid",
        refreshToken: "adminRefreshTokenValid",
      },
    };
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    const expectedResponse = {
      message: "Deletion completed successfully",
      count: 68,
    };
    verifyAuth.mockImplementation((mockReq, mockRes, params) => {
      if (params.authType == "Admin") {
        return {authorized: true, cause: "authorized"};
      } else {
        return {authorized: false, cause: "authorized"};
      }
    });
    jest.spyOn(categories, 'countDocuments').mockImplementation(() => 4);
    jest.spyOn(categories, 'findOne').mockReturnValue({type: 'test', color: '#ffffff'});
    jest.spyOn(categories, 'findOneAndRemove').mockImplementation(() => ({}));
    jest.spyOn(categories, 'find').mockImplementation(() => ({type: 'fuel', color: '#ffffff'}));
    jest.spyOn(transactions, 'updateMany').mockImplementation(() => ({modifiedCount: 17}));
    jest.spyOn(categories, "find").mockImplementation(() => ({
      sort: () => ({
        limit: () => [{
          type: 'fuel',
          color: '#cc1b1b'
        }],
      }),
    }));

    await deleteCategory(mockReq, mockRes);
    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.json).toHaveBeenCalledWith(expectedResponse);
  });

  test("Unauthorized [deleteCategory] - Test #7", async () => {
    const mockReq = {
      params: {username: "testuser"},
      body: {
        types: ["fuel", "investment", "supermarket", "test"],
      },
      cookies: {
        accessToken: "adminAccessTokenValid",
        refreshToken: "adminRefreshTokenValid",
      },
    };
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    }
    const expectedResponse = {
      message: 'Unauthorized'
    };
    verifyAuth.mockImplementation((mockReq, mockRes, params) => {
      if (params.authType == "Admin") {
        return {authorized: false, cause: "Unauthorized"};
      } else {
        return {authorized: false, cause: "Unauthorized"};
      }
    });
    await deleteCategory(mockReq, mockRes);
    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith(expectedResponse);
  });

  test("Empty array [deleteCategory] - Test #8", async () => {
    const mockReq = {
      params: {username: "testuser"},
      cookies: {
        accessToken: "adminAccessTokenValid",
        refreshToken: "adminRefreshTokenValid",
      },
      body: {types: [],}
    };
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    const expectedResponse = {
      error: "Missing attributes",
    };
    verifyAuth.mockImplementation((mockReq, mockRes, params) => {
      if (params.authType == "Admin") {
        return {authorized: true, cause: "authorized"};
      } else {
        return {authorized: false, cause: "authorized"};
      }
    });
    await deleteCategory(mockReq, mockRes);
    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith(expectedResponse);
  });
});


describe("getCategories", () => {
  test("Successful Request [getCategories] - Test #1", async () => {
    const mockReq = {
      params: {username: "testuser"},
      cookies: {
        accessToken: "adminAccessTokenValid",
        refreshToken: "adminRefreshTokenValid",
      },
    };
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    const retrievedCategories = [
      {
        type: "investment",
        color: "#fc0123",
      },
      {
        type: "supermarket",
        color: "#0090ff",
      },
      {
        type: "fuel",
        color: "#64ff63",
      },
    ];
    const expectedResponse = {
      data: retrievedCategories.map((v) =>
          Object.assign(
              {},
              {
                type: v.type,
                color: v.color,
              }
          )
      ),
      message: "authorized",
    };
    verifyAuth.mockImplementation((mockReq, mockRes, params) => {
      if (params.authType == "Simple") {
        return { authorized: true, cause: "authorized" };
      } else {
        return { authorized: false, cause: "authorized" };
      }
    });
    jest
        .spyOn(categories, "find")
        .mockResolvedValue(retrievedCategories);
    await getCategories(mockReq, mockRes);
    expect(categories.find).toHaveBeenCalled();
    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.json).toHaveBeenCalledWith(expectedResponse);
  });

  test("Unauthorized Request [getCategories] - Test #2", async () => {
    const mockReq = {
      params: { username: "testuser" },
      cookies: {
        accessToken: "adminAccessTokenValid",
        refreshToken: "adminRefreshTokenValid",
      },
    };
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    const retrievedCategories = [
      {
        type: "investment",
        color: "#fc0123",
      },
      {
        type: "supermarket",
        color: "#0090ff",
      },
      {
        type: "fuel",
        color: "#64ff63",
      },
    ];
    const expectedResponse = {
      message: "Unauthorized",
    };
    verifyAuth.mockImplementation((mockReq, mockRes, params) => {
      if (params.authType == "Simple") {
        return { authorized: false, cause: "unauthorized" };
      } else {
        return { authorized: false, cause: "unauthorized" };
      }
    });
    jest
        .spyOn(categories, "find")
        .mockResolvedValue(retrievedCategories);
    await getCategories(mockReq, mockRes);
    expect(categories.find).not.toHaveBeenCalled();
    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith(expectedResponse);
  });

  test("Empty Request [getCategories] - Test #3", async () => {
    const mockReq = {
      params: { username: "testuser" },
      cookies: {
        accessToken: "adminAccessTokenValid",
        refreshToken: "adminRefreshTokenValid",
      },
    };
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    const retrievedCategories = [];
    const expectedResponse = {
      data: retrievedCategories.map((v) =>
          Object.assign(
              {},
              {
                type: v.type,
                color: v.categories_info.color,
              }
          )
      ),
      message: "authorized",
    };
    verifyAuth.mockImplementation((mockReq, mockRes, params) => {
      if (params.authType == "Simple") {
        return { authorized: false, cause: "authorized" };
      } else {
        return { authorized: true, cause: "authorized" };
      }
    });
    jest
        .spyOn(categories, "find")
        .mockResolvedValue(retrievedCategories);
    await getCategories(mockReq, mockRes);
    expect(categories.find).toHaveBeenCalled();
    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.json).toHaveBeenCalledWith(expectedResponse);
  });

});

describe("createTransaction", () => {
  test("Successful User creation [createTransaction] - Test #1", async () => {
    const testTransaction = {
      username: "Pippo",
      amount: 3500,
      type: "Personal",
    };
    const expectedResponse = {
      data: testTransaction,
      refreshedTokenMessage: "",
      message: "Transaction created",
      refreshedTokenMessage: "",
    };
    const mockReq = {
      body: testTransaction,
      params: { username: "Pippo" },
      cookies: {
        accessToken: "adminAccessTokenValid",
        refreshToken: "adminRefreshTokenValid",
      },
    };
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: {
        //The name can also be message, what matters is consistency with the one used in the code
        refreshedTokenMessage: "",
      },
    };
    const testCategory = {
      type: "test",
      color: "testColor",
    };
    const testUser = {
      username: testTransaction.username,
      email: "test@gmail.com",
      password: "test",
    };
    jest.spyOn(User, "findOne").mockResolvedValue(testUser);
    jest.spyOn(categories, "findOne").mockResolvedValue(testCategory);
    jest
      .spyOn(transactions.prototype, "save")
      .mockResolvedValue(testTransaction);
    verifyAuth.mockImplementation((mockReq, mockRes, params) => {
      if (params.authType == "User") {
        return { authorized: true, cause: "authorized" };
      } else {
        return { authorized: false, cause: "unauthorized" };
      }
    });
    await createTransaction(mockReq, mockRes);
    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.json).toHaveBeenCalledWith(expectedResponse);
  });

  test("Unauthorized User [createTransaction] - Test #2", async () => {
    const testTransaction = {
      username: "Pippo",
      amount: 3500,
      type: "Personal",
    };
    const expectedResponse = {
      refreshedTokenMessage: "",
      message: "Unauthorized",
    };
    const mockReq = {
      body: testTransaction,
      params: { username: "Pippo" },
      cookies: {
        accessToken: "adminAccessTokenValid",
        refreshToken: "adminRefreshTokenValid",
      },
    };
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: {
        //The name can also be message, what matters is consistency with the one used in the code
        refreshedTokenMessage: "",
      },
    };
    const testCategory = {
      type: "test",
      color: "testColor",
    };
    const testUser = {
      username: testTransaction.username,
      email: "test@gmail.com",
      password: "test",
    };
    jest.spyOn(User, "findOne").mockResolvedValue(testUser);
    jest.spyOn(categories, "findOne").mockResolvedValue(testCategory);
    jest
      .spyOn(transactions.prototype, "save")
      .mockResolvedValue(testTransaction);
    verifyAuth.mockImplementation((mockReq, mockRes, params) => {
      if (params.authType == "User") {
        return { authorized: false, cause: "unauthorized" };
      } else {
        return { authorized: false, cause: "unauthorized" };
      }
    });
    await createTransaction(mockReq, mockRes);
    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith(expectedResponse);
  });

  test("Different user [createTransaction] - Test #3", async () => {
    const testTransaction = {
      username: "Pippo",
      amount: 3500,
      type: "Personal",
    };
    const expectedResponse = {
      refreshedTokenMessage: "",
      message: "Username dosen't match transaction's username",
    };
    const mockReq = {
      body: testTransaction,
      params: { username: "Gianluca" },
      cookies: {
        accessToken: "adminAccessTokenValid",
        refreshToken: "adminRefreshTokenValid",
      },
    };
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: {
        //The name can also be message, what matters is consistency with the one used in the code
        refreshedTokenMessage: "",
      },
    };
    const testCategory = {
      type: "test",
      color: "testColor",
    };
    const testUser = {
      username: testTransaction.username,
      email: "test@gmail.com",
      password: "test",
    };
    jest.spyOn(User, "findOne").mockResolvedValue(testUser);
    jest.spyOn(categories, "findOne").mockResolvedValue(testCategory);
    jest
      .spyOn(transactions.prototype, "save")
      .mockResolvedValue(testTransaction);
    verifyAuth.mockImplementation((mockReq, mockRes, params) => {
      if (params.authType == "User") {
        return { authorized: true, cause: "authorized" };
      } else {
        return { authorized: false, cause: "unauthorized" };
      }
    });
    await createTransaction(mockReq, mockRes);
    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith(expectedResponse);
  });

  test("Successful Admin transaction for different users [createTransaction] - Test #4", async () => {
    const testTransaction = {
      username: "Pippo",
      amount: 3500,
      type: "Personal",
    };
    const expectedResponse = {
      data: testTransaction,
      refreshedTokenMessage: "",
      message: "Transaction created",
    };
    const mockReq = {
      body: testTransaction,
      params: { username: "Gianluca" },
      cookies: {
        accessToken: "adminAccessTokenValid",
        refreshToken: "adminRefreshTokenValid",
      },
    };
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: {
        //The name can also be message, what matters is consistency with the one used in the code
        refreshedTokenMessage: "",
      },
    };
    const testCategory = {
      type: "test",
      color: "testColor",
    };
    const testUser = {
      username: testTransaction.username,
      email: "test@gmail.com",
      password: "test",
    };
    jest.spyOn(User, "findOne").mockResolvedValue(testUser);
    jest.spyOn(categories, "findOne").mockResolvedValue(testCategory);
    jest
      .spyOn(transactions.prototype, "save")
      .mockResolvedValue(testTransaction);
    verifyAuth.mockImplementation((mockReq, mockRes, params) => {
      if (params.authType == "User") {
        return { authorized: false, cause: "unauthorized" };
      } else {
        return { authorized: true, cause: "authorized" };
      }
    });
    await createTransaction(mockReq, mockRes);
    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.json).toHaveBeenCalledWith(expectedResponse);
  });

  test("Invalid parameters [createTransaction] - Test #5", async () => {
    const testTransaction = {
      username: "Pippo",
      amount: 3500,
    };
    const expectedResponse = {
      refreshedTokenMessage: "",
      message: "Invalid parameters",
      refreshedTokenMessage: "",
    };
    const mockReq = {
      body: testTransaction,
      params: { username: "Pippo" },
      cookies: {
        accessToken: "adminAccessTokenValid",
        refreshToken: "adminRefreshTokenValid",
      },
    };
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: {
        //The name can also be message, what matters is consistency with the one used in the code
        refreshedTokenMessage: "",
      },
    };
    const testCategory = {
      type: "test",
      color: "testColor",
    };
    const testUser = {
      username: testTransaction.username,
      email: "test@gmail.com",
      password: "test",
    };
    jest.spyOn(User, "findOne").mockResolvedValue(testUser);
    jest.spyOn(categories, "findOne").mockResolvedValue(testCategory);
    jest
      .spyOn(transactions.prototype, "save")
      .mockResolvedValue(testTransaction);
    verifyAuth.mockImplementation(() => {
      return { authorized: true, cause: "authorized" };
    });
    await createTransaction(mockReq, mockRes);
    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith(expectedResponse);
  });

  test("Database Error Transaction Request [createTransaction] - Test #6", async () => {
    const testTransaction = {
      username: "Pippo",
      amount: 3500,
      type: "Personal",
    };
    const expectedResponse = {
      refreshedTokenMessage: "",
      error: "Database Error",
    };
    const mockReq = {
      body: testTransaction,
      params: { username: "Pippo" },
      cookies: {
        accessToken: "adminAccessTokenValid",
        refreshToken: "adminRefreshTokenValid",
      },
    };
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: {
        //The name can also be message, what matters is consistency with the one used in the code
        refreshedTokenMessage: "",
      },
    };
    const testCategory = {
      type: "test",
      color: "testColor",
    };
    const testUser = {
      username: testTransaction.username,
      email: "test@gmail.com",
      password: "test",
    };
    jest.spyOn(User, "findOne").mockResolvedValue(testUser);
    jest.spyOn(categories, "findOne").mockResolvedValue(testCategory);
    jest.spyOn(transactions.prototype, "save").mockImplementation(() => {
      throw new Error("Database Error");
    });
    verifyAuth.mockImplementation((mockReq, mockRes, params) => {
      if (params.authType == "User") {
        return { authorized: true, cause: "authorized" };
      } else {
        return { authorized: false, cause: "unauthorized" };
      }
    });
    await createTransaction(mockReq, mockRes);
    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.json).toHaveBeenCalledWith(expectedResponse);
  });

  test("User or Category not found [createTransaction] - Test #6", async () => {
    const testTransaction = {
      username: "Pippo",
      amount: 3500,
      type: "Personal",
    };
    const expectedResponse = {
      refreshedTokenMessage: "",
      message:"Category or User dosen't exist"
    };
    const mockReq = {
      body: testTransaction,
      params: { username: "Pippo" },
      cookies: {
        accessToken: "adminAccessTokenValid",
        refreshToken: "adminRefreshTokenValid",
      },
    };
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: {
        //The name can also be message, what matters is consistency with the one used in the code
        refreshedTokenMessage: "",
      },
    };
    const testUser = {
      username: testTransaction.username,
      email: "test@gmail.com",
      password: "test",
    };
    jest.spyOn(User, "findOne").mockResolvedValue(testUser);
    jest.spyOn(categories, "findOne").mockResolvedValue(undefined);
    jest.spyOn(transactions.prototype, "save").mockImplementation(() => {
      throw new Error("Database Error");
    });
    verifyAuth.mockImplementation((mockReq, mockRes, params) => {
      if (params.authType == "User") {
        return { authorized: true, cause: "authorized" };
      } else {
        return { authorized: false, cause: "unauthorized" };
      }
    });
    await createTransaction(mockReq, mockRes);
    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith(expectedResponse);
  });

});

describe("getAllTransactions", () => {
  test("Successful Request [getAllTransactions] - Test #1", async () => {
    const mockReq = {
      params: { username: "testuser" },
      cookies: {
        accessToken: "adminAccessTokenValid",
        refreshToken: "adminRefreshTokenValid",
      },
    };
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: {
        //The name can also be message, what matters is consistency with the one used in the code
        refreshedTokenMessage: "",
      },
    };
    const retrievedTransactions = [
      {
        _id: 1,
        username: "Pippo",
        amount: 3500,
        type: "Personal",
        categories_info: { color: "testColor" },
        date: "2023/4/3",
      },
      {
        _id: 2,
        username: "Gianluca",
        amount: 12000,
        type: "Personal",
        categories_info: { color: "testColor" },
        date: "2023/4/3",
      },
      {
        _id: 3,
        username: "Robert",
        amount: 34,
        type: "Personal",
        categories_info: { color: "testColor" },
        date: "2023/4/3",
      },
    ];
    const expectedResponse = {
      data: retrievedTransactions.map((v) =>
        Object.assign(
          {},
          {
            _id: v._id,
            username: v.username,
            amount: v.amount,
            type: v.type,
            color: v.categories_info.color,
            date: v.date,
          }
        )
      ),
      refreshedTokenMessage: "",
      message: "authorized",
    };
    verifyAuth.mockImplementation((mockReq, mockRes, params) => {
      if (params.authType == "User") {
        return { authorized: false, cause: "authorized" };
      } else {
        return { authorized: true, cause: "authorized" };
      }
    });
    jest
      .spyOn(transactions, "aggregate")
      .mockResolvedValue(retrievedTransactions);
    await getAllTransactions(mockReq, mockRes);
    expect(transactions.aggregate).toHaveBeenCalled();
    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.json).toHaveBeenCalledWith(expectedResponse);
  });

  test("Unauthorized Request [getAllTransactions] - Test #2", async () => {
    const mockReq = {
      params: { username: "testuser" },
      cookies: {
        accessToken: "adminAccessTokenValid",
        refreshToken: "adminRefreshTokenValid",
      },
    };
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: {
        //The name can also be message, what matters is consistency with the one used in the code
        refreshedTokenMessage: "",
      },
    };
    const retrievedTransactions = [
      {
        _id: 1,
        username: "Pippo",
        amount: 3500,
        type: "Personal",
        categories_info: { color: "testColor" },
        date: "2023/4/3",
      },
      {
        _id: 2,
        username: "Gianluca",
        amount: 12000,
        type: "Personal",
        categories_info: { color: "testColor" },
        date: "2023/4/3",
      },
      {
        _id: 3,
        username: "Robert",
        amount: 34,
        type: "Personal",
        categories_info: { color: "testColor" },
        date: "2023/4/3",
      },
    ];
    const expectedResponse = {
      refreshedTokenMessage: "",
      message: "unauthorized",
    };
    verifyAuth.mockImplementation((mockReq, mockRes, params) => {
      if (params.authType == "User") {
        return { authorized: true, cause: "unauthorized" };
      } else {
        return { authorized: false, cause: "unauthorized" };
      }
    });
    jest
      .spyOn(transactions, "aggregate")
      .mockResolvedValue(retrievedTransactions);
    await getAllTransactions(mockReq, mockRes);
    expect(transactions.aggregate).not.toHaveBeenCalled();
    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith(expectedResponse);
  });

  test("Empty Request [getAllTransactions] - Test #3", async () => {
    const mockReq = {
      params: { username: "testuser" },
      cookies: {
        accessToken: "adminAccessTokenValid",
        refreshToken: "adminRefreshTokenValid",
      },
    };
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: {
        //The name can also be message, what matters is consistency with the one used in the code
        refreshedTokenMessage: "",
      },
    };
    const retrievedTransactions = [];
    const expectedResponse = {
      data: retrievedTransactions.map((v) =>
        Object.assign(
          {},
          {
            _id: v._id,
            username: v.username,
            amount: v.amount,
            type: v.type,
            color: v.categories_info.color,
            date: v.date,
          }
        )
      ),
      refreshedTokenMessage: "",
      message: "authorized",
    };
    verifyAuth.mockImplementation((mockReq, mockRes, params) => {
      if (params.authType == "User") {
        return { authorized: false, cause: "authorized" };
      } else {
        return { authorized: true, cause: "authorized" };
      }
    });
    jest
      .spyOn(transactions, "aggregate")
      .mockResolvedValue(retrievedTransactions);
    await getAllTransactions(mockReq, mockRes);
    expect(transactions.aggregate).toHaveBeenCalled();
    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.json).toHaveBeenCalledWith(expectedResponse);
  });

  test("Database Error Request [getAllTransactions] - Test #4", async () => {
    const mockReq = {
      params: { username: "testuser" },
      cookies: {
        accessToken: "adminAccessTokenValid",
        refreshToken: "adminRefreshTokenValid",
      },
    };
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: {
        //The name can also be message, what matters is consistency with the one used in the code
        refreshedTokenMessage: "",
      },
    };
    const expectedResponse = {
      refreshedTokenMessage: "",
      error: "Database Error",
    };
    verifyAuth.mockImplementation((mockReq, mockRes, params) => {
      if (params.authType == "User") {
        return { authorized: false, cause: "authorized" };
      } else {
        return { authorized: true, cause: "authorized" };
      }
    });
    jest.spyOn(transactions, "aggregate").mockImplementation(() => {
      throw new Error("Database Error");
    });
    await getAllTransactions(mockReq, mockRes);
    expect(transactions.aggregate).toHaveBeenCalled();
    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.json).toHaveBeenCalledWith(expectedResponse);
  });
});

describe("getTransactionsByUser", () => {
  test("Successful User Request [getTransactionsByUser] - Test #1", async () => {
    const mockReq = {
      params: { username: "Pippo" },
      cookies: {
        accessToken: "adminAccessTokenValid",
        refreshToken: "adminRefreshTokenValid",
      },
      url: "/api/users/Pippo/transactions",
    };
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: {
        //The name can also be message, what matters is consistency with the one used in the code
        refreshedTokenMessage: "",
      },
    };
    const retrievedTransactions = [
      {
        _id: 1,
        username: "Pippo",
        amount: 3500,
        type: "Personal",
        categories_info: { color: "testColor" },
        date: "2023/4/3",
      },
      {
        _id: 2,
        username: "Pippo",
        amount: 12000,
        type: "Personal",
        categories_info: { color: "testColor" },
        date: "2023/4/3",
      },
      {
        _id: 3,
        username: "Pippo",
        amount: 34,
        type: "Personal",
        categories_info: { color: "testColor" },
        date: "2023/4/3",
      },
    ];
    const expectedResponse = {
      data: retrievedTransactions.map((v) =>
        Object.assign(
          {},
          {
            _id: v._id,
            username: v.username,
            amount: v.amount,
            type: v.type,
            color: v.categories_info.color,
            date: v.date,
          }
        )
      ),
      refreshedTokenMessage: "",
      message: "authorized",
    };
    verifyAuth.mockImplementation((mockReq, mockRes, params) => {
      if (params.authType == "User") {
        return { authorized: true, cause: "authorized" };
      } else {
        return { authorized: false, cause: "unauthorized" };
      }
    });
    jest.spyOn(User, "findOne").mockReturnValue({
      username: "mockedUsername",
      email: "mockedEmail",
      role: "mockedRole",
    });
    jest
      .spyOn(transactions, "aggregate")
      .mockResolvedValue(retrievedTransactions);
    await getTransactionsByUser(mockReq, mockRes);
    expect(transactions.aggregate).toHaveBeenCalled();
    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.json).toHaveBeenCalledWith(expectedResponse);
  });

  test("Unauthorized User Request [getTransactionsByUser] - Test #2", async () => {
    const url_un = "Gianluca";
    const mockReq = {
      params: { username: url_un },
      cookies: {
        accessToken: "adminAccessTokenValid",
        refreshToken: "adminRefreshTokenValid",
      },
      url: "/api/users/" + url_un + "/transactions",
    };
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: {
        //The name can also be message, what matters is consistency with the one used in the code
        refreshedTokenMessage: "",
      },
    };
    const expectedResponse = {
      refreshedTokenMessage: "",
      message: "unauthorized",
    };
    verifyAuth.mockImplementation((mockReq, mockRes, params) => {
      if (params.authType == "User") {
        return { authorized: false, cause: "unauthorized" };
      } else {
        return { authorized: false, cause: "unauthorized" };
      }
    });
    jest.spyOn(User, "findOne").mockReturnValue({
      username: "mockedUsername",
      email: "mockedEmail",
      role: "mockedRole",
    });
    await getTransactionsByUser(mockReq, mockRes);
    expect(transactions.aggregate).not.toHaveBeenCalled();
    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith(expectedResponse);
  });

  test("Successful Admin Request [getTransactionsByUser] - Test #3", async () => {
    const url_un = "Pippo";
    const mockReq = {
      params: { username: url_un },
      cookies: {
        accessToken: "adminAccessTokenValid",
        refreshToken: "adminRefreshTokenValid",
      },
      url: "/api/transactions/users" + url_un,
    };
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: {
        //The name can also be message, what matters is consistency with the one used in the code
        refreshedTokenMessage: "",
      },
    };
    const retrievedTransactions = [
      {
        _id: 1,
        username: "Pippo",
        amount: 3500,
        type: "Personal",
        categories_info: { color: "testColor" },
        date: "2023/4/3",
      },
      {
        _id: 2,
        username: "Pippo",
        amount: 12000,
        type: "Personal",
        categories_info: { color: "testColor" },
        date: "2023/4/3",
      },
      {
        _id: 3,
        username: "Pippo",
        amount: 34,
        type: "Personal",
        categories_info: { color: "testColor" },
        date: "2023/4/3",
      },
    ];
    const expectedResponse = {
      data: retrievedTransactions.map((v) =>
        Object.assign(
          {},
          {
            _id: v._id,
            username: v.username,
            amount: v.amount,
            type: v.type,
            color: v.categories_info.color,
            date: v.date,
          }
        )
      ),
      refreshedTokenMessage: "",
      message: "authorized",
    };
    verifyAuth.mockImplementation((mockReq, mockRes, params) => {
      if (params.authType == "User") {
        return { authorized: false, cause: "unauthorized" };
      } else {
        return { authorized: true, cause: "authorized" };
      }
    });
    jest.spyOn(User, "findOne").mockReturnValue({
      username: "mockedUsername",
      email: "mockedEmail",
      role: "mockedRole",
    });
    jest
      .spyOn(transactions, "aggregate")
      .mockResolvedValue(retrievedTransactions);
    await getTransactionsByUser(mockReq, mockRes);
    expect(transactions.aggregate).toHaveBeenCalled();
    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.json).toHaveBeenCalledWith(expectedResponse);
  });

  test("Unauthorized Admin Request [getTransactionsByUser] - Test #3", async () => {
    const url_un = "Pippo";
    const mockReq = {
      params: { username: url_un },
      cookies: {
        accessToken: "adminAccessTokenValid",
        refreshToken: "adminRefreshTokenValid",
      },
      url: "/api/transactions/users" + url_un,
    };
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: {
        //The name can also be message, what matters is consistency with the one used in the code
        refreshedTokenMessage: "",
      },
    };
    const retrievedTransactions = [
      {
        _id: 1,
        username: "Pippo",
        amount: 3500,
        type: "Personal",
        categories_info: { color: "testColor" },
        date: "2023/4/3",
      },
      {
        _id: 2,
        username: "Pippo",
        amount: 12000,
        type: "Personal",
        categories_info: { color: "testColor" },
        date: "2023/4/3",
      },
      {
        _id: 3,
        username: "Pippo",
        amount: 34,
        type: "Personal",
        categories_info: { color: "testColor" },
        date: "2023/4/3",
      },
    ];
    const expectedResponse = {
      refreshedTokenMessage: "",
      message: "unauthorized",
    };
    verifyAuth.mockImplementation((mockReq, mockRes, params) => {
      if (params.authType == "User") {
        return { authorized: false, cause: "unauthorized" };
      } else {
        return { authorized: false, cause: "unauthorized" };
      }
    });
    jest.spyOn(User, "findOne").mockReturnValue({
      username: "mockedUsername",
      email: "mockedEmail",
      role: "mockedRole",
    });
    jest
      .spyOn(transactions, "aggregate")
      .mockResolvedValue(retrievedTransactions);
    await getTransactionsByUser(mockReq, mockRes);
    expect(transactions.aggregate).not.toHaveBeenCalled();
    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith(expectedResponse);
  });

  test("Inexistent User Request [getTransactionsByUser] - Test #4", async () => {
    const url_un = "Pippo";
    const mockReq = {
      params: { username: url_un },
      cookies: {
        accessToken: "adminAccessTokenValid",
        refreshToken: "adminRefreshTokenValid",
      },
      url: "/api/users/" + url_un + "/transactions",
    };
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: {
        //The name can also be message, what matters is consistency with the one used in the code
        refreshedTokenMessage: "",
      },
    };
    const retrievedTransactions = [
      {
        _id: 1,
        username: "Pippo",
        amount: 3500,
        type: "Personal",
        categories_info: { color: "testColor" },
        date: "2023/4/3",
      },
      {
        _id: 2,
        username: "Pippo",
        amount: 12000,
        type: "Personal",
        categories_info: { color: "testColor" },
        date: "2023/4/3",
      },
      {
        _id: 3,
        username: "Pippo",
        amount: 34,
        type: "Personal",
        categories_info: { color: "testColor" },
        date: "2023/4/3",
      },
    ];
    const expectedResponse = {
      refreshedTokenMessage: "",
      message: "User not found",
    };
    verifyAuth.mockImplementation((mockReq, mockRes, params) => {
      if (params.authType == "User") {
        return { authorized: false, cause: "unauthorized" };
      } else {
        return { authorized: true, cause: "authorized" };
      }
    });
    jest.spyOn(User, "findOne").mockReturnValue(undefined);
    jest
      .spyOn(transactions, "aggregate")
      .mockResolvedValue(retrievedTransactions);
    await getTransactionsByUser(mockReq, mockRes);
    expect(transactions.aggregate).not.toHaveBeenCalled();
    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith(expectedResponse);
  });

  test("Database Error Request [getTransactionsByUser] - Test #5", async () => {
    const url_un = "Pippo";
    const mockReq = {
      params: { username: url_un },
      cookies: {
        accessToken: "adminAccessTokenValid",
        refreshToken: "adminRefreshTokenValid",
      },
      url: "/api/users/" + url_un + "/transactions",
    };
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: {
        //The name can also be message, what matters is consistency with the one used in the code
        refreshedTokenMessage: "",
      },
    };
    const expectedResponse = {
      refreshedTokenMessage: "",
      error: "Database Error",
    };
    verifyAuth.mockImplementation((mockReq, mockRes, params) => {
      if (params.authType == "User") {
        return { authorized: true, cause: "authorized" };
      } else {
        return { authorized: false, cause: "unauthorized" };
      }
    });
    jest.spyOn(User, "findOne").mockReturnValue({
      username: "mockedUsername",
      email: "mockedEmail",
      role: "mockedRole",
    });
    jest.spyOn(transactions, "aggregate").mockImplementation(() => {
      throw new Error("Database Error");
    });
    await getTransactionsByUser(mockReq, mockRes);
    expect(transactions.aggregate).toHaveBeenCalled();
    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.json).toHaveBeenCalledWith(expectedResponse);
  });
});

describe("getTransactionsByUserByCategory", () => {
  test("Successful User Request [getTransactionsByUser] - Test #1", async () => {
    const mockReq = {
      params: { username: "Pippo" },
      cookies: {
        accessToken: "adminAccessTokenValid",
        refreshToken: "adminRefreshTokenValid",
      },
      url: "/api/users/Pippo/transactions",
    };
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: {
        //The name can also be message, what matters is consistency with the one used in the code
        refreshedTokenMessage: "",
      },
    };
    const retrievedTransactions = [
      {
        _id: 1,
        username: "Pippo",
        amount: 3500,
        type: "Personal",
        categories_info: { color: "testColor" },
        date: "2023/4/3",
      },
      {
        _id: 2,
        username: "Pippo",
        amount: 12000,
        type: "Personal",
        categories_info: { color: "testColor" },
        date: "2023/4/3",
      },
      {
        _id: 3,
        username: "Pippo",
        amount: 34,
        type: "Personal",
        categories_info: { color: "testColor" },
        date: "2023/4/3",
      },
    ];
    const expectedResponse = {
      data: retrievedTransactions.map((v) =>
        Object.assign(
          {},
          {
            _id: v._id,
            username: v.username,
            amount: v.amount,
            type: v.type,
            color: v.categories_info.color,
            date: v.date,
          }
        )
      ),
      refreshedTokenMessage: "",
      message: "authorized",
    };
    verifyAuth.mockImplementation((mockReq, mockRes, params) => {
      if (params.authType == "User") {
        return { authorized: true, cause: "authorized" };
      } else {
        return { authorized: false, cause: "unauthorized" };
      }
    });
    jest.spyOn(User, "findOne").mockReturnValue({
      username: "mockedUsername",
      email: "mockedEmail",
      role: "mockedRole",
    });
    jest.spyOn(categories, "findOne").mockReturnValue({
      type: "test",
      color: "testColor",
    });
    jest
      .spyOn(transactions, "aggregate")
      .mockResolvedValue(retrievedTransactions);
    await getTransactionsByUserByCategory(mockReq, mockRes);
    expect(transactions.aggregate).toHaveBeenCalled();
    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.json).toHaveBeenCalledWith(expectedResponse);
  });

  test("Unauthorized User Request [getTransactionsByUser] - Test #2", async () => {
    const url_un = "Gianluca";
    const mockReq = {
      params: { username: url_un },
      cookies: {
        accessToken: "adminAccessTokenValid",
        refreshToken: "adminRefreshTokenValid",
      },
      url: "/api/users/" + url_un + "/transactions",
    };
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: {
        //The name can also be message, what matters is consistency with the one used in the code
        refreshedTokenMessage: "",
      },
    };
    const expectedResponse = {
      refreshedTokenMessage: "",
      message: "unauthorized",
    };
    verifyAuth.mockImplementation((mockReq, mockRes, params) => {
      if (params.authType == "User") {
        return { authorized: false, cause: "unauthorized" };
      } else {
        return { authorized: false, cause: "unauthorized" };
      }
    });
    jest.spyOn(User, "findOne").mockReturnValue({
      username: "mockedUsername",
      email: "mockedEmail",
      role: "mockedRole",
    });
    jest.spyOn(categories, "findOne").mockReturnValue({
      type: "test",
      color: "testColor",
    });
    await getTransactionsByUserByCategory(mockReq, mockRes);
    expect(transactions.aggregate).not.toHaveBeenCalled();
    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith(expectedResponse);
  });

  test("Successful Admin Request [getTransactionsByUser] - Test #3", async () => {
    const url_un = "Pippo";
    const mockReq = {
      params: { username: url_un },
      cookies: {
        accessToken: "adminAccessTokenValid",
        refreshToken: "adminRefreshTokenValid",
      },
      url: "/api/transactions/users" + url_un,
    };
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: {
        //The name can also be message, what matters is consistency with the one used in the code
        refreshedTokenMessage: "",
      },
    };
    const retrievedTransactions = [
      {
        _id: 1,
        username: "Pippo",
        amount: 3500,
        type: "Personal",
        categories_info: { color: "testColor" },
        date: "2023/4/3",
      },
      {
        _id: 2,
        username: "Pippo",
        amount: 12000,
        type: "Personal",
        categories_info: { color: "testColor" },
        date: "2023/4/3",
      },
      {
        _id: 3,
        username: "Pippo",
        amount: 34,
        type: "Personal",
        categories_info: { color: "testColor" },
        date: "2023/4/3",
      },
    ];
    const expectedResponse = {
      data: retrievedTransactions.map((v) =>
        Object.assign(
          {},
          {
            _id: v._id,
            username: v.username,
            amount: v.amount,
            type: v.type,
            color: v.categories_info.color,
            date: v.date,
          }
        )
      ),
      refreshedTokenMessage: "",
      message: "authorized",
    };
    verifyAuth.mockImplementation((mockReq, mockRes, params) => {
      if (params.authType == "User") {
        return { authorized: false, cause: "unauthorized" };
      } else {
        return { authorized: true, cause: "authorized" };
      }
    });
    jest.spyOn(User, "findOne").mockReturnValue({
      select: jest.fn().mockResolvedValue({
        username: "mockedUsername",
        email: "mockedEmail",
        role: "mockedRole",
      }),
    });
    jest
      .spyOn(transactions, "aggregate")
      .mockResolvedValue(retrievedTransactions);
      jest.spyOn(User, "findOne").mockReturnValue({
        username: "mockedUsername",
        email: "mockedEmail",
        role: "mockedRole",
      });
      jest.spyOn(categories, "findOne").mockReturnValue({
        type: "test",
        color: "testColor",
      });
    await getTransactionsByUserByCategory(mockReq, mockRes);
    expect(transactions.aggregate).toHaveBeenCalled();
    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.json).toHaveBeenCalledWith(expectedResponse);
  });

  test("Unauthorized Admin Request [getTransactionsByUser] - Test #3", async () => {
    const url_un = "Pippo";
    const mockReq = {
      params: { username: url_un },
      cookies: {
        accessToken: "adminAccessTokenValid",
        refreshToken: "adminRefreshTokenValid",
      },
      url: "/api/transactions/users" + url_un,
    };
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: {
        //The name can also be message, what matters is consistency with the one used in the code
        refreshedTokenMessage: "",
      },
    };
    const retrievedTransactions = [
      {
        _id: 1,
        username: "Pippo",
        amount: 3500,
        type: "Personal",
        categories_info: { color: "testColor" },
        date: "2023/4/3",
      },
      {
        _id: 2,
        username: "Pippo",
        amount: 12000,
        type: "Personal",
        categories_info: { color: "testColor" },
        date: "2023/4/3",
      },
      {
        _id: 3,
        username: "Pippo",
        amount: 34,
        type: "Personal",
        categories_info: { color: "testColor" },
        date: "2023/4/3",
      },
    ];
    const expectedResponse = {
      refreshedTokenMessage: "",
      message: "unauthorized",
    };
    verifyAuth.mockImplementation((mockReq, mockRes, params) => {
      if (params.authType == "User") {
        return { authorized: false, cause: "unauthorized" };
      } else {
        return { authorized: false, cause: "unauthorized" };
      }
    });
    jest.spyOn(User, "findOne").mockReturnValue({
      select: jest.fn().mockResolvedValue({
        username: "mockedUsername",
        email: "mockedEmail",
        role: "mockedRole",
      }),
    });
    jest
      .spyOn(transactions, "aggregate")
      .mockResolvedValue(retrievedTransactions);
      jest.spyOn(User, "findOne").mockReturnValue({
        username: "mockedUsername",
        email: "mockedEmail",
        role: "mockedRole",
      });
      jest.spyOn(categories, "findOne").mockReturnValue({
        type: "test",
        color: "testColor",
      });
    await getTransactionsByUserByCategory(mockReq, mockRes);
    expect(transactions.aggregate).not.toHaveBeenCalled();
    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith(expectedResponse);
  });

  test("Inexistent User Request [getTransactionsByUser] - Test #4", async () => {
    const url_un = "Pippo";
    const mockReq = {
      params: { username: url_un },
      cookies: {
        accessToken: "adminAccessTokenValid",
        refreshToken: "adminRefreshTokenValid",
      },
      url: "/api/users/" + url_un + "/transactions",
    };
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: {
        //The name can also be message, what matters is consistency with the one used in the code
        refreshedTokenMessage: "",
      },
    };
    const retrievedTransactions = [
      {
        _id: 1,
        username: "Pippo",
        amount: 3500,
        type: "Personal",
        categories_info: { color: "testColor" },
        date: "2023/4/3",
      },
      {
        _id: 2,
        username: "Pippo",
        amount: 12000,
        type: "Personal",
        categories_info: { color: "testColor" },
        date: "2023/4/3",
      },
      {
        _id: 3,
        username: "Pippo",
        amount: 34,
        type: "Personal",
        categories_info: { color: "testColor" },
        date: "2023/4/3",
      },
    ];
    const expectedResponse = {
      refreshedTokenMessage: "",
      message: "User or category not found",
    };
    verifyAuth.mockImplementation((mockReq, mockRes, params) => {
      if (params.authType == "User") {
        return { authorized: false, cause: "unauthorized" };
      } else {
        return { authorized: true, cause: "authorized" };
      }
    });
    jest
      .spyOn(transactions, "aggregate")
      .mockResolvedValue(retrievedTransactions);
      jest.spyOn(User, "findOne").mockReturnValue(undefined);
      jest.spyOn(categories, "findOne").mockReturnValue({
        type: "test",
        color: "testColor",
      });
    await getTransactionsByUserByCategory(mockReq, mockRes);
    expect(transactions.aggregate).not.toHaveBeenCalled();
    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith(expectedResponse);
  });

  test("Database Error Request [getTransactionsByUser] - Test #5", async () => {
    const url_un = "Pippo";
    const mockReq = {
      params: { username: url_un },
      cookies: {
        accessToken: "adminAccessTokenValid",
        refreshToken: "adminRefreshTokenValid",
      },
      url: "/api/users/" + url_un + "/transactions",
    };
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: {
        //The name can also be message, what matters is consistency with the one used in the code
        refreshedTokenMessage: "",
      },
    };
    const expectedResponse = {
      refreshedTokenMessage: "",
      error: "Database Error",
    };
    verifyAuth.mockImplementation((mockReq, mockRes, params) => {
      if (params.authType == "User") {
        return { authorized: true, cause: "authorized" };
      } else {
        return { authorized: false, cause: "unauthorized" };
      }
    });
    jest.spyOn(User, "findOne").mockReturnValue({
      username: "mockedUsername",
      email: "mockedEmail",
      role: "mockedRole",
    });
    jest.spyOn(categories, "findOne").mockReturnValue({
      type: "test",
      color: "testColor",
    });
    jest.spyOn(transactions, "aggregate").mockImplementation(() => {
      throw new Error("Database Error");
    });
    await getTransactionsByUserByCategory(mockReq, mockRes);
    expect(transactions.aggregate).toHaveBeenCalled();
    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.json).toHaveBeenCalledWith(expectedResponse);
  });
});

describe("getTransactionsByGroup", () => {
  test("Successful User Request [getTransactionsByGroup] - Test #1", async () => {
    const groupName = "testGroup"
    const mockReq = {
      params: {name:groupName},
      cookies: {
        accessToken: "adminAccessTokenValid",
        refreshToken: "adminRefreshTokenValid",
      },
      url:"/api/groups/"+groupName+"/transactions"
    };
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: {
        //The name can also be message, what matters is consistency with the one used in the code
        refreshedTokenMessage: "",
      },
    };
    const retrievedTransactions = [
      {
        _id: 1,
        username: "Pippo",
        amount: 3500,
        type: "Personal",
        categories_info: { color: "testColor" },
        date: "2023/4/3",
      },
      {
        _id: 2,
        username: "Pippo",
        amount: 12000,
        type: "Personal",
        categories_info: { color: "testColor" },
        date: "2023/4/3",
      },
      {
        _id: 3,
        username: "Pippo",
        amount: 34,
        type: "Personal",
        categories_info: { color: "testColor" },
        date: "2023/4/3",
      },
    ];
    const expectedResponse = {
      data: retrievedTransactions.map((v) =>
        Object.assign(
          {},
          {
            _id: v._id,
            username: v.username,
            amount: v.amount,
            type: v.type,
            color: v.categories_info.color,
            date: v.date,
          }
        )
      ),

      refreshedTokenMessage: "",
      message: "authorized",
    };
    verifyAuth.mockImplementation((mockReq, mockRes, params) => {
      if (params.authType == "Group") {
        return { authorized: true, cause: "authorized" };
      } else {
        return { authorized: false, cause: "unauthorized" };
      }
    });
    jest
      .spyOn(transactions, "aggregate")
      .mockResolvedValue(retrievedTransactions);
    jest.spyOn(Group, "findOne").mockResolvedValue(new Group());
    jest.spyOn(User, "find").mockResolvedValue([new User(), new User()]);
    await getTransactionsByGroup(mockReq, mockRes);
    expect(transactions.aggregate).toHaveBeenCalled();
    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.json).toHaveBeenCalledWith(expectedResponse);
  });

  test("Unauthorized User Request [getTransactionsByGroup] - Test #2", async () => {
    const groupName = "testGroup"
    const mockReq = {
      params: {name:groupName},
      cookies: {
        accessToken: "adminAccessTokenValid",
        refreshToken: "adminRefreshTokenValid",
      },
      url:"/api/groups/"+groupName+"/transactions"
    };
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: {
        //The name can also be message, what matters is consistency with the one used in the code
        refreshedTokenMessage: "",
      },
    };
    const retrievedTransactions = [
      {
        _id: 1,
        username: "Pippo",
        amount: 3500,
        type: "Personal",
        categories_info: { color: "testColor" },
        date: "2023/4/3",
      },
      {
        _id: 2,
        username: "Pippo",
        amount: 12000,
        type: "Personal",
        categories_info: { color: "testColor" },
        date: "2023/4/3",
      },
      {
        _id: 3,
        username: "Pippo",
        amount: 34,
        type: "Personal",
        categories_info: { color: "testColor" },
        date: "2023/4/3",
      },
    ];
    const expectedResponse = {
      refreshedTokenMessage: "",
      message: "unauthorized",
    };
    verifyAuth.mockImplementation((mockReq, mockRes, params) => {
      if (params.authType == "Group") {
        return { authorized: false, cause: "unauthorized" };
      } else {
        return { authorized: false, cause: "unauthorized" };
      }
    });
    jest
      .spyOn(transactions, "aggregate")
      .mockResolvedValue(retrievedTransactions);
    jest.spyOn(Group, "findOne").mockResolvedValue(new Group());
    jest.spyOn(User, "find").mockResolvedValue([new User(), new User()]);
    await getTransactionsByGroup(mockReq, mockRes);
    expect(transactions.aggregate).not.toHaveBeenCalled();
    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith(expectedResponse);
  });

  test("Successful Admin Request [getTransactionsByGroup] - Test #3", async () => {
    const groupName = "testGroup"
    const mockReq = {
      params: {name:groupName},
      cookies: {
        accessToken: "adminAccessTokenValid",
        refreshToken: "adminRefreshTokenValid",
      },
      url:"/api/transactions/groups/"+groupName
    };
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: {
        //The name can also be message, what matters is consistency with the one used in the code
        refreshedTokenMessage: "",
      },
    };
    const retrievedTransactions = [
      {
        _id: 1,
        username: "Pippo",
        amount: 3500,
        type: "Personal",
        categories_info: { color: "testColor" },
        date: "2023/4/3",
      },
      {
        _id: 2,
        username: "Pippo",
        amount: 12000,
        type: "Personal",
        categories_info: { color: "testColor" },
        date: "2023/4/3",
      },
      {
        _id: 3,
        username: "Pippo",
        amount: 34,
        type: "Personal",
        categories_info: { color: "testColor" },
        date: "2023/4/3",
      },
    ];
    const expectedResponse = {
      data: retrievedTransactions.map((v) =>
        Object.assign(
          {},
          {
            _id: v._id,
            username: v.username,
            amount: v.amount,
            type: v.type,
            color: v.categories_info.color,
            date: v.date,
          }
        )
      ),
      refreshedTokenMessage: "",
      message: "authorized",
    };
    verifyAuth.mockImplementation((mockReq, mockRes, params) => {
      if (params.authType == "Group") {
        return { authorized: false, cause: "unauthorized" };
      } else {
        return { authorized: true, cause: "authorized" };
      }
    });
    jest
      .spyOn(transactions, "aggregate")
      .mockResolvedValue(retrievedTransactions);
    jest.spyOn(Group, "findOne").mockResolvedValue(new Group());
    jest.spyOn(User, "find").mockResolvedValue([new User(), new User()]);
    await getTransactionsByGroup(mockReq, mockRes);
    expect(transactions.aggregate).toHaveBeenCalled();
    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.json).toHaveBeenCalledWith(expectedResponse);
  });

  test("Unauthorized Admin Request [getTransactionsByGroup] - Test #4", async () => {
    const groupName = "testGroup"
    const mockReq = {
      params: {name:groupName},
      cookies: {
        accessToken: "adminAccessTokenValid",
        refreshToken: "adminRefreshTokenValid",
      },
      url:"/api/transactions/groups/"+groupName
    };
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: {
        //The name can also be message, what matters is consistency with the one used in the code
        refreshedTokenMessage: "",
      },
    };
    const retrievedTransactions = [
      {
        _id: 1,
        username: "Pippo",
        amount: 3500,
        type: "Personal",
        categories_info: { color: "testColor" },
        date: "2023/4/3",
      },
      {
        _id: 2,
        username: "Pippo",
        amount: 12000,
        type: "Personal",
        categories_info: { color: "testColor" },
        date: "2023/4/3",
      },
      {
        _id: 3,
        username: "Pippo",
        amount: 34,
        type: "Personal",
        categories_info: { color: "testColor" },
        date: "2023/4/3",
      },
    ];
    const expectedResponse = {
      refreshedTokenMessage: "",
      message: "unauthorized",
    };
    verifyAuth.mockImplementation((mockReq, mockRes, params) => {
      if (params.authType == "Group") {
        return { authorized: false, cause: "unauthorized" };
      } else {
        return { authorized: false, cause: "unauthorized" };
      }
    });
    jest
      .spyOn(transactions, "aggregate")
      .mockResolvedValue(retrievedTransactions);
    jest.spyOn(Group, "findOne").mockResolvedValue(new Group());
    jest.spyOn(User, "find").mockResolvedValue([new User(), new User()]);
    await getTransactionsByGroup(mockReq, mockRes);
    expect(transactions.aggregate).not.toHaveBeenCalled();
    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith(expectedResponse);
  });

  test("Inexistent Group Request [getTransactionsByGroup] - Test #5", async () => {
    const groupName = "testGroup"
    const mockReq = {
      params: {name:groupName},
      cookies: {
        accessToken: "adminAccessTokenValid",
        refreshToken: "adminRefreshTokenValid",
      },
      url:"/api/groups/"+groupName+"/transactions"
    };
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: {
        //The name can also be message, what matters is consistency with the one used in the code
        refreshedTokenMessage: "",
      },
    };
    const expectedResponse = {
      refreshedTokenMessage: "",
      message: "Group not found",
    };
    jest.spyOn(Group, "findOne").mockResolvedValue(undefined);
    await getTransactionsByGroup(mockReq, mockRes);
    expect(transactions.aggregate).not.toHaveBeenCalled();
    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith(expectedResponse);
  });

  test("Database Error (Group) Request [getTransactionsByGroup] - Test #6", async () => {
    const groupName = "testGroup"
    const mockReq = {
      params: {name:groupName},
      cookies: {
        accessToken: "adminAccessTokenValid",
        refreshToken: "adminRefreshTokenValid",
      },
      url:"/api/groups/"+groupName+"/transactions"
    };
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: {
        //The name can also be message, what matters is consistency with the one used in the code
        refreshedTokenMessage: "",
      },
    };
    const expectedResponse = {
      refreshedTokenMessage: "",
      refreshedTokenMessage: "",
      error: "Database Error",
    };
    jest.spyOn(Group, "findOne").mockImplementation(() => {
      throw new Error("Database Error");
    });
    await getTransactionsByGroup(mockReq, mockRes);
    expect(transactions.aggregate).not.toHaveBeenCalled();
    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.json).toHaveBeenCalledWith(expectedResponse);
  });

  test("Database Error (User) Request [getTransactionsByGroup] - Test #7", async () => {
    const groupName = "testGroup"
    const mockReq = {
      params: {name:groupName},
      cookies: {
        accessToken: "adminAccessTokenValid",
        refreshToken: "adminRefreshTokenValid",
      },
      url:"/api/groups/"+groupName+"/transactions"
    };
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: {
        //The name can also be message, what matters is consistency with the one used in the code
        refreshedTokenMessage: "",
      },
    };
    const expectedResponse = {
      refreshedTokenMessage: "",
      error: "Database Error",
    };
    jest.spyOn(User, "find").mockImplementation(() => {
      throw new Error("Database Error");
    });
    jest.spyOn(Group, "findOne").mockResolvedValue(new Group());
    await getTransactionsByGroup(mockReq, mockRes);
    expect(transactions.aggregate).not.toHaveBeenCalled();
    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.json).toHaveBeenCalledWith(expectedResponse);
  });

  test("Database Error (Aggregate) Request [getTransactionsByGroup] - Test #8", async () => {
    const groupName = "testGroup"
    const mockReq = {
      params: {name:groupName},
      cookies: {
        accessToken: "adminAccessTokenValid",
        refreshToken: "adminRefreshTokenValid",
      },
      url:"/api/groups/"+groupName+"/transactions"
    };
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: {
        //The name can also be message, what matters is consistency with the one used in the code
        refreshedTokenMessage: "",
      },
    };
    const expectedResponse = {
      refreshedTokenMessage: "",
      error: "Database Error",
    };
    verifyAuth.mockImplementation((mockReq, mockRes, params) => {
      if (params.authType == "Group") {
        return { authorized: true, cause: "authorized" };
      } else {
        return { authorized: false, cause: "unauthorized" };
      }
    });
    jest.spyOn(transactions, "aggregate").mockImplementation(() => {
      throw new Error("Database Error");
    });
    jest.spyOn(Group, "findOne").mockResolvedValue(new Group());
    jest.spyOn(User, "find").mockResolvedValue([new User(), new User()]);
    await getTransactionsByGroup(mockReq, mockRes);
    //expect(transactions.aggregate).not.toHaveBeenCalled();
    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.json).toHaveBeenCalledWith(expectedResponse);
  });
});

describe("getTransactionsByGroupByCategory", () => {
  test("Successful User Request [getTransactionsByGroup] - Test #1", async () => {
    const groupName = "testGroup"
    const mockReq = {
      params: {name:groupName},
      cookies: {
        accessToken: "adminAccessTokenValid",
        refreshToken: "adminRefreshTokenValid",
      },
      url:"/api/groups/"+groupName+"/transactions"
    };
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: {
        //The name can also be message, what matters is consistency with the one used in the code
        refreshedTokenMessage: "",
      },
    };
    const retrievedTransactions = [
      {
        _id: 1,
        username: "Pippo",
        amount: 3500,
        type: "Personal",
        categories_info: { color: "testColor" },
        date: "2023/4/3",
      },
      {
        _id: 2,
        username: "Pippo",
        amount: 12000,
        type: "Personal",
        categories_info: { color: "testColor" },
        date: "2023/4/3",
      },
      {
        _id: 3,
        username: "Pippo",
        amount: 34,
        type: "Personal",
        categories_info: { color: "testColor" },
        date: "2023/4/3",
      },
    ];
    const expectedResponse = {
      data: retrievedTransactions.map((v) =>
        Object.assign(
          {},
          {
            _id: v._id,
            username: v.username,
            amount: v.amount,
            type: v.type,
            color: v.categories_info.color,
            date: v.date,
          }
        )
      ),

      refreshedTokenMessage: "",
      message: "authorized",
    };
    verifyAuth.mockImplementation((mockReq, mockRes, params) => {
      if (params.authType == "Group") {
        return { authorized: true, cause: "authorized" };
      } else {
        return { authorized: false, cause: "unauthorized" };
      }
    });
    jest
      .spyOn(transactions, "aggregate")
      .mockResolvedValue(retrievedTransactions);
    jest.spyOn(Group, "findOne").mockResolvedValue(new Group());
    jest.spyOn(categories, "findOne").mockResolvedValue(new categories());
    jest.spyOn(User, "find").mockResolvedValue([new User(), new User()]);
    await getTransactionsByGroupByCategory(mockReq, mockRes);
    expect(transactions.aggregate).toHaveBeenCalled();
    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.json).toHaveBeenCalledWith(expectedResponse);
  });

  test("Unauthorized User Request [getTransactionsByGroup] - Test #2", async () => {
    const groupName = "testGroup"
    const mockReq = {
      params: {name:groupName},
      cookies: {
        accessToken: "adminAccessTokenValid",
        refreshToken: "adminRefreshTokenValid",
      },
      url:"/api/groups/"+groupName+"/transactions"
    };
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: {
        //The name can also be message, what matters is consistency with the one used in the code
        refreshedTokenMessage: "",
      },
    };
    const retrievedTransactions = [
      {
        _id: 1,
        username: "Pippo",
        amount: 3500,
        type: "Personal",
        categories_info: { color: "testColor" },
        date: "2023/4/3",
      },
      {
        _id: 2,
        username: "Pippo",
        amount: 12000,
        type: "Personal",
        categories_info: { color: "testColor" },
        date: "2023/4/3",
      },
      {
        _id: 3,
        username: "Pippo",
        amount: 34,
        type: "Personal",
        categories_info: { color: "testColor" },
        date: "2023/4/3",
      },
    ];
    const expectedResponse = {
      refreshedTokenMessage: "",
      message: "unauthorized",
    };
    verifyAuth.mockImplementation((mockReq, mockRes, params) => {
      if (params.authType == "Group") {
        return { authorized: false, cause: "unauthorized" };
      } else {
        return { authorized: false, cause: "unauthorized" };
      }
    });
    jest
      .spyOn(transactions, "aggregate")
      .mockResolvedValue(retrievedTransactions);
    jest.spyOn(Group, "findOne").mockResolvedValue(new Group());
    jest.spyOn(categories, "findOne").mockResolvedValue(new categories());
    jest.spyOn(User, "find").mockResolvedValue([new User(), new User()]);
    await getTransactionsByGroupByCategory(mockReq, mockRes);
    expect(transactions.aggregate).not.toHaveBeenCalled();
    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith(expectedResponse);
  });

  test("Successful Admin Request [getTransactionsByGroup] - Test #3", async () => {
    const groupName = "testGroup"
    const mockReq = {
      params: {name:groupName},
      cookies: {
        accessToken: "adminAccessTokenValid",
        refreshToken: "adminRefreshTokenValid",
      },
      url:"/api/transactions/groups/"+groupName
    };
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: {
        //The name can also be message, what matters is consistency with the one used in the code
        refreshedTokenMessage: "",
      },
    };
    const retrievedTransactions = [
      {
        _id: 1,
        username: "Pippo",
        amount: 3500,
        type: "Personal",
        categories_info: { color: "testColor" },
        date: "2023/4/3",
      },
      {
        _id: 2,
        username: "Pippo",
        amount: 12000,
        type: "Personal",
        categories_info: { color: "testColor" },
        date: "2023/4/3",
      },
      {
        _id: 3,
        username: "Pippo",
        amount: 34,
        type: "Personal",
        categories_info: { color: "testColor" },
        date: "2023/4/3",
      },
    ];
    const expectedResponse = {
      data: retrievedTransactions.map((v) =>
        Object.assign(
          {},
          {
            _id: v._id,
            username: v.username,
            amount: v.amount,
            type: v.type,
            color: v.categories_info.color,
            date: v.date,
          }
        )
      ),
      refreshedTokenMessage: "",
      message: "authorized",
    };
    verifyAuth.mockImplementation((mockReq, mockRes, params) => {
      if (params.authType == "Group") {
        return { authorized: false, cause: "unauthorized" };
      } else {
        return { authorized: true, cause: "authorized" };
      }
    });
    jest
      .spyOn(transactions, "aggregate")
      .mockResolvedValue(retrievedTransactions);
    jest.spyOn(Group, "findOne").mockResolvedValue(new Group());
    jest.spyOn(categories, "findOne").mockResolvedValue(new categories());
    jest.spyOn(User, "find").mockResolvedValue([new User(), new User()]);
    await getTransactionsByGroupByCategory(mockReq, mockRes);
    expect(transactions.aggregate).toHaveBeenCalled();
    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.json).toHaveBeenCalledWith(expectedResponse);
  });

  test("Unauthorized Admin Request [getTransactionsByGroup] - Test #4", async () => {
    const groupName = "testGroup"
    const mockReq = {
      params: {name:groupName},
      cookies: {
        accessToken: "adminAccessTokenValid",
        refreshToken: "adminRefreshTokenValid",
      },
      url:"/api/transactions/groups/"+groupName
    };
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: {
        //The name can also be message, what matters is consistency with the one used in the code
        refreshedTokenMessage: "",
      },
    };
    const retrievedTransactions = [
      {
        _id: 1,
        username: "Pippo",
        amount: 3500,
        type: "Personal",
        categories_info: { color: "testColor" },
        date: "2023/4/3",
      },
      {
        _id: 2,
        username: "Pippo",
        amount: 12000,
        type: "Personal",
        categories_info: { color: "testColor" },
        date: "2023/4/3",
      },
      {
        _id: 3,
        username: "Pippo",
        amount: 34,
        type: "Personal",
        categories_info: { color: "testColor" },
        date: "2023/4/3",
      },
    ];
    const expectedResponse = {
      refreshedTokenMessage: "",
      message: "unauthorized",
    };
    verifyAuth.mockImplementation((mockReq, mockRes, params) => {
      if (params.authType == "Group") {
        return { authorized: false, cause: "unauthorized" };
      } else {
        return { authorized: false, cause: "unauthorized" };
      }
    });
    jest
      .spyOn(transactions, "aggregate")
      .mockResolvedValue(retrievedTransactions);
    jest.spyOn(Group, "findOne").mockResolvedValue(new Group());
    jest.spyOn(categories, "findOne").mockResolvedValue(new categories());
    jest.spyOn(User, "find").mockResolvedValue([new User(), new User()]);
    await getTransactionsByGroupByCategory(mockReq, mockRes);
    expect(transactions.aggregate).not.toHaveBeenCalled();
    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith(expectedResponse);
  });

  test("Inexistent Group Request [getTransactionsByGroup] - Test #5", async () => {
    const groupName = "testGroup"
    const mockReq = {
      params: {name:groupName},
      cookies: {
        accessToken: "adminAccessTokenValid",
        refreshToken: "adminRefreshTokenValid",
      },
      url:"/api/groups/"+groupName+"/transactions"
    };
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: {
        //The name can also be message, what matters is consistency with the one used in the code
        refreshedTokenMessage: "",
      },
    };
    const expectedResponse = {
      refreshedTokenMessage: "",
      message: "Group or category not found",
    };
    jest.spyOn(Group, "findOne").mockResolvedValue(undefined);
    jest.spyOn(categories, "findOne").mockResolvedValue(new categories());
    await getTransactionsByGroupByCategory(mockReq, mockRes);
    expect(transactions.aggregate).not.toHaveBeenCalled();
    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith(expectedResponse);
  });

  test("Database Error (Group) Request [getTransactionsByGroup] - Test #6", async () => {
    const groupName = "testGroup"
    const mockReq = {
      params: {name:groupName},
      cookies: {
        accessToken: "adminAccessTokenValid",
        refreshToken: "adminRefreshTokenValid",
      },
      url:"/api/groups/"+groupName+"/transactions"
    };
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: {
        //The name can also be message, what matters is consistency with the one used in the code
        refreshedTokenMessage: "",
      },
    };
    const expectedResponse = {
      refreshedTokenMessage: "",
      refreshedTokenMessage: "",
      error: "Database Error",
    };
    jest.spyOn(Group, "findOne").mockImplementation(() => {
      throw new Error("Database Error");
    });
    jest.spyOn(categories, "findOne").mockResolvedValue(new categories());
    await getTransactionsByGroupByCategory(mockReq, mockRes);
    expect(transactions.aggregate).not.toHaveBeenCalled();
    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.json).toHaveBeenCalledWith(expectedResponse);
  });

  test("Database Error (User) Request [getTransactionsByGroup] - Test #7", async () => {
    const groupName = "testGroup"
    const mockReq = {
      params: {name:groupName},
      cookies: {
        accessToken: "adminAccessTokenValid",
        refreshToken: "adminRefreshTokenValid",
      },
      url:"/api/groups/"+groupName+"/transactions"
    };
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: {
        //The name can also be message, what matters is consistency with the one used in the code
        refreshedTokenMessage: "",
      },
    };
    const expectedResponse = {
      refreshedTokenMessage: "",
      error: "Database Error",
    };
    jest.spyOn(User, "find").mockImplementation(() => {
      throw new Error("Database Error");
    });
    jest.spyOn(Group, "findOne").mockResolvedValue(new Group());
    jest.spyOn(categories, "findOne").mockResolvedValue(new categories());
    await getTransactionsByGroupByCategory(mockReq, mockRes);
    expect(transactions.aggregate).not.toHaveBeenCalled();
    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.json).toHaveBeenCalledWith(expectedResponse);
  });

  test("Database Error (Aggregate) Request [getTransactionsByGroup] - Test #8", async () => {
    const groupName = "testGroup"
    const mockReq = {
      params: {name:groupName},
      cookies: {
        accessToken: "adminAccessTokenValid",
        refreshToken: "adminRefreshTokenValid",
      },
      url:"/api/groups/"+groupName+"/transactions"
    };
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: {
        //The name can also be message, what matters is consistency with the one used in the code
        refreshedTokenMessage: "",
      },
    };
    const expectedResponse = {
      refreshedTokenMessage: "",
      error: "Database Error",
    };
    verifyAuth.mockImplementation((mockReq, mockRes, params) => {
      if (params.authType == "Group") {
        return { authorized: true, cause: "authorized" };
      } else {
        return { authorized: false, cause: "unauthorized" };
      }
    });
    jest.spyOn(transactions, "aggregate").mockImplementation(() => {
      throw new Error("Database Error");
    });
    jest.spyOn(categories, "findOne").mockResolvedValue(new categories());
    jest.spyOn(Group, "findOne").mockResolvedValue(new Group());
    jest.spyOn(User, "find").mockResolvedValue([new User(), new User()]);
    await getTransactionsByGroupByCategory(mockReq, mockRes);
    expect(transactions.aggregate).toHaveBeenCalled();
    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.json).toHaveBeenCalledWith(expectedResponse);
  });
});

describe("deleteTransaction", () => {
  test("Successful delete Transaction [deleteTransaction] - Test #1", async () => {
    const testTransaction = {
      username: "Pippo",
      amount: 3500,
      type: "test",
    };
    const expectedResponse = {
      data: testTransaction,
      refreshedTokenMessage: "",
      message: "Transaction deleted",
    };
    const mockReq = {
      body: { _id: "testID" },
      params: { username: "Pippo" },
      cookies: {
        accessToken: "adminAccessTokenValid",
        refreshToken: "adminRefreshTokenValid",
      },
    };
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: {
        //The name can also be message, what matters is consistency with the one used in the code
        refreshedTokenMessage: "",
      },
    };
    jest.spyOn(transactions, "findOne").mockResolvedValue(testTransaction);
    jest.spyOn(User, "findOne").mockResolvedValue(new User());
    jest.spyOn(transactions, "deleteOne").mockResolvedValue(testTransaction);
    verifyAuth.mockImplementation((mockReq, mockRes, params) => {
      if (params.authType == "User") {
        return { authorized: true, cause: "authorized" };
      } else {
        return { authorized: false, cause: "unauthorized" };
      }
    });
    await deleteTransaction(mockReq, mockRes);
    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.json).toHaveBeenCalledWith(expectedResponse);
  });

  test("Unauthorized User [deleteTransaction] - Test #2", async () => {
    const testTransaction = {
      username: "Pippo",
      amount: 3500,
      type: "Personal",
    };
    const expectedResponse = {
      refreshedTokenMessage: "",
      message: "Unauthorized",
    };
    const mockReq = {
      body: { _id: "test" },
      params: { username: "Pippo" },
      cookies: {
        accessToken: "adminAccessTokenValid",
        refreshToken: "adminRefreshTokenValid",
      },
    };
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: {
        //The name can also be message, what matters is consistency with the one used in the code
        refreshedTokenMessage: "",
      },
    };

    jest.spyOn(transactions, "deleteOne").mockResolvedValue(testTransaction);
    jest.spyOn(transactions, "findOne").mockResolvedValue(testTransaction);
    jest.spyOn(User, "findOne").mockResolvedValue(new User());
    jest.spyOn(transactions, "deleteOne").mockResolvedValue(testTransaction);
    verifyAuth.mockImplementation((mockReq, mockRes, params) => {
      if (params.authType == "User") {
        return { authorized: false, cause: "unauthorized" };
      } else {
        return { authorized: false, cause: "unauthorized" };
      }
    });
    await deleteTransaction(mockReq, mockRes);
    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith(expectedResponse);
  });
  
  test("User or transaction not found [deleteTransaction] - Test #1", async () => {
    const testTransaction = {
      username: "Pippo",
      amount: 3500,
      type: "test",
    };
    const expectedResponse = {
      refreshedTokenMessage: "",
      message: "User or transaction not found",
    };
    const mockReq = {
      body: { _id: "testID" },
      params: { username: "Pippo" },
      cookies: {
        accessToken: "adminAccessTokenValid",
        refreshToken: "adminRefreshTokenValid",
      },
    };
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: {
        //The name can also be message, what matters is consistency with the one used in the code
        refreshedTokenMessage: "",
      },
    };
    jest.spyOn(transactions, "findOne").mockResolvedValue(undefined);
    jest.spyOn(User, "findOne").mockResolvedValue(undefined);
    jest.spyOn(transactions, "deleteOne").mockResolvedValue(testTransaction);
    verifyAuth.mockImplementation((mockReq, mockRes, params) => {
      if (params.authType == "User") {
        return { authorized: true, cause: "authorized" };
      } else {
        return { authorized: false, cause: "unauthorized" };
      }
    });
    await deleteTransaction(mockReq, mockRes);
    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith(expectedResponse);
  });

  test("Successful Admin transaction for different users [deleteTransaction] - Test #3", async () => {
    const testTransaction = {
      username: "Pippo",
      amount: 3500,
      type: "Personal",
    };
    const expectedResponse = {
      data: testTransaction,
      refreshedTokenMessage: "",
      message: "Transaction deleted",
    };
    const mockReq = {
      body: { _id: "test" },
      params: { username: "Gianluca" },
      cookies: {
        accessToken: "adminAccessTokenValid",
        refreshToken: "adminRefreshTokenValid",
      },
    };
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: {
        //The name can also be message, what matters is consistency with the one used in the code
        refreshedTokenMessage: "",
      },
    };
    jest.spyOn(transactions, "findOne").mockResolvedValue(testTransaction);
    jest.spyOn(User, "findOne").mockResolvedValue(new User());
    jest.spyOn(transactions, "deleteOne").mockResolvedValue(testTransaction);
    verifyAuth.mockImplementation((mockReq, mockRes, params) => {
      if (params.authType == "User") {
        return { authorized: false, cause: "unauthorized" };
      } else {
        return { authorized: true, cause: "authorized" };
      }
    });
    await deleteTransaction(mockReq, mockRes);
    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.json).toHaveBeenCalledWith(expectedResponse);
  });

  test("Missing transaction attributes [deleteTransaction] - Test #4", async () => {
    const testTransaction = {
      username: "Pippo",
      amount: 3500,
    };
    const expectedResponse = {};
    const mockReq = {
      body: {},
      params: { username: "Pippo" },
      cookies: {
        accessToken: "adminAccessTokenValid",
        refreshToken: "adminRefreshTokenValid",
      },
    };
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: {
        //The name can also be message, what matters is consistency with the one used in the code
        refreshedTokenMessage: "",
      },
    };

    jest.spyOn(transactions, "findOne").mockResolvedValue(testTransaction);
    jest.spyOn(User, "findOne").mockResolvedValue(new User());
    jest.spyOn(transactions, "deleteOne").mockResolvedValue(testTransaction);
    verifyAuth.mockImplementation(() => {
      return { authorized: true, cause: "authorized" };
    });
    await deleteTransaction(mockReq, mockRes);
    expect(mockRes.status).toHaveBeenCalledWith(400);
    //expect(mockRes.json).toHaveBeenCalledWith(expectedResponse);
  });

  test("Database Error Transaction Request [deleteTransaction] - Test #5", async () => {
    const expectedResponse = {
      refreshedTokenMessage: "",
      error: "Database Error",
    };
    const mockReq = {
      body: { _id: "test" },
      params: { username: "Pippo" },
      cookies: {
        accessToken: "adminAccessTokenValid",
        refreshToken: "adminRefreshTokenValid",
      },
    };
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: {
        //The name can also be message, what matters is consistency with the one used in the code
        refreshedTokenMessage: "",
      },
    };
    jest.spyOn(transactions, "findOne").mockResolvedValue(new transactions());
    jest.spyOn(User, "findOne").mockResolvedValue(new User());
    jest.spyOn(transactions, "deleteOne").mockImplementation(() => {
      throw new Error("Database Error");
    });
    verifyAuth.mockImplementation((mockReq, mockRes, params) => {
      if (params.authType == "User") {
        return { authorized: true, cause: "authorized" };
      } else {
        return { authorized: false, cause: "unauthorized" };
      }
    });
    await deleteTransaction(mockReq, mockRes);
    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.json).toHaveBeenCalledWith(expectedResponse);
  });
});

describe("deleteTransactions", () => {
  test("Successful Request [deleteTransactions] - Test #1", async () => {
    const mockReq = {
      body: { _ids: ["testID1", "testID2", "testID3"] },
      params: { username: "testuser" },
      cookies: {
        accessToken: "adminAccessTokenValid",
        refreshToken: "adminRefreshTokenValid",
      },
    };
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: {
        //The name can also be message, what matters is consistency with the one used in the code
        refreshedTokenMessage: "",
      },
    };
    const testTransactions = [
      {
        _id: 1,
        username: "Pippo",
        amount: 3500,
        type: "Personal",
        categories_info: { color: "testColor" },
        date: "2023/4/3",
      },
      {
        _id: 2,
        username: "Pippo",
        amount: 12000,
        type: "Personal",
        categories_info: { color: "testColor" },
        date: "2023/4/3",
      },
      {
        _id: 3,
        username: "Pippo",
        amount: 34,
        type: "Personal",
        categories_info: { color: "testColor" },
        date: "2023/4/3",
      },
    ];
    const expectedResponse = {
      data: testTransactions,
      refreshedTokenMessage: "",
      message: "Transactions deleted",
    };
    verifyAuth.mockImplementation((mockReq, mockRes, params) => {
      if (params.authType == "User") {
        return { authorized: false, cause: "authorized" };
      } else {
        return { authorized: true, cause: "authorized" };
      }
    });
    jest.spyOn(transactions, "findOne").mockResolvedValue(new transactions());
    jest.spyOn(transactions, "deleteMany").mockResolvedValue(testTransactions);
    await deleteTransactions(mockReq, mockRes);
    //expect(transactions.deleteOne).toHaveBeenCalled();
    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.json).toHaveBeenCalledWith(expectedResponse);
  });

  test("Unauthorized Request [deleteTransactions] - Test #2", async () => {
    const mockReq = {
      body: { _ids: ["testID1", "testID2", "testID3"] },
      params: { username: "testuser" },
      cookies: {
        accessToken: "adminAccessTokenValid",
        refreshToken: "adminRefreshTokenValid",
      },
    };
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: {
        //The name can also be message, what matters is consistency with the one used in the code
        refreshedTokenMessage: "",
      },
    };
    const testTransactions = [
      {
        _id: 1,
        username: "Pippo",
        amount: 3500,
        type: "Personal",
        categories_info: { color: "testColor" },
        date: "2023/4/3",
      },
      {
        _id: 2,
        username: "Pippo",
        amount: 12000,
        type: "Personal",
        categories_info: { color: "testColor" },
        date: "2023/4/3",
      },
      {
        _id: 3,
        username: "Pippo",
        amount: 34,
        type: "Personal",
        categories_info: { color: "testColor" },
        date: "2023/4/3",
      },
    ];
    const expectedResponse = {
      refreshedTokenMessage: "",
      message: "Unauthorized",
    };
    verifyAuth.mockImplementation((mockReq, mockRes, params) => {
      if (params.authType == "User") {
        return { authorized: false, cause: "unauthorized" };
      } else {
        return { authorized: false, cause: "unauthorized" };
      }
    });
    jest.spyOn(transactions, "findOne").mockResolvedValue(new transactions());
    jest.spyOn(User, "findOne").mockResolvedValue(new User());
    jest.spyOn(transactions, "deleteMany").mockResolvedValue(testTransactions);
    await deleteTransactions(mockReq, mockRes);
    //expect(transactions.deleteOne).toHaveBeenCalled();
    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith(expectedResponse);
  });

  test("Invalid ID [deleteTransactions] - Test #3", async () => {
    const mockReq = {
      body: { _ids: ["testID1", "testID2", "testID3"] },
      params: { username: "testuser" },
      cookies: {
        accessToken: "adminAccessTokenValid",
        refreshToken: "adminRefreshTokenValid",
      },
    };
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: {
        //The name can also be message, what matters is consistency with the one used in the code
        refreshedTokenMessage: "",
      },
    };
    const testTransactions = [
      {
        _id: 1,
        username: "Pippo",
        amount: 3500,
        type: "Personal",
        categories_info: { color: "testColor" },
        date: "2023/4/3",
      },
      {
        _id: 2,
        username: "Pippo",
        amount: 12000,
        type: "Personal",
        categories_info: { color: "testColor" },
        date: "2023/4/3",
      },
      {
        _id: 3,
        username: "Pippo",
        amount: 34,
        type: "Personal",
        categories_info: { color: "testColor" },
        date: "2023/4/3",
      },
    ];
    const expectedResponse = {
      refreshedTokenMessage: "",
      message: "Invalid ID:"+"testID1",
    };
    verifyAuth.mockImplementation((mockReq, mockRes, params) => {
      if (params.authType == "User") {
        return { authorized: false, cause: "authorized" };
      } else {
        return { authorized: true, cause: "authorized" };
      }
    });
    jest.spyOn(transactions, "findOne").mockResolvedValue(undefined);
    jest.spyOn(transactions, "deleteMany").mockResolvedValue(testTransactions);
    await deleteTransactions(mockReq, mockRes);
    //expect(transactions.deleteOne).toHaveBeenCalled();
    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith(expectedResponse);
  });

  test("Empty Request [deleteTransactions] - Test #3", async () => {
    const mockReq = {
      body: {},
      params: { username: "testuser" },
      cookies: {
        accessToken: "adminAccessTokenValid",
        refreshToken: "adminRefreshTokenValid",
      },
    };
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: {
        //The name can also be message, what matters is consistency with the one used in the code
        refreshedTokenMessage: "",
      },
    };
    const testTransactions = [
      {
        _id: 1,
        username: "Pippo",
        amount: 3500,
        type: "Personal",
        categories_info: { color: "testColor" },
        date: "2023/4/3",
      },
      {
        _id: 2,
        username: "Pippo",
        amount: 12000,
        type: "Personal",
        categories_info: { color: "testColor" },
        date: "2023/4/3",
      },
      {
        _id: 3,
        username: "Pippo",
        amount: 34,
        type: "Personal",
        categories_info: { color: "testColor" },
        date: "2023/4/3",
      },
    ];
    const expectedResponse = {
      refreshedTokenMessage: "",
      message: "Invalid IDS",
    };
    verifyAuth.mockImplementation((mockReq, mockRes, params) => {
      if (params.authType == "User") {
        return { authorized: false, cause: "unauthorized" };
      } else {
        return { authorized: true, cause: "unauthorized" };
      }
    });
    jest.spyOn(transactions, "findOne").mockResolvedValue(new transactions());
    jest.spyOn(transactions, "deleteMany").mockResolvedValue(testTransactions);
    await deleteTransactions(mockReq, mockRes);
    //expect(transactions.deleteOne).toHaveBeenCalled();
    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith(expectedResponse);
  });

  test("Database Error Request [deleteTransactions] - Test #4", async () => {
    const mockReq = {
      body: { _ids: ["testID1", "testID2", "testID3"] },
      params: { username: "testuser" },
      cookies: {
        accessToken: "adminAccessTokenValid",
        refreshToken: "adminRefreshTokenValid",
      },
    };
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: {
        //The name can also be message, what matters is consistency with the one used in the code
        refreshedTokenMessage: "",
      },
    };
    const expectedResponse = {
      refreshedTokenMessage: "",
      error: "Database Error",
    };
    verifyAuth.mockImplementation((mockReq, mockRes, params) => {
      if (params.authType == "User") {
        return { authorized: false, cause: "authorized" };
      } else {
        return { authorized: true, cause: "authorized" };
      }
    });
    jest.spyOn(transactions, "findOne").mockResolvedValue(new transactions());
    jest.spyOn(transactions, "deleteMany").mockImplementation(() => {
      throw new Error("Database Error");
    });
    await deleteTransactions(mockReq, mockRes);
    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.json).toHaveBeenCalledWith(expectedResponse);
  });
});