import request from 'supertest';
import { app } from '../app';
import { User, Group } from '../models/User.js';
import { categories, transactions } from '../models/model';
import mongoose, { Model } from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { createCategory, updateCategory, deleteCategory, getCategories, createTransaction, getAllTransactions } from '../controllers/controller';

dotenv.config();

const currentDate = new Date();
const formattedDate = currentDate.toISOString().split('T')[0];

let userOneId = new mongoose.Types.ObjectId();
let userTwoId = new mongoose.Types.ObjectId();
let adminOneId = new mongoose.Types.ObjectId();

let accessTokenUserOne = "";
let accessTokenUserTwo = "";
let adminAccessToken = "";

let userOne = {
  username: 'user',
  email: 'user@user.com',
  password: '',
  role: 'User'
}

let userTwo = {
    username: 'user2',
    email: 'user2@user.com',
    password: '',
    role: 'User'
  }

let adminOne = {
  username: 'admin',
  email: 'admin@admin.com',
  password: '',
  role: 'Admin'
}

const categoryOne = { type: "food", color: "red"}
const categoryTwo = { type: "health", color: "blue"}

const groupOne = { name: 'Family', members: [{ email: userOne.email, user: userOneId }] };
const groupTwo = { name: 'Friends', members: [{ email: userOne.email, user: userOneId }, { email: userTwo.email, user: userTwoId }] };


beforeAll(async () => {
  const dbName = "testingDatabaseController";
  const url = `${process.env.MONGO_URI}/${dbName}`;

  await mongoose.connect(url, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  userOne.refreshToken = jwt.sign({
    email: userOne.email,
    id: userOneId.toString(),
    username: userOne.username,
    role: userOne.role
  }, process.env.ACCESS_KEY, { expiresIn: '7d' });
  
  userTwo.refreshToken = jwt.sign({
    email: userTwo.email,
    id: userTwoId.toString(),
    username: userTwo.username,
    role: userTwo.role
  }, process.env.ACCESS_KEY, { expiresIn: '7d' });

  adminOne.refreshToken = jwt.sign({
    email: adminOne.email,
    id: adminOneId.toString(),
    username: adminOne.username,
    role: adminOne.role
  }, process.env.ACCESS_KEY, { expiresIn: '7d' });

  accessTokenUserOne = jwt.sign({
    email: userOne.email,
    id: userOneId.toString(),
    username: userOne.username,
    role: userOne.role
  }, process.env.ACCESS_KEY, { expiresIn: '1h' });
  
  accessTokenUserTwo = jwt.sign({
    email: userTwo.email,
    id: userTwoId.toString(),
    username: userTwo.username,
    role: userTwo.role
  }, process.env.ACCESS_KEY, { expiresIn: '1h' });

  adminAccessToken = jwt.sign({
    email: adminOne.email,
    id: adminOneId.toString(),
    username: adminOne.username,
    role: adminOne.role
  }, process.env.ACCESS_KEY, { expiresIn: '1h' });

  userOne.password = await bcrypt.hash("123", 12);
  userTwo.password = await bcrypt.hash("123", 12);
  adminOne.password = await bcrypt.hash("123", 12);

});

afterAll(async () => {
  await mongoose.connection.db.dropDatabase();
  await mongoose.connection.close();
});

//necessary setup to ensure that each test can insert the data it needs
beforeEach(async () => {
    await categories.deleteMany({})
    await transactions.deleteMany({})
    await User.deleteMany({})
    await Group.deleteMany({})
})

describe("createCategory", () => { 
    test('Correct category insertion',async () => {

        await User.create(adminOne);
        
        const req = { body: {type: "food", color: "red" }, 
        cookies: {accessToken: adminAccessToken, refreshToken: adminOne.refreshToken }    
        };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: {refreshedTokenMessage: ""}
        };
        
        await createCategory(req,res);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            data: {type: "food", color: "red"},
            refreshedTokenMessage: expect.any(String)
        }))
        expect((await categories.find({})).length).toBe(1);
    });
    test('Missing type', async () => {
        await User.create(adminOne);
        
        const req = { body: {color: "red" }, 
        cookies: {accessToken: adminAccessToken, refreshToken: adminOne.refreshToken }    
        };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: {refreshedTokenMessage: ""}
        };
        
        await createCategory(req,res);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            error: expect.any(String)
        }))
    });
    test('Missing color', async () => {

        await User.create(adminOne);
        
        const req = { body: {type: "food" }, 
        cookies: {accessToken: adminAccessToken, refreshToken: adminOne.refreshToken }    
        };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: {refreshedTokenMessage: ""}
        };
        
        await createCategory(req,res);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            error: expect.any(String)
        }))
        expect((await categories.find({})).length).toBe(0);
    });
    test('Missing type and color', async () => {
        
        await User.create(adminOne);
        
        const req = { body: {}, 
        cookies: {accessToken: adminAccessToken, refreshToken: adminOne.refreshToken }    
        };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: {refreshedTokenMessage: ""}
        };
        
        await createCategory(req,res);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            error: expect.any(String)
        }))
        expect((await categories.find({})).length).toBe(0);
    });
    test('Empty type', async () => {
        
        await User.create(adminOne);
        
        const req = { body: {type: "     ", color: "red" }, 
        cookies: {accessToken: adminAccessToken, refreshToken: adminOne.refreshToken }    
        };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: {refreshedTokenMessage: ""}
        };
        
        await createCategory(req,res);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            error: expect.any(String)
        }))
        expect((await categories.find({})).length).toBe(0);
    });
    test('Empty color', async () => {
        
        await User.create(adminOne);
        
        const req = { body: {type: "food", color: "      " }, 
        cookies: {accessToken: adminAccessToken, refreshToken: adminOne.refreshToken }    
        };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: {refreshedTokenMessage: ""}
        };
        
        await createCategory(req,res);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            error: expect.any(String)
        }))
        expect((await categories.find({})).length).toBe(0);
    });
    test('Empty type, missing color', async () => {
        
        await User.create(adminOne);
        
        const req = { body: {type: "      " }, 
        cookies: {accessToken: adminAccessToken, refreshToken: adminOne.refreshToken }    
        };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: {refreshedTokenMessage: ""}
        };
        
        await createCategory(req,res);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            error: expect.any(String)
        }))
        expect((await categories.find({})).length).toBe(0);
    });
    test('Insert twice a category with the same name', async () => {
        
        await User.create(adminOne);
        
        let req = { body: {type: "food", color: "red" }, 
        cookies: {accessToken: adminAccessToken, refreshToken: adminOne.refreshToken }    
        };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: {refreshedTokenMessage: ""}
        };

        await createCategory(req,res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            data: {type: "food", color: "red"},
            refreshedTokenMessage: expect.any(String)
        }))

        req.body.color="blue";

        await createCategory(req,res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            error: expect.any(String)
        }))
        expect((await categories.find({})).length).toBe(1);
    });
    test('Not an admin', async () => {

        await User.create(userOne);
        
        const req = { body: {type: "food", color: "red" }, 
        cookies: {accessToken: accessTokenUserOne, refreshToken: userOne.refreshToken }    
        };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: {refreshedTokenMessage: ""}
        };
        
        await createCategory(req,res);
        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            error: expect.any(String)
        }))
        expect((await categories.find({})).length).toBe(0);
    });
    test('Not logged in', async () => {

        await User.create(userOne);
        
        const req = { body: {type: "food", color: "red" }, 
        cookies: {accessToken: "", refreshToken: "" }    
        };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: {refreshedTokenMessage: ""}
        };
        
        await createCategory(req,res);
        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            error: expect.any(String)
        }))
        expect((await categories.find({})).length).toBe(0);
    });
})

