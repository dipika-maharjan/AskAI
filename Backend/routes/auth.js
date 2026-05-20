import express from 'express';
import User from '../models/User.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';

const router = express.Router();

//register
router.post("/register", [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Invaid Email'),
    body('password').isLength({min: 8}).withMessage('Password must be more than 8 characters')
], async(req, res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({
            errors: errors.array()
        })
    }
    const {name, email, password} = req.body;
    try{
        const existing = await User.findOne({email});
        if(existing){
            return res.status(409).json({message: "Email already exists"});
        }
        const hashed = await bcrypt.hash(password, 10);
        const user = await User.create({name, email, password: hashed});

        const token = jwt.sign({id: user._id, role: user.role}, process.env.JWT_SECRET, {expiresIn: '15d'});
        return res.status(201).json({token, user: {id: user._id, name: user.name, email: user.email, role: user.role} });
    }catch(err){
        console.log(err);
        return res.status(500).json({message: 'Server error'})
    }
});

router.post("/login", [
    body('email').isEmail().withMessage('Invalid email').normalizeEmail(),
    body('password').notEmpty().withMessage('Password is required')
], async(req, res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({errors: errors.array() });
    }
    const {email, password} = req.body;
    try{
        const user = await User.findOne({email});
        if(!user){
            return res.status(401).json({message: 'User not found'})
        }

        const match = await bcrypt.compare(password, user.password);
        if(!match){
            return res.status(401).json({message: "Password doesn't match"})
        }
        const token = jwt.sign({id: user._id, role: user.role}, process.env.JWT_SECRET, {expiresIn: '15d'});
        return res.json({token, user: {id: user._id, name: user.name, email: user.email, role: user.role} });

    }catch(err){
        console.log(err);
        return res.status(500).json({message: 'Server error'})
    }
});

export default router;