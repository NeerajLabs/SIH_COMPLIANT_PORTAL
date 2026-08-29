import express from "express";
import crypto from "crypto";
import Ticket from "../models/Ticket.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

function createTicketId() {
  const suffix = crypto.randomBytes(3).toString("hex").toUpperCase();
  return `TKT-${suffix}`;
}

router.post("/", requireAuth, async (req, res) => {
  try {
    const employeeId = req.user.employeeId;
    const employeeName = String(req.body.employeeName || "").trim();
    const complaint = String(req.body.complaint || "").trim();

    if (!employeeName || !complaint) {
      return res.status(400).json({
        message: "Employee name and complaint are required."
      });
    }

    let ticketId = createTicketId();

    while (await Ticket.exists({ ticketId })) {
      ticketId = createTicketId();
    }

    const ticket = await Ticket.create({
      ticketId,
      employeeId,
      employeeName,
      complaint,
      status: "Open"
    });

    return res.status(201).json({
      message: "Complaint submitted successfully.",
      ticket
    });
  } catch (error) {
    console.error("Create ticket error:", error);
    return res.status(500).json({
      message: "Unable to submit complaint."
    });
  }
});

router.get("/my", requireAuth, async (req, res) => {
  try {
    const tickets = await Ticket.find({
      employeeId: req.user.employeeId
    }).sort({ createdAt: -1 });

    return res.json({ tickets });
  } catch (error) {
    console.error("History error:", error);
    return res.status(500).json({
      message: "Unable to load complaint history."
    });
  }
});

export default router;
