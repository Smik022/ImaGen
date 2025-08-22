# ImaGEN

A web application that combines Django backend API with React frontend for image generation and management.

## Project Structure

```
ImaGEN/
├── api/               # Django REST API
├── backend/          # Django project settings
├── frontend/         # React application
├── media/           # Stored images
└── manage.py        # Django management script
```

## Technologies Used

- Backend:
  - Django
  - Django REST Framework
  - SQLite3
- Frontend:
  - React
  - Create React App
  - React Testing Library

## Getting Started

### Prerequisites

- Python 3.x
- Node.js
- npm

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd ImaGEN
```

2. Set up the backend:
```bash
# Create and activate virtual environment (optional but recommended)
python -m venv venv
source venv/bin/activate  # For Unix/macOS
# or
.\venv\Scripts\activate  # For Windows

# Install Python dependencies
pip install -r requirements.txt

# Run migrations
python manage.py migrate
```

3. Set up the frontend:
```bash
cd frontend
npm install
```

### Running the Application

1. Start the Django backend server:
```bash
# From the root directory
python manage.py runserver
```

2. Start the React development server:
```bash
# From the frontend directory
npm start
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000

## Development

### Backend Development

- Create migrations: `python manage.py makemigrations`
- Apply migrations: `python manage.py migrate`
- Create superuser: `python manage.py createsuperuser`

### Frontend Development

Available scripts in the frontend directory:
- `npm start`: Runs the app in development mode
- `npm test`: Launches the test runner
- `npm run build`: Builds the app for production

## License

[Add your license information here]

## Contributing

[Add contribution guidelines here]