describe("updateCategory", () => { 
    test('Correct update', async () => {
        
        await User.insertMany([adminOne,userOne]);
        await categories.insertMany([{type: "food", color: "red" }, {type: "health", color: "blue" }]);
        await transactions.insertMany([
            {username: userOne.username, type: "food", amount: 20}, 
            {username: adminOne.username, type: "food", amount: 100},
            {username: adminOne.username, type: "health", amount: 100}
        ])
        
        const req = { body: {type: "Food", color: "yellow" }, 
        cookies: {accessToken: adminAccessToken, refreshToken: adminOne.refreshToken },
        params: {type: "food"}  
        };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: {refreshedTokenMessage: ""}
        };
        
        await updateCategory(req,res);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            data: expect.objectContaining({
                message: expect.any(String),
                count: 2}),
            refreshedTokenMessage: expect.any(String)
        }));
        expect((await transactions.find({type: "food"})).length).toBe(0);
        expect((await transactions.find({type: "Food"})).length).toBe(2);
    });
    test('Missing type', async () => {

        await User.insertMany([adminOne,userOne]);
        await categories.insertMany([{type: "food", color: "red" }, {type: "health", color: "blue" }]);
        await transactions.insertMany([
            {username: userOne.username, type: "food", amount: 20}, 
            {username: adminOne.username, type: "food", amount: 100},
            {username: adminOne.username, type: "health", amount: 100}
        ])
        
        const req = { body: {color: "yellow" }, 
        cookies: {accessToken: adminAccessToken, refreshToken: adminOne.refreshToken },
        params: {type: "food"}  
        };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: {refreshedTokenMessage: ""}
        };
        
        await updateCategory(req,res);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            error: expect.any(String)
        }))
    });
    test('Missing color', async () => {
        await User.insertMany([adminOne,userOne]);
        await categories.insertMany([{type: "food", color: "red" }, {type: "health", color: "blue" }]);
        await transactions.insertMany([
            {username: userOne.username, type: "food", amount: 20}, 
            {username: adminOne.username, type: "food", amount: 100},
            {username: adminOne.username, type: "health", amount: 100}
        ])
        
        const req = { body: {type: "Food" }, 
        cookies: {accessToken: adminAccessToken, refreshToken: adminOne.refreshToken },
        params: {type: "food"}  
        };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: {refreshedTokenMessage: ""}
        };
        
        await updateCategory(req,res);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            error: expect.any(String)
        }))    
    });
    test('Missing type and color', async () => {
        await User.insertMany([adminOne,userOne]);
        await categories.insertMany([{type: "food", color: "red" }, {type: "health", color: "blue" }]);
        await transactions.insertMany([
            {username: userOne.username, type: "food", amount: 20}, 
            {username: adminOne.username, type: "food", amount: 100},
            {username: adminOne.username, type: "health", amount: 100}
        ])
        
        const req = { body: {}, 
        cookies: {accessToken: adminAccessToken, refreshToken: adminOne.refreshToken },
        params: {type: "food"}  
        };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: {refreshedTokenMessage: ""}
        };
        
        await updateCategory(req,res);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            error: expect.any(String)
        }))
    });
    test('Empty type', async () => {
        await User.insertMany([adminOne,userOne]);
        await categories.insertMany([{type: "food", color: "red" }, {type: "health", color: "blue" }]);
        await transactions.insertMany([
            {username: userOne.username, type: "food", amount: 20}, 
            {username: adminOne.username, type: "food", amount: 100},
            {username: adminOne.username, type: "health", amount: 100}
        ])
        
        const req = { body: {type: "    ", color: "yellow" }, 
        cookies: {accessToken: adminAccessToken, refreshToken: adminOne.refreshToken },
        params: {type: "food"}  
        };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: {refreshedTokenMessage: ""}
        };
        
        await updateCategory(req,res);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            error: expect.any(String)
        }))
    });
    test('Empty color', async () => {
        await User.insertMany([adminOne,userOne]);
        await categories.insertMany([{type: "food", color: "red" }, {type: "health", color: "blue" }]);
        await transactions.insertMany([
            {username: userOne.username, type: "food", amount: 20}, 
            {username: adminOne.username, type: "food", amount: 100},
            {username: adminOne.username, type: "health", amount: 100}
        ])
        
        const req = { body: {type: "Food", color: "     " }, 
        cookies: {accessToken: adminAccessToken, refreshToken: adminOne.refreshToken },
        params: {type: "food"}  
        };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: {refreshedTokenMessage: ""}
        };
        
        await updateCategory(req,res);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            error: expect.any(String)
        }))
    });
    test('Empty type, missing color', async () => {
        await User.insertMany([adminOne,userOne]);
        await categories.insertMany([{type: "food", color: "red" }, {type: "health", color: "blue" }]);
        await transactions.insertMany([
            {username: userOne.username, type: "food", amount: 20}, 
            {username: adminOne.username, type: "food", amount: 100},
            {username: adminOne.username, type: "health", amount: 100}
        ])
        
        const req = { body: {type: "     " }, 
        cookies: {accessToken: adminAccessToken, refreshToken: adminOne.refreshToken },
        params: {type: "food"}  
        };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: {refreshedTokenMessage: ""}
        };
        
        await updateCategory(req,res);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            error: expect.any(String)
        }))
    });
    test('Category not existing', async () => {
        await User.insertMany([adminOne,userOne]);
        await categories.insertMany([{type: "food", color: "red" }, {type: "health", color: "blue" }]);
        await transactions.insertMany([
            {username: userOne.username, type: "food", amount: 20}, 
            {username: adminOne.username, type: "food", amount: 100},
            {username: adminOne.username, type: "health", amount: 100}
        ])
        
        const req = { body: {type: "Food", color: "yellow" }, 
        cookies: {accessToken: adminAccessToken, refreshToken: adminOne.refreshToken },
        params: {type: "parking"}  
        };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: {refreshedTokenMessage: ""}
        };
        
        await updateCategory(req,res);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            error: expect.any(String)
        }))
    });
    test('New type already in use', async () => {
        await User.insertMany([adminOne,userOne]);
        await categories.insertMany([{type: "food", color: "red" }, {type: "health", color: "blue" }]);
        await transactions.insertMany([
            {username: userOne.username, type: "food", amount: 20}, 
            {username: adminOne.username, type: "food", amount: 100},
            {username: adminOne.username, type: "health", amount: 100}
        ])
        
        const req = { body: {type: "health", color: "yellow"}, 
        cookies: {accessToken: adminAccessToken, refreshToken: adminOne.refreshToken },
        params: {type: "food"}  
        };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: {refreshedTokenMessage: ""}
        };
        
        await updateCategory(req,res);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            error: expect.any(String)
        }))
    });
    test('Not an admin', async () => {
        await User.insertMany([adminOne,userOne]);
        await categories.insertMany([{type: "food", color: "red" }, {type: "health", color: "blue" }]);
        await transactions.insertMany([
            {username: userOne.username, type: "food", amount: 20}, 
            {username: adminOne.username, type: "food", amount: 100},
            {username: adminOne.username, type: "health", amount: 100}
        ])
        
        const req = { body: {type: "Food", color: "yellow"}, 
        cookies: {accessToken: accessTokenUserOne, refreshToken: userOne.refreshToken },
        params: {type: "food"}  
        };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: {refreshedTokenMessage: ""}
        };
        
        await updateCategory(req,res);
        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            error: expect.any(String)
        }))
    });
    test('Not logged in', async () => {
        await User.insertMany([adminOne,userOne]);
        await categories.insertMany([{type: "food", color: "red" }, {type: "health", color: "blue" }]);
        await transactions.insertMany([
            {username: userOne.username, type: "food", amount: 20}, 
            {username: adminOne.username, type: "food", amount: 100},
            {username: adminOne.username, type: "health", amount: 100}
        ])
        
        const req = { body: {type: "Food", color: "yellow"}, 
        cookies: {},
        params: {type: "food"}  
        };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: {refreshedTokenMessage: ""}
        };
        
        await updateCategory(req,res);
        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            error: expect.any(String)
        }))
    });
})

