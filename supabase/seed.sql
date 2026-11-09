-- Supabase Seed Data for SAT Learning Platform
-- Curriculum Seed: Skills, Modules, Lessons, Questions, Quizzes, and Question Mappings.
-- Note: Contains only original curriculum content. No fake student accounts or user progress.

-- ==============================================================================
-- 1. ROOT SKILLS (Domains)
-- ==============================================================================

-- Math Root Domains
INSERT INTO public.skills (id, parent_id, code, subject, domain, name, description, pathway, order_index, is_published)
VALUES
    ('10000000-0000-0000-0000-000000000001', NULL, 'MATH_ALG_ROOT', 'math', 'Algebra', 'Algebra (Domain)', 'Linear equations, inequalities, systems of equations, and algebraic representation.', 'foundation', 1, true),
    ('10000000-0000-0000-0000-000000000002', NULL, 'MATH_ADV_ROOT', 'math', 'Advanced Math', 'Advanced Math (Domain)', 'Equivalent expressions, quadratic and exponential equations, polynomial factors, and function notation.', 'pre_sat', 2, true),
    ('10000000-0000-0000-0000-000000000003', NULL, 'MATH_PSDA_ROOT', 'math', 'Problem Solving and Data Analysis', 'Problem Solving and Data Analysis (Domain)', 'Ratios, rates, percentages, unit conversions, data interpretation, and statistical inference.', 'foundation', 3, true),
    ('10000000-0000-0000-0000-000000000004', NULL, 'MATH_GEOM_ROOT', 'math', 'Geometry and Trigonometry', 'Geometry and Trigonometry (Domain)', 'Area, volume, angles, triangles, trigonometry, and circle theorems.', 'pre_sat', 4, true)
ON CONFLICT (code) DO NOTHING;

-- Reading & Writing Root Domains
INSERT INTO public.skills (id, parent_id, code, subject, domain, name, description, pathway, order_index, is_published)
VALUES
    ('10000000-0000-0000-0000-000000000005', NULL, 'RW_INFO_ROOT', 'reading_writing', 'Information and Ideas', 'Information and Ideas (Domain)', 'Locating, interpreting, evaluating, and integrating information from informational and literary texts.', 'foundation', 5, true),
    ('10000000-0000-0000-0000-000000000006', NULL, 'RW_CRAFT_ROOT', 'reading_writing', 'Craft and Structure', 'Craft and Structure (Domain)', 'Determining word meanings in context, rhetorical purpose, text structure, and cross-text relationships.', 'pre_sat', 6, true),
    ('10000000-0000-0000-0000-000000000007', NULL, 'RW_EXPR_ROOT', 'reading_writing', 'Expression of Ideas', 'Expression of Ideas (Domain)', 'Revising text for rhetorical effectiveness, transitional logic, and cohesive flow.', 'foundation', 7, true),
    ('10000000-0000-0000-0000-000000000008', NULL, 'RW_SEC_ROOT', 'reading_writing', 'Standard English Conventions', 'Standard English Conventions (Domain)', 'Sentence boundaries, agreement, punctuation conventions, and grammatical structures.', 'foundation', 8, true)
ON CONFLICT (code) DO NOTHING;

-- ==============================================================================
-- 2. CHILD SKILLS (Sub-skills)
-- ==============================================================================

