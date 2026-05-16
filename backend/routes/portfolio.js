const express = require('express');
const router = express.Router();
const prisma = require('../config/db');

// GET /api/portfolio - Get portfolios (optionally filter by developerId)
router.get('/', async (req, res) => {
  try {
    const { developerId } = req.query;
    const filter = developerId ? { developerId } : {};

    const portfolios = await prisma.developerPortfolio.findMany({
      where: filter,
      include: {
        developer: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
            role: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(portfolios);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error fetching portfolios' });
  }
});

// POST /api/portfolio - Create a new portfolio item
router.post('/', async (req, res) => {
  try {
    const { title, description, techStack, liveUrl, githubUrl, developerId } = req.body;

    if (!title || !developerId) {
      return res.status(400).json({ error: 'Title and developerId are required' });
    }

    const portfolio = await prisma.developerPortfolio.create({
      data: {
        title,
        description,
        techStack,
        liveUrl,
        githubUrl,
        developerId
      },
      include: {
        developer: {
          select: { id: true, name: true, email: true, avatar: true }
        }
      }
    });

    res.status(201).json(portfolio);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error creating portfolio item' });
  }
});

// DELETE /api/portfolio/:id - Delete a portfolio item
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.developerPortfolio.delete({
      where: { id }
    });
    res.json({ message: 'Portfolio item deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error deleting portfolio item' });
  }
});

module.exports = router;
