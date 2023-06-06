import request from 'supertest';
import { app } from '../app';
import { categories, transactions } from '../models/model';
import { User, Group } from '../models/User.js'
import { createCategory, updateCategory, deleteCategory, getCategories, createTransaction, getAllTransactions, getTransactionsByUser, getTransactionsByUserByCategory, getTransactionsByGroup, getTransactionsByGroupByCategory, deleteTransaction, deleteTransactions } from '../controllers/controller.js'
import * as utils from '../controllers/utils.js'

jest.mock('../models/model');

beforeEach(() => {
  categories.find.mockClear();
  categories.prototype.save.mockClear();
  transactions.find.mockClear();
  transactions.deleteOne.mockClear();
  transactions.aggregate.mockClear();
  transactions.prototype.save.mockClear();
});

describe("createCategory", () => { 
    test('Correct category insertion',async () => {
        jest.spyOn(utils,"verifyAuth").mockReturnValue({flag:true});
        jest.spyOn(categories,"create").mockReturnValue({type: "food", color: "red"});
        jest.spyOn(categories,"find").mockReturnValue(null);
        
        const req = { body: {type: "food", color: "red" }};
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: {refreshedTokenMessage: "ok"}
        };
        
        const correctReturn = {data: {type: "food", color: "red"}, refreshedTokenMessage: "ok"}

        await createCategory(req,res);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(correctReturn);
    });
    test('Missing type', async () => {
        jest.spyOn(utils,"verifyAuth").mockReturnValue({flag:true});
        
        const req = { body: {color: "red" }};
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: {refreshedTokenMessage: "ok"}
        };

        await createCategory(req,res);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            error: expect.any(String)
        }))
    });
    test('Missing color', async () => {
        jest.spyOn(utils,"verifyAuth").mockReturnValue({flag:true});
        
        const req = { body: {type: "food" }};
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: {refreshedTokenMessage: "ok"}
        };

        await createCategory(req,res);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            error: expect.any(String)
        }))
    });
    test('Missing type and color', async () => {
        jest.spyOn(utils,"verifyAuth").mockReturnValue({flag:true});
        
        const req = { body: { }};
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: {refreshedTokenMessage: "ok"}
        };

        await createCategory(req,res);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            error: expect.any(String)
        }))
    });
    test('Empty type', async () => {
        jest.spyOn(utils,"verifyAuth").mockReturnValue({flag:true});
        
        const req = { body: {type: "  ", color: "red" }};
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: {refreshedTokenMessage: "ok"}
        };

        await createCategory(req,res);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            error: expect.any(String)
        }))
    });
    test('Empty color', async () => {
        jest.spyOn(utils,"verifyAuth").mockReturnValue({flag:true});
        
        const req = { body: {type: "food", color: "   " }};
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: {refreshedTokenMessage: "ok"}
        };

        await createCategory(req,res);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            error: expect.any(String)
        }))
    });
    test('Empty type, missing color', async () => {
        jest.spyOn(utils,"verifyAuth").mockReturnValue({flag:true});
        
        const req = { body: {type: "  "}};
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: {refreshedTokenMessage: "ok"}
        };

        await createCategory(req,res);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            error: expect.any(String)
        }))
    });
    test('Insert twice a category with the same name', async () => {
        jest.spyOn(utils,"verifyAuth").mockReturnValue({flag:true});
        jest.spyOn(categories,"create").mockResolvedValueOnce({type: "food", color: "red"});
        jest.spyOn(categories,"findOne").mockResolvedValueOnce(null);
        jest.spyOn(categories,"findOne").mockResolvedValueOnce({type: "food", color: "red"});
        
        let req = { body: {type: "food", color: "red" }};
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: {refreshedTokenMessage: "ok"}
        };

        const correctReturn = {data: {type: "food", color: "red"}, refreshedTokenMessage: "ok"}

        await createCategory(req,res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(correctReturn);

        req.body.color="blue";

        await createCategory(req,res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            error: expect.any(String)
        }))
    });
    test('Not an admin', async () => {
        jest.spyOn(utils,"verifyAuth").mockReturnValue({flag:false, cause: "Not an admin"});

        let req = { body: {type: "food", color: "red" }};
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: {refreshedTokenMessage: "ok"}
        };

        await createCategory(req,res);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            error: expect.any(String)
        }))
    });

    test('DB insertion goes wrong',async () => {
        jest.spyOn(utils,"verifyAuth").mockReturnValue({flag:true});
        jest.spyOn(categories,"create").mockImplementationOnce(() => {throw new Error("Generic error")});
        jest.spyOn(categories,"find").mockReturnValue(null);
        
        const req = { body: {type: "food", color: "red" }};
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: {refreshedTokenMessage: "ok"}
        };
        
        await createCategory(req,res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            error: expect.any(String)
        }))
    });
})

