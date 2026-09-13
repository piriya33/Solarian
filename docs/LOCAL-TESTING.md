# Local application testing

The connected application runs at http://localhost:8000/ . The old standalone design preview on port 8766 is a separate artifact and does not calculate charts.

From the project directory run `bash run.sh`. It builds the current React interface before starting FastAPI on loopback port 8000. If that port is already serving the app, use the running service instead of starting another copy. Stop the service with Ctrl+C in its terminal.

For frontend development, run `npm run dev --prefix frontend` alongside FastAPI. Vite proxies `/api` to port 8000. To update the interface served by FastAPI, run `npm run build --prefix frontend` and refresh the browser.

Use a fictional birth profile first to exercise the form, Sun/aspects, year selector, journal, and PDF export. Account-backed profile storage uses the existing local database. Existing data should not be deleted to test the new design.

The annual transit view samples one birthday date per year. For a February 29 birth in a non-leap year, the sample uses February 28 and returns that actual date. It is not a scan of every day in that year.

Local UI integration does not resolve the separate online-release items in `CLASS-PILOT-ARCHITECTURE.md`. No hosting or live AI provider test is performed by the local startup command itself.