describe("deleteCategory", () => { 
    test('Correct, N>T', async () => {

        await User.insertMany([adminOne,userOne]);
        await categories.insertMany([{type: "food", color: "red" }, {type: "health", color: "blue" },
         {type: "parking", color: "blue" }, {type: "finance", color: "blue" }]);
        await transactions.insertMany([
            {username: userOne.username, type: "food", amount: 20}, 
            {username: adminOne.username, type: "food", amount: 100},
            {username: adminOne.username, type: "health", amount: 100},
            {username: userOne.username, type: "parking", amount: 20}, 
            {username: adminOne.username, type: "finance", amount: 100},
            {username: adminOne.username, type: "parking", amount: 100}
        ])
        
        const req = { body: {types: ["health", "finance"]}, 
        cookies: {accessToken: adminAccessToken, refreshToken: adminOne.refreshToken },
        };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: {refreshedTokenMessage: ""}
        };
        
        await deleteCategory(req,res);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            data: expect.objectContaining({
                message: expect.any(String),
                count: 2}),
            refreshedTokenMessage: expect.any(String)
        }));
        expect((await transactions.find({type: "food"})).length).toBe(4);
        expect((await categories.find({type: "health"})).length).toBe(0);
        expect((await categories.find({type: "finance"})).length).toBe(0);
    });
    test('Correct, N=T', async () => {
        await User.insertMany([adminOne,userOne]);
        await categories.insertMany([{type: "food", color: "red" }, {type: "health", color: "blue" },
         {type: "parking", color: "blue" }, {type: "finance", color: "blue" }]);
        await transactions.insertMany([
            {username: userOne.username, type: "food", amount: 20}, 
            {username: adminOne.username, type: "food", amount: 100},
            {username: adminOne.username, type: "health", amount: 100},
            {username: userOne.username, type: "parking", amount: 20}, 
            {username: adminOne.username, type: "finance", amount: 100},
            {username: adminOne.username, type: "parking", amount: 100}
        ])
        
        const req = { body: {types: ["health", "finance", "food", "parking"]}, 
        cookies: {accessToken: adminAccessToken, refreshToken: adminOne.refreshToken },
        };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: {refreshedTokenMessage: ""}
        };
        
        await deleteCategory(req,res);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            data: expect.objectContaining({
                message: expect.any(String),
                count: 4}),
            refreshedTokenMessage: expect.any(String)
        }));
        expect((await categories.find({type: "food"})).length).not.toBe(0);
        expect((await transactions.find({type: "food"})).length).toBe(6);
    });
    test('Types not passed', async () => {
        await User.insertMany([adminOne,userOne]);
        await categories.insertMany([{type: "food", color: "red" }, {type: "health", color: "blue" },
         {type: "parking", color: "blue" }, {type: "finance", color: "blue" }]);
        await transactions.insertMany([
            {username: userOne.username, type: "food", amount: 20}, 
            {username: adminOne.username, type: "food", amount: 100},
            {username: adminOne.username, type: "health", amount: 100},
            {username: userOne.username, type: "parking", amount: 20}, 
            {username: adminOne.username, type: "finance", amount: 100},
            {username: adminOne.username, type: "parking", amount: 100}
        ])
        
        const req = { body: {}, 
        cookies: {accessToken: adminAccessToken, refreshToken: adminOne.refreshToken },
        };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: {refreshedTokenMessage: ""}
        };
        
        await deleteCategory(req,res);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            error: expect.any(String)
        }));
    });
    test('Try to delete the last category', async () => {
        await User.insertMany([adminOne,userOne]);
        await categories.insertMany([{type: "food", color: "red" }]);
        await transactions.insertMany([
            {username: userOne.username, type: "food", amount: 20}, 
            {username: adminOne.username, type: "food", amount: 100}
        ])
        
        const req = { body: {types: ["food"]}, 
        cookies: {accessToken: adminAccessToken, refreshToken: adminOne.refreshToken },
        };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: {refreshedTokenMessage: ""}
        };
        
        await deleteCategory(req,res);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            error: expect.any(String)
        }));
    });
    test('One of the types is an empty string', async () => {
        await User.insertMany([adminOne,userOne]);
        await categories.insertMany([{type: "food", color: "red" }, {type: "health", color: "blue" },
         {type: "parking", color: "blue" }, {type: "finance", color: "blue" }]);
        await transactions.insertMany([
            {username: userOne.username, type: "food", amount: 20}, 
            {username: adminOne.username, type: "food", amount: 100},
            {username: adminOne.username, type: "health", amount: 100},
            {username: userOne.username, type: "parking", amount: 20}, 
            {username: adminOne.username, type: "finance", amount: 100},
            {username: adminOne.username, type: "parking", amount: 100}
        ])
        
        const req = { body: {types: ["food", "   ", "parking"]}, 
        cookies: {accessToken: adminAccessToken, refreshToken: adminOne.refreshToken },
        };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: {refreshedTokenMessage: ""}
        };
        
        await deleteCategory(req,res);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            error: expect.any(String)
        }));
    });
    test('Empty array', async () => {
        await User.insertMany([adminOne,userOne]);
        await categories.insertMany([{type: "food", color: "red" }, {type: "health", color: "blue" },
         {type: "parking", color: "blue" }, {type: "finance", color: "blue" }]);
        await transactions.insertMany([
            {username: userOne.username, type: "food", amount: 20}, 
            {username: adminOne.username, type: "food", amount: 100},
            {username: adminOne.username, type: "health", amount: 100},
            {username: userOne.username, type: "parking", amount: 20}, 
            {username: adminOne.username, type: "finance", amount: 100},
            {username: adminOne.username, type: "parking", amount: 100}
        ])
        
        const req = { body: {types: []}, 
        cookies: {accessToken: adminAccessToken, refreshToken: adminOne.refreshToken },
        };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: {refreshedTokenMessage: ""}
        };
        
        await deleteCategory(req,res);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            error: expect.any(String)
        }));
    });
    test('One of the types isn\'t a category', async () => {
        await User.insertMany([adminOne,userOne]);
        await categories.insertMany([{type: "food", color: "red" }, {type: "health", color: "blue" },
         {type: "parking", color: "blue" }, {type: "finance", color: "blue" }]);
        await transactions.insertMany([
            {username: userOne.username, type: "food", amount: 20}, 
            {username: adminOne.username, type: "food", amount: 100},
            {username: adminOne.username, type: "health", amount: 100},
            {username: userOne.username, type: "parking", amount: 20}, 
            {username: adminOne.username, type: "finance", amount: 100},
            {username: adminOne.username, type: "parking", amount: 100}
        ])
        
        const req = { body: {types: ["food", "restaurants", "parking"]}, 
        cookies: {accessToken: adminAccessToken, refreshToken: adminOne.refreshToken },
        };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: {refreshedTokenMessage: ""}
        };
        
        await deleteCategory(req,res);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            error: expect.any(String)
        }));
    });
    test('Not an admin', async () => {
        await User.insertMany([adminOne,userOne]);
        await categories.insertMany([{type: "food", color: "red" }, {type: "health", color: "blue" },
         {type: "parking", color: "blue" }, {type: "finance", color: "blue" }]);
        await transactions.insertMany([
            {username: userOne.username, type: "food", amount: 20}, 
            {username: adminOne.username, type: "food", amount: 100},
            {username: adminOne.username, type: "health", amount: 100},
            {username: userOne.username, type: "parking", amount: 20}, 
            {username: adminOne.username, type: "finance", amount: 100},
            {username: adminOne.username, type: "parking", amount: 100}
        ])
        
        const req = { body: {types: ["food", "parking"]}, 
        cookies: {accessToken: accessTokenUserOne, refreshToken: userOne.refreshToken },
        };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: {refreshedTokenMessage: ""}
        };
        
        await deleteCategory(req,res);
        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            error: expect.any(String)
        }));
    });

    test('Not logged in', async () => {
        await User.insertMany([adminOne,userOne]);
        await categories.insertMany([{type: "food", color: "red" }, {type: "health", color: "blue" },
         {type: "parking", color: "blue" }, {type: "finance", color: "blue" }]);
        await transactions.insertMany([
            {username: userOne.username, type: "food", amount: 20}, 
            {username: adminOne.username, type: "food", amount: 100},
            {username: adminOne.username, type: "health", amount: 100},
            {username: userOne.username, type: "parking", amount: 20}, 
            {username: adminOne.username, type: "finance", amount: 100},
            {username: adminOne.username, type: "parking", amount: 100}
        ])
        
        const req = { body: {types: ["food", "parking"]}, 
        cookies: {accessToken: "", refreshToken: "" },
        };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: {refreshedTokenMessage: ""}
        };
        
        await deleteCategory(req,res);
        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            error: expect.any(String)
        }));
    });
})

