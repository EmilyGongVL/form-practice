const express = require('express');
const multer = require('multer');
const path = require('path');
const { PrismaClient } = require('@prisma/client');
const { requireAuth } = require('../middleware/auth');
const { generateIdentifier } = require('../lib/identifier');

const router = express.Router();
const prisma = new PrismaClient();

const storage = multer.diskStorage({
  destination: path.join(__dirname, '../../uploads'),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`);
  },
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

// List forms for authenticated user
router.get('/', requireAuth, async (req, res) => {
  const forms = await prisma.form.findMany({
    where: { userId: req.user.id },
    orderBy: { createdAt: 'desc' },
    select: { id: true, identifier: true, title: true, logoPath: true, createdAt: true },
  });
  res.json(forms);
});

// Get single form by identifier (public)
router.get('/:identifier', async (req, res) => {
  const form = await prisma.form.findUnique({
    where: { identifier: req.params.identifier },
    select: { title: true, schema: true, logoPath: true },
  });
  if (!form) return res.status(404).json({ error: 'Form not found' });

  const logoUrl = form.logoPath
    ? `${req.protocol}://${req.get('host')}/uploads/${path.basename(form.logoPath)}`
    : null;

  res.json({ title: form.title, schema: form.schema, logoUrl });
});

// Create form
router.post('/', requireAuth, upload.single('logo'), async (req, res) => {
  const { title, schema } = req.body;
  if (!title || !schema) {
    return res.status(400).json({ error: 'Title and schema required' });
  }

  let parsedSchema;
  try {
    parsedSchema = JSON.parse(schema);
  } catch {
    return res.status(400).json({ error: 'Invalid schema JSON' });
  }

  // Two-step insert: create without identifier, then update with generated one
  const form = await prisma.form.create({
    data: {
      identifier: `temp-${Date.now()}`,
      title,
      schema: parsedSchema,
      logoPath: req.file ? req.file.path : null,
      userId: req.user.id,
    },
  });

  const identifier = generateIdentifier(form.id, req.user.id);
  const updated = await prisma.form.update({
    where: { id: form.id },
    data: { identifier },
  });

  res.status(201).json(updated);
});

// Update form
router.patch('/:identifier', requireAuth, upload.single('logo'), async (req, res) => {
  const form = await prisma.form.findUnique({ where: { identifier: req.params.identifier } });
  if (!form) return res.status(404).json({ error: 'Form not found' });
  if (form.userId !== req.user.id) return res.status(403).json({ error: 'Forbidden' });

  const data = {};
  if (req.body.title) data.title = req.body.title;
  if (req.body.schema) {
    try {
      data.schema = JSON.parse(req.body.schema);
    } catch {
      return res.status(400).json({ error: 'Invalid schema JSON' });
    }
  }
  if (req.file) data.logoPath = req.file.path;

  const updated = await prisma.form.update({ where: { id: form.id }, data });
  res.json(updated);
});

module.exports = router;
