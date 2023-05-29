import jwt from 'jsonwebtoken'

/**
 * Handle possible date filtering options in the query parameters for getTransactionsByUser when called by a Regular user.
 * @param req the request object that can contain query parameters
 * @returns an object that can be used for filtering MongoDB queries according to the `date` parameter.
 *  The returned object must handle all possible combination of date filtering parameters, including the case where none are present.
 *  Example: {date: {$gte: "2023-04-30T00:00:00.000Z"}} returns all transactions whose `date` parameter indicates a date from 30/04/2023 (included) onwards
 * @throws an error if the query parameters include `date` together with at least one of `from` or `upTo`
 */
export const handleDateFilterParams = (req) => {

    const { date, from, upTo } = req.query;
    if (date && (from || upTo))
      throw new Error("Cannot use 'date' parameter together with 'from' or 'upTo'.");

    const filter = {};
  
    if (date) {

        if (!isValidDate(date))
            throw new Error("'date' parameter is in wrong format");

        const startDate = new Date(date);

        startDate.setUTCHours(0);
        startDate.setMinutes(0);
        startDate.setSeconds(0);

        const endDate = new Date(date);

        endDate.setUTCHours(23);
        endDate.setMinutes(59);
        endDate.setSeconds(59);

        filter.date = { $gte: startDate, $lte: endDate };
    } else {
        if (from) {
            
            if (!isValidDate(from))
                throw new Error("'from' parameter is in wrong format");

            filter.date = { $gte: new Date(from) };
        }
    
        if (upTo) {
            
            if (!isValidDate(upTo))
                throw new Error("'upTo' parameter is in wrong format");

            const endDate = new Date(upTo);

            endDate.setUTCHours(23);
            endDate.setMinutes(59);
            endDate.setSeconds(59);

          filter.date = { ...filter.date, $lte: new Date(endDate) };
        }
    }
  
    return filter;
}

function isValidDate(dateString) {

    // Check for regex pattern
    var regexDatePattern = /^\d{4}-\d{2}-\d{2}$/;
    
    if(!regexDatePattern.test(dateString))
      return false;  // Invalid format
    
    // Parse the date parts to integers
    var parts = dateString.split("-");
    var year = parseInt(parts[0], 10);
    var month = parseInt(parts[1], 10);
    var day = parseInt(parts[2], 10);
    
    // Check the ranges of month and year
    if(year < 1000 || year > 3000 || month == 0 || month > 12)
      return false;
  
    var monthLength = [ 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31 ];
    
    // Adjust for leap years
    if(year % 400 == 0 || (year % 100 != 0 && year % 4 == 0))
      monthLength[1] = 29;
  
    // Check the range of the day
    return day > 0 && day <= monthLength[month - 1];
  };

/**
 * Handle possible authentication modes depending on `authType`
 * @param req the request object that contains cookie information
 * @param res the result object of the request
 * @param info an object that specifies the `authType` and that contains additional information, depending on the value of `authType`
 *      Example: {authType: "Simple"}
 *      Additional criteria:
 *          - authType === "User":
 *              - either the accessToken or the refreshToken have a `username` different from the requested one => error 401
 *              - the accessToken is expired and the refreshToken has a `username` different from the requested one => error 401
 *              - both the accessToken and the refreshToken have a `username` equal to the requested one => success
 *              - the accessToken is expired and the refreshToken has a `username` equal to the requested one => success
 *          - authType === "Admin":
 *              - either the accessToken or the refreshToken have a `role` which is not Admin => error 401
 *              - the accessToken is expired and the refreshToken has a `role` which is not Admin => error 401
 *              - both the accessToken and the refreshToken have a `role` which is equal to Admin => success
 *              - the accessToken is expired and the refreshToken has a `role` which is equal to Admin => success
 *          - authType === "Group":
 *              - either the accessToken or the refreshToken have a `email` which is not in the requested group => error 401
 *              - the accessToken is expired and the refreshToken has a `email` which is not in the requested group => error 401
 *              - both the accessToken and the refreshToken have a `email` which is in the requested group => success
 *              - the accessToken is expired and the refreshToken has a `email` which is in the requested group => success
 * @returns true if the user satisfies all the conditions of the specified `authType` and false if at least one condition is not satisfied
 *  Refreshes the accessToken if it has expired and the refreshToken is still valid
 */
