import { Router } from 'express';
import { createQuiz, getQuestion, getAllQId, deleteQuestion, uniquePublicKey } from '../controllers/quizControllers';

const router: Router = Router();

router.post('/create-quiz', uniquePublicKey, createQuiz);
router.post('/get-quiz', getQuestion);
router.post("/get-quiz-list", getAllQId)
router.post("/delete-quiz", uniquePublicKey, deleteQuestion)


export default router;