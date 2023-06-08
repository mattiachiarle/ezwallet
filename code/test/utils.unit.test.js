import { handleDateFilterParams, verifyAuth, handleAmountFilterParams } from '../controllers/utils';
import mongoose from "mongoose";
import jwt from 'jsonwebtoken';
const bcrypt = require("bcryptjs");
import dotenv from "dotenv"

jest.mock("bcryptjs");
jest.mock("jsonwebtoken");

dotenv.config();

const test_date = '2023-04-30';
const test_start_date_utc = '2023-04-30T00:00:00.000Z';
const test_end_date_utc = '2023-04-30T23:59:59.999Z';

const test_date2 = '2023-05-30';
const test_start_date_utc2 = '2023-05-30T00:00:00.000Z';
const test_end_date_utc2 = '2023-05-30T23:59:59.999Z';

describe("handleDateFilterParams", () => {

    
    test('should throws an error if `date` is present in the query parameter together with from or upTo', () => {
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
        
    test('should throws an error if the value of any of the three query parameters is not a string that represents a date in the format **YYYY-MM-DD**', () => {
        const req_date1 = { query: {from: "22-232-11", upTo: "20233344"} };
        expect(() => {handleDateFilterParams(req_date1)}).toThrow();

        const req_date2 = { query: {from: "22-232-11", upTo: "2023-0199"} };
        expect(() => {handleDateFilterParams(req_date2)}).toThrow();

        const req_date3 = { query: {from: "1-1-1", upTo: "2023-mm-dd"} };
        expect(() => {handleDateFilterParams(req_date3)}).toThrow();
    });
    
    test('should throws an error if `date` is not `isVaildDate`', () => {
        const req_date1 = { query: {date:"0999-10-11"} };
        expect(() => {handleDateFilterParams(req_date1)}).toThrow();
    });

    test('should throws an error if `from` is not `isVaildDate`', () => {
        const req_date1 = { query: {from:"3011-13-11"} };
        expect(() => {handleDateFilterParams(req_date1)}).toThrow();
    });

    test('should throws an error if `upTo` is not `isVaildDate`', () => {
        const req_date1 = { query: {upTo:"2024-02-30"} };
        expect(() => {handleDateFilterParams(req_date1)}).toThrow();
    });
})

const unAuthObj = {flag: false, cause: 'Unauthorized'};
let userOneId = new mongoose.Types.ObjectId();
let adminOneId = new mongoose.Types.ObjectId();

const userOne = {
    username: 'user1',
    id: userOneId.toString(),
    email: 'user1@user.com',
    role: 'User'
}


describe("verifyAuth", () => {

    test("should return { flag: false, cause: 'Unauthorized' } if request not have cookies", () => {
        const req = {cookies: ''};
        expect(verifyAuth(req, {}, {})).toEqual(unAuthObj);
    });


    test("should return { flag: false, cause: 'Token is missing information' } if accessToken does not include email", () => {

        const testUserOne = {...userOne, email: ''};
        jwt.verify.mockReturnValue(testUserOne);
        const req = {cookies: {accessToken: 'testerAccessTokenValid', refreshToken: 'testerAccessTokenValid'}};
        expect(verifyAuth(req, {}, {})).toEqual({ flag: false, cause: "Token is missing information" });

    });

    test("should return { flag: false, cause: 'Token is missing information' } if refreshToken does not include email", () => {

        const testUserOne = {...userOne};
        jwt.verify.mockReturnValueOnce(testUserOne);

        const testNoEmailUserOne = {...userOne, email: ''};
        jwt.verify.mockReturnValueOnce(testNoEmailUserOne);

        const req = {cookies: {accessToken: 'testerAccessTokenValid', refreshToken: 'testerAccessTokenValid'}};
        expect(verifyAuth(req, {}, {})).toEqual({ flag: false, cause: "Token is missing information" });

    });


    test("should return { flag: false, cause: 'Mismatched users' } if accessToken and refreshToken are not matched", () => {

        jwt.verify.mockReturnValueOnce(userOne);

        const testUserOne = {...userOne, email: 'user2@user.com'};
        jwt.verify.mockReturnValueOnce(testUserOne);
        const req = {cookies: {accessToken: 'testerAccessTokenValid', refreshToken: 'testerAccessTokenValid'}};
        expect(verifyAuth(req, {}, {})).toEqual({ flag: false, cause: "Mismatched users" });
    });


    test("should return { flag: false, cause: 'Wrong User auth request' } if the accessToken or the refreshToken have a `username` different from the requested one", () => {
        
        const diffUserName = 'user2';
        jwt.verify.mockReturnValue(userOne);
        const req = {cookies: {accessToken: 'testerAccessTokenValid', refreshToken: 'testerAccessTokenValid'}};
        expect(verifyAuth(req, {}, {authType: 'User', username: diffUserName})).toEqual({ flag: false, cause: "Wrong User auth request" });

    });


    test("should return { flag: false, cause: 'Wrong Admin auth request' } if the accessToken or the refreshToken have a `role` different from the requested one", () => {
        
        const diffRole = 'Group';
        jwt.verify.mockReturnValueOnce(userOne);
        jwt.verify.mockReturnValueOnce(userOne);
        const req = {cookies: {accessToken: 'testerAccessTokenValid', refreshToken: 'testerAccessTokenValid'}};

        expect(verifyAuth(req, {}, {authType: 'Admin', role: diffRole})).toEqual({ flag: false, cause: "Wrong Admin auth request" });

        let diffUserOne = {...userOne, role: diffRole};

        jwt.verify.mockReturnValueOnce(diffUserOne);
        jwt.verify.mockReturnValueOnce(diffUserOne);
        const req2 = {cookies: {accessToken: 'testerAccessTokenValid', refreshToken: 'testerAccessTokenValid'}};

        expect(verifyAuth(req2, {}, {authType: 'Admin', role: diffRole})).toEqual({ flag: false, cause: "Wrong Admin auth request" });
    });


    test("should return { flag: false, cause: 'Wrong Group auth request' } if the accessToken or the refreshToken have a `role` different from the requested one", () => {
        
        const diffEmails = ['user2@user.com'];
        jwt.verify.mockReturnValue(userOne);
        const req = {cookies: {accessToken: 'testerAccessTokenValid', refreshToken: 'testerAccessTokenValid'}};
        expect(verifyAuth(req, {}, {authType: 'Group', emails: diffEmails})).toEqual({ flag: false, cause: "Wrong Group auth request" });

    });


    test("should refreshes the `accessToken` if it has expired and the `refreshToken` allows authentication; sets the `refreshedTokenMessage` to inform users that the `accessToken` must be changed", () => {

        const req = { cookies: { accessToken: "testerAccessTokenExpired", refreshToken: "testerAccessTokenValid" } }
        //The inner working of the cookie function is as follows: the response object's cookieArgs object values are set
        const cookieMock = (name, value, options) => {
            res.cookieArgs = { name, value, options };
        };
        //In this case the response object must have a "cookie" function that sets the needed values, as well as a "locals" object where the message must be set
        const res = {
            cookie: cookieMock,
            locals: {},
        };

        jwt.verify.mockImplementationOnce(() => {
            const error = new Error('TokenExpiredError');
            error.name = 'TokenExpiredError';
            throw error
        });

        jwt.verify.mockReturnValue(userOne);

        jwt.sign.mockReturnValue("refreshedAccessToken");

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
            
        const req = { cookies: { accessToken: "testerAccessToken", refreshToken: "testerAccessTokenValidExpired" } }
        jwt.verify.mockImplementation(() => {
            const error = new Error('TokenExpiredError');
            error.name = 'TokenExpiredError';
            throw error
        });

        jwt.sign.mockReturnValue("refreshedAccessToken");

        expect(verifyAuth(req, {}, { authType: "User", username: userOne.username })).toEqual({ flag: false, cause: "Perform login again" });

    });


    test("should return { flag: true, cause: 'Authorized' } if authentication is valid", () => {

        jwt.verify.mockReturnValue(userOne);
        const req = {cookies: {accessToken: 'testerAccessToken', refreshToken: 'testerAccessTokenValidExpired'}};

        expect(verifyAuth(req, {}, {authType: 'User', username: userOne.username})).toEqual({ flag: true, cause: "Authorized" });
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
