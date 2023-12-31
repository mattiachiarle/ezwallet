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
    if (!userAuth.flag) {
      res.status(401).json(userAuth.cause);
      return;
    }

    const users = await User.find();
    let filter = users.map(u => Object.assign({}, { username: u.username, email: u.email, role: u.role }))

    res.status(200).json({data: filter, refreshedTokenMessage: res.locals.refreshedTokenMessage});
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

    if (!userAuth.flag && !adminAuth.flag) {
      res.status(401).json({ message: userAuth.cause + " " + adminAuth.cause });
      return;
    }

    const user = await User.findOne({ username: req.params.username }, { username: 1, email: 1, role: 1, _id: 0 })
  
    if (!user) return res.status(400).json({ error: "User not found" })
    return res.status(200).json({data: user, refreshedTokenMessage: res.locals.refreshedTokenMessage})
  } catch (error) {
    return res.status(500).json(error.message)
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
    
    if(!name || !memberEmails)
      return res.status(400).json({error: "You didn't pass all the parameters"});
    
    if(name.trim()=="")
      return res.status(400).json({error: "Name can't be an empty string"});
    
    const re = new RegExp(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/);
    
    const response = verifyAuth(req,res,{authType: "Simple"})
    if(!response.flag) {
      return res.status(401).json({error: response.cause});
    }

    const decodedAccessToken = jwt.verify(cookie.accessToken, process.env.ACCESS_KEY);
    const creatorEmail = decodedAccessToken.email;
    const creatorGroup = await Group.findOne({ "members.email": creatorEmail });
  
    if(creatorGroup){
      res.status(400).json({error: "The creator is already in a group"});
      return;
    }
    
    let newMembersEmails = memberEmails;
    if(!memberEmails.includes(creatorEmail)){
      newMembersEmails = [creatorEmail, ...memberEmails];
    }
    
    const existingGroup = await Group.findOne({ name: req.body.name }); //Check if there's a group with the same name
    
    if (existingGroup){
      return res.status(400).json({ error: "There's already an existing group with the same name" }); //error
    } 
    
    for (let member of newMembersEmails) {
      
      if(!re.test(member)){
        res.status(400).json({error: "The following email " + member + " doesn't respect the correct format"}); //it tests also if the string is empty since the re won't accept it
        return;
      }
      
      let existingUser = await User.findOne({ email: member });
    
      if (!existingUser){
        membersNotFound.push(member);
      } 
    
      let groupJoined = await Group.findOne({ "members.email": member });
      
      if (groupJoined){
        alreadyInGroup.push(member);
      } 
    
      if (!groupJoined && existingUser) {
        membersAdded.push({ email: member, user: existingUser });
      }
    }
    
    if (membersAdded.length == 1 && membersAdded[0].email == creatorEmail && newMembersEmails.length>1) {
      return res.status(400).json({ error: "All the members (except the creator) either didn't exist or were already in a group" }); //error
    }
    
    const newGroup = await Group.create({ name: name, members: membersAdded });
    const addedEmails = newGroup.members.map((m) => {return {email: m.email}});
    
    res.status(200).json({ data: { group: {name: newGroup.name, members: addedEmails}, alreadyInGroup: alreadyInGroup, membersNotFound: membersNotFound }, refreshedTokenMessage: res.locals.refreshedTokenMessage });
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
    if (!response.flag) {
      return res.status(401).json({ error: response.cause });
    }

    const result = await Group.find({}, { name: 1, members: 1, _id: 0 });
    res.status(200).json({ data: result, refreshedTokenMessage: res.locals.refreshedTokenMessage });

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
    if (!group) return res.status(400).json({ error: "The group doesn't exist" });
      
    const groupEmails = group.members.map((m) => m.email);
    const user = verifyAuth(req, res, { authType: "Group", emails: groupEmails });
    const admin = verifyAuth(req, res, { authType: "Admin" });
    
    if (!admin.flag && !user.flag) {
      return res.status(401).json({ error: user.cause + " " + admin.cause });
    }
    
    res.status(200).json({ data: {group: group}, refreshedTokenMessage: res.locals.refreshedTokenMessage });
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
    let updateGroup = {};

    // Check group existence
    if(!groupName || !newMembersEmails){
        return res.status(400).json({error: "You didn't pass all the parameters"});
    }

    const group = await Group.findOne({ name: groupName });
    if (!group) return res.status(400).json({ error: "The group doesn't exist" });

    // Check user emails
    if(newMembersEmails.length === 0) {
      return res.status(400).json({error: "The list of emails is empty"});
    }

    // Check authentication
    const groupEmails = group.members.map((m) => m.email);
    const groupAuth = verifyAuth(req, res, { authType: "Group", emails: groupEmails});
    const adminAuth = verifyAuth(req, res, { authType: "Admin" });

    if (req.path == `/groups/${req.params.name}/add` && !groupAuth.flag) {
      return res.status(401).json({error: groupAuth.cause});
    }

    if (req.path == `/groups/${req.params.name}/insert` && !adminAuth.flag) {
      return res.status(401).json({error: adminAuth.cause});
    }
    
    const re = new RegExp(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/);

    for (let member of newMembersEmails) {
      if(!re.test(member)) {
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
      
      updateGroup = await Group.findOneAndUpdate( 
          { "name": group.name }, 
          { $push : {members: {email: member, user: existingUser} } }, 
          { new: true }
        )
      membersAdded.push({ email: member, user: existingUser });  
    }
    
    if (membersAdded.length === 0) {
      return res.status(400).json({ error: "All the members either didn't exist or were already in a group" }); 
    }

    res.status(200).json({ data: { group: updateGroup, alreadyInGroup: alreadyInGroup, membersNotFound: membersNotFound }, message: "New members added", refreshedTokenMessage: res.locals.refreshedTokenMessage });
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
    let groupName = req.params.name;
    let oldMembersEmails = req.body.emails;
    let membersRemoved = [];
    let notInGroup = [];
    let membersNotFound = [];
    let updatedGroup = [];

    // Check validity parameters
    if(!groupName) return res.status(400).json({error: "Error in the parameters" });
    if(!oldMembersEmails) return res.status(400).json({error: "You didn't pass all the parameters"});
    if(oldMembersEmails.length === 0) return res.status(400).json({error: "The list of emails is empty"});

    const group = await Group.findOne({ name: groupName });
    if (!group) return res.status(400).json({ error: "The group doesn't exist" });

    // Check authentication
    const groupEmails = group.members.map((m) => m.email);
    if(groupEmails.length === 1) return res.status(400).json({ error: "Error group contains only one user" });

    const groupAuth = verifyAuth(req, res, { authType: "Group", emails: groupEmails });
    const adminAuth = verifyAuth(req, res, { authType: "Admin" });
    
    if (req.path == `/groups/${req.params.name}/remove` && !groupAuth.flag) {
      return res.status(401).json({error: groupAuth.cause});
    }

    if (req.path == `/groups/${req.params.name}/pull` && !adminAuth.flag) {
      return res.status(401).json({error: adminAuth.cause});
    }
    
    const re = new RegExp(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/);
    
    for (let memberEmail of oldMembersEmails) {
      if(!re.test(memberEmail))
        return res.status(400).json({error: "The following email " + memberEmail + " doesn't respect the correct format"});
      
      let existingUser = await User.findOne({ email: memberEmail });
      if (!existingUser) {
        membersNotFound.push(memberEmail);
        continue;
      }

      let groupJoined = await Group.findOne({ "members.email": memberEmail });
      if (!groupJoined) {
        notInGroup.push(memberEmail);
        continue;
      }

      updatedGroup = await Group.findOneAndUpdate(
        { name: groupName },
        { $pull: { "members": { "email": memberEmail } } },
        { new: true }
      );

      membersRemoved.push({ email: memberEmail, user: existingUser });
    }

    if (membersRemoved.length === 0) {
      return res.status(400).json({ error: "All the members either didn't exist or were not in the group" });
    }
    
    res.status(200).json({ data: { group: updatedGroup, notInGroup: notInGroup, membersNotFound: membersNotFound }, message: "Members removed", refreshedTokenMessage: res.locals.refreshedTokenMessage });
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
    if (!adminAuth.flag)
      return res.status(401).json({ error: adminAuth.cause });

    const email = req.body.email;
    if (!email)
      return res.status(400).json({ error: "Body lacking email parameter or is empty" });

    const re = new RegExp(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/);
    if(!re.test(email))
      return res.status(400).json({error: "The email parameter doesn't respect the correct format"});

    let deletedTransactionsCount = 0;
    let deletedFromGroupCount = false;

    const user = await User.findOne({ email: email });
    if (!user) return res.status(400).json({error: "User not present in the DB"}); 

    if(user.role === 'Admin') return res.status(400).json({error: "Admins cannot be deleted from the DB"});

    const deletedTransactions = await transactions.deleteMany({ username: user.username });
    deletedTransactionsCount = deletedTransactions.deletedCount;
    
    const group = await Group.findOne({ "members.email": email });
    
    if (group) {
      deletedFromGroupCount = true;
      if(group.members.length === 1) { // if the user is the only member of the group delete the group
        await Group.deleteOne({ name: group.name });
      } else { // if the user is not the only member of the group, delete the user from the group
        await Group.updateOne({ name: group.name }, { $pull: { members: { email: email } } });
      }
    }
    
    const deletedUser = await User.deleteOne({ email: email });

    return res.status(200).json({
      data: {
        deletedTransactions: deletedTransactionsCount,
        deletedFromGroup: deletedFromGroupCount,
      },
      message: "User deleted",
      refreshedTokenMessage: res.locals.refreshedTokenMessage
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

    let groupName = req.body.name;
    if(!groupName) return res.status(400).json({error: "Error in the parameters" });

    const group = await Group.findOne({ name: groupName });
    if (!group) return res.status(400).json({ error: "The group doesn't exist" });

    const adminAuth = verifyAuth(req, res, { authType: "Admin" });
    if (!adminAuth.flag) {
      return res.status(401).json({ error: adminAuth.cause });
    }

    const deletedGroup = await Group.deleteOne({ name : groupName });
      
    return res.status(200).json({ 
      data: {message: "Group deleted successfully"}, 
      refreshedTokenMessage: res.locals.refreshedTokenMessage });

  } catch (err) {
    return res.status(500).json({error: err.message});
  }
}