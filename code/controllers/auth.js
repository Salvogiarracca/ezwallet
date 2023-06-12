import bcrypt from 'bcryptjs';
import { User } from '../models/User.js';
import jwt from 'jsonwebtoken';
import { verifyAuth } from './utils.js';
import { verifyEmail } from './genericFunctions.js';

/**
 * Register a new user in the system
  - Request Parameters: None
  - Request Body Content: An object having attributes `username`, `email` and `password`
    - Example: `{username: "Mario", email: "mario.red@email.com", password: "securePass"}`
  - Response `data` Content: A message confirming successful insertion
    - Example: `res.status(200).json({data: {message: "User added successfully"}})`
  - Optional behavior:
    - Returns a 400 error if the request body does not contain all the necessary attributes
    - Returns a 400 error if at least one of the parameters in the request body is an empty string
    - Returns a 400 error if the email in the request body is not in a valid email format
    - Returns a 400 error if the username in the request body identifies an already existing user
    - Returns a 400 error if the email in the request body identifies an already existing user
 */
export const register = async (req, res) => {
    try {
        
        // Check for presence of all necessary attributes
        if (!req.body.hasOwnProperty("username") || !req.body.hasOwnProperty("email") || !req.body.hasOwnProperty("password"))
            return res.status(400).json({ error: "Missing parameters in the body of the request" });

        const { username, email, password } = req.body;
        
        // Check for presence of values in all necessary attributes
        if (username === "" || email === "" || password === "")
            return res.status(400).json({ error: "Missing parameters in the body of the request" });
        
        // Check if a user with same mail or username as already been registered before
        const existingMail = await User.findOne({ email: req.body.email });
        const existingUser = await User.findOne({ username : req.body.username });

        if (existingMail || existingUser) 
            return res.status(400).json({ error: "You are already registered" });

        // If the user is not yet registered, need to check if the email is valid
        const validMail = verifyEmail(req);
        
        if (!validMail)
            return res.status(400).json({ error: "The used email is not valid, please check it."});
 
        const hashedPassword = await bcrypt.hash(password, 12);
        const newUser = await User.create({
            username,
            email,
            password: hashedPassword,
        });

        let returnValue = {
            data: { message : "User added successfully"},
        };

        return res.status(200).json(returnValue);
    } catch (err) {
        res.status(500).json( err.message );
    }
};

/**
 * Register a new user in the system with an Admin role
  - Request Parameters: None
  - Request Body Content: An object having attributes `username`, `email` and `password`  
    - Example: `{username: "admin", email: "admin@email.com", password: "securePass"}`
  - Response `data` Content: A message confirming successful insertion
    - Example: `res.status(200).json({data: {message: "User added successfully"}})`
  - Optional behavior:
    - Returns a 400 error if the request body does not contain all the necessary attributes
    - Returns a 400 error if at least one of the parameters in the request body is an empty string
    - Returns a 400 error if the email in the request body is not in a valid email format
    - Returns a 400 error if the username in the request body identifies an already existing user
    - Returns a 400 error if the email in the request body identifies an already existing user
 */
export const registerAdmin = async (req, res) => {
    try {

        // Check for presence of all necessary attributes
        if (!req.body.hasOwnProperty("username") || !req.body.hasOwnProperty("email") || !req.body.hasOwnProperty("password"))
            return res.status(400).json({ error: "Missing parameters in the body of the request" });

        const { username, email, password } = req.body;

        // Check for presence of values in all necessary attributes
        if (username === "" || email === "" || password === "")
            return res.status(400).json({ error: "Missing parameters in the body of the request" });

        // Check if a user with same mail or username as already been registered before
        const existingMail = await User.findOne({ email: req.body.email });
        const existingUser = await User.findOne({ username : req.body.username });

        if (existingMail || existingUser) 
            return res.status(400).json({ error: "You are already registered" });

        // If the admin is not yet registered, need to check if the email is valid
        const validMail = verifyEmail(req);
        
        if (!validMail)
            return res.status(400).json({ error: "The used email is not valid, please check it."});

        const hashedPassword = await bcrypt.hash(password, 12);
        const newUser = await User.create({
            username,
            email,
            password: hashedPassword,
            role: "Admin"
        });
        
        let returnValue = {
            data: { message : "Admin added successfully" },
        };

        return res.status(200).json(returnValue);
    } catch (err) {
        res.status(500).json( err.message );
    }

}

