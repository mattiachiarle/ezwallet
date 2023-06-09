import { handleDateFilterParams, verifyAuth, handleAmountFilterParams } from '../controllers/utils';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const test_date = '2023-04-30';
const test_start_date_utc = '2023-04-30T00:00:00.000Z';
const test_end_date_utc = '2023-04-30T23:59:59.999Z';

const test_date2 = '2023-05-30';
const test_start_date_utc2 = '2023-05-30T00:00:00.000Z';
const test_end_date_utc2 = '2023-05-30T23:59:59.999Z';

describe("handleDateFilterParams", () => { 
    test('should throw an error if `date` is present in the query parameter together with from or upTo', () => {
        const req_date = { query: { date: test_date, from: '2023-04-10' } };
        expect(() => {handleDateFilterParams(req_date)}).toThrow(/from/);

        const req_date2 = { query: { date: test_date, upTo: '2023-04-10' } };
        expect(() => {handleDateFilterParams(req_date2)}).toThrow(/upTo/);
    });

    
    test('should return filter object with  `$gte` and `$lte` attributes if  `date` is present', () => {
        const req_date = { query: { date: test_date} };
        const retrivedDate = {date: {$gte: new Date(test_date), $lte: new Date(test_end_date_utc)}};
        expect(handleDateFilterParams(req_date)).toEqual(retrivedDate);
    });

    
    test('should return filter object with `$gte` attribute if the query parameters include `from`', () => {
        const req_date = { query: { from: test_date} };
        const retrivedDate = {date: {$gte: new Date(test_start_date_utc)}};
        expect(handleDateFilterParams(req_date)).toEqual(retrivedDate);
    });

    
    test('should return filter object with `$lte` attribute if the query parameters include `upTo`', () => {
        const req_date = { query: { upTo: test_date} };
        const retrivedDate = {date: {$lte: new Date(test_end_date_utc)}};
        expect(handleDateFilterParams(req_date)).toEqual(retrivedDate);
    });

    
    test('should return filter object with `$lte` and `$gte` attribute if the query parameters include `from` and `upTo`', () => {
        const req_date = { query: {from: test_date, upTo: test_date2} };
        const retrivedDate = {date: {$gte: new Date(test_start_date_utc), $lte: new Date(test_end_date_utc2)}};
        expect(handleDateFilterParams(req_date)).toEqual(retrivedDate);
    });

    test('should return an empty object if there is no query parameter', () => {
        let req_date = { query: {} };
        expect(handleDateFilterParams(req_date)).toEqual({});
    });
        
    test('should throw an error if the value of any of the three query parameters is not a string that represents a date in the format **YYYY-MM-DD**', () => {
        const req_date1 = { query: {from: "22-232-11", upTo: "20233344"} };
        expect(() => {handleDateFilterParams(req_date1)}).toThrow();

        const req_date2 = { query: {from: "22-232-11", upTo: "2023-0199"} };
        expect(() => {handleDateFilterParams(req_date2)}).toThrow();

        const req_date3 = { query: {from: "1-1-1", upTo: "2023-mm-dd"} };
        expect(() => {handleDateFilterParams(req_date3)}).toThrow();
    });
    
    test('should throw an error if `date` is not `isVaildDate`', () => {
        const req_date1 = { query: {date:"0999-10-11"} };
        expect(() => {handleDateFilterParams(req_date1)}).toThrow();
    });

    test('should throw an error if `from` is not `isVaildDate`', () => {
        const req_date1 = { query: {from:"3011-13-11"} };
        expect(() => {handleDateFilterParams(req_date1)}).toThrow();
    });

    test('should throw an error if `upTo` is not `isVaildDate`', () => {
        const req_date1 = { query: {upTo:"2024-02-30"} };
        expect(() => {handleDateFilterParams(req_date1)}).toThrow();
    });
})

const unAuthObj = {flag: false, cause: 'Unauthorized'};

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