describe("updateCategory", () => { 
    test('Correct update', async () => { //verifications on count will be made in integration tests since here they're useless since we should mock them
        jest.spyOn(utils,"verifyAuth").mockReturnValue({flag:true});
        jest.spyOn(categories,"findOne").mockResolvedValueOnce(null);
        jest.spyOn(categories,"findOne").mockResolvedValue({type: "food", color: "red"});
        jest.spyOn(categories,"updateOne").mockResolvedValue({type: "Food", color: "yellow"});
        jest.spyOn(transactions,"updateMany").mockResolvedValue({modifiedCount: 1});//fake value
        
        const req = { body: {type: "Food", color: "yellow" }, params: {type: "food"}};
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: {refreshedTokenMessage: "ok"}
        };
        
        await updateCategory(req,res);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            data: expect.objectContaining({
                message: expect.any(String),
                count: 1}),
            refreshedTokenMessage: expect.any(String)
        }));
    });
    test('Missing type', async () => {
        jest.spyOn(utils,"verifyAuth").mockReturnValue({flag:true});

        const req = { body: { color: "yellow" }, params: {type: "food"}};
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: {refreshedTokenMessage: "ok"}
        };
        
        await updateCategory(req,res);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            error: expect.any(String)
        }))
    });
    test('Missing color', async () => {
        jest.spyOn(utils,"verifyAuth").mockReturnValue({flag:true});

        const req = { body: { type: "Food" }, params: {type: "food"}};
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: {refreshedTokenMessage: "ok"}
        };
        
        await updateCategory(req,res);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            error: expect.any(String)
        }))    
    });
    test('Missing type and color', async () => {
        jest.spyOn(utils,"verifyAuth").mockReturnValue({flag:true});

        const req = { body: { }, params: {type: "food"}};
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: {refreshedTokenMessage: "ok"}
        };
        
        await updateCategory(req,res);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            error: expect.any(String)
        }))
    });
    test('Empty type', async () => {
        jest.spyOn(utils,"verifyAuth").mockReturnValue({flag:true});

        const req = { body: { type: "    ", color: "yellow" }, params: {type: "food"}};
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: {refreshedTokenMessage: "ok"}
        };
        
        await updateCategory(req,res);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            error: expect.any(String)
        }))
    });
    test('Empty color', async () => {
        jest.spyOn(utils,"verifyAuth").mockReturnValue({flag:true});

        const req = { body: {type: "Food", color: "     " }, params: {type: "food"}};
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: {refreshedTokenMessage: "ok"}
        };
        
        await updateCategory(req,res);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            error: expect.any(String)
        }))
    });
    test('Empty type, missing color', async () => {
        jest.spyOn(utils,"verifyAuth").mockReturnValue({flag:true});

        const req = { body: { type: "     " }, params: {type: "food"}};
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: {refreshedTokenMessage: "ok"}
        };
        
        await updateCategory(req,res);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            error: expect.any(String)
        }))
    });
    test('Category not existing', async () => {
        jest.spyOn(utils,"verifyAuth").mockReturnValue({flag:true});
        jest.spyOn(categories,"findOne").mockResolvedValue(null);
        jest.spyOn(categories,"find").mockResolvedValue(null);

        const req = { body: { type: "Food", color: "yellow" }, params: {type: "food"}};
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: {refreshedTokenMessage: "ok"}
        };
        
        await updateCategory(req,res);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            error: expect.any(String)
        }))
    });
    test('New type already in use', async () => {
        jest.spyOn(utils,"verifyAuth").mockReturnValue({flag:true});
        jest.spyOn(categories,"find").mockResolvedValue({type: "food", color: "red"});

        const req = { body: { type: "Food", color: "yellow" }, params: {type: "food"}};
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: {refreshedTokenMessage: "ok"}
        };
        
        await updateCategory(req,res);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            error: expect.any(String)
        }))
    });
    test('Not an admin', async () => {
        jest.spyOn(utils,"verifyAuth").mockReturnValue({flag:false, cause: "Not an admin"});

        const req = { body: { type: "Food", color: "yellow" }, params: {type: "food"}};
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: {refreshedTokenMessage: "ok"}
        };

        await updateCategory(req,res);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            error: expect.any(String)
        }))
    });
    test('DB update goes wrong',async () => {
        jest.spyOn(utils,"verifyAuth").mockReturnValue({flag:true});
        jest.spyOn(categories,"findOne").mockResolvedValueOnce(null);
        jest.spyOn(categories,"findOne").mockResolvedValue({type: "food", color: "red"});
        jest.spyOn(categories,"updateOne").mockImplementationOnce(() => {throw new Error("Generic error")});
        
        const req = { body: { type: "Food", color: "yellow" }, params: {type: "food"}};
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: {refreshedTokenMessage: "ok"}
        };
        
        await updateCategory(req,res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            error: expect.any(String)
        }))
    });
})

describe("deleteCategory", () => { 
    test('Correct, N>T', async () => {
        jest.spyOn(utils,"verifyAuth").mockReturnValue({flag:true});
        jest.spyOn(categories,"find").mockResolvedValueOnce([{type: "Food", color:"red"},{type:"Health", color: "yellow"}]);
        jest.spyOn(categories,"findOne").mockResolvedValueOnce({type: "Parking", color:"blue"});
        jest.spyOn(categories,"countDocuments").mockResolvedValue(3);
        jest.spyOn(categories,"deleteMany").mockResolvedValue(true);
        jest.spyOn(transactions,"updateMany").mockResolvedValue({modifiedCount: 5});
        
        const req = { body: {types: ["Food", "Health"]}};
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: {refreshedTokenMessage: "ok"}
        };
        
        await deleteCategory(req,res);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            data: expect.objectContaining({
                message: expect.any(String),
                count: 5}),
            refreshedTokenMessage: expect.any(String)
        }));
    });
    test('Correct, N=T', async () => {
        jest.spyOn(utils,"verifyAuth").mockReturnValue({flag:true});
        jest.spyOn(categories,"find").mockResolvedValueOnce([{type: "Food", color:"red"},{type:"Health", color: "yellow"}]);
        jest.spyOn(categories,"findOne").mockResolvedValueOnce({type: "Parking", color:"blue"});
        jest.spyOn(categories,"countDocuments").mockResolvedValue(2);
        jest.spyOn(categories,"deleteMany").mockResolvedValue(true);
        jest.spyOn(transactions,"updateMany").mockResolvedValue({modifiedCount: 5});
        
        const req = { body: {types: ["Food", "Health"]}};
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: {refreshedTokenMessage: "ok"}
        };
        
        await deleteCategory(req,res);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            data: expect.objectContaining({
                message: expect.any(String),
                count: 5}),
            refreshedTokenMessage: expect.any(String)
        }));
    });
    test('Types not passed', async () => {
        jest.spyOn(utils,"verifyAuth").mockReturnValue({flag:true});
        
        const req = { body: {}};
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: {refreshedTokenMessage: "ok"}
        };
        
        await deleteCategory(req,res);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            error: expect.any(String)
        }));
    });
    test('Try to delete the last category', async () => {
        jest.spyOn(utils,"verifyAuth").mockReturnValue({flag:true});
        jest.spyOn(categories,"find").mockResolvedValueOnce([{type:"Food", color: "red"}]);
        jest.spyOn(categories,"countDocuments").mockResolvedValue(1);
        
        const req = { body: {types: ["Food"]}};
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: {refreshedTokenMessage: "ok"}
        };
        
        await deleteCategory(req,res);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            error: expect.any(String)
        }))
    });
    test('One of the types is an empty string', async () => {
        jest.spyOn(utils,"verifyAuth").mockReturnValue({flag:true});
        
        const req = { body: {types: ["Food", "Health", "      "]}};
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: {refreshedTokenMessage: "ok"}
        };
        
        await deleteCategory(req,res);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            error: expect.any(String)
        }));
    });
    test('Empty array', async () => {
        jest.spyOn(utils,"verifyAuth").mockReturnValue({flag:true});
        
        const req = { body: {types: []}};
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: {refreshedTokenMessage: "ok"}
        };
        
        await deleteCategory(req,res);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            error: expect.any(String)
        }));
    });
    test('One of the types isn\'t a category', async () => {
        jest.spyOn(utils,"verifyAuth").mockReturnValue({flag:true});
        jest.spyOn(categories,"find").mockResolvedValueOnce([{type: "Food", color:"red"}]);
        
        const req = { body: {types: ["Food", "Health"]}};
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: {refreshedTokenMessage: "ok"}
        };
        
        await deleteCategory(req,res);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            error: expect.any(String)
        }));
    });
    test('Not an admin', async () => {
        jest.spyOn(utils,"verifyAuth").mockReturnValue({flag:false, cause: "Not an admin"});

        const req = { body: {types: ["Food", "Health"]}};
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: {refreshedTokenMessage: "ok"}
        };

        await deleteCategory(req,res);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            error: expect.any(String)
        }))
    });
    test('DB delete goes wrong',async () => {
        jest.spyOn(utils,"verifyAuth").mockReturnValue({flag:true});
        jest.spyOn(categories,"find").mockResolvedValueOnce([{type: "Food", color:"red"},{type:"Health", color: "yellow"}]);
        jest.spyOn(categories,"countDocuments").mockResolvedValue(3);
        jest.spyOn(categories,"deleteMany").mockImplementationOnce(() => {throw new Error("Generic error")});
        
        const req = { body: {types: ["Food", "Health"]}};
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: {refreshedTokenMessage: "ok"}
        };
        
        await deleteCategory(req,res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            error: expect.any(String)
        }))
    });
})

