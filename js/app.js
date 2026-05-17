const API_URL = "http://localhost:5001/api";

/* =========================
   DEFAULT USER PLAN
========================= */

if (
  !localStorage.getItem(
    "plan"
  )
) {

  localStorage.setItem(
    "plan",
    "free"
  );
}

let totalBudget = 0;
let totalSpent = 0;


/* =========================
   REGISTER
========================= */

async function register() {

  const name =
    document.getElementById("name").value;

  const email =
    document.getElementById("email").value;

  const password =
    document.getElementById("password").value;

  try {

    const res = await fetch(
      `${API_URL}/auth/register`,
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json"
        },

        body: JSON.stringify({
          name,
          email,
          password
        })
      }
    );

    const data = await res.json();

    alert(data.message);

    if (res.ok) {

      window.location.href =
        "login.html";
    }

  } catch (error) {

    console.error(error);

    alert("Registration failed");
  }
}



/* =========================
   LOGIN
========================= */

async function login() {

  const email =
    document.getElementById("loginEmail").value;

  const password =
    document.getElementById("loginPassword").value;

  try {

    const res = await fetch(
      `${API_URL}/auth/login`,
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json"
        },

        body: JSON.stringify({
          email,
          password
        })
      }
    );

    const data = await res.json();

    if (data.token) {

      localStorage.setItem(
        "token",
        data.token
      );

      window.location.href =
        "dashboard.html";

    } else {

      alert(data.message || "Login failed");
    }

  } catch (error) {

    console.error(error);

    alert("Server error");
  }
}



/* =========================
   LOGOUT
========================= */

function logout() {

  localStorage.removeItem("token");

  window.location.href =
    "index.html";
}



/* =========================
   GENERATE PLAN
========================= */

async function generatePlan() {

  const token =
    localStorage.getItem("token");
  
  /* =========================
   SUBSCRIPTION CHECK
========================= */

const userPlan =
localStorage.getItem(
  "plan"
);

const generatedTrips =
JSON.parse(
  localStorage.getItem(
    "generatedTrips"
  )
) || [];


if (
userPlan === "free" &&
generatedTrips.length >= 2
) {

alert(
  "You've reached your 2 free trips this month. Upgrade to Premium for unlimited AI travel plans 👑"
);

window.location.href =
  "premium.html";

return;
}

  if (!token) {

    alert("Please login again");

    window.location.href =
      "login.html";

    return;
  }

  const destination =
    document.getElementById("destination").value;

  const budget =
    document.getElementById("budget").value;

  const days =
    document.getElementById("days").value;
  
  const travelers =
  document.getElementById(
    "travelers"
  ).value;

  const travelType =
    document.getElementById("travelType").value;

  const preferences =
    document.getElementById("preferences").value;


  document.getElementById("loading")
    .style.display = "block";

  document.getElementById("result")
    .innerHTML = "";


  try {

    const res = await fetch(
      `${API_URL}/planner/generate`,
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
          "Authorization": token
        },

        body: JSON.stringify({
          destination,
          budget,
          days,
          travelers,
          travelType,
          preferences
        })
      }
    );

    const data = await res.json();

    document.getElementById("loading")
      .style.display = "none";


    if (data.plan) {

      /* =========================
   SMART BUDGET ADVISORY
========================= */

const budgetPerPerson =
budget / travelers;

let advice = "";


/* LOW BUDGET */

if (
travelType === "Luxury" &&
budgetPerPerson < 8000
) {

advice =
  "⚠ This budget may be too low for a luxury trip.";

}


/* FAMILY */

else if (
travelType === "Family" &&
budgetPerPerson < 4000
) {

advice =
  "⚠ Family trips usually require a slightly higher budget.";

}


/* BUDGET FRIENDLY */

else if (
budgetPerPerson >= 5000
) {

advice =
  "✅ Your budget looks comfortable for this trip.";
}


/* VERY LOW */

else {

advice =
  "⚠ Budget might feel tight for this destination.";
}


const adviceBox =
document.getElementById(
  "budgetAdvice"
);

adviceBox.style.display =
"block";

adviceBox.innerText =
advice;

      /* SAVE CURRENT ACTIVE TRIP */

      localStorage.setItem(
        "currentTrip",
        JSON.stringify({
          destination,
          budget,
          travelers,
    travelType,
    preferences,
          days,
          plan: data.plan
        })
      );

      /* SAVE GENERATED TRIPS */

generatedTrips.push({
  destination,
  date: new Date()
});

localStorage.setItem(
  "generatedTrips",
  JSON.stringify(generatedTrips)
);


      totalBudget =
        parseInt(budget);

      totalSpent = 0;


      document.getElementById(
        "remainingBudget"
      ).innerText = totalBudget;


      document.getElementById(
        "totalSpent"
      ).innerText = totalSpent;


      document.getElementById("result")
        .innerHTML = `

        <div class="itinerary-output">

          ${formatPlan(data.plan)}

        </div>
      `;
      document.getElementById(
        "postGenerationContent"
      ).style.display = "block";

      /* =========================
   DYNAMIC BOOKING LINKS
========================= */

const encodedDestination =
encodeURIComponent(
  destination
);


/* HOTEL LINKS */

document.querySelectorAll(
".hotel-link"
).forEach(link => {

link.href =
  `https://www.booking.com/searchresults.html?ss=${encodedDestination}`;
});


/* FLIGHT */

const flightLink =
document.getElementById(
  "flightLink"
);

if (flightLink) {

flightLink.href =
  `https://www.skyscanner.co.in`;
}


/* TRAIN */

const trainLink =
document.getElementById(
  "trainLink"
);

if (trainLink) {

trainLink.href =
  `https://www.confirmtkt.com`;
}


/* BUS */

const busLink =
document.getElementById(
  "busLink"
);

if (busLink) {

busLink.href =
  `https://www.redbus.in`;
}

    } else {

      document.getElementById("result")
        .innerText =
        "Failed to generate plan.";
    }

  } catch (error) {

    console.error(error);

    alert("AI generation failed");
  }
}





