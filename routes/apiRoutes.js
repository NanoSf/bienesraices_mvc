import express from "express";
import { propiedades } from "../controllers/apiControllers.js";

const router = express.Router();

router.get('/propiedades', propiedades);

export default router;