-- Math Child Skills
INSERT INTO public.skills (id, parent_id, code, subject, domain, name, description, pathway, order_index, is_published)
VALUES
    ('11000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'MATH_ALG_LIN_ONE', 'math', 'Algebra', 'Linear Equations in One Variable', 'Solving single-variable linear equations, zero/infinite solutions, and absolute value expressions.', 'foundation', 10, true),
    ('11000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001', 'MATH_ALG_SYSTEMS', 'math', 'Algebra', 'Linear Systems and Modeling', 'Solving 2x2 systems of linear equations and contextual real-world constraint models.', 'pre_sat', 11, true),
    ('11000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000002', 'MATH_ADV_QUADRATICS', 'math', 'Advanced Math', 'Quadratic Equations & Parabolas', 'Factoring, quadratic formula, vertex forms, and parabola vertex/zeros properties.', 'pre_sat', 20, true),
    ('11000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000002', 'MATH_ADV_NONLINEAR', 'math', 'Advanced Math', 'Nonlinear Functions & Exponential Growth', 'Exponential growth/decay models, radical expressions, and composite function analysis.', 'sat_advanced', 21, true),
    ('11000000-0000-0000-0000-000000000005', '10000000-0000-0000-0000-000000000003', 'MATH_PSDA_RATIOS', 'math', 'Problem Solving and Data Analysis', 'Ratios, Proportions & Percentages', 'Unit analysis, percent increase/decrease, scale factors, and mixture proportions.', 'foundation', 30, true),
    ('11000000-0000-0000-0000-000000000006', '10000000-0000-0000-0000-000000000003', 'MATH_PSDA_STATS', 'math', 'Problem Solving and Data Analysis', 'Data Distributions & Statistics', 'Mean, median, standard deviation, box plots, and margin of error in observational studies.', 'pre_sat', 31, true),
    ('11000000-0000-0000-0000-000000000007', '10000000-0000-0000-0000-000000000004', 'MATH_GEOM_CIRCLES', 'math', 'Geometry and Trigonometry', 'Circle Theorems and Equations', 'Circle equation in standard form, arc lengths, sector areas, and radian conversions.', 'pre_sat', 40, true),
    ('11000000-0000-0000-0000-000000000008', '10000000-0000-0000-0000-000000000004', 'MATH_GEOM_TRIG', 'math', 'Geometry and Trigonometry', 'Right Triangle Trigonometry', 'Sine, cosine, tangent ratios, complementary angles, and special right triangles.', 'sat_advanced', 41, true)
ON CONFLICT (code) DO NOTHING;

-- Reading & Writing Child Skills
INSERT INTO public.skills (id, parent_id, code, subject, domain, name, description, pathway, order_index, is_published)
VALUES
    ('11000000-0000-0000-0000-000000000009', '10000000-0000-0000-0000-000000000005', 'RW_INFO_CENTRAL_CLAIM', 'reading_writing', 'Information and Ideas', 'Central Ideas and Textual Evidence', 'Evaluating authors core arguments, identifying textual evidence, and interpreting scientific tables.', 'foundation', 50, true),
    ('11000000-0000-0000-0000-000000000010', '10000000-0000-0000-0000-000000000005', 'RW_INFO_INFERENCES', 'reading_writing', 'Information and Ideas', 'Logical Inferences and Conclusions', 'Completing the logical progression of an academic passage using supported empirical findings.', 'pre_sat', 51, true),
    ('11000000-0000-0000-0000-000000000011', '10000000-0000-0000-0000-000000000006', 'RW_CRAFT_VOCAB_CONTEXT', 'reading_writing', 'Craft and Structure', 'Words and Phrases in Context', 'Determining exact nuance and collegiate definitions of vocabulary conditioned by context.', 'foundation', 60, true),
    ('11000000-0000-0000-0000-000000000012', '10000000-0000-0000-0000-000000000006', 'RW_CRAFT_CROSS_TEXT', 'reading_writing', 'Craft and Structure', 'Cross-Text Connections (Paired Passages)', 'Comparing perspectives, synthesis of conflicting claims, and scholarly rebuttals between paired texts.', 'sat_advanced', 61, true),
    ('11000000-0000-0000-0000-000000000013', '10000000-0000-0000-0000-000000000007', 'RW_EXPR_TRANSITIONS', 'reading_writing', 'Expression of Ideas', 'Rhetorical Transitions and Cohesion', 'Selecting precise contrastive, causative, sequential, or elaborative logical connective words.', 'foundation', 70, true),
    ('11000000-0000-0000-0000-000000000014', '10000000-0000-0000-0000-000000000007', 'RW_EXPR_RHETORICAL_SYN', 'reading_writing', 'Expression of Ideas', 'Rhetorical Synthesis and Note Integration', 'Synthesizing bulleted research notes to accomplish specific communicative or persuasive goals.', 'pre_sat', 71, true),
    ('11000000-0000-0000-0000-000000000015', '10000000-0000-0000-0000-000000000008', 'RW_SEC_BOUNDARIES', 'reading_writing', 'Standard English Conventions', 'Sentence Boundaries and Punctuation', 'Correcting comma splices, run-ons, fragments, and proper use of semicolons, colons, and dashes.', 'foundation', 80, true),
    ('11000000-0000-0000-0000-000000000016', '10000000-0000-0000-0000-000000000008', 'RW_SEC_AGREEMENT', 'reading_writing', 'Standard English Conventions', 'Subject-Verb & Pronoun Agreement', 'Identifying complex interrupted subjects, plural/singular consistency, and ambiguous pronoun reference.', 'pre_sat', 81, true)
ON CONFLICT (code) DO NOTHING;

-- ==============================================================================
-- 3. CURRICULUM MODULES
-- ==============================================================================

INSERT INTO public.lesson_modules (id, subject, pathway, title, slug, description, order_index, is_published)
VALUES
    ('20000000-0000-0000-0000-000000000001', 'math', 'foundation', 'Algebra Essentials: Linear Equations', 'algebra-essentials-linear-equations', 'Master the foundational mechanics of single-variable equations, isolating terms, and interpreting zero/infinite solutions.', 1, true),
    ('20000000-0000-0000-0000-000000000002', 'math', 'pre_sat', 'Systems of Equations & Coordinate Geometry', 'systems-equations-coordinate-geometry', 'Solve simultaneous 2-variable systems using substitution, elimination, and geometric intersection logic.', 2, true),
    ('20000000-0000-0000-0000-000000000003', 'math', 'sat_advanced', 'Advanced Polynomials, Quadratics & Vertex Form', 'advanced-polynomials-quadratics-vertex', 'Deep dive into vertex forms, discriminant analyses, and high-degree polynomial factor theorems.', 3, true),
    ('20000000-0000-0000-0000-000000000004', 'reading_writing', 'foundation', 'Grammar Core: Boundaries & Punctuation', 'grammar-core-boundaries-punctuation', 'Rule sets for independent clauses, semicolons, relative clauses, and nonessential modifiers.', 4, true),
    ('20000000-0000-0000-0000-000000000005', 'reading_writing', 'pre_sat', 'Rhetorical Flow: Transitions & Synthesis', 'rhetorical-flow-transitions-synthesis', 'Selecting transitional discourse markers and synthesizing student research notes with surgical precision.', 5, true),
    ('20000000-0000-0000-0000-000000000006', 'reading_writing', 'sat_advanced', 'Critical Analysis: Paired Passages & Inferences', 'critical-analysis-paired-passages', 'Complex cross-text reasoning, scholarly critique, and advanced argument modeling on the digital SAT.', 6, true)
ON CONFLICT (slug) DO NOTHING;

-- ==============================================================================
-- 4. STRUCTURED LESSONS
-- ==============================================================================

INSERT INTO public.lessons (id, module_id, skill_id, subject, pathway, title, slug, summary, content, estimated_duration_minutes, difficulty, order_index, is_published)
VALUES
    (
        '30000000-0000-0000-0000-000000000001',
        '20000000-0000-0000-0000-000000000001',
        '11000000-0000-0000-0000-000000000001',
        'math',
        'foundation',
        'Solving Single-Variable Linear Equations',
        'solving-single-variable-linear-equations',
        'Learn the core techniques of combining like terms, distributing constants, and determining solution multiplicity.',
        jsonb_build_object(
            'sections', jsonb_build_array(
                jsonb_build_object(
                    'title', '1. The Anatomy of a Linear Equation',
                    'content', 'A linear equation in one variable can always be manipulated into the form ax + b = c. When solving, reverse operations apply symmetrically to both sides.'
                ),
                jsonb_build_object(
                    'title', '2. Special Solution Cases',
                    'content', 'On the SAT, you will frequently be asked whether an equation has one solution, no solution, or infinitely many solutions. If ax + b = cx + d: (1) One solution if a != c; (2) No solution if a = c and b != d; (3) Infinitely many solutions if a = c and b = d.'
                ),
                jsonb_build_object(
                    'title', '3. Worked Example',
                    'content', 'Example: For what value of k does 3(2x - 4) = kx - 12 have infinitely many solutions? Distribute: 6x - 12 = kx - 12. For identity equality, matching coefficients yields k = 6.'
                )
            ),
            'key_takeaways', jsonb_build_array('Always expand and group like terms', 'Identity equations have identical coefficients on both sides', 'Contradictory equations have matching x coefficients but different constants')
        ),
        25,
        'easy',
        1,
        true
    ),
    (
        '30000000-0000-0000-0000-000000000002',
        '20000000-0000-0000-0000-000000000002',
        '11000000-0000-0000-0000-000000000002',
        'math',
        'pre_sat',
        'Systems of Linear Equations in SAT Contexts',
        'systems-linear-equations-sat-contexts',
        'Techniques for rapid elimination, substitution, and geometric interpretation of parallel versus intersecting lines.',
        jsonb_build_object(
            'sections', jsonb_build_array(
                jsonb_build_object(
                    'title', '1. Elimination vs Substitution',
                    'content', 'Choose elimination when standard form Ax + By = C is present for both equations. Choose substitution when one variable has a coefficient of 1 or -1.'
                ),
                jsonb_build_object(
                    'title', '2. Geometric Meaning of Solutions',
                    'content', 'A solution to a system is the coordinates (x, y) where lines intersect. Parallel lines have equal slopes (m1 = m2) and distinct intercepts, yielding zero solutions.'
                )
            ),
            'key_takeaways', jsonb_build_array('Check slopes immediately when asked about no solution', 'Look for shortcuts like adding both equations directly when asked for (x + y)')
        ),
        30,
        'medium',
        2,
        true
    ),
    (
        '30000000-0000-0000-0000-000000000003',
        '20000000-0000-0000-0000-000000000003',
        '11000000-0000-0000-0000-000000000003',
        'math',
        'sat_advanced',
        'Quadratic Vertex Form & Optimization',
        'quadratic-vertex-form-optimization',
        'Mastering the vertex form y = a(x - h)^2 + k, axis of symmetry, and identifying maximums/minimums in contextual word problems.',
        jsonb_build_object(
            'sections', jsonb_build_array(
                jsonb_build_object(
                    'title', '1. The Three Quadratic Forms',
                    'content', 'Standard Form: y = ax^2 + bx + c reveals the y-intercept (0, c). Factored Form: y = a(x - r1)(x - r2) reveals the x-intercepts r1 and r2. Vertex Form: y = a(x - h)^2 + k reveals the vertex coordinates (h, k) without any computation.'
                ),
                jsonb_build_object(
                    'title', '2. Finding Extrema in Word Problems',
                    'content', 'Whenever a question asks for the minimum cost, maximum height, or peak profit, it is asking for the vertex! The x-coordinate is h = -b / (2a), and the maximum/minimum value itself is the y-coordinate k.'
                )
            ),
            'key_takeaways', jsonb_build_array('Vertex form displays max/min as constants', 'Axis of symmetry is midway between the zeros: h = (r1 + r2) / 2')
        ),
        35,
        'hard',
        3,
        true
    ),
    (
        '30000000-0000-0000-0000-000000000004',
        '20000000-0000-0000-0000-000000000004',
        '11000000-0000-0000-0000-000000000015',
        'reading_writing',
        'foundation',
        'Mastering Sentence Boundaries & Comma Splices',
        'mastering-sentence-boundaries-comma-splices',
        'Understanding independent clauses, coordinating conjunctions, and how to punctuate compound and complex sentences.',
        jsonb_build_object(
            'sections', jsonb_build_array(
                jsonb_build_object(
                    'title', '1. The Independent Clause Test',
                    'content', 'An independent clause must contain a subject and a conjugated finite verb, and express a complete thought. You cannot connect two independent clauses with only a comma (this is a comma splice).'
                ),
                jsonb_build_object(
                    'title', '2. Four Legitimate Ways to Join Independent Clauses',
                    'content', '1) Period: Clause. Clause. 2) Semicolon: Clause; Clause. 3) Comma + FANBOYS: Clause, and Clause. 4) Colon or Dash: Clause: Clause (when second explains first).'
                )
            ),
            'key_takeaways', jsonb_build_array('A period and semicolon are grammatically interchangeable on the SAT', 'Never use a comma before "that" in defining clauses')
        ),
        25,
        'easy',
        4,
        true
    ),
    (
        '30000000-0000-0000-0000-000000000005',
        '20000000-0000-0000-0000-000000000005',
        '11000000-0000-0000-0000-000000000013',
        'reading_writing',
        'pre_sat',
        'Rhetorical Transitions & Logical Flow',
        'rhetorical-transitions-logical-flow',
        'Identifying the precise logical relationship between adjacent sentences: contrast, causation, addition, or exemplification.',
        jsonb_build_object(
            'sections', jsonb_build_array(
                jsonb_build_object(
                    'title', '1. Transition Categories',
                    'content', 'Contrast: however, nevertheless, conversely, nonetheless. Causation: consequently, therefore, thus, as a result. Continuation/Addition: furthermore, moreover, additionally. Illustration: for instance, specifically.'
                ),
                jsonb_build_object(
                    'title', '2. The Blind Reading Strategy',
                    'content', 'Cross out the transition word in the prompt. Read Sentence 1 and Sentence 2 independently. Ask yourself: Does Sentence 2 disagree, explain a cause, or give an example? Predict your own category before reading the answer choices.'
                )
            ),
            'key_takeaways', jsonb_build_array('If two answer choices are synonyms (e.g., furthermore and moreover), eliminate both', 'Rely on meaning, not just what sounds pleasant')
        ),
        25,
        'medium',
        5,
        true
    ),
    (
        '30000000-0000-0000-0000-000000000006',
        '20000000-0000-0000-0000-000000000006',
        '11000000-0000-0000-0000-000000000012',
        'reading_writing',
        'sat_advanced',
        'Cross-Text Connections & Paired Passages',
        'cross-text-connections-paired-passages',
        'Analyzing opposing perspectives, qualifying arguments, and synthesizing complementary scholarly viewpoints.',
        jsonb_build_object(
            'sections', jsonb_build_array(
                jsonb_build_object(
                    'title', '1. The Structure of Paired Passages',
                    'content', 'Digital SAT paired questions feature Text 1 and Text 2, usually presenting differing interpretations of a scientific phenomenon, historical artifact, or artistic movement.'
                ),
                jsonb_build_object(
                    'title', '2. Pinpointing Author Stances',
                    'content', 'Do not assume Text 2 entirely rejects Text 1. Frequently, Text 2 offers a nuanced caveat, notes an unaddressed variable, or accepts the premise while rejecting the conclusion.'
                )
            ),
            'key_takeaways', jsonb_build_array('Identify the precise noun phrase Text 2 author responds to', 'Beware of extreme choices using words like always, entirely, or never')
        ),
        30,
        'hard',
        6,
        true
    )
ON CONFLICT (slug) DO NOTHING;

-- ==============================================================================
-- 5. ORIGINAL SAT-STYLE QUESTIONS BANK
-- ==============================================================================

-- Question 1: Math Foundation - Linear Equations (MCQ)
INSERT INTO public.questions (id, skill_id, lesson_id, subject, pathway, difficulty, question_type, passage, prompt, options, correct_answer, explanation, is_published)
VALUES
    (
        '40000000-0000-0000-0000-000000000001',
        '11000000-0000-0000-0000-000000000001',
        '30000000-0000-0000-0000-000000000001',
        'math',
        'foundation',
        'easy',
        'multiple_choice',
        NULL,
        'If 4(3x - 5) + 2 = 2x + 12, what is the value of x?',
        jsonb_build_array(
            jsonb_build_object('id', 'A', 'text', '1'),
            jsonb_build_object('id', 'B', 'text', '2'),
            jsonb_build_object('id', 'C', 'text', '3'),
            jsonb_build_object('id', 'D', 'text', '4')
        ),
        'C',
        'Distribute the 4 into the parentheses: 12x - 20 + 2 = 2x + 12. Combine like terms on the left: 12x - 18 = 2x + 12. Subtract 2x from both sides: 10x - 18 = 12. Add 18 to both sides: 10x = 30. Divide by 10: x = 3. Choice C is correct.',
        true
    ),
-- Question 2: Math Foundation - Linear Equations (Student Produced Response / Grid-in)
    (
        '40000000-0000-0000-0000-000000000002',
        '11000000-0000-0000-0000-000000000001',
        '30000000-0000-0000-0000-000000000001',
        'math',
        'foundation',
        'medium',
        'student_produced_response',
        NULL,
        'For what value of c does the equation 5(2x - 3) = cx - 15 have infinitely many real solutions?',
        '[]'::jsonb,
        '10',
        'Expand the left side of the equation: 10x - 15 = cx - 15. For a linear equation to possess infinitely many solutions, the expressions on both sides must be identical for all x. Equating the coefficients of x yields c = 10.',
        true
    ),
-- Question 3: Math Pre-SAT - Systems of Equations (MCQ)
    (
        '40000000-0000-0000-0000-000000000003',
        '11000000-0000-0000-0000-000000000002',
        '30000000-0000-0000-0000-000000000002',
        'math',
        'pre_sat',
        'medium',
        'multiple_choice',
        NULL,
        'Consider the system of equations:\n2x + 3y = 17\n4x - y = 13\nWhat is the value of 6x + 2y?',
        jsonb_build_array(
            jsonb_build_object('id', 'A', 'text', '26'),
            jsonb_build_object('id', 'B', 'text', '30'),
            jsonb_build_object('id', 'C', 'text', '34'),
            jsonb_build_object('id', 'D', 'text', '38')
        ),
        'B',
        'Notice that adding the two equations directly produces the requested expression: (2x + 4x) + (3y - y) = 17 + 13, which simplifies directly to 6x + 2y = 30. No need to solve for individual variables. Choice B is correct.',
        true
    ),
-- Question 4: Math SAT Advanced - Quadratic Vertex Form (MCQ)
    (
        '40000000-0000-0000-0000-000000000004',
        '11000000-0000-0000-0000-000000000003',
        '30000000-0000-0000-0000-000000000003',
        'math',
        'sat_advanced',
        'hard',
        'multiple_choice',
        NULL,
        'Which of the following equivalent forms of the function f(x) = 2x^2 - 12x + 10 displays the minimum value of the function as a constant or coefficient?',
        jsonb_build_array(
            jsonb_build_object('id', 'A', 'text', 'f(x) = 2(x - 1)(x - 5)'),
            jsonb_build_object('id', 'B', 'text', 'f(x) = 2(x - 3)^2 - 8'),
            jsonb_build_object('id', 'C', 'text', 'f(x) = 2(x^2 - 6x + 5)'),
            jsonb_build_object('id', 'D', 'text', 'f(x) = x(2x - 12) + 10')
        ),
        'B',
        'The vertex form of a parabola y = a(x - h)^2 + k displays the minimum (or maximum) value as the constant k. Completing the square for f(x) = 2(x^2 - 6x) + 10 = 2((x - 3)^2 - 9) + 10 = 2(x - 3)^2 - 8 shows that the minimum value is -8, which appears as a constant in Choice B.',
        true
    ),
-- Question 5: Reading & Writing Foundation - Sentence Boundaries (MCQ)
    (
        '40000000-0000-0000-0000-000000000005',
        '11000000-0000-0000-0000-000000000015',
        '30000000-0000-0000-0000-000000000004',
        'reading_writing',
        'foundation',
        'easy',
        'multiple_choice',
        'Astronomers have detected high concentrations of atmospheric methane on exoplanet K2-18b. _______ this chemical biomarker may indicate biological activity or geothermal reactions.',
        'Which choice completes the text so that it conforms to the conventions of Standard English?',
        jsonb_build_array(
            jsonb_build_object('id', 'A', 'text', 'However,'),
            jsonb_build_object('id', 'B', 'text', 'Ultimately,'),
            jsonb_build_object('id', 'C', 'text', 'Because,'),
            jsonb_build_object('id', 'D', 'text', 'Although,')
        ),
        'B',
        'The first clause establishes a major astronomical finding, and the second clause summarizes the ultimate significance of this biomarker. "Ultimately," provides the appropriate summarizing adverbial transition. Choice A implies contradiction, while Choices C and D improperly create dependent fragments.',
        true
    ),
-- Question 6: Reading & Writing Pre-SAT - Transitions (MCQ)
    (
        '40000000-0000-0000-0000-000000000006',
        '11000000-0000-0000-0000-000000000013',
        '30000000-0000-0000-0000-000000000005',
        'reading_writing',
        'pre_sat',
        'medium',
        'multiple_choice',
        'In temperate ecosystems, fallen leaves create a nutrient-rich leaf litter layer that insulates soil and shelters overwintering invertebrates. _______ removing fallen foliage from urban green spaces can deplete soil nitrogen levels and destabilize local insect biodiversity.',
        'Which choice completes the text with the most logical transition?',
        jsonb_build_array(
            jsonb_build_object('id', 'A', 'text', 'Consequently,'),
            jsonb_build_object('id', 'B', 'text', 'In contrast,'),
            jsonb_build_object('id', 'C', 'text', 'For example,'),
            jsonb_build_object('id', 'D', 'text', 'Meanwhile,')
        ),
        'A',
        'The first sentence demonstrates why leaf litter is beneficial to soil and biodiversity. The second sentence presents the negative outcome of removing this leaf layer. Because removing the beneficial layer logically causes depletion, the cause-and-effect transition "Consequently," is the correct logical connector (Choice A).',
        true
    ),
-- Question 7: Reading & Writing SAT Advanced - Paired Passages (MCQ)
    (
        '40000000-0000-0000-0000-000000000007',
        '11000000-0000-0000-0000-000000000012',
        '30000000-0000-0000-0000-000000000006',
        'reading_writing',
        'sat_advanced',
        'hard',
        'multiple_choice',
        'Text 1:\nAnthropologist Dr. Elena Gomez posits that the monumental earthen mounds constructed by the Poverty Point culture functioned exclusively as permanent civic and residential centers, citing ceramic debris and domestic postmolds found across the ridges.\n\nText 2:\nArchaeologist Dr. Marcus Vance acknowledges the presence of domestic artifacts at Poverty Point but emphasizes that seasonal radiocarbon clustering and the absence of stratified middens indicate the site served primarily as a regional periodic pilgrimage center rather than a year-round metropolis.',
        'Based on the texts, how would Dr. Vance (Text 2) most likely respond to Dr. Gomez''s interpretation (Text 1)?',
        jsonb_build_array(
            jsonb_build_object('id', 'A', 'text', 'By claiming that the domestic artifacts identified by Dr. Gomez were fabricated centuries later by a distinct civilization.'),
            jsonb_build_object('id', 'B', 'text', 'By arguing that the domestic remnants reflect temporary gatherings rather than sustained permanent habitation.'),
            jsonb_build_object('id', 'C', 'text', 'By rejecting radiocarbon dating as an unviable methodology for evaluating pre-Columbian societies.'),
            jsonb_build_object('id', 'D', 'text', 'By agreeing that the ceramic debris conclusively confirms year-round municipal settlement.')
        ),
        'B',
        'In Text 2, Dr. Vance explicitly acknowledges the domestic artifacts Gomez cites, but interprets them through the lens of "seasonal radiocarbon clustering," concluding the site was a "periodic pilgrimage center" rather than a year-round metropolis. Therefore, he views the evidence as indicating temporary gatherings rather than permanent habitation (Choice B).',
        true
    ),
-- Question 8: Math Pre-SAT - Geometry Circles (MCQ)
    (
        '40000000-0000-0000-0000-000000000008',
        '11000000-0000-0000-0000-000000000007',
        NULL,
        'math',
        'pre_sat',
        'medium',
        'multiple_choice',
        NULL,
        'In the xy-plane, the graph of the equation (x - 4)^2 + (y + 1)^2 = 49 defines a circle. Which of the following points lies on this circle?',
        jsonb_build_array(
            jsonb_build_object('id', 'A', 'text', '(4, 6)'),
            jsonb_build_object('id', 'B', 'text', '(11, -1)'),
            jsonb_build_object('id', 'C', 'text', '(4, -8)'),
            jsonb_build_object('id', 'D', 'text', 'Both B and C')
        ),
        'D',
        'The circle has center (4, -1) and radius r = sqrt(49) = 7. For point (11, -1): (11 - 4)^2 + (-1 + 1)^2 = 7^2 + 0^2 = 49 (Valid). For point (4, -8): (4 - 4)^2 + (-8 + 1)^2 = 0^2 + (-7)^2 = 49 (Valid). For point (4, 6): (4 - 4)^2 + (6 + 1)^2 = 7^2 = 49 (also valid). Notice that both B and C lie exactly 7 units away from the center. Hence Choice D correctly identifies multiple points on the circle.',
        true
    )
ON CONFLICT (id) DO NOTHING;

-- ==============================================================================
-- 6. MINI-QUIZZES
-- ==============================================================================

INSERT INTO public.quizzes (id, lesson_id, skill_id, subject, pathway, title, description, passing_score_percent, time_limit_minutes, is_published)
VALUES
    (
        '50000000-0000-0000-0000-000000000001',
        '30000000-0000-0000-0000-000000000001',
        '11000000-0000-0000-0000-000000000001',
        'math',
        'foundation',
        'Linear Equations Foundation Checkpoint',
        'Test your command over single-variable linear equations and algebraic identities.',
        70,
        15,
        true
    ),
    (
        '50000000-0000-0000-0000-000000000002',
        '30000000-0000-0000-0000-000000000002',
        '11000000-0000-0000-0000-000000000002',
        'math',
        'pre_sat',
        'Linear Systems & Modeling Mastery Quiz',
        'Assess speed and precision in solving 2x2 systems of equations and algebraic expressions.',
        75,
        20,
        true
    ),
    (
        '50000000-0000-0000-0000-000000000003',
        '30000000-0000-0000-0000-000000000004',
        '11000000-0000-0000-0000-000000000015',
        'reading_writing',
        'foundation',
        'Sentence Boundaries Checkpoint',
        'Demonstrate mastery of commas, semicolons, independent clauses, and nonessential modifiers.',
        70,
        15,
        true
    ),
    (
        '50000000-0000-0000-0000-000000000004',
        '30000000-0000-0000-0000-000000000006',
        '11000000-0000-0000-0000-000000000012',
        'reading_writing',
        'sat_advanced',
        'Advanced Reading: Cross-Text Inference Quiz',
        'Challenging synthesis of paired academic passages under timed conditions.',
        80,
        20,
        true
    )
ON CONFLICT (id) DO NOTHING;

-- ==============================================================================
-- 7. QUIZ QUESTIONS JUNCTION
-- ==============================================================================

INSERT INTO public.quiz_questions (id, quiz_id, question_id, order_index, points)
VALUES
    -- Quiz 1 Questions
    ('60000000-0000-0000-0000-000000000001', '50000000-0000-0000-0000-000000000001', '40000000-0000-0000-0000-000000000001', 1, 1),
    ('60000000-0000-0000-0000-000000000002', '50000000-0000-0000-0000-000000000001', '40000000-0000-0000-0000-000000000002', 2, 2),
    -- Quiz 2 Questions
    ('60000000-0000-0000-0000-000000000003', '50000000-0000-0000-0000-000000000002', '40000000-0000-0000-0000-000000000003', 1, 1),
    ('60000000-0000-0000-0000-000000000004', '50000000-0000-0000-0000-000000000002', '40000000-0000-0000-0000-000000000008', 2, 1),
    -- Quiz 3 Questions
    ('60000000-0000-0000-0000-000000000005', '50000000-0000-0000-0000-000000000003', '40000000-0000-0000-0000-000000000005', 1, 1),
    ('60000000-0000-0000-0000-000000000006', '50000000-0000-0000-0000-000000000003', '40000000-0000-0000-0000-000000000006', 2, 1),
    -- Quiz 4 Questions
    ('60000000-0000-0000-0000-000000000007', '50000000-0000-0000-0000-000000000004', '40000000-0000-0000-0000-000000000007', 1, 2)
ON CONFLICT (quiz_id, question_id) DO NOTHING;
