#!/usr/bin/env python3
"""
Test Supabase Database Connection
This script tests the database connection to help diagnose issues.
"""
import os
import sys
import psycopg2
from urllib.parse import urlparse

# Add project to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

def test_supabase_connection():
    """Test the Supabase database connection"""
    
    # Get database URL from environment
    database_url = "postgresql://postgres.enictuvwuumpanjzutbw:Workhardpaid101@aws-1-us-east-2.pooler.supabase.com:5432/postgres"
    
    print("🔍 Testing Supabase Database Connection...")
    print(f"Database URL: {database_url.replace('Workhardpaid101', '[PASSWORD]')}")
    
    # Parse the URL
    url = urlparse(database_url)
    
    print(f"\n📋 Connection Details:")
    print(f"   Host: {url.hostname}")
    print(f"   Port: {url.port}")
    print(f"   Database: {url.path[1:]}")
    print(f"   Username: {url.username}")
    
    try:
        # Attempt to connect
        print("\n🔌 Attempting to connect...")
        
        conn = psycopg2.connect(database_url)
        cursor = conn.cursor()
        
        # Test basic query
        print("✅ Connection successful!")
        
        # Check server version
        cursor.execute("SELECT version();")
        version = cursor.fetchone()[0]
        print(f"📊 Server version: {version}")
        
        # Check if we can access tables
        cursor.execute("""
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            LIMIT 5;
        """)
        tables = cursor.fetchall()
        
        print(f"\n📋 Available tables: {len(tables)} found")
        for table in tables:
            print(f"   - {table[0]}")
            
        # Check connection info
        cursor.execute("SELECT current_database(), current_user;")
        db_info = cursor.fetchone()
        print(f"\n🔑 Connected to database: {db_info[0]} as user: {db_info[1]}")
        
        cursor.close()
        conn.close()
        
        print("\n✅ Database connection test PASSED!")
        return True
        
    except psycopg2.OperationalError as e:
        print(f"\n❌ Connection failed with OperationalError:")
        print(f"   {str(e)}")
        
        if "server closed the connection unexpectedly" in str(e):
            print("\n💡 Possible causes:")
            print("   - Supabase project is paused (free tier)")
            print("   - Too many active connections")
            print("   - Network connectivity issues")
            print("   - Supabase service outage")
            print("\n🔧 Solutions to try:")
            print("   1. Check Supabase dashboard - project may be paused")
            print("   2. Wait a few minutes and try again")
            print("   3. Restart your Supabase project")
            print("   4. Check https://status.supabase.com for outages")
            
        return False
        
    except Exception as e:
        print(f"\n❌ Unexpected error: {type(e).__name__}")
        print(f"   {str(e)}")
        return False

def test_django_connection():
    """Test Django's database connection"""
    try:
        import django
        from django.conf import settings
        from django.db import connection
        
        # Configure Django
        os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'music_distribution_backend.settings')
        django.setup()
        
        print("\n🔍 Testing Django Database Connection...")
        
        # Test Django connection
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
            result = cursor.fetchone()
            
        print("✅ Django database connection successful!")
        return True
        
    except Exception as e:
        print(f"\n❌ Django connection failed: {str(e)}")
        return False

if __name__ == "__main__":
    print("🚀 Supabase Connection Diagnostic Tool")
    print("=" * 50)
    
    # Test direct connection
    direct_success = test_supabase_connection()
    
    if direct_success:
        # Test Django connection
        django_success = test_django_connection()
        
        if django_success:
            print("\n🎉 All tests passed! Database is ready.")
        else:
            print("\n⚠️  Direct connection works but Django has issues.")
    else:
        print("\n💔 Database connection failed. Check the solutions above.")
