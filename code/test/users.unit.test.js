import request from 'supertest';
import { app } from '../app';
import { User, Group, GroupSchema } from '../models/User.js';
import { transactions } from '../models/model';
import * as utils from '../controllers/utils.js';
import jwt from 'jsonwebtoken';
import mongoose from "mongoose";
import dotenv from "dotenv";
import { createGroup, getGroup, getGroups, getUser, getUsers, addToGroup, removeFromGroup, deleteUser, deleteGroup } from  '../controllers/users.js'
import { verifyAuth } from '../controllers/utils.js';

jest.mock("../controllers/utils")
jest.mock("../models/model")
jest.mock("../models/User")

jest.mock('../models/User', () => ({
  Group: {create: jest.fn(), findOne: jest.fn(), find: jest.fn(), findOneAndUpdate: jest.fn(), deleteMany: jest.fn(), deleteOne:jest.fn()},
  User: {create: jest.fn(), findOne: jest.fn(), find: jest.fn(), findOneAndUpdate: jest.fn(), deleteMany: jest.fn(), deleteOne:jest.fn()}
}));


dotenv.config();

let userOneId = new mongoose.Types.ObjectId();
let adminOneId = new mongoose.Types.ObjectId();
let userTwoId = new mongoose.Types.ObjectId();
let errUserId = new mongoose.Types.ObjectId();
/*let accessToken = "";
let adminAccessToken = ""; bySimo*/
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
let userTwo = {
  username: 'user2',
  email: 'user2@user.com',
  password: '',
  role: 'Regular'
}
const retrievedGroup = { name: 'group1', members: [{ email: userOne.email, user: userOneId }] };
const retrievedGroup2 = { name: 'group2', members: [{ email: userOne.email, user: userOneId }, { email: userTwo.email, user: userTwoId }]};
const retrievedGroup3 = { name: 'group3', members: [userOne] };
const retrievedGroup4 = { name: 'group4', members: [userOne, userTwo]};
const retrievedGroup5 = { name : 'group5', members: [userTwo]};

beforeAll(async () => {
/*
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
 bySimo */
  // User.find.mockClear();
  // User.findOne.mockClear();
  // Group.findOne.mockClear();

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
 */
beforeEach(() => {
  jest.resetAllMocks();
  User.find.mockClear();
  User.findOne.mockClear();
  Group.findOne.mockClear();
  Group.findOne.mockReset();
  User.findOne.mockReset();
  //additional `mockClear()` must be placed here
});


describe("getUsers", () => {
  test("should return 401 error because is not called by an admin", async () => {
    utils.verifyAuth.mockImplementationOnce(() => {
      return {flag: false, cause: 'message'}
    })
  
    //jest.spyOn(User, "find").mockImplementation(() => []);

    const req = { 
      body:{}
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals:{
        "refreshedTokenMessage" : "not ok"
      }
    };

    await getUsers(req,res);

    expect(res.status).toHaveBeenCalledWith(401)
  })

  test("should retrieve list of all users", async () => {
    utils.verifyAuth.mockImplementationOnce(() => {
      return {flag: true, cause: 'message'}
    })
  
    jest.spyOn(User, "find").mockImplementationOnce(() =>
      [userOne, userTwo]
    );

    const req = { 
      body:{}
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals:{
        "refreshedTokenMessage" : "ok"
      }
    };

    await getUsers(req,res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({"data": [{username: userOne.username, email: userOne.email, role: userOne.role},
      {username: userTwo.username, email: userTwo.email, role: userTwo.role}], "refreshedTokenMessage":"ok"});
  })
})

describe("getUser", () => { 
  
  test("getUser called by the same user", async () => {
    const retrievedUser = { username: 'user', email: 'user@user.com', role: 'Regular'};

    const req = { params: {username: retrievedUser.username} };
    const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
        locals:{
          "refreshedTokenMessage" : "ok"
        }
    };

    jest.spyOn(User, "findOne").mockImplementationOnce(() => (retrievedUser));
    utils.verifyAuth.mockImplementationOnce(() =>{ //called by a user
      return {flag: true, cause: 'message'}
    })
    utils.verifyAuth.mockImplementationOnce(() =>{ //not called by an admin
      return {flag: false, cause: 'message'}
    })
    
    await getUser(req,res);
      

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({"data":retrievedUser, "refreshedTokenMessage": "ok"});
  });

  test("getUser called by an admin", async () => {
    const retrievedUser = { username: 'userTest', email:"user@test.com", role: 'Regular'};
    
    const req = { params: {username: retrievedUser.username} };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals:{
        "refreshedTokenMessage" : "ok"
      }
    };
    utils.verifyAuth.mockImplementationOnce(() =>{ //not called by a user
      return {flag: false, cause: 'message'}
    })
    utils.verifyAuth.mockImplementationOnce(() =>{ //called by an admin
      return {flag: true, cause: 'message'}
    })
    jest.spyOn(User, "findOne").mockImplementationOnce(() => (retrievedUser));
    
    await getUser(req,res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({"data":retrievedUser, "refreshedTokenMessage": "ok"});
  })

  test("getUser called without authorization", async() => {
    const retrievedUser = { username: 'test1', email: 'test1@example.com', role:'Regular' };
    jest.spyOn(User, "findOne").mockImplementationOnce(() => (retrievedUser));
    utils.verifyAuth.mockImplementationOnce(() =>{
      return {flag: false, cause: 'message'}
    })
    utils.verifyAuth.mockImplementationOnce(() =>{
      return {flag: false, cause: 'message'}
    })
  
    const req = { params: {username: retrievedUser.username} };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals:{
        "refreshedTokenMessage" : "not ok"
      }
    };

    await getUser(req,res);
    
    expect(res.status).toHaveBeenCalledWith(401);    
  });

  test("getUser called with wrong username parameter", async() => {
    utils.verifyAuth.mockImplementationOnce(() =>{
      return {flag: true, cause: 'message'}
    })
    jest.spyOn(User, "findOne").mockImplementationOnce(() => {});
  
    const req = { params: {username: "errUsername"} };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals:{
        "refreshedTokenMessage" : "not ok"
      }
    };

    await getUser(req,res);
    
    expect(res.status).toHaveBeenCalledWith(400);
  });
})

