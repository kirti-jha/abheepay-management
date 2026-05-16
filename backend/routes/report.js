const express = require('express');
const router = express.Router();
const prisma = require('../config/db');

// Get daily reports (optionally filter by developerId)
router.get('/', async (req, res) => {
    try {
        const { developerId } = req.query;
        const where = {};
        if (developerId) where.developerId = developerId;

        const reports = await prisma.dailyReport.findMany({
            where,
            include: {
                developer: { select: { id: true, name: true, email: true, avatar: true } }
            },
            orderBy: { date: 'desc' }
        });
        res.json(reports);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Submit a daily report
router.post('/', async (req, res) => {
    try {
        const { developerId, tasksCompleted, tasksInProgress, hurdlesFaced, dependencies, hoursLogged, inTime, outTime, workLocation } = req.body;
        const report = await prisma.dailyReport.create({
            data: {
                developerId,
                tasksCompleted,
                tasksInProgress,
                hurdlesFaced,
                dependencies,
                hoursLogged: parseFloat(hoursLogged || 0),
                inTime: inTime || "10:00 AM",
                outTime: outTime || "07:00 PM",
                workLocation: workLocation || "Office"
            }
        });
        res.status(201).json(report);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

module.exports = router;
