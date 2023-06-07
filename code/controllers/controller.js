import { categories, transactions } from "../models/model.js";
import { Group, User } from "../models/User.js";
import {
  handleDateFilterParams,
  handleAmountFilterParams,
  verifyAuth,
} from "./utils.js";

/**
 * Create a new category
  - Request Body Content: An object having attributes `type` and `color`
  - Response `data` Content: An object having attributes `type` and `color`
 */
export const createCategory = (req, res) => {
  try {
    const username = req.params.username;
    const cookie = req.cookies;
    if (!cookie.accessToken) {
      return res.status(401).json({ message: "Unauthorized" }); // unauthorized
    }
    const adminAuth = verifyAuth(req, res, {
      authType: "Admin",
      username: username,
    });
    if (!adminAuth.authorized) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const { type, color } = req.body;
    if (!type || !color) {
      throw new Error("Missing attributes");
    }
    if (categories.findOne({ type: type })) {
      throw new Error("Category already exists");
    }
    const new_categories = new categories({ type, color });
    new_categories
      .save()
      .then((data) => res.json(data))
      .catch((err) => {
        throw err;
      });
    res
      .status(200)
      .json({
        data: { type: type, color: color },
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
    //to add: control of admin (even for deleteCategory)
    const { type: newType, color: newColor } = req.body;
    const oldType = req.params.type;
    if (!newType || !newColor) {
      return res.status(400).json({ message: "Missing attributes!" });
    }

    if (typeof newType !== "string" || typeof newColor !== "string") {
      //check input
      return res
        .status(400)
        .json({ message: "Mismatched types in request body!" });
    }

    if (newColor.length !== 7 || newColor[1] !== "#") {
      return res.status(400).json({ message: "Wrong format for color" });
    }

    const alreadyExists = await categories.findOne({ type: newType }); //if new type value refers to an existing category, fails
    if (alreadyExists) {
      return res
        .status(400)
        .json({ message: "new type invalid, category already exists" });
    }

    const updated = await categories.findOneAndUpdate(
      { type: oldType },
      { type: newType, color: newColor }
    ); //update category
    const updTransactions = await transactions.updateMany(
      { type: oldType },
      { $set: { type: newType } }
    );
    const nUpdated = updTransactions.modifiedCount;

    return res
      .status(200)
      .json({ message: "Update completed successfully", count: nUpdated });
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

    const { types } = req.body;
    if (types.length === 0) {
      //empty input
      return res.status(400).json({ message: "Missing attributes" });
    }

    const nCat = await categories.countDocuments({});
    if (nCat === 1) {
      //one category in db, deletion not possible
      return res
        .status(400)
        .json({ message: "Only one category, deletion not possible!" });
    }

    for (const str of types) {
      //check array in req.body
      if (str === "") {
        //empty "type" string
        return res.status(400).json({ message: "Empty string in array" });
      }
      const exists = await categories.findOne({ type: str });
      if (!exists) {
        // type not found in db
        return res
          .status(400)
          .json({ message: "Category does not exist, deletion not possible!" });
      }
    }
    const nT = types.length;
    const oldestCat = await categories.find().sort({ _id: 1 }).limit(1);
    if (nCat > nT) {
      // N > T
      let nUpd = 0; //count of affected transactions
      for (const str of types) {
        const removed = await categories.findOneAndRemove({ type: str }); //category removed
        const updated = await transactions.updateMany(
          //update of transactions
          { type: str },
          { $set: { $type: oldestCat.type } }
        );
        nUpd += updated.modifiedCount;
      }
    }

    if (nCat === nT) {
      // N == T
      let nUpd = 0;
      for (const str of types) {
        if (str !== oldestCat.type) {
          // if str is === to oldestCategory, skipped (then it's the same as N > T)
          const removed = await categories.findOneAndRemove({ type: str });
          const updated = await transactions.updateMany(
            { type: str },
            { $set: { $type: oldestCat.type } }
          );
          nUpd += updated.modifiedCount;
        }
      }
    }
    return res.status(200).json({
      message: "Deletion completed successfully",
      count: nUpd,
    });
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
    const username = req.params.username;
    const cookie = req.cookies;
    if (!cookie.accessToken) {
      return res.status(401).json({ message: "Unauthorized" }); // unauthorized
    }
    const auth = verifyAuth(req, res, {
      authType: "Simple",
      username: username,
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
      amount === "" || parseFloat(amount) === NaN
    ) {
      return res.status(400).json({
        message: "Invalid parameters",
        refreshedTokenMessage: res.locals.refreshedTokenMessage,
      });
    }
    const caller_username = req.params.username;
    const userAuth = verifyAuth(req, res, {
      authType: "User",
      username: caller_username,
    });
    const category = await categories.findOne({ type: type });
    const user_body = await User.findOne({ username: username });
    const user_params = await User.findOne({ username: caller_username });
    if (category && user_body && user_params) {
      if (userAuth.authorized) {
        if (caller_username == username) {
          const new_transactions = new transactions({ username, amount, type });
          new_transactions.save().then((data) =>
            res.status(200).json({
              data,
              message: "Transaction created",
              refreshedTokenMessage: res.locals.refreshedTokenMessage,
            })
          );
        } else {
          return res.status(400).json({
            refreshedTokenMessage: res.locals.refreshedTokenMessage,
            message: "Username dosen't match transaction's username",
          });
        }
      } else {
        const adminAuth = verifyAuth(req, res, { authType: "Admin" });
        ///if the user is an Admin ok, otherwise unauthorized
        if (adminAuth.authorized) {
          const new_transactions = new transactions({ username, amount, type });
          new_transactions.save().then((data) =>
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
      refreshedTokenMessage: res.locals.refreshedTokenMessage,
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
      refreshedTokenMessage: res.locals.refreshedTokenMessage,
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
                $match: { username: username },
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
                $match: { username: username },
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
      refreshedTokenMessage: res.locals.refreshedTokenMessage,
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
    const category = await categories.findOne({ type: cat });
    if (user && category) {
      if (req.url.includes("/users/" + username + "/transactions")) {
        const userAuth = verifyAuth(req, res, {
          authType: "User",
          username: username,
        });
        if (userAuth.authorized) {
          transactions
            .aggregate([
              {
                $match: { username: username, type: cat },
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
                $match: { username: username, type: cat },
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
      refreshedTokenMessage: res.locals.refreshedTokenMessage,
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
      refreshedTokenMessage: res.locals.refreshedTokenMessage,
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
    const category = await categories.findOne({ type: categoryType });
    if (group && category) {
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
      refreshedTokenMessage: res.locals.refreshedTokenMessage,
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
      const transaction = await transactions.findOne({ _id: id });
      const user = await User.findOne({ username: username });
      if (user && transaction) {
        const caller_username = req.params.username;
        const userAuth = verifyAuth(req, res, {
          authType: "User",
          username: caller_username,
        });
        ///if userAuth return true, user can retrieve only info about himself
        if (userAuth.authorized) {
          const data = await transactions.deleteOne({ _id: id });
          return res.status(200).json({
            data: data,
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
      } else {
        return res.status(400).json({
          refreshedTokenMessage: res.locals.refreshedTokenMessage,
          message: "User or transaction not found",
        });
      }
    }
  } catch (error) {
    res.status(500).json({
      refreshedTokenMessage: res.locals.refreshedTokenMessage,
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
        const transaction = await transactions.findOne({ _id: id });
        if (!id || id === "" || !transaction) {
          return res.status(400).json({
            refreshedTokenMessage: res.locals.refreshedTokenMessage,
            message: "Invalid ID:"+id,
          });
        }}
        const adminAuth = verifyAuth(req, res, { authType: "Admin" });
        ///if the user is an Admin ok, otherwise unauthorized
        if (adminAuth.authorized) {
          const data = await transactions.deleteMany({ _id: { $in: ids} });
          return res.status(200).json({
            data: data,
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
      refreshedTokenMessage: res.locals.refreshedTokenMessage,
      error: error.message,
    });
  }
};
