import { Group, User } from "../models/User.js";
import { transactions } from "../models/model.js";
import { verifyAuth } from "./utils.js";

/**
 * Return all the users
  - Request Body Content: None
  - Response `data` Content: An array of objects, each one having attributes `username`, `email` and `role`
  - Optional behavior:
    - empty array is returned if there are no users
 */
export const getUsers = async (req, res) => {
  try {
    ///only admin can perform this operation!
    const adminAuth = verifyAuth(req, res, { authType: "Admin" });
    if(adminAuth.authorized){
      const users = await User.find();
      const userList = users.map(user => ({
        username: user.username,
        email: user.email,
        role: user.role
      }));
      res.status(200).json(userList);
    } else {
      return res.status(401).json({ error : adminAuth.cause });
    }
  } catch (error) {
    res.status(500).json(error.message);
  }
}

/**
 * Return information of a specific user
  - Request Body Content: None
  - Response `data` Content: An object having attributes `username`, `email` and `role`.
  - Optional behavior:
    - error 401 is returned if the user is not found in the system
 */
export const getUser = async (req, res) => {
  try {
    const cookie = req.cookies;
    const username = req.params.username;
    const userAuth = verifyAuth(req, res, { authType: "User", username: username });
    ///if userAuth return true, user can retrieve only info about himself
    if(userAuth.authorized){
      const user = await User.findOne({ refreshToken: cookie.refreshToken });
      if (!user) return res.status(401).json({ message: "User not found" })
      const obj = {
        username: user.username,
        email: user.email,
        role: user.role
      }
      return res.status(200).json(obj);
      ///if userAuth fails (Username mismatch) it means that a user want to retrieve info about another user
    } else {
      const adminAuth = verifyAuth(req, res, { authType: "Admin" });
      ///if the user is an Admin ok, otherwise unauthorized
      if(adminAuth.authorized){
        const user = await User.findOne({ username });
        if (!user) return res.status(401).json({ message: "User not found" })
        const obj = {
          username: user.username,
          email: user.email,
          role: user.role
        }
        res.status(200).json(obj)
      } else {
        return res.status(401).json({ error: adminAuth.cause });
      }
    }
  } catch (error) {
    res.status(500).json(error.message)
  }
}

/**
 * Create a new group
  - Request Body Content: An object having a string attribute for the `name` of the group and an array that lists all the `memberEmails`
  - Response `data` Content: An object having an attribute `group` (this object must have a string attribute for the `name`
    of the created group and an array for the `members` of the group), an array that lists the `alreadyInGroup` members
    (members whose email is already present in a group) and an array that lists the `membersNotFound` (members whose email
    +does not appear in the system)
  - Optional behavior:
    - error 401 is returned if there is already an existing group with the same name
    - error 401 is returned if all the `memberEmails` either do not exist or are already in a group
 */
export const createGroup = async (req, res) => {
  try {
    const { name, memberEmails } = req.body;

    ///check if group with the same name already exist
    const existingGroup = await Group.findOne({ name });
    if (existingGroup) {
      return res.status(401).json({ error: 'Group with the same name already exists' });
    }

    ///find members already in a group
    const alreadyInGroup = await Group.find({ 'members.mail': { $in: memberEmails } });
    const alreadyInGroupEmails = alreadyInGroup.map(group => group.members.map(member => member.email)).flat();

    const memberNotFound = [];
    for (const email of memberEmails) {
      const user = await User.findOne({ email });
      if (!user) {
        memberNotFound.push(email);
      }
    }
    ///THIS DO NOT WORKS AS EXPECTED!! TODO!
    if(alreadyInGroupEmails.length > 0 || memberNotFound.length > 0){
      return res.status(401).json({ error: `Users already in group: ${alreadyInGroupEmails}. Users not found: ${memberNotFound}.`});
    }

    ///create the group
    const newGroup = await Group.create({
      name,
      members: memberEmails.map(email => ({ email }))
    });

    const responseData = {
      group: {
        name: newGroup.name,
        members: newGroup.members
      },
      alreadyInGroup: alreadyInGroupEmails,
      memberNotFound
    };

    res.status(200).json(responseData);
  } catch (err) {
    res.status(500).json(err.message)
  }
}