describe("verifyAuth", () => { 
    test("should return { flag: false, cause: 'Unauthorized' } if request not have cookies", () => {
        const req = {cookies: ''};
        expect(verifyAuth(req, {}, {})).toEqual(unAuthObj);
    });


    test("should return { flag: false, cause: Token is missing information } if accessToken does not include email", () => {

        userOne.refreshToken = jwt.sign({
            email: userOne.email,
            id: "generic id",
            username: userOne.username,
            role: userOne.role
        }, process.env.ACCESS_KEY, { expiresIn: '7d' });

        accessTokenUserOne = jwt.sign({
            email: '',
            id: "generic id",
            username: userOne.username,
            role: userOne.role
          }, process.env.ACCESS_KEY, { expiresIn: '7d' });

        const req = {cookies: {accessToken: accessTokenUserOne, refreshToken: userOne.refreshToken}};
        expect(verifyAuth(req, {}, {})).toEqual({ flag: false, cause: "Token is missing information" });

    });

    test("should return { flag: false, cause: 'Token is missing information' } if refreshToken does not include email", () => {

        userOne.refreshToken = jwt.sign({
            id: "generic id",
            username: userOne.username,
            role: userOne.role
        }, process.env.ACCESS_KEY, { expiresIn: '7d' });

        accessTokenUserOne = jwt.sign({
            email: userOne.email,
            id: "generic id",
            username: userOne.username,
            role: userOne.role
          }, process.env.ACCESS_KEY, { expiresIn: '7d' });

        const req = {cookies: {accessToken: accessTokenUserOne, refreshToken: userOne.refreshToken}};
        expect(verifyAuth(req, {}, {})).toEqual({ flag: false, cause: "Token is missing information" });

    });


    test("should return { flag: false, cause: 'Mismatched users' } if accessToken and refreshToken are not matched", () => {

        userOne.refreshToken = jwt.sign({
            email: userOne.email,
            id: "generic id",
            username: userOne.username,
            role: userOne.role
        }, process.env.ACCESS_KEY, { expiresIn: '7d' });

        accessTokenUserOne = jwt.sign({
            email: userTwo.email,
            id: "generic id",
            username: userOne.username,
            role: userOne.role
          }, process.env.ACCESS_KEY, { expiresIn: '7d' });

        const req = {cookies: {accessToken: accessTokenUserOne, refreshToken: userOne.refreshToken}};
        expect(verifyAuth(req, {}, {})).toEqual({ flag: false, cause: "Mismatched users" });
    });


    test("should return { flag: false, cause: 'Wrong User auth request' } if the accessToken or the refreshToken have a `username` different from the requested one", () => {
        
        userOne.refreshToken = jwt.sign({
            email: userOne.email,
            id: "generic id",
            username: userOne.username,
            role: userOne.role
        }, process.env.ACCESS_KEY, { expiresIn: '7d' });

        accessTokenUserOne = jwt.sign({
            email: userOne.email,
            id: "generic id",
            username: userOne.username,
            role: userOne.role
          }, process.env.ACCESS_KEY, { expiresIn: '7d' });

        const req = {cookies: {accessToken: accessTokenUserOne, refreshToken: userOne.refreshToken}};
        expect(verifyAuth(req, {}, {authType: 'User', username: userTwo.username})).toEqual({ flag: false, cause: "Wrong User auth request" });

    });


    test("should return { flag: false, cause: 'Wrong Admin auth request' } if the accessToken or the refreshToken have a `role` different than admin", () => {
        
        userOne.refreshToken = jwt.sign({
            email: userOne.email,
            id: "generic id",
            username: userOne.username,
            role: userOne.role
        }, process.env.ACCESS_KEY, { expiresIn: '7d' });

        accessTokenUserOne = jwt.sign({
            email: userOne.email,
            id: "generic id",
            username: userOne.username,
            role: userOne.role
          }, process.env.ACCESS_KEY, { expiresIn: '7d' });

        const req = {cookies: {accessToken: accessTokenUserOne, refreshToken: userOne.refreshToken}};

        expect(verifyAuth(req, {}, {authType: 'Admin'})).toEqual({ flag: false, cause: "Wrong Admin auth request" });
    });


    test("should return { flag: false, cause: 'Wrong Group auth request' } if the accessToken or the refreshToken email is not in the member array", () => {
        
        userOne.refreshToken = jwt.sign({
            email: userOne.email,
            id: "generic id",
            username: userOne.username,
            role: userOne.role
        }, process.env.ACCESS_KEY, { expiresIn: '7d' });

        accessTokenUserOne = jwt.sign({
            email: userOne.email,
            id: "generic id",
            username: userOne.username,
            role: userOne.role
          }, process.env.ACCESS_KEY, { expiresIn: '7d' });

        const req = {cookies: {accessToken: accessTokenUserOne, refreshToken: userOne.refreshToken}};

        expect(verifyAuth(req, {}, {authType: 'Group', emails: [userTwo.email]})).toEqual({ flag: false, cause: "Wrong Group auth request" });

    });


    test("should refresh the `accessToken` if it has expired and the `refreshToken` allows authentication; sets the `refreshedTokenMessage` to inform users that the `accessToken` must be changed", () => {

        userOne.refreshToken = jwt.sign({
            email: userOne.email,
            id: "generic id",
            username: userOne.username,
            role: userOne.role
        }, process.env.ACCESS_KEY, { expiresIn: '7d' });

        accessTokenUserOne = jwt.sign({
            email: userOne.email,
            id: "generic id",
            username: userOne.username,
            role: userOne.role
          }, process.env.ACCESS_KEY, { expiresIn: '0s' });

        const cookieMock = (name, value, options) => {
            res.cookieArgs = { name, value, options };
        }

        const req = {cookies: {accessToken: accessTokenUserOne, refreshToken: userOne.refreshToken}};
        const res = {
            cookie: cookieMock,
            locals: {},
        }

        const response = verifyAuth(req, res, { authType: "User", username: userOne.username });
        expect(Object.values(response).includes(true)).toBe(true);
        expect(res.cookieArgs).toEqual({
            name: 'accessToken', //The cookie arguments must have the name set to "accessToken" (value updated)
            value: expect.any(String), //The actual value is unpredictable (jwt string), so it must exist
            options: { //The same options as during creation
                httpOnly: true,
                path: '/api',
                maxAge: 60 * 60 * 1000,
                sameSite: 'none',
                secure: true,
            },
        });
        const message = res.locals.refreshedTokenMessage ? true : res.locals.message ? true : false
        expect(message).toBe(true)

    });

    test("should return {flag: false, cause: 'Perform login again'} if it `refreshToken` is expired", () => {
            
        userOne.refreshToken = jwt.sign({
            email: userOne.email,
            id: "generic id",
            username: userOne.username,
            role: userOne.role
        }, process.env.ACCESS_KEY, { expiresIn: '0s' });

        accessTokenUserOne = jwt.sign({
            email: userOne.email,
            id: "generic id",
            username: userOne.username,
            role: userOne.role
          }, process.env.ACCESS_KEY, { expiresIn: '7d' });

        const req = {cookies: {accessToken: accessTokenUserOne, refreshToken: userOne.refreshToken}};

        expect(verifyAuth(req, {}, { authType: "User", username: userOne.username })).toEqual({ flag: false, cause: "Perform login again" });

    });


    test("should return { flag: true, cause: 'Authorized' } if authentication is valid", () => {

        userOne.refreshToken = jwt.sign({
            email: userOne.email,
            id: "generic id",
            username: userOne.username,
            role: userOne.role
        }, process.env.ACCESS_KEY, { expiresIn: '7d' });

        accessTokenUserOne = jwt.sign({
            email: userOne.email,
            id: "generic id",
            username: userOne.username,
            role: userOne.role
          }, process.env.ACCESS_KEY, { expiresIn: '7d' });

        const req = {cookies: {accessToken: accessTokenUserOne, refreshToken: userOne.refreshToken}};

        expect(verifyAuth(req, {}, {authType: 'User', username: userOne.username})).toEqual({ flag: true, cause: "Authorized" });
    });

    test("Correct admin auth", () => {

        adminOne.refreshToken = jwt.sign({
            email: adminOne.email,
            id: "generic id",
            username: adminOne.username,
            role: adminOne.role
        }, process.env.ACCESS_KEY, { expiresIn: '7d' });

        adminAccessToken = jwt.sign({
            email: adminOne.email,
            id: "generic id",
            username: adminOne.username,
            role: adminOne.role
        }, process.env.ACCESS_KEY, { expiresIn: '7d' });

        const req = {cookies: {accessToken: adminAccessToken, refreshToken: adminOne.refreshToken}};

        expect(verifyAuth(req, {}, {authType: 'Admin'})).toEqual({ flag: true, cause: "Authorized" });
    });

    test("User auth fails with token expired", () => {

        userOne.refreshToken = jwt.sign({
            email: userOne.email,
            id: "generic id",
            username: userOne.username,
            role: userOne.role
        }, process.env.ACCESS_KEY, { expiresIn: '7d' });

        accessTokenUserOne = jwt.sign({
            email: userOne.email,
            id: "generic id",
            username: userOne.username,
            role: userOne.role
          }, process.env.ACCESS_KEY, { expiresIn: '0s' });

        const cookieMock = (name, value, options) => {
            res.cookieArgs = { name, value, options };
        }

        const req = {cookies: {accessToken: accessTokenUserOne, refreshToken: userOne.refreshToken}};
        const res = {
            cookie: cookieMock,
            locals: {},
        }

        const response = verifyAuth(req, res, { authType: "User", username: userTwo.username });
        expect(response).toHaveProperty("flag",false);
        expect(response).toHaveProperty("cause");
    });

    test("User auth succeeds with token expired", () => {

        userOne.refreshToken = jwt.sign({
            email: userOne.email,
            id: "generic id",
            username: userOne.username,
            role: userOne.role
        }, process.env.ACCESS_KEY, { expiresIn: '7d' });

        accessTokenUserOne = jwt.sign({
            email: userOne.email,
            id: "generic id",
            username: userOne.username,
            role: userOne.role
          }, process.env.ACCESS_KEY, { expiresIn: '0s' });

        const cookieMock = (name, value, options) => {
            res.cookieArgs = { name, value, options };
        }

        const req = {cookies: {accessToken: accessTokenUserOne, refreshToken: userOne.refreshToken}};
        const res = {
            cookie: cookieMock,
            locals: {},
        }

        const response = verifyAuth(req, res, { authType: "User", username: userOne.username });
        expect(response).toHaveProperty("flag",true);
        expect(response).toHaveProperty("cause");
    });

    test("Admin auth fails with token expired", () => {

        userOne.refreshToken = jwt.sign({
            email: userOne.email,
            id: "generic id",
            username: userOne.username,
            role: userOne.role
        }, process.env.ACCESS_KEY, { expiresIn: '7d' });

        accessTokenUserOne = jwt.sign({
            email: userOne.email,
            id: "generic id",
            username: userOne.username,
            role: userOne.role
          }, process.env.ACCESS_KEY, { expiresIn: '0s' });

        const cookieMock = (name, value, options) => {
            res.cookieArgs = { name, value, options };
        }

        const req = {cookies: {accessToken: accessTokenUserOne, refreshToken: userOne.refreshToken}};
        const res = {
            cookie: cookieMock,
            locals: {},
        }

        const response = verifyAuth(req, res, { authType: "Admin"});
        expect(response).toHaveProperty("flag",false);
        expect(response).toHaveProperty("cause");
    });

    test("Admin auth succeeds with token expired", () => {

        adminOne.refreshToken = jwt.sign({
            email: adminOne.email,
            id: "generic id",
            username: adminOne.username,
            role: adminOne.role
        }, process.env.ACCESS_KEY, { expiresIn: '7d' });

        adminAccessToken = jwt.sign({
            email: adminOne.email,
            id: "generic id",
            username: adminOne.username,
            role: adminOne.role
        }, process.env.ACCESS_KEY, { expiresIn: '0s' });

        const cookieMock = (name, value, options) => {
            res.cookieArgs = { name, value, options };
        }

        const req = {cookies: {accessToken: adminAccessToken, refreshToken: adminOne.refreshToken}};
        const res = {
            cookie: cookieMock,
            locals: {},
        }

        const response = verifyAuth(req, res, { authType: "Admin"});
        expect(response).toHaveProperty("flag",true);
        expect(response).toHaveProperty("cause");
    });

    test("Group auth fails with token expired", () => {

        userOne.refreshToken = jwt.sign({
            email: userOne.email,
            id: "generic id",
            username: userOne.username,
            role: userOne.role
        }, process.env.ACCESS_KEY, { expiresIn: '7d' });

        accessTokenUserOne = jwt.sign({
            email: userOne.email,
            id: "generic id",
            username: userOne.username,
            role: userOne.role
          }, process.env.ACCESS_KEY, { expiresIn: '0s' });

        const cookieMock = (name, value, options) => {
            res.cookieArgs = { name, value, options };
        }

        const req = {cookies: {accessToken: accessTokenUserOne, refreshToken: userOne.refreshToken}};
        const res = {
            cookie: cookieMock,
            locals: {},
        }

        const response = verifyAuth(req, res, { authType: "Group", emails: [userTwo.email]});
        expect(response).toHaveProperty("flag",false);
        expect(response).toHaveProperty("cause");
    });

    test("Group auth correct with token expired", () => {

        userOne.refreshToken = jwt.sign({
            email: userOne.email,
            id: "generic id",
            username: userOne.username,
            role: userOne.role
        }, process.env.ACCESS_KEY, { expiresIn: '7d' });

        accessTokenUserOne = jwt.sign({
            email: userOne.email,
            id: "generic id",
            username: userOne.username,
            role: userOne.role
          }, process.env.ACCESS_KEY, { expiresIn: '0s' });

        const cookieMock = (name, value, options) => {
            res.cookieArgs = { name, value, options };
        }

        const req = {cookies: {accessToken: accessTokenUserOne, refreshToken: userOne.refreshToken}};
        const res = {
            cookie: cookieMock,
            locals: {},
        }

        const response = verifyAuth(req, res, { authType: "Group", emails: [userOne.email]});
        expect(response).toHaveProperty("flag",true);
        expect(response).toHaveProperty("cause");
    });

    test("Group auth correct", () => {

        userOne.refreshToken = jwt.sign({
            email: userOne.email,
            id: "generic id",
            username: userOne.username,
            role: userOne.role
        }, process.env.ACCESS_KEY, { expiresIn: '7d' });

        accessTokenUserOne = jwt.sign({
            email: userOne.email,
            id: "generic id",
            username: userOne.username,
            role: userOne.role
          }, process.env.ACCESS_KEY, { expiresIn: '7d' });

        const req = {cookies: {accessToken: accessTokenUserOne, refreshToken: userOne.refreshToken}};

        const response = verifyAuth(req, {}, { authType: "Group", emails: [userOne.email]});
        expect(response).toHaveProperty("flag",true);
        expect(response).toHaveProperty("cause");
    });
})