describe("getCategories", () => { 
    test('Correct category retrieval (admin)', async () => {
        await User.insertMany([adminOne,userOne]);
        await categories.insertMany([{type: "food", color: "red" }, {type: "health", color: "blue" },
         {type: "parking", color: "blue" }, {type: "finance", color: "blue" }]);
        await transactions.insertMany([
            {username: userOne.username, type: "food", amount: 20}, 
            {username: adminOne.username, type: "food", amount: 100},
            {username: adminOne.username, type: "health", amount: 100},
            {username: userOne.username, type: "parking", amount: 20}, 
            {username: adminOne.username, type: "finance", amount: 100},
            {username: adminOne.username, type: "parking", amount: 100}
        ])
        
        const req = { body: {}, 
        cookies: {accessToken: adminAccessToken, refreshToken: adminOne.refreshToken },
        };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: {refreshedTokenMessage: ""}
        };

        await getCategories(req,res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            data: [{type: "food", color: "red" }, {type: "health", color: "blue" },
            {type: "parking", color: "blue" }, {type: "finance", color: "blue" }],
            refreshedTokenMessage: expect.any(String)
        }));
    });
    test('Correct category retrieval (user)', async () => {
        await User.insertMany([adminOne,userOne]);
        await categories.insertMany([{type: "food", color: "red" }, {type: "health", color: "blue" },
         {type: "parking", color: "blue" }, {type: "finance", color: "blue" }]);
        await transactions.insertMany([
            {username: userOne.username, type: "food", amount: 20}, 
            {username: adminOne.username, type: "food", amount: 100},
            {username: adminOne.username, type: "health", amount: 100},
            {username: userOne.username, type: "parking", amount: 20}, 
            {username: adminOne.username, type: "finance", amount: 100},
            {username: adminOne.username, type: "parking", amount: 100}
        ])
        
        const req = { body: {}, 
        cookies: {accessToken: accessTokenUserOne, refreshToken: userOne.refreshToken },
        };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: {refreshedTokenMessage: ""}
        };

        await getCategories(req,res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            data: [{type: "food", color: "red" }, {type: "health", color: "blue" },
            {type: "parking", color: "blue" }, {type: "finance", color: "blue" }],
            refreshedTokenMessage: expect.any(String)
        }));
    });
    test('Not logged in', async () => {
        await User.insertMany([adminOne,userOne]);
        await categories.insertMany([{type: "food", color: "red" }, {type: "health", color: "blue" },
         {type: "parking", color: "blue" }, {type: "finance", color: "blue" }]);
        await transactions.insertMany([
            {username: userOne.username, type: "food", amount: 20}, 
            {username: adminOne.username, type: "food", amount: 100},
            {username: adminOne.username, type: "health", amount: 100},
            {username: userOne.username, type: "parking", amount: 20}, 
            {username: adminOne.username, type: "finance", amount: 100},
            {username: adminOne.username, type: "parking", amount: 100}
        ])
        
        const req = { body: {}, 
        cookies: {accessToken: "", refreshToken: "" },
        };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: {refreshedTokenMessage: ""}
        };

        await getCategories(req,res);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            error: expect.any(String)
        }))
    });
})

