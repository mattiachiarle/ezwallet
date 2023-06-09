import request from 'supertest';
import { app } from '../app';
import { User, Group } from '../models/User.js';
import { transactions, categories } from '../models/model';
import mongoose, { Model } from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { addToGroup, removeFromGroup, deleteUser, deleteGroup } from "../controllers/users";

/**
 * Necessary setup in order to create a new database for testing purposes before starting the execution of test cases.
 * Each test suite has its own database in order to avoid different tests accessing the same database at the same time and expecting different data.
 */
dotenv.config();

let userOneId = new mongoose.Types.ObjectId();
let adminOneId = new mongoose.Types.ObjectId();
let userTwoId = new mongoose.Types.ObjectId();
let accessToken = "";
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
const retrievedGroup = { name: 'group1', members: [{ email: userOne.email, user: userOneId }] };
const retrievedGroup2 = { name: 'group2', members: [{ email: userOne.email, user: userOneId },{email: userTwo.email, user: userTwoId}] };
const retrievedGroup4 = { name: 'group4', members: [userOne, userTwo]};

beforeAll(async () => {
  const dbName = "testingDatabaseUsers";
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

  adminOne.refreshToken = jwt.sign({
    email: adminOne.email,
    id: adminOneId.toString(),
    username: adminOne.username,
    role: adminOne.role
  }, process.env.ACCESS_KEY, { expiresIn: '7d' });

  accessToken = jwt.sign({
    email: userOne.email,
    id: userOneId.toString(),
    username: userOne.username,
    role: userOne.role
  }, process.env.ACCESS_KEY, { expiresIn: '1h' });

  adminAccessToken = jwt.sign({
    email: adminOne.email,
    id: adminOneId.toString(),
    username: adminOne.username,
    role: adminOne.role
  }, process.env.ACCESS_KEY, { expiresIn: '1h' });

  userOne.password = await bcrypt.hash("123", 12);
  adminOne.password = await bcrypt.hash("123", 12);
  userTwo.password = await bcrypt.hash("123", 12);
  userOne._id = userOneId;
  userTwo._id = userTwoId;

});

/**
 * After all test cases have been executed the database is deleted.
 * This is done so that subsequent executions of the test suite start with an empty database.
 */
afterAll(async () => {
  await mongoose.connection.db.dropDatabase();
  await mongoose.connection.close();
});

beforeEach(async () => {
  await categories.deleteMany({})
  await transactions.deleteMany({})
  await User.deleteMany({})
  await Group.deleteMany({})
})

describe("getUsers", () => {
  /**
   * Database is cleared before each test case, in order to allow insertion of data tailored for each specific test case.
   */
 
  test("should retrieve list of all users", (done) => {
    User.create(adminOne).then(() => {
      request(app)
        .get("/api/users")
        .set("Cookie", `accessToken=${adminAccessToken}; refreshToken=${adminOne.refreshToken}`)
        .then((response) => {
          expect(response.status).toBe(200);
          expect(response.body).toHaveProperty("data");
          expect(response.body.data[0].username).toEqual(adminOne.username);
          expect(response.body.data[0].email).toEqual(adminOne.email);
          expect(response.body.data[0].role).toEqual(adminOne.role);
          done()
        })
        .catch((err) => done(err))
    })
  })
  
  test("should return empty list if there are no users", (done) => {
    request(app)
      .get("/api/users")
      .set("Cookie", `accessToken=${adminAccessToken}; refreshToken=${adminOne.refreshToken}`)
      .then((response) => {
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("data");
        expect(response.body.data).toHaveLength(0);
        done();
      })
      .catch((err) => done(err))
  })


  test('should retrieve error because is not called by an admin', (done) => {
    request(app)
      .get("/api/users")
      .set('Cookie', `accessToken=${accessToken}; refreshToken=${userOne.refreshToken}`)
      .then((response) => {
        expect(response.status).toBe(401);
        done();
      })
      .catch((err) => done(err))
  })
})

