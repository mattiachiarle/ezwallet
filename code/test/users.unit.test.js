import request from 'supertest';
import { app } from '../app';
import { User, Group } from '../models/User.js';
import { transactions } from '../models/model';
import { verifyAuth } from '../controllers/utils';
import jwt from 'jsonwebtoken';
import mongoose from "mongoose";
import dotenv from "dotenv"

dotenv.config();

let userOneId = new mongoose.Types.ObjectId();
let adminOneId = new mongoose.Types.ObjectId();
let accessToken = "";
let adminAccessToken = "";
let userOne = {
  username: 'user',
  email: 'user@user.com',
  password: '',
  role: 'Regular'
}
let adminOne = {
  username: 'admin',
  email: 'admin@admin.com',
  password: '',
  role: 'Admin'
}
const retrievedGroup = { name: 'group1', members: [{ email: userOne.email, user: userOneId }] };

beforeAll(async () => {

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

});
/**
 * In order to correctly mock the calls to external modules it is necessary to mock them using the following line.
 * Without this operation, it is not possible to replace the actual implementation of the external functions with the one
 * needed for the test cases.
 * `jest.mock()` must be called for every external module that is called in the functions under test.
 *
jest.mock("../models/User.js")

/**
 * Defines code to be executed before each test case is launched
 * In this case the mock implementation of `User.find()` is cleared, allowing the definition of a new mock implementation.
 * Not doing this `mockClear()` means that test cases may use a mock implementation intended for other test cases.
 *
beforeEach(() => {
  User.find.mockClear()
  //additional `mockClear()` must be placed here
});

describe("getUsers", () => {
  test("should return empty list if there are no users", async () => {
    //any time the `User.find()` method is called jest will replace its actual implementation with the one defined below
    jest.spyOn(User, "find").mockImplementation(() => [])
    const response = await request(app)
      .get("/api/users")

    expect(response.status).toBe(200)
    expect(response.body).toEqual([])
  })

  test("should retrieve list of all users", async () => {
    const retrievedUsers = [{ username: 'test1', email: 'test1@example.com', password: 'hashedPassword1' }, { username: 'test2', email: 'test2@example.com', password: 'hashedPassword2' }]
    jest.spyOn(User, "find").mockImplementation(() => retrievedUsers)
    const response = await request(app)
      .get("/api/users")

    expect(response.status).toBe(200)
    expect(response.body).toEqual(retrievedUsers)
  })
})

describe("getUser", () => { 
  
  test("getUser called by the same user", async () => {
    jest.spyOn(verifyAuth).toHaveBeenCalledWith(req, res, { authType: "User", username: req.params.username }).mockImplementation(() => true);
    jest.spyOn(verifyAuth).toHaveBeenCalledWith(req, res, { authType: "Admin", username: req.params.username }).mockImplementation(() => false);
    const retreivedUser = { username: 'test1', email: 'test1@example.com', password: 'hashedPassword1' };
    jest.spyOn(User, "find").mockImplementation(() => retreivedUser);
    
    const response = await request(app).get("/users/:username/");

    expect(response.status).toBe(200);
    expect(response.body).toBe(retrievedUser);
  });

  test("getUser called without authorization", async() => {
    jest.spyOn(verifyAuth).toHaveBeenCalledWith(req, res, { authType: "User", username: req.params.username }).mockImplementation(() => false);
    jest.spyOn(verifyAuth).toHaveBeenCalledWith(req, res, { authType: "Admin", username: req.params.username }).mockImplementation(() => false);
    const retreivedUser = { username: 'test1', email: 'test1@example.com', password: 'hashedPassword1' };
    jest.spyOn(User, "find").mockImplementation(() => retreivedUser);

    const response = await request(app).get("/users/:username/");
    
    expect(response.status).toBe(401);    
  });

  test("getUser called with wrong username parameter", async() => {
    jest.spyOn(verifyAuth).toHaveBeenCalledWith(req, res, { authType: "User", username: req.params.username }).mockImplementation(() => false);
    jest.spyOn(verifyAuth).toHaveBeenCalledWith(req, res, { authType: "Admin", username: req.params.username }).mockImplementation(() => true);
    jest.spyOn(User, "find").mockImplementation(() => null);

    const response = await request(app).get("/users/:username/");

    expect(response.status).toBe(400);
  });
})

describe("createGroup", () => { 
  test("Group created", async () => {
    group = {name: "Family", memberEmails: ["mario.red@email.com", "luigi.red@email.com"]};
    
    jest.spyOn(verifyAuth).mockImplementation(()=>true);
    jest.spyOn(Group,"findOne").haveBeenCalledWith({ "members.email": creatorEmail }).mockImplementation(()=> null);
    jest.spyOn(User,"findOne").mockImplementation(()=> true);
    jest.spyOn(Group,"findOne").haveBeenCalledWith({ "members.email": member }).mockImplementation(()=>true);
    jest.spyOn(Group,"create").haveBeenCalledWith({name: group.name})

    const response = (await request(app).post("/groups")).body(group);

    expect(repsonse.status).toBe(200);
    expect(response.body).toBe(
      {data: {
        group: {name: "Family", 
        members: [{email: "mario.red@email.com"}, {email: "luigi.red@email.com"}]},
        membersNotFound: [], alreadyInGroup: []},
      refreshedTokenMessage: res.locals.refreshedTokenMessage});
  });
  test("Missing name parameter", async () => {
    //status code 400
  });
  test("Missing members parameter", async () => {
    //status code 400
  });
  test("Group already existed", async () => {
    //status code 400
  });
  test("Not authorized", async () => {
    //status code 401
  });
  test("Creator already in a group", async () => {
    //status code 400
  });
  test("All members already in a group", async () => {
    //status code 400
  });
  test("At least one member emails is an empty string", async () => {
    //status code 400
  });
})

describe("getGroups", () => { 
  test("List of groups returned", async () => {
    //status code 200
  });
  test("Not authorized", async () => {
    //status code 401
  });
})

describe("getGroup", () => {
  test("Group returned", async () => {
    //status code 200
  });
  test("Group doesn't exist", async () => {
    //status code 400
  });
  test("Not authorized", async () => {
    //status code 401
  });
})
*/
describe("addToGroup", () => {

  beforeEach(async () => {
  });

  afterEach(() => {
  });

  
  test("should return a 404 error if the group name is empty", async () => {

    const testGroupName = "";
    const response = await request(app)
      .patch("/api/groups/" + testGroupName + "/add")
      .set('Cookie', ["accessToken=" + accessToken, "refreshToken=" + userOne.refreshToken])
    expect(response.status).toBe(404)
  })
  
  
  test("should return a 400 error if the request body does not contain all the necessary attributes", async () => {

    jest.spyOn(Group, "findOne").mockImplementation(() => retrievedGroup);
    const testGroupName = "test_group";
    const response = await request(app)
      .patch("/api/groups/" + testGroupName + "/add")
      .set('Cookie', ["accessToken=" + accessToken, "refreshToken=" + userOne.refreshToken])
      .send({})

    expect(response.status).toBe(400)
  })
  
  
  test("should return 400 error if there are not existed group", async () => {
    jest.spyOn(Group, "findOne").mockImplementation(() => { })

    const testGroupName = "test_group";
    const response = await request(app)
      .patch("/api/groups/" + testGroupName + "/add")
      .set('Cookie', ["accessToken=" + accessToken, "refreshToken=" + userOne.refreshToken])
    expect(response.status).toBe(400)
  })

  
  test("should return 400 error if there are no existed user", async () => {

    jest.spyOn(Group, "findOne").mockImplementation(() => retrievedGroup);
    jest.spyOn(User, "findOne").mockImplementation(() => userOne);

    const response = await request(app)
      .patch("/api/groups/" + retrievedGroup.name + "/add")
      .set('Cookie', ["accessToken=" + accessToken, "refreshToken=" + userOne.refreshToken])
      .send({ emails: ["no_existed_user@user.com"] });

    expect(response.status).toBe(400)
  })

  
  test("should return 400 error if there were already in a group", async () => {

    const retrivedUser = { email: 'user1@user.com', user: new mongoose.Types.ObjectId() };
    jest.spyOn(Group, "findOne").mockImplementation(() => retrievedGroup)
    jest.spyOn(User, "findOne").mockImplementation(() => retrivedUser)

    const response = await request(app)
      .patch("/api/groups/" + retrievedGroup.name + "/add")
      .set('Cookie', ["accessToken=" + accessToken, "refreshToken=" + userOne.refreshToken])
      .send({ emails: [retrivedUser.email] });

    expect(response.status).toBe(400);
  })

  
  test("should return a 400 error if at least one of the member emails is not in a valid email format", async () => {

    jest.spyOn(Group, "findOne").mockImplementation(() => retrievedGroup);
    jest.spyOn(User, "findOne").mockImplementation(() => userOne);

    const response = await request(app)
      .patch("/api/groups/" + retrievedGroup.name + "/add")
      .set('Cookie', ["accessToken=" + accessToken, "refreshToken=" + userOne.refreshToken])
      .send({ emails: ["no_existed_user1", "no_existed_user2@", ".com"] });

    expect(response.status).toBe(400)
  
  })
  
  
  test("should return a 400 error if at least one of the member emails is an empty string", async () => {

    jest.spyOn(Group, "findOne").mockImplementation(() => retrievedGroup);
    jest.spyOn(User, "findOne").mockImplementation(() => userOne);

    const response = await request(app)
      .patch("/api/groups/" + retrievedGroup.name + "/add")
      .set('Cookie', ["accessToken=" + accessToken, "refreshToken=" + userOne.refreshToken])
      .send({ emails: [""] });

    expect(response.status).toBe(400)
  })

  
  test("should return a 401 error if called by an authenticated user who is not part of the group (authType = Group) if the route is `api/groups/:name/add`", async () => {

    let retrivedGroupTwo = retrievedGroup;
    let userTwoId = new mongoose.Types.ObjectId();

    let userTwo = {
      email: "user1@user.com",
      password: userOne.password,
      username: "user1",
      userTwoId: userTwoId
    }

    retrievedGroup.members = [{ email: userOne.email, user: userOneId }, { email: userTwo.email, userTwo: userTwoId }];

    jest.spyOn(Group, "findOne").mockImplementation(() => retrievedGroup);

    jest.spyOn(User, "findOne").mockImplementation(() => userTwo);

    const response = await request(app)
      .patch("/api/groups/" + retrievedGroup.name + "/add")
      .set('Cookie', ["accessToken=" + accessToken, "refreshToken=" + userOne.refreshToken])
      .send({ emails: ["user2@user.com"] });

    expect(response.status).toBe(401)
  })

  
  test("should return a 401 error if called by an authenticated user who is not an admin (authType = Admin) if the route is `api/groups/:name/insert`", async () => {

    let retrivedGroupTwo = retrievedGroup;
    let userTwoId = new mongoose.Types.ObjectId();

    let userTwo = {
      email: "user2@user.com",
      password: userOne.password,
      username: "user2",
      userTwoId: userTwoId,
      role: 'Admin'
    }

    retrievedGroup.members = [{ email: userOne.email, user: userOneId }, { email: userTwo.email, userTwo: userTwoId }];

    jest.spyOn(Group, "findOne").mockImplementation(() => retrivedGroupTwo);

    jest.spyOn(User, "findOne").mockImplementation(() => userTwo);

    const response = await request(app)
      .patch("/api/groups/" + retrievedGroup.name + "/insert")
      .set('Cookie', ["accessToken=" + accessToken, "refreshToken=" + userOne.refreshToken])
      .send({ emails: ["user2@user.com"] });

    expect(response.status).toBe(401);

  })

  
  test("should return 200 status and group information if user can be joined to group", async () => {

    const newUser = { email: 'user1@user.com', username: 'user1' };

    jest.spyOn(Group, "findOne").mockImplementationOnce(() => retrievedGroup)
    jest.spyOn(User, "findOne").mockImplementation(() => newUser)

    jest.spyOn(Group, "findOne").mockImplementationOnce(() => { })

    const response = await request(app)
      .patch("/api/groups/" + retrievedGroup.name + "/add")
      .set('Cookie', ["accessToken=" + accessToken, "refreshToken=" + userOne.refreshToken])
      .send({ emails: [newUser.email] });

    expect(response.status).toBe(200)
    expect(response.body).toHaveProperty('data.group.members')
    expect(response.body.data.group.members).toHaveLength(2)
    expect(response.body.data.group.members[1].email).toEqual(newUser.email)
  })
})

