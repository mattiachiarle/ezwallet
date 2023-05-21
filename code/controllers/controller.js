import { categories, transactions } from "../models/model.js";
import { Group, User } from "../models/User.js";
import { handleDateFilterParams, handleAmountFilterParams, verifyAuth } from "./utils.js";

/**
 * Create a new category
  - Request Body Content: An object having attributes `type` and `color`
  - Response `data` Content: An object having attributes `type` and `color`
 */
export const createCategory = (req, res) => {
    try {
        
        const adminAuth = verifyAuth(req, res, { authType: "Admin" });
        if(!adminAuth.authorized) {
          res.status(401).json(adminAuth.message);
          return;
        }
        
        const { type, color } = req.body;
        const new_categories = new categories({ type, color });
        new_categories.save()
            .then(data => res.json(data))
            .catch(err => { throw err })
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}

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
        
        const adminAuth = verifyAuth(req, res, { authType: "Admin" });
        if(!adminAuth.authorized) {
          res.status(401).json(adminAuth.message);
          return;
        }

        const { type, color } = req.body;

        // Check if the category exists
        categories.findOne({ type: req.params.type })
        .then((category) => {
            if (!category)  return res.status(400).json({ message: "Category does not exist" });

            // Validate the new parameters
            if (type && typeof type !== "string") return res.status(400).json({ message: "Invalid type parameter" });
            if (color && typeof color !== "string") return res.status(400).json({ message: "Invalid color parameter" });

            // Prepare the update object
            const updateObject = {};
            if (type) updateObject.type = type;
            if (color) updateObject.color = color;

            // Update the category
            return categories.updateOne(
                { type: req.params.type },
                { $set: updateObject }
            );
        })
        .then(({ modifiedCategory }) => {
            // Update the transactions that had the modified category
            return transactions.updateMany(
                { type: req.params.type },
                { $set: { type: type } }
            );
        })
        .then(({ modifiedCount }) => {
            res.status(200).json({ message: "Category edited successfully", count: modifiedCount });
        })
        .catch(err => { throw err });
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}

/**
 * Delete a category
  - Request Body Content: An array of strings that lists the `types` of the categories to be deleted
  - Response `data` Content: An object with parameter `message` that confirms successful deletion and a parameter `count` that is equal to the count of affected transactions (deleting a category sets all transactions with that category to have `investment` as their new category)
  - Optional behavior:
    - error 400 is returned if the specified category does not exist
 */