describe("getCategories", () => { 
    test('Correct category retrieval', async () => {
        jest.spyOn(utils,"verifyAuth").mockReturnValue({flag:true});
        jest.spyOn(categories,"find").mockReturnValue([{type: "Food", color:"red"},{type:"Health", color: "yellow"}]);

        const req = {};
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: {refreshedTokenMessage: "ok"}
        };

        await getCategories(req,res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            data: [{type: "Food", color:"red"},{type:"Health", color: "yellow"}],
            refreshedTokenMessage: expect.any(String)
        }));
    });
    test('Not logged in', async () => {
        jest.spyOn(utils,"verifyAuth").mockReturnValue({flag:false, cause: "Not logged in"});

        const req = {};
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: {refreshedTokenMessage: "ok"}
        };

        await getCategories(req,res);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            error: expect.any(String)
        }))
    });
    test('DB retrieval goes wrong',async () => {
        jest.spyOn(utils,"verifyAuth").mockReturnValue({flag:true});
        jest.spyOn(categories,"find").mockImplementationOnce(() => {throw new Error("Generic error")});
        
        const req = {};
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: {refreshedTokenMessage: "ok"}
        };
        
        await getCategories(req,res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            error: expect.any(String)
        }))
    });
})

describe("createTransaction", () => { 
    test('Correct transaction creation', async () => {
        jest.spyOn(utils,"verifyAuth").mockReturnValue({flag:true});
        jest.spyOn(User,"findOne").mockReturnValue({username: "Mario"});
        jest.spyOn(categories,"findOne").mockReturnValue({type: "food", color: "red"});
        jest.spyOn(transactions,"create").mockReturnValue({username: "Mario", amount: 100, type: "food", date: Date.now()});

        const req = {
            body: {username: "Mario", amount: 100, type: "food"}, 
            params: {username: "Mario"}
        };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: {refreshedTokenMessage: "ok"}
        };

        await createTransaction(req,res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            data: expect.objectContaining({
                username: "Mario",
                amount: 100,
                type: "food",
                date: expect.any(String)
            }),
            refreshedTokenMessage: expect.any(String)
        }));
    });
    test('Username missing', async () => {
        jest.spyOn(utils,"verifyAuth").mockReturnValue({flag:true});

        const req = {
            body: {amount: 100, type: "food"}, 
            params: {username: "Mario"}
        };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: {refreshedTokenMessage: "ok"}
        };

        await createTransaction(req,res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            error: expect.any(String)
        }));
    });
    test('Amount missing', async () => {
        jest.spyOn(utils,"verifyAuth").mockReturnValue({flag:true});

        const req = {
            body: {username: "Mario", type: "food"}, 
            params: {username: "Mario"}
        };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: {refreshedTokenMessage: "ok"}
        };

        await createTransaction(req,res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            error: expect.any(String)
        }));
    });
    test('Type missing', async () => {
        jest.spyOn(utils,"verifyAuth").mockReturnValue({flag:true});

        const req = {
            body: {username: "Mario", amount: 100}, 
            params: {username: "Mario"}
        };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: {refreshedTokenMessage: "ok"}
        };

        await createTransaction(req,res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            error: expect.any(String)
        }));
    });
    test('Username empty', async () => {
        jest.spyOn(utils,"verifyAuth").mockReturnValue({flag:true});

        const req = {
            body: {username: "     ", amount: 100, type: "food"}, 
            params: {username: "Mario"}
        };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: {refreshedTokenMessage: "ok"}
        };

        await createTransaction(req,res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            error: expect.any(String)
        }));
    });
    test('Type empty', async () => {
        jest.spyOn(utils,"verifyAuth").mockReturnValue({flag:true});

        const req = {
            body: {username: "Mario", amount: 100, type: "      "}, 
            params: {username: "Mario"}
        };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: {refreshedTokenMessage: "ok"}
        };

        await createTransaction(req,res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            error: expect.any(String)
        }));
    });
    test('Category not existing', async () => {
        jest.spyOn(utils,"verifyAuth").mockReturnValue({flag:true});
        jest.spyOn(User,"findOne").mockReturnValue({username: "Mario"});
        jest.spyOn(categories,"findOne").mockReturnValue(null);

        const req = {
            body: {username: "Mario", amount: 100, type: "food"}, 
            params: {username: "Mario"}
        };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: {refreshedTokenMessage: "ok"}
        };

        await createTransaction(req,res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            error: expect.any(String)
        }));
    });
    test('The username of the transaction is different by the one in the route', async () => {
        jest.spyOn(utils,"verifyAuth").mockReturnValue({flag:true});
        jest.spyOn(User,"findOne").mockReturnValue({username: "Mario"});

        const req = {
            body: {username: "Test", amount: 100, type: "food"}, 
            params: {username: "Mario"}
        };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: {refreshedTokenMessage: "ok"}
        };

        await createTransaction(req,res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            error: expect.any(String)
        }));
    });
    test('The username of the transaction doesn\'t exist', async () => {
        jest.spyOn(utils,"verifyAuth").mockReturnValue({flag:true});
        jest.spyOn(User,"findOne").mockReturnValueOnce(null);

        const req = {
            body: {username: "Mario", amount: 100, type: "food"}, 
            params: {username: "Mario"}
        };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: {refreshedTokenMessage: "ok"}
        };

        await createTransaction(req,res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            error: expect.any(String)
        }));
    });
    test('The username in the route doesn\'t exist', async () => {
        jest.spyOn(utils,"verifyAuth").mockReturnValue({flag:true});
        jest.spyOn(User,"findOne").mockReturnValueOnce({username: "Mario"});
        jest.spyOn(User,"findOne").mockReturnValueOnce(null);

        const req = {
            body: {username: "Mario", amount: 100, type: "food"}, 
            params: {username: "Mario"}
        };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: {refreshedTokenMessage: "ok"}
        };

        await createTransaction(req,res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            error: expect.any(String)
        }));
    });
    test('The amount is not a float', async () => {
        jest.spyOn(utils,"verifyAuth").mockReturnValue({flag:true});
        jest.spyOn(User,"findOne").mockReturnValue({username: "Mario"});
        jest.spyOn(categories,"find").mockReturnValue({type: "food", color: "red"});

        const req = {
            body: {username: "Mario", amount: "Not a number", type: "food"}, 
            params: {username: "Mario"}
        };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: {refreshedTokenMessage: "ok"}
        };

        await createTransaction(req,res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            error: expect.any(String)
        }));
    });
    test('Not the same user/not logged in', async () => {//in this case not logged in and not the same user are identical since we mock verifyAuth
        jest.spyOn(utils,"verifyAuth").mockReturnValue({flag:false, cause: "Not the same user/not logged in"});

        const req = {
            body: {username: "Mario", amount: "Not a number", type: "food"}, 
            params: {username: "Mario"}
        };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: {refreshedTokenMessage: "ok"}
        };

        await createTransaction(req,res);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            error: expect.any(String)
        }))
    });
    test('DB insertion goes wrong',async () => {
        jest.spyOn(utils,"verifyAuth").mockReturnValue({flag:true});
        jest.spyOn(User,"findOne").mockReturnValue({username: "Mario"});
        jest.spyOn(categories,"findOne").mockReturnValue({type: "food", color: "red"});
        jest.spyOn(transactions,"create").mockImplementationOnce(() => {throw new Error("Generic error")});

        const req = {
            body: {username: "Mario", amount: 100, type: "food"}, 
            params: {username: "Mario"}
        };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: {refreshedTokenMessage: "ok"}
        };
        
        await createTransaction(req,res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            error: expect.any(String)
        }))
    });
})