describe("createGroup", () => { 

  test("Successful group creation", async () => {
    utils.verifyAuth.mockImplementationOnce(() => {
      return {flag: true, cause: 'message'}
    })
    jest.spyOn(jwt,"verify").mockImplementationOnce(() => (retrievedGroup4.members[0]))
    //jest.spyOn(Group,"findOne").mockImplementationOnce(() => null); //the creator isn't in an other group
    //jest.spyOn(Group,"findOne").mockImplementationOnce(() => null); //the group doesn't already exist
    //jest.spyOn(User,"findOne").mockImplementation(() => userOne); //the user exist
    //jest.spyOn(Group, "findOne").mockImplementation(() => null); //all the new members aren't in an other group

    //in questo caso le chimate di Group.findOne e User.findOne vanno ad intersecarsi, e l'ultima chiamata prevale sulla prima
   
    Group.findOne.mockResolvedValue(null);
    User.findOne.mockResolvedValueOnce(userOne);
    User.findOne.mockResolvedValueOnce(userTwo);
    /*
    let findOneCalledTimes = 0;
    jest.spyOn(Group, "findOne").mockImplementation(() => {
      findOneCalledTimes++;

      if (findOneCalledTimes <= 2) {
        return null; // Specifica il comportamento desiderato per le prime due chiamate a Group.findOne
      } else if(findOneCalledTimes%2!=0){
        return retrievedGroup4.members[(findOneCalledTimes-3)/2];
      } else if(findOneCalledTimes%2==0){
        return null;
      }
    });
*/
    Group.create.mockResolvedValueOnce(retrievedGroup4);

    const req = { 
      body:{ 
        "name" : retrievedGroup4.name,
        "memberEmails" : retrievedGroup4.members.map((e)=>e.email)
      },
      cookies:{
        accessToken : 'Token1',
        refreshToken : 'Token1'
      } 
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals:{
        "refreshedTokenMessage" : "ok"
      }
    };

    await createGroup(req,res);
      
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      "data": { group: {name:retrievedGroup4.name, members:[{email: retrievedGroup4.members[0].email},{email: retrievedGroup4.members[1].email}]}, membersNotFound: [], alreadyInGroup: [] },
      "refreshedTokenMessage": "ok"
    });

  });

  test("Missing parameters", async () => {
    
    const req = { 
      body:{}
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals:{
        "refreshedTokenMessage" : "ok"
      }
    };

    await createGroup(req,res);

    expect(res.status).toHaveBeenCalledWith(400);

  });
  
  test("Missing member parameter", async () => {
    const req = { 
      body:{
        "name" : retrievedGroup3.name
      },
      cookies:{
        accessToken : 'Token1',
        refreshToken : 'Token1'
      } 
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals:{
        "refreshedTokenMessage" : "ok"
      }
    };

    await createGroup(req,res);
      
    expect(res.status).toHaveBeenCalledWith(400);

  });
  
  test("Missing name parameter", async () => {
    const req = { 
      body:{ 
        "memberEmails" : retrievedGroup3.members.map((e)=>e.email)
      },
      cookies:{
        accessToken : 'Token1',
        refreshToken : 'Token1'
      } 
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals:{
        "refreshedTokenMessage" : "ok"
      }
    };

    await createGroup(req,res);
      
    expect(res.status).toHaveBeenCalledWith(400);

  });
  
  test("Name parameter is an empty string", async () => {
    const req = { 
      body:{ 
        "name" : '',
        "memberEmails" : retrievedGroup3.members.map((e)=>e.email)
      },
      cookies:{
        accessToken : 'Token1',
        refreshToken : 'Token1'
      } 
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals:{
        "refreshedTokenMessage" : "ok"
      }
    };

    await createGroup(req,res);
      
    expect(res.status).toHaveBeenCalledWith(400);

  });

  test("Group already existed", async () => {
    utils.verifyAuth.mockImplementation(() => {
      return {flag: true, cause: 'message'}
    })
    jest.spyOn(jwt,"verify").mockImplementation(() => (retrievedGroup4.members[0]))
    //jest.spyOn(Group,"findOne").mockImplementationOnce(() => null); //the creator isn't in an other group
    //jest.spyOn(Group,"findOne").mockImplementationOnce(() => null); //the group doesn't already exist
    //jest.spyOn(User,"findOne").mockImplementation(() => userOne); //the user exist
    //jest.spyOn(Group, "findOne").mockImplementation(() => null); //all the new members aren't in an other group

    //in questo caso le chimate di Group.findOne e User.findOne vanno ad intersecarsi, e l'ultima chiamata prevale sulla prima
    let findOneCalledTimes = 0;

    jest.spyOn(Group, "findOne").mockImplementation(() => {
      findOneCalledTimes++;

      if (findOneCalledTimes == 1) {
        return null; 
      } else if (findOneCalledTimes == 2) {
        return retrievedGroup4; // the group already exist
      }
    });

    const req = { 
      body:{ 
        "name" : retrievedGroup4.name,
        "memberEmails" : retrievedGroup4.members.map((e)=>e.email)
      },
      cookies:{
        accessToken : 'Token1',
        refreshToken : 'Token1'
      } 
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals:{
        "refreshedTokenMessage" : "not ok"
      }
    };

    await createGroup(req,res);
      
    expect(res.status).toHaveBeenCalledWith(400);
  });
  
  test("Not authorized", async () => {
    utils.verifyAuth.mockImplementation(() => {
      return {flag: false, cause: 'message'}
    })
    
    const req = { 
      body:{ 
        "name" : retrievedGroup4.name,
        "memberEmails" : retrievedGroup4.members.map((e)=>e.email)
      },
      cookies:{
        accessToken : 'Token1',
        refreshToken : 'Token1'
      } 
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals:{
        "refreshedTokenMessage" : "not ok"
      }
    };
  
    await createGroup(req,res);
      
    expect(res.status).toHaveBeenCalledWith(401);
  });
  
  test("Creator already in a group", async () => {
    utils.verifyAuth.mockImplementation(() => {
      return {flag: true, cause: 'message'}
    })
    jest.spyOn(jwt,"verify").mockImplementation(() => (retrievedGroup4.members[0]))

    //in questo caso le chimate di Group.findOne e User.findOne vanno ad intersecarsi, e l'ultima chiamata prevale sulla prima
    let findOneCalledTimes = 0;

    jest.spyOn(Group, "findOne").mockImplementation(() => {
      findOneCalledTimes++;

      if (findOneCalledTimes == 1) {
        return retrievedGroup4.members[0];
      }
    });

    //jest.spyOn(Group, "create").mockImplementation(()=> (retrievedGroup4) )

    const req = { 
      body:{ 
        "name" : retrievedGroup4.name,
        "memberEmails" : retrievedGroup4.members.map((e)=>e.email)
      },
      cookies:{
        accessToken : 'Token1',
        refreshToken : 'Token1'
      } 
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals:{
        "refreshedTokenMessage" : "not ok"
      }
    };

    await createGroup(req,res);
      
    expect(res.status).toHaveBeenCalledWith(400);
  });

  test("All members already in a group", async () => {
    utils.verifyAuth.mockImplementation(() => {
      return {flag: true, cause: 'message'}
    })
    jest.spyOn(jwt,"verify").mockImplementation(() => (retrievedGroup4.members[0]))
    //jest.spyOn(Group,"findOne").mockImplementationOnce(() => null); //the creator isn't in an other group
    //jest.spyOn(Group,"findOne").mockImplementationOnce(() => null); //the group doesn't already exist
    //jest.spyOn(User,"findOne").mockImplementation(() => userOne); //the user exist
    //jest.spyOn(Group, "findOne").mockImplementation(() => null); //all the new members aren't in an other group

    //in questo caso le chimate di Group.findOne e User.findOne vanno ad intersecarsi, e l'ultima chiamata prevale sulla prima
    let findOneCalledTimes = 0;

    jest.spyOn(Group, "findOne").mockImplementation(() => {
      findOneCalledTimes++;

      if (findOneCalledTimes <= 2) {
        return null; // Specifica il comportamento desiderato per le prime due chiamate a Group.findOne
      } else if(findOneCalledTimes%2!=0){
        return retrievedGroup4.members[(findOneCalledTimes-3)/2];
      } else if(findOneCalledTimes%2==0){
        return retrievedGroup4;
      }
    });

    //jest.spyOn(Group, "create").mockImplementation(()=> (retrievedGroup4) )

    const req = { 
      body:{ 
        "name" : retrievedGroup4.name,
        "memberEmails" : retrievedGroup4.members.map((e)=>e.email)
      },
      cookies:{
        accessToken : 'Token1',
        refreshToken : 'Token1'
      } 
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals:{
        "refreshedTokenMessage" : "not ok"
      }
    };

    await createGroup(req,res);
      
    expect(res.status).toHaveBeenCalledWith(400);
  });
  
  test("At least one member emails is an empty string", async () => {
    let errUserOne = {...userOne, email:""};
    let errRetrievedGroup4 = {...retrievedGroup4};
    errRetrievedGroup4.members = [...errRetrievedGroup4.members, errUserOne]
    
    utils.verifyAuth.mockImplementation(() => {
      return {flag: true, cause: 'message'}
    })
    jest.spyOn(jwt,"verify").mockImplementation(() => (errRetrievedGroup4.members[0]))
    //jest.spyOn(Group,"findOne").mockImplementationOnce(() => null); //the creator isn't in an other group
    //jest.spyOn(Group,"findOne").mockImplementationOnce(() => null); //the group doesn't already exist
    //jest.spyOn(User,"findOne").mockImplementation(() => userOne); //the user exist
    //jest.spyOn(Group, "findOne").mockImplementation(() => null); //all the new members aren't in an other group

    //in questo caso le chimate di Group.findOne e User.findOne vanno ad intersecarsi, e l'ultima chiamata prevale sulla prima
    let findOneCalledTimes = 0;

    jest.spyOn(Group, "findOne").mockImplementation(() => {
      findOneCalledTimes++;

      if (findOneCalledTimes <= 2) {
        return null; // Specifica il comportamento desiderato per le prime due chiamate a Group.findOne
      } else if(findOneCalledTimes%2!=0){
        return errRetrievedGroup4.members[(findOneCalledTimes-3)/2];
      } else if(findOneCalledTimes%2==0){
        return null;
      }
    });

    //jest.spyOn(Group, "create").mockImplementation(()=> (retrievedGroup4) )

    const req = { 
      body:{ 
        "name" : errRetrievedGroup4.name,
        "memberEmails" : errRetrievedGroup4.members.map((e)=>e.email)
      },
      cookies:{
        accessToken : 'Token1',
        refreshToken : 'Token1'
      } 
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals:{
        "refreshedTokenMessage" : "ok"
      }
    };

    await createGroup(req,res);
      
    expect(res.status).toHaveBeenCalledWith(400);

  });
  
  test("At least one member emails is with uncorrect format", async () => {
    let errUserOne = {...userOne, email:"ciao.com"};
    let errRetrievedGroup4 = {...retrievedGroup4};
    errRetrievedGroup4.members = [...errRetrievedGroup4.members, errUserOne]
    
    utils.verifyAuth.mockImplementation(() => {
      return {flag: true, cause: 'message'}
    })
    jest.spyOn(jwt,"verify").mockImplementation(() => (errRetrievedGroup4.members[0]))
    //jest.spyOn(Group,"findOne").mockImplementationOnce(() => null); //the creator isn't in an other group
    //jest.spyOn(Group,"findOne").mockImplementationOnce(() => null); //the group doesn't already exist
    //jest.spyOn(User,"findOne").mockImplementation(() => userOne); //the user exist
    //jest.spyOn(Group, "findOne").mockImplementation(() => null); //all the new members aren't in an other group

    //in questo caso le chimate di Group.findOne e User.findOne vanno ad intersecarsi, e l'ultima chiamata prevale sulla prima
    let findOneCalledTimes = 0;

    jest.spyOn(Group, "findOne").mockImplementation(() => {
      findOneCalledTimes++;

      if (findOneCalledTimes <= 2) {
        return null; // Specifica il comportamento desiderato per le prime due chiamate a Group.findOne
      } else if(findOneCalledTimes%2!=0){
        return errRetrievedGroup4.members[(findOneCalledTimes-3)/2];
      } else if(findOneCalledTimes%2==0){
        return null;
      }
    });

    //jest.spyOn(Group, "create").mockImplementation(()=> (retrievedGroup4) )

    const req = { 
      body:{ 
        "name" : errRetrievedGroup4.name,
        "memberEmails" : errRetrievedGroup4.members.map((e)=>e.email)
      },
      cookies:{
        accessToken : 'Token1',
        refreshToken : 'Token1'
      } 
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals:{
        "refreshedTokenMessage" : "ok"
      }
    };

    await createGroup(req,res);
      
    expect(res.status).toHaveBeenCalledWith(400);

  });

})

