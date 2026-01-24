from sqlalchemy import create_engine
import sys

print("Starting DB test...", flush=True)

engine = create_engine(
    "postgresql://postgres:Ved@2025@localhost:5432/exoskeleton_db",
    pool_pre_ping=True,
    connect_args={"connect_timeout": 5}
)

print("Engine created", flush=True)

try:
    with engine.connect() as conn:
        print("CONNECTED SUCCESSFULLY", flush=True)
except Exception as e:
    print("CONNECTION FAILED:", e, flush=True)
    sys.exit(1)
