import psycopg2, os
from urllib.parse import urlparse
url = os.environ.get('DATABASE_URL') or 'postgresql://postgres.enictuvwuumpanjzutbw:Workhardpaid101@aws-1-us-east-2.pooler.supabase.com:6543/postgres'
print('Using URL:', url)
params = urlparse(url)
print('parsed host:', params.hostname, 'port:', params.port)
try:
    conn = psycopg2.connect(dbname=params.path[1:], user=params.username, password=params.password, host=params.hostname, port=params.port, sslmode='require', connect_timeout=10)
    cur = conn.cursor()
    cur.execute('SELECT version();')
    print('Postgres version:', cur.fetchone())
    cur.close()
    conn.close()
    print('DB connection test succeeded')
except Exception as e:
    print('Connection failed:', type(e).__name__, e)
