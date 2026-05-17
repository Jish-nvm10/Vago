const fs = require("fs");
const path = require("path");
const express = require("express");
const Groq = require("groq-sdk");
const authMiddleware = require("../authMiddleware");

const router = express.Router();

const tripsFile = path.join(__dirname, "../data/trips.json");

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});


// ======================================
// GENERATE AI ITINERARY
// ======================================

router.post("/generate", authMiddleware, async (req, res) => {

  const {
    destination,
    budget,
    days,
    travelType,
    preferences
  } = req.body;

  try {

    const completion =
      await groq.chat.completions.create({

        messages: [

          {
            role: "system",
            content: `
You are a premium AI travel planner.

Generate visually clean travel itineraries.

IMPORTANT:
- DO NOT use markdown symbols like ** or ##
- Use clean HTML tags only
- Use:
<h2>, <h3>, <p>, <ul>, <li>, <strong>

Make the response elegant and structured.

Include:
- Trip title
- Day-wise itinerary
- Budget breakdown
- Daily budget
- Travel tips
`
          },

          {
            role: "user",
            content: `
Create a ${days}-day travel itinerary.

Destination: ${destination}

Budget: ₹${budget}

Travel Type: ${travelType}

Preferences: ${preferences}
`
          }

        ],

        model: "llama-3.1-8b-instant",

        temperature: 0.7

      });

    const planText =
      completion.choices[0].message.content;

    // Read trips
    let trips = [];

    if (fs.existsSync(tripsFile)) {
      trips = JSON.parse(
        fs.readFileSync(tripsFile)
      );
    }

    // New trip object
    const newTrip = {

      id: Date.now(),

      userId: req.user.id,

      destination,

      budget: parseInt(budget),

      days: parseInt(days),

      plan: planText,

      createdAt: new Date()

    };

    // Save trip
    trips.push(newTrip);

    fs.writeFileSync(
      tripsFile,
      JSON.stringify(trips, null, 2)
    );

    // Send response
    res.json({
      plan: planText
    });

  } catch (error) {

    console.error("GROQ ERROR:", error.message);

    res.status(500).json({
      message: "AI generation failed",
      error: error.message
    });

  }

});


// ======================================
// GET USER TRIPS
// ======================================

router.get(
  "/my-trips",
  authMiddleware,
  (req, res) => {

    let trips = [];

    if (fs.existsSync(tripsFile)) {
      trips = JSON.parse(
        fs.readFileSync(tripsFile)
      );
    }

    const userTrips =
      trips.filter(
        trip => trip.userId === req.user.id
      );

    res.json(userTrips);

  }
);


module.exports = router;