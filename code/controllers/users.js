import { Group, User } from "../models/User.js";
import { transactions } from "../models/model.js";
import { verifyAuth } from "./utils.js";

function isValidEmail(email) {
  /// Test if empty string
  if(!email) return false;

  const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  /// Test if is valid
  return emailPattern.test(email);
}

/**
 * Return all the users
    - Request Body Content: None
    - Response `data` Content: An array of objects, each one having attributes `username`, `email` and `role`
      - Example: `res.status(200).json({data: [{username: "Mario", email: "mario.red@email.com"}, {username: "Luigi", email: "luigi.red@email.com"}, {username: "admin", email: "admin@email.com"} ], refreshedTokenMessage: res.locals.refreshedTokenMessage})`
    - Optional behavior:
      - Returns a 401 error if called by an authenticated user who is not an admin (authType = Admin)
 */
export const getUsers = async (req, res) => {
  try {
    ///only admin can perform this operation!
    const adminAuth = verifyAuth(req, res, { authType: "Admin" });
    if(adminAuth.authorized){
      const users = await User.find().select( 'username email role' );
      return res.status(200).json({
        users,
        refreshedTokenMessage: res?.locals?.refreshedTokenMessage
      });
    } else {
      return res.status(401).json({ error : adminAuth.cause });
    }
  } catch (error) {
    res.status(500).json(error.message);
  }
}

/**
 * Return information of a specific user
    - Request Parameters: A string equal to the `username` of the involved user
      - Example: `/api/users/Mario`
    - Request Body Content: None
    - Response `data` Content: An object having attributes `username`, `email` and `role`.
      - Example: `res.status(200).json({data: {username: "Mario", email: "mario.red@email.com", role: "Regular"}, refreshedTokenMessage: res.locals.refreshedTokenMessage})`
    - Optional behavior:
      - Returns a 400 error if the username passed as the route parameter does not represent a user in the database
      - Returns a 401 error if called by an authenticated user who is neither the same user as the one in the route parameter (authType = User) nor an admin (authType = Admin)
 */