describe("getGroups", () => { 
  test("List of groups returned", async () => {

    utils.verifyAuth.mockImplementation(() => {
      return {flag: true, cause: 'message'}
    })

    jest.spyOn(Group, "find").mockImplementation(()=>[retrievedGroup3,retrievedGroup5]);

    const req = { 
      body:{}
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals:{
        "refreshedTokenMessage" : "ok"
      }
    };
    await getGroups(req,res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      "data": [retrievedGroup3,retrievedGroup5],
      "refreshedTokenMessage": "ok"
    });
  });
  test("Not authorized", async () => {
    utils.verifyAuth.mockImplementation(() => {
      return {flag: false, cause: 'message'}
    })

    //jest.spyOn(Group, "find").mockImplementation(()=>[retrievedGroup3,retrievedGroup5]);

    const req = { 
      body:{}
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals:{
        "refreshedTokenMessage" : "not ok"
      }
    };
    await getGroups(req,res);

    expect(res.status).toHaveBeenCalledWith(401);
  });
})

describe("getGroup", () => {
  test("Group returned", async () => {

    jest.spyOn(Group, "findOne").mockImplementation(()=>(retrievedGroup4));

    utils.verifyAuth.mockImplementation(() => {
      return {flag: true, cause: 'message'}
    })

    const req = { 
      body:{},
      params:{
        name:retrievedGroup4.name
      }
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals:{
        "refreshedTokenMessage" : "ok"
      }
    };

    await getGroup(req,res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      "data": {group: retrievedGroup4},
      "refreshedTokenMessage": "ok"
    });

  });
  
  test("Group doesn't exist", async () => {
    jest.spyOn(Group, "findOne").mockImplementation(()=>(null));

    utils.verifyAuth.mockImplementation(() => {
      return {flag: true, cause: 'message'}
    })

    const req = { 
      body:{},
      params:{
        name:retrievedGroup4.name
      }
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals:{
        "refreshedTokenMessage" : "not ok"
      }
    };

    await getGroup(req,res);

    expect(res.status).toHaveBeenCalledWith(400);
  });
  
  test("Not authorized", async () => {
    jest.spyOn(Group, "findOne").mockImplementation(()=>(retrievedGroup4));

    utils.verifyAuth.mockImplementation(() => {
      return {flag: false, cause: 'message'}
    })

    const req = { 
      body:{},
      params:{
        name:retrievedGroup4.name
      }
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals:{
        "refreshedTokenMessage" : "not ok"
      }
    };

    await getGroup(req,res);

    expect(res.status).toHaveBeenCalledWith(401);
  });

})

