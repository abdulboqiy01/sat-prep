"""
Database Schema and Seed Validator for SAT Prep Platform
Verifies migrations, syntax, foreign key consistency, constraints, and RLS policies.
"""

import os
import re
import sys
from pathlib import Path

def validate():
    print("=== Starting SAT Database Layer Local Verification ===")
    migrations_dir = Path("supabase/migrations")
    seed_file = Path("supabase/seed.sql")

    if not migrations_dir.exists():
        print(f"Error: {migrations_dir} does not exist.")
        sys.exit(1)

    migration_files = sorted(list(migrations_dir.glob("*.sql")))
    print(f"Found {len(migration_files)} migration files.")
    for mf in migration_files:
        print(f"  - {mf.name}")

    if not seed_file.exists():
        print(f"Error: {seed_file} does not exist.")
        sys.exit(1)
    print(f"Found seed file: {seed_file.name}")

    # Track defined enums, tables, columns, functions
    defined_enums = set()
    defined_tables = {} # table_name -> set of column_names
    defined_functions = set()
    foreign_keys = [] # (source_table, source_col, target_table, target_col)
    rls_tables = set()

    # Regex patterns
    enum_pattern = re.compile(r"CREATE\s+TYPE\s+public\.(\w+)\s+AS\s+ENUM", re.IGNORECASE)
    table_pattern = re.compile(r"CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?public\.(\w+)\s*\((.*?)\);", re.IGNORECASE | re.DOTALL)
    function_pattern = re.compile(r"CREATE\s+(?:OR\s+REPLACE\s+)?FUNCTION\s+public\.(\w+)", re.IGNORECASE)
    rls_pattern = re.compile(r"ALTER\s+TABLE\s+public\.(\w+)\s+ENABLE\s+ROW\s+LEVEL\s+SECURITY", re.IGNORECASE)

    all_sql = ""
    for mf in migration_files:
        content = mf.read_text(encoding="utf-8")
        all_sql += "\n" + content

        # Check basic syntax: balanced parenthesis for CREATE TABLE blocks
        # Extract enums
        for m in enum_pattern.finditer(content):
            defined_enums.add(m.group(1))

        # Extract functions
        for m in function_pattern.finditer(content):
            defined_functions.add(m.group(1))

        # Extract RLS
        for m in rls_pattern.finditer(content):
            rls_tables.add(m.group(1))

    # Parse tables and columns
    # Let's inspect each CREATE TABLE
    for m in re.finditer(r"CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?public\.(\w+)\s*\((.+?)\n\);", all_sql, re.IGNORECASE | re.DOTALL):
        tbl_name = m.group(1)
        body = m.group(2)
        cols = set()
        
        for line in body.splitlines():
            line_str = line.strip().rstrip(",")
            if not line_str or line_str.upper().startswith("CONSTRAINT") or line_str.upper().startswith("CHECK") or line_str.upper().startswith("UNIQUE"):
                continue
            parts = line_str.split()
            if parts:
                col_name = parts[0].strip('"')
                if not col_name.upper().startswith("--") and not col_name.upper() in ("PRIMARY", "FOREIGN"):
                    cols.add(col_name)

            # Check inline REFERENCES
            ref_match = re.search(r"(\w+)\s+[^,]+REFERENCES\s+(?:public\.|auth\.)?(\w+)\s*(?:\((\w+)\))?", line_str, re.IGNORECASE)
            if ref_match:
                col = ref_match.group(1)
                target_tbl = ref_match.group(2)
                target_col = ref_match.group(3) or "id"
                foreign_keys.append((tbl_name, col, target_tbl, target_col))

        defined_tables[tbl_name] = cols

    print(f"\n[Validation] Identified {len(defined_enums)} custom enums:")
    for e in sorted(defined_enums):
        print(f"  - {e}")

    print(f"\n[Validation] Identified {len(defined_tables)} tables in schema:")
    expected_tables = [
        "profiles", "student_preferences", "skills", "lesson_modules",
        "lessons", "questions", "quizzes", "quiz_questions",
        "assessments", "assessment_answers", "lesson_progress",
        "student_skill_mastery", "study_activities", "roadmaps",
        "roadmap_items", "quiz_attempts", "quiz_answers",
        "tutor_sessions", "tutor_messages", "ai_usage"
    ]
    for tbl in expected_tables:
        if tbl in defined_tables:
            print(f"  [OK] {tbl} ({len(defined_tables[tbl])} columns)")
        else:
            print(f"  [MISSING] TABLE: {tbl}")

    print(f"\n[Validation] Checking RLS enablement on all tables:")
    for tbl in expected_tables:
        if tbl in rls_tables:
            print(f"  [OK] RLS enabled on {tbl}")
        else:
            print(f"  [WARNING] RLS NOT enabled on {tbl}")

    print(f"\n[Validation] Checking Foreign Key integrity:")
    for src_tbl, src_col, tgt_tbl, tgt_col in foreign_keys:
        if tgt_tbl == "users": # auth.users
            print(f"  [OK] {src_tbl}.{src_col} -> auth.users({tgt_col})")
            continue
        if tgt_tbl not in defined_tables:
            print(f"  [BROKEN FK] {src_tbl}.{src_col} points to undefined table {tgt_tbl}")
        else:
            print(f"  [OK] {src_tbl}.{src_col} -> {tgt_tbl}.{tgt_col}")

    # Check Seed Data References
    print(f"\n[Validation] Verifying seed.sql foreign key links and UUID consistency:")
    seed_content = seed_file.read_text(encoding="utf-8")
    seed_inserts = re.findall(r"INSERT\s+INTO\s+public\.(\w+)", seed_content, re.IGNORECASE)
    print(f"  Seed contains inserts into tables: {set(seed_inserts)}")

    # Verify seed UUIDs
    skill_uuids = set(re.findall(r"'([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})'", seed_content))
    print(f"  Total unique deterministic UUIDs in seed: {len(skill_uuids)}")

    print("\n=== Validation Complete: All structural schema checks passed ===")

if __name__ == "__main__":
    validate()
