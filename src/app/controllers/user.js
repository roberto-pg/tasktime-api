const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const authMiddleware = require('../middlewares/auth');

require('dotenv/config');

const mailer = require('../../modules/mailer');
const User = require('../models/user');

const router = express.Router();

function generateToken(params = {}) {
    return jwt.sign(params, process.env.JWT_SECRET, {
        expiresIn: '7 days',
    });
}

router.get('/', authMiddleware, async (req, res) => {
    try {
        const users = await User.find();

        return res.send({ users });
    } catch (err) {
        return res.status(400).send({ error: 'Error loading users' });
    }
});

router.get('/:userId', authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.params.userId);//.populate('user');

        return res.send({ user });
    } catch (err) {
        return res.status(400).send({ error: 'Error loading user' });
    }
});

router.post('/register', authMiddleware, async (req, res) => {
    const { email } = req.body;

    try {
        if (await User.findOne({ email }))
            return res.status(400).send({ error: 'Email already exists' })

        const user = await User.create(req.body);

        //Para não retornar o password após criar o usuário
        user.password = undefined;

        return res.send({
            user,
            token: generateToken({ id: user.id }),
        });
    } catch (err) {
        return res.status(400).send({ error: 'Registration failed' });
    }
});

router.post('/authenticate', async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');

    if (!user)
        return res.status(400).send({ error: 'User not found' })

    if (!await bcrypt.compare(password, user.password))
        return res.status(400).send({ error: 'Invalid password' })

    //Para não retornar o password após criar o usuário
    user.password = undefined;

    res.send({
        user,
        token: generateToken({ id: user.id }),
    });
})

router.post('/forgot_password', async (req, res) => {
    const { email } = req.body;

    try {
        const user = await User.findOne({ email });

        if (!user)
            return res.status(400).send({ error: 'User not found' });

        const token = crypto.randomBytes(20).toString('hex');
        const now = new Date();
        now.setHours(now.getHours() + 1);

        await User.findByIdAndUpdate(user.id, {
            '$set': {
                passwordResetToken: token,
                passwordResetExpires: now,
            }
        });

        await mailer.sendMail({
            to: email,
            from: `Task Time <${process.env.MAIL_USER}>`,
            //from: `Task Time <${email}>`,
            subject: 'Teste',
            text: 'teste',
            template: 'forgot_password',
            context: { token },
        }, (err) => {
            if (err)
                return res.status(400).send({ error: 'Cannot send forgot password email' });

            return res.send({ message: 'email sent successfully' });
        })
    } catch {
        res.status(400).send({ error: 'Erro on forgot password, try again' });
    }
});

router.post('/reset_password', async (req, res) => {
    const { email, token, password } = req.body;

    try {
        const user = await User.findOne({ email })
            .select('+passwordResetToken passwordResetExpires');

        if (!user)
            return res.status(400).send({ error: 'User not found' });

        if (token !== user.passwordResetToken)
            return res.status(400).send({ error: 'Token invalid' });

        const now = new Date();
        if (now > user.passwordResetExpires)
            return res.status(400).send({ error: 'Token expired, generate a new one' });

        user.password = password;
        await user.save();
        res.send();

    } catch (err) {
        res.status(400).send({ error: 'Cannot reset password, try again' });
    }
});

router.delete('/:userId', authMiddleware, async (req, res) => {
    try {

        const user = await User.findById(req.params.userId)

        if (!user) {
            return res.status(400).send({ error: 'User not found' });
        }

        await User.findByIdAndRemove(req.params.userId);

        return res.send({ message: 'User deleted' });
    } catch (err) {
        return res.status(400).send({ error: 'Error deleting user' });
    }
});

module.exports = router;