describe("getAllTransactions", () => { 
    test('Correct retrieval', async () => {
        jest.spyOn(utils,"verifyAuth").mockReturnValue({flag:true});
        jest.spyOn(transactions,"aggregate").mockReturnValue([
            {username: "Mario", amount: 100, type: "food", date: "2023-05-19T00:00:00", categories_info: {color: "red"}},
            {username: "Mario", amount: 70, type: "health", date: "2023-05-19T10:00:00", categories_info: {color: "green"}},
            {username: "Luigi", amount: 20, type: "food", date: "2023-05-19T10:00:00", categories_info: {color: "red"}}
        ]);
        
        const req = {};
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: {refreshedTokenMessage: "ok"}
        };

        await getAllTransactions(req,res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            data: [
                {username: "Mario", amount: 100, type: "food", date: "2023-05-19T00:00:00", color: "red"},
                {username: "Mario", amount: 70, type: "health", date: "2023-05-19T10:00:00", color: "green"},
                {username: "Luigi", amount: 20, type: "food", date: "2023-05-19T10:00:00", color: "red"}
            ],
            refreshedTokenMessage: expect.any(String)
        }))
    });
    test('Not an admin', async () => {
        jest.spyOn(utils,"verifyAuth").mockReturnValue({flag: false, cause:"Not an admin"});
        
        const req = {};
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: {refreshedTokenMessage: "ok"}
        };

        await getAllTransactions(req,res);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            error: expect.any(String)
        }))
    });
    test('DB retrieval goes wrong', async () => {
        jest.spyOn(utils,"verifyAuth").mockReturnValue({flag:true});
        jest.spyOn(transactions,"aggregate").mockImplementationOnce(() => {throw new Error("Generic error")});

        const req = {};
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: {refreshedTokenMessage: "ok"}
        };

        await getAllTransactions(req,res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            error: expect.any(String)
        }))
    });
})

