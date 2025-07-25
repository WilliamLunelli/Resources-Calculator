import express from "express";

const router = express.Router();

router.get("/calc", (req, res) => {
  res.json({
    message: "CALCULATOR ROUTER",
  });
});

export default router;