describe("createTransaction", () => { 
    test('Correct transaction creation (user, positive amount)', async () => {
        await User.insertMany([adminOne,userOne]);
        await categories.insertMany([{type: "food", color: "red" }, {type: "health", color: "blue" },
        {type: "parking", color: "blue" }, {type: "finance", color: "blue" }]);

        const req = { body: {username: userOne.username, amount: 100, type: "food"}, 
        cookies: {accessToken: accessTokenUserOne, refreshToken: userOne.refreshToken },
        params: {username: userOne.username}  
        };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: {refreshedTokenMessage: ""}
        };

        await createTransaction(req,res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            data: expect.objectContaining({
                username: userOne.username,
                amount: 100,
                type: "food",
                date: expect.any(String)
            }),
            refreshedTokenMessage: expect.any(String)
        }));
        expect((await transactions.find({type: "food"})).length).toBe(1);
    });
    test('Correct transaction creation, (admin, negative amount)', async () => {
        await User.insertMany([adminOne,userOne]);
        await categories.insertMany([{type: "food", color: "red" }, {type: "health", color: "blue" },
        {type: "parking", color: "blue" }, {type: "finance", color: "blue" }]);

        const req = { body: {username: adminOne.username, amount: -200, type: "food"}, 
        cookies: {accessToken: adminAccessToken, refreshToken: adminOne.refreshToken },
        params: {username: adminOne.username}  
        };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: {refreshedTokenMessage: ""}
        };

        await createTransaction(req,res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            data: expect.objectContaining({
                username: adminOne.username,
                amount: -200,
                type: "food",
                date: expect.any(String)
            }),
            refreshedTokenMessage: expect.any(String)
        }));
        expect((await transactions.find({type: "food"})).length).toBe(1);
    });
    test('Correct transaction creation, (user, MIN_FLOAT)', async () => {
        await User.insertMany([adminOne,userOne]);
        await categories.insertMany([{type: "food", color: "red" }, {type: "health", color: "blue" },
        {type: "parking", color: "blue" }, {type: "finance", color: "blue" }]);

        const req = { body: {username: userOne.username, amount: Number.NEGATIVE_INFINITY, type: "food"}, 
        cookies: {accessToken: accessTokenUserOne, refreshToken: userOne.refreshToken },
        params: {username: userOne.username}  
        };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: {refreshedTokenMessage: ""}
        };

        await createTransaction(req,res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            data: expect.objectContaining({
                username: userOne.username,
                amount: Number.NEGATIVE_INFINITY,
                type: "food",
                date: expect.any(String)
            }),
            refreshedTokenMessage: expect.any(String)
        }));
        expect((await transactions.find({type: "food"})).length).toBe(1);
    });
    test('Correct transaction creation, (admin, MAX_FLOAT)', async () => {
        await User.insertMany([adminOne,userOne]);
        await categories.insertMany([{type: "food", color: "red" }, {type: "health", color: "blue" },
        {type: "parking", color: "blue" }, {type: "finance", color: "blue" }]);

        const req = { body: {username: adminOne.username, amount: Number.MAX_VALUE, type: "food"}, 
        cookies: {accessToken: adminAccessToken, refreshToken: adminOne.refreshToken },
        params: {username: adminOne.username}  
        };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: {refreshedTokenMessage: ""}
        };

        await createTransaction(req,res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            data: expect.objectContaining({
                username: adminOne.username,
                amount: Number.MAX_VALUE,
                type: "food",
                date: expect.any(String)
            }),
            refreshedTokenMessage: expect.any(String)
        }));
        expect((await transactions.find({type: "food"})).length).toBe(1);
    });
    test('Username missing', async () => {
        await User.insertMany([adminOne,userOne]);
        await categories.insertMany([{type: "food", color: "red" }, {type: "health", color: "blue" },
        {type: "parking", color: "blue" }, {type: "finance", color: "blue" }]);

        const req = { body: {amount: 100, type: "food"}, 
        cookies: {accessToken: accessTokenUserOne, refreshToken: userOne.refreshToken },
        params: {username: userOne.username}  
        };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: {refreshedTokenMessage: ""}
        };
        

        await createTransaction(req,res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            error: expect.any(String)
        }));
        expect((await transactions.find({})).length).toBe(0);
    });
    test('Amount missing', async () => {
        await User.insertMany([adminOne,userOne]);
        await categories.insertMany([{type: "food", color: "red" }, {type: "health", color: "blue" },
        {type: "parking", color: "blue" }, {type: "finance", color: "blue" }]);

        const req = { body: {username: userOne.username, type: "food"}, 
        cookies: {accessToken: accessTokenUserOne, refreshToken: userOne.refreshToken },
        params: {username: userOne.username}  
        };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: {refreshedTokenMessage: ""}
        };
        

        await createTransaction(req,res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            error: expect.any(String)
        }));
        expect((await transactions.find({})).length).toBe(0);
    });
    test('Type missing', async () => {
        await User.insertMany([adminOne,userOne]);
        await categories.insertMany([{type: "food", color: "red" }, {type: "health", color: "blue" },
        {type: "parking", color: "blue" }, {type: "finance", color: "blue" }]);

        const req = { body: {username: userOne.username, amount: 100}, 
        cookies: {accessToken: accessTokenUserOne, refreshToken: userOne.refreshToken },
        params: {username: userOne.username}  
        };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: {refreshedTokenMessage: ""}
        };
        

        await createTransaction(req,res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            error: expect.any(String)
        }));
        expect((await transactions.find({})).length).toBe(0);
    });
    test('Username empty', async () => {
        await User.insertMany([adminOne,userOne]);
        await categories.insertMany([{type: "food", color: "red" }, {type: "health", color: "blue" },
        {type: "parking", color: "blue" }, {type: "finance", color: "blue" }]);

        const req = { body: {username: "    ", amount: 100, type: "food"}, 
        cookies: {accessToken: accessTokenUserOne, refreshToken: userOne.refreshToken },
        params: {username: userOne.username}  
        };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: {refreshedTokenMessage: ""}
        };
        

        await createTransaction(req,res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            error: expect.any(String)
        }));
        expect((await transactions.find({})).length).toBe(0);
    });
    test('Type empty', async () => {
        await User.insertMany([adminOne,userOne]);
        await categories.insertMany([{type: "food", color: "red" }, {type: "health", color: "blue" },
        {type: "parking", color: "blue" }, {type: "finance", color: "blue" }]);

        const req = { body: {username: userOne.username, amount: 100, type: "    "}, 
        cookies: {accessToken: accessTokenUserOne, refreshToken: userOne.refreshToken },
        params: {username: userOne.username}  
        };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: {refreshedTokenMessage: ""}
        };
        

        await createTransaction(req,res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            error: expect.any(String)
        }));
        expect((await transactions.find({})).length).toBe(0);
    });
    test('Category not existing', async () => {
        await User.insertMany([adminOne,userOne]);
        await categories.insertMany([{type: "food", color: "red" }, {type: "health", color: "blue" },
        {type: "parking", color: "blue" }, {type: "finance", color: "blue" }]);

        const req = { body: {username: userOne.username ,amount: 100, type: "restaurant"}, 
        cookies: {accessToken: accessTokenUserOne, refreshToken: userOne.refreshToken },
        params: {username: userOne.username}  
        };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: {refreshedTokenMessage: ""}
        };
        

        await createTransaction(req,res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            error: expect.any(String)
        }));
        expect((await transactions.find({})).length).toBe(0);
    });
    test('The username of the transaction is different by the one in the route', async () => {
        await User.insertMany([adminOne,userOne]);
        await categories.insertMany([{type: "food", color: "red" }, {type: "health", color: "blue" },
        {type: "parking", color: "blue" }, {type: "finance", color: "blue" }]);

        const req = { body: {username: adminOne.username, amount: 100, type: "food"}, 
        cookies: {accessToken: accessTokenUserOne, refreshToken: userOne.refreshToken },
        params: {username: userOne.username}  
        };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: {refreshedTokenMessage: ""}
        };
        

        await createTransaction(req,res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            error: expect.any(String)
        }));
        expect((await transactions.find({})).length).toBe(0);
    });
    test('The username of the transaction doesn\'t exist', async () => {
        await User.insertMany([adminOne,userOne]);
        await categories.insertMany([{type: "food", color: "red" }, {type: "health", color: "blue" },
        {type: "parking", color: "blue" }, {type: "finance", color: "blue" }]);

        const req = { body: {username: "userNotExisting", amount: 100, type: "food"}, 
        cookies: {accessToken: accessTokenUserOne, refreshToken: userOne.refreshToken },
        params: {username: userOne.username}  
        };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: {refreshedTokenMessage: ""}
        };

        await createTransaction(req,res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            error: expect.any(String)
        }));
        expect((await transactions.find({type: "food"})).length).toBe(0);
    });
    test('The username in the route doesn\'t exist', async () => {
        await User.insertMany([adminOne,userOne]);
        await categories.insertMany([{type: "food", color: "red" }, {type: "health", color: "blue" },
        {type: "parking", color: "blue" }, {type: "finance", color: "blue" }]);

        const req = { body: {username:"userNotExisting", amount: 100, type: "food"}, 
        cookies: {accessToken: accessTokenUserOne, refreshToken: userOne.refreshToken },
        params: {username: "userNotExisting"}  
        };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: {refreshedTokenMessage: ""}
        };

        await createTransaction(req,res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            error: expect.any(String)
        }));
        expect((await transactions.find({type: "food"})).length).toBe(0);
    });
    test('The amount is not a float', async () => {
        await User.insertMany([adminOne,userOne]);
        await categories.insertMany([{type: "food", color: "red" }, {type: "health", color: "blue" },
        {type: "parking", color: "blue" }, {type: "finance", color: "blue" }]);

        const req = { body: {username: userOne.username, amount: "Not a float", type: "food"}, 
        cookies: {accessToken: accessTokenUserOne, refreshToken: userOne.refreshToken },
        params: {username: userOne.username}  
        };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: {refreshedTokenMessage: ""}
        };

        await createTransaction(req,res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            error: expect.any(String)
        }));
        expect((await transactions.find({})).length).toBe(0);
    });
    test('Not the same user', async () => {
        await User.insertMany([adminOne,userOne]);
        await categories.insertMany([{type: "food", color: "red" }, {type: "health", color: "blue" },
        {type: "parking", color: "blue" }, {type: "finance", color: "blue" }]);

        const req = { body: {username: userOne.username, amount: 100, type: "food"}, 
        cookies: {accessToken: accessTokenUserOne, refreshToken: userOne.refreshToken },
        params: {username: adminOne.username}  
        };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: {refreshedTokenMessage: ""}
        };
        

        await createTransaction(req,res);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            error: expect.any(String)
        }));
        expect((await transactions.find({type: "food"})).length).toBe(0);
    });

    test('Not logged in', async () => {
        await User.insertMany([adminOne,userOne]);
        await categories.insertMany([{type: "food", color: "red" }, {type: "health", color: "blue" },
        {type: "parking", color: "blue" }, {type: "finance", color: "blue" }]);

        const req = { body: {username: userOne.username, amount: 100, type: "food"}, 
        cookies: {accessToken: "", refreshToken: "" },
        params: {username: userOne.username}  
        };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: {refreshedTokenMessage: ""}
        };
        

        await createTransaction(req,res);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            error: expect.any(String)
        }));
        expect((await transactions.find({type: "food"})).length).toBe(0);
    });
})

