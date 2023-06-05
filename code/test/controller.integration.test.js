import request from 'supertest';
import { app } from '../app';
import { User, Group } from '../models/User.js';
import { categories, transactions } from '../models/model';
import mongoose, { Model } from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

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
    test('Dummy test, change it', () => {
        expect(true).toBe(true);
    });
})

describe("updateCategory", () => { 
    test('Dummy test, change it', () => {
        expect(true).toBe(true);
    });
})

describe("deleteCategory", () => { 
    test('Dummy test, change it', () => {
        expect(true).toBe(true);
    });
})

describe("getCategories", () => { 
    test('Dummy test, change it', () => {
        expect(true).toBe(true);
    });
})

describe("createTransaction", () => { 
    test('Dummy test, change it', () => {
        expect(true).toBe(true);
    });
})

describe("getAllTransactions", () => { 
    test('Dummy test, change it', () => {
        expect(true).toBe(true);
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
