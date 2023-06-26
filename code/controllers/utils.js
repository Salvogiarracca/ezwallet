import jwt from "jsonwebtoken";

function newToken(res, refreshToken) {
  const newAccessToken = jwt.sign(
    {
      username: refreshToken.username,
      email: refreshToken.email,
      id: refreshToken.id,
      role: refreshToken.role,
    },
    process.env.ACCESS_KEY,
    { expiresIn: "1h" }
  );
  res.cookie("accessToken", newAccessToken, {
    httpOnly: true,
    path: "/api",
    maxAge: 60 * 60 * 1000,
    sameSite: "none",
    secure: true,
  });
  res.locals.refreshedTokenMessage =
    "Access token has been refreshed. Remember to copy the new one in the headers of subsequent calls";
}

/**
 * Handle possible date filtering options in the query parameters for getTransactionsByUser when called by a Regular user.
 * @param req the request object that can contain query parameters
 * @returns an object that can be used for filtering MongoDB queries according to the `date` parameter.
 *  The returned object must handle all possible combination of date filtering parameters, including the case where none are present.
 *  Example: {date: {$gte: "2023-04-30T00:00:00.000Z"}} returns all transactions whose `date` parameter indicates a date from 30/04/2023 (included) onwards
 * @throws an error if the query parameters include `date` together with at least one of `from` or `upTo`
    ---NEW REQUIREMENTS---
 * - Returns an object with a `date` attribute used for filtering mongoDB's `aggregate` queries
 * - The value of `date` is an object that depends on the query parameters:
 *   - If the query parameters include `from` then it must include a `$gte` attribute that specifies the starting date as a `Date` object in the format **YYYY-MM-DDTHH:mm:ss**
 *     - Example: `/api/users/Mario/transactions?from=2023-04-30` => `{date: {$gte: 2023-04-30T00:00:00.000Z}}`
 *   - If the query parameters include `upTo` then it must include a `$lte` attribute that specifies the ending date as a `Date` object in the format **YYYY-MM-DDTHH:mm:ss**
 *     - Example: `/api/users/Mario/transactions?upTo=2023-05-10` => `{date: {$lte: 2023-05-10T23:59:59.000Z}}`
 *   - If both `from` and `upTo` are present then both `$gte` and `$lte` must be included
 *   - If `date` is present then it must include both `$gte` and `$lte` attributes, these two attributes must specify the same date as a `Date` object in the format **YYYY-MM-DDTHH:mm:ss**
 *     - Example: `/api/users/Mario/transactions?date=2023-05-10` => `{date: {$gte: 2023-05-10T00:00:00.000Z, $lte: 2023-05-10T23:59:59.000Z}}`
 *   - If there is no query parameter then it returns an empty object
 *     - Example: `/api/users/Mario/transactions` => `{}`
 * - Throws an error if `date` is present in the query parameter together with at least one of `from` or `upTo`
 * - Throws an error if the value of any of the three query parameters is not a string that represents a date in the format **YYYY-MM-DD**
 */
