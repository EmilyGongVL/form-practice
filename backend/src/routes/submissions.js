const express = require('express');
const { PrismaClient } = require('@prisma/client');

const router = express.Router({ mergeParams: true });
const prisma = new PrismaClient();

router.post('/:identifier/submit', async (req, res) => {
  const form = await prisma.form.findUnique({
    where: { identifier: req.params.identifier },
  });
  if (!form) return res.status(404).json({ error: 'Form not found' });

  const lead = await prisma.lead.create({
    data: { formId: form.id, data: req.body },
  });

  res.status(201).json({ message: 'Submission received', leadId: lead.id });
});

module.exports = router;