export const deleteCategory = async (req, res) => {
    try {

        const adminAuth = verifyAuth(req, res, { authType: "Admin" });
        if(!adminAuth.authorized) {
          res.status(401).json(adminAuth.message);
          return;
        }

        const { types } = req.body;
        categories.find({ type: { $in: types } })
        .then((existingCategories) => {
            // Check if all the categories exist
            if (existingCategories.length !== types.length) {
                throw new Error("Category does not exist");
            }

            return categories.countDocuments();
        })
        .then((categoriesCount) => {
            // Check that at least one category will remain in the db
            if (categoriesCount - types.length < 1) {
                // Remove the first category type from the array 
                types.shift();
                if (types.length === 0) {
                    throw new Error("Cannot delete last category");
                }
            }

            // Delete all the categories in types
            return categories.deleteMany({ type: { $in: types } });
        })
        .then(() => {
            // Find the first category after deletion
            return categories.findOne({ type: { $nin: types } });
        })
        .then((firstCategory) => {
            // Update all the transactions with the type of the first category found
            const firstCategoryType = firstCategory.type

            return transactions.updateMany(
                { type: { $in: types } },
                { $set: { type: firstCategoryType } }
            );
        })
        .then(({ modifiedCount }) => {
            res.status(200).json({ message: "Categories deleted successfully", count: modifiedCount });
        })
        .catch((error) => {
            res.status(500).json({ message: error.message });
        });
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}

/**
 * Return all the categories
  - Request Body Content: None
  - Response `data` Content: An array of objects, each one having attributes `type` and `color`
  - Optional behavior:
    - empty array is returned if there are no categories
 */
export const getCategories = async (req, res) => {
    try {

        const simpleAuth = verifyAuth(req, res, { authType: "Simple" });
        if(!simpleAuth.authorized) {
          res.status(401).json(simpleAuth.message);
          return;
        }

        let data = await categories.find({})
        let filter = data.map(v => Object.assign({}, { type: v.type, color: v.color }))

        return res.json(filter)
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}

/**
 * Create a new transaction made by a specific user
  - Request Body Content: An object having attributes `username`, `type` and `amount`
  - Response `data` Content: An object having attributes `username`, `type`, `amount` and `date`
  - Optional behavior:
    - error 401 is returned if the username or the type of category does not exist
 */
export const createTransaction = async (req, res) => {
    try {
        const cookie = req.cookies
        if (!cookie.accessToken) {
            return res.status(401).json({ message: "Unauthorized" }) // unauthorized
        }
        const { username, amount, type } = req.body;
        const new_transactions = new transactions({ username, amount, type });
        new_transactions.save()
            .then(data => res.json(data))
            .catch(err => { throw err })
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}

/**
 * Return all transactions made by all users
  - Request Body Content: None
  - Response `data` Content: An array of objects, each one having attributes `username`, `type`, `amount`, `date` and `color`
  - Optional behavior:
    - empty array must be returned if there are no transactions
 */
export const getAllTransactions = async (req, res) => {
    try {
        const cookie = req.cookies
        if (!cookie.accessToken) {
            return res.status(401).json({ message: "Unauthorized" }) // unauthorized
        }
        /**
         * MongoDB equivalent to the query "SELECT * FROM transactions, categories WHERE transactions.type = categories.type"
         */
        transactions.aggregate([
            {
                $lookup: {
                    from: "categories",
                    localField: "type",
                    foreignField: "type",
                    as: "categories_info"
                }
            },
            { $unwind: "$categories_info" }
        ]).then((result) => {
            let data = result.map(v => Object.assign({}, { _id: v._id, username: v.username, amount: v.amount, type: v.type, color: v.categories_info.color, date: v.date }))
            res.json(data);
        }).catch(error => { throw (error) })
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}

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
        const isAuthenticatedUser = verifyAuth(req, res, { authType: "User" });
        const isAuthenticatedAdmin = verifyAuth(req, res, { authType: "Admin" });
    
        if (!isAuthenticatedUser) {
            res.status(401).json(isAuthenticatedUser.message);
            return;
          }
    
        const { username } = req.params;
        const loggedInUsername = req.cookies.username;
    
        if (!isAuthenticatedAdmin && loggedInUsername !== username) {
        return res.status(403).json({ message: "Access denied" });
        }
    
        let query = { username: loggedInUsername };
    
        if (isAuthenticatedAdmin) {
        query = { username };
        }
        console.log(query);
    
        const userTransactions = await transactions.aggregate([
        { $match: query },
        {
            $lookup: {
            from: "categories",
            localField: "type",
            foreignField: "type",
            as: "categories_info",
            },
        },
        { $unwind: "$categories_info" },
        ]);
    
    
        const data = userTransactions.map((v) => ({
        _id: v._id,
        username: v.username,
        amount: v.amount,
        type: v.type,
        color: v.categories_info.color,
        date: v.date,
        }));
        //
    
        res.json(data);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}

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
        const isAuthenticatedUser = verifyAuth(req, res, { authType: "User" });
        const isAuthenticatedAdmin = verifyAuth(req, res, { authType: "Admin" });
    
        if (!isAuthenticatedUser) {
            res.status(401).json(isAuthenticatedUser.message);
            return;
          }
    
        const { username, category } = req.params;
        const loggedInUsername = req.cookies.username;
    
        if (!isAuthenticatedAdmin && loggedInUsername !== username) {
        return res.status(403).json({ message: "Access denied" });
        }
    
        let query = { username: loggedInUsername, type: category };
    
        if (isAuthenticatedAdmin) {
        query = { username, type: category };
        }
    
        const userCategoryTransactions = await transactions.aggregate([
        { $match: query },
        {
            $lookup: {
            from: "categories",
            localField: "type",
            foreignField: "type",
            as: "categories_info",
            },
        },
        { $unwind: "$categories_info" },
        ]);
    
        const data = userCategoryTransactions.map((v) => ({
        _id: v._id,
        username: v.username,
        amount: v.amount,
        type: v.type,
        color: v.categories_info.color,
        date: v.date,
        }));
    
        if (data.length == 0 || Object.keys(data).length === 0) {
            data = [];
            res.json(data);
          } else {
            res.json(data);
          }
        } catch (error) {
          res.status(400).json({ error: error.message });
        }
}

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
        const loggedInUserEmail = req.cookies.email;
        const { name } = req.params;
    
        const group = await Group.findOne({ name }, { members: 1 });
    
        if (!group) {
        return res.status(401).json({ message: "The group doesn't exist" });
        }
    
        const isGroupMember = group.members.some(
        (member) => member.email === loggedInUserEmail
        );
    
        const isAdmin = false; // Set this to the appropriate value based on the admin check
    
        if (!isGroupMember && !isAdmin) {
        return res.status(403).json({ message: "Access denied" });
        }
    
        const memberEmails = group.members.map((member) => member.email);
    
        const users = await User.find({ email: { $in: memberEmails } });
        const usernames = users.map((user) => user.username);
    
        const groupTransactions = await transactions.aggregate([
        { $match: { username: { $in: usernames } } },
        {
            $lookup: {
            from: "categories",
            localField: "type",
            foreignField: "type",
            as: "categories_info",
            },
        },
        { $unwind: "$categories_info" },
        ]);
    
        const data = groupTransactions.map((v) => ({
        _id: v._id,
        username: v.username,
        amount: v.amount,
        type: v.type,
        color: v.categories_info.color,
        date: v.date,
        }));
    
        if (data.length == 0 || Object.keys(data).length === 0) {
            data = [];
            res.json(data);
          } else {
            res.json(data);
          }
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
}

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
        const loggedInUserEmail = req.cookies.email;
        const { name, category } = req.params;
    
        const group = await Group.findOne({ name }, { members: 1 });
    
        if (!group) {
        return res.status(401).json({ message: "The group doesn't exist" });
        }
    
        const isGroupMember = group.members.some(
        (member) => member.email === loggedInUserEmail
        );
    
        const isAdmin = true; // Set this to the appropriate value based on the admin check
    
        if (!isGroupMember && !isAdmin) {
        return res.status(403).json({ message: "Access denied" });
        }
    
        const memberEmails = group.members.map((member) => member.email);
    
        const users = await User.find({ email: { $in: memberEmails } });
        const usernames = users.map((user) => user.username);
    
        const groupTransactions = await transactions.aggregate([
        { $match: { username: { $in: usernames }, type: category } },
        {
            $lookup: {
            from: "categories",
            localField: "type",
            foreignField: "type",
            as: "categories_info",
            },
        },
        { $unwind: "$categories_info" },
        ]);
    
        const data = groupTransactions.map((v) => ({
        _id: v._id,
        username: v.username,
        amount: v.amount,
        type: v.type,
        color: v.categories_info.color,
        date: v.date,
        }));
    
        if (data.length == 0 || Object.keys(data).length === 0) {
            data = [];
            res.json(data);
          } else {
            res.json(data);
          }
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
}

