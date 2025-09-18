#!/usr/bin/env python3
"""
Simple script to create an admin user for the Music Distribution platform.
Run this script to create an admin user with credentials.
"""

import os
import sys
import django
from pathlib import Path

# Add the project directory to Python path
PROJECT_ROOT = Path(__file__).resolve().parent
sys.path.insert(0, str(PROJECT_ROOT))

# Load environment variables from .env file manually
def load_env_file():
    """Load environment variables from .env file"""
    env_path = PROJECT_ROOT / '.env'
    if env_path.exists():
        with open(env_path, 'r') as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith('#') and '=' in line:
                    key, value = line.split('=', 1)
                    # Remove quotes if present
                    value = value.strip().strip('"').strip("'")
                    os.environ[key] = value

# Load environment variables
load_env_file()

# Set Django settings
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'music_distribution_backend.settings')

# DATABASE_URL will be loaded from .env file

# Initialize Django
django.setup()

# Now import Django models
from django.contrib.auth import get_user_model

def create_admin_user():
    """Create an admin user if one doesn't exist."""
    User = get_user_model()
    
    # Admin user details
    username = 'admin'
    email = 'admin@musicdist.com'
    password = 'Workhard101'
    
    # Check if admin user already exists
    if User.objects.filter(username=username).exists():
        print(f"✅ Admin user '{username}' already exists!")
        user = User.objects.get(username=username)
        print(f"📧 Email: {user.email}")
        print(f"🔑 Role: {user.role}")
        return user
    
    try:
        # Create admin user
        admin_user = User.objects.create_user(
            username=username,
            email=email,
            password=password,
            role='admin',  # Set role to admin
            is_staff=True,
            is_superuser=True,
            is_active=True
        )
        
        print("🎉 Admin user created successfully!")
        print(f"👤 Username: {username}")
        print(f"📧 Email: {email}")
        print(f"🔑 Password: {password}")
        print(f"🛡️  Role: {admin_user.role}")
        print("\n🚀 You can now access the admin dashboard at:")
        print("   Frontend: http://localhost:3000/admin")
        print("   Django Admin: http://localhost:8000/admin")
        
        return admin_user
        
    except Exception as e:
        print(f"❌ Error creating admin user: {e}")
        return None

if __name__ == '__main__':
    print("🔧 Creating admin user for Music Distribution platform...")
    create_admin_user()
