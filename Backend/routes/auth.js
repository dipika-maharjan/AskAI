import express from 'express';
import User from '../models/User.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';
import auth from '../middleware/auth.js';

const router = express.Router();

//register
router.post("/register", [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Invaid Email'),
    body('password').isLength({min: 7}).withMessage('Password should be more than 6 characters')
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

router.put("/profile", auth, [
    body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
    body('email').optional().isEmail().withMessage('Invalid email').normalizeEmail()
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { name, email } = req.body;

    if (!name && !email) {
        return res.status(400).json({ message: 'No changes provided' });
    }

    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (email && email !== user.email) {
            const existing = await User.findOne({ email, _id: { $ne: user._id } });
            if (existing) {
                return res.status(409).json({ message: 'Email already exists' });
            }
            user.email = email;
        }

        if (name) {
            user.name = name;
        }

        await user.save();

        return res.json({
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: 'Server error' });
    }
});

export default router;