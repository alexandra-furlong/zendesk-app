$(function () {
  var client = ZAFClient.init();
  client.invoke("resize", { width: "100%", height: "200px" });

  // Get ticket metadata
  client
    .get("ticket")
    .then(function (ticketData) {
      console.log("ticket meta:", ticketData.ticket); // TODO: Delete this before submitting

      var ticket = ticketData.ticket;

      // Display ticket info & client info if available
      $("#ticket-subject").text(ticket.subject);
      $("#date-created").text(formatDate(ticket.createdAt));
      $("#priority-value").text(capitalizeFirstLetter(ticket.priority));
      $("#assigned-tags").text(ticket.tags.join(", "));

      if (ticket.requester) {
        $("#client-name").text(ticket.requester.name);
        $("#client-email").text(ticket.requester.email);
        $("#client-user-id").text(ticket.requester.id);
      }

      // Calculate simple priority score
      calculatePriorityScore(ticket);

      // Display the custom SLA based on the priority level
      displaySLA(ticket);
    })
    .catch(handleApiError);

  // formatDate()
  // Credit: https://stackoverflow.com/a/63490548
  function formatDate(dateString) {
    if (!dateString) {
      return "No date provided.";
    }

    const options = {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    };
    return new Date(dateString).toLocaleDateString("en-US", options);
  }

  // Credit: https://stackoverflow.com/a/53930826
  function capitalizeFirstLetter(str) {
    return str[0].toUpperCase() + str.slice(1);
  }

  // Set the correct icon color based on the priority score
  function setPriorityIcon(score) {
    if (score === undefined || score === null) {
      console.warn("Invalid ticket score provided to setPriorityIcon().");
      $(".priority-icon").text("");
      return;
    }

    // Remove the current class to update it
    $(".priority-icon").removeClass("red orange green blue");

    if (score >= 80) {
      $(".priority-icon").addClass("red"); // Urgent priority
    } else if (score >= 60) {
      $(".priority-icon").addClass("orange"); // High priority
    } else if (score >= 40) {
      $(".priority-icon").addClass("green"); // Medium priority
    } else {
      $(".priority-icon").addClass("blue"); // Low priority
    }
  }

  // SLA time window constants in days
  const SLA_WINDOWS = {
    urgent: 1,
    high: 2,
    normal: 5,
    low: 7,
  };

  // displaySLA() is a function that chooses a custom SLA time window
  // based on when the ticket was created & the priority it was assigned.
  function displaySLA(ticket) {
    if (!ticket || !ticket.createdAt) {
      $("#sla-time").text("Missing ticket metadata.");
      return;
    }

    const slaDue = new Date(ticket.createdAt);
    const slaWindow = SLA_WINDOWS[ticket.priority] || SLA_WINDOWS.normal;

    slaDue.setDate(slaDue.getDate() + slaWindow);
    // Update the UI to show formatted sla due date
    $("#sla-time").text(formatDate(slaDue));
  }

  // handleAPIError will update the UI to show api error msg
  function handleApiError(error) {
    console.error("Error:", error);
    $("#ticket-subject").text("Error loading ticket data.");
    $(".error-message")
      .text(error.message || "An error occurred.")
      .show();
  }

  // Priority weight constants in multiples of 10
  const PRIORITY_WEIGHTS = {
    urgent: 50,
    high: 40,
    normal: 20,
    low: 10,
  };

  const CRITICAL_TAGS = [
    "outage",
    "blocker",
    "critical",
    "urgent",
    "vip_client",
  ];

  /**
   * Calculates priority score based on ticket priority, SLA elapsed time & critical tags
   * @param {Object} ticket - Zendesk ticket object
   * @returns {number} Priority score with a range of 0-100
   */

  function calculatePriorityScore(ticket) {
    if (!ticket || !ticket.createdAt || !ticket.priority) {
      console.warn("Invalid ticket data provided to calculatePriorityScore().");
      $("#score-value").text("--");
      setPriorityIcon(0);
      return;
    }
    // 1. Base priority score (10-50 pts)
    let score = PRIORITY_WEIGHTS[ticket.priority] || PRIORITY_WEIGHTS.normal;

    // 2. SLA-based vs days elapsed factor (0-40 pts)
    // Score increases as we approach SLA deadline
    const slaWindow = SLA_WINDOWS[ticket.priority] || SLA_WINDOWS.normal;
    const daysElapsed =
      (new Date() - new Date(ticket.createdAt)) / (24 * 60 * 60 * 1000);

    if (daysElapsed >= slaWindow) {
      score = 100; // reached SLA deadline
    } else if (daysElapsed >= slaWindow * 0.8) {
      score += 45; // 80% of SLA
    } else if (daysElapsed >= slaWindow * 0.5) {
      score += 25; // 50% of SLA
    }

    // 3. Critical tags factor (0 or 40 pts)
    const hasCriticalTag = ticket.tags.some((tag) =>
      CRITICAL_TAGS.includes(tag.toLowerCase())
    );

    if (hasCriticalTag) {
      score += 40;
    }

    // Cap the score at 100
    score = Math.min(score, 100);

    // Set priority icon color based on score
    setPriorityIcon(score);

    $("#score-value").text(score);

    console.log(score);
  }
});