describe("getUser", () => { 


  test("getUser called by the same user", (done) => {
    User.create(userOne).then(() => {
      request(app)
        .get(`/api/users/${userOne.username}/`)
        .set("Cookie", `accessToken=${accessToken}; refreshToken=${userOne.refreshToken}`)
        .then((response) => {
          expect(response.status).toBe(200);
          expect(response.body).toHaveProperty("data");
          expect(response.body.data.username).toEqual(userOne.username);
          expect(response.body.data.email).toEqual(userOne.email);
          expect(response.body.data.role).toEqual(userOne.role);
          done()
      })
      .catch((err) => done(err))
    });
  });

  test("getUser called by an admin", (done) => {
    
    User.insertMany([userOne, adminOne]).then(()=>{
      request(app)
        .get(`/api/users/${userOne.username}/`)
        .set("Cookie", `accessToken=${adminAccessToken}; refreshToken=${adminOne.refreshToken}`)
        .then((response) => {
          expect(response.status).toBe(200);
          expect(response.body).toHaveProperty("data");
          expect(response.body.data.username).toEqual(userOne.username);
          expect(response.body.data.email).toEqual(userOne.email);
          expect(response.body.data.role).toEqual(userOne.role);
          done()
        })
        .catch((err) => done(err))
    });
  });
  
  test("getUser called by another user", (done) => {
    
    User.insertMany([userOne, userTwo]).then(()=>{
      request(app)
        .get(`/api/users/${userTwo.username}/`)
        .set("Cookie", `accessToken=${accessToken}; refreshToken=${userOne.refreshToken}`)
        .then((response) => {
          expect(response.status).toBe(401);
          done()
      })
      .catch((err) => done(err))
    });
  });

  test("getUser called with wrong username parameter", (done) => {
    request(app)
      .get(`/api/users/errUsername/`)
      .set("Cookie",`accessToken=${accessToken}; refreshToken=${userOne.refreshToken}`)
      .then((response) => {
        expect(response.status).toBe(401);
        done()
      })
      .catch((err) => done(err))
  });
})

describe("createGroup", () => { 
  test("Successful group creation", (done) => {

    User.insertMany([userOne, userTwo]).then(()=>{
      request(app)
        .post(`/api/groups/`)
        .set("Cookie",`accessToken=${accessToken}; refreshToken=${userOne.refreshToken}`)
        .send({name:"group4",memberEmails:[userOne.email,userTwo.email]})
        .then((response) => {
          expect(response.status).toBe(200);
          expect(response.body).toHaveProperty("data");
          expect(response.body.data.group.members).toEqual([{email : userOne.email},{email: userTwo.email}]);
          expect(response.body.data.membersNotFound).toEqual([]);
          expect(response.body.data.alreadyInGroup).toEqual([]);
          done()
        })
        .catch((err) => done(err))
    });

  });
  test("Missing parameters",  (done) => {
    User.insertMany([userOne, userTwo]).then(()=>{
      request(app)
        .post(`/api/groups/`)
        .set("Cookie",`accessToken=${accessToken}; refreshToken=${userOne.refreshToken}`)
        .then((response) => {
          expect(response.status).toBe(400);
          done()
        })
        .catch((err) => done(err))
    });
  });
  test("Missing member parameter", (done) => {
    User.insertMany([userOne, userTwo]).then(()=>{
      request(app)
        .post(`/api/groups/`)
        .set("Cookie",`accessToken=${accessToken}; refreshToken=${userOne.refreshToken}`)
        .send({name:"group4"})
        .then((response) => {
          expect(response.status).toBe(400);
          done()
        })
        .catch((err) => done(err))
    });
  });
  test("Missing name parameter", (done) => {
    User.insertMany([userOne, userTwo]).then(()=>{
      request(app)
        .post(`/api/groups/`)
        .set("Cookie",`accessToken=${accessToken}; refreshToken=${userOne.refreshToken}`)
        .send({memberEmails:[userOne.email,userTwo.email]})
        .then((response) => {
          expect(response.status).toBe(400);
          done()
        })
        .catch((err) => done(err))
    });
  });
  test("Name parameter is an empty string", (done) => {
    User.insertMany([userOne, userTwo]).then(()=>{
      request(app)
        .post(`/api/groups/`)
        .set("Cookie",`accessToken=${accessToken}; refreshToken=${userOne.refreshToken}`)
        .send({name:"",memberEmails:[userOne.email,userTwo.email]})
        .then((response) => {
          expect(response.status).toBe(400);
          done()
        })
        .catch((err) => done(err))
    });
  });
  test("Group already existed", (done) => {
    Group.create(retrievedGroup4).then(()=>{
      User.insertMany([userOne, userTwo]).then(()=>{
        request(app)
          .post(`/api/groups/`)
          .set("Cookie",`accessToken=${accessToken}; refreshToken=${userOne.refreshToken}`)
          .send({name:"group4",memberEmails:[userOne.email,userTwo.email]})
          .then((response) => {
            expect(response.status).toBe(400);
            done()
          })
          .catch((err) => done(err))
      });
    });
  });
  test("Not authorized", (done) => {
    User.insertMany([userOne, userTwo]).then(()=>{
      request(app)
        .post(`/api/groups/`)
        .set("Cookie",`accessToken=errToken; refreshToken=${userOne.refreshToken}`)
        .send({name:"group4",memberEmails:[userOne.email,userTwo.email]})
        .then((response) => {
          expect(response.status).toBe(401);
          done()
        })
        .catch((err) => done(err))
    });
  });
  test("Creator already in a group", (done) => {
    User.insertMany([userOne, userTwo]).then(()=>{
      Group.create({name:'group',members:{email:'user@user.com'}}).then(()=>{
          request(app)
          .post(`/api/groups/`)
          .set("Cookie",`accessToken=${accessToken}; refreshToken=${userOne.refreshToken}`)
          .send({name:"group4",memberEmails:[userOne.email,userTwo.email]})
          .then((response) => {
            expect(response.status).toBe(400);
            done()
          })
          .catch((err) => done(err))
      });
    });
  });
  test("All members already in a group (except the creator)", (done) => {
    
    User.insertMany([userOne, userTwo]).then(()=>{
      Group.create({name:'group',members:[{email:'user2@user.com'}]}).then(()=>{
        request(app)
          .post(`/api/groups/`)
          .set("Cookie",`accessToken=${accessToken}; refreshToken=${userOne.refreshToken}`)
          .send({name:"group4",memberEmails:[userOne.email,userTwo.email]})
          .then((response) => {
            expect(response.status).toBe(400);
            done()
          })
          .catch((err) => done(err))
        });
    });
  });
  test("At least one member emails is an empty string", (done) => {
    User.insertMany([userOne]).then(()=>{
      request(app)
        .post(`/api/groups/`)
        .set("Cookie",`accessToken=${accessToken}; refreshToken=${userOne.refreshToken}`)
        .send({name:"group4",memberEmails:[userOne.email,""]})
        .then((response) => {
          expect(response.status).toBe(400);
          done()
        })
        .catch((err) => done(err))
    });  
  });
  test("At least one member emails is with uncorrect format", (done) => {
    User.insertMany([userOne]).then(()=>{
      request(app)
        .post(`/api/groups/`)
        .set("Cookie",`accessToken=${accessToken}; refreshToken=${userOne.refreshToken}`)
        .send({name:"group4",memberEmails:[userOne.email,"ciao.com"]})
        .then((response) => {
          expect(response.status).toBe(400);
          done()
        })
        .catch((err) => done(err))
    });  
  });
})