describe("addToGroup", () => {
  beforeEach(() => {
  });

  test("should return a 400 error if the group name is empty", async () => {

    const req = {
      params: {name: ''}, 
      body:{
        "emails" : [userOne.email]
      },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals:{
        "refreshedTokenMessage" : "ok"
      }
    };

    await addToGroup(req,res);
      
    expect(res.status).toHaveBeenCalledWith(400);

  })
 
  
  test("should return a 400 error if the request body does not contain all the necessary attributes", async () => {

    utils.verifyAuth.mockImplementation(() => {return {flag: true, cause: 'message'}})
    const req = {
      params: {name: retrievedGroup.name}, 
      body:{},
      cookies:{
        accessToken : 'Token1',
        refreshToken : 'Token1'
      } 
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals:{
        "refreshedTokenMessage" : "ok"
      }
    };

    await addToGroup(req,res);
      
    expect(res.status).toHaveBeenCalledWith(400);
  })
  
  
  test("should return 400 error if there are not existed group", async () => {
    
    jest.spyOn(Group,"findOne").mockImplementation(() => {});
    utils.verifyAuth.mockImplementation(() => {return {flag: true, cause: 'message'}})
    
    const req = {
      params: {name: "not_existed_group"}, 
      body:{emails: [userTwo.email]},
      cookies:{
        accessToken : 'Token1',
        refreshToken : 'Token1'
      } 
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals:{
        "refreshedTokenMessage" : "ok"
      }
    };

    await addToGroup(req,res);
      
    expect(res.status).toHaveBeenCalledWith(400);

  })

  
  test("should return 400 error if there are no existed user", async () => {

    utils.verifyAuth.mockImplementation(() => {return {flag: true, cause: 'message'}})
    Group.findOne.mockResolvedValueOnce(retrievedGroup);
    User.findOne.mockResolvedValueOnce(null);
        
    const req = {
      params: {name: retrievedGroup.name}, 
      body:{emails: ["not_existed_user@user.com"]},
      cookies:{
        accessToken : 'Token1',
        refreshToken : 'Token1'
      } 
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals:{
        "refreshedTokenMessage" : "ok"
      }
    };

    await addToGroup(req,res);
      
    expect(res.status).toHaveBeenCalledWith(400);

  })

 
  test("should return 400 error if there were already in a group", async () => {

    utils.verifyAuth.mockImplementation(() => {return {flag: true, cause: 'message'}})

    Group.findOne.mockResolvedValue(retrievedGroup);
    User.findOne.mockResolvedValueOnce(userOne);
        
    const req = {
      params: {name: retrievedGroup.name}, 
      body:{emails: [userOne.email]},
      cookies:{
        accessToken : 'Token1',
        refreshToken : 'Token1'
      } 
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals:{
        "refreshedTokenMessage" : "ok"
      }
    };

    await addToGroup(req,res);
      
    expect(res.status).toHaveBeenCalledWith(400);

  })


  test("should return a 400 error if at least one of the member emails is not in a valid email format", async () => {

    utils.verifyAuth.mockImplementation(() => {return {flag: true, cause: 'message'}})

    Group.findOne.mockResolvedValueOnce(retrievedGroup);
    User.findOne.mockResolvedValueOnce(userOne);
        
    const req = {
      params: {name: retrievedGroup.name}, 
      body:{emails: ["no_existed_user1", "no_existed_user2@", ".com"]},
      cookies:{
        accessToken : 'Token1',
        refreshToken : 'Token1'
      } 
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals:{
        "refreshedTokenMessage" : "ok"
      }
    };

    await addToGroup(req,res);
      
    expect(res.status).toHaveBeenCalledWith(400);

  })
  
  
  test("should return a 400 error if at least one of the member emails is an empty string", async () => {

    utils.verifyAuth.mockImplementation(() => {return {flag: true, cause: 'message'}})

    Group.findOne.mockResolvedValueOnce(retrievedGroup);
    User.findOne.mockResolvedValueOnce(userOne);
        
    const req = {
      params: {name: retrievedGroup.name}, 
      body:{emails: [""]},
      cookies:{
        accessToken : 'Token1',
        refreshToken : 'Token1'
      } 
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals:{
        "refreshedTokenMessage" : "ok"
      }
    };

    await addToGroup(req,res);
      
    expect(res.status).toHaveBeenCalledWith(400);

  })

  
  test("should return a 401 error if called by an authenticated user who is not part of the group (authType = Group) if the route is `api/groups/:name/add`", async () => {
    utils.verifyAuth.mockImplementationOnce(() => {return {flag: false, cause: 'Wrong User auth request'}})
    utils.verifyAuth.mockImplementationOnce(() => {return {flag: true, cause: 'message'}})

    Group.findOne.mockResolvedValueOnce(retrievedGroup);

    User.findOne.mockResolvedValueOnce(userTwo);
        
    const req = {
      params: {name: retrievedGroup.name}, 
      body:{emails: [userOne.email]},
      path: "/groups/" + retrievedGroup.name + "/add",
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals:{
        "refreshedTokenMessage" : "ok"
      }
    };

    await addToGroup(req,res);
      
    expect(res.status).toHaveBeenCalledWith(401);

  })
  
  test("should return a 401 error if called by an authenticated user who is not an admin (authType = Admin) if the route is `api/groups/:name/insert`", async () => {

    utils.verifyAuth.mockImplementationOnce(() => {return {flag: true}})
    utils.verifyAuth.mockImplementationOnce(() => {return {flag: false, cause: 'Wrong Admin auth request'}})

    Group.findOne.mockResolvedValueOnce(retrievedGroup);

    User.findOne.mockResolvedValueOnce(userTwo);
        
    const req = {
      params: {name: retrievedGroup.name}, 
      body:{emails: [userOne.email]},
      path: "/groups/" + retrievedGroup.name + "/insert",
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals:{
        "refreshedTokenMessage" : "ok"
      }
    };

    await addToGroup(req,res);
      
    expect(res.status).toHaveBeenCalledWith(401);
  })

  
  test("should return 200 status and group information if user can be joined to group", async () => {


    utils.verifyAuth.mockImplementation(() => {return {flag: true, cause: 'message'}})

    const newUser = { email: 'user1@user.com', username: 'user1' };
  
    Group.findOne.mockResolvedValueOnce(retrievedGroup);
    User.findOne.mockResolvedValueOnce(newUser);

    let updatedGroup = {
      name: "group1",
      members: [{email: userOne.email, user: userOneId}]
    };
    updatedGroup.members.push({email: newUser.email, user: userOneId});
    
    Group.findOne.mockResolvedValueOnce(null);
    Group.findOneAndUpdate.mockResolvedValueOnce(updatedGroup);
        
    const req = {
      params: {name: retrievedGroup.name}, 
      body:{emails: [newUser.email]},
      cookies:{
        accessToken : 'Token1',
        refreshToken : 'Token1'
      } 
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals:{
        "refreshedTokenMessage" : "ok"
      }
    };

    await addToGroup(req,res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      "data": { group: updatedGroup, alreadyInGroup: [], membersNotFound: [] },
      "message": "New members added",
      "refreshedTokenMessage": "ok"
    });
  })
})
  
