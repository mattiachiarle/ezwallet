import { User, Group } from '../models/User.js';
import { transactions } from '../models/model';
import * as utils from '../controllers/utils.js';
import jwt from 'jsonwebtoken';
import mongoose from "mongoose";
import { createGroup, getGroup, getGroups, getUser, getUsers, addToGroup, removeFromGroup, deleteUser, deleteGroup } from  '../controllers/users.js'

jest.mock("../controllers/utils")
jest.mock("../models/model")
jest.mock("../models/User")

// jest.mock('../models/User', () => ({
//   Group: {create: jest.fn(), findOne: jest.fn(), find: jest.fn(), findOneAndUpdate: jest.fn(), deleteMany: jest.fn(), deleteOne:jest.fn()},
//   User: {create: jest.fn(), findOne: jest.fn(), find: jest.fn(), findOneAndUpdate: jest.fn(), deleteMany: jest.fn(), deleteOne:jest.fn()}
// }));

let userOneId = new mongoose.Types.ObjectId();
let userTwoId = new mongoose.Types.ObjectId();
let userOne = { username: 'user', email: 'user@user.com', password: '', role: 'Regular' }
let userTwo = { username: 'user2', email: 'user2@user.com', password: '', role: 'Regular' }

const retrievedGroup = { name: 'group1', members: [{ email: userOne.email, user: userOneId }] };
const retrievedGroup2 = { name: 'group2', members: [{ email: userOne.email, user: userOneId }, { email: userTwo.email, user: userTwoId }]};
const retrievedGroup3 = { name: 'group3', members: [userOne] };
const retrievedGroup4 = { name: 'group4', members: [userOne, userTwo]};
const retrievedGroup5 = { name : 'group5', members: [userTwo]};

beforeEach(() => {
  jest.resetAllMocks(); // Reset all mocks before each test
});

