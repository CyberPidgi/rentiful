import express from 'express';
import {
  getProperties,
  getProperty,
  createProperty
} from '../controllers/propertyControllers';
import { authMiddleware } from '../middleware/authMiddleware';
import multer from 'multer';

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer()

router.get('/', getProperties);
router.get('/:id', getProperty);
router.post('/', authMiddleware(['manager']), upload.array('photos'), createProperty)


export default router;