describe("getGroups", () => {  
  
  test("List of groups returned", (done) => {
    User.insertMany([userOne,userTwo]).then(() => {
      Group.insertMany([{name:'group',members:{email:userOne.email}},{name:'group2',members:{email:userTwo.email}}]).then(()=>{
        request(app)
          .get(`/api/groups/`)
          .set("Cookie", `accessToken=${adminAccessToken}; refreshToken=${adminOne.refreshToken}`)
          .then((response) => {
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty("data");
            expect(response.body.data[0].name).toEqual('group');
            expect(response.body.data[0].members[0].email).toEqual(userOne.email);
            expect(response.body.data[1].name).toEqual('group2');
            expect(response.body.data[1].members[0].email).toEqual(userTwo.email);
            done()
        })
        .catch((err) => done(err))
      });
    });
  });

  test("Not authorized",(done) => {
      request(app)
        .get(`/api/groups/`)
        .then((response) => {
          expect(response.status).toBe(401);
          done()
      })
      .catch((err) => done(err))
  });

})

describe("getGroup", () => { 
  
  test("Group returned", (done) => {
    User.create(userOne).then(() => {
      Group.create({name:'group1',members:{email:userOne.email}}).then(()=>{
        request(app)
          .get(`/api/groups/group1`)
          .set("Cookie", `accessToken=${accessToken}; refreshToken=${userOne.refreshToken}`)
          .then((response) => {
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty("data");
            expect(response.body.data.group.name).toEqual('group1');
            expect(response.body.data.group.members[0].email).toEqual(userOne.email);
            done()
        })
        .catch((err) => done(err))
      });
    });
  });

  test("Group doesn't exist", (done) => {
    User.create(userOne).then(() => {
        request(app)
          .get(`/api/groups/group1`)
          .set("Cookie", `accessToken=${accessToken}; refreshToken=${userOne.refreshToken}`)
          .then((response) => {
            expect(response.status).toBe(400);
            done()
        })
        .catch((err) => done(err))
    });
  });
  
  test("Not authorized", (done) => {
    User.create(userOne).then(() => {
      Group.create({name:'group1',members:{email:userOne.email}}).then(()=>{
        request(app)
          .get(`/api/groups/group1`)
          .then((response) => {
            expect(response.status).toBe(401);
            done()
        })
        .catch((err) => done(err))
      });
    });
  });

})

