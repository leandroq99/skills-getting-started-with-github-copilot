import pytest


class TestActivitiesEndpoint:
    """Test the GET /activities endpoint"""

    def test_get_activities_success(self, client):
        """Test fetching all activities"""
        response = client.get("/activities")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, dict)
        assert "Basketball Team" in data
        assert "Tennis Club" in data
        assert "Drama Club" in data

    def test_get_activities_has_required_fields(self, client):
        """Test that activities have required fields"""
        response = client.get("/activities")
        assert response.status_code == 200
        data = response.json()
        
        for activity_name, activity_details in data.items():
            assert "description" in activity_details
            assert "schedule" in activity_details
            assert "max_participants" in activity_details
            assert "participants" in activity_details
            assert isinstance(activity_details["participants"], list)


class TestSignupEndpoint:
    """Test the POST /activities/{activity_name}/signup endpoint"""

    def test_signup_success(self, client):
        """Test successful signup for an activity"""
        response = client.post(
            "/activities/Basketball%20Team/signup?email=newstudent@mergington.edu"
        )
        assert response.status_code == 200
        data = response.json()
        assert "message" in data
        assert "newstudent@mergington.edu" in data["message"]

    def test_signup_duplicate_email(self, client):
        """Test that duplicate signups are rejected"""
        email = "alex@mergington.edu"
        
        # Try to signup with an email already in Basketball Team
        response = client.post(
            f"/activities/Basketball%20Team/signup?email={email}"
        )
        assert response.status_code == 400
        data = response.json()
        assert "already signed up" in data["detail"]

    def test_signup_nonexistent_activity(self, client):
        """Test signup for a non-existent activity"""
        response = client.post(
            "/activities/Fake%20Activity/signup?email=student@mergington.edu"
        )
        assert response.status_code == 404
        data = response.json()
        assert "not found" in data["detail"]

    def test_signup_adds_participant(self, client):
        """Test that an email is added to participants list after signup"""
        email = "newparticipant123@mergington.edu"
        activity_name = "Art Studio"
        
        # Get activities before signup
        response_before = client.get("/activities")
        participants_before = response_before.json()[activity_name]["participants"]
        
        # Signup
        response_signup = client.post(
            f"/activities/{activity_name.replace(' ', '%20')}/signup?email={email}"
        )
        assert response_signup.status_code == 200
        
        # Get activities after signup
        response_after = client.get("/activities")
        participants_after = response_after.json()[activity_name]["participants"]
        
        # Verify email was added
        assert len(participants_after) == len(participants_before) + 1
        assert email in participants_after


class TestUnregisterEndpoint:
    """Test the POST /activities/{activity_name}/unregister endpoint"""

    def test_unregister_success(self, client):
        """Test successful unregistration from an activity"""
        email = "jessica@mergington.edu"
        activity_name = "Tennis Club"
        
        # Verify participant is in the list
        response = client.get("/activities")
        assert email in response.json()[activity_name]["participants"]
        
        # Unregister
        response = client.post(
            f"/activities/{activity_name.replace(' ', '%20')}/unregister?email={email}"
        )
        assert response.status_code == 200
        data = response.json()
        assert "Unregistered" in data["message"]
        
        # Verify participant was removed
        response = client.get("/activities")
        assert email not in response.json()[activity_name]["participants"]

    def test_unregister_not_participant(self, client):
        """Test unregistering someone not in the activity"""
        response = client.post(
            "/activities/Chess%20Club/unregister?email=nonexistent@mergington.edu"
        )
        assert response.status_code == 400
        data = response.json()
        assert "not signed up" in data["detail"]

    def test_unregister_nonexistent_activity(self, client):
        """Test unregistering from a non-existent activity"""
        response = client.post(
            "/activities/Fake%20Activity/unregister?email=student@mergington.edu"
        )
        assert response.status_code == 404
        data = response.json()
        assert "not found" in data["detail"]

    def test_unregister_removes_participant(self, client):
        """Test that a participant is removed from the list after unregistration"""
        email = "maya@mergington.edu"
        activity_name = "Art Studio"
        
        # Get activities before unregister
        response_before = client.get("/activities")
        participants_before = response_before.json()[activity_name]["participants"]
        
        # Unregister
        response_unregister = client.post(
            f"/activities/{activity_name.replace(' ', '%20')}/unregister?email={email}"
        )
        assert response_unregister.status_code == 200
        
        # Get activities after unregister
        response_after = client.get("/activities")
        participants_after = response_after.json()[activity_name]["participants"]
        
        # Verify email was removed
        assert len(participants_after) == len(participants_before) - 1
        assert email not in participants_after


class TestRootEndpoint:
    """Test the GET / endpoint"""

    def test_root_redirect(self, client):
        """Test that root redirects to static/index.html"""
        response = client.get("/", follow_redirects=False)
        assert response.status_code == 307
        assert "/static/index.html" in response.headers["location"]
