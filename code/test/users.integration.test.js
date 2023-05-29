import request from 'supertest';
import { app } from '../app';
import { User, Group } from '../models/User.js';
import { transactions, categories } from '../models/model';
import mongoose, { Model } from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

/**
 * Necessary setup in order to create a new database for testing purposes before starting the execution of test cases.
 * Each test suite has its own database in order to avoid different tests accessing the same database at the same time and expecting different data.
 */
dotenv.config();

let userOneId = new mongoose.Types.ObjectId();
let adminOneId = new mongoose.Types.ObjectId();
let accessToken = "";
let adminAccessToken = "";
let userOne = {
  username: 'user',
  email: 'user@user.com',
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

});

/**
 * After all test cases have been executed the database is deleted.
 * This is done so that subsequent executions of the test suite start with an empty database.
 */
afterAll(async () => {
  await mongoose.connection.db.dropDatabase();
  await mongoose.connection.close();
});

describe("getUsers", () => {
  /**
   * Database is cleared before each test case, in order to allow insertion of data tailored for each specific test case.
   */
  beforeEach(async () => {
    await User.deleteMany({})
  })

  test("should return empty list if there are no users", (done) => {
    request(app)
      .get("/api/users")
      .set('Cookie', ["accessToken=" + adminAccessToken, "refreshToken=" + adminOne.refreshToken])
      .then((response) => {
        expect(response.status).toBe(200)
        expect(response.body).toHaveLength(0)
        done()
      })
      .catch((err) => done(err))
  })

  test("should retrieve list of all users", (done) => {
    User.create(adminOne).then(() => {
      request(app)
        .get("/api/users")
        .set('Cookie', ["accessToken=" + adminAccessToken, "refreshToken=" + adminOne.refreshToken])
        .then((response) => {
          expect(response.status).toBe(200)
          expect(response.body).toHaveLength(1)
          expect(response.body[0].username).toEqual(adminOne.username)
          expect(response.body[0].email).toEqual(adminOne.email)
          expect(response.body[0].role).toEqual(adminOne.role)
          done() // Notify Jest that the test is complete
        })
        .catch((err) => done(err))
    })
  })
})

describe("getUser", () => { })

describe("createGroup", () => { })

describe("getGroups", () => { })

describe("getGroup", () => { })