describe("addToGroup", () => {
  beforeEach(async () => {
      await Group.deleteMany();
      await User.deleteMany();
  });
  afterEach(async () => {
  });

  test("should return a 400 error if the group name is empty", async () => {
      const req = { params: {name: ""}, body: {emails: [userOne.email]}};
      const res = {
          status: jest.fn().mockReturnThis(),
          json: jest.fn(),
          locals: {refreshedTokenMessage: ""}
      };

      await addToGroup(req,res);
      expect(res.status).toHaveBeenCalledWith(400);
  });

  
  test("should return a 400 error if the request body does not contain all the necessary attributes", (done) => {

      User.create(userOne).then(async (savedUser) => {
          await Group.create({name: retrievedGroup.name, members: [{email: userOne.email, user: savedUser.id}]})
          const req = {
              params: {name: "test_group"},
              body: {},
          };
          const res = {
              status: jest.fn().mockReturnThis(),
              json: jest.fn(),
              locals: {refreshedTokenMessage: ""}
          };

          await addToGroup(req,res);
          expect(res.status).toHaveBeenCalledWith(400);

          done()
      }).catch((err) => done(err))
  })

  
  test("should return 400 error if there are not existed group", (done) => {

      User.create(userOne).then(async (savedUser) => {
          await Group.create({name: retrievedGroup.name, members: [{email: userOne.email, user: savedUser.id}]})
          const req = {
              params: {name: "test_group"},
              body: {emails: [userOne.email]},
              cookies: {accessToken: accessToken, refreshToken: userOne.refreshToken }
          };
          const res = {
              status: jest.fn().mockReturnThis(),
              json: jest.fn(),
              locals: {refreshedTokenMessage: ""}
          };

          await addToGroup(req,res);
          expect(res.status).toHaveBeenCalledWith(400);
          done()
      }).catch((err) => done(err))
  })

  
  test("should return 400 error if there are no existed user", (done) => {

      const noExistedUserEmail = 'no_existed_user@user.com';
      User.create(userOne).then(async (savedUser) => {
          await Group.create({name: retrievedGroup.name, members: [{email: userOne.email, user: savedUser.id}]})
          const req = {
              params: {name: retrievedGroup.name},
              body: {emails: [noExistedUserEmail]},
              cookies: {accessToken: accessToken, refreshToken: userOne.refreshToken }
          };
          const res = {
              status: jest.fn().mockReturnThis(),
              json: jest.fn(),
              locals: {refreshedTokenMessage: ""}
          };

          await addToGroup(req,res);
          expect(res.status).toHaveBeenCalledWith(400);
          done()

      }).catch((err) => done(err))
  })
  
  
  test("should return 400 error if there were already in a group", (done) => {
      User.create(userOne).then(async (savedUser) => {
          await Group.create({name: retrievedGroup.name, members: [{email: userOne.email, user: savedUser.id}]})
          const req = {
              params: {name: retrievedGroup.name},
              body: {emails: [userOne.email]},
              cookies: {accessToken: accessToken, refreshToken: userOne.refreshToken }
          };
          const res = {
              status: jest.fn().mockReturnThis(),
              json: jest.fn(),
              locals: {refreshedTokenMessage: ""}
          };

          await addToGroup(req,res);
          expect(res.status).toHaveBeenCalledWith(400);
          done()

      }).catch((err) => done(err))
  })

  
  
  test("should return a 400 error if at least one of the member emails is not in a valid email format", (done) => {

      User.create(userOne).then(async (savedUser) => {
          await Group.create({name: retrievedGroup.name, members: [{email: userOne.email, user: savedUser.id}]})
          const req = {
              params: {name: retrievedGroup.name},
              body: {emails: ["no_existed_user1", "no_existed_user2@", ".com"]},
              cookies: {accessToken: accessToken, refreshToken: userOne.refreshToken }
          };
          const res = {
              status: jest.fn().mockReturnThis(),
              json: jest.fn(),
              locals: {refreshedTokenMessage: ""}
          };

          await addToGroup(req,res);
          expect(res.status).toHaveBeenCalledWith(400);
          done()

      }).catch((err) => done(err))
  })

  
  test("should return a 400 error if at least one of the member emails is an empty string", (done) => {
      User.create(userOne).then(async (savedUser) => {
          await Group.create({name: retrievedGroup.name, members: [{email: userOne.email, user: savedUser.id}]})
          const req = {
              params: {name: retrievedGroup.name},
              body: {emails: ["", ".com"]},
              cookies: {accessToken: accessToken, refreshToken: userOne.refreshToken }
          };
          const res = {
              status: jest.fn().mockReturnThis(),
              json: jest.fn(),
              locals: {refreshedTokenMessage: ""}
          };

          await addToGroup(req,res);
          expect(res.status).toHaveBeenCalledWith(400);
          done()

      }).catch((err) => done(err))
  })


  test("should return a 401 error if called by an authenticated user who is not part of the group (authType = Group) if the route is `api/groups/:name/add`", (done) => {

      User.create(userOne).then(async (savedUser) => {
          const insertedUser1 = await User.findOneAndUpdate({
              username: 'user1',
              email: "user1@user.com",
              password: userOne.password
          });

          const insertedUser2 = await User.findOneAndUpdate({
              username: 'user2',
              email: "user2@user.com",
              password: userOne.password
          });

          retrievedGroup.members = [
              {email: insertedUser1.email, user: insertedUser1.id},
              {email: insertedUser2.email, user: insertedUser2.id},
          ];

          await Group.create(retrievedGroup);

          const req = {
              params: {name: retrievedGroup.name},
              body: {emails: [userOne.email]},
              path: '/groups/' + retrievedGroup.name +'/add',
              cookies: {accessToken: "", refreshToken: userOne.refreshToken }
          };
          const res = {
              status: jest.fn().mockReturnThis(),
              json: jest.fn(),
              locals: {refreshedTokenMessage: ""}
          };

          await addToGroup(req,res);
          expect(res.status).toHaveBeenCalledWith(401);
          done()

      }).catch((err) => done(err))
  })


  test("should return a 401 error if called by an authenticated user who is not an admin (authType = Admin) if the route is `api/groups/:name/pull`", (done) => {

      User.create(userOne).then(async (savedUser) => {
          await Group.create({name: retrievedGroup.name, members: [{email: userOne.email, user: savedUser.id}]})
          const insertedUser1 = await User.findOneAndUpdate({
              username: 'user1',
              email: "user1@user.com",
              password: userOne.password
          });
          const req = {
              params: {name: retrievedGroup.name},
              body: {emails: [insertedUser1.email]},
              path: '/groups/' + retrievedGroup.name +'/pull',
              cookies: {accessToken: accessToken, refreshToken: userOne.refreshToken }
          };
          const res = {
              status: jest.fn().mockReturnThis(),
              json: jest.fn(),
              locals: {refreshedTokenMessage: ""}
          };
          await addToGroup(req,res);
          expect(res.status).toHaveBeenCalledWith(401);
          done()

      }).catch((err) => done(err))
  })


  test("should return 200 status and group information if user can be joined to group", (done) => {

      User.create(userOne).then(async (savedUser) => {
          await Group.create({name: retrievedGroup.name, members: [{email: userOne.email, user: savedUser.id}]})
          const newUser = await User.create({
              email: 'user1@user.com',
              username: "user1",
              password: userOne.password
          });
          const req = {
              params: {name: retrievedGroup.name},
              body: {emails: [newUser.email]},
              cookies: {accessToken: accessToken, refreshToken: userOne.refreshToken }
          };
          const res = {
              status: jest.fn().mockReturnThis(),
              json: jest.fn(),
              locals: {refreshedTokenMessage: ""}
          };
          await addToGroup(req,res);
          expect(res.status).toHaveBeenCalledWith(200);
          done()

      }).catch((err) => done(err))
  })
  
})