describe("removeFromGroup", () => {

  beforeEach(async () => {
  });
  afterEach(() => {
  });


  test("should return a 400 error if the request body does not contain all the necessary attributes", async () => {

    const req = {
      params: {name: retrievedGroup.name}, 
      body:{},
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals:{
        "refreshedTokenMessage" : "ok"
      }
    };

    await removeFromGroup(req,res);
      
    expect(res.status).toHaveBeenCalledWith(400);

  })
  
  test("should return 400 error if there are not existed group", async () => {

    Group.findOne.mockResolvedValue(null);
    utils.verifyAuth.mockImplementation(() => {return {flag: true, cause: 'message'}})
    
    const req = {
      params: {name: "not_existed_group"}, 
      body:{emails: [userTwo.email]},
      cookies:{
        accessToken : 'Token1',
        refreshToken : 'Token1'
      } 
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals:{
        "refreshedTokenMessage" : "ok"
      }
    };

    await removeFromGroup(req,res);
      
    expect(res.status).toHaveBeenCalledWith(400);
  })
  
  test("should return 400 error if there are no existed user", async () => {

    utils.verifyAuth.mockImplementation(() => {return {flag: true, cause: 'message'}})
    Group.findOne.mockResolvedValueOnce(retrievedGroup);
    User.findOne.mockResolvedValueOnce(null);
        
    const req = {
      params: {name: retrievedGroup.name}, 
      body:{emails: ["not_existed_user@user.com"]},
      cookies:{
        accessToken : 'Token1',
        refreshToken : 'Token1'
      } 
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals:{
        "refreshedTokenMessage" : "ok"
      }
    };

    await removeFromGroup(req,res);
      
    expect(res.status).toHaveBeenCalledWith(400);

  })
  
  test("should return 400 error if user was not joined in the group", async () => {

    utils.verifyAuth.mockImplementation(() => {return {flag: true, cause: 'message'}})
    
    Group.findOne.mockResolvedValueOnce(retrievedGroup)
    User.findOne.mockResolvedValueOnce(userOne);
    Group.findOne.mockResolvedValueOnce(null)
        
    const req = {
      params: {name: retrievedGroup.name}, 
      body:{emails: ["not_joined@user.com"]},
      cookies:{
        accessToken : 'Token1',
        refreshToken : 'Token1'
      } 
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals:{
        "refreshedTokenMessage" : "ok"
      }
    };

    await removeFromGroup(req,res);
      
    expect(res.status).toHaveBeenCalledWith(400);


  })
 
  test("should return a 400 error if at least one of the member emails is not in a valid email format", async () => {
    /////////////////////////////////
    utils.verifyAuth.mockImplementation(() => {return {flag: true, cause: 'message'}})
    
    Group.findOne.mockResolvedValueOnce(retrievedGroup)
    User.findOne.mockResolvedValueOnce(userOne);
        
    const req = {
      params: {name: retrievedGroup.name}, 
      body:{emails: ["no_existed_user1", "no_existed_user2@", ".com"]},
      cookies:{
        accessToken : 'Token1',
        refreshToken : 'Token1'
      } 
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals:{
        "refreshedTokenMessage" : "ok"
      }
    };

    await removeFromGroup(req,res);
      
    expect(res.status).toHaveBeenCalledWith(400);

  })

  
  test("should return a 400 error if at least one of the member emails is an empty string", async () => {

    utils.verifyAuth.mockImplementation(() => {return {flag: true, cause: 'message'}})

    Group.findOne.mockResolvedValueOnce(retrievedGroup);
    User.findOne.mockResolvedValueOnce(null);
        
    const req = {
      params: {name: retrievedGroup.name}, 
      body:{emails: [""]},
      cookies:{
        accessToken : 'Token1',
        refreshToken : 'Token1'
      } 
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals:{
        "refreshedTokenMessage" : "ok"
      }
    };

    await removeFromGroup(req,res);
      
    expect(res.status).toHaveBeenCalledWith(400);
  })

  
  test("should return a 400 error if the group contains only one member before deleting any user", async () => {

    const existingUser = { email: 'user1@user.com', username: 'user1' };
    utils.verifyAuth.mockImplementation(() => {return {flag: true, cause: 'message'}})
    
    Group.findOne.mockResolvedValueOnce(retrievedGroup)
    User.findOne.mockResolvedValueOnce(existingUser);
    Group.findOne.mockResolvedValueOnce(retrievedGroup)
        
    const req = {
      params: {name: retrievedGroup.name}, 
      body:{emails: [existingUser.email]},
      cookies:{
        accessToken : 'Token1',
        refreshToken : 'Token1'
      } 
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals:{
        "refreshedTokenMessage" : "ok"
      }
    };

    await removeFromGroup(req,res);
      
    expect(res.status).toHaveBeenCalledWith(400);
  })

  
  test("should return a 401 error if called by an authenticated user who is not part of the group (authType = Group) if the route is `api/groups/:name/remove", async () => {

    utils.verifyAuth.mockReturnValueOnce({flag: false, cause: 'Wrong Group auth request'})
    utils.verifyAuth.mockReturnValueOnce({ flag: true});

    Group.findOne.mockResolvedValue(retrievedGroup2);
        
    const req = {
      params: {name: retrievedGroup.name}, 
      body:{emails: ["user1@user.com"]},
      path: "/groups/" + retrievedGroup.name + "/remove",
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals:{
        "refreshedTokenMessage" : "ok"
      }
    };

    await removeFromGroup(req,res);
      
    expect(res.status).toHaveBeenCalledWith(401);
  })

  

  
  test("should return a 401 error if called by an authenticated user who is not an admin (authType = Admin) if the route is `api/groups/:name/pull`", async () => {

    utils.verifyAuth.mockReturnValueOnce({flag: true})
    utils.verifyAuth.mockReturnValueOnce({ flag: false, cause: 'Wrong Admin auth request'});

    Group.findOne.mockResolvedValueOnce(retrievedGroup2);
        
    const req = {
      params: {name: retrievedGroup.name}, 
      body:{emails: ["user1@user.com"]},
      path: "/groups/" + retrievedGroup.name + "/pull",
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals:{
        "refreshedTokenMessage" : "ok"
      }
    };

    await removeFromGroup(req,res);
      
    expect(res.status).toHaveBeenCalledWith(401);

  })

  
   
  test("should return 200 status and group information if user can be removed to group", async () => {

    utils.verifyAuth.mockReturnValueOnce({flag: true, cause: 'message'})
    
    Group.findOne.mockResolvedValueOnce(retrievedGroup2)

    User.findOne.mockResolvedValueOnce(userTwo);
    
    Group.findOne.mockResolvedValueOnce(true);
    
    Group.findOneAndUpdate.mockResolvedValueOnce(retrievedGroup2);
        
    const req = {
      params: {name: retrievedGroup2.name}, 
      body:{emails: [userTwo.email]},
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals:{
        "refreshedTokenMessage" : "ok"
      }
    };

    await removeFromGroup(req,res);
      
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ 
      data: { 
        group: retrievedGroup2, 
        notInGroup: [], 
        membersNotFound: [] 
      }, 
      message: "Members removed", 
      refreshedTokenMessage: res.locals.refreshedTokenMessage 
    });
  })

})

