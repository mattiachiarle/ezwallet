import request from 'supertest';
import { app } from '../app';
import { categories, transactions } from '../models/model';
import {User, Group} from '../models/User.js'
import {createCategory, updateCategory, deleteCategory, getCategories, createTransaction, getAllTransactions} from '../controllers/controller.js'
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
        jest.spyOn(categories,"find").mockReturnValue({type: "food", color: "red"});
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
        jest.spyOn(categories,"find").mockReturnValue(null);

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
        jest.spyOn(categories,"find").mockReturnValue({type: "food", color: "red"});
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
        jest.spyOn(utils,"verifyAuth").mockReturnValue({flag: false, casue:"Not an admin"});
        
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
