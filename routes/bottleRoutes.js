import express from "express";
import Bottle from "../models/Bottle.js";

const router = express.Router();

// Add bottle from admin panel
router.post("/", async (req, res) => {
  try {
    const {
      productId,
      barcode,
      brandName,
      category,
      bottleSizeML,
      emptyBottleWeightG,
      costPrice,
      sellingPrice,
      outlet,
      location,
      status,
    } = req.body;

    if (!barcode || !brandName) {
      return res.status(400).json({
        message: "Barcode and Brand Name are required",
      });
    }

    const existingBottle = await Bottle.findOne({ barcode: String(barcode).trim() });

    if (existingBottle) {
      return res.status(409).json({
        message: "Bottle with this barcode already exists",
      });
    }

    const bottle = await Bottle.create({
      productId,
      barcode: String(barcode).trim(),
      brandName,
      category,
      bottleSizeML,
      emptyBottleWeightG,
      costPrice,
      sellingPrice,
      outlet,
      location,
      status,
    });

    res.status(201).json({
      message: "Bottle added successfully",
      bottle,
    });
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
});

// Get all bottles for admin panel
router.get("/", async (req, res) => {
  try {
    const { search } = req.query;

    const filter = search
      ? {
          $or: [
            { barcode: { $regex: search, $options: "i" } },
            { productId: { $regex: search, $options: "i" } },
            { brandName: { $regex: search, $options: "i" } },
            { category: { $regex: search, $options: "i" } },
          ],
        }
      : {};

    const bottles = await Bottle.find(filter).sort({ createdAt: -1 });

    res.json(bottles);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

// Get one bottle by barcode for scanner website
router.get("/:barcode", async (req, res) => {
  try {
    const barcode = String(req.params.barcode).trim();

    const bottle = await Bottle.findOne({ barcode });

    if (!bottle) {
      return res.status(404).json({
        message: "Bottle not found",
      });
    }

    res.json(bottle);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

// Update bottle by MongoDB ID
router.put("/:id", async (req, res) => {
  try {
    const bottle = await Bottle.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!bottle) {
      return res.status(404).json({
        message: "Bottle not found",
      });
    }

    res.json({
      message: "Bottle updated successfully",
      bottle,
    });
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
});

// Delete bottle by MongoDB ID
router.delete("/:id", async (req, res) => {
  try {
    const bottle = await Bottle.findByIdAndDelete(req.params.id);

    if (!bottle) {
      return res.status(404).json({
        message: "Bottle not found",
      });
    }

    res.json({
      message: "Bottle deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

export default router;
