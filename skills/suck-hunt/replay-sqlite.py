# Replays SQLite migrations into memory and prints the schema's state-like lines. Usage: replay-sqlite.py <migration.sql>...
import re, sqlite3, sys

db = sqlite3.connect(":memory:")
for path in sys.argv[1:]:
    sql = re.split(r"^--\s*(?:migrate:down|\+goose\s+down)", open(path, errors="replace").read(), flags=re.M | re.I)[0]
    try:
        db.executescript(sql)
    except sqlite3.Error as e:
        print(f"# {path}: {e}", file=sys.stderr)
state = re.compile(r"status|state|phase|stage|check|enum|\bis_|_at\b", re.I)
for (ddl,) in db.execute("select sql from sqlite_master where sql is not null"):
    head = ddl.splitlines()[0]
    for line in ddl.splitlines()[1:]:
        if state.search(line):
            print(f"{head.strip()}\t{line.strip()}")