describe("getTransactionsByUser", () => { 
    test('User in route does not represent user in DB', async () => {
        jest.spyOn(utils,"verifyAuth").mockReturnValue({ flag: true });
        jest.spyOn(User, "findOne").mockResolvedValue(null);

        const req = {
            params: { username: "Mario" },
            body: { }
        };

        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: {refreshedTokenMessage: "ok"}
        };

        await getTransactionsByUser(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            error: expect.any(String)
        }));
    });
    
    test('/api/users/:username/transactions : Authenticated user is not the same as the one in the route', async () => {
        jest.spyOn(utils,"verifyAuth").mockReturnValueOnce({ flag: false, cause: "Wrong User auth request" });
        jest.spyOn(utils,"verifyAuth").mockReturnValueOnce({ flag: false, cause: "Wrong Admin auth request" });

        const req = {
            params: { username: "Mario" },
            body: { },
            path: "/users/Mario/transactions"
        };

        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: {refreshedTokenMessage: "ok"}
        };

        await getTransactionsByUser(req, res);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            error: expect.any(String)
        }));
    });
    
    test('/api/transactions/users/:username : Authenticated user is not an admin', async () => {
        jest.spyOn(utils,"verifyAuth").mockReturnValueOnce({ flag: true });
        jest.spyOn(utils,"verifyAuth").mockReturnValueOnce({ flag: false, cause: "Wrong Admin auth request" });

        const req = {
            params: { username: "Mario" },
            body: { },
            path: "/transactions/users/Mario"
        };

        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: {refreshedTokenMessage: "ok"}
        };

        await getTransactionsByUser(req, res);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            error: expect.any(String)
        }));
    });

    test('Correct retrieval with no parameters', async () => {
        jest.spyOn(utils,"verifyAuth").mockReturnValue({ flag: true });
        jest.spyOn(User, "findOne").mockResolvedValueOnce({ username: "Mario" });
        jest.spyOn(utils, "handleDateFilterParams").mockReturnValueOnce({});
        jest.spyOn(utils, "handleAmountFilterParams").mockReturnValueOnce({});
        jest.spyOn(transactions, "aggregate").mockResolvedValueOnce([
            {username: "Mario", amount: 100, type: "food", date: "2023-05-19T00:00:00", categories_info: {color: "red"}},
            {username: "Mario", amount: 70, type: "health", date: "2023-05-19T10:00:00", categories_info: {color: "green"}}
        ]);

        const req = {
            params: { username: "Mario" },
            body: { }
        };

        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: {refreshedTokenMessage: "ok"}
        };

        await getTransactionsByUser(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            data: [
                {username: "Mario", amount: 100, type: "food", date: "2023-05-19T00:00:00", color: "red"},
                {username: "Mario", amount: 70, type: "health", date: "2023-05-19T10:00:00", color: "green"}
            ],
            refreshedTokenMessage: expect.any(String)
        }))
    });
    
    test('Correct retrieval with parameters', async () => {
        jest.spyOn(utils,"verifyAuth").mockReturnValue({ flag: true });
        jest.spyOn(User, "findOne").mockResolvedValueOnce({ username: "Mario" });
        jest.spyOn(utils, "handleDateFilterParams").mockReturnValueOnce({ date: "2023-05-19" });
        jest.spyOn(utils, "handleAmountFilterParams").mockReturnValueOnce({ amount: 100 });
        jest.spyOn(transactions, "aggregate").mockResolvedValueOnce([
            {username: "Mario", amount: 100, type: "food", date: "2023-05-19T00:00:00", categories_info: {color: "red"}},
            {username: "Mario", amount: 100, type: "health", date: "2023-05-19T10:00:00", categories_info: {color: "green"}}
        ]);

        const req = {
            params: { username: "Mario" },
            body: { }
        };

        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: {refreshedTokenMessage: "ok"}
        };

        await getTransactionsByUser(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            data: [
                {username: "Mario", amount: 100, type: "food", date: "2023-05-19T00:00:00", color: "red"},
                {username: "Mario", amount: 100, type: "health", date: "2023-05-19T10:00:00", color: "green"}
            ],
            refreshedTokenMessage: expect.any(String)
        }))
    });
    
    test('DB retrieval goes wrong', async () => {
        jest.spyOn(utils,"verifyAuth").mockReturnValue({flag:true});
        jest.spyOn(User, "findOne").mockResolvedValueOnce({ username: "Mario" });
        jest.spyOn(utils, "handleDateFilterParams").mockReturnValueOnce({});
        jest.spyOn(utils, "handleAmountFilterParams").mockReturnValueOnce({});
        jest.spyOn(transactions,"aggregate").mockImplementationOnce(() => {throw new Error("Generic error")});

        const req = {
            params: { username: "Mario" },
            body: { }
        };

        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: {refreshedTokenMessage: "ok"}
        };

        await getTransactionsByUser(req,res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            error: expect.any(String)
        }))
    });
})

describe("getTransactionsByUserByCategory", () => { 
    test('User in route does not represent user in DB', async () => {
        jest.spyOn(utils,"verifyAuth").mockReturnValue({ flag: true });
        jest.spyOn(User, "findOne").mockResolvedValue(null);

        const req = {
            params: { username: "Mario", category: "food" },
            body: { }
        };

        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: {refreshedTokenMessage: "ok"}
        };

        await getTransactionsByUserByCategory(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            error: expect.any(String)
        }));
    });
    
    test('Category in route does not represent category in DB', async () => {
        jest.spyOn(utils,"verifyAuth").mockReturnValue({ flag: true });
        jest.spyOn(User, "findOne").mockResolvedValue({ username: "Mario" });
        jest.spyOn(categories, "findOne").mockResolvedValue(null);

        const req = {
            params: { username: "Mario", category: "food" },
            body: { }
        };

        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: {refreshedTokenMessage: "ok"}
        };

        await getTransactionsByUserByCategory(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            error: expect.any(String)
        }));
    });
    
    test('/api/users/:username/transactions/category/:category : Authenticated user is not the same as the one in the route', async () => {
        jest.spyOn(utils,"verifyAuth").mockReturnValueOnce({ flag: false, cause: "Wrong User auth request" });
        jest.spyOn(utils,"verifyAuth").mockReturnValueOnce({ flag: false, cause: "Wrong Admin auth request" });

        const req = {
            params: { username: "Mario", category: "food" },
            body: { },
            path: "/users/Mario/transactions/category/food"
        };

        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: {refreshedTokenMessage: "ok"}
        };

        await getTransactionsByUserByCategory(req, res);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            error: expect.any(String)
        }));
    });
    
    test('/api/transactions/users/:username/category/:category : Authenticated user is not an admin', async () => {
        jest.spyOn(utils,"verifyAuth").mockReturnValueOnce({ flag: true });
        jest.spyOn(utils,"verifyAuth").mockReturnValueOnce({ flag: false, cause: "Wrong Admin auth request" });

        const req = {
            params: { username: "Mario", category: "food" },
            body: { },
            path: "/transactions/users/Mario/category/food"
        };

        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: {refreshedTokenMessage: "ok"}
        };

        await getTransactionsByUserByCategory(req, res);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            error: expect.any(String)
        }));
    });
    
    test('Correct retrieval', async () => {
        jest.spyOn(utils,"verifyAuth").mockReturnValue({ flag: true });
        jest.spyOn(User, "findOne").mockResolvedValueOnce({ username: "Mario" });
        jest.spyOn(categories, "findOne").mockResolvedValue({ type: "food", color: "red" });
        jest.spyOn(transactions, "aggregate").mockResolvedValueOnce([
            {username: "Mario", amount: 100, type: "food", date: "2023-05-19T00:00:00", categories_info: {color: "red"}},
            {username: "Mario", amount: 70, type: "food", date: "2023-05-19T10:00:00", categories_info: {color: "red"}}
        ]);

        const req = {
            params: { username: "Mario" },
            body: { }
        };

        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: {refreshedTokenMessage: "ok"}
        };

        await getTransactionsByUserByCategory(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            data: [
                {username: "Mario", amount: 100, type: "food", date: "2023-05-19T00:00:00", color: "red"},
                {username: "Mario", amount: 70, type: "food", date: "2023-05-19T10:00:00", color: "red"}
            ],
            refreshedTokenMessage: expect.any(String)
        }))
    });
    
    test('DB retrieval goes wrong', async () => {
        jest.spyOn(utils,"verifyAuth").mockReturnValue({flag:true});
        jest.spyOn(User, "findOne").mockResolvedValueOnce({ username: "Mario" });
        jest.spyOn(categories, "findOne").mockResolvedValue({ type: "food", color: "red" });
        jest.spyOn(transactions,"aggregate").mockImplementationOnce(() => {throw new Error("Generic error")});

        const req = {
            params: { username: "Mario" },
            body: { }
        };

        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: {refreshedTokenMessage: "ok"}
        };

        await getTransactionsByUserByCategory(req,res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            error: expect.any(String)
        }))
    });
})

