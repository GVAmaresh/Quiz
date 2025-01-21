import { Router } from "express";
import { getTimeRange, setTimeRange } from "../controllers/timeControllers";
import { uniquePublicKey } from "../controllers/quizControllers";

const router:Router = Router()

router.post("/get-time", getTimeRange)
router.post("/set-time", uniquePublicKey, setTimeRange)


export default router