describe("getAllTransactions", () => { 
    test('Correct retrieval', async () => {
        await User.insertMany([adminOne,userOne]);
        await categories.insertMany([{type: "food", color: "red" }, {type: "health", color: "blue" },
         {type: "parking", color: "blue" }, {type: "finance", color: "blue" }]);
        await transactions.insertMany([
            {username: userOne.username, type: "food", amount: 20}, 
            {username: adminOne.username, type: "food", amount: 100},
            {username: adminOne.username, type: "health", amount: 100},
            {username: userOne.username, type: "parking", amount: 20}, 
            {username: adminOne.username, type: "finance", amount: 100},
            {username: adminOne.username, type: "parking", amount: 100}
        ])
        
        const req = {cookies: {accessToken: adminAccessToken, refreshToken: adminOne.refreshToken }};
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: {refreshedTokenMessage: ""}
        };

        await getAllTransactions(req,res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            data:[
                    {username: userOne.username, type: "food", amount: 20, date: expect.any(Date), color: "red"}, 
                    {username: adminOne.username, type: "food", amount: 100, date: expect.any(Date), color: "red"},
                    {username: adminOne.username, type: "health", amount: 100, date: expect.any(Date), color: "blue"},
                    {username: userOne.username, type: "parking", amount: 20, date: expect.any(Date), color: "blue"}, 
                    {username: adminOne.username, type: "finance", amount: 100, date: expect.any(Date), color: "blue"},
                    {username: adminOne.username, type: "parking", amount: 100, date: expect.any(Date), color: "blue"}
            ],
            refreshedTokenMessage: expect.any(String)
        }))
    });
    test('Not an admin', async () => {
        await User.insertMany([adminOne,userOne]);
        await categories.insertMany([{type: "food", color: "red" }, {type: "health", color: "blue" },
         {type: "parking", color: "blue" }, {type: "finance", color: "blue" }]);
        await transactions.insertMany([
            {username: userOne.username, type: "food", amount: 20}, 
            {username: adminOne.username, type: "food", amount: 100},
            {username: adminOne.username, type: "health", amount: 100},
            {username: userOne.username, type: "parking", amount: 20}, 
            {username: adminOne.username, type: "finance", amount: 100},
            {username: adminOne.username, type: "parking", amount: 100}
        ])
        
        const req = {cookies: {accessToken: accessTokenUserOne, refreshToken: userOne.refreshToken }};
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: {refreshedTokenMessage: ""}
        };

        await getAllTransactions(req,res);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            error: expect.any(String)
        }))
    });
})

describe("getTransactionsByUser", () => { 
    test('User in route does not represent user in DB', (done) => {
        User.create(userOne).then(() => {
            request(app)
                .get(`/api/users/${adminOne.username}/transactions`)
                .set("Cookie", `accessToken=${adminAccessToken}; refreshToken=${adminOne.refreshToken}`)
                .send({})
                .then((response) => {
                    expect(response.status).toBe(400);
                    expect(response.body).toHaveProperty("error");
                    done();
                }).catch((err) => done(err));
        });
    });

    test('/api/users/:username/transactions : Authenticated user is not the same as the one in the route', (done) => {
        User.insertMany([userOne, userTwo]).then(() => {
            request(app)
                .get(`/api/users/${userTwo.username}/transactions`)
                .set("Cookie", `accessToken=${accessTokenUserOne}; refreshToken=${userOne.refreshToken}`)
                .send({})
                .then((response) => {
                    expect(response.status).toBe(401);
                    expect(response.body).toHaveProperty("error");
                    done();
                }).catch((err) => done(err));
        });
    });

    test('/api/transactions/users/:username : Authenticated user is not an admin', (done) => {
        User.insertMany([userOne, userTwo]).then(() => {
            request(app)
                .get(`/api/transactions/users/${userTwo.username}`)
                .set("Cookie", `accessToken=${accessTokenUserOne}; refreshToken=${userOne.refreshToken}`)
                .send({})
                .then((response) => {
                    expect(response.status).toBe(401);
                    expect(response.body).toHaveProperty("error");
                    done();
                }).catch((err) => done(err));
        });
    });

    test('Correct retrieval with no parameters', (done) => {
        User.insertMany([userOne, userTwo]).then(() => {
            categories.create(categoryOne).then(() => {
                transactions.insertMany([{
                    username: userOne.username,
                    type: "food",
                    amount: 20
                }, {
                    username: userOne.username,
                    type: "food",
                    amount: 100
                }]).then(() => {
                    request(app)
                        .get(`/api/users/${userOne.username}/transactions`)
                        .set("Cookie", `accessToken=${accessTokenUserOne}; refreshToken=${userOne.refreshToken}`)
                        .send({})
                        .then((response) => {
                            expect(response.status).toBe(200);
                            expect(response.body).toHaveProperty("data");
                            expect(response.body.data).toHaveLength(2)
                            expect(response.body.data[0].username).toEqual(userOne.username);
                            expect(response.body.data[0].amount).toEqual(20);
                            expect(response.body.data[0].type).toEqual("food");
                            expect(response.body.data[0].color).toEqual("red");
                            done();
                        }).catch((err) => done(err));
                });
            });
        });
    });

    test('Correct retrieval with parameters', (done) => {
        User.insertMany([userOne, userTwo]).then(() => {
            categories.create(categoryOne).then(() => {
                transactions.insertMany([{
                    username: userOne.username,
                    type: "food",
                    amount: 20
                }, {
                    username: userOne.username,
                    type: "food",
                    amount: 100
                }]).then(() => {
                    request(app)
                        .get(`/api/users/${userOne.username}/transactions?min=50&date=${formattedDate}`)
                        .set("Cookie", `accessToken=${accessTokenUserOne}; refreshToken=${userOne.refreshToken}`)
                        .send({})
                        .then((response) => {
                            expect(response.status).toBe(200);
                            expect(response.body).toHaveProperty("data");
                            expect(response.body.data).toHaveLength(1)
                            expect(response.body.data[0].username).toEqual(userOne.username);
                            expect(response.body.data[0].amount).toEqual(100);
                            expect(response.body.data[0].type).toEqual("food");
                            expect(response.body.data[0].color).toEqual("red");
                            done();
                        }).catch((err) => done(err));
                });
            });
        });
    });
});

describe("getTransactionsByUserByCategory", () => { 
    test('User in route does not represent user in DB', (done) => {
        User.create(userOne).then(() => {
            request(app)
                .get(`/api/users/${adminOne.username}/transactions/category/${categoryOne.type}`)
                .set("Cookie", `accessToken=${adminAccessToken}; refreshToken=${adminOne.refreshToken}`)
                .send({})
                .then((response) => {
                    expect(response.status).toBe(400);
                    expect(response.body).toHaveProperty("error");
                    done();
                }).catch((err) => done(err));
        });
    });
    
    test('Category in route does not represent category in DB', (done) => {
        User.create(userOne).then(() => {
            categories.create(categoryOne).then(() => {
                request(app)
                    .get(`/api/users/${userOne.username}/transactions/category/${categoryTwo.type}`)
                    .set("Cookie", `accessToken=${accessTokenUserOne}; refreshToken=${userOne.refreshToken}`)
                    .send({})
                    .then((response) => {
                        expect(response.status).toBe(400);
                        expect(response.body).toHaveProperty("error");
                        done();
                    }).catch((err) => done(err));
            });
        });
    });

    test('/api/users/:username/transactions/category/:category : Authenticated user is not the same as the one in the route', (done) => {
        User.insertMany([userOne, userTwo]).then(() => {
            categories.create(categoryOne).then(() => {
                request(app)
                    .get(`/api/users/${userOne.username}/transactions/category/${categoryOne.type}`)
                    .set("Cookie", `accessToken=${accessTokenUserTwo}; refreshToken=${userTwo.refreshToken}`)
                    .send({})
                    .then((response) => {
                        expect(response.status).toBe(401);
                        expect(response.body).toHaveProperty("error");
                        done();
                    }).catch((err) => done(err));
            });
        });
    });

    test('/api/transactions/users/:username/category/:category : Authenticated user is not an admin', (done) => {
        User.insertMany([userOne, userTwo]).then(() => {
            categories.create(categoryOne).then(() => {
                request(app)
                    .get(`/api/transactions/users/${userOne.username}/category/${categoryOne.type}`)
                    .set("Cookie", `accessToken=${accessTokenUserOne}; refreshToken=${userOne.refreshToken}`)
                    .send({})
                    .then((response) => {
                        expect(response.status).toBe(401);
                        expect(response.body).toHaveProperty("error");
                        done();
                    }).catch((err) => done(err));
            });
        });
    });

    test('Correct retrieval', (done) => {
        User.insertMany([userOne, userTwo]).then(() => {
            categories.create(categoryOne).then(() => {
                transactions.insertMany([{
                    username: userOne.username,
                    type: "food",
                    amount: 20
                }, {
                    username: userOne.username,
                    type: "health",
                    amount: 100
                }]).then(() => {
                    request(app)
                        .get(`/api/users/${userOne.username}/transactions/category/${categoryOne.type}`)
                        .set("Cookie", `accessToken=${accessTokenUserOne}; refreshToken=${userOne.refreshToken}`)
                        .send({})
                        .then((response) => {
                            expect(response.status).toBe(200);
                            expect(response.body).toHaveProperty("data");
                            expect(response.body.data).toHaveLength(1)
                            expect(response.body.data[0].username).toEqual(userOne.username);
                            expect(response.body.data[0].amount).toEqual(20);
                            expect(response.body.data[0].type).toEqual("food");
                            expect(response.body.data[0].color).toEqual("red");
                            done();
                        }).catch((err) => done(err));
                });
            });
        });
    });
});