describe("getTransactionsByGroup", () => { 
    test('Group name in route does not represent group in DB', async () => {
        jest.spyOn(Group, "findOne").mockResolvedValue(null);

        const req = {
            params: { name: "Family" },
            body: { }
        };

        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: {refreshedTokenMessage: "ok"}
        };

        await getTransactionsByGroup(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            error: expect.any(String)
        }));
    });
    
    test('/api/groups/:name/transactions : Authenticated user is not part of the group', async () => {
        jest.spyOn(Group, "findOne").mockResolvedValue({ name: "Family", members: [{ email: "email1@gmail.com", user: "1" }, { email: "email2@gmail.com", userTwo: "2" }] });
        jest.spyOn(utils,"verifyAuth").mockReturnValueOnce({ flag: true });
        jest.spyOn(utils,"verifyAuth").mockReturnValueOnce({ flag: false, cause: "Wrong Group auth request" });

        const req = {
            params: { name: "Family" },
            body: { },
            path: "/groups/Family/transactions"
        };

        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: {refreshedTokenMessage: "ok"}
        };

        await getTransactionsByGroup(req, res);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            error: expect.any(String)
        }));
    });
    
    test('/api/transactions/groups/:name : Authenticated user is not an admin', async () => {
        jest.spyOn(Group, "findOne").mockResolvedValue({ name: "Family", members: [{ email: "email1@gmail.com", user: "1" }, { email: "email2@gmail.com", userTwo: "2" }] });
        jest.spyOn(utils,"verifyAuth").mockReturnValueOnce({ flag: false, cause: "Wrong Admin auth request" });
        jest.spyOn(utils,"verifyAuth").mockReturnValueOnce({ flag: true });

        const req = {
            params: { name: "Family" },
            body: { },
            path: "/transactions/groups/Family"
        };

        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: {refreshedTokenMessage: "ok"}
        };

        await getTransactionsByGroup(req, res);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            error: expect.any(String)
        }));
    });
    
    test('Correct retrieval', async () => {
        jest.spyOn(Group, "findOne").mockResolvedValue({ name: "Family", members: [{ email: "email1@gmail.com", user: "1" }, { email: "email2@gmail.com", userTwo: "2" }] });
        jest.spyOn(utils,"verifyAuth").mockReturnValueOnce({ flag: true });
        jest.spyOn(utils,"verifyAuth").mockReturnValueOnce({ flag: true });
        jest.spyOn(User, "find").mockResolvedValueOnce([{ username: "Mario" }, { username: "Luigi" }]);
        jest.spyOn(transactions, "aggregate").mockResolvedValueOnce([
            {username: "Mario", amount: 100, type: "food", date: "2023-05-19T00:00:00", categories_info: {color: "red"}},
            {username: "Mario", amount: 70, type: "food", date: "2023-05-19T10:00:00", categories_info: {color: "red"}},
            {username: "Luigi", amount: 20, type: "food", date: "2023-05-19T10:00:00", categories_info: {color: "red"}}
        ]);

        const req = {
            params: { name: "Family" },
            body: { }
        };

        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: {refreshedTokenMessage: "ok"}
        };

        await getTransactionsByGroup(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            data: [
                {username: "Mario", amount: 100, type: "food", date: "2023-05-19T00:00:00", color: "red"},
                {username: "Mario", amount: 70, type: "food", date: "2023-05-19T10:00:00", color: "red"},
                {username: "Luigi", amount: 20, type: "food", date: "2023-05-19T10:00:00", color: "red"}
            ],
            refreshedTokenMessage: expect.any(String)
        }))
    });
    
    test('DB retrieval goes wrong', async () => {
        jest.spyOn(Group, "findOne").mockResolvedValue({ name: "Family", members: [{ email: "email1@gmail.com", user: "1" }, { email: "email2@gmail.com", userTwo: "2" }] });
        jest.spyOn(utils,"verifyAuth").mockReturnValueOnce({ flag: true });
        jest.spyOn(utils,"verifyAuth").mockReturnValueOnce({ flag: true });
        jest.spyOn(User, "find").mockResolvedValueOnce([{ username: "Mario" }, { username: "Luigi" }]);
        jest.spyOn(transactions,"aggregate").mockImplementationOnce(() => {throw new Error("Generic error")});

        const req = {
            params: { name: "Family" },
            body: { }
        };

        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: {refreshedTokenMessage: "ok"}
        };

        await getTransactionsByGroup(req,res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            error: expect.any(String)
        }))
    });
})

