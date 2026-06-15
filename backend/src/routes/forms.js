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
const uploadFields = upload.fields([
  { name: 'logo',    maxCount: 1 },
  { name: 'bgImage', maxCount: 1 },
  { name: 'banner',  maxCount: 1 },
]);

function toUrl(req, filePath) {
  return filePath
    ? `${req.protocol}://${req.get('host')}/uploads/${path.basename(filePath)}`
    : null;
}

// List forms for authenticated user
router.get('/', requireAuth, async (req, res) => {
  const forms = await prisma.form.findMany({
    where: { userId: req.user.id },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      identifier: true,
      title: true,
      formType: true,
      logoPath: true,
      createdAt: true,
      _count: { select: { leads: true } },
    },
  });
  res.json(forms);
});

// Get single form by identifier (public)
router.get('/:identifier', async (req, res) => {
  const form = await prisma.form.findUnique({
    where: { identifier: req.params.identifier },
    select: {
      title: true, schema: true, logoPath: true, bgColor: true, bgImagePath: true,
      borderColor: true, borderWidth: true, borderStyle: true, borderRadius: true, cardShadow: true,
      bannerImagePath: true, formType: true,
    },
  });
  if (!form) return res.status(404).json({ error: 'Form not found' });

  res.json({
    title: form.title,
    schema: form.schema,
    logoUrl: toUrl(req, form.logoPath),
    bgColor: form.bgColor || null,
    bgImageUrl: toUrl(req, form.bgImagePath),
    borderColor: form.borderColor || null,
    borderWidth: form.borderWidth ?? 0,
    borderStyle: form.borderStyle || 'solid',
    borderRadius: form.borderRadius ?? 8,
    cardShadow: form.cardShadow || 'md',
    bannerImageUrl: toUrl(req, form.bannerImagePath),
  });
});

// Get submissions for a form (auth required)
router.get('/:identifier/submissions', requireAuth, async (req, res) => {
  const form = await prisma.form.findUnique({ where: { identifier: req.params.identifier } });
  if (!form) return res.status(404).json({ error: 'Form not found' });
  if (form.userId !== req.user.id) return res.status(403).json({ error: 'Forbidden' });

  const leads = await prisma.lead.findMany({
    where: { formId: form.id },
    orderBy: { createdAt: 'desc' },
  });
  res.json({ title: form.title, leads });
});

// Create form
router.post('/', requireAuth, uploadFields, async (req, res) => {
  const { title, schema, bgColor, formType, borderColor, borderWidth, borderStyle, borderRadius, cardShadow } = req.body;
  if (!title || !schema) {
    return res.status(400).json({ error: 'Title and schema required' });
  }

  let parsedSchema;
  try {
    parsedSchema = JSON.parse(schema);
  } catch {
    return res.status(400).json({ error: 'Invalid schema JSON' });
  }

  const logoFile = req.files?.logo?.[0];
  const bgImageFile = req.files?.bgImage?.[0];
  const bannerFile = req.files?.banner?.[0];

  const form = await prisma.form.create({
    data: {
      identifier: `temp-${Date.now()}`,
      title,
      schema: parsedSchema,
      formType: formType || 'Lead Form',
      logoPath: logoFile ? logoFile.path : null,
      bgColor: bgColor || null,
      bgImagePath: bgImageFile ? bgImageFile.path : null,
      bannerImagePath: bannerFile ? bannerFile.path : null,
      borderColor: borderColor || null,
      borderWidth: borderWidth ? parseInt(borderWidth) : 0,
      borderStyle: borderStyle || 'solid',
      borderRadius: borderRadius ? parseInt(borderRadius) : 8,
      cardShadow: cardShadow || 'md',
      userId: req.user.id,
    },
  });

  const identifier = generateIdentifier(form.id, req.user.id);
  const updated = await prisma.form.update({ where: { id: form.id }, data: { identifier } });

  res.status(201).json(updated);
});

// Duplicate form
router.post('/:identifier/duplicate', requireAuth, async (req, res) => {
  const form = await prisma.form.findUnique({ where: { identifier: req.params.identifier } });
  if (!form) return res.status(404).json({ error: 'Form not found' });
  if (form.userId !== req.user.id) return res.status(403).json({ error: 'Forbidden' });

  const copy = await prisma.form.create({
    data: {
      identifier: `temp-${Date.now()}`,
      title: `Copy of ${form.title}`,
      schema: form.schema,
      formType: form.formType,
      bgColor: form.bgColor,
      userId: req.user.id,
    },
  });

  const identifier = generateIdentifier(copy.id, req.user.id);
  const updated = await prisma.form.update({ where: { id: copy.id }, data: { identifier } });

  res.status(201).json(updated);
});

// Update form
router.patch('/:identifier', requireAuth, uploadFields, async (req, res) => {
  const form = await prisma.form.findUnique({ where: { identifier: req.params.identifier } });
  if (!form) return res.status(404).json({ error: 'Form not found' });
  if (form.userId !== req.user.id) return res.status(403).json({ error: 'Forbidden' });

  const data = {};
  if (req.body.title) data.title = req.body.title;
  if (req.body.formType) data.formType = req.body.formType;
  if (req.body.schema) {
    try {
      data.schema = JSON.parse(req.body.schema);
    } catch {
      return res.status(400).json({ error: 'Invalid schema JSON' });
    }
  }
  if ('bgColor'      in req.body) data.bgColor      = req.body.bgColor      || null;
  if (req.body.removeBgImage === 'true') data.bgImagePath = null;
  if ('borderColor'  in req.body) data.borderColor  = req.body.borderColor  || null;
  if ('borderWidth'  in req.body) data.borderWidth  = req.body.borderWidth  ? parseInt(req.body.borderWidth)  : 0;
  if ('borderStyle'  in req.body) data.borderStyle  = req.body.borderStyle  || 'solid';
  if ('borderRadius' in req.body) data.borderRadius = req.body.borderRadius ? parseInt(req.body.borderRadius) : 8;
  if ('cardShadow'   in req.body) data.cardShadow   = req.body.cardShadow   || 'md';

  const logoFile = req.files?.logo?.[0];
  const bgImageFile = req.files?.bgImage?.[0];
  const bannerFile = req.files?.banner?.[0];
  if (logoFile) data.logoPath = logoFile.path;
  if (bgImageFile) data.bgImagePath = bgImageFile.path;
  if (bannerFile) data.bannerImagePath = bannerFile.path;
  if (req.body.removeBanner === 'true') data.bannerImagePath = null;

  const updated = await prisma.form.update({ where: { id: form.id }, data });
  res.json(updated);
});

// Delete form
router.delete('/:identifier', requireAuth, async (req, res) => {
  const form = await prisma.form.findUnique({ where: { identifier: req.params.identifier } });
  if (!form) return res.status(404).json({ error: 'Form not found' });
  if (form.userId !== req.user.id) return res.status(403).json({ error: 'Forbidden' });

  await prisma.form.delete({ where: { id: form.id } });
  res.json({ message: 'Form deleted' });
});

module.exports = router;
