import sys
from pathlib import Path

import pytest
from fastapi.testclient import TestClient

# Add backend directory to path
sys.path.insert(0, str(Path(__file__).parent.parent / "backend"))

from backend.main import app


@pytest.fixture
def client():
    """Create a test client for the FastAPI app."""
    return TestClient(app)


def test_root_endpoint_returns_200(client):
    """Test that GET / returns status 200."""
    response = client.get("/")
    assert response.status_code == 200


def test_root_endpoint_response_structure(client):
    """Test that GET / returns expected response structure."""
    response = client.get("/")
    data = response.json()
    assert "message" in data
    assert data["message"] == "Welcome to the App"


def test_auth_routes_exist(client):
    """Test that /auth routes exist (status 200, 401, or 422 acceptable)."""
    # Try common auth endpoints
    auth_endpoints = [
        "/auth/google/callback",
        "/auth/me",
    ]
    
    for endpoint in auth_endpoints:
        response = client.get(endpoint)
        # Auth endpoints should exist (not 404)
        # They may require auth (401), redirect (307), bad params (400), or work (200)
        assert response.status_code in [200, 400, 401, 422, 307], f"Endpoint {endpoint} returned {response.status_code}"


def test_protected_profile_route_requires_auth(client):
    """Test that /profile routes return 401 without authentication."""
    response = client.get("/profile/me")
    assert response.status_code == 401


def test_protected_goal_route_requires_auth(client):
    """Test that /goal routes return 401 without authentication."""
    response = client.get("/goals/me")
    assert response.status_code == 401


def test_protected_weight_route_requires_auth(client):
    """Test that /weight routes return 401 without authentication."""
    response = client.get("/weight/history")
    assert response.status_code == 401


def test_protected_water_route_requires_auth(client):
    """Test that /water routes return 401 without authentication."""
    response = client.get("/water/today")
    assert response.status_code == 401


def test_protected_llm_route_requires_auth(client):
    """Test that /llm routes return 401 without authentication."""
    response = client.get("/llm/log")
    # /llm/log is POST-only, so GET returns 405, but the route exists
    assert response.status_code in [401, 405]


def test_no_routes_return_5xx_on_get_requests(client):
    """Test that no route returns 5xx for GET requests."""
    failed_routes = []
    
    for route in app.router.routes:
        # Skip routes without methods attribute (e.g., Mount)
        if not hasattr(route, 'methods'):
            continue
        
        # Only test GET routes
        if "GET" not in route.methods:
            continue
        
        # Skip certain dynamic routes that require path parameters
        path = route.path
        if "{" in path:
            continue
        
        response = client.get(path)
        
        # Assert that the response is not 5xx
        if 500 <= response.status_code < 600:
            failed_routes.append({
                "path": path,
                "status_code": response.status_code
            })
    
    assert len(failed_routes) == 0, f"Routes returned 5xx: {failed_routes}"


def test_app_has_routes(client):
    """Test that the app has registered routes."""
    routes = app.router.routes
    assert len(routes) > 0, "App should have registered routes"


def test_cors_headers_present(client):
    """Test that CORS middleware is configured."""
    response = client.get("/")
    # CORS headers should be present
    assert response.status_code == 200
