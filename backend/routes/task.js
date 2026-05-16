const express = require('express');
const router = express.Router();
const prisma = require('../config/db');

// Get tasks (optionally filter by assignedToId or projectId)
router.get('/', async (req, res) => {
    try {
        const { developerId, projectId } = req.query;
        const where = {};
        if (developerId) where.assignedToId = developerId;
        if (projectId) where.projectId = projectId;

        const tasks = await prisma.task.findMany({
            where,
            include: {
                assignedTo: { select: { id: true, name: true, email: true } },
                createdBy:  { select: { id: true, name: true, email: true } },
                project:    { select: { id: true, title: true } },
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json(tasks);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Create a task
router.post('/', async (req, res) => {
    try {
        const { title, description, projectId, assignedToId, createdById, status, priority } = req.body;
        const task = await prisma.task.create({
            data: { title, description, projectId, assignedToId, createdById, status, priority }
        });
        res.status(201).json(task);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Update a task (e.g., status change)
router.put('/:id', async (req, res) => {
    try {
        const task = await prisma.task.update({
            where: { id: req.params.id },
            data: req.body
        });
        res.json(task);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Delete a task
router.delete('/:id', async (req, res) => {
    try {
        await prisma.task.delete({ where: { id: req.params.id } });
        res.json({ message: 'Task deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