describe("addToGroup", () => {
  beforeEach(async () => {

    await Group.deleteMany();
    await User.deleteMany();

  });
  afterEach(async () => {
  });

  //DONE
  test("should return a 404 error if the group name is empty", async () => {

    const testGroupName = "";
    const response = await request(app)
      .patch("/api/groups/" + testGroupName + "/add")
      .set('Cookie', ["accessToken=" + accessToken, "refreshToken=" + userOne.refreshToken])
    expect(response.status).toBe(404)
  })

  //NOT DONE
  test("should return a 400 error if the request body does not contain all the necessary attributes", (done) => {

    User.create(userOne).then(async (savedUser) => {
      await Group.create({ name: retrievedGroup.name, members: [{ email: userOne.email, user: savedUser.id }] })
      const testGroupName = "test_group";
      const response = await request(app)
        .patch("/api/groups/" + testGroupName + "/add")
        .set('Cookie', ["accessToken=" + accessToken, "refreshToken=" + userOne.refreshToken])
        .send({})

      expect(response.status).toBe(400)
      done()
    }).catch((err) => done(err))
  })

  //NOT DONE
  test("should return 401 error if there are not existed group", (done) => {

    User.create(userOne).then(async (savedUser) => {
      await Group.create({ name: retrievedGroup.name, members: [{ email: userOne.email, user: savedUser.id }] })
      const testGroupName = "test_group";
      const response = await request(app)
        .patch("/api/groups/" + testGroupName + "/add")
        .set('Cookie', ["accessToken=" + accessToken, "refreshToken=" + userOne.refreshToken])
      expect(response.status).toBe(401)
      done()
    }).catch((err) => done(err))
  })

  //NOT DONE
  test("should return 400 error if there are no existed user", (done) => {

    const noExistedUserEmail = 'no_existed_user@user.com';
    User.create(userOne).then(async (savedUser) => {
      await Group.create({ name: retrievedGroup.name, members: [{ email: userOne.email, user: savedUser.id }] })
      const response = await request(app)
        .patch("/api/groups/" + retrievedGroup.name + "/add")
        .set('Cookie', ["accessToken=" + accessToken, "refreshToken=" + userOne.refreshToken])
        .send([noExistedUserEmail]);

      expect(response.status).toBe(400)
      done()
    }).catch((err) => done(err))
  })

  //NOT DONE
  test("should return 400 error if there were already in a group", (done) => {

    User.create(userOne).then(async (savedUser) => {
      await Group.create({ name: retrievedGroup.name, members: [{ email: userOne.email, user: savedUser.id }] })
      const response = await request(app)
        .patch("/api/groups/" + retrievedGroup.name + "/add")
        .set('Cookie', ["accessToken=" + accessToken, "refreshToken=" + userOne.refreshToken])
        .send({ emails: [userOne.email] });

      expect(response.status).toBe(400);
      done()
    }).catch((err) => done(err))
  })

  //NOT DONE
  test("should return a 400 error if at least one of the member emails is not in a valid email format", (done) => {

    User.create(userOne).then(async (savedUser) => {
      await Group.create({ name: retrievedGroup.name, members: [{ email: userOne.email, user: savedUser.id }] })
      const response = await request(app)
        .patch("/api/groups/" + retrievedGroup.name + "/add")
        .set('Cookie', ["accessToken=" + accessToken, "refreshToken=" + userOne.refreshToken])
        .send({ emails: ["no_existed_user1", "no_existed_user2@", ".com"] });

      expect(response.status).toBe(400);
      done()
    }).catch((err) => done(err))
  })

  //NOT DONE
  test("should return a 400 error if at least one of the member emails is an empty string", (done) => {
    User.create(userOne).then(async (savedUser) => {
      await Group.create({ name: retrievedGroup.name, members: [{ email: userOne.email, user: savedUser.id }] })
      const response = await request(app)
        .patch("/api/groups/" + retrievedGroup.name + "/add")
        .set('Cookie', ["accessToken=" + accessToken, "refreshToken=" + userOne.refreshToken])
        .send({ emails: ["", ".com"] });

      expect(response.status).toBe(400);
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
        { email: insertedUser1.email, user: insertedUser1.id },
        { email: insertedUser2.email, user: insertedUser2.id },
      ];

      await Group.create(retrievedGroup)

      const groupInfo = { emails: [insertedUser2.email] };

      const response = await request(app)
      .patch("/api/groups/" + retrievedGroup.name + "/add")
        .set('Cookie', ["accessToken=" + accessToken, "refreshToken=" + userOne.refreshToken])
        .send({ emails: [userOne.email] });

      expect(response.status).toBe(401);

      done()
    }).catch((err) => done(err))
  })


  test("should return a 401 error if called by an authenticated user who is not an admin (authType = Admin) if the route is `api/groups/:name/pull`", (done) => {

    User.create(userOne).then(async (savedUser) => {
      await Group.create({ name: retrievedGroup.name, members: [{ email: userOne.email, user: savedUser.id }] })
      const insertedUser1 = await User.findOneAndUpdate({
        username: 'user1',
        email: "user1@user.com",
        password: userOne.password
      });
      const response = await request(app)
        .patch("/api/groups/" + retrievedGroup.name + "/pull")
        .set('Cookie', ["accessToken=" + accessToken, "refreshToken=" + userOne.refreshToken])
        .send({ emails: [insertedUser1.email] });

      expect(response.status).toBe(401);
      done()
    }).catch((err) => done(err))
  })

  //NOT DONE
  test("should return 200 status and group information if user can be joined to group", (done) => {

    User.create(userOne).then(async (savedUser) => {
      await Group.create({ name: retrievedGroup.name, members: [{ email: userOne.email, user: savedUser.id }] })
      const newUser = await User.create({
        email: 'user1@user.com',
        username: "user1",
        password: await bcrypt.hash("123", 12)
      });

      const response = await request(app)
        .patch("/api/groups/" + retrievedGroup.name + "/add")
        .set('Cookie', ["accessToken=" + accessToken, "refreshToken=" + userOne.refreshToken])
        .send({ emails: [newUser.email] });

      expect(response.status).toBe(200)
      expect(response.body).toHaveProperty('data.group.members')
      expect(response.body.data.group.members).toHaveLength(2)
      expect(response.body.data.group.members[1].email).toEqual(newUser.email)
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

  //DONE
  test("should return 400 error if there are not existed group", (done) => {

    User.create(userOne).then(async (savedUser) => {
      await Group.create({ name: retrievedGroup.name, members: [{ email: userOne.email, user: savedUser.id }] })
      const testGroupName = "test_group";
      const response = await request(app)
        .patch("/api/groups/" + testGroupName + "/remove")
        .set('Cookie', ["accessToken=" + accessToken, "refreshToken=" + userOne.refreshToken])
      expect(response.status).toBe(400)
      done()
    }).catch((err) => done(err))

  })

  //NOT DONE
  test("should return 400 errror if there are no existed user", (done) => {

    User.create(userOne).then(async (savedUser) => {
      await Group.create({ name: retrievedGroup.name, members: [{ email: userOne.email, user: savedUser.id }] })
      const noExistedUserEmail = 'no_existed_user@user.com';
      const response = await request(app)
        .patch("/api/groups/" + retrievedGroup.name + "/add")
        .set('Cookie', ["accessToken=" + accessToken, "refreshToken=" + userOne.refreshToken])
        .send({ emails: [noExistedUserEmail] });

      expect(response.status).toBe(400)
      done()
    }).catch((err) => done(err))
  })

  //DONE
  test("should return 400 errror if user was not joined in a group", (done) => {

    User.create(userOne).then(async (savedUser) => {
      await Group.create({ name: retrievedGroup.name, members: [{ email: userOne.email, user: savedUser.id }] })
      const insertedUser = await User.findOneAndUpdate({
        username: 'user1',
        email: "user1@user.com",
        password: userOne.password
      });

      const groupInfo = { emails: [insertedUser.email] };

      const response = await request(app)
        .patch("/api/groups/" + retrievedGroup.name + "/remove")
        .set('Cookie', ["accessToken=" + accessToken, "refreshToken=" + userOne.refreshToken])
        .send(groupInfo);

      expect(response.status).toBe(400);

      done()
    }).catch((err) => done(err))
  })

  //DONE
  test("should return a 400 error if at least one of the member emails is not in a valid email", (done) => {

    User.create(userOne).then(async (savedUser) => {
      const insertedUser = await User.findOneAndUpdate({
        username: 'user1',
        email: "user1@user.com",
        password: userOne.password
      });

      retrievedGroup.members.push({ email: insertedUser.email, user: insertedUser.id });
      await Group.create(retrievedGroup)

      const groupInfo = { emails: ["aa", ".com"] };

      const response = await request(app)
        .patch("/api/groups/" + retrievedGroup.name + "/remove")
        .set('Cookie', ["accessToken=" + accessToken, "refreshToken=" + userOne.refreshToken])
        .send(groupInfo);

      expect(response.status).toBe(400);

      done()
    }).catch((err) => done(err))
  })

  //DONE
  test("should return a 400 error if at least one of the member emails is an empty string", (done) => {

    User.create(userOne).then(async (savedUser) => {
      const insertedUser = await User.findOneAndUpdate({
        username: 'user1',
        email: "user1@user.com",
        password: userOne.password
      });

      retrievedGroup.members.push({ email: insertedUser.email, user: insertedUser.id });
      await Group.create(retrievedGroup)

      const groupInfo = { emails: [insertedUser.email, ""] };

      const response = await request(app)
        .patch("/api/groups/" + retrievedGroup.name + "/remove")
        .set('Cookie', ["accessToken=" + accessToken, "refreshToken=" + userOne.refreshToken])
        .send(groupInfo);

      expect(response.status).toBe(400);

      done()
    }).catch((err) => done(err))
  })

  //DONE
  test("should return a 400 error if the group contains only one member before deleting any", (done) => {

    User.create(userOne).then(async (savedUser) => {
      await Group.create({ name: retrievedGroup.name, members: [{ email: userOne.email, user: savedUser.id }] })

      const groupInfo = { emails: [userOne.email] };

      const response = await request(app)
        .patch("/api/groups/" + retrievedGroup.name + "/remove")
        .set('Cookie', ["accessToken=" + accessToken, "refreshToken=" + userOne.refreshToken])
        .send(groupInfo);

      expect(response.status).toBe(400);

      done()
    }).catch((err) => done(err))
  })

  //DONE
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
        { email: insertedUser1.email, user: insertedUser1.id },
        { email: insertedUser2.email, user: insertedUser2.id },
      ];

      await Group.create(retrievedGroup)

      const groupInfo = { emails: [insertedUser2.email] };

      const response = await request(app)
        .patch("/api/groups/" + retrievedGroup.name + "/remove")
        .set('Cookie', ["accessToken=" + accessToken, "refreshToken=" + userOne.refreshToken])
        .send(groupInfo);

      expect(response.status).toBe(400);

      done()
    }).catch((err) => done(err))
  })

  //DONE
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
        { email: insertedUser1.email, user: insertedUser1.id },
        { email: insertedUser2.email, user: insertedUser2.id },
      ];

      await Group.create(retrievedGroup)

      const groupInfo = { emails: [insertedUser2.email] };

      const response = await request(app)
        .patch("/api/groups/" + retrievedGroup.name + "/pull")
        .set('Cookie', ["accessToken=" + accessToken, "refreshToken=" + userOne.refreshToken])
        .send(groupInfo);

      expect(response.status).toBe(400);

      done()
    }).catch((err) => done(err))
  })

  //NOT DONE
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
          { email: savedUser.email, user: savedUser.id },
          { email: insertedUser.email, user: insertedUser.id }
        ]
      })
      const groupInfo = { emails: [insertedUser.email] };
      const response = await request(app)
        .patch("/api/groups/" + retrievedGroup.name + "/remove")
        .set('Cookie', ["accessToken=" + adminAccessToken, "refreshToken=" + adminOne.refreshToken])
        .send(groupInfo);

      expect(response.status).toBe(200)
      expect(response.body).toHaveProperty('data.group.members')
      expect(response.body.data.group.members).toHaveLength(1);

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

  //DONE
  test("should return a 401 error if called by an authenticated user who is not an admin (authType = Admin)", (done) => {
    request(app)
      .delete("/api/users")
      .set('Cookie', ["accessToken=" + accessToken, "refreshToken=" + userOne.refreshToken])
      .then((response) => {
        expect(response.status).toBe(401)
        done()
      })
      .catch((err) => done(err))
  })

  //NOT DONE
  test("should return a 400 error if the name passed in the request body is an empty string", (done) => {
    request(app)
      .delete("/api/users")
      .set('Cookie', ["accessToken=" + adminAccessToken, "refreshToken=" + adminOne.refreshToken])
      .send({ email: "" })
      .then((response) => {
        expect(response.status).toBe(400)
        done()
      })
      .catch((err) => done(err))
  })


  test("should return a 400 error if the email passed in the request body is not in correct email format", async () => {

    request(app)
    .delete("/api/users")
    .set('Cookie', ["accessToken=" + adminAccessToken, "refreshToken=" + adminOne.refreshToken])
    .send({ emails: ["no_existed_user1", "no_existed_user2@", ".com"] })
      .then((response) => {
        expect(response.status).toBe(400)
        done()
      })
      .catch((err) => done(err))

  })

  //NOT DONE
  test("should return a 400 error if the request body does not contain all the necessary attributes", (done) => {
    request(app)
      .delete("/api/users")
      .set('Cookie', ["accessToken=" + adminAccessToken, "refreshToken=" + adminOne.refreshToken])
      .send({})
      .then((response) => {
        expect(response.status).toBe(400);
        done()
      })
      .catch((err) => done(err))
  })

  //NOT DONE
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
            { email: insertedUser1.email, user: insertedUser1.id },
            { email: insertedUser2.email, user: insertedUser2.id }
          ]
        })

        const response = await request(app)
          .delete("/api/users")
          .set('Cookie', ["accessToken=" + adminAccessToken, "refreshToken=" + adminOne.refreshToken])
          .send({ email: "not_existed@user.com" })

        expect(response.status).toBe(400);
        done()

      }).catch((err) => done(err));

  })

  //DONE
  test("should return 200 status code if email is deleted by Admin", (done) => {

    const deletedUser = { email: 'user1@user.com', username: 'user1', password: userOne.password };
    User.create(userOne).then(async (insertedUser1) => {

      const insertedUser2 = await User.create(deletedUser);
      await Group.create({
        name: retrievedGroup.name,
        members: [
          { email: insertedUser1.email, user: insertedUser1.id },
          { email: insertedUser2.email, user: insertedUser2.id }
        ]
      })
      const response = await request(app)
        .delete("/api/users")
        .set('Cookie', ["accessToken=" + adminAccessToken, "refreshToken=" + adminOne.refreshToken])
        .send({ email: insertedUser1.email })

      expect(response.status).toBe(200)
      expect(response.body).toHaveProperty('data')

      done();
    }).catch((err) => done(err));;
  })
})