describe ("getUsers", () => {
  test("should return 401 error because is not called by an admin", async () => {
    utils.verifyAuth.mockImplementationOnce(() => {
      return {flag: false, cause: 'message'}
    })

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
  test('DB search goes wrong',async () => {
    utils.verifyAuth.mockImplementationOnce(() => {
      return {flag: true, cause: 'message'}
    })
  
    jest.spyOn(User, "find").mockImplementationOnce(() =>{
      throw new Error("Generic error")
    });

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

    expect(res.status).toHaveBeenCalledWith(500);

  })
})

describe ("getUser", () => { 
  
  test("getUser called by the same user", async () => {
    const retrievedUser = { username: 'user', email: 'user@user.com', role: 'Regular'};
    
    utils.verifyAuth.mockImplementationOnce(() =>{ //called by a user
      return {flag: true, cause: 'message'}
    })
    utils.verifyAuth.mockImplementationOnce(() =>{ //not called by an admin
      return {flag: false, cause: 'message'}
    })
    jest.spyOn(User, "findOne").mockImplementationOnce(() => (retrievedUser));
    
    const req = { params: {username: retrievedUser.username} };
    const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
        locals:{
          "refreshedTokenMessage" : "ok"
        }
    };

    
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

  test("DB search goes wrong", async () => {
    const retrievedUser = { username: 'user', email: 'user@user.com', role: 'Regular'};
    
    utils.verifyAuth.mockImplementationOnce(() =>{ //called by a user
      return {flag: true, cause: 'message'}
    })
    utils.verifyAuth.mockImplementationOnce(() =>{ //not called by an admin
      return {flag: false, cause: 'message'}
    })
    jest.spyOn(User, "findOne").mockImplementationOnce(() => {throw new Error("Generic error")});
    
    const req = { params: {username: retrievedUser.username} };
    const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
        locals:{
          "refreshedTokenMessage" : "not ok"
        }
    };

    
    await getUser(req,res);
      

    expect(res.status).toHaveBeenCalledWith(500);
  });
})

describe("createGroup", () => { 

  test ("Successful group creation", async () => {
    utils.verifyAuth.mockImplementationOnce(() => { return {flag: true, cause: 'message'} });
    jest.spyOn(jwt,"verify").mockImplementationOnce(() => (retrievedGroup4.members[0]))
    jest.spyOn(Group,"findOne").mockImplementationOnce(() => null); //the creator isn't in another group
    jest.spyOn(Group,"findOne").mockImplementationOnce(() => null); //the group doesn't already exist

    // first user
    jest.spyOn(User,"findOne").mockResolvedValueOnce(userOne);
    jest.spyOn(Group, "findOne").mockResolvedValueOnce(null);

    // second user
    jest.spyOn(User,"findOne").mockResolvedValueOnce(userTwo);
    jest.spyOn(Group, "findOne").mockResolvedValueOnce(null);


    jest.spyOn(Group, "create").mockResolvedValueOnce(retrievedGroup4);

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
      locals:{ "refreshedTokenMessage" : "ok" }
    };

    await createGroup(req,res);
      
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      data: { 
        group: { 
          name: retrievedGroup4.name, 
          members: [{email: retrievedGroup4.members[0].email},{email: retrievedGroup4.members[1].email}]
        }, 
        membersNotFound: [], 
        alreadyInGroup: [] 
      },
      refreshedTokenMessage: expect.any(String)
    });

  });

  test ("Missing parameters", async () => {
    
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
  
  test ("Missing member parameter", async () => {
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
  
  test ("Missing name parameter", async () => {
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
  
  test ("Name parameter is an empty string", async () => {
    const req = { 
      body:{ 
        "name" : ' ',
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

  test ("Group already existed", async () => {
    utils.verifyAuth.mockImplementation(() => {
      return {flag: true, cause: 'message'}
    })
    jest.spyOn(jwt,"verify").mockImplementation(() => (retrievedGroup4.members[0]))
    jest.spyOn(Group,"findOne").mockImplementationOnce(() => null); //the creator isn't in another group
    jest.spyOn(Group,"findOne").mockImplementationOnce(() => retrievedGroup4); //the group doesn't already exist
 

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
  
  test ("Not authorized", async () => {
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
  
  test ("Creator already in a group", async () => {
    utils.verifyAuth.mockImplementation(() => {
      return {flag: true, cause: 'message'}
    })
    jest.spyOn(jwt,"verify").mockImplementation(() => (retrievedGroup4.members[0]))
    jest.spyOn(Group,"findOne").mockImplementationOnce(() => retrievedGroup4); //the creator is in another group
    
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

  test("All members already in a group(except the creator)", async () => {
    utils.verifyAuth.mockImplementationOnce(() => { return {flag: true, cause: 'message'}});
    jest.spyOn(jwt,"verify").mockImplementationOnce(() => (userOne))
    jest.spyOn(Group,"findOne").mockImplementationOnce(() => null); //the creator isn't in an other group
    jest.spyOn(Group,"findOne").mockImplementationOnce(() => null); //the group doesn't already exist
    
    // Creator
    jest.spyOn(User,"findOne").mockResolvedValueOnce(userOne);
    jest.spyOn(Group, "findOne").mockResolvedValueOnce(null);

    // New user
    jest.spyOn(User,"findOne").mockResolvedValueOnce(userTwo);
    jest.spyOn(Group,"findOne").mockResolvedValueOnce(retrievedGroup2);

    const req = { 
      body:{ 
        "name" : retrievedGroup4.name,
        "memberEmails" : [userTwo.email]
      },
      cookies:{
        accessToken : 'Token1',
        refreshToken : 'Token1'
      } 
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals:{ "refreshedTokenMessage" : "not ok" }
    };

    await createGroup(req,res);
      
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        error: expect.any(String)
    }));
  });
  
  test("All members doesn't exist(except the creator)", async () => {
    utils.verifyAuth.mockImplementationOnce(() => { return {flag: true, cause: 'message'}});
    jest.spyOn(jwt,"verify").mockImplementationOnce(() => (userOne))
    jest.spyOn(Group,"findOne").mockImplementationOnce(() => null); //the creator isn't in an other group
    jest.spyOn(Group,"findOne").mockImplementationOnce(() => null); //the group doesn't already exist
    
    // Creator
    jest.spyOn(User,"findOne").mockResolvedValueOnce(userOne);
    jest.spyOn(Group,"findOne").mockResolvedValueOnce(null);

    // New user
    jest.spyOn(User,"findOne").mockResolvedValueOnce(null);
    jest.spyOn(Group,"findOne").mockResolvedValueOnce(null);

    const req = { 
      body:{ 
        "name" : retrievedGroup4.name,
        "memberEmails" : [userTwo.email]
      },
      cookies:{
        accessToken : 'Token1',
        refreshToken : 'Token1'
      } 
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals:{ "refreshedTokenMessage" : "not ok" }
    };

    await createGroup(req,res);
      
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        error: expect.any(String)
    }));
  });

  test ("At least one member emails is an empty string", async () => {
    let errUserOne = {...userOne, email:""};
    let errRetrievedGroup4 = {...retrievedGroup4};
    errRetrievedGroup4.members = [...errRetrievedGroup4.members, errUserOne]
    
    utils.verifyAuth.mockImplementation(() => {
      return {flag: true, cause: 'message'}
    })
    jest.spyOn(jwt,"verify").mockImplementation(() => (errRetrievedGroup4.members[0]))
    jest.spyOn(Group,"findOne").mockImplementationOnce(() => null); //the creator isn't in an other group
    jest.spyOn(Group,"findOne").mockImplementationOnce(() => null); //the group doesn't already exist
    let userFindOneCalledTimes = 0;
    jest.spyOn(User,"findOne").mockImplementation(() => {
      return errRetrievedGroup4.members[userFindOneCalledTimes++]; //all the users exist
    });
    jest.spyOn(Group, "findOne").mockImplementation(() => {
        return null; // all the users aren't in another group
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
  
  test ("At least one member emails is with uncorrect format", async () => {
    let errUserOne = {...userOne, email:"ciao.com"};
    let errRetrievedGroup4 = {...retrievedGroup4};
    errRetrievedGroup4.members = [...errRetrievedGroup4.members, errUserOne]
    
    utils.verifyAuth.mockImplementation(() => {
      return {flag: true, cause: 'message'}
    })
    jest.spyOn(jwt,"verify").mockImplementation(() => (errRetrievedGroup4.members[0]));
    jest.spyOn(Group,"findOne").mockImplementationOnce(() => null); //the creator isn't in an other group
    jest.spyOn(Group,"findOne").mockImplementationOnce(() => null); //the group doesn't already exist
    let userFindOneCalledTimes = 0;
    jest.spyOn(User,"findOne").mockImplementation(() => {
      return errRetrievedGroup4.members[userFindOneCalledTimes++]; //all the users exist
    });
    jest.spyOn(Group, "findOne").mockImplementation(() => {
        return null; // all the users aren't in another group
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

  test ("DB insertion goes wrong", async () => {
    utils.verifyAuth.mockImplementationOnce(() => {
      return {flag: true, cause: 'message'}
    })
    jest.spyOn(jwt,"verify").mockImplementationOnce(() => (retrievedGroup4.members[0]))
    jest.spyOn(Group,"findOne").mockImplementationOnce(() => null); //the creator isn't in another group
    jest.spyOn(Group,"findOne").mockImplementationOnce(() => null); //the group doesn't already exist
    let userFindOneCalledTimes = 0;
    jest.spyOn(User,"findOne").mockImplementation(() => {
      return retrievedGroup4.members[userFindOneCalledTimes++]; //all the users exist
    });
    jest.spyOn(Group, "findOne").mockImplementation(() => {
        return null; // all the users aren't in another group
    });

    Group.create.mockResolvedValueOnce(()=>{throw new Error("Generic error")});

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
      
    expect(res.status).toHaveBeenCalledWith(500);

  });
})

describe ("getGroups", () => { 
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
  test("DB search goes wrong", async () => {

    utils.verifyAuth.mockImplementation(() => {
      return {flag: true, cause: 'message'}
    })

    jest.spyOn(Group, "find").mockImplementation(()=>{throw new Error("Generic error")});

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

    expect(res.status).toHaveBeenCalledWith(500);
  });
})

describe ("getGroup", () => {
  test("Group returned (called by a user)", async () => {

    jest.spyOn(Group, "findOne").mockImplementation(()=>(retrievedGroup4));

    utils.verifyAuth.mockImplementationOnce(() => {
      return {flag: true, cause: 'message'}
    });
    utils.verifyAuth.mockImplementationOnce(() => {
      return {flag: false, cause: 'message'}
    });

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
  
  test("Group returned (called by an admin)", async () => {

    jest.spyOn(Group, "findOne").mockImplementation(()=>(retrievedGroup4));

    utils.verifyAuth.mockImplementationOnce(() => {
      return {flag: false, cause: 'message'}
    });
    utils.verifyAuth.mockImplementationOnce(() => {
      return {flag: true, cause: 'message'}
    });

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

    utils.verifyAuth.mockImplementationOnce(() => {
      return {flag: true, cause: 'message'}
    });
    utils.verifyAuth.mockImplementationOnce(() => {
      return {flag: false, cause: 'message'}
    });

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

  test("Group returned (called by a user)", async () => {

    jest.spyOn(Group, "findOne").mockImplementation(()=>{throw new Error("Generic error")});

    utils.verifyAuth.mockImplementationOnce(() => {
      return {flag: true, cause: 'message'}
    });
    utils.verifyAuth.mockImplementationOnce(() => {
      return {flag: false, cause: 'message'}
    });

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

    expect(res.status).toHaveBeenCalledWith(500);

  });

})

describe ("addToGroup", () => {
  test("should return a 400 error if the request body does not contain all the necessary attributes", async () => {
    const req = {
      params: { name: retrievedGroup.name }, 
      body:{ }
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: {refreshedTokenMessage: "ok"}
    };

    await addToGroup(req,res);
      
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        error: expect.any(String)
    }));
  });

  test("should return 400 error if there are not existed group", async () => {
    jest.spyOn(utils,"verifyAuth").mockReturnValueOnce({ flag: true });
    jest.spyOn(utils,"verifyAuth").mockReturnValueOnce({ flag: true });
    jest.spyOn(User, "findOne").mockResolvedValueOnce(null);
    
    const req = {
      params: { name: "not_existing_group" }, 
      body: { emails: [userTwo.email] }
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals:{ "refreshedTokenMessage" : "ok" }
    };

    await addToGroup(req,res);
      
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        error: expect.any(String)
    }));
  });

  test("should return 400 error if all the users were already in a group", async () => {
    jest.spyOn(utils,"verifyAuth").mockReturnValueOnce({ flag: true });
    jest.spyOn(utils,"verifyAuth").mockReturnValueOnce({ flag: true });
    jest.spyOn(Group,"findOne").mockResolvedValueOnce(retrievedGroup);
    jest.spyOn(User,"findOne").mockResolvedValue(userOne);
        
    const req = {
      params: {name: retrievedGroup.name}, 
      body:{emails: [userOne.email]}
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals:{ "refreshedTokenMessage" : "ok" }
    };

    await addToGroup(req,res);
      
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        error: expect.any(String)
    }));
  });
    
  test("should return 400 error if all the users are not-existing", async () => {
    jest.spyOn(utils,"verifyAuth").mockReturnValueOnce({ flag: true });
    jest.spyOn(utils,"verifyAuth").mockReturnValueOnce({ flag: true });
    jest.spyOn(Group,"findOne").mockResolvedValueOnce(retrievedGroup);
    jest.spyOn(User,"findOne").mockResolvedValue(null);
        
    const req = {
      params: {name: retrievedGroup.name}, 
      body:{emails: ["not_existed_user@user.com"]}
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals:{ "refreshedTokenMessage" : "ok" }
    };

    await addToGroup(req,res);
      
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        error: expect.any(String)
    }));
  });
  
  test("should return a 400 error if at least one of the member emails is not in a valid email format", async () => {
    jest.spyOn(utils,"verifyAuth").mockReturnValueOnce({ flag: true });
    jest.spyOn(utils,"verifyAuth").mockReturnValueOnce({ flag: true });
    jest.spyOn(Group,"findOne").mockResolvedValueOnce(retrievedGroup);
    jest.spyOn(User,"findOne").mockResolvedValue(userOne);
        
    const req = {
      params: {name: retrievedGroup.name}, 
      body:{emails: ["no_existed_user1", "no_existed_user2@", ".com"]}
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals:{ "refreshedTokenMessage" : "ok" }
    };

    await addToGroup(req,res);
      
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        error: expect.any(String)
    }));
  });
  
  test("should return a 400 error if at least one of the member emails is an empty string", async () => {
    jest.spyOn(utils,"verifyAuth").mockReturnValueOnce({ flag: true });
    jest.spyOn(utils,"verifyAuth").mockReturnValueOnce({ flag: true });
    jest.spyOn(Group,"findOne").mockResolvedValueOnce(retrievedGroup);
    jest.spyOn(User,"findOne").mockResolvedValue(userOne);
        
    const req = {
      params: {name: retrievedGroup.name}, 
      body:{emails: [""]}
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals:{ "refreshedTokenMessage" : "ok" }
    };

    await addToGroup(req,res);
      
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        error: expect.any(String)
    }));
  });
  
  test("should return a 400 error if the array emails is empty", async () => {
    jest.spyOn(utils,"verifyAuth").mockReturnValueOnce({ flag: true });
    jest.spyOn(utils,"verifyAuth").mockReturnValueOnce({ flag: true });
    jest.spyOn(Group,"findOne").mockResolvedValueOnce(retrievedGroup);
    jest.spyOn(User,"findOne").mockResolvedValue(userOne);
        
    const req = {
      params: { name: retrievedGroup.name }, 
      body:{ emails: [] }
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals:{ "refreshedTokenMessage" : "ok" }
    };

    await addToGroup(req,res);
      
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        error: expect.any(String)
    }));
  });

  test("should return a 400 error if the group name is empty", async () => {
    jest.spyOn(utils,"verifyAuth").mockReturnValueOnce({ flag: true });
    jest.spyOn(utils,"verifyAuth").mockReturnValueOnce({ flag: true });

    const req = {
      params: {name: " "}, 
      body:{ "emails" : [userOne.email] }
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals:{ "refreshedTokenMessage" : "ok" }
    };

    await addToGroup(req,res);
      
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        error: expect.any(String)
    }));
  });
  
  test("should return a 401 error if called by an authenticated user who is not part of the group (authType = Group) if the route is `api/groups/:name/add`", async () => {
    jest.spyOn(utils,"verifyAuth").mockReturnValueOnce({ flag: false, cause: 'Wrong Group auth request' });
    jest.spyOn(utils,"verifyAuth").mockReturnValueOnce({ flag: true });
    jest.spyOn(Group,"findOne").mockResolvedValueOnce(retrievedGroup);
        
    const req = {
      params: { name: retrievedGroup.name }, 
      body:{ emails: [userOne.email] },
      path: "/groups/" + retrievedGroup.name + "/add",
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals:{ "refreshedTokenMessage" : "ok" }
    };

    await addToGroup(req,res);
      
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        error: expect.any(String)
    }));
  });
  
  test("should return a 401 error if called by an authenticated user who is not an admin (authType = Admin) if the route is `api/groups/:name/insert`", async () => {
    jest.spyOn(utils,"verifyAuth").mockReturnValueOnce({ flag: true });
    jest.spyOn(utils,"verifyAuth").mockReturnValueOnce({ flag: false, cause: 'Wrong Admin auth request' });
    jest.spyOn(Group,"findOne").mockResolvedValueOnce(retrievedGroup);
        
    const req = {
      params: {name: retrievedGroup.name}, 
      body:{emails: [userOne.email]},
      path: "/groups/" + retrievedGroup.name + "/insert",
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals:{ "refreshedTokenMessage" : "ok" }
    };

    await addToGroup(req,res);
      
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        error: expect.any(String)
    }));
  });

  test("should return 200 status and group information if user can be joined to group", async () => {
    jest.spyOn(utils,"verifyAuth").mockReturnValueOnce({ flag: true });
    jest.spyOn(utils,"verifyAuth").mockReturnValueOnce({ flag: true });

    const newUser = { email: 'user1@user.com', username: 'user1' };
  
    jest.spyOn(Group,"findOne").mockResolvedValueOnce(retrievedGroup);
    jest.spyOn(User,"findOne").mockResolvedValueOnce(newUser);

    let updatedGroup = {
      name: "group1",
      members: [
        {email: userOne.email, user: userOneId},
        {email: newUser.email, user: userOneId}
      ]};

    jest.spyOn(Group,"findOne").mockResolvedValueOnce(null);
    jest.spyOn(Group,"findOneAndUpdate").mockResolvedValueOnce(updatedGroup);
        
    const req = {
      params: {name: retrievedGroup.name}, 
      body:{emails: [newUser.email]}
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals:{ "refreshedTokenMessage" : "ok" }
    };

    await addToGroup(req,res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      data : { group: updatedGroup, alreadyInGroup: [], membersNotFound: [] },
      message : "New members added",
      refreshedTokenMessage : expect.any(String)
    });
  });
  
  test('DB insertion goes wrong', async () => {
    jest.spyOn(utils,"verifyAuth").mockReturnValueOnce({ flag: true });
    jest.spyOn(utils,"verifyAuth").mockReturnValueOnce({ flag: true });

    const newUser = { email: 'user1@user.com', username: 'user1' };
  
    jest.spyOn(Group,"findOne").mockResolvedValueOnce(retrievedGroup);
    jest.spyOn(User,"findOne").mockResolvedValueOnce(newUser);

    let updatedGroup = {
      name: "group1",
      members: [
        {email: userOne.email, user: userOneId},
        {email: newUser.email, user: userOneId}
      ]};

    jest.spyOn(Group,"findOne").mockResolvedValueOnce(null);
    jest.spyOn(Group,"findOneAndUpdate").mockImplementationOnce(() => {throw new Error("Generic error")});
        
    const req = {
      params: {name: retrievedGroup.name}, 
      body:{emails: [newUser.email]}
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals:{ "refreshedTokenMessage" : "ok" }
    };

    await addToGroup(req,res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        error: expect.any(String)
    }));
  });
});
  
