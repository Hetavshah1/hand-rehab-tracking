from sqlalchemy import create_engine
import sys

print("Starting DB test...", flush=True)

engine = create_engine(
    "postgresql://postgres:Ved%402025@localhost:5432/exoskeleton_db",
    connect_args={"connect_timeout": 5}
)

try:
    with engine.connect() as conn:
        print("CONNECTED SUCCESSFULLY", flush=True)
except Exception as e:
    print("CONNECTION FAILED:", e, flush=True)
    sys.exit(1)
