from django.test import TestCase
from django.contrib.auth.models import User
from rest_framework.test import APITestCase
from rest_framework import status
from django.urls import reverse
from .models import Note
from rest_framework_simplejwt.tokens import RefreshToken

class AuthenticationTests(APITestCase):
    def setUp(self):
        self.register_url = reverse('user-list')
        self.login_url = reverse('get_token')
        self.user_data = {
            'username': 'testuser',
            'email': 'test@example.com',
            'password': 'testpass123',
            'confirm_password': 'testpass123',
            'first_name': 'Test',
            'last_name': 'User'
        }

    def test_user_registration_success(self):
        response = self.client.post(self.register_url, self.user_data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(User.objects.filter(username='testuser').exists())

    def test_registration_with_mismatched_passwords(self):
        self.user_data['confirm_password'] = 'wrongpass123'
        response = self.client.post(self.register_url, self.user_data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_registration_with_existing_username(self):
        # Create user first
        User.objects.create_user(username='testuser', email='existing@example.com', password='pass123')
        response = self.client.post(self.register_url, self.user_data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_registration_with_invalid_email(self):
        self.user_data['email'] = 'invalid-email'
        response = self.client.post(self.register_url, self.user_data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_registration_with_missing_required_fields(self):
        incomplete_data = {'username': 'testuser'}
        response = self.client.post(self.register_url, incomplete_data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_user_login_success(self):
        # First create a user
        user = User.objects.create_user(username='testuser', password='testpass123')
        login_data = {
            'username': 'testuser',
            'password': 'testpass123'
        }
        response = self.client.post(self.login_url, login_data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)

    def test_login_with_wrong_password(self):
        User.objects.create_user(username='testuser', password='testpass123')
        login_data = {
            'username': 'testuser',
            'password': 'wrongpass'
        }
        response = self.client.post(self.login_url, login_data)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_login_with_nonexistent_user(self):
        login_data = {
            'username': 'nonexistentuser',
            'password': 'testpass123'
        }
        response = self.client.post(self.login_url, login_data)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

class NoteTests(APITestCase):
    def setUp(self):
        # Create test user and another user for isolation testing
        self.user = User.objects.create_user(
            username='testuser',
            password='testpass123'
        )
        self.other_user = User.objects.create_user(
            username='otheruser',
            password='testpass123'
        )
        
        # Get auth token
        refresh = RefreshToken.for_user(self.user)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}')
        
        # Create test note
        self.note = Note.objects.create(
            title='Test Note',
            content='Test Content',
            author=self.user
        )
        
        self.notes_url = reverse('note-list')

    def test_create_note_success(self):
        data = {
            'title': 'New Note',
            'content': 'New Content'
        }
        response = self.client.post(self.notes_url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Note.objects.count(), 2)
        self.assertEqual(response.data['title'], 'New Note')

    def test_create_note_without_title(self):
        data = {'content': 'New Content'}
        response = self.client.post(self.notes_url, data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_create_note_with_empty_content(self):
        data = {'title': 'New Note', 'content': ''}
        response = self.client.post(self.notes_url, data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_get_notes_list_success(self):
        response = self.client.get(self.notes_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)

    def test_get_other_user_notes(self):
        # Create note for other user
        Note.objects.create(
            title='Other User Note',
            content='Content',
            author=self.other_user
        )
        response = self.client.get(self.notes_url)
        self.assertEqual(len(response.data), 1)  # Should only see own notes

    def test_update_note_success(self):
        data = {
            'title': 'Updated Note',
            'content': 'Updated Content'
        }
        response = self.client.put(f'{self.notes_url}{self.note.id}/', data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['title'], 'Updated Note')

    def test_update_other_user_note(self):
        other_note = Note.objects.create(
            title='Other Note',
            content='Content',
            author=self.other_user
        )
        data = {'title': 'Trying to Update', 'content': 'New Content'}
        response = self.client.put(f'{self.notes_url}{other_note.id}/', data)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_partial_update_note(self):
        data = {'title': 'Only Title Updated'}
        response = self.client.patch(f'{self.notes_url}{self.note.id}/', data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['title'], 'Only Title Updated')
        
    def test_delete_note_success(self):
        response = self.client.delete(f'{self.notes_url}{self.note.id}/')
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(Note.objects.count(), 0)

    def test_delete_other_user_note(self):
        other_note = Note.objects.create(
            title='Other Note',
            content='Content',
            author=self.other_user
        )
        response = self.client.delete(f'{self.notes_url}{other_note.id}/')
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(Note.objects.count(), 2)

    def test_unauthorized_access(self):
        self.client.credentials()  # Remove authentication
        response = self.client.get(self.notes_url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

class UserLogoutTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            password='testpass123'
        )
        self.refresh = RefreshToken.for_user(self.user)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.refresh.access_token}')
        self.logout_url = reverse('user-logout')

    def test_logout_success(self):
        data = {'refresh_token': str(self.refresh)}
        response = self.client.post(self.logout_url, data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_logout_without_token(self):
        response = self.client.post(self.logout_url, {})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_logout_with_invalid_token(self):
        data = {'refresh_token': 'invalid-token'}
        response = self.client.post(self.logout_url, data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_logout_twice_with_same_token(self):
        data = {'refresh_token': str(self.refresh)}
        # First logout
        self.client.post(self.logout_url, data)
        # Second logout with same token
        response = self.client.post(self.logout_url, data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