describe ("removeFromGroup", () => {
  test("should return a 400 error if the request body does not contain all the necessary attributes", async () => {

    const req = {
      params: {name: retrievedGroup.name}, 
      body:{  },
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals:{ "refreshedTokenMessage" : "ok" }
    };

    await removeFromGroup(req,res);
      
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        error: expect.any(String)
    }));
  });
  
  test("should return 400 error if the group name in parameters does not represet a group in the DB", async () => {
    jest.spyOn(utils,"verifyAuth").mockReturnValueOnce({ flag: true });
    jest.spyOn(utils,"verifyAuth").mockReturnValueOnce({ flag: true });
    jest.spyOn(Group,"findOne").mockResolvedValueOnce(null);
    
    const req = {
      params: { name: "not_existed_group" }, 
      body:{ emails: [userTwo.email] }
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals:{ "refreshedTokenMessage" : "ok" }
    };

    await removeFromGroup(req,res);
      
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        error: expect.any(String)
    }));
  });
  
  test("should return 400 error if the group name is not passed", async () => {
   
    const req = {
      params: { }, 
      body:{ emails: [userTwo.email] }
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals:{ "refreshedTokenMessage" : "ok" }
    };

    await removeFromGroup(req,res);
      
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        error: expect.any(String)
    }));
  });
  
  test("should return 400 error if all the emails represent not-existing users", async () => {
    jest.spyOn(utils,"verifyAuth").mockReturnValueOnce({ flag: true });
    jest.spyOn(utils,"verifyAuth").mockReturnValueOnce({ flag: true });
    jest.spyOn(Group,"findOne").mockResolvedValueOnce(retrievedGroup2);
    jest.spyOn(User,"findOne").mockResolvedValueOnce(null);
        
    const req = {
      params: {name: retrievedGroup2.name}, 
      body:{emails: ["not_existed_user@user.com"]}
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals:{ "refreshedTokenMessage" : "ok" }
    };

    await removeFromGroup(req,res);
      
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        error: expect.any(String)
    }));
  });

  test("should return 400 error if all the emails represent users not in the group ", async () => {
    jest.spyOn(utils,"verifyAuth").mockReturnValueOnce({ flag: true });
    jest.spyOn(utils,"verifyAuth").mockReturnValueOnce({ flag: true });
    jest.spyOn(Group,"findOne").mockResolvedValueOnce(retrievedGroup2);
    jest.spyOn(User,"findOne").mockResolvedValueOnce(userOne);
    jest.spyOn(Group,"findOne").mockResolvedValueOnce(null);
  
    const req = {
      params: {name: retrievedGroup2.name}, 
      body:{emails: ["not_joined@user.com"]}
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals:{ "refreshedTokenMessage" : "ok" }
    };

    await removeFromGroup(req,res);
      
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        error: expect.any(String)
    }));
  });
  
  test("should return 400 error if trying to remove the owner", async () => {
    jest.spyOn(utils,"verifyAuth").mockReturnValueOnce({ flag: true });
    jest.spyOn(utils,"verifyAuth").mockReturnValueOnce({ flag: true });
    jest.spyOn(Group,"findOne").mockResolvedValueOnce(retrievedGroup2);
    jest.spyOn(User,"findOne").mockResolvedValueOnce(userOne);
    jest.spyOn(Group,"findOne").mockResolvedValueOnce(retrievedGroup2);
  
    const req = {
      params: {name: retrievedGroup2.name}, 
      body:{emails: [ userOne.email ]}
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals:{ "refreshedTokenMessage" : "ok" }
    };

    await removeFromGroup(req,res);
      
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        error: expect.any(String)
    }));
  });

  test("should return a 400 error if at least one of the member emails is not in a valid email format", async () => {
    jest.spyOn(utils,"verifyAuth").mockReturnValueOnce({ flag: true });
    jest.spyOn(utils,"verifyAuth").mockReturnValueOnce({ flag: true });
    jest.spyOn(Group,"findOne").mockResolvedValueOnce(retrievedGroup2);
        
    const req = {
      params: { name: retrievedGroup2.name }, 
      body:{ emails: ["no_existed_user1", "no_existed_user2@", ".com"] }
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals:{ "refreshedTokenMessage" : "ok" }
    };

    await removeFromGroup(req,res);
      
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        error: expect.any(String)
    }));
  });

  test("should return a 400 error if at least one of the member emails is an empty string", async () => {
    jest.spyOn(utils,"verifyAuth").mockReturnValueOnce({ flag: true });
    jest.spyOn(utils,"verifyAuth").mockReturnValueOnce({ flag: true });
    jest.spyOn(Group,"findOne").mockResolvedValueOnce(retrievedGroup2);
        
    const req = {
      params: {name: retrievedGroup2.name}, 
      body:{emails: [""]}
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals:{ "refreshedTokenMessage" : "ok" }
    };

    await removeFromGroup(req,res);
      
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        error: expect.any(String)
    }));
  });
  
  test("should return a 400 error if the member emails array is an empty", async () => {
    jest.spyOn(utils,"verifyAuth").mockReturnValueOnce({ flag: true });
    jest.spyOn(utils,"verifyAuth").mockReturnValueOnce({ flag: true });
    jest.spyOn(Group,"findOne").mockResolvedValueOnce(retrievedGroup);
        
    const req = {
      params: {name: retrievedGroup.name}, 
      body:{emails: []}
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals:{ "refreshedTokenMessage" : "ok" }
    };

    await removeFromGroup(req,res);
      
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        error: expect.any(String)
    }));
  });

  test("should return a 400 error if the group contains only one member before deleting any user", async () => {
    jest.spyOn(utils,"verifyAuth").mockReturnValueOnce({ flag: true });
    jest.spyOn(utils,"verifyAuth").mockReturnValueOnce({ flag: true });
    jest.spyOn(Group,"findOne").mockResolvedValueOnce(retrievedGroup);
    jest.spyOn(User,"findOne").mockResolvedValueOnce(userOne);
    jest.spyOn(Group,"findOne").mockResolvedValueOnce(retrievedGroup);
        
    const req = {
      params: {name: retrievedGroup.name}, 
      body:{emails: [userOne.email]}
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals:{ "refreshedTokenMessage" : "ok" }
    };

    await removeFromGroup(req,res);
      
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        error: expect.any(String)
    }));
  });

  test("should return a 401 error if called by an authenticated user who is not part of the group (authType = Group) if the route is `api/groups/:name/remove", async () => {
    utils.verifyAuth.mockReturnValueOnce({ flag: false, cause: 'Wrong Group auth request'})
    utils.verifyAuth.mockReturnValueOnce({ flag: true});
    jest.spyOn(Group,"findOne").mockResolvedValueOnce(retrievedGroup2);
        
    const req = {
      params: { name: retrievedGroup2.name }, 
      body:{ emails: ["user1@user.com"] },
      path: "/groups/" + retrievedGroup2.name + "/remove",
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals:{ "refreshedTokenMessage" : "ok" }
    };

    await removeFromGroup(req,res);
    
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        error: expect.any(String)
    }));
  });

  test("should return a 401 error if called by an authenticated user who is not an admin (authType = Admin) if the route is `api/groups/:name/pull`", async () => {
    utils.verifyAuth.mockReturnValueOnce({ flag: true});
    utils.verifyAuth.mockReturnValueOnce({ flag: false, cause: 'Wrong Admin auth request'});
    jest.spyOn(Group,"findOne").mockResolvedValueOnce(retrievedGroup2);
        
    const req = {
      params: {name: retrievedGroup2.name}, 
      body:{emails: ["user1@user.com"]},
      path: "/groups/" + retrievedGroup2.name + "/pull",
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals:{ "refreshedTokenMessage" : "ok" }
    };

    await removeFromGroup(req,res);
      
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        error: expect.any(String)
    }));
  });

  test("should return 200 status and group information if user can be removed to group", async () => {
    utils.verifyAuth.mockReturnValueOnce({ flag: true});
    utils.verifyAuth.mockReturnValueOnce({ flag: true});
    jest.spyOn(Group,"findOne").mockResolvedValueOnce(retrievedGroup2);
    jest.spyOn(User,"findOne").mockResolvedValueOnce(userTwo);
    jest.spyOn(Group,"findOne").mockResolvedValueOnce(retrievedGroup2);
    jest.spyOn(Group,"findOneAndUpdate").mockResolvedValueOnce(retrievedGroup2);
        
    const req = {
      params: {name: retrievedGroup2.name}, 
      body:{emails: [userTwo.email]},
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals:{ "refreshedTokenMessage" : "ok" }
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
      refreshedTokenMessage: expect.any(String)
    });
  });
  
  test('DB insertion goes wrong', async () => {
    utils.verifyAuth.mockReturnValueOnce({ flag: true});
    utils.verifyAuth.mockReturnValueOnce({ flag: true});
    jest.spyOn(Group,"findOne").mockResolvedValueOnce(retrievedGroup2);
    jest.spyOn(User,"findOne").mockResolvedValueOnce(userTwo);
    jest.spyOn(Group,"findOne").mockResolvedValueOnce(retrievedGroup2);
    jest.spyOn(Group,"findOneAndUpdate").mockImplementationOnce(() => {throw new Error("Generic error")});
        
    const req = {
      params: {name: retrievedGroup2.name}, 
      body:{emails: [userTwo.email]},
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals:{ "refreshedTokenMessage" : "ok" }
    };

    await removeFromGroup(req,res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        error: expect.any(String)
    }));
  });
});

