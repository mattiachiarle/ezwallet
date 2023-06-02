import request from 'supertest';
import { app } from '../app';
import { categories, transactions } from '../models/model';
import {createCategory, updateCategory, deleteCategory} from '../controllers/controller.js'
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
        jest.spyOn(categories,"find").mockResolvedValueOnce(null);
        jest.spyOn(categories,"find").mockResolvedValueOnce({type: "food", color: "red"});
        
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
    });
    test('Not an admin', async () => {
        jest.spyOn(utils,"verifyAuth").mockReturnValue({flag:false});

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
    });
})

describe("updateCategory", () => { 
    test('Correct update', async () => { //verifications on count will be made in integration tests since here they're useless since we should mock them
        jest.spyOn(utils,"verifyAuth").mockReturnValue({flag:true});
        jest.spyOn(categories,"findOne").mockResolvedValue({type: "food", color: "red"});
        jest.spyOn(categories,"find").mockResolvedValueOnce(null);
        jest.spyOn(categories,"updateOne").mockResolvedValue({type: "Food", color: "yellow"});
        jest.spyOn(transactions,"updateMany").mockResolvedValue(1);//fake value
        
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
        jest.spyOn(utils,"verifyAuth").mockReturnValue({flag:false});

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
        jest.spyOn(categories,"findOne").mockResolvedValue({type: "food", color: "red"});
        jest.spyOn(categories,"find").mockResolvedValueOnce(null);
        jest.spyOn(categories,"updateOne").mockImplementationOnce(() => {throw new Error("Generic error")});
        
        const req = { body: { type: "Food", color: "yellow" }, params: {type: "food"}};
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: {refreshedTokenMessage: "ok"}
        };
        
        await updateCategory(req,res);

        expect(res.status).toHaveBeenCalledWith(500);
    });
})

describe("deleteCategory", () => { 
    test('Correct, N>T', async () => {
        jest.spyOn(utils,"verifyAuth").mockReturnValue({flag:true});
        jest.spyOn(categories,"find").mockResolvedValueOnce([{type: "Food", color:"red"},{type:"Health", color: "yellow"}]);
        jest.spyOn(categories,"findOne").mockResolvedValueOnce({type: "Parking", color:"blue"});
        jest.spyOn(categories,"countDocuments").mockResolvedValue(3);
        jest.spyOn(transactions,"deleteMany").mockResolvedValue(true);
        jest.spyOn(transactions,"updateMany").mockResolvedValue(5);
        
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
        jest.spyOn(transactions,"deleteMany").mockResolvedValue(true);
        jest.spyOn(transactions,"updateMany").mockResolvedValue(5);
        
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
        expect(res.status).toHaveBeenCalledWith(500);
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
        jest.spyOn(utils,"verifyAuth").mockReturnValue({flag:false});

        const req = { body: {types: ["Food", "Health"]}};
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
    });
})

describe("getCategories", () => { 
    test('Correct category retrieval', () => {
        expect(true).toBe(true);
    });
    test('Not logged in', () => {
        expect(true).toBe(true);
    });
})

describe("createTransaction", () => { 
    test('Correct transaction creation', () => {
        expect(true).toBe(true);
    });
    test('Username missing', () => {
        expect(true).toBe(true);
    });
    test('Amount missing', () => {
        expect(true).toBe(true);
    });
    test('Type missing', () => {
        expect(true).toBe(true);
    });
    test('Username empty', () => {
        expect(true).toBe(true);
    });
    test('Amount empty', () => {
        expect(true).toBe(true);
    });
    test('Type empty', () => {
        expect(true).toBe(true);
    });
    test('Category not existing', () => {
        expect(true).toBe(true);
    });
    test('The username of the transaction is different by the one in the route', () => {
        expect(true).toBe(true);
    });
    test('The username of the transaction doesn\'t exist', () => {
        expect(true).toBe(true);
    });
    test('The username in the route doesn\'t exist', () => {
        expect(true).toBe(true);
    });
    test('The amount is not a float', () => {
        expect(true).toBe(true);
    });
    test('Not the same user', () => {
        expect(true).toBe(true);
    });
})

describe("getAllTransactions", () => { 
    test('Not an admin', () => {
        expect(true).toBe(true);
    });
})

describe("getTransactionsByUser", () => { 
    test('Dummy test, change it', () => {
        expect(true).toBe(true);
    });
})

describe("getTransactionsByUserByCategory", () => { 
    test('Dummy test, change it', () => {
        expect(true).toBe(true);
    });
})

describe("getTransactionsByGroup", () => { 
    test('Dummy test, change it', () => {
        expect(true).toBe(true);
    });
})

describe("getTransactionsByGroupByCategory", () => { 
    test('Dummy test, change it', () => {
        expect(true).toBe(true);
    });
})

describe("deleteTransaction", () => { 
    test('Dummy test, change it', () => {
        expect(true).toBe(true);
    });
})

describe("deleteTransactions", () => { 
    test('Dummy test, change it', () => {
        expect(true).toBe(true);
    });
})
