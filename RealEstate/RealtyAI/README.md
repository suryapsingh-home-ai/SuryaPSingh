# RealtyAI

A scaffold for a real estate website with:
- Angular frontend
- Django backend
- PostgreSQL database
- REST API for property listings

## Structure

- `backend/` — Django API and models
- `frontend/` — Angular app

## Backend setup

1. Create a Python virtual environment:

   ```powershell
   cd backend
   python -m venv .venv
   .\.venv\Scripts\Activate.ps1
   pip install -r requirements.txt
   ```

2. Copy environment example:

   ```powershell
   copy .env.example .env
   ```

3. Update `.env` with your PostgreSQL credentials.

4. Run migrations and start the server:

   ```powershell
   python manage.py makemigrations
   python manage.py migrate
   python manage.py runserver
   ```

5. Load demo seed data:

   ```powershell
   python manage.py loaddata listings_seed.json
   ```

The API will be available at `http://localhost:8000/api/listings/`.

## Frontend setup

1. Install dependencies:

   ```powershell
   cd frontend
   npm install
   ```

2. Start the Angular app:

   ```powershell
   npm start
   ```

The UI will open at `http://localhost:4200/`.

## Optional Docker-based setup

If you want to run everything with Docker, use:

```powershell
docker compose up --build
```

This starts the backend and PostgreSQL services. You can still run the frontend separately with `npm start`.

## Next steps

- Add authentication for buyers, sellers, and agents
- Add file upload for listing photos
- Add search facets and saved favorites
- Add AI features such as price estimation and property recommendations