describe("deleteGroup", () => {
  beforeEach(async () => {
    await Group.deleteMany();
    await User.deleteMany();
  });
  afterEach(async () => {

  });

  //NOT DONE
  test("should return a 401 error if called by an authenticated user who is not an admin (authType = Admin)", (done) => {
    User.create(userOne).then(async (insertedUser) => {
      await Group.create({
        name: retrievedGroup.name,
        members: [
          { email: insertedUser.email, user: insertedUser.id },
        ]
      })
      const response = await request(app)
        .delete("/api/groups")
        .set('Cookie', ["accessToken=" + accessToken, "refreshToken=" + userOne.refreshToken])
        .send({ name: retrievedGroup.name })

      expect(response.status).toBe(401);
      done()
    }).catch((err) => done(err));

  })

  //NOT DONE
  test("should return a 400 error if the request body does not contain all the necessary attributes", (done) => {
    request(app)
      .delete("/api/groups")
      .set('Cookie', ["accessToken=" + adminAccessToken, "refreshToken=" + adminOne.refreshToken])
      .send({})
      .then((response) => {
        expect(response.status).toBe(400);
        done()
      })
      .catch((err) => done(err))
  })

  //NOT DONE
  test("should return a 400 error if the name passed in the request body is an empty string", (done) => {
    request(app)
      .delete("/api/groups")
      .set('Cookie', ["accessToken=" + adminAccessToken, "refreshToken=" + adminOne.refreshToken])
      .send({ name: "" })

      .then((response) => {
        expect(response.status).toBe(400);
        done()
      })
      .catch((err) => done(err))
  })

  //NOT DONE
  test("should return a 400 error if the name passed in the request body does not represent a group in the database", (done) => {

    User.create(userOne).then(async (insertedUser) => {
      await Group.create({
        name: retrievedGroup.name,
        members: [
          { email: insertedUser.email, user: insertedUser.id },
        ]
      })
      const response = await request(app)
        .delete("/api/groups")
        .set('Cookie', ["accessToken=" + adminAccessToken, "refreshToken=" + adminOne.refreshToken])
        .send({ name: "not_existed_group" })

      expect(response.status).toBe(400);
      done()
    }).catch((err) => done(err));

  })

  //NOT DONE
  test("should return 200 status code if group is deleted by Admin", (done) => {

    User.create(userOne).then(async (insertedUser) => {
      await Group.create({
        name: retrievedGroup.name,
        members: [
          { email: insertedUser.email, user: insertedUser.id },
        ]
      })

      const response = await request(app)
        .delete("/api/groups")
        .set('Cookie', ["accessToken=" + adminAccessToken, "refreshToken=" + adminOne.refreshToken])
        .send({ name: retrievedGroup.name })

      expect(response.status).toBe(200)
      expect(response.body).toHaveProperty('data.group.members')
      done()
    }).catch((err) => done(err));
  })
})
