# royalties

A webapp to calculate and display revenue splits to my song contributors.

### Frontend
- Written in HTML and vanilla JS.
- Users can log in to view various details of the royalties owed to them, populated from the backend.
- Stores key data in session storage so it can be accessed quickly on page load.
- Users sign up / can reset their password using a URL with a randomly generated key.
- Admin accounts can also input new information, delete erroneous information and create new users using simple HTML forms with custom handlers. 
- Uses responsive CSS to display well on mobile. (work in progress)

### Backend
- Written in Node.JS, using Express as the server.
- Serves routes only to those who have permission to access them, using a session cookie for authentication.
- Validates data from frontend in user-facing API endpoints before performing database operations with it.
- Keeps track of the USD-GBP exchange rate every day using a Cron job.

### Database
- My first time using EdgeDB, a database software based on Postgres which does the work of an ORM more efficiently

### Areas for improvement
- Comment every large block and any hard-to-understand logic. Very few comments currently exist in the project.
- Ensure database queries are correctly designed and don't overcomplicate the task.
- Data validation for admin API endpoints (considered not to be necessary as I will be the only admin / the frontend prevents bad data being submitted.)
- Split CSS out into shared files (very hard due to technical debt)