describe("removeFromGroup", () => {
  beforeEach(async () => {
      await Group.deleteMany();
      await User.deleteMany();
  });
  afterEach(async () => {
  });

  test("should return 400 error if there are not existed group", (done) => {

      User.create(userOne).then(async (savedUser) => {
          await Group.create({name: retrievedGroup.name, members: [{email: userOne.email, user: savedUser.id}]})

          const testGroupName = "test_group";
          const req = {
              params: {name: testGroupName},
              body: {emails: []},
              cookies: {accessToken: accessToken, refreshToken: userOne.refreshToken }
          };
          const res = {
              status: jest.fn().mockReturnThis(),
              json: jest.fn(),
              locals: {refreshedTokenMessage: ""}
          };
          await removeFromGroup(req,res);
          expect(res.status).toHaveBeenCalledWith(400);
          done()

      }).catch((err) => done(err))

  })


  
  test("should return 400 errror if there are no existed user", (done) => {

      User.create(userOne).then(async (savedUser) => {
          await Group.create({name: retrievedGroup.name, members: [{email: userOne.email, user: savedUser.id}]})
          const noExistedUserEmail = 'no_existed_user@user.com';
          const req = {
              params: {name: retrievedGroup.name},
              body: {emails: [noExistedUserEmail]},
              cookies: {accessToken: accessToken, refreshToken: userOne.refreshToken }
          };
          const res = {
              status: jest.fn().mockReturnThis(),
              json: jest.fn(),
              locals: {refreshedTokenMessage: ""}
          };
          await removeFromGroup(req,res);
          expect(res.status).toHaveBeenCalledWith(400);
          done()

      }).catch((err) => done(err))
  })

  
  test("should return 400 error if user was not joined in a group", (done) => {

      User.create(userOne).then(async (savedUser) => {
          await Group.create({name: retrievedGroup.name, members: [{email: userOne.email, user: savedUser.id}]})
          const insertedUser = await User.findOneAndUpdate({
              username: 'user1',
              email: "user1@user.com",
              password: userOne.password
          });
          const req = {
              params: {name: retrievedGroup.name},
              body: {emails: [insertedUser.email]},
              cookies: {accessToken: accessToken, refreshToken: userOne.refreshToken }
          };
          const res = {
              status: jest.fn().mockReturnThis(),
              json: jest.fn(),
              locals: {refreshedTokenMessage: ""}
          };
          await removeFromGroup(req,res);
          expect(res.status).toHaveBeenCalledWith(400);
          done()
      }).catch((err) => done(err))
  })

  
  test("should return a 400 error if at least one of the member emails is not in a valid email", (done) => {

      User.create(userOne).then(async (savedUser) => {
          const insertedUser = await User.findOneAndUpdate({
              username: 'user1',
              email: "user1@user.com",
              password: userOne.password
          });

          retrievedGroup.members.push({email: insertedUser.email, user: insertedUser.id});
          await Group.create(retrievedGroup)
          const req = {
              params: {name: retrievedGroup.name},
              body: {emails: ["aa", ".com"]},
              cookies: {accessToken: accessToken, refreshToken: userOne.refreshToken }
          };
          const res = {
              status: jest.fn().mockReturnThis(),
              json: jest.fn(),
              locals: {refreshedTokenMessage: ""}
          };
          await removeFromGroup(req,res);
          expect(res.status).toHaveBeenCalledWith(400);
          done()

      }).catch((err) => done(err))
  })

  
  test("should return a 400 error if at least one of the member emails is an empty string", (done) => {

      User.create(userOne).then(async (savedUser) => {
          const insertedUser = await User.findOneAndUpdate({
              username: 'user1',
              email: "user1@user.com",
              password: userOne.password
          });

          retrievedGroup.members.push({email: insertedUser.email, user: insertedUser.id});
          await Group.create(retrievedGroup)

          const req = {
              params: {name: retrievedGroup.name},
              body: {emails: [insertedUser.email, ""]},
              cookies: {accessToken: accessToken, refreshToken: userOne.refreshToken }
          };
          const res = {
              status: jest.fn().mockReturnThis(),
              json: jest.fn(),
              locals: {refreshedTokenMessage: ""}
          };
          await removeFromGroup(req,res);
          expect(res.status).toHaveBeenCalledWith(400);
          done()
      }).catch((err) => done(err))
  })

  
  test("should return a 400 error if the group contains only one member before deleting any", (done) => {

      User.create(userOne).then(async (savedUser) => {
          await Group.create({name: retrievedGroup.name, members: [{email: userOne.email, user: savedUser.id}]})
          const req = {
              params: {name: retrievedGroup.name},
              body: {emails: [userOne.email]},
              cookies: {accessToken: accessToken, refreshToken: userOne.refreshToken }
          };
          const res = {
              status: jest.fn().mockReturnThis(),
              json: jest.fn(),
              locals: {refreshedTokenMessage: ""}
          };
          await removeFromGroup(req,res);
          expect(res.status).toHaveBeenCalledWith(400);
          done()

      }).catch((err) => done(err))
  })

  
  test("should return a 401 error if called by an authenticated user who is not part of the group (authType = Group) if the route is `api/groups/:name/remove", (done) => {

      User.create(userOne).then(async (savedUser) => {
          const insertedUser1 = await User.findOneAndUpdate({
              username: 'user1',
              email: "user1@user.com",
              password: userOne.password
          });

          const insertedUser2 = await User.findOneAndUpdate({
              username: 'user2',
              email: "user2@user.com",
              password: userOne.password
          });

          retrievedGroup.members = [
              {email: "user1@user.com", user: insertedUser1.id},
              {email: "user2@user.com", user: insertedUser2.id},
          ];

          await Group.create(retrievedGroup);

          const req = {
              params: {name: retrievedGroup.name},
              body: {emails: [userOne.email]},
              path: `/groups/${retrievedGroup.name}/remove`,
              cookies: {accessToken: accessToken, refreshToken: userOne.refreshToken }
          };
          const res = {
              status: jest.fn().mockReturnThis(),
              json: jest.fn(),
              locals: {refreshedTokenMessage: ""}
          };
          await removeFromGroup(req,res);
          expect(res.status).toHaveBeenCalledWith(401);
          done()

      }).catch((err) => done(err))
  })

  
  test("should return a 401 error if called by an authenticated user who is not an admin (authType = Admin) if the route is `api/groups/:name/pull`", (done) => {

      User.create(userOne).then(async (savedUser) => {
          const insertedUser1 = await User.findOneAndUpdate({
              username: 'user1',
              email: "user1@user.com",
              password: userOne.password
          });

          const insertedUser2 = await User.findOneAndUpdate({
              username: 'user2',
              email: "user2@user.com",
              password: userOne.password
          });

          retrievedGroup.members = [
              {email: insertedUser1.email, user: insertedUser1.id},
              {email: insertedUser2.email, user: insertedUser2.id},
          ];

          await Group.create(retrievedGroup)

          const req = {
              params: {name: retrievedGroup.name},
              body: {emails: [insertedUser2.email]},
              path: `/groups/${retrievedGroup.name}/pull`,
              cookies: {accessToken: accessToken, refreshToken: userOne.refreshToken }
          };
          const res = {
              status: jest.fn().mockReturnThis(),
              json: jest.fn(),
              locals: {refreshedTokenMessage: ""}
          };
          await removeFromGroup(req,res);
          expect(res.status).toHaveBeenCalledWith(401);
          done()

      }).catch((err) => done(err))
  })


      
      test("should return 200 status and group information if user can be removed to group", (done) => {

          User.create(userOne).then(async (savedUser) => {
              const insertedUser = await User.create({
                  username: 'user1',
                  email: "user1@user.com",
                  password: userOne.password
              });

              await Group.create({
                  name: retrievedGroup.name,
                  members: [
                      {email: savedUser.email, user: savedUser.id},
                      {email: insertedUser.email, user: insertedUser.id}
                  ]
              })

              const req = {
                  params: {name: retrievedGroup.name},
                  body: {emails: [insertedUser.email]},
                  cookies: {accessToken: adminAccessToken, refreshToken: adminOne.refreshToken }
              };
              const res = {
                  status: jest.fn().mockReturnThis(),
                  json: jest.fn(),
                  locals: {refreshedTokenMessage: ""}
              };
              await removeFromGroup(req,res);
              expect(res.status).toHaveBeenCalledWith(200);
              done()

          }).catch((err) => done(err))
      })
})

