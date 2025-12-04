# SeguiPagos - Payment Reminder System

A complete application to efficiently manage service and payment reminders.

## Features

- ✅ **Service Management**: Add, edit, and delete payment reminders
- 📅 **Recurring Due Dates**: Configure the day of the month when each service is due
- 🏷️ **Customizable Categories**: Organize your services by categories with colors
- 💰 **Payment Records**: Mark completed payments and maintain a history
- 📊 **Dashboard**: View upcoming due dates and monthly statistics
- 🎨 **Premium Interface**: Modern design with glassmorphism and dark mode

## Technologies

- **Backend**: Node.js + Express
- **Database**: SQLite3
- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)
- **Styles**: Custom CSS with glassmorphism effects

## Installation

1. **Install dependencies**:

```bash
npm install
```

2. **Start the server**:

```bash
node server.js
```

3. **Open in browser**:

```
http://localhost:3000
```

## Usage

### Add a Service

1. Click the **"New Service"** button
2. Fill out the form:
   - **Service Name**: E.g., "Electric Company", "Netflix"
   - **Category**: Select an existing one or create a new one
   - **Due Day**: The day of the month when it's due (1-31)
   - **Approximate Amount**: Optional, for statistics
3. Click **"Save"**

### Create a Category

1. When adding a service, click the **+** button next to the category selector
2. Enter the name and select a color
3. Click **"Create"**

### Record a Payment

1. In the **"Upcoming Due Dates"** section, locate the service
2. Click the **check** icon (✓)
3. Confirm the amount paid
4. Click **"Confirm Payment"**

The payment will be recorded in the history and statistics will be updated.

### Delete a Service

1. In the **"My Services"** table, locate the service
2. Click the **trash** icon (🗑️)
3. Confirm deletion

## Project Structure

```
payment-reminder/
├── server.js           # Express server and REST API
├── payments.db         # SQLite database (created automatically)
├── public/
│   ├── index.html      # Main page
│   ├── css/
│   │   └── style.css   # Application styles
│   └── js/
│       └── app.js      # Frontend logic
├── package.json
└── README.md
```

## API Endpoints

### Categories

- `GET /api/categories` - Get all categories
- `POST /api/categories` - Create a category

### Reminders

- `GET /api/reminders` - Get all reminders
- `POST /api/reminders` - Create a reminder
- `PUT /api/reminders/:id` - Update a reminder
- `DELETE /api/reminders/:id` - Delete a reminder

### Payments

- `GET /api/payments` - Get payment history
- `POST /api/payments` - Record a payment
- `GET /api/payments/check?month=X&year=Y` - Check payments for a period

## Important Notes

- Due dates are **monthly recurring**. If you set day 10, the service will be due on the 10th of each month.
- If today is after the due date, the system will show the next due date for the following month.
- Payments are recorded by period (month/year), allowing for a complete history.
- The database is created automatically with default categories: Energy, Gas, Internet, Water.

## Troubleshooting

### Server won't start

- Verify that port 3000 is available
- Make sure you've run `npm install`

### I only see JSON, not the interface

- Make sure you're accessing `http://localhost:3000` (without `/api/...`)
- Verify that files in `public/` exist

### Changes are not reflected

- Reload the page with Ctrl+F5 (hard refresh)
- Check the browser console for JavaScript errors

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
