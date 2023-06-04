import { handleDateFilterParams, verifyAuth, handleAmountFilterParams } from '../controllers/utils';
import jwt from 'jsonwebtoken'
import dotenv from "dotenv"
import mongoose from "mongoose";

dotenv.config();

jest.disableAutomock();

const test_date = '2023-04-30';
const test_start_date_utc = '2023-04-30T00:00:00.000Z';
const test_end_date_utc = '2023-04-30T23:59:59.000Z';

const test_date2 = '2023-05-30';
const test_start_date_utc2 = '2023-05-30T00:00:00.000Z';
const test_end_date_utc2 = '2023-05-30T23:59:59.000Z';

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

    
    test("should return { flag: false, cause: 'Token is missing information' } if token include email", () => {

        const testUserOne = {...userOne, email: ''};
        const accessToken = jwt.sign(testUserOne, process.env.ACCESS_KEY, { expiresIn: '1h' });
        const refreshToken = jwt.sign(testUserOne, process.env.ACCESS_KEY, { expiresIn: '7d' });

        const req = {cookies: {accessToken: accessToken, refreshToken: refreshToken}};
        expect(verifyAuth(req, {}, {})).toEqual({ flag: false, cause: "Token is missing information" });

    });

    
    test("should return { flag: false, cause: 'Mismatched users' } if accessToken and refreshToken are not matched", () => {
        
        const accessToken = jwt.sign(userOne, process.env.ACCESS_KEY, { expiresIn: '1h' });
        const testUserOne = {...userOne, email: 'user2@user.com'};
        const refreshToken = jwt.sign(testUserOne, process.env.ACCESS_KEY, { expiresIn: '7d' });
        const req = {cookies: {accessToken: accessToken, refreshToken: refreshToken}};
        expect(verifyAuth(req, {}, {})).toEqual({ flag: false, cause: "Mismatched users" });

    });

    
    test("should return { flag: false, cause: 'Wrong User auth request' } if the accessToken or the refreshToken have a `username` different from the requested one", () => {
        
        const diffUserName = 'user2';
        const accessToken = jwt.sign(userOne, process.env.ACCESS_KEY, { expiresIn: '1h' });
        const refreshToken = jwt.sign(userOne, process.env.ACCESS_KEY, { expiresIn: '7d' });
        const req = {cookies: {accessToken: accessToken, refreshToken: refreshToken}};

        expect(verifyAuth(req, {}, {authType: 'User', username: diffUserName})).toEqual({ flag: false, cause: "Wrong User auth request" });

    });

    
    test("should return { flag: false, cause: 'Wrong Admin auth request' } if the accessToken or the refreshToken have a `role` different from the requested one", () => {
        
        const diffRole = 'Group';
        const accessToken = jwt.sign(userOne, process.env.ACCESS_KEY, { expiresIn: '1h' });
        const refreshToken = jwt.sign(userOne, process.env.ACCESS_KEY, { expiresIn: '7d' });
        const req = {cookies: {accessToken: accessToken, refreshToken: refreshToken}};

        expect(verifyAuth(req, {}, {authType: 'Admin', role: diffRole})).toEqual({ flag: false, cause: "Wrong Admin auth request" });

        let diffUserOne = {...userOne, role: diffRole};
        const accessToken2 = jwt.sign(diffUserOne, process.env.ACCESS_KEY, { expiresIn: '1h' });
        const refreshToken2 = jwt.sign(diffUserOne, process.env.ACCESS_KEY, { expiresIn: '7d' });
        const req2 = {cookies: {accessToken: accessToken2, refreshToken: refreshToken2}};

        expect(verifyAuth(req2, {}, {authType: 'Admin', role: diffRole})).toEqual({ flag: false, cause: "Wrong Admin auth request" });

    });

    
    test("should return { flag: false, cause: 'Wrong Group auth request' } if the accessToken or the refreshToken have a `role` different from the requested one", () => {
        
        const diffEmails = ['user2@user.com'];
        const accessToken = jwt.sign(userOne, process.env.ACCESS_KEY, { expiresIn: '1h' });
        const refreshToken = jwt.sign(userOne, process.env.ACCESS_KEY, { expiresIn: '7d' });
        const req = {cookies: {accessToken: accessToken, refreshToken: refreshToken}};

        expect(verifyAuth(req, {}, {authType: 'Group', emails: diffEmails})).toEqual({ flag: false, cause: "Wrong Group auth request" });

    });

    
    test("should refreshes the `accessToken` if it has expired and the `refreshToken` allows authentication; sets the `refreshedTokenMessage` to inform users that the `accessToken` must be changed", () => {
            
        const accessToken = jwt.sign(userOne, process.env.ACCESS_KEY, { expiresIn: '1h' });
        const refreshToken = jwt.sign(userOne, process.env.ACCESS_KEY, { expiresIn: '7d' });
        const req = {cookies: {accessToken: accessToken, refreshToken: refreshToken}};

        jest.useFakeTimers({advanceTimers: 1000 * 3600}); 

        let res = {};

        setTimeout(function(){
            expect(verifyAuth(req, res, {authType: 'User', username: userOne.username})).toEqual({ flag: true, cause: "Authorized" });
            expect(res).toHaveProperty('locals.message');

            jest.clearAllTimers();

        }, 1000 * 3600 + 500)
       

    });

    
    test("should return {authorized: false, cause: 'Perform login again'} if it `refreshToken` is expired", () => {
            
        const accessToken = jwt.sign(userOne, process.env.ACCESS_KEY, { expiresIn: '1h' });
        const refreshToken = jwt.sign(userOne, process.env.ACCESS_KEY, { expiresIn: '7d' });
        const req = {cookies: {accessToken: accessToken, refreshToken: refreshToken}};

        jest.useFakeTimers({advanceTimers: 1000 * 3600 * 24 * 7}); 

        let res = {};

        setTimeout(function(){
            expect(verifyAuth(req, res, {authType: 'User', username: userOne.username})).toEqual({ flag: false, cause: "Perform login again" });

            jest.clearAllTimers();
            
        }, 1000 * 3600 * 24 * 7 + 500)
       

    });
    
    test("should return { flag: true, cause: 'Authorized' } if authentication is valid", () => {
            
        const accessToken = jwt.sign(userOne, process.env.ACCESS_KEY, { expiresIn: '1h' });
        const refreshToken = jwt.sign(userOne, process.env.ACCESS_KEY, { expiresIn: '7d' });
        const req = {cookies: {accessToken: accessToken, refreshToken: refreshToken}};

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