describe("removeFromGroup", () => {

  beforeEach(async () => {
  });
  afterEach(() => {
  });

  
  test("should return a 400 error if the request body does not contain all the necessary attributes", async () => {

    jest.spyOn(Group, "findOne").mockImplementation(() => retrievedGroup);
    const testGroupName = "test_group";
    const response = await request(app)
      .patch("/api/groups/" + testGroupName + "/remove")
      .set('Cookie', ["accessToken=" + accessToken, "refreshToken=" + userOne.refreshToken])
      .send({})

    expect(response.status).toBe(400)
  })

  
  test("should return 400 error if there are not existed group", async () => {

    const groupInfo = { groupName: 'group1', newMembersEmails: ['user@user.com'] };
    jest.spyOn(Group, "findOne").mockImplementation(() => { })

    const testGroupName = "test_group";
    const response = await request(app)
      .patch("/api/groups/" + testGroupName + "/remove")
      .set('Cookie', ["accessToken=" + accessToken, "refreshToken=" + userOne.refreshToken])
      .send(groupInfo);

    expect(response.status).toBe(400)
  })

  
  test("should return 400 error if there are no existed user", async () => {

    const groupInfo = { groupName: 'group1', newMembersEmails: ['no_existed_user@user.com'] };
    jest.spyOn(Group, "findOne").mockImplementation(() => retrievedGroup);
    jest.spyOn(User, "findOne").mockImplementation(() => { });

    const response = await request(app)
      .patch("/api/groups/" + retrievedGroup.name + "/remove")
      .set('Cookie', ["accessToken=" + accessToken, "refreshToken=" + userOne.refreshToken])
      .send(groupInfo);

    expect(response.status).toBe(400)
  })

  
  test("should return 400 error if user was not joined in the group", async () => {

    const groupInfo = { groupName: 'group1', newMembersEmails: ['no_existed_user@user.com'] };

    jest.spyOn(Group, "findOne").mockImplementation(() => retrievedGroup)
    jest.spyOn(User, "findOne").mockImplementation(() => userOne);

    jest.spyOn(Group, "findOne").mockImplementationOnce(() => { })

    const response = await request(app)
      .patch("/api/groups/" + retrievedGroup.name + "/remove")
      .set('Cookie', ["accessToken=" + accessToken, "refreshToken=" + userOne.refreshToken])
      .send(groupInfo);

    expect(response.status).toBe(400);

  })

  
  test("should return a 400 error if at least one of the member emails is not in a valid email format", async () => {

    jest.spyOn(Group, "findOne").mockImplementation(() => retrievedGroup);
    jest.spyOn(User, "findOne").mockImplementation(() => userOne);

    const response = await request(app)
      .patch("/api/groups/" + retrievedGroup.name + "/remove")
      .set('Cookie', ["accessToken=" + accessToken, "refreshToken=" + userOne.refreshToken])
      .send({ emails: ["no_existed_user1", "no_existed_user2@", ".com"] });

    expect(response.status).toBe(400)
  })

  
  test("should return a 400 error if at least one of the member emails is an empty string", async () => {

    jest.spyOn(Group, "findOne").mockImplementation(() => retrievedGroup);
    jest.spyOn(User, "findOne").mockImplementation(() => userOne);

    const response = await request(app)
      .patch("/api/groups/" + retrievedGroup.name + "/remove")
      .set('Cookie', ["accessToken=" + accessToken, "refreshToken=" + userOne.refreshToken])
      .send({ emails: [""] });

    expect(response.status).toBe(400)
  })

  
  test("should return a 400 error if the group contains only one member before deleting any user", async () => {

    const existingUser = { email: 'user1@user.com', username: 'user1' };
    const groupInfo = { emails: [existingUser.email] };

    jest.spyOn(Group, "findOne").mockImplementationOnce(() => retrievedGroup)

    jest.spyOn(User, "findOne").mockImplementation(() => existingUser)

    jest.spyOn(Group, "findOne").mockImplementationOnce(() => true)

    const response = await request(app)
      .patch("/api/groups/" + retrievedGroup.name + "/remove")
      .set('Cookie', ["accessToken=" + accessToken, "refreshToken=" + userOne.refreshToken])
      .send(groupInfo);

    expect(response.status).toBe(400)
  })

  
  test("should return a 401 error if called by an authenticated user who is not part of the group (authType = Group) if the route is `api/groups/:name/remove", async () => {

    let retrivedGroupTwo = retrievedGroup;
    let userTwoId = new mongoose.Types.ObjectId();

    let userTwo = {
      email: "user1@user.com",
      password: userOne.password,
      username: "user1",
      userTwoId: userTwoId
    }

    retrivedGroupTwo.members = [{ email: userOne.email, user: userOneId }, { email: userTwo.email, userTwo: userTwoId }];

    jest.spyOn(Group, "findOne").mockImplementation(() => retrivedGroupTwo);

    jest.spyOn(User, "findOne").mockImplementation(() => userTwo);

    const response = await request(app)
      .patch("/api/groups/" + retrivedGroupTwo.name + "/remove")
      .set('Cookie', ["accessToken=" + accessToken, "refreshToken=" + userOne.refreshToken])
      .send({ emails: ["user2@user.com"] });

    expect(response.status).toBe(401)
  })

  
  test("should return a 401 error if called by an authenticated user who is not an admin (authType = Admin) if the route is `api/groups/:name/pull`", async () => {

    let retrivedGroupTwo = retrievedGroup;
    let userTwoId = new mongoose.Types.ObjectId();

    let userTwo = {
      email: "user1@user.com",
      password: userOne.password,
      username: "user1",
      userTwoId: userTwoId
    }

    retrivedGroupTwo.members = [{ email: userOne.email, user: userOneId }, { email: userTwo.email, userTwo: userTwoId }];

    jest.spyOn(Group, "findOne").mockImplementation(() => retrivedGroupTwo);

    jest.spyOn(User, "findOne").mockImplementation(() => userTwo);

    const response = await request(app)
      .patch("/api/groups/" + retrivedGroupTwo.name + "/pull")
      .set('Cookie', ["accessToken=" + accessToken, "refreshToken=" + accessToken.refreshToken])
      .send({ emails: ["user2@user.com"] });

    expect(response.status).toBe(401)

  })

  
  test("should return 200 status and group information if user can be removed to group", async () => {

    const existingUser = { email: 'user1@user.com', username: 'user1' };
    const groupInfo = { emails: [existingUser.email] };

    let updatedGroup = { name: retrievedGroup.name, members: [] };
    updatedGroup.members.push(retrievedGroup.members[0]);
    updatedGroup.members.push({ email: existingUser.email, user: userOneId.toString() });

    jest.spyOn(Group, "findOne").mockImplementationOnce(() => updatedGroup)

    jest.spyOn(User, "findOne").mockImplementation(() => existingUser)

    jest.spyOn(Group, "findOne").mockImplementationOnce(() => true)

    const response = await request(app)
      .patch("/api/groups/" + retrievedGroup.name + "/remove")
      .set('Cookie', ["accessToken=" + accessToken, "refreshToken=" + userOne.refreshToken])
      .send(groupInfo);

    expect(response.status).toBe(200)
    expect(response.body).toHaveProperty('data.group.members')
    expect(response.body.data.group.members).toHaveLength(1)

  })

})