describe ("deleteUser", () => {
  test("should return a 400 error if the request body does not contain all the necessary attributes", async () => {
    jest.spyOn(utils,"verifyAuth").mockReturnValueOnce({ flag: true });

    const req = {
      body:{ },
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals:{ "refreshedTokenMessage" : "ok" }
    };

    await deleteUser(req,res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        error: expect.any(String)
    }));
  });
  
  test("should return a 400 error if the name passed in the request body is an empty string", async () => {
    jest.spyOn(utils,"verifyAuth").mockReturnValueOnce({ flag: true });

    const req = {
      body:{ email: "" },
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals:{ "refreshedTokenMessage" : "ok" }
    };

    await deleteUser(req,res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        error: expect.any(String)
    }));
  });

  test("should return a 400 error if the email passed in the request body is not in correct email format", async () => {
    jest.spyOn(utils,"verifyAuth").mockReturnValueOnce({ flag: true });

    const req = {
      body:{email: "no_existed_user2@"},
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals:{ "refreshedTokenMessage" : "ok" }
    };

    await deleteUser(req,res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        error: expect.any(String)
    }));
  });
  
  test("should return a 400 error if the email passed in the request body does not represent a user in the database", async () => {
    jest.spyOn(utils,"verifyAuth").mockReturnValueOnce({ flag: true });
    jest.spyOn(User,"findOne").mockResolvedValueOnce(null);

    const req = {
      body:{email: userOne.email},
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals:{ "refreshedTokenMessage" : "ok" }
    };

    await deleteUser(req,res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        error: expect.any(String)
    }));
  });
  
  test("should return a 401 error if called by an authenticated user who is not an admin (authType = Admin)", async () => {
    jest.spyOn(utils,"verifyAuth").mockReturnValueOnce({ flag: false, cause: 'Wrong Admin auth request' });

    const req = {
      body:{email: userOne.email},
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      path: "/groups/" + retrievedGroup.name + "/remove",
      locals:{ "refreshedTokenMessage" : "ok" }
    };

    await deleteUser(req, res);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        error: expect.any(String)
    }));
  });

  test("should return 200 status code if email is deleted by Admin", async () => {
    jest.spyOn(utils,"verifyAuth").mockReturnValueOnce({ flag: true });
    jest.spyOn(User,"findOne").mockResolvedValueOnce(userOne);

    jest.spyOn(transactions, "deleteMany").mockResolvedValueOnce({ deletedCount: 1 });
    jest.spyOn(Group, "deleteMany").mockResolvedValueOnce({ deletedCount: 1 });
    jest.spyOn(User, "deleteOne").mockResolvedValueOnce({ deletedCount: 1 });

    const req = {
      body:{email: userOne.email},
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals:{ "refreshedTokenMessage" : "ok" }
    };

    await deleteUser(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      data: {deletedTransactions:1, deletedFromGroup: true}, 
      message: "User deleted",
      refreshedTokenMessage: expect.any(String) });
  });

  test("DB deletion goes wrong", async () => {
    jest.spyOn(utils,"verifyAuth").mockReturnValueOnce({ flag: true });
    jest.spyOn(User,"findOne").mockResolvedValueOnce(userOne);

    jest.spyOn(transactions, "deleteMany").mockResolvedValueOnce({ deletedCount: 1 });
    jest.spyOn(Group, "deleteMany").mockResolvedValueOnce({ deletedCount: 1 });
    jest.spyOn(User, "deleteOne").mockImplementationOnce(() => {throw new Error("Generic error")});

    const req = {
      body:{email: userOne.email},
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals:{ "refreshedTokenMessage" : "ok" }
    };

    await deleteUser(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        error: expect.any(String)
    }));
  });
});

