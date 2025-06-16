import express from 'express';
import { createApplication, listApplications, updateApplicationStatus } from '../controllers/applicationControllers';
import { authMiddleware } from '../middleware/authMiddleware';

const router = express.Router();

router.get('/', authMiddleware(['tenant', 'manager']), listApplications);
router.put('/:id/status', authMiddleware(['manager']), updateApplicationStatus);
router.post('/', authMiddleware(['tenant']), createApplication);

export default router;