/**
 * Perform login 
  - Request Parameters: None
  - Request Body Content: An object having attributes `email` and `password`
    - Example: `{email: "mario.red@email.com", password: "securePass"}`
  - Response `data` Content: An object with the created accessToken and refreshToken
    - Example: `res.status(200).json({data: {accessToken: accessToken, refreshToken: refreshToken}})`
  - Optional behavior:
    - Returns a 400 error if the request body does not contain all the necessary attributes
    - Returns a 400 error if at least one of the parameters in the request body is an empty string
    - Returns a 400 error if the email in the request body is not in a valid email format
    - Returns a 400 error if the email in the request body does not identify a user in the database
    - Returns a 400 error if the supplied password does not match with the one in the database
 */
export const login = async (req, res) => { 
    
    // Check for presence of all necessary attributes
    if (!req.body.hasOwnProperty("email") || !req.body.hasOwnProperty("password"))
        return res.status(400).json({ error: "Missing parameters in the body of the request" });
    
    const { email, password } = req.body;
    const cookie = req.cookies;

    // Check for presence of values in all necessary attributes
    if (email === "" || password === "")
        return res.status(400).json({ error: "Missing parameters in the body of the request" });
    
    // Check if the email is valid
    const validMail = verifyEmail(req);
    if (!validMail)
        return res.status(400).json({ error: "The email is not valid, please check it"});

    const existingUser = await User.findOne({ email: email });
    if (!existingUser) 
        return res.status(400).json({ error: 'Please you need to register to access the services' });

    try {

        // Password mismatch
        const match = await bcrypt.compare(password, existingUser.password)
        if (!match) 
            return res.status(400).json({ error: 'Wrong credentials' })

        //CREATE ACCESSTOKEN
        const accessToken = jwt.sign({
            email: existingUser.email,
            id: existingUser.id,
            username: existingUser.username,
            role: existingUser.role
        }, process.env.ACCESS_KEY, { expiresIn: '1h' })

        //CREATE REFRESH TOKEN
        const refreshToken = jwt.sign({
            email: existingUser.email,
            id: existingUser.id,
            username: existingUser.username,
            role: existingUser.role
        }, process.env.ACCESS_KEY, { expiresIn: '7d' })

        //SAVE REFRESH TOKEN TO DB
        existingUser.refreshToken = refreshToken
        const savedUser = await existingUser.save()
        res.cookie("accessToken", accessToken, { httpOnly: true, domain: "localhost", path: "/api", maxAge: 60 * 60 * 1000, sameSite: "none", secure: true })
        res.cookie('refreshToken', refreshToken, { httpOnly: true, domain: "localhost", path: '/api', maxAge: 7 * 24 * 60 * 60 * 1000, sameSite: 'none', secure: true })
        return res.status(200).json({ data: { accessToken: accessToken, refreshToken: refreshToken }})
    
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}

/**
 * Perform logout
  - Auth type: Simple
  - Request Parameters: None
  - Request Body Content: None
  - Response `data` Content: A message confirming successful logout
    - Example: `res.status(200).json({data: {message: "User logged out"}})`
  - Optional behavior:
    - Returns a 400 error if the request does not have a refresh token in the cookies
    - Returns a 400 error if the refresh token in the request's cookies does not represent a user in the database
 */
export const logout = async (req, res) => {

    const refreshToken = req.cookies.refreshToken
    if (!refreshToken) 
        return res.status(400).json({ error: "User not found" })

    // Verify user existance
    const user = await User.findOne({ refreshToken: refreshToken })
    if (!user) 
        return res.status(400).json({ error: 'User not found' })

    try {
        // Once user has been confirmed to exist, check if the token is expired
        const decodedRefreshToken = jwt.verify(refreshToken, process.env.ACCESS_KEY);
        let returnValue = {
            data: { message : "User logged out"},
        };
        
        user.refreshToken = null
        res.cookie("accessToken", "", { httpOnly: true, path: '/api', maxAge: 0, sameSite: 'none', secure: true })
        res.cookie('refreshToken', "", { httpOnly: true, path: '/api', maxAge: 0, sameSite: 'none', secure: true })
        const savedUser = await user.save()
        return res.status(200).json(returnValue);
    } catch (error) {
        if (error.name === "TokenExpiredError") {
            res.status(400).json({ error: "User is already logged out of the system" });
        }
        else {
            res.status(400).json({ error: error.message })
        }
    }
}