describe("deleteUser", () => {
  test('Dummy test, change it', () => {
    expect(true).toBe(true);
  });
  beforeEach(async () => {

  });
  afterEach(() => {
  });


  
  test("should return a 400 error if the request body does not contain all the necessary attributes", async () => {
    const response = await request(app)
      .delete("/api/users")
      .set('Cookie', ["accessToken=" + adminAccessToken, "refreshToken=" + adminOne.refreshToken])
      .send({})

    expect(response.status).toBe(400);
  })

  
  test("should return a 400 error if the name passed in the request body is an empty string", async () => {
    const response = await request(app)
      .delete("/api/users")
      .set('Cookie', ["accessToken=" + adminAccessToken, "refreshToken=" + adminOne.refreshToken])
      .send({ email: "" })

    expect(response.status).toBe(400);
  })

  test("should return a 400 error if the email passed in the request body is not in correct email format", async () => {

    const response = await request(app)
    .delete("/api/users")
    .set('Cookie', ["accessToken=" + adminAccessToken, "refreshToken=" + adminOne.refreshToken])
      .send({ emails: ["no_existed_user1", "no_existed_user2@", ".com"] });

    expect(response.status).toBe(400)
  })

  
  test("should return a 400 error if the email passed in the request body does not represent a user in the database", async () => {

    jest.spyOn(User, "findOne").mockImplementation(() => { });

    const response = await request(app)
      .delete("/api/users")
      .set('Cookie', ["accessToken=" + adminAccessToken, "refreshToken=" + adminOne.refreshToken])
      .send({ email: "not_existed@user.com" })

    expect(response.status).toBe(400);
  })

  
  test("should return a 401 error if called by an authenticated user who is not an admin (authType = Admin)", async () => {
    const response = await request(app)
      .delete("/api/users")
      .set('Cookie', ["accessToken=" + accessToken, "refreshToken=" + userOne.refreshToken])

    expect(response.status).toBe(401)
  })

  
  test("should return 200 status code if email is deleted by Admin", async () => {

    jest.spyOn(User, "findOne").mockImplementation(() => userOne);
    jest.spyOn(transactions, "deleteMany").mockResolvedValue({ deletedCount: 1 });
    jest.spyOn(Group, "deleteMany").mockResolvedValue({ deletedCount: 1 });
    jest.spyOn(User, "deleteOne").mockResolvedValue({ deletedCount: 1 });

    const response = await request(app)
      .delete("/api/users")
      .set('Cookie', ["accessToken=" + adminAccessToken, "refreshToken=" + adminOne.refreshToken])
      .send({ email: userOne.email })
    expect(response.status).toBe(200)
    expect(response.body).toHaveProperty('data.deletedFromGroup')
    expect(response.body).toHaveProperty('data.deletedTransactions')
    expect(response.body).toHaveProperty('message')
  })

})

