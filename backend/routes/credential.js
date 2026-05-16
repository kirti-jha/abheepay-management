const express = require('express');
const router = express.Router();
const prisma = require('../config/db');

// Get all credentials for a user (with hierarchy access)
router.get('/', async (req, res) => {
    try {
        const { userId } = req.query;
        if (!userId) return res.status(400).json({ error: 'userId is required' });

        const reqUser = await prisma.user.findUnique({ where: { id: userId } });
        if (!reqUser) return res.status(404).json({ error: 'User not found' });

        let whereClause = { userId };

        if (reqUser.role === 'Admin') {
            // Admin sees ALL credentials in the entire system
            whereClause = {};
        } else if (reqUser.role === 'Manager') {
            // Manager sees their own credentials AND all Developers' credentials
            whereClause = {
                OR: [
                    { userId },
                    { user: { role: 'Developer' } }
                ]
            };
        }

        const credentials = await prisma.credential.findMany({
            where: whereClause,
            include: {
                user: { select: { id: true, name: true, role: true, email: true, avatar: true } }
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json(credentials);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Add a new credential
router.post('/', async (req, res) => {
    try {
        const { userId, siteName, url, username, password, notes } = req.body;
        const credential = await prisma.credential.create({
            data: { userId, siteName, url, username, password, notes }
        });
        res.status(201).json(credential);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Delete a credential
router.delete('/:id', async (req, res) => {
    try {
        await prisma.credential.delete({ where: { id: req.params.id } });
        res.json({ message: 'Credential deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
