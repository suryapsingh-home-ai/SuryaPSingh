import django
django.setup()
from django.db import connection

with connection.cursor() as cursor:
    cursor.execute("""
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
        ORDER BY table_name;
    """)
    tables = cursor.fetchall()
    
print("✓ PostgreSQL Database Tables:")
print("-" * 40)
for table in tables:
    print(f"  • {table[0]}")
print("-" * 40)
print(f"Total tables: {len(tables)}")