describe("getTransactionsByGroupByCategory", () => { 
    test('Group name in route does not represent group in DB', async () => {
        jest.spyOn(Group, "findOne").mockResolvedValue(null);

        const req = {
            params: { name: "Family" , category: "food" },
            body: { }
        };

        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: {refreshedTokenMessage: "ok"}
        };

        await getTransactionsByGroupByCategory(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            error: expect.any(String)
        }));
    });

    test('Category name in route does not represent category in DB', async () => {
        jest.spyOn(Group, "findOne").mockResolvedValue({ name: "Family", members: [{ email: "email1@gmail.com", user: "1" }, { email: "email2@gmail.com", userTwo: "2" }] });
        jest.spyOn(categories, "findOne").mockResolvedValue(null);

        const req = {
            params: { name: "Family" , category: "food" },
            body: { }
        };

        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: {refreshedTokenMessage: "ok"}
        };

        await getTransactionsByGroupByCategory(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            error: expect.any(String)
        }));
    });
    
    test('/api/groups/:name/transactions/category/:category : Authenticated user is not part of the group', async () => {
        jest.spyOn(Group, "findOne").mockResolvedValue({ name: "Family", members: [{ email: "email1@gmail.com", user: "1" }, { email: "email2@gmail.com", userTwo: "2" }] });
        jest.spyOn(categories, "findOne").mockResolvedValue({ type: "food", color: "red" });
        jest.spyOn(utils,"verifyAuth").mockReturnValueOnce({ flag: true });
        jest.spyOn(utils,"verifyAuth").mockReturnValueOnce({ flag: false, cause: "Wrong Admin auth request" });

        const req = {
            params: { name: "Family" , category: "food" },
            body: { },
            path: "/groups/Family/transactions/category/food"
        };

        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: {refreshedTokenMessage: "ok"}
        };

        await getTransactionsByGroupByCategory(req, res);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            error: expect.any(String)
        }));
    });
    
    test('/api/transactions/groups/:name/category/:category : Authenticated user is not an admin', async () => {
        jest.spyOn(Group, "findOne").mockResolvedValue({ name: "Family", members: [{ email: "email1@gmail.com", user: "1" }, { email: "email2@gmail.com", userTwo: "2" }] });
        jest.spyOn(categories, "findOne").mockResolvedValue({ type: "food", color: "red" });
        jest.spyOn(utils,"verifyAuth").mockReturnValueOnce({ flag: false, cause: "Wrong Admin auth request" });
        jest.spyOn(utils,"verifyAuth").mockReturnValueOnce({ flag: true });

        const req = {
            params: { name: "Family" , category: "food" },
            body: { },
            path: "/transactions/groups/Family/category/food"
        };

        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: {refreshedTokenMessage: "ok"}
        };

        await getTransactionsByGroupByCategory(req, res);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            error: expect.any(String)
        }));
    });
    
    test('Correct retrieval', async () => {
        jest.spyOn(Group, "findOne").mockResolvedValue({ name: "Family", members: [{ email: "email1@gmail.com", user: "1" }, { email: "email2@gmail.com", userTwo: "2" }] });
        jest.spyOn(categories, "findOne").mockResolvedValue({ type: "food", color: "red" });
        jest.spyOn(utils,"verifyAuth").mockReturnValueOnce({ flag: true });
        jest.spyOn(utils,"verifyAuth").mockReturnValueOnce({ flag: true });
        jest.spyOn(User, "find").mockResolvedValueOnce([{ username: "Mario" }, { username: "Luigi" }]);
        jest.spyOn(transactions, "aggregate").mockResolvedValueOnce([
            {username: "Mario", amount: 100, type: "food", date: "2023-05-19T00:00:00", categories_info: {color: "red"}},
            {username: "Mario", amount: 70, type: "food", date: "2023-05-19T10:00:00", categories_info: {color: "red"}},
            {username: "Luigi", amount: 20, type: "food", date: "2023-05-19T10:00:00", categories_info: {color: "red"}}
        ]);

        const req = {
            params: { name: "Family" , category: "food" },
            body: { }
        };

        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: {refreshedTokenMessage: "ok"}
        };

        await getTransactionsByGroupByCategory(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            data: [
                {username: "Mario", amount: 100, type: "food", date: "2023-05-19T00:00:00", color: "red"},
                {username: "Mario", amount: 70, type: "food", date: "2023-05-19T10:00:00", color: "red"},
                {username: "Luigi", amount: 20, type: "food", date: "2023-05-19T10:00:00", color: "red"}
            ],
            refreshedTokenMessage: expect.any(String)
        }))
    });
    
    test('DB retrieval goes wrong', async () => {
        jest.spyOn(Group, "findOne").mockResolvedValue({ name: "Family", members: [{ email: "email1@gmail.com", user: "1" }, { email: "email2@gmail.com", userTwo: "2" }] });
        jest.spyOn(categories, "findOne").mockResolvedValue({ type: "food", color: "red" });
        jest.spyOn(utils,"verifyAuth").mockReturnValueOnce({ flag: true });
        jest.spyOn(utils,"verifyAuth").mockReturnValueOnce({ flag: true });
        jest.spyOn(User, "find").mockResolvedValueOnce([{ username: "Mario" }, { username: "Luigi" }]);
        jest.spyOn(transactions,"aggregate").mockImplementationOnce(() => {throw new Error("Generic error")});

        const req = {
            params: { name: "Family" , category: "food" },
            body: { }
        };

        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: {refreshedTokenMessage: "ok"}
        };

        await getTransactionsByGroupByCategory(req,res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            error: expect.any(String)
        }))
    });
})

