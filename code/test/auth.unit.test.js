import request from 'supertest';
import { app } from '../app';
import { User } from '../models/User.js';
import { register, registerAdmin, login , logout} from '../controllers/auth.js'
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

    test('Body is lacking username', async () => {

        const req = {
            body: {email: "email1@gmail.com", password: "password"}, 
        };

        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };

        await registerAdmin(req,res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            error: expect.any(String)
        }));
    });

    test('Body is lacking email', async () => {

        const req = {
            body: {username: "Mario", password: "password"}, 
        };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };

        await registerAdmin(req,res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            error: expect.any(String)
        }));
    });

    test('Body is lacking password', async () => {

        const req = {
            body: {username: "Mario", email: "email1@gmail.com"}, 
        };

        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };

        await registerAdmin(req,res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            error: expect.any(String)
        }));
    });

    test('Username is an empty string', async () => {

        const req = {
            body: {username: " ", email: "email1@gmail.com", password: "password"}, 
        };

        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };

        await registerAdmin(req,res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            error: expect.any(String)
        }));
    });

    test('Email is an empty string', async () => {

        const req = {
            body: {username: "Mario", email: " ", password: "password"}, 
        };

        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };

        await registerAdmin(req,res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            error: expect.any(String)
        }));
    });

    test('Password is an empty string', async () => {

        const req = {
            body: {username: "Mario", email: "email1@gmail.com", password: " "}, 
        };

        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };

        await registerAdmin(req,res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            error: expect.any(String)
        }));
    });

    test('Email is not in a valid format', async () => {

        const req = {
            body: {username: "Mario", email: "email1.com", password: "password"}, 
        };

        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };

        await registerAdmin(req,res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            error: expect.any(String)
        }));
    });

    test('Username identifies an existing user', async () => {
        jest.spyOn(User, "findOne").mockResolvedValueOnce(null);
        jest.spyOn(User, "findOne").mockResolvedValueOnce({username: "Mario"});
        
        const req = {
            body: {username: "Mario", email: "email1@gmail.com", password: "password"}, 
        };

        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };

        await registerAdmin(req,res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            error: expect.any(String)
        }));
    });

    test('Email identifies an existing user', async () => {
        jest.spyOn(User, "findOne").mockResolvedValueOnce({email: "email1@gmail.com"});
        
        const req = {
            body: {username: "Mario", email: "email1@gmail.com", password: "password"}, 
        };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };

        await registerAdmin(req,res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            error: expect.any(String)
        }));
    });

    test('Admin registered', async () => {
        jest.spyOn(User, "findOne").mockResolvedValue(null);
        jest.spyOn(User, "create").mockResolvedValue({ username: "Mario" });
        
        const req = {
            body: {username: "Mario", email: "email1@gmail.com", password: "password"}, 
        };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };

        await registerAdmin(req,res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            data: expect.objectContaining({
                message: expect.any(String)
            })
        }));
    });

    test('DB operation goes wrong', async () => {
        jest.spyOn(User, "findOne").mockResolvedValue(null);
        jest.spyOn(User, "create").mockImplementationOnce(() => {throw new Error("Generic error")});
        
        const req = {
            body: {username: "Mario", email: "email1@gmail.com", password: "password"}, 
        };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };

        await registerAdmin(req,res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            error: expect.any(String)
        }));
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

    test('Request does not have a refresh token in the cookies', async () => {

        const req = {
            body: { }, 
            cookies: { },
        };

        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            cookie: jest.fn(),
        };

        await logout(req,res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            error: expect.any(String)
        }));
    });

    test('Refresh token does not represent a user', async () => {
        jest.spyOn(User, "findOne").mockResolvedValue(null);

        const req = {
            body: { }, 
            cookies: { accessToken: "accessTokenValid", refreshToken: "refreshTokenValid" }
        };

        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            cookie: jest.fn(),
        };

        await logout(req,res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            error: expect.any(String)
        }));
    });
    

    test('User successfully logout', async () => {
        jest.spyOn(User, "findOne").mockResolvedValue({ 
            username: "Mario" ,
            save: jest.fn().mockImplementationOnce(() => { })});

        const req = {
            body: { }, 
            cookies: { accessToken: "accessTokenValid", refreshToken: "refreshTokenValid" }
        };

        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            cookie: jest.fn(),
        };

        await logout(req,res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
          data: { message: 'User logged out' },
        }));
        expect(res.cookie).toHaveBeenCalledTimes(2);
        expect(res.cookie).toHaveBeenCalledWith('accessToken', '', {
          httpOnly: true,
          path: '/api',
          maxAge: 0,
          sameSite: 'none',
          secure: true,
        });
        expect(res.cookie).toHaveBeenCalledWith('refreshToken', '', {
          httpOnly: true,
          path: '/api',
          maxAge: 0,
          sameSite: 'none',
          secure: true,
        });
    });
    
    test('DB operation goes wrong', async () => {
        jest.spyOn(User, "findOne").mockResolvedValue({ 
            username: "Mario" ,
            save: jest.fn().mockImplementationOnce(() => {throw new Error("Generic error")})});

        const req = {
            body: { }, 
            cookies: { accessToken: "accessTokenValid", refreshToken: "refreshTokenValid" }
        };

        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            cookie: jest.fn(),
        };

        await logout(req,res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
          error: expect.any(String)
        }));    
    });

});
