# run-database-audit

For the application's database ensure every table and field has an accurate description and if it's not set, then update it.

If using Supabase as the data resource, than use the supbase CLI to access the database.  Output a report for the user to view to /docs/audit.  Ensure the report is dated.