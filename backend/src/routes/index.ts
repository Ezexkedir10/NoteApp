import { Router } from "express";
import healthRoutes from "./health.routes";
import noteRoutes from "./note.routes";

const router = Router();

router.use("/health", healthRoutes);
router.use("/notes", noteRoutes);

export default router;
