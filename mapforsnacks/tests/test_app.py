import pytest
from mapforsnacks import app

@pytest.fixture
def mapforsnacks():
    mapforsnacks = app
    mapforsnacks.config.update({
        "TESTING": True,
    })
    yield mapforsnacks

@pytest.fixture
def client(mapforsnacks):
    return mapforsnacks.test_client()

def test_signup_page(client):
    response = client.get('/signup')
    assert response.status_code == 200

def test_login_page(client):
    response = client.get('/login')
    assert response.status_code == 200

def test_profile_page(client):
    response = client.get('/profile')
    assert response.status_code == 200