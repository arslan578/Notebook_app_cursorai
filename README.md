
# NoteApp

A full-stack web application that allows users to create, manage, and organize their notes efficiently. Built with React for the frontend and Django for the backend, NoteApp provides a secure and intuitive interface for note-taking and management.

## Features

- **User Authentication**
  - Secure login and registration
  - JWT-based authentication
  - Protected routes and API endpoints

- **Note Management**
  - Create new notes
  - Edit existing notes
  - Delete notes
  - View all notes in an organized layout

- **User Experience**
  - Responsive design
  - Intuitive user interface
  - Real-time updates

## Dependencies & Versions

### Backend Dependencies
- Python (3.11 or higher)
- Django (4.2.7)
- Django REST Framework
- PostgreSQL (14.0 or higher)
- Additional Python packages:
  ```
  djangorestframework==3.14.0
  djangorestframework-simplejwt==5.3.1
  psycopg2-binary==2.9.9
  python-dotenv==1.0.1
  django-cors-headers==4.3.1
  ```

### Frontend Dependencies
- Node.js (18.x or higher)
- React (18.2.0)
- Key npm packages:
  ```
  axios: ^1.6.7
  jwt-decode: ^4.0.0
  react-router-dom: ^6.22.3
  ```

## Prerequisites

### Backend Requirements
- Python 3.11 or higher
- PostgreSQL database server
- pip (Python package manager)

### Frontend Requirements
- Node.js (v18 or higher)
- npm (Node package manager)

## Installation & Setup

### Backend Setup

1. Clone the repository
```bash
git clone [repository-url]
```

2. Create and activate virtual environment
```bash
# Create virtual environment
python -m venv venv

# Activate on Windows
venv\Scripts\activate

# Activate on Unix/MacOS
source venv/bin/activate
```

3. Install dependencies
```bash
cd backend
pip install -r requirements.txt
```

4. Configure environment variables
Create `.env` file in backend directory:
```
SECRET_KEY=your_secret_key
DEBUG=True
DATABASE_NAME=noteapp
DATABASE_USER=postgres
DATABASE_PASSWORD=your_password
DATABASE_HOST=localhost
DATABASE_PORT=5432
```

5. Setup database
```bash
python manage.py makemigrations
python manage.py migrate
```

6. Create superuser (optional)
```bash
python manage.py createsuperuser
```

7. Start backend server
```bash
python manage.py runserver
```
Backend will be available at `http://localhost:8000`

### Frontend Setup

1. Install dependencies
```bash
cd frontend
npm install
```

2. Start development server
```bash
npm run dev
```
Frontend will be available at `http://localhost:5173`

## API Endpoints

### Authentication Endpoints
```
POST /api/token/ - Obtain JWT token
POST /api/token/refresh/ - Refresh JWT token
POST /api/register/ - Register new user
```

### Notes Endpoints

#### Get All Notes
```
GET /api/notes/
Authorization: Bearer <token>
Response: List of notes
```

#### Create Note
```
POST /api/notes/
Authorization: Bearer <token>
Body: {
    "title": "Note Title",
    "content": "Note Content"
}
```

#### Get Single Note
```
GET /api/notes/<id>/
Authorization: Bearer <token>
Response: Single note object
```

#### Update Note
```
PUT /api/notes/<id>/
Authorization: Bearer <token>
Body: {
    "title": "Updated Title",
    "content": "Updated Content"
}
```

#### Delete Note
```
DELETE /api/notes/<id>/
Authorization: Bearer <token>
```

### Example API Usage

```javascript
// Create a new note
const createNote = async (noteData) => {
  try {
    const response = await axios.post('http://localhost:8000/api/notes/', noteData, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error creating note:', error);
  }
};

// Update a note
const updateNote = async (id, noteData) => {
  try {
    const response = await axios.put(`http://localhost:8000/api/notes/${id}/`, noteData, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error updating note:', error);
  }
};

// Delete a note
const deleteNote = async (id) => {
  try {
    await axios.delete(`http://localhost:8000/api/notes/${id}/`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
  } catch (error) {
    console.error('Error deleting note:', error);
  }
};
```

## Development Workflow

1. Start the backend server:
```bash
cd backend
python manage.py runserver
```

2. In a new terminal, start the frontend development server:
```bash
cd frontend
npm run dev
```

3. Access the application at `http://localhost:5173`

## Usage

1. Register a new account or login with existing credentials
2. Create a new note using the "New Note" button
3. View your notes in the main dashboard
4. Click on a note to edit its contents
5. Use the delete button to remove unwanted notes
6. Logout when finished

## Technologies Used

### Frontend
- React.js
- React Router DOM
- Axios for API requests
- JWT for authentication
- Vite (Build tool)

### Backend
- Django
- Django REST Framework
- PostgreSQL
- Simple JWT for authentication
- Python-dotenv for environment variables

### Development Tools
- ESLint
- Git for version control
- Visual Studio Code (recommended editor)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
```

This README.md file provides a complete guide for setting up, running, and using your NoteApp project. You can save this content directly to a file named `README.md` in your project's root directory. Would you like me to explain any section in more detail?
