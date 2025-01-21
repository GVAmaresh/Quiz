import { Router } from "express";
import { saveStudentAnswer, uniqueStudentName } from "../controllers/studentController";

const router:Router = Router()

router.post("/student-ans", saveStudentAnswer)
router.post("/unique-username", uniqueStudentName)


export default router