/* =========================
   FORMAT PLAN
========================= */

function formatPlan(text) {

  return text

    .replace(/\*\*/g, "")

    .replace(/###/g, "")

    .replace(/\n/g, "<br>");
}



/* =========================
   LOAD DASHBOARD
========================= */

async function loadDashboard() {

  const token =
    localStorage.getItem("token");

  if (!token) {

    window.location.href =
      "login.html";

    return;
  }

  /* =========================
   PLAN BADGE
========================= */

const userPlan =
localStorage.getItem("plan");

const badge =
document.getElementById(
  "planBadge"
);

const upgradeBtn =
  document.querySelector(
    ".upgrade-btn"
  );

if (badge) {

if (userPlan === "premium") {

  if (upgradeBtn) {

    upgradeBtn.style.display =
      "none";
  }

  badge.innerText =
    "👑 PREMIUM";

  badge.classList.add(
    "premium-badge"
  );

} else {

  badge.innerText =
    "FREE PLAN";
}
}

  try {

    const res = await fetch(
      `${API_URL}/planner/my-trips`,
      {
        headers: {
          "Authorization": token
        }
      }
    );

    const trips =
      await res.json();


    /* =========================
       TOTAL TRIPS
    ========================== */

    const tripCount =
      document.getElementById(
        "tripCount"
      );

    if (tripCount) {

      tripCount.innerText =
        trips.length;
    }


    /* =========================
       ACTIVE TRIP
    ========================== */

    const currentTripRaw =
      localStorage.getItem(
        "currentTrip"
      );

    const activeTripCard =
      document.getElementById(
        "activeTrip"
      );

    if (
      currentTripRaw &&
      activeTripCard
    ) {

      const currentTrip =
        JSON.parse(currentTripRaw);

      activeTripCard.innerHTML = `

        <p>
          <strong>
            ${currentTrip.destination}
          </strong>
        </p>

        <p>
          ₹${currentTrip.budget}
        </p>

        <p>
          ${currentTrip.days} Days
        </p>
      `;


      /* SHOW COMPLETE BUTTON */

      const completeWrapper =
        document.getElementById(
          "completeTripWrapper"
        );

      if (completeWrapper) {

        completeWrapper.style.display =
          "block";
      }


      /* ACTIVE STEP */

      const activeStep =
        document.getElementById(
          "activeStep"
        );

      if (activeStep) {

        activeStep.classList.add(
          "active"
        );
      }


      /* SET BUDGET */

      totalBudget =
        parseInt(
          currentTrip.budget
        );


      const remainingBudget =
        document.getElementById(
          "remainingBudget"
        );

      if (remainingBudget) {

        remainingBudget.innerText =
          totalBudget;
      }


      /* RESTORE EXPENSES */

      const savedSpent =
        localStorage.getItem(
          "totalSpent"
        );

      if (savedSpent) {

        totalSpent =
          parseInt(savedSpent);


        const totalSpentEl =
          document.getElementById(
            "totalSpent"
          );

        if (totalSpentEl) {

          totalSpentEl.innerText =
            totalSpent;
        }


        if (remainingBudget) {

          remainingBudget.innerText =
            totalBudget - totalSpent;
        }


        const progress =
          (totalSpent / totalBudget) * 100;

        const progressBar =
          document.getElementById(
            "budgetProgress"
          );

        if (progressBar) {

          progressBar.style.width =
            progress + "%";
        }
      }


      /* UPCOMING TRIP BANNER */

      const upcomingBanner =
        document.getElementById(
          "upcomingBanner"
        );

      if (upcomingBanner) {

        upcomingBanner.style.display =
          "flex";
      }


      const bannerDestination =
        document.getElementById(
          "bannerDestination"
        );

      if (bannerDestination) {

        bannerDestination.innerText =
          `${currentTrip.destination} Trip ✈`;
      }


      const bannerDetails =
        document.getElementById(
          "bannerDetails"
        );

      if (bannerDetails) {

        bannerDetails.innerText =
          `${currentTrip.days} Days • ₹${currentTrip.budget}`;
      }
    }


    /* =========================
       COMPLETED TRIP
    ========================== */

    const completedTripRaw =
      localStorage.getItem(
        "completedTrip"
      );

    const latestTripCard =
      document.getElementById(
        "latestTrip"
      );

    if (
      completedTripRaw &&
      latestTripCard
    ) {

      const completedTrip =
        JSON.parse(
          completedTripRaw
        );

      latestTripCard.innerHTML = `

        <p>
          <strong>
            ${completedTrip.destination}
          </strong>
        </p>

        <p>
          ₹${completedTrip.budget}
        </p>

        <p>
          ${completedTrip.days} Days
        </p>
      `;


      const completedStep =
        document.getElementById(
          "completedStep"
        );

      if (completedStep) {

        completedStep.classList.add(
          "active"
        );
      }
    }

  }

  catch (error) {

    console.error(
      "Dashboard Error:",
      error
    );
  }
}


 /* =========================
   EXPENSE TRACKER
========================= */

function addExpense() {

  const amountInput =
    document.getElementById(
      "expenseAmount"
    );

  const amount =
    parseInt(amountInput.value);


  if (
    isNaN(amount) ||
    amount <= 0
  ) {

    alert(
      "Please enter a valid amount"
    );

    return;
  }


  /* ADD EXPENSE */

  totalSpent += amount;


  /* SAVE EXPENSE */

  localStorage.setItem(
    "totalSpent",
    totalSpent
  );


  /* UPDATE UI */

  document.getElementById(
    "totalSpent"
  ).innerText =
    totalSpent;


  const remaining =
    totalBudget - totalSpent;


  document.getElementById(
    "remainingBudget"
  ).innerText =
    remaining;


  /* PROGRESS BAR */

  const progress =
    (totalSpent / totalBudget) * 100;


  document.getElementById(
    "budgetProgress"
  ).style.width =
    progress + "%";


  /* WARNING */

  if (progress >= 80) {

    alert(
      "Warning: Budget almost exhausted!"
    );
  }


  /* CLEAR FIELD */

  amountInput.value = "";
}



/* =========================
   COMPLETE TRIP
========================= */

function completeTrip() {

  const currentTrip =
    localStorage.getItem(
      "currentTrip"
    );

  if (!currentTrip) {

    alert(
      "Generate a trip first!"
    );

    return;
  }

  document.getElementById(
    "experienceModal"
  ).style.display = "flex";
}



/* =========================
   SUBMIT EXPERIENCE
========================= */

function submitExperience() {

  const experience =
    document.getElementById(
      "tripExperience"
    ).value;


  localStorage.setItem(
    "lastTripExperience",
    experience
  );

  finishTrip();
}



/* =========================
   SKIP EXPERIENCE
========================= */

function skipExperience() {

  finishTrip();
}



/* =========================
   FINISH TRIP
========================= */

/* =========================
   FINISH TRIP
========================= */

function finishTrip() {

  const currentTrip =
    localStorage.getItem(
      "currentTrip"
    );

  if (!currentTrip) {

    alert("No active trip found");

    return;
  }


  /* SAVE AS COMPLETED */

  localStorage.setItem(
    "completedTrip",
    currentTrip
  );


  /* REMOVE ACTIVE TRIP */

  localStorage.removeItem(
    "currentTrip"
  );


  /* CLOSE MODAL */

  document.getElementById(
    "experienceModal"
  ).style.display = "none";


  /* SUCCESS */

  alert(
    "Trip completed successfully!"
  );


  /* REFRESH DASHBOARD */

  loadDashboard();
}

/* =========================
   UPGRADE PLAN
========================= */

function upgradePlan() {

  localStorage.setItem(
    "plan",
    "premium"
  );

  alert(
    "Successfully upgraded to Premium!"
  );

  window.location.href =
    "dashboard.html";
}

/* =========================
   PREMIUM PAYMENT
========================= */

function startPremiumPayment() {

  const options = {

    key: "rzp_test_SqV7RYuIfeACJO",

    amount: 9900,

    currency: "INR",

    name: "Vago Premium",

    description:
      "Monthly Premium Subscription",

    handler: function () {

      localStorage.setItem(
        "plan",
        "premium"
      );

      alert(
        "Payment Successful! Welcome to Premium 👑"
      );

      window.location.href =
        "dashboard.html";
    }
  };

  const payment =
    new Razorpay(options);

  payment.open();
}