import express from "express";
import Reading from "../models/Reading.js";

const router = express.Router();

// Save scanned reading/history
router.post("/", async (req, res) => {
  try {
    const reading = await Reading.create(req.body);

    res.status(201).json({
      message: "Reading saved successfully",
      reading,
    });
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
});

// Get scanned reading/history
router.get("/", async (req, res) => {
  try {
    const readings = await Reading.find().sort({ createdAt: -1 }).limit(500);
    res.json(readings);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

// Delete one reading
router.delete("/:id", async (req, res) => {
  try {
    const reading = await Reading.findByIdAndDelete(req.params.id);

    if (!reading) {
      return res.status(404).json({
        message: "Reading not found",
      });
    }

    res.json({
      message: "Reading deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

export default router;