describe("deleteTransaction", () => { 
    test('Request body does not contain all attributes', async () => {
        jest.spyOn(utils,"verifyAuth").mockReturnValueOnce({ flag: true });

        const req = {
            params: { username: "Mario" },
            body: {  }
        };

        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: {refreshedTokenMessage: "ok"}
        };

        await deleteTransaction(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            error: expect.any(String)
        }));
    });
    
    test('`_id` in body is an empty string', async () => {
        jest.spyOn(utils,"verifyAuth").mockReturnValueOnce({ flag: true });

        const req = {
            params: { username: "Mario" },
            body: { _id: " " }
        };

        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: {refreshedTokenMessage: "ok"}
        };

        await deleteTransaction(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            error: expect.any(String)
        }));
    });
    
    test('User in route parameter is not present in DB', async () => {
        jest.spyOn(utils,"verifyAuth").mockReturnValueOnce({ flag: true });
        jest.spyOn(User, "findOne").mockResolvedValue(null)

        const req = {
            params: { username: "Mario" },
            body: { _id: "6hjkohgfc8nvu786" }
        };

        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: {refreshedTokenMessage: "ok"}
        };

        await deleteTransaction(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            error: expect.any(String)
        }));
    });
    
    test('`_id` does not represent a transaction', async () => {
        jest.spyOn(utils,"verifyAuth").mockReturnValueOnce({ flag: true });
        jest.spyOn(User, "findOne").mockResolvedValue({ username: "Mario" })
        jest.spyOn(transactions, "findOne").mockResolvedValue(null)

        const req = {
            params: { username: "Mario" },
            body: { _id: "6hjkohgfc8nvu786" }
        };

        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: {refreshedTokenMessage: "ok"}
        };

        await deleteTransaction(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            error: expect.any(String)
        }));
    });
    
    test('`_id` represents a transaction made by a different user', async () => {
        jest.spyOn(utils,"verifyAuth").mockReturnValueOnce({ flag: true });
        jest.spyOn(User, "findOne").mockResolvedValue({ username: "Mario" })
        jest.spyOn(transactions, "findOne").mockResolvedValue({ username: "Luigi" })

        const req = {
            params: { username: "Mario" },
            body: { _id: "6hjkohgfc8nvu786" }
        };

        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: {refreshedTokenMessage: "ok"}
        };

        await deleteTransaction(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            error: expect.any(String)
        }));
    });

    test('Authenticated user is not the same one specified in the route', async () => {
        jest.spyOn(utils,"verifyAuth").mockReturnValueOnce({ flag: false, cause: "Wrong User auth request" });

        const req = {
            params: { username: "Mario" },
            body: { _id: "6hjkohgfc8nvu786" }
        };

        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: {refreshedTokenMessage: "ok"}
        };

        await deleteTransaction(req, res);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            error: expect.any(String)
        }));
    });
    
    test('Successful deletion', async () => {
        jest.spyOn(utils,"verifyAuth").mockReturnValueOnce({ flag: true });
        jest.spyOn(User, "findOne").mockResolvedValue({ username: "Mario" })
        jest.spyOn(transactions, "findOne").mockResolvedValue({ username: "Mario" })

        const req = {
            params: { username: "Mario" },
            body: { _id: "6hjkohgfc8nvu786" }
        };

        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: {refreshedTokenMessage: "ok"}
        };

        await deleteTransaction(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            data: { message: expect.any(String) },
            refreshedTokenMessage: expect.any(String)
        }));
    });
    
    test('DB operation goes wrong', async () => {
        jest.spyOn(utils,"verifyAuth").mockReturnValueOnce({ flag: true });
        jest.spyOn(User, "findOne").mockResolvedValue({ username: "Mario" })
        jest.spyOn(transactions, "findOne").mockResolvedValue({ username: "Mario" })
        jest.spyOn(transactions, "deleteOne").mockImplementationOnce(() => {throw new Error("Generic error")});

        const req = {
            params: { username: "Mario" },
            body: { _id: "6hjkohgfc8nvu786" }
        };

        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: {refreshedTokenMessage: "ok"}
        };

        await deleteTransaction(req,res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            error: expect.any(String)
        }));
    });
})

describe("deleteTransactions", () => { 
    test('Request body does not contain all attributes', async () => {
        jest.spyOn(utils,"verifyAuth").mockReturnValueOnce({ flag: true });

        const req = {
            params: { },
            body: { }
        };

        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: {refreshedTokenMessage: "ok"}
        };

        await deleteTransactions(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            error: expect.any(String)
        }));
    });

    test('At least one of the provided ids is an empty string', async () => {
        jest.spyOn(utils,"verifyAuth").mockReturnValueOnce({ flag: true });

        const req = {
            params: { },
            body: { _ids: ["6hjkohgfc8nvu786", " "] }
        };

        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: {refreshedTokenMessage: "ok"}
        };

        await deleteTransactions(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            error: expect.any(String)
        }));
    });
    
    test('At least one of the provided ids does not represent a transaction', async () => {
        jest.spyOn(utils,"verifyAuth").mockReturnValueOnce({ flag: true });
        jest.spyOn(transactions, "find").mockResolvedValue([{ username: "Mario" }])
 
        const req = {
            params: { },
            body: { _ids: ["6hjkohgfc8nvu786", "6hjko5gfc9nvu786"] }
        };

        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: {refreshedTokenMessage: "ok"}
        };

        await deleteTransactions(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            error: expect.any(String)
        }));
    });
    
    test('Authenticated user is not an admin', async () => {
        jest.spyOn(utils,"verifyAuth").mockReturnValueOnce({ flag: false, cause: "Wrong Admin auth request" });
 
        const req = {
            params: { },
            body: { _ids: ["6hjkohgfc8nvu786", "6hjko5gfc9nvu786"] }
        };

        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: {refreshedTokenMessage: "ok"}
        };

        await deleteTransactions(req, res);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            error: expect.any(String)
        }));
    });
    
    test('Transactions deleted successfully', async () => {
        jest.spyOn(utils,"verifyAuth").mockReturnValueOnce({ flag: true });
        jest.spyOn(transactions, "find").mockResolvedValue([{ username: "Mario" }, { username: "Luigi" }])
        jest.spyOn(transactions, "deleteMany").mockResolvedValue(2)
 
        const req = {
            params: { },
            body: { _ids: ["6hjkohgfc8nvu786", "6hjko5gfc9nvu786"] }
        };

        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: {refreshedTokenMessage: "ok"}
        };

        await deleteTransactions(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            data: { message: expect.any(String) },
            refreshedTokenMessage: expect.any(String)
        }));
    });
    
    test('DB operation goes wrong', async () => {
        jest.spyOn(utils,"verifyAuth").mockReturnValueOnce({ flag: true });
        jest.spyOn(transactions, "find").mockResolvedValue([{ username: "Mario" }, { username: "Luigi" }])
        jest.spyOn(transactions, "deleteMany").mockImplementationOnce(() => {throw new Error("Generic error")});
 
        const req = {
            params: { },
            body: { _ids: ["6hjkohgfc8nvu786", "6hjko5gfc9nvu786"] }
        };

        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: {refreshedTokenMessage: "ok"}
        };

        await deleteTransactions(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            error: expect.any(String)
        }));
    });
})
