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

      // Set the correct icon color based on the assigned priority
      setPriorityIcon(ticket.priority);

      // Display the custom SLA based on the priority level
      displaySLA(ticket);
    })
    .catch(handleApiError);

  // formatDate()
  // Credit: https://stackoverflow.com/a/63490548
  function formatDate(dateString) {
    if (!dateString) return "Missing date-specific data.";
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

  // Set the correct icon color based on the assigned priority
  function setPriorityIcon(priority) {
    if (!priority) {
      $(".priority-icon").text("");
      return;
    }

    // Remove the current class to update it
    $(".priority-icon").removeClass("red orange green blue");

    switch (priority) {
      case "urgent":
        $(".priority-icon").addClass("red");
        break;
      case "high":
        $(".priority-icon").addClass("orange");
        break;
      case "normal":
        $(".priority-icon").addClass("green");
        break;
      default:
        $(".priority-icon").addClass("blue");
    }
  }

  // SLA time window constants in days
  const SLA_WINDOWS = {
    urgent: 1,
    high: 2,
    normal: 4,
    default: 5,
  };

  // displaySLA() is a function that chooses a custom SLA time window
  // based on when the ticket was created & the priority it was assigned.
  function displaySLA(ticket) {
    if (!ticket || !ticket.createdAt) {
      $("#sla-time").text("Missing ticket metadata.");
      return;
    }

    const slaDue = new Date(ticket.createdAt);
    const sla_window = SLA_WINDOWS[ticket.priority] || SLA_WINDOWS.default;
    slaDue.setDate(slaDue.getDate() + sla_window);
    // Update the UI to show formatted sla due date
    $("#sla-time").text(formatDate(slaDue));
  }

  // handleAPIError will update the UI to show api error msg
  function handleApiError(error) {
    console.error("Error:", error);
    $("#ticket-subject").text("Error loading ticket data");
    $(".error-message")
      .text(error.message || "An error occurred")
      .show();
  }

  // TODO: Add priority score logic
  // TODO: Add logic to move button when clicked + sliding divider
});