describe("deleteUser", () => {
  beforeEach(async () => {
      await Group.deleteMany();
      await User.deleteMany();
  });
  afterEach(async () => {
  });

  test("should return a 401 error if called by an authenticated user who is not an admin (authType = Admin)", (done) => {
      User.create(userOne).then(async (savedUser) => {
          const req = {
              body: {email: userOne.email},
              cookies: {accessToken: accessToken, refreshToken: userOne.refreshToken }
          };
          const res = {
              status: jest.fn().mockReturnThis(),
              json: jest.fn(),
              locals: {refreshedTokenMessage: ""}
          };
          await deleteUser(req,res);
          expect(res.status).toHaveBeenCalledWith(401);
          done()

      }).catch((err) => done(err))

  })

  test("should return a 400 error if the name passed in the request body is an empty string", (done) => {
      User.create(userOne).then(async (savedUser) => {
          const req = {
              body: {email: ""},
              cookies: {accessToken: adminAccessToken, refreshToken: adminOne.refreshToken }
          };
          const res = {
              status: jest.fn().mockReturnThis(),
              json: jest.fn(),
              locals: {refreshedTokenMessage: ""}
          };
          await deleteUser(req,res);
          expect(res.status).toHaveBeenCalledWith(400);
          done()

      }).catch((err) => done(err))
  })


  test("should return a 400 error if the email passed in the request body is not in correct email format", (done) => {

      User.create(userOne).then(async (savedUser) => {
          const req = {
              body: {email: 'no_existed_user2@'},
              cookies: {accessToken: adminAccessToken, refreshToken: adminOne.refreshToken }
          };
          const res = {
              status: jest.fn().mockReturnThis(),
              json: jest.fn(),
              locals: {refreshedTokenMessage: ""}
          };
          await deleteUser(req,res);
          expect(res.status).toHaveBeenCalledWith(400);
          done()
      }).catch((err) => done(err))

  })

      
      test("should return a 400 error if the request body does not contain all the necessary attributes", (done) => {
          User.create(userOne).then(async (savedUser) => {
              const req = {
                  body: {},
                  cookies: {accessToken: adminAccessToken, refreshToken: adminOne.refreshToken }
              };
              const res = {
                  status: jest.fn().mockReturnThis(),
                  json: jest.fn(),
                  locals: {refreshedTokenMessage: ""}
              };
              await deleteUser(req,res);
              expect(res.status).toHaveBeenCalledWith(400);
              done()
          }).catch((err) => done(err))
      })

      
      test("should return a 400 error if the email passed in the request body does not represent a user in the database", (done) => {

          User.create(userOne)
              .then(async (insertedUser1) => {
                  const insertedUser2 = await User.create({
                      username: 'user1',
                      email: "user1@user.com",
                      password: userOne.password
                  });

                  await Group.create({
                      name: retrievedGroup.name,
                      members: [
                          {email: insertedUser1.email, user: insertedUser1.id},
                          {email: insertedUser2.email, user: insertedUser2.id}
                      ]
                  })

                  const req = {
                      body: {email: "not_existed@user.com"},
                      cookies: {accessToken: adminAccessToken, refreshToken: adminOne.refreshToken }
                  };
                  const res = {
                      status: jest.fn().mockReturnThis(),
                      json: jest.fn(),
                      locals: {refreshedTokenMessage: ""}
                  };
                  await deleteUser(req,res);
                  expect(res.status).toHaveBeenCalledWith(400);
                  done()
              }).catch((err) => done(err));

      })

      
      test("should return 200 status code if email is deleted by Admin", (done) => {

          const deletedUser = {email: 'user1@user.com', username: 'user1', password: userOne.password};
          User.create(userOne).then(async (insertedUser1) => {

              const insertedUser2 = await User.create(deletedUser);
              await Group.create({
                  name: retrievedGroup.name,
                  members: [
                      {email: insertedUser1.email, user: insertedUser1.id},
                      {email: insertedUser2.email, user: insertedUser2.id}
                  ]
              })

              const req = {
                  body: {email: insertedUser1.email},
                  cookies: {accessToken: adminAccessToken, refreshToken: adminOne.refreshToken }
              };
              const res = {
                  status: jest.fn().mockReturnThis(),
                  json: jest.fn(),
                  locals: {refreshedTokenMessage: ""}
              };
              await deleteUser(req,res);
              expect(res.status).toHaveBeenCalledWith(200);
              done()

          }).catch((err) => done(err));
      })
})

