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
    test('Dummy test, change it', () => {
        expect(true).toBe(true);
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
    test('Dummy test, change it', () => {  
        expect(true).toBe(true);  
    });
})

describe("handleAmountFilterParams", () => { 
    test('Dummy test, change it', () => {  
        expect(true).toBe(true);  
    });
})
