import { categories, transactions } from "../models/model.js";
import { Group, User } from "../models/User.js";
import {
  handleDateFilterParams,
  handleAmountFilterParams,
  verifyAuth,
} from "./utils.js";
import jwt from "jsonwebtoken";

/**
 * Create a new category
  - Request Body Content: An object having attributes `type` and `color`
  - Response `data` Content: An object having attributes `type` and `color`
 */
export const createCategory = async (req, res) => {
  try {
    const cookie = req.cookies;
    if (!cookie.accessToken) {
      return res.status(401).json({ message: "Unauthorized" }); // unauthorized
    }
    const adminAuth = verifyAuth(req, res, {
      authType: "Admin",
    });
    if (!adminAuth.authorized) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const newType = req.body.type;
    const newColor = req.body.color;
    if (newType === undefined || newColor === undefined) {
      throw new Error("Missing attributes");
    }
    if (newType === "" || newColor === "") {
      throw new Error("Missing attributes");
    }
    const existing = await categories.findOne({ type: newType });
    if (existing !== null) {
      throw new Error("Category already exists");
    }
    const new_categories = new categories({ type: newType, color: newColor });
    await new_categories.save();
    res.status(200).json({
      data: { type: newType, color: newColor },
      message: "Category created!",
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

/**
 * Edit a category's type or color
  - Request Body Content: An object having attributes `type` and `color` equal to the new values to assign to the category
  - Response `data` Content: An object with parameter `message` that confirms successful editing and a parameter `count` that is equal to the count of transactions whose category was changed with the new type
  - Optional behavior:
    - error 401 returned if the specified category does not exist
    - error 401 is returned if new parameters have invalid values
 */
export const updateCategory = async (req, res) => {
  try {
    const cookie = req.cookies;
    if (!cookie.accessToken) {
      return res.status(401).json({ message: "Unauthorized" }); // unauthorized
    }

    const adminAuth = verifyAuth(req, res, { authType: "Admin" });
    ///if the user is an Admin ok, otherwise unauthorized
    if (!adminAuth.authorized) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!req.body) {
      throw new Error("body is not defined");
    }
    const { type: newType, color: newColor } = req.body;
    const oldType = req.params.type;
    if (!newType || !newColor) {
      throw new Error("Missing attributes");
    }
    if (typeof newType !== "string" || typeof newColor !== "string") {
      //check input
      throw new Error("Mismatched types in req.body!");
    }
    const oldCat = await categories.findOne({ type: oldType });
    if (oldCat === null) {
      throw new Error("Old category type does not exist");
    }

    const alreadyExists = await categories.findOne({ type: newType }); //if new type value refers to an existing category, fails
    if (alreadyExists !== null) {
      throw new Error("new type invalid, category already exists");
    }

    await categories.findOneAndUpdate(
      { type: oldType },
      { type: newType, color: newColor }
    ); //update category
    const updTransactions = await transactions.updateMany(
      { type: oldType },
      { $set: { type: newType } }
    );

    return res.status(200).json({
      data: {
        message: "Update completed successfully",
        count: updTransactions.modifiedCount,
      },
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

/**
 * Delete a category
  - Request Body Content: An array of strings that lists the `types` of the categories to be deleted
  - Response `data` Content: An object with parameter `message` that confirms successful deletion and a parameter `count` that is equal to the count of affected transactions (deleting a category sets all transactions with that category to have `investment` as their new category)
  - Optional behavior:
    - error 401 is returned if the specified category does not exist
 */
    export const deleteCategory = async (req, res) => {
      try {
        const cookie = req.cookies;
        if (!cookie.accessToken) {
          return res.status(401).json({ message: "Unauthorized" }); // unauthorized
        }
        if(!req.body.types){
          throw new Error("Missing attributes");
        }
        const adminAuth = verifyAuth(req, res, { authType: "Admin" });
        ///if the user is an Admin ok, otherwise unauthorized
        if (!adminAuth.authorized) {
          return res.status(401).json({message: "Unauthorized"})
        }
        const types  = req.body.types;
        if (types.length === 0) {
          //empty input
          throw new Error("Missing attributes");
        }
    
        const nCat = await categories.countDocuments({});
        if (nCat === 1) {
          //one category in db, deletion not possible
          throw new Error("Only one category, deletion not possible!");
        }
        if(nCat < types.length){
          //one category in db, deletion not possible
          throw new Error("More categories to delete than actual!");
        }
    
        for (const str of types) {
          //check array in req.body
          if (str === "") {
            //empty "type" string
            throw new Error("Empty string in array");
          }
        }
        const exists = await categories.find({ type: {$in: types} });
        if (exists.length !== types.length) {
          // one or more types not found in db
          throw new Error("Category does not exist, deletion not possible!");
        }
        const nT = types.length;
        if (nCat > nT) {
          // N > T
          await categories.deleteMany({type: {$in: types}});
          const oldestCat = await categories.find().sort({createdAt: 1}).limit(1);
          const updated = await transactions.updateMany({type: {$in: types}},
              {$set: {type: oldestCat[0].type}});
          return res.status(200).json({
            data: {
              message: "Deletion completed successfully",
              count: updated.modifiedCount
            }
          });
        }
    
        else{
          // N == T
          const oldestCat = await categories.find().sort({createdAt: 1}).limit(1);
          const typesRemove = types.filter(word => word !== oldestCat[0].type);
          await categories.deleteMany({type: {$in: typesRemove}});
          const updated = await transactions.updateMany({type: {$in: typesRemove}},
              {$set: {type: oldestCat[0].type}});
          return res.status(200).json({
            data: {
              message: "Deletion completed successfully",
              count: updated.modifiedCount,
            }
          });
        }
      } catch (error) {
        res.status(400).json({ error: error.message });
      }
    };

/**
 * Return all the categories
  - Request Body Content: None
  - Response `data` Content: An array of objects, each one having attributes `type` and `color`
  - Optional behavior:
    - empty array is returned if there are no categories
 */
export const getCategories = async (req, res) => {
  try {
    const cookie = req.cookies;
    if (!cookie.accessToken) {
      return res.status(401).json({ message: "Unauthorized" }); // unauthorized
    }
    const auth = verifyAuth(req, res, {
      authType: "Simple",
    });
    if (!auth.authorized) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    let data = await categories.find({});

    let filter = data.map((v) =>
      Object.assign({}, { type: v.type, color: v.color })
    );

    return res.status(200).json({ data: filter, message: "authorized" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

/**
 * Create a new transaction made by a specific user
  - Request Body Content: An object having attributes `username`, `type` and `amount`
  - Response `data` Content: An object having attributes `username`, `type`, `amount` and `date`
  - Optional behavior:
    - error 401 is returned if the username or the type of category does not exist
 */
export const createTransaction = async (req, res) => {
  try {
    const { username, amount, type } = req.body;
    if (
      !username ||
      !type ||
      !amount ||
      username === "" ||
      type === "" ||
      amount === "" ||
      isNaN(parseFloat(amount))
    ) {
      return res.status(400).json({
        message: "Invalid parameters",
        refreshedTokenMessage: res.locals.refreshedTokenMessage,
      });
    }
    const caller_username = req.params.username;
    let category_exists = await categories.find({ type: type });
    if (!category_exists) {
      category_exists = [];
    }
    if (caller_username != username) {
      return res.status(400).json({
        refreshedTokenMessage: res.locals.refreshedTokenMessage,
        message: "Username dosen't match transaction's username",
      });
    }
    const user_body = await User.findOne({ username: username });
    const userAuth = verifyAuth(req, res, {
      authType: "User",
      username: caller_username,
    });
    const cookie = req.cookies;
    const decodedAccessToken = await jwt.verify(
      cookie.accessToken,
      process.env.ACCESS_KEY
    );
    if (decodedAccessToken.username!=caller_username){
      return res.status(401).json({
        refreshedTokenMessage: res.locals.refreshedTokenMessage,
        message: "Unauthorized",
      });
    }
    if (category_exists.length > 0 && user_body) {
      if (userAuth.authorized) {
        await transactions
          .create({ username: username, amount: amount, type: type })
          .then((data) =>
            res.status(200).json({
              data,
              message: "Transaction created",
              refreshedTokenMessage: res.locals.refreshedTokenMessage,
            })
          );
      } else {
        const adminAuth = verifyAuth(req, res, { authType: "Admin" });
        ///if the user is an Admin ok, otherwise unauthorized
        if (adminAuth.authorized) {
          await transactions
            .create({ username: username, amount: amount, type: type })
            .then((data) =>
              res.status(200).json({
                data,
                message: "Transaction created",
                refreshedTokenMessage: res.locals.refreshedTokenMessage,
              })
            );
        } else {
          return res.status(401).json({
            refreshedTokenMessage: res.locals.refreshedTokenMessage,
            message: "Unauthorized",
          });
        }
      }
    } else {
      return res.status(400).json({
        refreshedTokenMessage: res.locals.refreshedTokenMessage,
        message: "Category or User dosen't exist",
      }); // unauthorized
    }
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
};

/**
         * Return all transactions made by all users
          - Request Body Content: None
          - Response `data` Content: An array of objects, each one having attributes `username`, `type`, `amount`, `date` and `color`
          - Optional behavior:
            - empty array must be returned if there are no transactions
         */
export const getAllTransactions = async (req, res) => {
  try {
    const username = req.params.username;
    ///if userAuth return true, user can retrieve only info about himself
    const adminAuth = verifyAuth(req, res, {
      authType: "Admin",
      username: username,
    });
    ///if the user is an Admin ok, otherwise unauthorized
    if (adminAuth.authorized) {
      transactions
        .aggregate([
          {
            $match: {
              ...handleAmountFilterParams(req),
              ...handleDateFilterParams(req),
            },
          },
          {
            $lookup: {
              from: "categories",
              localField: "type",
              foreignField: "type",
              as: "categories_info",
            },
          },
          { $unwind: "$categories_info" },
        ])
        .then((result) => {
          let data = result.map((v) =>
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
          );
          return res.status(200).json({
            data,
            refreshedTokenMessage: res.locals.refreshedTokenMessage,
            message: adminAuth.cause,
          });
        });
    } else {
      return res.status(401).json({
        message: adminAuth.cause,
        refreshedTokenMessage: res.locals.refreshedTokenMessage,
      });
    }
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
};

/**
         * Return all transactions made by a specific user
          - Request Body Content: None
          - Response `data` Content: An array of objects, each one having attributes `username`, `type`, `amount`, `date` and `color`
          - Optional behavior:
            - error 401 is returned if the user does not exist
            - empty array is returned if there are no transactions made by the user
            - if there are query parameters and the function has been called by a Regular user then the returned transactions must be filtered according to the query parameters
         */
export const getTransactionsByUser = async (req, res) => {
  try {
    const username = req.params.username;
    const user = await User.findOne({ username: username });
    if (user) {
      if (req.url.includes("/users/" + username + "/transactions")) {
        const userAuth = verifyAuth(req, res, {
          authType: "User",
          username: username,
        });

        if (userAuth.authorized) {
          transactions
            .aggregate([
              {
                $match: {
                  username: username,
                  ...handleAmountFilterParams(req),
                  ...handleDateFilterParams(req),
                },
              },
              {
                $lookup: {
                  from: "categories",
                  localField: "type",
                  foreignField: "type",
                  as: "categories_info",
                },
              },
              { $unwind: "$categories_info" },
            ])
            .then((result) => {
              let data = result.map((v) =>
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
              );
              res.status(200).json({
                refreshedTokenMessage: res.locals.refreshedTokenMessage,
                data,
                message: userAuth.cause,
              });
            });
          ///if userAuth fails (Username mismatch) it means that a user want to retrieve info about another user
        } else {
          return res.status(401).json({
            refreshedTokenMessage: res.locals.refreshedTokenMessage,
            message: userAuth.cause,
          });
        }
      } else {
        const adminAuth = verifyAuth(req, res, { authType: "Admin" });
        ///if the user is an Admin ok, otherwise unauthorized
        if (adminAuth.authorized) {
          transactions
            .aggregate([
              {
                $match: {
                  username: username,
                  ...handleAmountFilterParams(req),
                  ...handleDateFilterParams(req),
                },
              },
              {
                $lookup: {
                  from: "categories",
                  localField: "type",
                  foreignField: "type",
                  as: "categories_info",
                },
              },
              { $unwind: "$categories_info" },
            ])
            .then((result) => {
              let data = result.map((v) =>
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
              );
              res.status(200).json({
                data,
                refreshedTokenMessage: res.locals.refreshedTokenMessage,
                message: adminAuth.cause,
              });
            });
        } else {
          return res.status(401).json({
            refreshedTokenMessage: res.locals.refreshedTokenMessage,
            message: adminAuth.cause,
          });
        }
      }
    } else {
      return res.status(400).json({
        refreshedTokenMessage: res.locals.refreshedTokenMessage,
        message: "User not found",
      });
    }
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
};

/**
         * Return all transactions made by a specific user filtered by a specific category
          - Request Body Content: None
          - Response `data` Content: An array of objects, each one having attributes `username`, `type`, `amount`, `date` and `color`, filtered so that `type` is the same for all objects
          - Optional behavior:
            - empty array is returned if there are no transactions made by the user with the specified category
            - error 401 is returned if the user or the category does not exist
         */
export const getTransactionsByUserByCategory = async (req, res) => {
  try {
    const username = req.params.username;
    const cat = req.params.category;
    const user = await User.findOne({ username: username });
    let category = await categories.find({ type: cat });
    if (!category) {
      category = [];
    }
    if (user && category.length > 0) {
      if (req.url.includes("/users/" + username + "/transactions")) {
        const userAuth = verifyAuth(req, res, {
          authType: "User",
          username: username,
        });
        if (userAuth.authorized) {
          transactions
            .aggregate([
              {
                $match: {
                  username: username,
                  type: cat,
                  ...handleAmountFilterParams(req),
                  ...handleDateFilterParams(req),
                },
              },
              {
                $lookup: {
                  from: "categories",
                  localField: "type",
                  foreignField: "type",
                  as: "categories_info",
                },
              },
              { $unwind: "$categories_info" },
            ])
            .then((result) => {
              let data = result.map((v) =>
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
              );
              res.status(200).json({
                refreshedTokenMessage: res.locals.refreshedTokenMessage,
                data,
                message: userAuth.cause,
              });
            });
          ///if userAuth fails (Username mismatch) it means that a user want to retrieve info about another user
        } else {
          return res.status(401).json({
            refreshedTokenMessage: res.locals.refreshedTokenMessage,
            message: userAuth.cause,
          });
        }
      } else {
        const adminAuth = verifyAuth(req, res, { authType: "Admin" });
        ///if the user is an Admin ok, otherwise unauthorized
        if (adminAuth.authorized) {
          transactions
            .aggregate([
              {
                $match: {
                  username: username,
                  type: cat,
                  ...handleAmountFilterParams(req),
                  ...handleDateFilterParams(req),
                },
              },
              {
                $lookup: {
                  from: "categories",
                  localField: "type",
                  foreignField: "type",
                  as: "categories_info",
                },
              },
              { $unwind: "$categories_info" },
            ])
            .then((result) => {
              let data = result.map((v) =>
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
              );
              res.status(200).json({
                data,
                refreshedTokenMessage: res.locals.refreshedTokenMessage,
                message: adminAuth.cause,
              });
            });
        } else {
          return res.status(401).json({
            refreshedTokenMessage: res.locals.refreshedTokenMessage,
            message: adminAuth.cause,
          });
        }
      }
    } else {
      return res.status(400).json({
        refreshedTokenMessage: res.locals.refreshedTokenMessage,
        message: "User or category not found",
      });
    }
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
};

/**
         * Return all transactions made by members of a specific group
          - Request Body Content: None
          - Response `data` Content: An array of objects, each one having attributes `username`, `type`, `amount`, `date` and `color`
          - Optional behavior:
            - error 401 is returned if the group does not exist
            - empty array must be returned if there are no transactions made by the group
         */
export const getTransactionsByGroup = async (req, res) => {
  try {
    const groupName = req.params.name;
    const group = await Group.findOne({ name: groupName });
    if (group) {
      const emails = group.members.map((member) => member.email);
      let usernames = await User.find({ email: emails });
      usernames = usernames.map((user) => user.username);
      if (req.url.includes("/groups/" + groupName + "/transactions")) {
        const groupAuth = verifyAuth(req, res, {
          authType: "Group",
          emails: group.members.map((member) => member.email),
        });
        if (groupAuth.authorized) {
          transactions
            .aggregate([
              {
                $match: {
                  username: {
                    $in: usernames,
                  },
                  ...handleAmountFilterParams(req),
                  ...handleDateFilterParams(req),
                },
              },
              {
                $lookup: {
                  from: "categories",
                  localField: "type",
                  foreignField: "type",
                  as: "categories_info",
                },
              },
              { $unwind: "$categories_info" },
            ])
            .then((result) => {
              let data = result.map((v) =>
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
              );
              res.status(200).json({
                refreshedTokenMessage: res.locals.refreshedTokenMessage,
                data,
                message: groupAuth.cause,
              });
            });
          ///if userAuth fails (Username mismatch) it means that a user want to retrieve info about another user
        } else {
          return res.status(401).json({
            refreshedTokenMessage: res.locals.refreshedTokenMessage,
            message: groupAuth.cause,
          });
        }
      } else {
        const adminAuth = verifyAuth(req, res, { authType: "Admin" });
        ///if the user is an Admin ok, otherwise unauthorized
        if (adminAuth.authorized) {
          transactions
            .aggregate([
              {
                $match: {
                  username: {
                    $in: usernames,
                  },
                  ...handleAmountFilterParams(req),
                  ...handleDateFilterParams(req),
                },
              },
              {
                $lookup: {
                  from: "categories",
                  localField: "type",
                  foreignField: "type",
                  as: "categories_info",
                },
              },
              { $unwind: "$categories_info" },
            ])
            .then((result) => {
              let data = result.map((v) =>
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
              );
              res.status(200).json({
                data,
                refreshedTokenMessage: res.locals.refreshedTokenMessage,
                message: adminAuth.cause,
              });
            });
        } else {
          return res.status(401).json({
            refreshedTokenMessage: res.locals.refreshedTokenMessage,
            message: adminAuth.cause,
          });
        }
      }
    } else {
      return res.status(400).json({
        refreshedTokenMessage: res.locals.refreshedTokenMessage,
        message: "Group not found",
      });
    }
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
};

/**
         * Return all transactions made by members of a specific group filtered by a specific category
          - Request Body Content: None
          - Response `data` Content: An array of objects, each one having attributes `username`, `type`, `amount`, `date` and `color`, filtered so that `type` is the same for all objects.
          - Optional behavior:
            - error 401 is returned if the group or the category does not exist
            - empty array must be returned if there are no transactions made by the group with the specified category
         */
export const getTransactionsByGroupByCategory = async (req, res) => {
  try {
    const groupName = req.params.name;
    const categoryType = req.params.category;
    const group = await Group.findOne({ name: groupName });
    let category = await categories.find({ type: categoryType });
    if (!category) {
      category = [];
    }
    if (group && category.length > 0) {
      const emails = group.members.map((member) => member.email);
      let usernames = await User.find({ email: emails });
      usernames = usernames.map((user) => user.username);
      if (req.url.includes("/groups/" + groupName + "/transactions")) {
        const groupAuth = verifyAuth(req, res, {
          authType: "Group",
          emails: group.members.map((member) => member.email),
        });
        if (groupAuth.authorized) {
          transactions
            .aggregate([
              {
                $match: {
                  username: {
                    $in: usernames,
                  },
                  type: req.params.category,
                  ...handleAmountFilterParams(req),
                  ...handleDateFilterParams(req),
                },
              },
              {
                $lookup: {
                  from: "categories",
                  localField: "type",
                  foreignField: "type",
                  as: "categories_info",
                },
              },
              { $unwind: "$categories_info" },
            ])
            .then((result) => {
              let data = result.map((v) =>
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
              );
              res.status(200).json({
                refreshedTokenMessage: res.locals.refreshedTokenMessage,
                data,
                message: groupAuth.cause,
              });
            });
          ///if userAuth fails (Username mismatch) it means that a user want to retrieve info about another user
        } else {
          return res.status(401).json({
            refreshedTokenMessage: res.locals.refreshedTokenMessage,
            message: groupAuth.cause,
          });
        }
      } else {
        const adminAuth = verifyAuth(req, res, { authType: "Admin" });
        ///if the user is an Admin ok, otherwise unauthorized
        if (adminAuth.authorized) {
          transactions
            .aggregate([
              {
                $match: {
                  username: {
                    $in: usernames,
                  },
                  type: req.params.category,
                  ...handleAmountFilterParams(req),
                  ...handleDateFilterParams(req),
                },
              },
              {
                $lookup: {
                  from: "categories",
                  localField: "type",
                  foreignField: "type",
                  as: "categories_info",
                },
              },
              { $unwind: "$categories_info" },
            ])
            .then((result) => {
              let data = result.map((v) =>
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
              );
              res.status(200).json({
                data,
                refreshedTokenMessage: res.locals.refreshedTokenMessage,
                message: adminAuth.cause,
              });
            });
        } else {
          return res.status(401).json({
            refreshedTokenMessage: res.locals.refreshedTokenMessage,
            message: adminAuth.cause,
          });
        }
      }
    } else {
      return res.status(400).json({
        refreshedTokenMessage: res.locals.refreshedTokenMessage,
        message: "Group or category not found",
      });
    }
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
};

/**
         * Delete a transaction made by a specific user
          - Request Body Content: The `_id` of the transaction to be deleted
          - Response `data` Content: A string indicating successful deletion of the transaction
          - Optional behavior:
            - error 401 is returned if the user or the transaction does not exist
         */
export const deleteTransaction = async (req, res) => {
  try {
    const id = req.body._id;
    if (!id || id === "") {
      return res.status(400).json({
        refreshedTokenMessage: res.locals.refreshedTokenMessage,
        message: "Missing parameters",
      }); // unauthorized
    } else {
      const username = req.params.username;
      let transaction = await transactions.find({ _id: id });
      const user = await User.findOne({ username: username });
      if (!transaction || transaction.length === 0) {
        return res.status(400).json({
          refreshedTokenMessage: res.locals.refreshedTokenMessage,
          message: "Transaction not found",
        });
      } else if (!user) {
        return res.status(400).json({
          refreshedTokenMessage: res.locals.refreshedTokenMessage,
          message: "User not found",
        });
      } else if (transaction[0].username != username) {
        return res.status(400).json({
          refreshedTokenMessage: res.locals.refreshedTokenMessage,
          message: "Transaction does not belong to the calling user",
        });
      } else {
        const caller_username = req.params.username;
        const userAuth = verifyAuth(req, res, {
          authType: "User",
          username: caller_username,
        });
        ///if userAuth return true, user can retrieve only info about himself
        if (userAuth.authorized) {
          const data = await transactions.deleteOne({ _id: id });
          return res.status(200).json({
            data: { ...data, message: "Transaction deleted" },
            refreshedTokenMessage: res.locals.refreshedTokenMessage,
            message: "Transaction deleted",
          });
        } else {
          const adminAuth = verifyAuth(req, res, { authType: "Admin" });
          ///if the user is an Admin ok, otherwise unauthorized
          if (adminAuth.authorized) {
            const data = await transactions.deleteOne({ _id: id });
            return res.status(200).json({
              data: data,
              refreshedTokenMessage: res.locals.refreshedTokenMessage,
              message: "Transaction deleted",
            });
          } else {
            return res.status(401).json({
              refreshedTokenMessage: res.locals.refreshedTokenMessage,
              message: "Unauthorized",
            });
          }
        }
      }
    }
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
};

/**
         * Delete multiple transactions identified by their ids
          - Request Body Content: An array of strings that lists the `_ids` of the transactions to be deleted
          - Response `data` Content: A message confirming successful deletion
          - Optional behavior:
            - error 401 is returned if at least one of the `_ids` does not have a corresponding transaction. Transactions that have an id are not deleted in this case
         */
export const deleteTransactions = async (req, res) => {
  try {
    const ids = req.body._ids;
    if (!ids) {
      return res.status(400).json({
        refreshedTokenMessage: res.locals.refreshedTokenMessage,
        message: "Invalid IDS",
      });
    } else {
      for (const id of ids) {
        if (!id || id === "") {
          return res.status(400).json({
            refreshedTokenMessage: res.locals.refreshedTokenMessage,
            message: "Invalid ID:" + id,
          });
        } else {
          let transaction = await transactions.find({ _id: id });
          if (!transaction) {
            transaction = [];
          }
          if (!transaction.length > 0) {
            return res.status(400).json({
              refreshedTokenMessage: res.locals.refreshedTokenMessage,
              message: "Invalid ID:" + id,
            });
          }
        }
      }
      const adminAuth = verifyAuth(req, res, { authType: "Admin" });
      ///if the user is an Admin ok, otherwise unauthorized
      if (adminAuth.authorized) {
        const data = await transactions.deleteMany({ _id: { $in: ids } });
        return res.status(200).json({
          data: { ...data, message: "Transactions deleted" },
          refreshedTokenMessage: res.locals.refreshedTokenMessage,
          message: "Transactions deleted",
        });
      } else {
        return res.status(401).json({
          refreshedTokenMessage: res.locals.refreshedTokenMessage,
          message: "Unauthorized",
        });
      }
    }
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
};