export const handleDateFilterParams = (req) => {
  const { from, upTo, date } = req.query;
  if (!date && !from && !upTo) {
    return {};
  }
  if ((date && upTo) || (date && from)) {
    throw new Error("Invalid attribute date in query");
  }
  if (upTo && from) {
    if (!checkDateValue(from) || !checkDateValue(upTo))
      throw new Error("Invalid date");
    if (!checkTimeDates(from, upTo)) {
      throw new Error("Invalid dates");
    }
    return {
      date: {
        $gte: new Date(`${from}T00:00:00.000Z`),
        $lte: new Date(`${upTo}T23:59:59.999Z`),
      },
    };
  } else {
    if (upTo) {
      if (!checkDateValue(upTo)) throw new Error("Invalid date");
      return { date: { $lte: new Date(`${upTo}T23:59:59.999Z`) } };
    } else if (from) {
      if (!checkDateValue(from)) throw new Error("Invalid date");
      return { date: { $gte: new Date(`${from}T00:00:00.000Z`) } };
    }
    if (!checkDateValue(date)) throw new Error("Invalid date");
    return {
      date: {
        $gte: new Date(`${date}T00:00:00.000Z`),
        $lte: new Date(`${date}T23:59:59.999Z`),
      },
    };
  }
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
 *  ---NEW REQUIREMENTS---
 *  - Verifies that the tokens present in the request's cookies allow access depending on the different criteria.
 * - Returns an object with a boolean `flag` that specifies whether access is granted or not and a `cause` that describes the reason behind failed authentication
 *   - Example: `{flag: false, cause: "Unauthorized"}`
 * - Refreshes the `accessToken` if it has expired and the `refreshToken` allows authentication; sets the `refreshedTokenMessage` to inform users that the `accessToken` must be changed
 *
 */
export const verifyAuth = (req, res, info) => {
  const cookie = req.cookies;
  if (!cookie.accessToken || !cookie.refreshToken) {
    return { authorized: false, cause: "Unauthorized" };
  }
  try {
    const decodedAccessToken = jwt.verify(
      cookie.accessToken,
      process.env.ACCESS_KEY
    );
    const decodedRefreshToken = jwt.verify(
      cookie.refreshToken,
      process.env.ACCESS_KEY
    );
    ///if one of username, email and role does not exist in AccessToken, => missing informations
    if (
      !decodedAccessToken.username ||
      !decodedAccessToken.email ||
      !decodedAccessToken.role
    ) {
      return { authorized: false, cause: "Token is missing information" };
    }
    ///if one of username, email and role does not exist in RefreshToken, => missing informations
    if (
      !decodedRefreshToken.username ||
      !decodedRefreshToken.email ||
      !decodedRefreshToken.role
    ) {
      return { authorized: false, cause: "Token is missing information" };
    }
    ///if username/email/role of AccessToken differs from username/email/role of RefreshToken, => mismatched users
    if (
      decodedAccessToken.username !== decodedRefreshToken.username ||
      decodedAccessToken.email !== decodedRefreshToken.email ||
      decodedAccessToken.role !== decodedRefreshToken.role
    ) {
      return { authorized: false, cause: "Mismatched users" };
    }
    if (info.authType === "Simple") {
      return { authorized: true, cause: "Authorized" };
    }
    ///1 either the accessToken or the refreshToken have a `username` different from the requested one
    if (
      info.authType === "User" &&
      decodedAccessToken.username === info.username &&
      decodedRefreshToken.username === info.username
    ) {
      return { authorized: true, cause: "Authorized" };
    }
    ///2 either the accessToken or the refreshToken have a `role` which is not Admin
    if (
      info.authType === "Admin" &&
      decodedAccessToken.role === info.authType &&
      decodedRefreshToken.role === info.authType
    ) {
      return { authorized: true, cause: "Authorized" };
    }
    ///3 either the accessToken or the refreshToken have a `email` which is not in the requested group
    if (
      info.authType === "Group" &&
      (info.emails.includes(decodedAccessToken.email) ||
        info.emails.includes(decodedRefreshToken.email))
    ) {
      return { authorized: true, cause: "Authorized" };
    }

    return { authorized: false, cause: "Unauthorized" };
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      try {
        const refreshToken = jwt.verify(
          cookie.refreshToken,
          process.env.ACCESS_KEY
        );
        if (info.authType === "Simple") {
          newToken(res, refreshToken);
          return { authorized: true, cause: "Authorized" };
        }
        ///1 the accessToken is expired and the refreshToken has a `username` different from the requested one
        if (
          info.authType === "User" &&
          refreshToken.username === info.username
        ) {
          newToken(res, refreshToken);
          return { authorized: true, cause: "Authorized" };
        }
        ///2 the accessToken is expired and the refreshToken has a `role` which is not Admin
        if (info.authType === "Admin" && refreshToken.role === "Admin") {
          newToken(res, refreshToken);
          return { authorized: true, cause: "Authorized" };
        }
        ///3 the accessToken is expired and the refreshToken has a `email` which is not in the requested group
        if (
          info.authType === "Group" &&
          info.emails.includes(refreshToken.email)
        ) {
          newToken(res, refreshToken);
          return { authorized: true, cause: "Authorized" };
        }

        return { authorized: false, cause: "Unauthorized" };
      } catch (err) {
        if (err.name === "TokenExpiredError") {
          return { authorized: false, cause: "Perform login again" };
        } else {
          return { authorized: false, cause: err.name };
        }
      }
    } else {
      return { authorized: false, cause: err.name };
    }
  }
};

