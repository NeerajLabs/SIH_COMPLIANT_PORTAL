import express from "express";
import jwt from "jsonwebtoken";

const router = express.Router();

router.post("/login", async (req, res) => {
  try {
    const employeeId = String(req.body.employeeId || "").trim();
    const password = String(req.body.password || "");

    if (!employeeId || !password) {
      return res.status(400).json({
        message: "Employee ID and password are required."
      });
    }

    /*
      Prototype authentication:
      The original HTML did not have a real employee account database.
      Therefore this endpoint accepts any non-empty password and issues
      a token for the entered employee ID.

      Replace this block with your real employee authentication logic
      before using this portal for production employee accounts.
    */

    const token = jwt.sign(
      {
        employeeId
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "8h"
      }
    );

    return res.json({
      token,
      employeeId
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({
      message: "Unable to sign in."
    });
  }
});

export default router;