describe("handleAmountFilterParams", () => { 
    test('should throws an error if the value of any of the two query parameters is not a numerical value', () => {
        let req_amount = { query: { min: 'aa'} };
        expect(() => {handleAmountFilterParams(req_amount)}).toThrow();

        req_amount.max = 'bb';
        expect(() => {handleAmountFilterParams(req_amount)}).toThrow();
    });

    test('should throws  "Min or max parameter is not a number" if min/max is not numerical', () => {
        let req_amount = { query: { min: 'aa', max: 13} };
        expect(() => {handleAmountFilterParams(req_amount)}).toThrow(/Error/);

        req_amount = { query: { min:10, max: '#!'} };
        expect(() => {handleAmountFilterParams(req_amount)}).toThrow(/Error/);
    });

    test('should return {} if the function is used without any min/max parameters', () => {
        const req_amount = { query: {} };
        const retrivedAmount = {};
        expect(handleAmountFilterParams(req_amount)).toEqual(retrivedAmount);
    });

    
    test('should return filter object with  `$gte` attributes if  `min` is present', () => {
        const req_amount = { query: { min: 10} };
        const retrivedAmount = {amount: {$gte: 10}};
        expect(handleAmountFilterParams(req_amount)).toEqual(retrivedAmount);
    });
    
    
    test('should return filter object with  `$lte` attributes if  `max` is present', () => {
        const req_amount = { query: { max: 100} };
        const retrivedAmount = {amount: {$lte: 100}};
        expect(handleAmountFilterParams(req_amount)).toEqual(retrivedAmount);
    });

    
    test('should return filter object with  `$lte` and `$gte` attributes if  `max` and `min` is present', () => {
        const req_amount = { query: {min:10,  max: 100} };
        const retrivedAmount = {amount: {$gte: 10, $lte: 100}};
        expect(handleAmountFilterParams(req_amount)).toEqual(retrivedAmount);
    });
})
