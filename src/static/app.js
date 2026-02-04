document.addEventListener("DOMContentLoaded", () => {
  const activitiesList = document.getElementById("activities-list");
  const activitySelect = document.getElementById("activity");
  const signupForm = document.getElementById("signup-form");
  const messageDiv = document.getElementById("message");

  // Function to fetch activities from API
  async function fetchActivities() {
    try {
      const response = await fetch("/activities");
      const activities = await response.json();

      // Clear loading message
      activitiesList.innerHTML = "";

      // Reset select (keeps a placeholder)
      activitySelect.innerHTML = '<option value="" disabled selected>Selecione uma atividade</option>';

      // Populate activities list
      Object.entries(activities).forEach(([name, details]) => {
        const activityCard = document.createElement("div");
        activityCard.className = "activity-card";

        const spotsLeft = details.max_participants - details.participants.length;

        activityCard.innerHTML = `
          <h4 style="margin:0 0 6px 0;">${name}</h4>
          <p style="margin:0 0 6px 0;">${details.description}</p>
          <p style="margin:0 0 6px 0;"><strong>Horário:</strong> ${details.schedule}</p>
          <p style="margin:0 0 8px 0;"><strong>Vagas:</strong> ${spotsLeft} restantes</p>
        `;

        // Participants section (prettified with small inline styles)
        const participantsDiv = document.createElement("div");
        participantsDiv.className = "participants-section";
        participantsDiv.style.marginTop = "8px";

        const participantsTitle = document.createElement("h5");
        participantsTitle.textContent = "Participantes";
        participantsTitle.style.margin = "0 0 4px 0";
        participantsTitle.style.fontSize = "0.95em";

        const participantsListEl = document.createElement("ul");
        participantsListEl.className = "participants-list";
        participantsListEl.style.paddingLeft = "20px";
        participantsListEl.style.margin = "0";

        if (Array.isArray(details.participants) && details.participants.length > 0) {
          details.participants.forEach((p) => {
            const li = document.createElement("li");
            li.textContent = p;
            li.style.marginBottom = "2px";
            participantsListEl.appendChild(li);
          });
        } else {
          const li = document.createElement("li");
          li.textContent = "Nenhum participante ainda.";
          li.style.fontStyle = "italic";
          participantsListEl.appendChild(li);
        }

        participantsDiv.appendChild(participantsTitle);
        participantsDiv.appendChild(participantsListEl);
        activityCard.appendChild(participantsDiv);

        activitiesList.appendChild(activityCard);

        // Add option to select dropdown
        const option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        activitySelect.appendChild(option);
      });
    } catch (error) {
      activitiesList.innerHTML = "<p>Failed to load activities. Please try again later.</p>";
      console.error("Error fetching activities:", error);
    }
  }

  // Handle form submission
  signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const activity = document.getElementById("activity").value;

    try {
      const response = await fetch(
        `/activities/${encodeURIComponent(activity)}/signup?email=${encodeURIComponent(email)}`,
        {
          method: "POST",
        }
      );

      const result = await response.json();

      if (response.ok) {
        messageDiv.textContent = result.message;
        messageDiv.className = "success";
        signupForm.reset();
      } else {
        messageDiv.textContent = result.detail || "An error occurred";
        messageDiv.className = "error";
      }

      messageDiv.classList.remove("hidden");

      // Hide message after 5 seconds
      setTimeout(() => {
        messageDiv.classList.add("hidden");
      }, 5000);
    } catch (error) {
      messageDiv.textContent = "Failed to sign up. Please try again.";
      messageDiv.className = "error";
      messageDiv.classList.remove("hidden");
      console.error("Error signing up:", error);
    }
  });

  // Initialize app
  fetchActivities();
});
