import request from 'supertest';
import { app } from '../app';
import { User, Group } from '../models/User.js';
import { verifyAuth } from '../controllers/utils';

/**
 * In order to correctly mock the calls to external modules it is necessary to mock them using the following line.
 * Without this operation, it is not possible to replace the actual implementation of the external functions with the one
 * needed for the test cases.
 * `jest.mock()` must be called for every external module that is called in the functions under test.
 */
jest.mock("../models/User.js")

/**
 * Defines code to be executed before each test case is launched
 * In this case the mock implementation of `User.find()` is cleared, allowing the definition of a new mock implementation.
 * Not doing this `mockClear()` means that test cases may use a mock implementation intended for other test cases.
 */
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

    expect(response.status).toBe(200);
    expect(response.body).toBe({
      data: {
        group: {name: "Family", 
        members: [{email: "mario.red@email.com"}, {email: "luigi.red@email.com"}]},
        membersNotFound: [], alreadyInGroup: []
      },
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

describe("addToGroup", () => { })

describe("removeFromGroup", () => { })

describe("deleteUser", () => { })

describe("deleteGroup", () => { })