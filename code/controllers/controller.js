import { categories, transactions } from "../models/model.js";
import { Group, User } from "../models/User.js";
import { handleDateFilterParams, handleAmountFilterParams, verifyAuth } from "./utils.js";

/**
 * Create a new category
  - Request Body Content: An object having attributes `type` and `color`
  - Response `data` Content: An object having attributes `type` and `color`
 */
export const createCategory = async (req, res) => {
    try {
        
        const adminAuth = verifyAuth(req, res, { authType: "Admin" });
        if(!adminAuth.flag)
          return res.status(401).json(adminAuth.cause);

        
        const { type, color } = req.body;
        if (!type || !color)
            return res.status(400).json({ message: "Body lacking some parameter" });

        if (!type.trim().length || !color.trim().length)
            return res.status(400).json({ message: "Some parameters are not valid" });

        const category = await categories.find({ type: type })
        if (category)
            return res.status(400).json({ message: "Category already present in DB" });

        const newCategory = await categories.create({ type: type, color: color });
        res.status(200).json({data: {type: newCategory.type, color: newCategory.color}, refreshedTokenMessage: res.locals.refreshedTokenMessage});
    } catch (error) {
        res.status(500).json({ error: error.message })
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
        if(!adminAuth.flag)
          return res.status(401).json(adminAuth.cause);

        const { type, color } = req.body;
        if (!type || !color)
            return res.status(400).json({ message: "Body lacking some parameter" });

        if (!type.trim().length || !color.trim().length)
            return res.status(400).json({ message: "Some parameters are not valid" });
            
        const category = await categories.find({ type: type })
        if (category)
            return res.status(400).json({ message: "Category name to be updated into already present in DB" });

        // Check if the category exists
        const oldCategory = await categories.findOne({ type: req.params.type });
        if (!oldCategory)  return res.status(400).json({ message: "Category to update not present in DB" });

        // Prepare the update object
        const updateObject = {};
        if (type) updateObject.type = type;
        if (color) updateObject.color = color;

        // Update the category
        await categories.updateOne(
            { type: req.params.type },
            { $set: updateObject }
        );

        // Update the transactions that had the modified category
        const modifiedCount = await transactions.updateMany(
            { type: req.params.type },
            { $set: { type: type } }
        );
        
        return res.status(200).json({ data: {message: "Category edited successfully", count: modifiedCount} , refreshedTokenMessage: res.locals.refreshedTokenMessage });

    } catch (error) {
        res.status(500).json({ error: error.message })
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
        if(!adminAuth.flag)
          return res.status(401).json(adminAuth.cause);

        const { types } = req.body;
        if (!types)
            return res.status(400).json({ message: "Body lacking parameters" });

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
            res.status(400).json({ message: error.message });
        });
    } catch (error) {
        res.status(500).json({ error: error.message })
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
        if(!simpleAuth.flag) {
          res.status(401).json(simpleAuth.cause);
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
        const userAuth = verifyAuth(req, res, { authType: "User", username: req.params.username });
        const adminAuth = verifyAuth(req, res, { authType: "Admin" });
        if(!adminAuth.flag && !userAuth.flag)
            return res.status(401).json({error: userAuth.cause + " " + adminAuth.cause});

        const { username, amountStr, type } = req.body;
        if (!username || !amountStr || !type)
            return res.status(400).json({ message: "Body lacking some parameter" });

        if (!username.trim().length || !amountStr.trim().length || !type.trim().length)
            return res.status(400).json({ message: "Some parameters are not valid" });

        if (username != req.params.username)
            return res.status(400).json({ message: "Usernames does not corrispond" });

        const user = await User.findOne({ username:  username });
        if (!user)
            return res.status(400).json({ message: "User not present in DB" });

        const category = await categories.find({ type: type })
        if (!category)
            return res.status(400).json({ message: "Category not present in DB" });

        const amount = parseFloat(amountStr);
        if (isNaN(amount))
            return res.status(400).json({ message: "Amount cannot be parsed" });

        const new_transaction = await transactions.create({ username: username, amount: amount, type: type });
        res.json({data: {username: username, amount: amount, type: type, date: Date.now()}, refreshedTokenMessage: res.locals.refreshedTokenMessage});
    } catch (error) {
        res.status(500).json({ error: error.message })
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
        const adminAuth = verifyAuth(req, res, { authType: "Admin" });
        if(!adminAuth.flag)
            return res.status(401).json({error: adminAuth.cause});


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
            let data = result.map(v => Object.assign({}, { username: v.username, amount: v.amount, type: v.type, date: v.date, color: v.categories_info.color }))
            res.json(data);
        }).catch(error => { throw (error) })
    } catch (error) {
        res.status(500).json({ error: error.message })
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
        const userAuth = verifyAuth(req, res, { authType: "User", username: req.params.username });
        const adminAuth = verifyAuth(req, res, { authType: "Admin" });

        if (req.path==`/users/${req.params.username}/transactions` && !userAuth.flag) {
            res.status(401).json({error: userAuth.cause});
            return;
        }   
    
        if (req.path==`/transactions/users/${req.params.username}` && !adminAuth.flag) {
            res.status(401).json({error: adminAuth.cause});
            return;
        }

        const user = await User.findOne({ username: req.params.username });
        if (!user) return res.status(400).json({ error: "User not found" });

        let query = {username: req.params.username};

        const dateFilter = handleDateFilterParams(req);
        const amountFilter = handleAmountFilterParams(req);

        if(dateFilter.hasOwnProperty(date)){
            query.date=dateFilter.date;
        }
        if(amountFilter.hasOwnProperty(amount)){
            query.amount=amountFilter.amount;
        }
    
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
        username: v.username,
        type: v.type,
        amount: v.amount,
        date: v.date,
        color: v.categories_info.color,
        }));
    
        res.status(200).json({"data": data, refreshedTokenMessage: res.locals.refreshedTokenMessage});
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
        const userAuth = verifyAuth(req, res, { authType: "User", username: req.params.username });
        const adminAuth = verifyAuth(req, res, { authType: "Admin" });
    
         if (req.path==`/users/${req.params.username}/transactions/category/${req.params.category}` && !userAuth.flag) {
            res.status(401).json({error: userAuth.cause});
            return;
        }   
    
        if (req.path==`/transactions/users/${req.params.username}/category/${req.params.category}` && !adminAuth.flag) {
            res.status(401).json({error: adminAuth.cause});
            return;
        }

        const user = await User.findOne({ username: req.params.username });
        if (!user) return res.status(400).json({ error: "User not found" });

        const category = await categories.findOne({ username: req.params.category });
        if (!category) return res.status(400).json({ error: "Category not found" });
    
        const userCategoryTransactions = await transactions.aggregate([
        { $match: {username: req.params.username, type: req.params.category } },
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
        username: v.username,
        type: v.type,
        amount: v.amount,
        date: v.date,
        color: v.categories_info.color,
        }));
    
        res.status(200).json({data: data, refreshedTokenMessage: res.locals.refreshedTokenMessage});

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
        //const loggedInUserEmail = req.cookies.email;
        const { groupName } = req.params;
    
        const group = await Group.findOne({ name:  groupName });
    
        if (!group) {
            return res.status(400).json({ message: "The group doesn't exist" });
        }
    
        const memberEmails = group.members.map((member) => member.email);
    
        const adminAuth = verifyAuth(req, res, { authType: "Admin" });
        const userAuth = verifyAuth(req, res, {authType: "Group", emails: memberEmails});

        if (!adminAuth && !userAuth) {
            return res.status(401).json({ message: "Access denied" });
        }
    
    
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
            res.status(200).json({ data: data, refreshedTokenMessage: res.locals.refreshedTokenMessage });
          } else {
            res.statud(200).json({ data: data, refreshedTokenMessage: res.locals.refreshedTokenMessage });
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
        const { groupName, category } = req.params;

        const adminAuth = verifyAuth(req, res, { authType: "Admin" });
        const userAuth = verifyAuth(req, res, {authType: "Group", emails: groupEmails});

        if (!userAuth.authorized && !adminAuth.authorized) {
            return res.status(401).json({ message: "Access denied" });
        }

        const group = await Group.findOne({ name: groupName });
        
        if (!group) {
            return res.status(400).json({ message: "The group doesn't exist" });
        }
        
        const ctg = await categories.findOne({type: category});
        if(!ctg){
            return res.status(400).json({ message: "The category doesn't exist" });
        }

        const groupEmails = group.members.map((m) => m.email);

        const users = await User.find({ email: { $in: groupEmails } });
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
            res.status(200).json({ data: data, refreshedTokenMessage: res.locals.refreshedTokenMessage });
          } else {
            res.status(200).json({ data: data, refreshedTokenMessage: res.locals.refreshedTokenMessage });
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
        const id = req.body._id;
        const userAuth = verifyAuth(req, res, { authType: "User", username: req.params.username });
        
        if (!userAuth.flag) {
            res.status(401).json({error: userAuth.cause});
            return;
        }
        
        if(!id){
            return res.status(400).json({ message: "Error in the body" });
        }

        if(id.trim()==""){
            return res.status(400).json({ message: "Id can't be an empty string" });
        }

        const user = await User.findOne({ username: req.params.username });
        if (!user) return res.status(400).json({ error: "User not found" });

        const result = await transactions.deleteOne({ _id: id, username: req.params.username});

        if (result.deletedCount == 1)
                return res.status(200).json({data: {message: "The transaction has been successfully deleted!"}, refreshedTokenMessage: res.locals.refreshedTokenMessage});   
            else
                return res.status(400).json({message: "The transaction provided doesn't exist or you didn't create it"});

    } catch (error) {
        return res.status(400).json({ error: error.message })
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
    
        if(!ids){
            return res.status(401).json({ message: "Error in parameters" });
        }

        if(ids===[]){
            return res.status(401).json({ message: "The list of ids is empty" });
        }
        
        /*
        if (!Array.isArray(ids) || ids.length === 0) {
            return res.status(400).json({ message: "Invalid transaction IDs" });
        }*/
    
        const deleteResult = await transactions.deleteMany({ _id: { $in: ids } });
    
        if (deleteResult.deletedCount === 0) {
        return res
            .status(401)
            .json({ message: "No transactions found with the provided IDs" });
        }
    
        res.status(200).json({ message: "Transactions deleted successfully", refreshedTokenMessage: res.locals.refreshedTokenMessage });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}
