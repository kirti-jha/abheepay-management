const express = require('express');
const router = express.Router();
const prisma = require('../config/db');
const upload = require('../middleware/upload');
const fs = require('fs');

// Get all projects
router.get('/', async (req, res) => {
    try {
        const projects = await prisma.project.findMany({
            include: {
                manager: { select: { id: true, name: true, email: true, avatar: true } },
                members: { include: { user: { select: { id: true, name: true, email: true, avatar: true } } } },
                brdFiles: true,
                figmaLinks: true,
                figmaImages: true,
            }
        });
        res.json(projects);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get a single project
router.get('/:id', async (req, res) => {
    try {
        const project = await prisma.project.findUnique({
            where: { id: req.params.id },
            include: {
                manager: { select: { id: true, name: true, email: true, avatar: true } },
                members: { include: { user: { select: { id: true, name: true, email: true, avatar: true } } } },
                brdFiles: true,
                figmaLinks: true,
                figmaImages: true,
                tasks: { include: { assignedTo: { select: { id: true, name: true } } } }
            }
        });
        if (!project) return res.status(404).json({ error: 'Project not found' });
        res.json(project);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Create a project
router.post('/', async (req, res) => {
    try {
        const { title, description, managerId, developerIds, figmaLink, brdFileUrl } = req.body;
        const project = await prisma.project.create({
            data: {
                title,
                description,
                managerId,
                members: {
                    create: (developerIds || []).map(uid => ({ userId: uid }))
                },
                figmaLinks: figmaLink ? { create: { url: figmaLink } } : undefined,
                brdFiles: brdFileUrl ? { create: { filename: 'BRD / Architecture Document', path: brdFileUrl } } : undefined
            },
            include: { members: true, figmaLinks: true, brdFiles: true }
        });
        res.status(201).json(project);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Upload BRD or Figma image files
router.post('/:id/upload', upload.array('files', 10), async (req, res) => {
    try {
        const project = await prisma.project.findUnique({ where: { id: req.params.id } });
        if (!project) return res.status(404).json({ error: 'Project not found' });

        for (const file of req.files) {
            const filePath = `/uploads/${file.filename}`;
            if (file.mimetype.startsWith('image/')) {
                await prisma.figmaImage.create({ data: { filename: file.originalname, path: filePath, projectId: project.id } });
            } else {
                await prisma.brdFile.create({ data: { filename: file.originalname, path: filePath, projectId: project.id } });
            }
        }

        const updated = await prisma.project.findUnique({
            where: { id: req.params.id },
            include: { brdFiles: true, figmaImages: true, figmaLinks: true }
        });
        res.json(updated);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Add Figma link
router.post('/:id/figma-link', async (req, res) => {
    try {
        const link = await prisma.figmaLink.create({
            data: { url: req.body.link, projectId: req.params.id }
        });
        res.json(link);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
