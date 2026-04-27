import mongoose from "mongoose";

const bottleSchema = new mongoose.Schema(
  {
    productId: {
      type: String,
      trim: true,
    },
    barcode: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    brandName: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      trim: true,
    },
    bottleSizeML: {
      type: Number,
      required: true,
      default: 750,
    },
    emptyBottleWeightG: {
      type: Number,
      required: true,
      default: 400,
    },
    costPrice: {
      type: Number,
      default: 0,
    },
    sellingPrice: {
      type: Number,
      default: 0,
    },
    outlet: {
      type: String,
      default: "",
    },
    location: {
      type: String,
      default: "Stock Room",
    },
    status: {
      type: String,
      default: "Active",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Bottle", bottleSchema);
