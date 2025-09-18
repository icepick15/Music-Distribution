Run this management command to seed default genres:

Windows PowerShell:
.\backend_env\Scripts\python.exe manage.py seed_genres

This is safe to run multiple times; it will only create missing genres.
