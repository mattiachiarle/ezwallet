import { Group, User } from "../models/User.js";
import { transactions } from "../models/model.js";
import { verifyAuth } from "./utils.js";
import jwt from 'jsonwebtoken';

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
      res.status(400).json(userAuth.message);
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
      res.status(400).json({ message: userAuth.message + adminAuth.message });
      return;
    }

    const user = await User.findOne({ username: req.params.username }, { username: 1, email: 1, role: 1, _id: 0 })
    if (!user) return res.status(400).json({ error: "User not found" })
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
    const cookie = req.cookies;

    if(!name || !memberEmails){
      res.status(400).json({error: "You didn't pass all the parameters"});
      return;
    }

    const re = new RegExp(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/);

    const response = verifyAuth(req,res,{authType: "Simple"})
    if(!response.authorized){
      res.status(400).json({error: response.message});
      return;
    }

    const decodedAccessToken = jwt.verify(cookie.accessToken, process.env.ACCESS_KEY);
    const creatorEmail = decodedAccessToken.email;
    const creatorGroup = await Group.findOne({ "members.email": creatorEmail });

    if(creatorGroup){
      res.status(400).json({error: "The creator is already in a group"});
      return;
    }

    if(!memberEmails.includes(creatorEmail)){
      memberEmails.push(creatorEmail);
    }

    const existingGroup = await Group.findOne({ name: req.body.name }); //Check if there's a group with the same name
    if (existingGroup) return res.status(400).json({ error: "There's already an existing group with the same name" }); //error

    for (let member of memberEmails) {

        if(!re.test(member)){
          res.status(400).json({error: "The following email " + member + " doesn't respect the correct format"});
          return;
        }

        let existingUser = await User.findOne({ email: member });
        if (!existingUser) membersNotFound.push(member);

      let groupJoined = await Group.findOne({ "members.email": member });
      if (groupJoined) alreadyInGroup.push(member);

      if (!groupJoined && existingUser) {
        membersAdded.push({ email: member, user: existingUser });
      }

    }

    if (membersAdded.length == 0) {
      return res.status(400).json({ error: "All the members either didn't exist or were already in a group" }); //error
    }

    const newGroup = await Group.create({ name: name, members: membersAdded });
    res.json({ data: { group: newGroup, alreadyInGroup: alreadyInGroup, membersNotFound: membersNotFound }, message: "Group created" });

  } catch (err) {
    res.status(500).json({error: err.message})
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
    if (!response.authorized) {
      res.status(400).json({ error: response.message });
      return;
    }

    const result = await Group.find({}, { name: 1, members: 1, _id: 0 });
    res.status(200).json({ data: result, message: "Groups found" });

  } catch (err) {
    res.status(500).json({error: err.message})
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

      const groupEmails = group.members.map((m) => m.email);

      const user = verifyAuth(req, res, { authType: "Group", emails: groupEmails });
      const admin = verifyAuth(req, res, { authType: "Admin" });

      if (!admin.authorized && !user.authorized) {
        res.status(400).json({ error: user.message + admin.message });
        return;
      }
      else {
        res.status(200).json({ data: group, message: "Group found" });
      }
    }
    else {
      const login = verifyAuth(req, res, { authType: "Simple" });
      if (!login.authorized) {
        res.status(400).json({ error: login.message });
        return;
      }
      else {
        res.status(400).json({ error: "The group doesn't exist" });
        return;
      }
    }
  } catch (err) {
    res.status(500).json({error: err.message})
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
    let groupName = req.params.name;
    let newMembersEmails = req.body.emails;
    let membersAdded = [];
    let alreadyInGroup = [];
    let membersNotFound = [];
    const group = await Group.findOne({ name: groupName });

    if (group) {

      const groupEmails = group.members.map((m) => m.email);

      const userAuth = verifyAuth(req, res, { authType: "Group", emails: groupEmails });
      const adminAuth = verifyAuth(req, res, { authType: "Admin" });
      
      if(!newMembersEmails){
        res.status(400).json({error: "Error in the parameters"});
        return;
      }

      if(newMembersEmails === []){
        res.status(400).json({error: "The list of emails is empty"});
        return;
      }
      
      if (!userAuth.authorized && !adminAuth.authorized) {
        res.status(400).json({ message: adminAuth.message });
        return;
      }

      const re = new RegExp(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/);

      for (let member of newMembersEmails) {

        if(!re.test(member)){
          res.status(400).json({error: "The following email " + member + " doesn't respect the correct format"});
          return;
        }

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
        
        Group.members.findOneAndUpdate( { "_id":group.name }, { $push : {members: {email: member, user: existingUser}} }, { new: true })
          .then(()=>{membersAdded.push({ email: member, user: existingUser });})
          .catch(()=>{res.status(400).json({message: "Error adding a member"});});
       
      }

      if (membersAdded.length === 0) {
        return res.status(400).json({ message: "All the members either didn't exist or were already in a group" }); 
      }

      res.status(200).json({ data: { group: group, alreadyInGroup: alreadyInGroup, membersNotFound: membersNotFound }, message: "New members added", refreshedTokenMessage: res.locals.refreshedTokenMessage });
    } else {
      res.status(401).json({ message: "The group doesn't exist" });
    }
  } catch (err) {
    res.status(500).json({error: err.message});
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
    let { groupName, oldMembersEmails } = req.body;
    let membersRemoved = [];
    let notInGroup = [];
    let membersNotFound = [];

    if(!groupName){
      return res.status(400).json({message: "Error in the parameters" });
    }

    const group = await Group.findOne({ name: groupName });

    if (group) {
      const groupEmails = group.members.map((m) => m.email);

      const userAuth = verifyAuth(req, res, { authType: "Group", emails: groupEmails });
      const adminAuth = verifyAuth(req, res, { authType: "Admin" });

      if (!userAuth.authorized && !adminAuth.authorized) {
        res.status(400).json({ message: userAuth.message + adminAuth.message });
        return;
      }

      if(!oldMembersEmails){
        res.status(400).json({error: "You didn't pass all the parameters"});
        return;
      }

      if(oldMembersEmails === []){
        res.status(400).json({error: "The list of emails is empty"});
        return;
      }

      if(groupEmails.length === 1){
        console.log(groupEmails);
        res.status(400).json({ message: "Error group contains only one user" });
        return;
      }

      const re = new RegExp(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/);

      for (let member of oldMembersEmails) {

        if(!re.test(member)){
          res.status(400).json({error: "The following email " + member + " doesn't respect the correct format"});
          return;
        }

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

        if(group.members.length === 1){ // the group must contains at least one member
          break;
        }

        if(member === groupEmails[0]){ // try to removing the group owner
          break;
        }

        Group.members.findOneAndUpdate({ "_id" : group.name },{ $pull : {members: {email: member, user: existingUser}} }, { new: true })
        .then(()=>{membersRemoved.push({ email: member, user: existingUser });})
        .catch(()=>{res.status(400).json({ message: "Error removing a member" });});

      }

      if (membersRemoved.length === 0) {
        return res.status(400).json({ message: "All the members either didn't exist or were not in the group" });
      }

      return res.status(200).json({ data: { group: group, notInGroup: notInGroup, membersNotFound: membersNotFound }, message: "Members removed", refreshedTokenMessage: res.locals.refreshedTokenMessage });
    } else {
      return res.status(400).json({ message: "The group doesn't exist" });
    }
  } catch (err) {
    res.status(500).json({error: err.message});
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

    const adminAuth = verifyAuth(req, res, { authType: "Admin" });
    if (!adminAuth.authorized)
      return res.status(400).json({ message: adminAuth.message });

    const email = req.body.email;
    if (!email)
        return res.status(400).json({ message: "Body lacking email parameter" });
    
    if (!email.trim().length)
        return res.status(400).json({ message: "Email parameter is not valid" });

    const re = new RegExp(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/);
    if(!re.test(email))
      return res.status(400).json({error: "The email parameter doesn't respect the correct format"});

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
        res.status(400).json({ message: error.message });
      });

  } catch (err) {
    res.status(500).json({error : err.message});
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

    if(!groupName){
      return res.status(400).json({message: "Error in the parameters" });
    }

    const group = await Group.findOne({ name: groupName });

    if (group) {

      const adminAuth = verifyAuth(req, res, { authType: "Admin" });

      if (!adminAuth.authorized) {
        res.status(400).json({ message: adminAuth.message });
        return;
      }

      const flag = await Group.deleteOne({ name : groupName });

      if (flag){
        return res.status(200).json({ data: {group: group}, message: "Successful deletion", refreshedTokenMessage: res.locals.refreshedTokenMessage });
      }else{
        return res.status(400).json({ message: "Unsuccessful deletion" });
      }

    } else {
      return res.status(400).json({ message: "The group doesn't exist" });
    }
  } catch (err) {
    return res.status(500).json({error: err.message});
  }
}