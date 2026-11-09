"""
Seed Foreign Key Referential Integrity Validator
Ensures that all references within seed.sql point to defined entities within seed.sql.
"""

import re
import sys
from pathlib import Path

def validate_seed():
    seed_path = Path("supabase/seed.sql")
    content = seed_path.read_text(encoding="utf-8")

    skills = {}
    modules = set()
    lessons = set()
    questions = set()
    quizzes = set()

    # Extract ONLY blocks inside INSERT INTO public.skills
    skill_blocks = re.findall(r"INSERT\s+INTO\s+public\.skills\s*\([^)]+\)\s*VALUES\s*(.*?)\s*ON\s+CONFLICT", content, re.DOTALL | re.IGNORECASE)
    for block in skill_blocks:
        matches = re.findall(r"\(\s*'([0-9a-f-]+)'\s*,\s*(NULL|'[0-9a-f-]+')\s*,\s*'([^']+)'", block, re.IGNORECASE)
        for s_id, parent_id, code in matches:
            parent = None if parent_id == "NULL" else parent_id.strip("'")
            skills[s_id] = (parent, code)

    # Verify parent_id in skills
    for s_id, (parent, code) in skills.items():
        if parent and parent not in skills:
            print(f"[ERROR] Skill {code} references non-existent parent skill {parent}")
            sys.exit(1)

    # Match modules
    module_matches = re.findall(r"INSERT\s+INTO\s+public\.lesson_modules.*?VALUES\s*(.*?)\s*ON\s+CONFLICT", content, re.DOTALL | re.IGNORECASE)
    if module_matches:
        for block in module_matches:
            ids = re.findall(r"\(\s*'([0-9a-f-]+)'", block)
            for mid in ids:
                modules.add(mid)

    # Match lessons inside INSERT INTO public.lessons
    lesson_blocks = re.findall(r"INSERT\s+INTO\s+public\.lessons\s*\([^)]+\)\s*VALUES\s*(.*?)\s*ON\s+CONFLICT", content, re.DOTALL | re.IGNORECASE)
    for block in lesson_blocks:
        matches = re.findall(r"\(\s*'([0-9a-f-]+)'\s*,\s*'([0-9a-f-]+)'\s*,\s*'([0-9a-f-]+)'", block)
        for l_id, m_id, s_id in matches:
            lessons.add(l_id)
            if m_id not in modules:
                print(f"[ERROR] Lesson {l_id} references non-existent module {m_id}")
                sys.exit(1)
            if s_id not in skills:
                print(f"[ERROR] Lesson {l_id} references non-existent skill {s_id}")
                sys.exit(1)

    # Match questions inside INSERT INTO public.questions
    q_blocks = re.findall(r"INSERT\s+INTO\s+public\.questions\s*\([^)]+\)\s*VALUES\s*(.*?)\s*ON\s+CONFLICT", content, re.DOTALL | re.IGNORECASE)
    for block in q_blocks:
        matches = re.findall(r"\(\s*'([0-9a-f-]+)'\s*,\s*'([0-9a-f-]+)'\s*,\s*(NULL|'[0-9a-f-]+')", block)
        for q_id, s_id, l_ref in matches:
            questions.add(q_id)
            if s_id not in skills:
                print(f"[ERROR] Question {q_id} references non-existent skill {s_id}")
                sys.exit(1)
            if l_ref != "NULL":
                l_id = l_ref.strip("'")
                if l_id not in lessons:
                    print(f"[ERROR] Question {q_id} references non-existent lesson {l_id}")
                    sys.exit(1)

    # Match quizzes: ('quiz_id', lesson_id, 'skill_id', ...)
    quiz_matches = re.findall(r"INSERT\s+INTO\s+public\.quizzes.*?VALUES\s*(.*?)\s*ON\s+CONFLICT", content, re.DOTALL | re.IGNORECASE)
    if quiz_matches:
        for block in quiz_matches:
            q_defs = re.findall(r"\(\s*'([0-9a-f-]+)'\s*,\s*(NULL|'[0-9a-f-]+')\s*,\s*'([0-9a-f-]+)'", block)
            for qz_id, l_ref, s_id in q_defs:
                quizzes.add(qz_id)
                if s_id not in skills:
                    print(f"[ERROR] Quiz {qz_id} references non-existent skill {s_id}")
                    sys.exit(1)
                if l_ref != "NULL":
                    l_id = l_ref.strip("'")
                    if l_id not in lessons:
                        print(f"[ERROR] Quiz {qz_id} references non-existent lesson {l_id}")
                        sys.exit(1)

    # Match quiz_questions: ('qq_id', 'quiz_id', 'question_id', ...)
    qq_matches = re.findall(r"\(\s*'([0-9a-f-]+)'\s*,\s*'([0-9a-f-]+)'\s*,\s*'([0-9a-f-]+)'\s*,\s*\d+\s*,\s*\d+\s*\)", content)
    for qq_id, qz_id, q_id in qq_matches:
        if qz_id not in quizzes:
            print(f"[ERROR] Quiz question {qq_id} references non-existent quiz {qz_id}")
            sys.exit(1)
        if q_id not in questions:
            print(f"[ERROR] Quiz question {qq_id} references non-existent question {q_id}")
            sys.exit(1)

    print(f"[OK] Seed file internal consistency verified:")
    print(f"  - Skills: {len(skills)}")
    print(f"  - Modules: {len(modules)}")
    print(f"  - Lessons: {len(lessons)}")
    print(f"  - Questions: {len(questions)}")
    print(f"  - Quizzes: {len(quizzes)}")
    print(f"  - Quiz Questions Mappings: {len(qq_matches)}")

if __name__ == "__main__":
    validate_seed()