/**
 * Return all the groups
  - Request Body Content: None
  - Response `data` Content: An array of objects, each one having a string attribute for the `name` of the group
    and an array for the `members` of the group
  - Optional behavior:
    - empty array is returned if there are no groups
 */
export const getGroups = async (req, res) => {
  try {
    const groups = await Group.find();
    res.status(200).json(groups)
  } catch (err) {
    res.status(500).json(err.message)
  }
}

/**
 * Return information of a specific group
  - Request Body Content: None
  - Response `data` Content: An object having a string attribute for the `name` of the group and an array for the 
    `members` of the group
  - Optional behavior:
    - error 401 is returned if the group does not exist
 */
export const getGroup = async (req, res) => {
  try {
    const name = req.params.name;
    const group = await Group.findOne({ name });
    if(!group){
      return res.status(401).json({ error: 'Group does not exist' });
    }
    res.status(200).json(group);
  } catch (err) {
    res.status(500).json(err.message)
  }
}

/**
 * Add new members to a group
  - Request Body Content: An array of strings containing the emails of the members to add to the group
  - Response `data` Content: An object having an attribute `group` (this object must have a string attribute for the `name` of the
    created group and an array for the `members` of the group, this array must include the new members as well as the old ones), 
    an array that lists the `alreadyInGroup` members (members whose email is already present in a group) and an array that lists 
    the `membersNotFound` (members whose email does not appear in the system)
  - Optional behavior:
    - error 401 is returned if the group does not exist
    - error 401 is returned if all the `memberEmails` either do not exist or are already in a group
 */
export const addToGroup = async (req, res) => {
  try {
  } catch (err) {
    res.status(500).json(err.message)
  }
}

/**
 * Remove members from a group
  - Request Body Content: An object having an attribute `group` (this object must have a string attribute for the `name` of the
    created group and an array for the `members` of the group, this array must include only the remaining members),
    an array that lists the `notInGroup` members (members whose email is not in the group) and an array that lists 
    the `membersNotFound` (members whose email does not appear in the system)
  - Optional behavior:
    - error 401 is returned if the group does not exist
    - error 401 is returned if all the `memberEmails` either do not exist or are not in the group
 */
export const removeFromGroup = async (req, res) => {
  try {
  } catch (err) {
    res.status(500).json(err.message)
  }
}

/**
 * Delete a user
  - Request Parameters: None
  - Request Body Content: A string equal to the `email` of the user to be deleted
  - Response `data` Content: An object having an attribute that lists the number of `deletedTransactions` and a boolean attribute that
    specifies whether the user was also `deletedFromGroup` or not.
  - Optional behavior:
    - error 401 is returned if the user does not exist 
 */
export const deleteUser = async (req, res) => {
  try {
    const { email } = req.body;

    ///find user to be deleted
    const user = await User.findOne({ email });
    if(!user){
      res.status(401).json({ error: 'User not found' });
    }

    ///delete the user
    await User.deleteOne({ email });
    res.status(200).json({ message: 'User deleted succesfully' });
  } catch (err) {
    res.status(500).json(err.message)
  }
}

/**
 * Delete a group
  - Request Body Content: A string equal to the `name` of the group to be deleted
  - Response `data` Content: A message confirming successful deletion
  - Optional behavior:
    - error 401 is returned if the group does not exist
 */
export const deleteGroup = async (req, res) => {
  try {
    const {name} = req.body;

    ///find a group to be deleted
    const group = await Group.findOne({ name });
    if(!group){
      return res.status(401).json({ error: 'Group not found'} );
    }

    ///delete the group
    await Group.deleteOne({ name });
    res.status(200).json({ message: 'Group deleted succesfully'});
  } catch (err) {
    res.status(500).json(err.message)
  }
}