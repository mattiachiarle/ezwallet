import request from 'supertest';
import { app } from '../app';
import { User } from '../models/User.js';
import jwt from 'jsonwebtoken';
const bcrypt = require("bcryptjs")
import mongoose, { Model } from 'mongoose';
import dotenv from 'dotenv';
import { register, login } from '../controllers/auth';

dotenv.config();

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

beforeAll(async () => {
  const dbName = "testingDatabaseAuth";
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
    await User.deleteMany({})
})

describe("register", () => { 
  test('Correct registration', async () => {
    
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
    expect((await User.find({})).length).toBe(1);
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
    await User.create(userOne);
    
    const req = {
        body: {username: userOne.username, email: "mario.red@email.com", password: "securePass"}, 
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
    await User.create(userOne);
    
    const req = {
        body: {username: "Mario", email: userOne.email, password: "securePass"}, 
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

})

describe("registerAdmin", () => { 
  test('Body is lacking username', (done) => {
        request(app)
            .post(`/api/admin`)
            .send({ email: "email1@gmail.com", password: "password" })
            .then((response) => {
                expect(response.status).toBe(400);
                expect(response.body).toHaveProperty("error");
                done();
            }).catch((err) => done(err));
  });
  
  test('Body is lacking email', (done) => {
    request(app)
        .post(`/api/admin`)
        .send({ username: "Mario", password: "password" })
        .then((response) => {
            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty("error");
            done();
        }).catch((err) => done(err));
  });
  
  test('Body is lacking password', (done) => {
    request(app)
        .post(`/api/admin`)
        .send({ username: "Mario", email: "email1@gmail.com" })
        .then((response) => {
            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty("error");
            done();
        }).catch((err) => done(err));
  });
  
  test('Username is an empty string', (done) => {
    request(app)
        .post(`/api/admin`)
        .send({ username: " ", email: "email1@gmail.com", password: "password" })
        .then((response) => {
            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty("error");
            done();
        }).catch((err) => done(err));
  });
  
  test('Email is an empty string', (done) => {
    request(app)
        .post(`/api/admin`)
        .send({ username: "Mario", email: " ", password: "password" })
        .then((response) => {
            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty("error");
            done();
        }).catch((err) => done(err));
  });
  
  test('Password is an empty string', (done) => {
    request(app)
        .post(`/api/admin`)
        .send({ username: "Mario", email: "email1@gmail.com", password: " " })
        .then((response) => {
            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty("error");
            done();
        }).catch((err) => done(err));
  });
  
  test('Email is not in a valid format', (done) => {
    request(app)
        .post(`/api/admin`)
        .send({ username: "Mario", email: "email1.com", password: "password" })
        .then((response) => {
            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty("error");
            done();
        }).catch((err) => done(err));
  });
  
  test('Username identifies an existing user', (done) => {
    User.create(userOne).then(() => {
      request(app)
          .post(`/api/admin`)
          .send({ username: userOne.username, email: "email1@gmail.com", password: "password" })
          .then((response) => {
              expect(response.status).toBe(400);
              expect(response.body).toHaveProperty("error");
              done();
          }).catch((err) => done(err));
    });
  });
  
  test('Email identifies an existing user', (done) => {
    User.create(userOne).then(() => {
      request(app)
          .post(`/api/admin`)
          .send({ username: "Mario", email: userOne.email, password: "password" })
          .then((response) => {
              expect(response.status).toBe(400);
              expect(response.body).toHaveProperty("error");
              done();
          }).catch((err) => done(err));
    });
  });
  
  test('Admin registered', (done) => {
    request(app)
        .post(`/api/admin`)
        .send({ username: "Mario", email: "email1@gmail.com", password: "password" })
        .then((response) => {
            expect(response.status).toBe(200);
            expect(response.body.data).toHaveProperty("message");
            done();
        }).catch((err) => done(err));
  });
});

describe('login', () => { 
  test('Correct login', async () => {
      await User.create(userOne);

    const req = {
        body: {email: userOne.email, password: "123"}, 
        cookies: {},
    };
    const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
        cookie: jest.fn(),
    };

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
    await User.create(userOne);

    const req = {
        body: {password: "123"}, 
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
    await User.create(userOne);

    const req = {
        body: {email: userOne.email}, 
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
    await User.create(userOne);

    const req = {
        body: {email: "    ", password: "123"}, 
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
    await User.create(userOne);

    const req = {
        body: {email: userOne.email, password: "   "}, 
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
    await User.create(userOne);

    const req = {
        body: {email: "user@user", password: "123"}, 
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
    await User.create(userOne);

    const req = {
        body: {email: userTwo.email, password: "123"}, 
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
    await User.create(userOne);

    const req = {
        body: {email: userOne.email, password: "notTheRightPassword"}, 
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

});

describe('logout', () => { 
  test('Request does not have a refresh token in the cookies', (done) => {
    request(app)
        .get(`/api/logout`)
        .set("Cookie", { })
        .send({ })
        .then((response) => {
            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty("error");
            done();
        }).catch((err) => done(err));
  });
  
  test('Refresh token does not represent a user', (done) => {
    User.create(userOne).then(() => {
      request(app)
          .get(`/api/logout`)
          .set("Cookie", `accessToken=${adminAccessToken}; refreshToken=${adminOne.refreshToken}`)
          .send({ })
          .then((response) => {
              expect(response.status).toBe(400);
              expect(response.body).toHaveProperty("error");
              done();
          }).catch((err) => done(err));
    });
  });
  
  test('User successfully logout', (done) => {
    User.create(userOne).then(() => {
      request(app)
          .get(`/api/logout`)
          .set("Cookie", `accessToken=${accessTokenUserOne}; refreshToken=${userOne.refreshToken}`)
          .send({ })
          .then((response) => {
              expect(response.status).toBe(200);
              expect(response.body.data).toHaveProperty("message");
              done();
          }).catch((err) => done(err));
    });
  });
});
