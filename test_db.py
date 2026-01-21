import psycopg2

conn = psycopg2.connect(
    host="localhost",
    database="rehab_exoskeleton",
    user="postgres",
    password="1234",
    port=5432
)
