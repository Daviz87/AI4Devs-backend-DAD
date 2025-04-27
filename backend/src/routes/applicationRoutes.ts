import { Router } from 'express';
import { updateStage } from '../presentation/controllers/applicationController';

const router = Router();

router.put('/:id/stage', updateStage);

export default router; 