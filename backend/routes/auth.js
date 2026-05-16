const express = require('express');
const prisma = require('../config/db');
const { clearAuthCookie, setAuthCookie } = require('../config/auth');
const { sendOnboardingEmail } = require('../config/mailer');
const router = express.Router();

// Email & Password Login Route
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user || user.password !== password) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        setAuthCookie(res, user);
        res.json(user);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Create Developer Route (for Managers/Admins)
router.post('/create-developer', async (req, res) => {
    try {
        const { name, email, password, role } = req.body;
        if (!name || !email || !password) {
            return res.status(400).json({ error: 'Name, email, and password are required' });
        }

        const existing = await prisma.user.findUnique({ where: { email } });
        if (existing) {
            return res.status(400).json({ error: 'User with this email already exists' });
        }

        const user = await prisma.user.create({
            data: {
                name,
                email,
                password,
                role: role || 'Developer',
                avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`
            }
        });

        let emailSent = false;
        let emailError = null;

        try {
            const emailResult = await sendOnboardingEmail({ name, email, password, role: role || 'Developer' });
            emailSent = emailResult.sent;
            emailError = emailResult.reason || null;
        } catch (mailError) {
            emailError = mailError.message;
        }

        res.status(201).json({
            ...user,
            emailSent,
            emailError
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/logout', (req, res) => {
    clearAuthCookie(res);
    const redirectUrl = process.env.VERCEL || process.env.NODE_ENV === 'production' ? '/' : 'http://localhost:5173/';
    res.redirect(redirectUrl);
});

router.get('/current_user', (req, res) => {
    res.send(req.user || null);
});

// Demo Login Route for easy testing
router.get('/demo/:role', async (req, res, next) => {
    try {
        const role = req.params.role; // 'Admin', 'Manager', or 'Developer'
        const email = `demo-${role.toLowerCase()}@example.com`;
        
        let user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            user = await prisma.user.create({
                data: {
                    name: `Demo ${role}`,
                    email,
                    password: 'demopassword123',
                    role: role,
                    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${role}`
                }
            });
        }

        setAuthCookie(res, user);
        const redirectUrl = process.env.VERCEL || process.env.NODE_ENV === 'production' ? '/dashboard' : 'http://localhost:5173/dashboard';
        res.redirect(redirectUrl);
    } catch (err) {
        next(err);
    }
});

router.get('/users', async (req, res) => {
    try {
        const users = await prisma.user.findMany({
            select: { id: true, name: true, email: true, role: true, avatar: true },
            orderBy: { createdAt: 'desc' }
        });
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Request Password Change (User -> Admin/Manager)
router.post('/password-request', async (req, res) => {
    try {
        if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
        const { reason } = req.body;
        const request = await prisma.passwordRequest.create({
            data: {
                userId: req.user.id || req.user._id,
                reason: reason || 'Forgot password / Request change',
                status: 'Pending'
            }
        });
        res.status(201).json(request);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get All Password Requests (Admin/Manager)
router.get('/password-requests', async (req, res) => {
    try {
        if (!req.user || req.user.role === 'Developer') {
            return res.status(403).json({ error: 'Forbidden' });
        }
        const requests = await prisma.passwordRequest.findMany({
            include: {
                user: { select: { name: true, email: true, role: true } }
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json(requests);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Approve/Reject Password Request (Admin/Manager)
router.put('/password-requests/:id', async (req, res) => {
    try {
        if (!req.user || req.user.role === 'Developer') {
            return res.status(403).json({ error: 'Forbidden' });
        }
        const { status, newPassword } = req.body;
        const { id } = req.params;

        const request = await prisma.passwordRequest.update({
            where: { id },
            data: { status }
        });

        if (status === 'Approved' && newPassword) {
            await prisma.user.update({
                where: { id: request.userId },
                data: { password: newPassword }
            });
        }

        res.json(request);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Change Password directly (User)
router.put('/change-password', async (req, res) => {
    try {
        if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
        const { currentPassword, newPassword } = req.body;

        const user = await prisma.user.findUnique({ where: { id: req.user.id || req.user._id } });
        if (!user || user.password !== currentPassword) {
            return res.status(400).json({ error: 'Incorrect current password' });
        }

        await prisma.user.update({
            where: { id: user.id },
            data: { password: newPassword }
        });

        res.json({ success: true, message: 'Password updated successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
