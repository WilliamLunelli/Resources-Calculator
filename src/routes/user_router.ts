import express from "express";

const router = express.Router();

// LOGIN
router.post("/login", (req, res) => {
  res.json({
    message: "ROTA LOGIN",
  });
});

// REGISTER
router.get("/register", (req, res) => {
  res.json({
    message: "ROTA REGISTER",
  });
});

export default router;