describe("getTransactionsByGroup", () => { 
    test('Group name in route does not represent group in DB', (done) => {
        User.create(adminOne).then(() => {
            Group.create(groupOne).then(() => {
                request(app)
                    .get(`/api/groups/${groupTwo.name}/transactions`)
                    .set("Cookie", `accessToken=${adminAccessToken}; refreshToken=${adminOne.refreshToken}`)
                    .send({})
                    .then((response) => {
                        expect(response.status).toBe(400);
                        expect(response.body).toHaveProperty("error");
                        done();
                    }).catch((err) => done(err));
            });
        });
    });
    
    test('/api/groups/:name/transactions : Authenticated user is not part of the group', (done) => {
        User.insertMany([userOne, userTwo]).then(() => {
            Group.create(groupOne).then(() => {
                request(app)
                    .get(`/api/groups/${groupOne.name}/transactions`)
                    .set("Cookie", `accessToken=${accessTokenUserTwo}; refreshToken=${userTwo.refreshToken}`)
                    .send({})
                    .then((response) => {
                        expect(response.status).toBe(401);
                        expect(response.body).toHaveProperty("error");
                        done();
                    }).catch((err) => done(err));
            });
        });
    });
    
    test('/api/transactions/groups/:name : Authenticated user is not an admin', (done) => {
        User.insertMany([userOne, userTwo]).then(() => {
            Group.create(groupOne).then(() => {
                request(app)
                    .get(`/api/transactions/groups/${groupOne.name}`)
                    .set("Cookie", `accessToken=${accessTokenUserTwo}; refreshToken=${userTwo.refreshToken}`)
                    .send({})
                    .then((response) => {
                        expect(response.status).toBe(401);
                        expect(response.body).toHaveProperty("error");
                        done();
                    }).catch((err) => done(err));
            });
        });
    });
    
    test('Correct retrieval', (done) => {
        User.insertMany([userOne, userTwo]).then(() => {
            Group.create(groupOne).then(() => {
                categories.create(categoryOne).then(() => {
                    transactions.insertMany([{
                        username: userOne.username,
                        type: "food",
                        amount: 20
                    }, {
                        username: userOne.username,
                        type: "food",
                        amount: 100
                    }]).then(() => {
                        request(app)
                            .get(`/api/transactions/groups/${groupOne.name}`)
                            .set("Cookie", `accessToken=${adminAccessToken}; refreshToken=${adminOne.refreshToken}`)
                            .send({})
                            .then((response) => {
                                expect(response.status).toBe(200);
                                expect(response.body).toHaveProperty("data");
                                expect(response.body.data).toHaveLength(2)
                                expect(response.body.data[0].username).toEqual(userOne.username);
                                expect(response.body.data[0].amount).toEqual(20);
                                expect(response.body.data[0].type).toEqual("food");
                                expect(response.body.data[0].color).toEqual("red");
                                done();
                            }).catch((err) => done(err));
                    });
                });
            });
        });
    });
});

describe("getTransactionsByGroupByCategory", () => { 
    test('Group name in route does not represent group in DB', (done) => {
        User.create(userOne).then(() => {
            Group.create(groupOne).then(() => {
                categories.create(categoryOne).then(() => {
                    request(app)
                        .get(`/api/groups/${groupTwo.name}/transactions/category/${categoryOne.type}`)
                        .set("Cookie", `accessToken=${accessTokenUserOne}; refreshToken=${userOne.refreshToken}`)
                        .send({})
                        .then((response) => {
                            expect(response.status).toBe(400);
                            expect(response.body).toHaveProperty("error");
                            done();
                        }).catch((err) => done(err));
                });
            });
        });
    });

    test('Category name in route does not represent category in DB', (done) => {
        User.create(userOne).then(() => {
            Group.create(groupOne).then(() => {
                categories.create(categoryOne).then(() => {
                    request(app)
                        .get(`/api/groups/${groupOne.name}/transactions/category/${categoryTwo.type}`)
                        .set("Cookie", `accessToken=${accessTokenUserOne}; refreshToken=${userOne.refreshToken}`)
                        .send({})
                        .then((response) => {
                            expect(response.status).toBe(400);
                            expect(response.body).toHaveProperty("error");
                            done();
                        }).catch((err) => done(err));
                });
            });
        });
    });

    test('/api/groups/:name/transactions/category/:category : Authenticated user is not part of the group', (done) => {
        User.insertMany([userOne, userTwo]).then(() => {
            Group.create(groupOne).then(() => {
                categories.create(categoryOne).then(() => {
                    request(app)
                        .get(`/api/groups/${groupOne.name}/transactions/category/${categoryOne.type}`)
                        .set("Cookie", `accessToken=${accessTokenUserTwo}; refreshToken=${userTwo.refreshToken}`)
                        .send({})
                        .then((response) => {
                            expect(response.status).toBe(401);
                            expect(response.body).toHaveProperty("error");
                            done();
                        }).catch((err) => done(err));
                });
            });
        });
    });

    test('/api/transactions/groups/:name/category/:category : Authenticated user is not an admin', (done) => {
        User.insertMany([userOne, adminOne]).then(() => {
            Group.create(groupOne).then(() => {
                categories.create(categoryOne).then(() => {
                    request(app)
                        .get(`/api/transactions/groups/${groupOne.name}/category/${categoryOne.type}`)
                        .set("Cookie", `accessToken=${accessTokenUserOne}; refreshToken=${userOne.refreshToken}`)
                        .send({})
                        .then((response) => {
                            expect(response.status).toBe(401);
                            expect(response.body).toHaveProperty("error");
                            done();
                        }).catch((err) => done(err));
                });
            });
        });
    });

    test('Correct retrieval', (done) => {
        User.insertMany([userOne]).then(() => {
            Group.create(groupOne).then(() => {
                categories.create(categoryOne).then(() => {
                    transactions.insertMany([{
                        username: userOne.username,
                        type: "food",
                        amount: 20
                    }, {
                        username: userOne.username,
                        type: "food",
                        amount: 100
                    }]).then(() => {
                        request(app)
                            .get(`/api/groups/${groupOne.name}/transactions/category/${categoryOne.type}`)
                            .set("Cookie", `accessToken=${accessTokenUserOne}; refreshToken=${userOne.refreshToken}`)
                            .send({})
                            .then((response) => {
                                expect(response.status).toBe(200);
                                expect(response.body).toHaveProperty("data");
                                expect(response.body.data).toHaveLength(2)
                                expect(response.body.data[0].username).toEqual(userOne.username);
                                expect(response.body.data[0].amount).toEqual(20);
                                expect(response.body.data[0].type).toEqual("food");
                                expect(response.body.data[0].color).toEqual("red");
                                done();
                            }).catch((err) => done(err));
                    });
                });
            });
        });
    });
});