describe ("deleteGroup", () => {
  test("should return a 400 error if the request body does not contain all the necessary attributes", async () => {
    jest.spyOn(utils,"verifyAuth").mockReturnValueOnce({ flag: true });

    const req = {
      body:{ },
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals:{ "refreshedTokenMessage" : "ok" }
    };

    await deleteGroup(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        error: expect.any(String)
    }));
  });
  
  test("should return a 400 error if the name passed in the request body is an empty string", async () => {
    jest.spyOn(utils,"verifyAuth").mockReturnValueOnce({ flag: true });

    const req = {
      body:{ name: "" },
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals:{ "refreshedTokenMessage" : "ok" }
    };

    await deleteGroup(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        error: expect.any(String)
    }));
  });

  test("should return a 400 error if the name passed in the request body does not represent a group in the database", async () => {
    jest.spyOn(utils,"verifyAuth").mockReturnValueOnce({ flag: true });
    jest.spyOn(Group,"findOne").mockResolvedValueOnce(null);

    const req = {
      body:{ name: "not_existed_group" },
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals:{ "refreshedTokenMessage" : "ok" }
    };

    await deleteGroup(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        error: expect.any(String)
    }));
  });

  test("should return a 401 error if called by an authenticated user who is not an admin (authType = Admin)", async () => {
    jest.spyOn(utils,"verifyAuth").mockReturnValueOnce({flag: false, cause: 'Wrong Admin auth request'})
    jest.spyOn(Group,"findOne").mockResolvedValueOnce(retrievedGroup);

    const req = {
      body:{ name: retrievedGroup.name },
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals:{ "refreshedTokenMessage" : "ok" }
    };

    await deleteGroup(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        error: expect.any(String)
    }));
  });
  
  test("should return 200 status code if group is deleted by Admin", async () => {
    jest.spyOn(utils,"verifyAuth").mockReturnValueOnce({ flag: true });
    jest.spyOn(Group,"findOne").mockResolvedValueOnce(retrievedGroup);
    jest.spyOn(Group,"deleteOne").mockResolvedValueOnce(true);

    const req = {
      body:{ name: retrievedGroup.name },
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals:{ "refreshedTokenMessage" : "ok" }
    };

    await deleteGroup(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      data: {message: "Group deleted successfully"},
      refreshedTokenMessage: res.locals.refreshedTokenMessage
    });
  });
  
  test("DB deletion gone wrong", async () => {
    jest.spyOn(utils,"verifyAuth").mockReturnValueOnce({ flag: true });
    jest.spyOn(Group,"findOne").mockResolvedValueOnce(retrievedGroup);
    jest.spyOn(Group,"deleteOne").mockImplementationOnce(() => {throw new Error("Generic error")});

    const req = {
      body:{ name: retrievedGroup.name },
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals:{ "refreshedTokenMessage" : "ok" }
    };

    await deleteGroup(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        error: expect.any(String)
    }));
  });
})