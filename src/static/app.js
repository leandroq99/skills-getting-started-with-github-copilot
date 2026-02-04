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
          <h4 class="activity-title">${name}</h4>
          <p class="activity-desc">${details.description}</p>
          <p class="activity-schedule"><strong>Horário:</strong> ${details.schedule}</p>
          <p class="activity-spots"><strong>Vagas:</strong> ${spotsLeft} restantes</p>
        `;

        // Participants section (uses CSS classes for styling)
        const participantsDiv = document.createElement("div");
        participantsDiv.className = "participants-section";

        const participantsHeader = document.createElement("div");
        participantsHeader.className = "participants-header";
        participantsHeader.innerHTML = `
          <h5 class="participants-title">Participantes</h5>
          <span class="participant-count">${Array.isArray(details.participants) ? details.participants.length : 0}</span>
        `;

        const participantsListEl = document.createElement("ul");
        participantsListEl.className = "participants-list";

        if (Array.isArray(details.participants) && details.participants.length > 0) {
          details.participants.forEach((p) => {
            const li = document.createElement("li");
            li.className = "participant-item";

            const avatar = document.createElement("span");
            avatar.className = "avatar-badge";
            avatar.textContent = p
              .split(" ")
              .filter(Boolean)
              .map((s) => s[0])
              .slice(0, 2)
              .join("")
              .toUpperCase();

            const nameSpan = document.createElement("span");
            nameSpan.className = "participant-name";
            nameSpan.textContent = p;

            li.appendChild(avatar);
            li.appendChild(nameSpan);
            participantsListEl.appendChild(li);
          });
        } else {
          const li = document.createElement("li");
          li.className = "no-participants";
          li.textContent = "Nenhum participante ainda.";
          participantsListEl.appendChild(li);
        }

        participantsDiv.appendChild(participantsHeader);
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
