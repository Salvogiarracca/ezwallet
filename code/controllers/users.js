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
      const users = await User.find().select( 'username email role' );
      return res.status(200).json(users);
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
      const user = await User.findOne({ refreshToken: cookie.refreshToken }).select( 'username email role' );
      if (!user) return res.status(401).json({ message: "User not found" })
      return res.status(200).json(user);
      ///if userAuth fails (Username mismatch) it means that a user want to retrieve info about another user
    } else {
      const adminAuth = verifyAuth(req, res, { authType: "Admin" });
      ///if the user is an Admin ok, otherwise unauthorized
      if(adminAuth.authorized){
        const user = await User.findOne({ username }).select( 'username email role' );
        if (!user) return res.status(401).json({ message: "User not found" })
        return res.status(200).json(user)
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
    const simpleAuth = verifyAuth(req, res, { authType: "Simple" });
    if(simpleAuth.authorized){
      const { name, members } = req.body;

      ///if a group with the same name already exists, error 401 is returned
      const group = await Group.findOne({ name });
      if(group){
        return res.status(401).json({ error: 'Group already exists' });
      }

      ///retrieve all the email of group members
      const groups = await Group.find({}, 'members.email' );
      const emailsInGroup = groups.flatMap(group => group.members.map(member => member.email));

      const alreadyInGroup = [];
      const notFoundEmails = [];
      const membersList = [];

      for (const member of members){
        const user = await User.findOne({ email: member });
        if(!user){
          ///if user does not exist
          notFoundEmails.push(member);
        } else if(emailsInGroup.includes(member)){
          ///if user is already in a group
          alreadyInGroup.push(member);
          ///if user does not belong to any group
        } else {
          membersList.push({ email: member, user: user });
        }
      }

      ///if memberList contains at least one member, then create the group, otherwise error 401 is returned
      if(membersList.length === 0){
        return res.status(401).json({
          error: 'all the members either do not exist or are already in a group',
          alreadyInGroup: alreadyInGroup,
          membersNotFound: notFoundEmails
        })
      } else {

        const newGroup = await Group.create({
          name,
          members: membersList
        });

        return res.status(200).json({
          group: newGroup.name,
          members: newGroup.members,
          alreadyInGroup: alreadyInGroup,
          membersNotFound: notFoundEmails
        });
      }
    } else {
      return res.status(401).json(simpleAuth.cause);
    }

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
    ///only admin can perform this operation!
    const adminAuth = verifyAuth(req, res, { authType: "Admin" });
    if(adminAuth.authorized){
      const groups = await Group.find().select( 'name members' );
      return res.status(200).json(groups);
    } else {
      return res.status(401).json({ error : adminAuth.cause });
    }
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
    } else {
      const groupAuth = verifyAuth(req, res, { authType: "Group", emails: group.members.map(member => member.email) });
      if(groupAuth.authorized){
        return res.status(200).json({
          group: group.name,
          members: group.members.map(member => member.email)
        });
      } else {
        const adminAuth = verifyAuth(req, res, { authType: "Admin" });
        if(adminAuth.authorized){
          return res.status(200).json({
            group: group.name,
            members: group.members.map(member => member.email)
          });
        } else {
          return res.status(401).json({ error: adminAuth.cause });
        }
      }
    }
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
    const groupName = req.params.name;
    const newMembers = req.body;
    const group = await Group.findOne({ name: groupName });

    if(!group){
      return res.status(401).json({ error: 'Group does not exist' });
    } else {
      const groupAuth = verifyAuth(req, res, { authType: "Group", emails: group.members.map(member => member.email) });
      const groups = await Group.find({}, 'members.email' );

      const emailsInGroup = groups.flatMap(group => group.members.map(member => member.email));
      const alreadyInGroup = [];
      const notFoundEmails = [];

      if(groupAuth.authorized){
        for (const member of newMembers) {
          const user = await User.findOne({ email: member });
          if(!user){
            notFoundEmails.push(member);
          } else if(emailsInGroup.includes(member)){
            alreadyInGroup.push(member);
          } else {
            group.members.push({ email: member, user: user });
          }
        }

        if(notFoundEmails.length + alreadyInGroup.length === newMembers.length){
          return res.status(401).json({
            error: 'all the members either do not exist or are already in a group',
            alreadyInGroup: alreadyInGroup,
            membersNotFound: notFoundEmails
          });
        } else {
          await group.save();
          return res.status(200).json({
            group: group.name,
            members: group.members.map(member => member.email)
          })
        }
      } else {
        const adminAuth = verifyAuth(req, res, { authType: "Admin" });
        if(adminAuth.authorized){
          for (const member of newMembers) {
            const user = await User.findOne({ email: member });
            if(!user){
              notFoundEmails.push(member);
            } else if(emailsInGroup.includes(member)){
              alreadyInGroup.push(member);
            } else {
              group.members.push({ email: member, user: user });
            }
          }

          if(notFoundEmails.length + alreadyInGroup.length === newMembers.length){
            return res.status(401).json({
              error: 'all the members either do not exist or are already in a group',
              alreadyInGroup: alreadyInGroup,
              membersNotFound: notFoundEmails
            });
          } else {
            await group.save();
            return res.status(200).json({
              group: group.name,
              members: group.members.map(member => member.email)
            })
          }
        } else {
          return res.status(401).json({ error: adminAuth.cause });
        }

      }
    }

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
  try{
  } catch(err){
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