export const getUser = async (req, res) => {
  try {
    const cookie = req.cookies;
    const username = req.params.username;
    const userAuth = verifyAuth(req, res, { authType: "User", username: username });
    ///if userAuth return true, user can retrieve only info about himself
    if(userAuth.authorized){
      const user = await User.findOne({ refreshToken: cookie.refreshToken }).select( 'username email role' );
      if (!user) return res.status(400).json({ message: "User not found" })
      return res.status(200).json({data: {username: user.username, email: user.email, role: user.role}, refreshedTokenMessage: res?.locals?.refreshedTokenMessage });
      ///if userAuth fails (Username mismatch) it means that a user want to retrieve info about another user
    } else {
      const adminAuth = verifyAuth(req, res, { authType: "Admin" });
      ///if the user is an Admin ok, otherwise unauthorized
      if(adminAuth.authorized){
        const user = await User.findOne({ username }).select( 'username email role' );
        if (!user) return res.status(400).json({ message: "User not found" })
        return res.status(200).json({data: { username: user.username, email: user.email, role: user.role}, refreshedTokenMessage: res?.locals?.refreshedTokenMessage })
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
    - Request Parameters: None
    - Request Body Content: An object having a string attribute for the `name` of the group and an array that lists all the `memberEmails`
      - Example: `{name: "Family", memberEmails: ["mario.red@email.com", "luigi.red@email.com"]}`
    - Response `data` Content: An object having an attribute `group` (this object must have a string attribute for the `name`
      of the created group and an array for the `members` of the group), an array that lists the `alreadyInGroup` members
      (members whose email is already present in a group) and an array that lists the `membersNotFound` (members whose email does not appear in the system)
      - Example: `res.status(200).json({data: {group: {name: "Family", members: [{email: "mario.red@email.com"}, {email: "luigi.red@email.com"}]}, membersNotFound: [], alreadyInGroup: []} refreshedTokenMessage: res.locals.refreshedTokenMessage})`
      - If the user who calls the API does not have their email in the list of emails then their email is added to the list of members
    - Optional behavior:
      - Returns a 400 error if the request body does not contain all the necessary attributes
      - Returns a 400 error if the group name passed in the request body is an empty string
      - Returns a 400 error if the group name passed in the request body represents an already existing group in the database
      - Returns a 400 error if all the provided emails represent users that are already in a group or do not exist in the database
      - Returns a 400 error if the user who calls the API is already in a group
      - Returns a 400 error if at least one of the member emails is not in a valid email format
      - Returns a 400 error if at least one of the member emails is an empty string
      - Returns a 401 error if called by a user who is not authenticated (authType = Simple)
 */
export const createGroup = async (req, res) => {
  try {
    const simpleAuth = verifyAuth(req, res, { authType: "Simple" });
    if(simpleAuth.authorized){
      const { name, members } = req.body;

      /// check if all provided emails are valid or an empty string
      if(members.some(member => !isValidEmail(member))) {
        return res.status(400).json({ error: 'at least one of the members emails is not in a valid email format or is an empty string' });
      }

      if (!name || !members || name === "") return res.status(400).json({ error: 'request body does not contain all the necessary attributes'})

      ///if a group with the same name already exists, error 401 is returned
      const group = await Group.findOne({ name });
      if(group){
        return res.status(400).json({ error: 'Group already exists' });
      }

      ///retrieve all the email of group members
      const groups = await Group.find({}, 'members.email' );
      const emailsInGroup = groups.flatMap(group => group.members.map(member => member.email));

      const req_issuer = await User.findOne({ refreshToken: req.cookies.refreshToken });
      if(emailsInGroup.includes(req_issuer.email)){
        return res.status(400).json({ error: 'You are already in a group' });
      }

      const alreadyInGroup = [];
      const notFoundEmails = [];
      const membersList = [];


      membersList.push({ email: req_issuer.email, user: req_issuer });

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

      ///if memberList contains at least two members, then create the group, otherwise error 400 is returned
      if(membersList.length < 2){
        return res.status(400).json({
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
          data: {
            name: newGroup.name,
            members: newGroup.members,
            alreadyInGroup: alreadyInGroup,
            membersNotFound: notFoundEmails,
            refreshedTokenMessage: res?.locals?.refreshedTokenMessage
        }});
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
    - Request Parameters: None
    - Request Body Content: None
    - Response `data` Content: An array of objects, each one having a string attribute for the `name` of the group
      and an array for the `members` of the group
      - Example: `res.status(200).json({data: [{name: "Family", members: [{email: "mario.red@email.com"}, {email: "luigi.red@email.com"}]}] refreshedTokenMessage: res.locals.refreshedTokenMessage})`
    - Optional behavior:
      - Returns a 401 error if called by an authenticated user who is not an admin (authType = Admin)
      - empty array is returned if there are no groups
 */
export const getGroups = async (req, res) => {
  try {
    ///only admin can perform this operation!
    const adminAuth = verifyAuth(req, res, { authType: "Admin" });
    if(adminAuth.authorized){
       const groups = await Group.find().select( 'name members' );
      const data = groups.map(group => {
        return {
          name: group.name,
          members: group.members.map( member => ({ email: member.email }))
        }
      })
      return res.status(200).json({data, refreshedTokenMessage: res?.locals?.refreshedTokenMessage });
    } else {
      return res.status(401).json({ error : adminAuth.cause });
    }
  } catch (err) {
    res.status(500).json(err.message)
  }
}

/**
 * Return information of a specific group
    - Request Parameters: A string equal to the `name` of the requested group
      - Example: `/api/groups/Family`
    - Request Body Content: None
    - Response `data` Content: An object having a string attribute for the `name` of the group and an array for the
      `members` of the group
      - Example: `res.status(200).json({data: {group: {name: "Family", members: [{email: "mario.red@email.com"}, {email: "luigi.red@email.com"}]}} refreshedTokenMessage: res.locals.refreshedTokenMessage})`
  - Optional behavior:
    - Returns a 400 error if the group name passed as a route parameter does not represent a group in the database
    - Returns a 401 error if called by an authenticated user who is neither part of the group (authType = Group) nor an admin (authType = Admin)
 */
export const getGroup = async (req, res) => {
  try {
    const name = req.params.name;
    const group = await Group.findOne({ name });

    if(!group){
      return res.status(400).json({ error: 'Group does not exist' });
    } else {
      const groupAuth = verifyAuth(req, res, { authType: "Group", emails: group.members.map(member => member.email) });
      if(groupAuth.authorized){
        return res.status(200).json({
          data: {
            name: group.name,
            members: group.members.map(member => ({ email: member.email })),
            refreshedTokenMessage: res?.locals?.refreshedTokenMessage
          }
        });
      } else {
        const adminAuth = verifyAuth(req, res, { authType: "Admin" });
        if(adminAuth.authorized){
          return res.status(200).json({
            data: {
              name: group.name,
              members: group.members.map(member => ({ email: member.email })),
              refreshedTokenMessage: res?.locals?.refreshedTokenMessage
            }
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
    - Request Parameters: A string equal to the `name` of the group
      - Example: `api/groups/Family/add` (user route)
      - Example: `api/groups/Family/insert` (admin route)
    - Request Body Content: An array of strings containing the emails of the members to add to the group
      - Example: `{emails: ["pietro.blue@email.com"]}`
    - Response `data` Content: An object having an attribute `group` (this object must have a string attribute for the `name` of the
      created group and an array for the `members` of the group, this array must include the new members as well as the old ones),
      an array that lists the `alreadyInGroup` members (members whose email is already present in a group) and an array that lists
      the `membersNotFound` (members whose email does not appear in the system)
      - Example: `res.status(200).json({data: {group: {name: "Family", members: [{email: "mario.red@email.com"}, {email: "luigi.red@email.com"}, {email: "pietro.blue@email.com"}]}, membersNotFound: [], alreadyInGroup: []} refreshedTokenMessage: res.locals.refreshedTokenMessage})`
    - Optional behavior:
      - error 401 is returned if all the `memberEmails` either do not exist or are already in a group
      - In case any of the following errors apply then no user is added to the group
      - Returns a 400 error if the request body does not contain all the necessary attributes
      - Returns a 400 error if the group name passed as a route parameter does not represent a group in the database
      - Returns a 400 error if all the provided emails represent users that are already in a group or do not exist in the database
      - Returns a 400 error if at least one of the member emails is not in a valid email format
      - Returns a 400 error if at least one of the member emails is an empty string
      - Returns a 401 error if called by an authenticated user who is not part of the group (authType = Group) if the route is `api/groups/:name/add`
      - Returns a 401 error if called by an authenticated user who is not an admin (authType = Admin) if the route is `api/groups/:name/insert`
 */
export const addToGroup = async (req, res) => {
  try {
    const groupName = req.params.name;
    const newMembers = req.body.emails;
    const route = req.originalUrl;


    /// check if all provided emails are valid or an empty string
    if(newMembers.some(member => !isValidEmail(member))){
      return res.status(400).json({ error: 'at least one of the members emails is not in a valid email format or is an empty string' });
    }

    if(!groupName || !newMembers || newMembers.length === 0){
      return res.status(400).json({ error: 'Request body does not contain all the necessary attributes' });
    }

    const group = await Group.findOne({ name: groupName });

    if(!group){
      return res.status(401).json({ error: 'Group does not exist' });
    } else {
      const groups = await Group.find({}, 'members.email' );
      const emailsInGroup = groups.flatMap(group => group.members.map(member => member.email));
      const alreadyInGroup = [];
      const notFoundEmails = [];

      switch (route) {
        ///Group route
        case `/api/groups/${groupName}/add`:{
          const groupAuth = verifyAuth(req, res, { authType: "Group", emails: group.members.map(member => member.email) });
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
              return res.status(400).json({
                error: 'all the members either do not exist or are already in a group',
                alreadyInGroup: alreadyInGroup,
                membersNotFound: notFoundEmails,
                message: groupAuth.cause
              });
            } else {
              await group.save();
              return res.status(200).json({
                data: {
                  name: group.name,
                  members: group.members.map(member => ({ email: member.email })),
                },
                alreadyInGroup: alreadyInGroup,
                membersNotFound: notFoundEmails,
                refreshedTokenMessage: res?.locals?.refreshedTokenMessage
              })
            }
          }
          else {
            const adminAuth = verifyAuth(req, res, { authType: "Admin" });
            if (adminAuth.authorized){
              return res.status(400).json({message:  `You must use a different url (api/groups/${groupName}/insert)`});
            }
            return res.status(401).json({error: groupAuth.cause + ", " + "you are not a member of requested group"});
          }
        }
        ///Admin route
        case `/api/groups/${groupName}/insert`:{
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
                return res.status(400).json({
                  error: 'all the members either do not exist or are already in a group',
                  alreadyInGroup: alreadyInGroup,
                  membersNotFound: notFoundEmails,
                  message: adminAuth.cause
                });
              } else {
                await group.save();
                return res.status(200).json({
                  data: {
                    name: group.name,
                    members: group.members.map(member => ({ email: member.email })),
                  },
                  alreadyInGroup: alreadyInGroup,
                  membersNotFound: notFoundEmails,
                  refreshedTokenMessage: res?.locals?.refreshedTokenMessage
                })
              }
            } else {
              return res.status(401).json({ error: adminAuth.cause + ", " + "you are not an admin" });
            }
        }
        default:
          break
      }
    }

  } catch (err) {
    res.status(500).json(err.message)
  }
}

/**
 * Remove members from a group
    - Request Parameters: A string equal to the `name` of the group
      - Example: `api/groups/Family/remove` (user route)
      - Example: `api/groups/Family/pull` (admin route)
    - Request Body Content: An object having an attribute `group`
      - Example: `{emails: ["pietro.blue@email.com"]}`
    - Response `data` Content: An object having an attribute `group` (this object must have a string attribute for the `name` of the
      created group and an array for the `members` of the group, this array must include only the remaining members),
      an array that lists the `notInGroup` members (members whose email is not in the group) and an array that lists the
      `membersNotFound` (members whose email does not appear in the system)
      - Example: `res.status(200).json({data: {group: {name: "Family", members: [{email: "mario.red@email.com"}, {email: "luigi.red@email.com"}]}, membersNotFound: [], notInGroup: []} refreshedTokenMessage: res.locals.refreshedTokenMessage})`
    - Optional behavior:
      - error 401 is returned if the group does not exist
      - error 401 is returned if all the `memberEmails` either do not exist or are not in the group
      - In case any of the following errors apply then no user is removed from the group
      - Returns a 400 error if the request body does not contain all the necessary attributes
      - Returns a 400 error if the group name passed as a route parameter does not represent a group in the database
      - Returns a 400 error if all the provided emails represent users that do not belong to the group or do not exist in the database
      - Returns a 400 error if at least one of the emails is not in a valid email format
      - Returns a 400 error if at least one of the emails is an empty string
      - Returns a 400 error if the group contains only one member before deleting any user
      - Returns a 401 error if called by an authenticated user who is not part of the group (authType = Group) if the route is `api/groups/:name/remove`
      - Returns a 401 error if called by an authenticated user who is not an admin (authType = Admin) if the route is `api/groups/:name/pull`
 */
export const removeFromGroup = async (req, res) => {
  try{
    const groupName = req.params.name;
    const emails = req.body.emails;
    const route = req.originalUrl;

    if (!groupName || emails.length === 0 ){
      return res.status(400).json({ error: 'Request body does not contain all the necessary attributes' });
    }

    /// check if all provided emails are valid or an empty string
    if(emails.some(member => !isValidEmail(member))){
      return res.status(400).json({ error: 'at least one of the members emails is not in a valid email format or is an empty string' });
    }

    const group = await Group.findOne({ name: groupName });
    if(!group){
      return res.status(400).json({ error: 'Group does not exist' });
    } else {

      if(group.members.length === 1){
        return res.status(400).json({ error: 'the group contains only one member' })
      }

      const groups = await Group.find({}, 'members.email' );
      const emailsInGroup = groups.flatMap(group => group.members.map(member => member.email));
      const notInGroup = [];
      const notFoundEmails = [];
      switch (route) {
          ///Group route
        case `/api/groups/${groupName}/remove`:{
          const groupAuth = verifyAuth(req, res, { authType: "Group", emails: group.members.map(member => member.email) });
          if(groupAuth.authorized){
            for (const email of emails) {
              const user = await User.findOne({ email: email });
              if(!user){
                notFoundEmails.push(email);
              } else if(!emailsInGroup.includes(email)){
                notInGroup.push(email);
              } else {
                // toRemove.push({email: email, user: user});
                const index = group.members.findIndex(member => member.email === email);
                group.members.splice(index, 1);
              }
            }

            if(notFoundEmails.length + notInGroup.length === emails.length){
              return res.status(400).json({
                error: 'all the members either do not exist or are already in a group',
                notInGroup: notInGroup,
                membersNotFound: notFoundEmails,
                message: groupAuth.cause
              });
            } else {
              await group.save();
              return res.status(200).json({
                data: {
                  name: group.name,
                  members: group.members.map(member => member.email)
                },
                notInGroup: notInGroup,
                membersNotFound: notFoundEmails,
                refreshedTokenMessage: res?.locals?.refreshedTokenMessage
              })
            }
          }
          else {
            const adminAuth = verifyAuth(req, res, { authType: "Admin" });
            if (adminAuth.authorized){
              return res.status(400).json({message:  `You must use a different url (api/groups/${groupName}/pull)`});
            }
            return res.status(401).json({error: groupAuth.cause + ", " + "you are not a member of requested group"});
          }
        }
          ///Admin route
        case `/api/groups/${groupName}/pull`: {
          const adminAuth = verifyAuth(req, res, {authType: "Admin"});
          if (adminAuth.authorized) {
            for (const email of emails) {
              const user = await User.findOne({email: email});
              if (!user) {
                notFoundEmails.push(email);
              } else if (!emailsInGroup.includes(email)) {
                notInGroup.push(email);
              } else {
                // toRemove.push({email: email, user: user});
                const index = group.members.findIndex(member => member.email === email);
                group.members.splice(index, 1);
              }
            }

            if (notFoundEmails.length + notInGroup.length === emails.length) {
              return res.status(400).json({
                error: 'all the members either do not exist or are already in a group',
                notInGroup: notInGroup,
                membersNotFound: notFoundEmails,
                message: adminAuth.cause
              });
            } else {
              await group.save();
              return res.status(200).json({
                data: {
                  name: group.name,
                  members: group.members.map(member => member.email)
                },
                notInGroup: notInGroup,
                membersNotFound: notFoundEmails,
                refreshedTokenMessage: res?.locals?.refreshedTokenMessage
              })
            }
          } else {
            return res.status(401).json({error: adminAuth.cause + ", " + "you are not an admin"});
          }
        }
        default:
          break;
      }
    }
  } catch(err){
    res.status(500).json(err.message)
  }
}

/**
 * Delete a user
    - Request Parameters: None
    - Request Body Content: A string equal to the `email` of the user to be deleted
      - Example: `{email: "luigi.red@email.com"}`
    - Response `data` Content: An object having an attribute that lists the number of `deletedTransactions` and a boolean attribute that
      specifies whether the user was also `deletedFromGroup` or not.
      - Example: `res.status(200).json({data: {deletedTransaction: 1, deletedFromGroup: true}, refreshedTokenMessage: res.locals.refreshedTokenMessage})`
    - Optional behavior:
      - error 401 is returned if the user does not exist
      - If the user is the last user of a group then the group is deleted as well
      - Returns a 400 error if the request body does not contain all the necessary attributes
      - Returns a 400 error if the email passed in the request body is an empty string
      - Returns a 400 error if the email passed in the request body is not in correct email format
      - Returns a 400 error if the email passed in the request body does not represent a user in the database
      - Returns a 401 error if called by an authenticated user who is not an admin (authType = Admin)

 */
export const deleteUser = async (req, res) => {
  try {
    const { email } = req.body;
    const adminAuth = verifyAuth(req, res, { authType: "Admin" });
    if (adminAuth.authorized) {
      ///find user to be deleted
      const user = await User.findOne({ email });
      if(!user){
        return res.status(401).json({ error: 'User not found' });
      } else {
        const group = await Group.findOne({ 'members.email': email });
        if(!group){
          //remove user that not belong to any group
          await User.deleteOne({ email });
          return res.status(200).json({ data: { deletedTransaction: "Transaction count not implemented yet", deletedFromGroup: false }, refreshedTokenMessage: res?.locals?.refreshedTokenMessage });
        } else {
          //user belongs to a group
          //TODO: count of transactions performed by deleted user
          if (group.members.length === 1) {
            //remove group
            await Group.deleteOne({ name: group.name });
            //delete the user
            await User.deleteOne({ email });
            return res.status(200).json({ data: { deletedTransaction: "Transaction count not implemented yet", deletedFromGroup: true }, refreshedTokenMessage: res?.locals?.refreshedTokenMessage });
          }
        }
      }

    } else {
      return res.status(401).json({ error: adminAuth.cause + ", " + "you are not an admin"});
    }
  } catch (err) {
    res.status(500).json(err.message)
  }
}

/**
 * Delete a group
    - Request Parameters: None
    - Request Body Content: A string equal to the `name` of the group to be deleted
      - Example: `{name: "Family"}`
    - Response `data` Content: A message confirming successful deletion
      - Example: `res.status(200).json({data: {message: "Group deleted successfully"} , refreshedTokenMessage: res.locals.refreshedTokenMessage})`
    - Optional behavior:
      - Returns a 400 error if the request body does not contain all the necessary attributes
      - Returns a 400 error if the name passed in the request body is an empty string
      - Returns a 400 error if the name passed in the request body does not represent a group in the database
      - Returns a 401 error if called by an authenticated user who is not an admin (authType = Admin)
 */
export const deleteGroup = async (req, res) => {
  try {
    const {name} = req.body;

    ///check if undefined or empty string
    if (!name) {
      return res.status(400).json({ error: 'Request body does not contain all the necessary attributes' });
    }
    const adminAuth = verifyAuth(req, res, { authType: "Admin" });
    if (adminAuth.authorized) {

      ///find group to be deleted
      const group = await Group.findOne({ name });
      if(!group){
        return res.status(400).json({ error: 'Group not found' });
      } else {
        ///delete the group
        await Group.deleteOne({ name });
        return res.status(200).json({ data: {message: 'Group deleted succesfully'}, refreshedTokenMessage: res?.locals?.refreshedTokenMessage });
      }

    } else {
      return res.status(401).json({ error: adminAuth.cause + ", " + "you are not an admin"});
    }
  } catch (err) {
    res.status(500).json(err.message)
  }
}