import { Router } from "express";
import { getAllStudent, validateAnswer } from "../controllers/validationControllers";

const router:Router = Router()

router.post("/get-all-student", getAllStudent)
router.post("/get-validation", validateAnswer)

export default router