describe("deleteGroup", () => {
  beforeEach(async () => {
      await Group.deleteMany();
      await User.deleteMany();
  });
  afterEach(async () => {

  });

  
  test("should return a 401 error if called by an authenticated user who is not an admin (authType = Admin)", (done) => {
      User.create(userOne).then(async (insertedUser) => {
          await Group.create({
              name: retrievedGroup.name,
              members: [
                  {email: insertedUser.email, user: insertedUser.id},
              ]
          })
          const req = {
              body: {name: retrievedGroup.name},
              cookies: {accessToken: accessToken, refreshToken: userOne.refreshToken }
          };
          const res = {
              status: jest.fn().mockReturnThis(),
              json: jest.fn(),
              locals: {refreshedTokenMessage: ""}
          };
          await deleteGroup(req,res);
          expect(res.status).toHaveBeenCalledWith(401);
          done()
      }).catch((err) => done(err));
  })

  
  test("should return a 400 error if the request body does not contain all the necessary attributes", (done) => {
      User.create(userOne).then(async (insertedUser) => {
          await Group.create({
              name: retrievedGroup.name,
              members: [
                  {email: insertedUser.email, user: insertedUser.id},
              ]
          })
          const req = {
              body: {},
              cookies: {accessToken: adminAccessToken, refreshToken: adminOne.refreshToken }
          };
          const res = {
              status: jest.fn().mockReturnThis(),
              json: jest.fn(),
              locals: {refreshedTokenMessage: ""}
          };
          await deleteGroup(req,res);
          expect(res.status).toHaveBeenCalledWith(400);
          done()
      }).catch((err) => done(err));
  })

  
  test("should return a 400 error if the name passed in the request body is an empty string", (done) => {
      User.create(userOne).then(async (insertedUser) => {
          await Group.create({
              name: retrievedGroup.name,
              members: [
                  {email: insertedUser.email, user: insertedUser.id},
              ]
          });
          const req = {
              body: {name: ""},
              cookies: {accessToken: adminAccessToken, refreshToken: adminOne.refreshToken }
          };
          const res = {
              status: jest.fn().mockReturnThis(),
              json: jest.fn(),
              locals: {refreshedTokenMessage: ""}
          };
          await deleteGroup(req,res);
          expect(res.status).toHaveBeenCalledWith(400);
          done()
      }).catch((err) => done(err));
  })


  
  test("should return a 400 error if the name passed in the request body does not represent a group in the database", (done) => {
      User.create(userOne).then(async (insertedUser) => {
          await Group.create({
              name: retrievedGroup.name,
              members: [
                  {email: insertedUser.email, user: insertedUser.id},
              ]
          })
          const req = {
              body: {name: "not_existed_group"},
              cookies: {accessToken: adminAccessToken, refreshToken: adminOne.refreshToken }
          };
          const res = {
              status: jest.fn().mockReturnThis(),
              json: jest.fn(),
              locals: {refreshedTokenMessage: ""}
          };
          await deleteGroup(req,res);
          expect(res.status).toHaveBeenCalledWith(400);
          done()
      }).catch((err) => done(err));
  })

  
  test("should return 200 status code if group is deleted by Admin", (done) => {

      User.create(userOne).then(async (insertedUser) => {
          await Group.create({
              name: retrievedGroup.name,
              members: [
                  {email: insertedUser.email, user: insertedUser.id},
              ]
          })
          const req = {
              body: {name: retrievedGroup.name},
              cookies: {accessToken: adminAccessToken, refreshToken: adminOne.refreshToken }
          };
          const res = {
              status: jest.fn().mockReturnThis(),
              json: jest.fn(),
              locals: {refreshedTokenMessage: ""}
          };
          await deleteGroup(req,res);
          expect(res.status).toHaveBeenCalledWith(200);
          done()

      }).catch((err) => done(err));
  })
})