export const verifyAuth = (req, res, info) => {
    const cookie = req.cookies
    if (!cookie.accessToken || !cookie.refreshToken) {
        return { authorized: false, message: "Unauthorized" };
    }
    try {
        const decodedAccessToken = jwt.verify(cookie.accessToken, process.env.ACCESS_KEY);
        const decodedRefreshToken = jwt.verify(cookie.refreshToken, process.env.ACCESS_KEY);
        if (!decodedAccessToken.username || !decodedAccessToken.email || !decodedAccessToken.role) {
            return { authorized: false, message: "Token is missing information" };
        }
        if (!decodedRefreshToken.username || !decodedRefreshToken.email || !decodedRefreshToken.role) {
            return { authorized: false, message: "Token is missing information" };
        }
        if (decodedAccessToken.username !== decodedRefreshToken.username || decodedAccessToken.email !== decodedRefreshToken.email || decodedAccessToken.role !== decodedRefreshToken.role) {
            return { authorized: false, message: "Mismatched users" };
        }

        // authType === "User"
        if (info.authType === "User" && (decodedAccessToken.username !== info.username)) {
            return { authorized: false, message: "Wrong User auth request" };
        }
        // authType === "Admin"
        else if (info.authType === "Admin" && decodedAccessToken.role !== "Admin") {
            return { authorized: false, message: "Wrong Admin auth request" };
        }
        // authType === "Group"
        else if (info.authType === "Group") {
            const isEmailinGroup = info.emails.includes(decodedAccessToken.email);
            if (!isEmailinGroup) {
                return { authorized: false, message: "Wrong Group auth request" };
            }
        }

        return { authorized: true, message: "Authorized" };
    } catch (err) {
        if (err.name === "TokenExpiredError") {
            try {
                const refreshToken = jwt.verify(cookie.refreshToken, process.env.ACCESS_KEY)

                // Refresh the token even if the request is bad
                const newAccessToken = jwt.sign({
                    username: refreshToken.username,
                    email: refreshToken.email,
                    id: refreshToken.id,
                    role: refreshToken.role
                }, process.env.ACCESS_KEY, { expiresIn: '1h' })
                res.cookie('accessToken', newAccessToken, { httpOnly: true, path: '/api', maxAge: 60 * 60 * 1000, sameSite: 'none', secure: true })
                res.locals.message = 'Access token has been refreshed. Remember to copy the new one in the headers of subsequent calls'

                // authType === "User"
                if (info.authType === "User" && (refreshToken.username !== info.username)) {
                    return { authorized: false, message: "Wrong User auth request" };
                }
                // authType === "Admin"
                else if (info.authType === "Admin" && refreshToken.role !== "Admin") {
                    return { authorized: false, message: "Wrong Admin auth request" };
                }
                // authType === "Group"
                else if (info.authType === "Group") {
                    const isEmailinGroup = info.emails.includes(refreshToken.email);
                    if (!isEmailinGroup) {
                        return { authorized: false, message: "Wrong Group auth request" };
                    }
                }

                return { authorized: true, message: "Authorized" };
            } catch (err) {
                if (err.name === "TokenExpiredError") {
                    return { authorized: false, message: "Perform login again" };
                } else {
                    return { authorized: false, message: err.name };
                }
            }
        } else {
            return { authorized: false, message: err.name };
        }
    }
}

/**
 * Handle possible amount filtering options in the query parameters for getTransactionsByUser when called by a Regular user.
 * @param req the request object that can contain query parameters
 * @returns an object that can be used for filtering MongoDB queries according to the `amount` parameter.
 *  The returned object must handle all possible combination of amount filtering parameters, including the case where none are present.
 *  Example: {amount: {$gte: 100}} returns all transactions whose `amount` parameter is greater or equal than 100
 */
export const handleAmountFilterParams = (req) => {
    
    const min = parseFloat(req.query.min);
    const max = parseFloat(req.query.max);
        
    if (isNaN(min) && isNaN(max))
        throw new Error("Error in min and/or max parameter");

    const filter = {};
  
    if (min) {
        filter.amount = { $gte: min };
    }
    if (max) {
        filter.amount = { ...filter.amount, $lte: max };
    }
  
    return filter;
}