import mongoose from "mongoose";

const showSchema = new mongoose.Schema(
  {
    movie: {
      type: String,
      required: true,
      ref: "Movie",
    },

    showDateTime: {
      type: Date,
      required: true,
      index: true,
    },

    showPrice: {
      type: Number,
      required: true,
    },

    showCode: {
      type: String,
      unique: true,
      default: () => "SC" + Math.floor(100000 + Math.random() * 900000).toString(),
    },

    occupiedSeats: {
      type: Object,
      default: {},
    },

    isCancelled: {
      type: Boolean,
      default: false,
    },

    cancellationReason: {
      type: String,
    },
  },
  {
    timestamps: true,
    minimize: false,
  },
);

// Prevent duplicate shows for same movie and time
showSchema.index({ movie: 1, showDateTime: 1 }, { unique: true });

const Show = mongoose.model("Show", showSchema);

export default Show;