describe("deleteGroup", () => {
  beforeEach(async () => {

  });
  afterEach(() => {
  });

  
  test("should return a 401 error if called by an authenticated user who is not an admin (authType = Admin)", async () => {
    const response = await request(app)
      .delete("/api/groups")
      .set('Cookie', ["accessToken=" + accessToken, "refreshToken=" + userOne.refreshToken])

    expect(response.status).toBe(401)
  })

  
  test("should return a 400 error if the request body does not contain all the necessary attributes", async () => {
    const response = await request(app)
      .delete("/api/groups")
      .set('Cookie', ["accessToken=" + adminAccessToken, "refreshToken=" + adminOne.refreshToken])
      .send({})

    expect(response.status).toBe(400);
  })

  
  test("should return a 400 error if the name passed in the request body is an empty string", async () => {
    const response = await request(app)
      .delete("/api/groups")
      .set('Cookie', ["accessToken=" + adminAccessToken, "refreshToken=" + adminOne.refreshToken])
      .send({ name: "" })

    expect(response.status).toBe(400);
  })

  
  test("should return a 400 error if the name passed in the request body does not represent a group in the database", async () => {

    jest.spyOn(Group, "findOne").mockImplementation(() => { });

    const response = await request(app)
      .delete("/api/groups")
      .set('Cookie', ["accessToken=" + adminAccessToken, "refreshToken=" + adminOne.refreshToken])
      .send({ name: "not_existed_group" })

    expect(response.status).toBe(400);
  })

  
  test("should return 200 status code if group is deleted by Admin", async () => {

    jest.spyOn(Group, "findOne").mockImplementation(() => retrievedGroup);

    const response = await request(app)
      .delete("/api/groups")
      .set('Cookie', ["accessToken=" + adminAccessToken, "refreshToken=" + adminOne.refreshToken])
      .send({ name: retrievedGroup.name })

    expect(response.status).toBe(200)
    expect(response.body).toHaveReturned()
  })
})