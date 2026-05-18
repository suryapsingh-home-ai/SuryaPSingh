import psycopg2
from psycopg2 import sql

try:
    conn = psycopg2.connect(
        host='localhost',
        user='postgres',
        password='India@1879',
        port=5432
    )
    conn.autocommit = True
    cur = conn.cursor()
    
    # Check if database exists
    cur.execute("SELECT 1 FROM pg_database WHERE datname = 'shopping'")
    exists = cur.fetchone()
    
    if exists:
        print("✓ Database 'shopping' already exists")
    else:
        cur.execute("CREATE DATABASE shopping;")
        print("✓ Database 'shopping' created successfully")
    
    cur.close()
    conn.close()
except Exception as e:
    print(f"✗ Error: {e}")