describe("deleteTransaction", () => { 
    test('Request body does not contain all attributes', (done) => {
        User.create(userOne).then(() => {
            request(app)
                .delete(`/api/users/${userOne.username}/transactions`)
                .set("Cookie", `accessToken=${accessTokenUserOne}; refreshToken=${userOne.refreshToken}`)
                .send({})
                .then((response) => {
                    expect(response.status).toBe(400);
                    expect(response.body).toHaveProperty("error");
                    done();
                }).catch((err) => done(err));
        });
    });
    
    test('`_id` in body is an empty string', (done) => {
        User.create(userOne).then(() => {
            request(app)
                .delete(`/api/users/${userOne.username}/transactions`)
                .set("Cookie", `accessToken=${accessTokenUserOne}; refreshToken=${userOne.refreshToken}`)
                .send({ _id: " " })
                .then((response) => {
                    expect(response.status).toBe(400);
                    expect(response.body).toHaveProperty("error");
                    done();
                }).catch((err) => done(err));
        });
    });
    
    test('User in route parameter is not present in DB', (done) => {
        User.create(userOne).then(() => {
            request(app)
                .delete(`/api/users/${userTwo.username}/transactions`)
                .set("Cookie", `accessToken=${accessTokenUserTwo}; refreshToken=${userTwo.refreshToken}`)
                .send({ _id: "6hjkohgfc8nvu786" })
                .then((response) => {
                    expect(response.status).toBe(400);
                    expect(response.body).toHaveProperty("error");
                    done();
                }).catch((err) => done(err));
        });
    });
    
    test('`_id` does not represent a transaction', (done) => {
        User.create(userOne).then(() => {
            categories.create(categoryOne).then(() => {
                transactions.insertMany([{
                    username: userOne.username,
                    type: "food",
                    amount: 20
                }, {
                    username: userOne.username,
                    type: "food",
                    amount: 100
                }]).then(() => {
                    request(app)
                        .delete(`/api/users/${userOne.username}/transactions`)
                        .set("Cookie", `accessToken=${accessTokenUserOne}; refreshToken=${userOne.refreshToken}`)
                        .send({ _id: "647e61feea67d74581fea274" })
                        .then((response) => {
                            expect(response.status).toBe(400);
                            expect(response.body).toHaveProperty("error");
                            done();
                        }).catch((err) => done(err));
                });
            });
        });
    });
    
    test('`_id` represents a transaction made by a different user', (done) => {
        User.create(userOne).then(() => {
            categories.create(categoryOne).then(() => {
                transactions.insertMany([{
                    username: userOne.username,
                    type: "food",
                    amount: 20
                }, {
                    username: userTwo.username,
                    type: "food",
                    amount: 100
                }]).then(async () => {
                    const transaction = await transactions.findOne({ username: userTwo.username });
                    request(app)
                        .delete(`/api/users/${userOne.username}/transactions`)
                        .set("Cookie", `accessToken=${accessTokenUserOne}; refreshToken=${userOne.refreshToken}`)
                        .send({ _id: transaction._id })
                        .then((response) => {
                            expect(response.status).toBe(400);
                            expect(response.body).toHaveProperty("error");
                            done();
                        }).catch((err) => done(err));
                });
            });
        });
    });
    
    test('Authenticated user is not the same one specified in the route', (done) => {
        User.insertMany([userOne, userTwo]).then(() => {
            request(app)
                .delete(`/api/users/${userOne.username}/transactions`)
                .set("Cookie", `accessToken=${accessTokenUserTwo}; refreshToken=${userTwo.refreshToken}`)
                .send({ _id: "6hjkohgfc8nvu786" })
                .then((response) => {
                    expect(response.status).toBe(401);
                    expect(response.body).toHaveProperty("error");
                    done();
                }).catch((err) => done(err));
        });
    });
    
    test('Successful deletion', (done) => {
        User.create(userOne).then(() => {
            categories.create(categoryOne).then(() => {
                transactions.insertMany([{
                    username: userOne.username,
                    type: "food",
                    amount: 20
                }, {
                    username: userTwo.username,
                    type: "food",
                    amount: 100
                }]).then(async () => {
                    const transaction = await transactions.findOne({ username: userOne.username });
                    request(app)
                        .delete(`/api/users/${userOne.username}/transactions`)
                        .set("Cookie", `accessToken=${accessTokenUserOne}; refreshToken=${userOne.refreshToken}`)
                        .send({ _id: transaction._id })
                        .then((response) => {
                            expect(response.status).toBe(200);
                            expect(response.body.data).toHaveProperty("message");
                            done();
                        }).catch((err) => done(err));
                });
            });
        });
    });
});

describe("deleteTransactions", () => { 
    test('Request body does not contain all attributes', (done) => {
        User.create(adminOne).then(() => {
            request(app)
                .delete(`/api/transactions`)
                .set("Cookie", `accessToken=${adminAccessToken}; refreshToken=${adminOne.refreshToken}`)
                .send({})
                .then((response) => {
                    expect(response.status).toBe(400);
                    expect(response.body).toHaveProperty("error");
                    done();
                }).catch((err) => done(err));
        });
    });
    
    test('At least one of the provided ids is an empty string', (done) => {
        User.insertMany([adminOne, userOne, userTwo]).then(() => {
            categories.create(categoryOne).then(() => {
                transactions.insertMany([{
                    username: userOne.username,
                    type: "food",
                    amount: 20
                }, {
                    username: userTwo.username,
                    type: "food",
                    amount: 100
                }]).then(async () => {
                    const transaction = await transactions.findOne({ username: userOne.username });
                    request(app)
                        .delete(`/api/transactions`)
                        .set("Cookie", `accessToken=${adminAccessToken}; refreshToken=${adminOne.refreshToken}`)
                        .send({ _ids: [transaction._id, " "] })
                        .then((response) => {
                            expect(response.status).toBe(400);
                            expect(response.body).toHaveProperty("error");
                            done();
                        }).catch((err) => done(err));
                });
            });
        });
    });
    
    test('At least one of the provided ids does not represent a transaction', (done) => {
        User.insertMany([adminOne, userOne, userTwo]).then(() => {
            categories.create(categoryOne).then(() => {
                transactions.insertMany([{
                    username: userOne.username,
                    type: "food",
                    amount: 20
                }, {
                    username: userTwo.username,
                    type: "food",
                    amount: 100
                }]).then(async () => {
                    const transaction = await transactions.findOne({ username: userOne.username });
                    request(app)
                        .delete(`/api/transactions`)
                        .set("Cookie", `accessToken=${adminAccessToken}; refreshToken=${adminOne.refreshToken}`)
                        .send({ _ids: [transaction._id, "647e61feea67d74581fea274"] })
                        .then((response) => {
                            expect(response.status).toBe(400);
                            expect(response.body).toHaveProperty("error");
                            done();
                        }).catch((err) => done(err));
                });
            });
        });
    });
    
    test('Authenticated user is not an admin', (done) => {
        User.insertMany([adminOne, userOne, userTwo]).then(() => {
            categories.create(categoryOne).then(() => {
                transactions.insertMany([{
                    username: userOne.username,
                    type: "food",
                    amount: 20
                }, {
                    username: userTwo.username,
                    type: "food",
                    amount: 100
                }]).then(async () => {
                    const transaction = await transactions.findOne({ username: userOne.username });
                    request(app)
                        .delete(`/api/transactions`)
                        .set("Cookie", `accessToken=${accessTokenUserOne}; refreshToken=${userOne.refreshToken}`)
                        .send({ _ids: [transaction._id, "647e61feea67d74581fea274"] })
                        .then((response) => {
                            expect(response.status).toBe(401);
                            expect(response.body).toHaveProperty("error");
                            done();
                        }).catch((err) => done(err));
                });
            });
        });
    });
    
    test('Authenticated user is not an admin', (done) => {
        User.insertMany([adminOne, userOne, userTwo]).then(() => {
            categories.create(categoryOne).then(() => {
                transactions.insertMany([{
                    username: userOne.username,
                    type: "food",
                    amount: 20
                }, {
                    username: userTwo.username,
                    type: "food",
                    amount: 100
                }]).then(async () => {
                    const transactionOne = await transactions.findOne({ username: userOne.username });
                    const transactionTwo = await transactions.findOne({ username: userTwo.username });
                    request(app)
                        .delete(`/api/transactions`)
                        .set("Cookie", `accessToken=${adminAccessToken}; refreshToken=${adminOne.refreshToken}`)
                        .send({ _ids: [transactionOne._id, transactionTwo._id] })
                        .then((response) => {
                            expect(response.status).toBe(200);
                            expect(response.body.data).toHaveProperty("message");
                            done();
                        }).catch((err) => done(err));
                });
            });
        });
    });
});