/**
 * Handle possible amount filtering options in the query parameters for getTransactionsByUser when called by a Regular user.
 * @param req the request object that can contain query parameters
 * @returns an object that can be used for filtering MongoDB queries according to the `amount` parameter.
 *  The returned object must handle all possible combination of amount filtering parameters, including the case where none are present.
 *  Example: {amount: {$gte: 100}} returns all transactions whose `amount` parameter is greater or equal than 100
 *  ----NEW REQUIREMENTS---
 *  - Returns an object with an `amount` attribute used for filtering mongoDB's `aggregate` queries
 * - The value of `amount` is an object that depends on the query parameters:
 *   - If the query parameters include `min` then it must include a `$gte` attribute that is an integer equal to `min`
 *     - Example: `/api/users/Mario/transactions?min=10` => `{amount: {$gte: 10} }
 *   - If the query parameters include `min` then it must include a `$lte` attribute that is an integer equal to `max`
 *     - Example: `/api/users/Mario/transactions?min=50` => `{amount: {$lte: 50} }
 *   - If both `min` and `max` are present then both `$gte` and `$lte` must be included
 * - Throws an error if the value of any of the two query parameters is not a numerical value
 */
export const handleAmountFilterParams = (req) => {
  const { min, max } = req.query;
  if (!min && !max) {
    return {};
  }
  if (min && max) {
    if (isNaN(min) || isNaN(max)) {
      throw new Error("One or more parameters are not a number!");
    }
    if (parseFloat(min) > parseFloat(max)) {
      throw new Error("min can't be bigger than max!");
    }
    return { amount: { $gte: parseFloat(min), $lte: parseFloat(max) } };
  } else if (min) {
    if (isNaN(min)) {
      throw new Error("min is not a number!");
    }
    return { amount: { $gte: parseFloat(min)} };
  } else if (max) {
    if (isNaN(max)) {
      throw new Error("max is not a number!");
    }
    return { amount: { $lte: parseFloat(max) } };
  }
};

//this function checks if date matches a regexp and if all the values are correct
function checkDateValue(value) {
  const regExp = /^\d{4}-\d{2}-\d{2}$/;
  if (!regExp.test(value)) {
    return false;
  }
  const ary = value.split("-");
  const yyyy = parseInt(ary[0]);
  const mm = parseInt(ary[1]);
  const dd = parseInt(ary[2]);
  if (dd > 31) {
    return false;
  }
  if (mm > 12) {
    return false;
  }
  if (mm === 2 && dd > 28) {
    if (!(yyyy % 4 === 0 && dd === 29)) {
      return false;
    }
  }
  if ((mm === 4 || mm === 6 || mm === 9 || mm === 11) && dd > 30) {
    return false;
  }
  return true;
}

//function that checks if date upTo is gte from, throws Error if conditions are not satisfied, returns true if all the checks are fine
function checkTimeDates(from, upTo) {
  const regExp = /^\d{4}-\d{2}-\d{2}$/;
  const ary1 = from.split("-");
  const ary2 = upTo.split("-");
  const y1 = ary1[0];
  const m1 = ary1[1];
  const d1 = ary1[2];
  const y2 = ary2[0];
  const m2 = ary2[1];
  const d2 = ary2[2];
  if (y1 > y2) {
    return false;
  } else if (y1 === y2) {
    if (m1 > m2) {
      return false;
    } else if (m1 === m2) {
      if (d1 > d2) {
        return false;
      }
    }
  }
  return true;
}
