import os

import psycopg2

try:
    conn = psycopg2.connect(
        host=os.environ.get("PGHOST", "localhost"),
        user=os.environ.get("PGUSER", "postgres"),
        password=os.environ.get("PGPASSWORD", ""),
        port=int(os.environ.get("PGPORT", "5432")),
    )
    conn.autocommit = True
    cur = conn.cursor()

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
