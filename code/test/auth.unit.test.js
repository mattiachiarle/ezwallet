import request from 'supertest';
import { app } from '../app';
import { User } from '../models/User.js';
import {register, login} from '../controllers/auth.js'
import jwt from 'jsonwebtoken';
const bcrypt = require("bcryptjs")

//jest.mock("bcryptjs")
jest.mock('jsonwebtoken')
jest.mock('../models/User.js');

describe('register', () => { 
    test('Correct registration', async () => {
        jest.spyOn(User,"findOne").mockReturnValue(null);
        jest.spyOn(User,"create").mockReturnValue({username: "Mario"});
        
        const req = {
            body: {username: "Mario", email: "mario.red@email.com", password: "securePass"}, 
        };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };

        await register(req,res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            data: expect.objectContaining({
                message: expect.any(String)
            })
        }));
    });
    test('Missing username', async () => {
        const req = {
            body: {email: "mario.red@email.com", password: "securePass"}, 
        };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };

        await register(req,res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            error: expect.any(String)
        }));
    });
    test('Missing email', async () => {
        const req = {
            body: {username: "Mario", password: "securePass"}, 
        };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };

        await register(req,res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            error: expect.any(String)
        }));
    });
    test('Missing password', async () => {
        const req = {
            body: {username: "Mario", email: "mario.red@email.com"}, 
        };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };

        await register(req,res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            error: expect.any(String)
        }));
    });
    test('Empty username', async () => {
        const req = {
            body: {username: "      ", email: "mario.red@email.com", password: "securePass"}, 
        };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };

        await register(req,res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            error: expect.any(String)
        }));
    });
    test('Empty email', async () => {
        const req = {
            body: {username: "Mario", email: "       ", password: "securePass"}, 
        };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };

        await register(req,res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            error: expect.any(String)
        }));
    });
    test('Empty password', async () => {
        const req = {
            body: {username: "Mario", email: "mario.red@email.com", password: ""}, 
        };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };

        await register(req,res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            error: expect.any(String)
        }));
    });
    test('Email not valid', async () => {
        const req = {
            body: {username: "Mario", email: "mario.red", password: "securePass"}, 
        };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };

        await register(req,res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            error: expect.any(String)
        }));
    });
    test('Username already used', async () => {
        jest.spyOn(User,"findOne").mockReturnValueOnce(null);
        jest.spyOn(User,"findOne").mockReturnValueOnce({username: "Mario"});
        
        const req = {
            body: {username: "Mario", email: "mario.red@email.com", password: "securePass"}, 
        };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };

        await register(req,res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            error: expect.any(String)
        }));
    });
    test('Email already used', async () => {
        jest.spyOn(User,"findOne").mockReturnValueOnce({username: "Mario"});
        
        const req = {
            body: {username: "Mario", email: "mario.red@email.com", password: "securePass"}, 
        };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };

        await register(req,res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            error: expect.any(String)
        }));
    });
    test('DB error', async () => {
        jest.spyOn(User,"findOne").mockReturnValue(null);
        jest.spyOn(User,"create").mockImplementationOnce(() => {throw new Error("Generic error")});
        
        const req = {
            body: {username: "Mario", email: "mario.red@email.com", password: "securePass"}, 
        };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };

        await register(req,res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            error: expect.any(String)
        }));
    });
});

describe("registerAdmin", () => { 
    test('Dummy test, change it', () => {
        expect(true).toBe(true);
    });
})

describe('login', () => { 
    test('Correct login', async () => {
        //jest.spyOn(bcrypt,"compare").mockReturnValue(true);
        jest.spyOn(jwt,"sign").mockReturnValue("Generic token");

        const req = {
            body: {email: "mario.red@email.com", password: "securePass"}, 
            cookies: {},
        };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            cookie: jest.fn(),
        };

        const dbPass = await bcrypt.hash("securePass",12);

        jest.spyOn(User,"findOne").mockReturnValue({
            username: "Mario",
            email: "mario.red@email.com",
            password: dbPass,
            id: "generic id",
            role: "user",
            save: jest.fn()
        });

        await login(req,res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.cookie).toHaveBeenCalled();
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            data: expect.objectContaining({
                accessToken: expect.any(String),
                refreshToken: expect.any(String),
            })
        }));
    });
    test('Email missing', async () => {
        const req = {
            body: {password: "securePass"}, 
            cookies: {},
        };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            cookie: jest.fn(),
        };

        await login(req,res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            error: expect.any(String)
        }));
    });
    test('Password missing', async () => {
        const req = {
            body: {email: "mario.red@email.com"}, 
            cookies: {},
        };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            cookie: jest.fn(),
        };

        await login(req,res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            error: expect.any(String)
        }));
    });
    test('Empty email', async () => {
        const req = {
            body: {email: "    ", password: "securePass"}, 
            cookies: {},
        };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            cookie: jest.fn(),
        };

        await login(req,res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            error: expect.any(String)
        }));
    });
    test('Empty password', async () => {
        const req = {
            body: {email: "mario.red@email.com", password: "   "}, 
            cookies: {},
        };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            cookie: jest.fn(),
        };

        await login(req,res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            error: expect.any(String)
        }));
    });
    test('Email not valid', async () => {
        const req = {
            body: {email: "mario.red@email", password: "securePass"}, 
            cookies: {},
        };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            cookie: jest.fn(),
        };

        await login(req,res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            error: expect.any(String)
        }));
    });
    test('User not found', async () => {
        jest.spyOn(jwt,"sign").mockReturnValue("Generic token");
        jest.spyOn(User,"findOne").mockReturnValue(null);

        const req = {
            body: {email: "mario.red@email.com", password: "securePass"}, 
            cookies: {},
        };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            cookie: jest.fn(),
        };

        await login(req,res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            error: expect.any(String)
        }));
    });
    test('Wrong password', async () => {
        jest.spyOn(jwt,"sign").mockReturnValue("Generic token");

        const req = {
            body: {email: "mario.red@email.com", password: "securePass"}, 
            cookies: {},
        };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            cookie: jest.fn(),
        };

        const dbPass = await bcrypt.hash("differentPass",12);

        jest.spyOn(User,"findOne").mockReturnValue({
            username: "Mario",
            email: "mario.red@email.com",
            password: dbPass,
            id: "generic id",
            role: "user",
            save: jest.fn()
        });

        await login(req,res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            error: expect.any(String)
        }));
    });
    test('DB error', async () => {
        jest.spyOn(jwt,"sign").mockReturnValue("Generic token");

        const req = {
            body: {email: "mario.red@email.com", password: "securePass"}, 
            cookies: {},
        };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            cookie: jest.fn(),
        };

        const dbPass = await bcrypt.hash("securePass",12);

        jest.spyOn(User,"findOne").mockReturnValue({
            username: "Mario",
            email: "mario.red@email.com",
            password: dbPass,
            id: "generic id",
            role: "user",
            save: jest.fn().mockImplementationOnce(() => {throw new Error("Generic error")})
        });

        await login(req,res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            error: expect.any(String)
        }));
    });
});

describe('logout', () => { 
    test('Dummy test, change it', () => {
        expect(true).toBe(true);
    });
});
