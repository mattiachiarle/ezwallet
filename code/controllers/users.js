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
    const userAuth = verifyAuth(req, res, { authType: "Admin" });
    if (!userAuth.authorized) {
      res.status(401).json(userAuth.message);
      return;
    }

    const users = await User.find();
    let filter = users.map(u => Object.assign({}, { username: u.username, email: u.email, role: u.role }))

    res.status(200).json(filter);
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
    const userAuth = verifyAuth(req, res, { authType: "User", username: req.params.username });
    const adminAuth = verifyAuth(req, res, { authType: "Admin" });

    if (!userAuth.authorized && !adminAuth.authorized) {
      res.status(401).json({ message: userAuth.message + adminAuth.message });
      return;
    }

    const user = await User.findOne({ username: req.params.username }, { username: 1, email: 1, role: 1, _id: 0 })
    if (!user) return res.status(400).json({ message: "User not found" })
    res.status(200).json(user)
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
    const alreadyInGroup = [];
    const membersNotFound = [];
    const membersAdded = [];

    const response = verifyAuth(req, res, { authType: "Simple" })
    if (!response.flag) {
      res.status(401).json({ message: response.message });
      return;
    }

    const existingGroup = await Group.findOne({ name: req.body.name }); //Check if there's a group with the same name
    if (existingGroup) return res.status(401).json({ message: "There's already an existing group with the same name" }); //error

    for (let member of memberEmails) {

      let existingUser = await User.findOne({ email: member });
      if (!existingUser) membersNotFound.push(member);

      let groupJoined = await Group.findOne({ "members.email": member });
      if (groupJoined) alreadyInGroup.push(member);

      if (!groupJoined && existingUser) {
        membersAdded.push({ email: member, user: existingUser });
      }

    }

    if (membersAdded.length == 0) {
      return res.status(401).json({ message: "All the members either didn't exist or were already in a group" }); //error
    }

    const newGroup = await Group.create({ name: name, members: membersAdded });
    res.json({ data: { group: newGroup, alreadyInGroup: alreadyInGroup, membersNotFound: membersNotFound }, message: "Group created" });

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

    const response = verifyAuth(req, res, { authType: "Admin" })
    if (!response.flag) {
      res.status(401).json({ message: response.message });
      return;
    }

    const result = await Group.find({}, { name: 1, members: 1, _id: 0 });
    res.status(200).json({ data: { param: result }, message: "Groups found" });

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
    const group = await Group.findOne({ name: req.params.name }, { name: 1, members: 1, _id: 0 });

    if (group) {

      const user = verifyAuth(req, res, { authType: "Group", groupFound: group });
      const admin = verifyAuth(req, res, { authType: "Admin" });

      if (!admin.flag) {
        if (!user.flag) {
          res.status(401).json({ message: user.message + admin.message });
          return;
        }
      }
      else {
        res.status(200).json({ data: { param: group }, message: "Group found" });
      }
    }
    else {
      const login = verifyAuth(req, res, { authType: "Simple" });
      if (!login.flag) {
        res.status(401).json({ message: login.message });
        return;
      }
      else {
        res.status(400).json({ message: "The group doesn't exist" });
        return;
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
    let groupName = req.params.name; // not specified 
    let newMembersEmails = req.body;
    let membersAdded = [];
    let alreadyInGroup = [];
    let membersNotFound = [];
    const group = await Group.findOne({ name: groupName }); // find a group with the same name

    if (group) {
      const user = verifyAuth(req, res, { authType: "Group", groupFound: group }); 
      const admin = verifyAuth(req, res, { authType: "Admin" });

      if (!user.flag && !admin.flag) {
        res.status(401).json({ message: groupOwner.message + admin.message });
        return;
      }

      for (let member of newMembersEmails) {

        let existingUser = await User.findOne({ email: member });
        if (!existingUser) {
          membersNotFound.push(member);
          continue;
        }
        let groupJoined = await Group.findOne({ "members.email": member });
        if (groupJoined) {
          alreadyInGroup.push(member);
          continue;
        }
        //if (!groupJoined && existingUser)
        membersAdded.push({ email: member, user: existingUser });
        group.members.push({ email: member, user: existingUser });
      }

      if (membersAdded.length == 0) {
        return res.status(401).json({ message: "All the members either didn't exist or were already in a group" }); //error
      }

      res.json({ data: { group: group, alreadyInGroup: alreadyInGroup, membersNotFound: membersNotFound }, message: "New members added" });
    } else {
      res.status(401).json({ message: "The group doesn't exist" });
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
  try {
    let { groupName, newMembersEmails } = req.body;
    let membersRemoved = [];
    let notInGroup = [];
    let membersNotFound = [];
    const group = await Group.findOne({ name: groupName });// find a group with the same name

    if (group) {
      const user = verifyAuth(req, res, { authType: "Group", groupFound: group });
      const admin = verifyAuth(req, res, { authType: "Admin" });

      if (!user.flag && !admin.flag) {
        res.status(401).json({ message: groupOwner.message + admin.message });
        return;
      }

      for (let member of newMembersEmails) {

        let existingUser = await User.findOne({ email: member });
        if (!existingUser) {
          membersNotFound.push(member);
          continue;
        }
        let groupJoined = await Group.findOne({ "members.email": member });
        if (!groupJoined) {
          notInGroup.push(member);
          continue;
        }
        //if (groupJoined && existingUser)
        membersRemoved.push({ email: member, user: existingUser });
        group.members.pop({ email: member, user: existingUser });
      }

      if (membersRemoved.length == 0) {
        return res.status(401).json({ message: "All the members either didn't exist or were not in the group" }); //error
      }

      res.json({ data: { group: group, notInGroup: notInGroup, membersNotFound: membersNotFound }, message: "New members added" });
    } else {
      res.status(401).json({ message: "The group doesn't exist" });
    }
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

    if (!verifyAuth(req, res, { authType: "Admin" }).authorized) {
      return;
    }

    const email = req.body.email;
    let deletedTransactionsCount = 0;
    let deletedFromGroupCount = false;

    User.findOne({ email: email })
      .then((user) => {
        if (!user) throw new Error("User not found");

        return Promise.all([
          transactions.deleteMany({ username: user.username }),
          Group.deleteMany({ "members.email": email })
        ]);
      })
      .then(([deletedTransactions, deletedFromGroup]) => {
        deletedTransactionsCount = deletedTransactions.deletedCount;
        deletedFromGroupCount = deletedFromGroup.deletedCount > 0;

        return User.deleteOne({ email: email });
      })
      .then(() => {
        res.status(200).json({
          data: {
            deletedTransactions: deletedTransactionsCount,
            deletedFromGroup: deletedFromGroupCount,
          },
        });
      })
      .catch((error) => {
        res.status(500).json({ message: error.message });
      });

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
    let groupName = req.body;

    const group = await Group.findOne({ name: groupName });// find a group with the same name

    if (group) {

      const admin = verifyAuth(req, res, { authType: "Admin" });

      if (!admin.flag) {
        res.status(401).json({ message: admin.message });
        return;
      }

      const flag = await Group.deleteOne({group : group});

      if (flag){
        res.json({ data: { group: group, message: "Successful deletion" }});
      }else{
        res.statu(401).json({message: "Unsuccessful deletion" })
      }

    } else {
      res.status(401).json({ message: "The group doesn't exist" });
    }
  } catch (err) {
    res.status(500).json(err.message)
  }
}