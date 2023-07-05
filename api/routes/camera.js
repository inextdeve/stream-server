import express from "express";
import { stream } from "../controller/camera.js";

const router = express.Router();

//Camera API
router.get("/stream/:id/:analytic", stream);

export default router;