/**
 * Delete a transaction made by a specific user
  - Request Body Content: The `_id` of the transaction to be deleted
  - Response `data` Content: A string indicating successful deletion of the transaction
  - Optional behavior:
    - error 401 is returned if the user or the transaction does not exist
 */
export const deleteTransaction = async (req, res) => {
    try {
        const cookie = req.cookies
        if (!cookie.accessToken) {
            return res.status(401).json({ message: "Unauthorized" }) // unauthorized
        }
        let data = await transactions.deleteOne({ _id: req.body._id });
        return res.json("deleted");
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}

/**
 * Delete multiple transactions identified by their ids
  - Request Body Content: An array of strings that lists the `_ids` of the transactions to be deleted
  - Response `data` Content: A message confirming successful deletion
  - Optional behavior:
    - error 401 is returned if at least one of the `_ids` does not have a corresponding transaction. Transactions that have an id are not deleted in this case
 */
export const deleteTransactions = async (req, res) => {
    try {
        const adminAuth = verifyAuth(req, res, { authType: "Admin" });
    
        if (!adminAuth.authorized) {
        res.status(401).json(adminAuth.message);
        return;
        }
        const { ids } = req.body;
    
        if (!Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({ message: "Invalid transaction IDs" });
        }
    
        const deleteResult = await transactions.deleteMany({ _id: { $in: ids } });
    
        if (deleteResult.deletedCount === 0) {
        return res
            .status(401)
            .json({ message: "No transactions found with the provided IDs" });
        }
    
        res.json({ message: "Transactions deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}