describe("deleteUser", () => {
  
  test("should return a 400 error if the request body does not contain all the necessary attributes", async () => {
    utils.verifyAuth.mockReturnValueOnce({flag: true, cause: 'message'})
    const req = {
      body:{},
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals:{
        "refreshedTokenMessage" : "ok"
      }
    };

    await deleteUser(req,res);
    expect(res.status).toHaveBeenCalledWith(400);

  })

  
  test("should return a 400 error if the name passed in the request body is an empty string", async () => {
    utils.verifyAuth.mockReturnValueOnce({flag: true, cause: 'message'})
    const req = {
      body:{email: ""},
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals:{
        "refreshedTokenMessage" : "ok"
      }
    };

    await deleteUser(req,res);
    expect(res.status).toHaveBeenCalledWith(400);

  })

  test("should return a 400 error if the email passed in the request body is not in correct email format", async () => {

    utils.verifyAuth.mockReturnValueOnce({flag: true, cause: 'message'})
    const req = {
      body:{email: "no_existed_user2@"},
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals:{
        "refreshedTokenMessage" : "ok"
      }
    };

    await deleteUser(req,res);
    expect(res.status).toHaveBeenCalledWith(400);

  })

  
  test("should return a 400 error if the email passed in the request body does not represent a user in the database", async () => {

    utils.verifyAuth.mockReturnValueOnce({flag: true, cause: 'message'})
    User.findOne.mockResolvedValueOnce(null);

    const req = {
      body:{email: userOne.email},
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals:{
        "refreshedTokenMessage" : "ok"
      }
    };

    await deleteUser(req,res);
    expect(res.status).toHaveBeenCalledWith(400);

  })
  
  
  test("should return a 401 error if called by an authenticated user who is not an admin (authType = Admin)", async () => {

    utils.verifyAuth.mockReturnValueOnce({flag: false, cause: 'Wrong Admin auth request'})
    User.findOne.mockResolvedValueOnce(null);

    const req = {
      body:{email: userOne.email},
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      path: "/groups/" + retrievedGroup.name + "/remove",
      locals:{
        "refreshedTokenMessage" : "ok"
      }
    };

    await deleteUser(req, res);
    expect(res.status).toHaveBeenCalledWith(401);

  })

  
  test("should return 200 status code if email is deleted by Admin", async () => {

    utils.verifyAuth.mockReturnValueOnce({flag: true, cause: 'message'})
    
    User.findOne.mockReturnValueOnce(userOne);

    jest.spyOn(transactions, "deleteMany").mockReturnValueOnce({ deletedCount: 1 });
    Group.deleteMany.mockReturnValueOnce({ deletedCount: 1 });
    User.deleteOne.mockReturnValueOnce({ deletedCount: 1 });

    const req = {
      body:{email: userOne.email},
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals:{
        "refreshedTokenMessage" : "ok"
      }
    };

    await deleteUser(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({"data": {deletedTransactions:1, deletedFromGroup: true}, message: "User deleted", "refreshedTokenMessage":"ok"});

  })

})

describe("deleteGroup", () => {
  beforeEach(async () => {
  });
  afterEach(() => {
  });
  

  test("should return a 401 error if called by an authenticated user who is not an admin (authType = Admin)", async () => {

    utils.verifyAuth.mockReturnValueOnce({flag: false, cause: 'Wrong Admin auth request'})
    Group.findOne.mockReturnValueOnce(retrievedGroup);

    const req = {
      body:{name: retrievedGroup.name},
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals:{
        "refreshedTokenMessage" : "ok"
      }
    };

    await deleteGroup(req, res);
    expect(res.status).toHaveBeenCalledWith(401);

  })

  
  test("should return a 400 error if the request body does not contain all the necessary attributes", async () => {

    utils.verifyAuth.mockReturnValueOnce({flag: true, cause: 'message'})

    const req = {
      body:{},
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals:{
        "refreshedTokenMessage" : "ok"
      }
    };

    await deleteGroup(req, res);
    expect(res.status).toHaveBeenCalledWith(400);

  })

  
  test("should return a 400 error if the name passed in the request body is an empty string", async () => {
    utils.verifyAuth.mockReturnValueOnce({flag: true, cause: 'message'})

    const req = {
      body:{name: ""},
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals:{
        "refreshedTokenMessage" : "ok"
      }
    };

    await deleteGroup(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  })

  
  test("should return a 400 error if the name passed in the request body does not represent a group in the database", async () => {

    utils.verifyAuth.mockReturnValueOnce({flag: true, cause: 'message'})
    Group.findOne.mockReturnValueOnce(null);

    const req = {
      body:{name: "not_existed_group"},
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals:{
        "refreshedTokenMessage" : "ok"
      }
    };

    await deleteGroup(req, res);
    expect(res.status).toHaveBeenCalledWith(400);

  })

  
  test("should return 200 status code if group is deleted by Admin", async () => {

    utils.verifyAuth.mockReturnValueOnce({flag: true, cause: 'message'})
    Group.findOne.mockReturnValueOnce(retrievedGroup);
    Group.deleteOne.mockReturnValueOnce(true);

    const req = {
      body:{name: retrievedGroup.name},
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals:{
        "refreshedTokenMessage" : "ok"
      }
    };

    await deleteGroup(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ data: {message: "Group deleted successfully"}, refreshedTokenMessage: res.locals.refreshedTokenMessage });
    
  })
})