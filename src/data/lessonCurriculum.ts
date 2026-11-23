/**
 * Rich 6-Slide Curriculum Data for SAT Prep Lessons.
 * Guarantees every lesson has 5-6 comprehensive pedagogical slides:
 * 1. Introduction & Overview
 * 2. Core Concepts & Formulas/Rules
 * 3. Step-by-Step SAT Worked Example
 * 4. SAT Traps & Pro Shortcuts
 * 5. Homework & Practice Challenge (with step-by-step solutions)
 * 6. Summary, Key Takeaways & Mini-Quiz Checkpoint
 */

export interface LessonHomeworkTask {
  id: number;
  question: string;
  hint?: string;
  solution: string;
  correctAnswer?: string;
}

export interface LessonSectionSlide {
  title: string;
  subtitle?: string;
  badge?: string;
  content: string;
  isHomework?: boolean;
  homeworkTasks?: LessonHomeworkTask[];
}

export interface EnrichedLessonContent {
  sections: LessonSectionSlide[];
  key_takeaways: string[];
}

export const ENRICHED_LESSONS: Record<string, EnrichedLessonContent> = {
  // =========================================================================
  // LESSON 1: Solving Single-Variable Linear Equations
  // =========================================================================
  'solving-single-variable-linear-equations': {
    sections: [
      {
        title: '1. Anatomy of Linear Equations on the Digital SAT',
        subtitle: 'Fundamental algebraic structure and symmetric operations',
        badge: '📘 Overview',
        content: `Single-variable linear equations form the cornerstone of the Digital SAT Math section. Any single-variable linear equation can be transformed into the canonical form:
$$ax + b = c$$

### Core Solving Principles:
1. **Symmetric Operations**: Any algebraic operation (addition, subtraction, multiplication, division) applied to the left-hand side **must** be applied identically to the right-hand side.
2. **Distributive Property**:
$$p(qx + r) = pqx + pr$$
*Common Pitfall*: Always distribute negative signs across every term inside parentheses, e.g., $-(3x - 5) = -3x + 5$.
3. **Combining Like Terms**: Group all variable terms ($x$) on one side and all constant numbers on the opposite side:
$$(a - c)x = d - b$$`,
      },
      {
        title: '2. Three Types of Solutions: College Board Criteria',
        subtitle: 'Quickly determine the number of solutions without full computation',
        badge: '📐 Theory & Formulas',
        content: `The Digital SAT frequently tests the number of solutions for equations formatted as $ax + b = cx + d$. Memorize these 3 fundamental conditions:

| Solution Type | Coefficient Condition | Geometric Interpretation (Lines) |
|---|---|---|
| **Exactly 1 Solution** | $a \\neq c$ | Two lines with different slopes intersect at a single point $(x, y)$. |
| **No Solution** | $a = c$, but $b \\neq d$ | Parallel lines with identical slopes and distinct $y$-intercepts (never intersect). |
| **Infinitely Many Solutions** | $a = c$ and $b = d$ | Both sides are identical identities; the lines completely coincide. |

> **SAT Pro-Tip**: When a question states *"The equation has infinitely many solutions"*, immediately expand both sides and equate the coefficient of $x$ to the coefficient of $x$, and the constant term to the constant term!`,
      },
      {
        title: '3. Step-by-Step SAT Exam Walkthrough',
        subtitle: 'Fast 30-second solving algorithm for 650–750 level questions',
        badge: '🎯 SAT Example',
        content: `### Question (Digital SAT Hard Module):
> For what value of constant $k$ does the equation below have **infinitely many solutions**?
$$3(2x - 4) + 5 = kx - 7$$

### Step-by-Step Solution:
1. **Step 1: Distribute the constant on the left-hand side**:
$$6x - 12 + 5 = kx - 7$$
2. **Step 2: Combine like terms**:
$$6x - 7 = kx - 7$$
3. **Step 3: Apply the infinite solutions condition ($a = c$ and $b = d$)**:
   - The constant terms are already equal: $-7 = -7$.
   - Equate the coefficients of $x$:
$$6 = k \\implies k = 6$$

**Correct Answer**: $k = 6$.
*Target completion time with this strategy: under 20 seconds!*`,
      },
      {
        title: '4. College Board Traps & Speed Shortcuts',
        subtitle: 'Avoid distractors and master the embedded Desmos calculator',
        badge: '⚠️ Traps & Shortcuts',
        content: `### 🚨 Major SAT Trap: The Question Does Not Ask for $x$!
In approximately 35% of algebra questions, College Board does **not** ask for the value of $x$. Instead, it asks for an expression:
- *"What is the value of $2x - 3$?"*
- *"What is the value of $4x + 1$?"*

**Example**:
If $3x + 2 = 14$, then $3x = 12$. Do not divide by 3 if the question asks for $6x$!
$$6x = 2 \\times (3x) = 2 \\times 12 = 24$$
*Always underline what the question specifically asks for!*

### 💡 Embedded Desmos Calculator Shortcut:
If the algebra is messy, type the left side as $y = 3(2x - 4) + 5$ and the right side as $y = kx - 7$. Add a slider for $k$. For the lines to coincide completely, $k$ must equal 6!`,
      },
      {
        title: '5. Homework Practice & Challenge Problems',
        subtitle: 'Solve these 3 practice questions before taking the Mini-Quiz',
        badge: '📝 Homework Practice',
        isHomework: true,
        content: `Work through these 3 practice problems on scratch paper. Once solved, click **"Show Solution"** to verify your steps against the official SAT methodology.`,
        homeworkTasks: [
          {
            id: 1,
            question: 'If $4(x - 3) + 2 = ax + b$ has infinitely many real solutions for all values of $x$, what is the value of $a + b$?',
            hint: 'Expand the left side and match $a$ to the $x$-coefficient, and $b$ to the constant term.',
            solution: 'Expand the left side: $4x - 12 + 2 = 4x - 10$. Because there are infinitely many solutions, $ax + b = 4x - 10$, meaning $a = 4$ and $b = -10$. Thus, $a + b = 4 + (-10) = -6$.',
            correctAnswer: '-6',
          },
          {
            id: 2,
            question: 'For what value of $m$ does the equation $7x - 9 = mx + 4$ have NO solution?',
            hint: 'For no solution, the lines must be parallel (matching $x$-coefficients, distinct constants).',
            solution: 'For the equation to yield no solution, the coefficients of $x$ must be equal ($7 = m$), while the constant terms $-9 \\neq 4$ already differ. Therefore, $m = 7$.',
            correctAnswer: '7',
          },
          {
            id: 3,
            question: 'If $2(3x + 1) - 5 = 15$, what is the value of $6x - 3$?',
            hint: 'Notice that $2 \\times 3x = 6x$. Do not solve for $x$ individually!',
            solution: 'Expand parentheses: $6x + 2 - 5 = 15 \\implies 6x - 3 = 15$. The question directly asks for the value of $6x - 3$, so the answer is already 15!',
            correctAnswer: '15',
          },
        ],
      },
      {
        title: '6. Summary & Readiness Checkpoint',
        subtitle: 'Final checklist before launching the Mini-Quiz',
        badge: '🏆 Summary & Quiz',
        content: `Congratulations! You have completed the comprehensive review of **Solving Single-Variable Linear Equations**.

### Mini-Quiz Readiness Checklist:
- [x] You can reliably distribute constants and manage negative signs.
- [x] You know the criteria for 1 solution, no solution, and $\\infty$ solutions.
- [x] You verify whether the prompt requests $x$ or an algebraic expression.
- [x] You completed and verified all homework challenge problems.

*Click the button below to start your timed Mini-Quiz and advance your Roadmap mastery!*`,
      },
    ],
    key_takeaways: [
      'Always expand parentheses and group like terms before analyzing equations',
      'Infinitely many solutions: matching x-coefficients AND matching constant terms',
      'No solution: matching x-coefficients, but distinct constant terms',
      'Double check the prompt: the SAT frequently asks for expressions, not isolated x',
    ],
  },

  // =========================================================================
  // LESSON 2: Systems of Linear Equations in SAT Contexts
  // =========================================================================
  'systems-linear-equations-sat-contexts': {
    sections: [
      {
        title: '1. Systems of Linear Equations on the SAT',
        subtitle: 'Strategic choice between Elimination and Substitution',
        badge: '📘 Overview',
        content: `Linear systems on the Digital SAT model both abstract algebraic relationships and real-world word problems (ticket sales, mixture quantities, rate-time-distance).

### Choosing the Optimal Method:
- **Elimination Method**: Ideal when both equations are written in standard form $Ax + By = C$. Multiply one or both equations by scaling factors so that the coefficients of one variable become additive inverses.
- **Substitution Method**: Best when one equation has a variable already isolated (e.g., $y = 2x - 3$) or carries a coefficient of $1$ or $-1$.`,
      },
      {
        title: '2. Geometric Behavior of 2x2 Systems',
        subtitle: 'Intersecting, parallel, and coincident lines',
        badge: '📐 Theory & Formulas',
        content: `A solution to a system represents the intersection point $(x, y)$ of two lines on the coordinate plane.

For a linear system:
$$\\begin{cases} a_1 x + b_1 y = c_1 \\\\ a_2 x + b_2 y = c_2 \\end{cases}$$

1. **One Solution**: Lines have different slopes ($m_1 \\neq m_2$).
$$\\frac{a_1}{a_2} \\neq \\frac{b_1}{b_2}$$
2. **No Solution**: Lines are parallel (identical slopes, different $y$-intercepts).
$$\\frac{a_1}{a_2} = \\frac{b_1}{b_2} \\neq \\frac{c_1}{c_2}$$
3. **Infinitely Many Solutions**: Lines are identical and coincide completely.
$$\\frac{a_1}{a_2} = \\frac{b_1}{b_2} = \\frac{c_1}{c_2}$$`,
      },
      {
        title: '3. Step-by-Step SAT Exam Walkthrough',
        subtitle: 'Solving no-solution systems with unknown constants',
        badge: '🎯 SAT Example',
        content: `### Question:
> In the system of equations below, $k$ is a constant. If the system has **no solution**, what is the value of $k$?
$$\\begin{cases} 3x - 2y = 8 \\\\ kx - 6y = 15 \\end{cases}$$

### Step-by-Step Solution:
1. **Step 1: Write the proportional relationship for parallel lines**:
The coefficients of $x$ and $y$ must have matching ratios:
$$\\frac{3}{k} = \\frac{-2}{-6}$$
2. **Step 2: Simplify the $y$-ratio**:
$$\\frac{-2}{-6} = \\frac{1}{3}$$
3. **Step 3: Cross-multiply to solve for $k$**:
$$\\frac{3}{k} = \\frac{1}{3} \\implies k = 3 \\times 3 = 9$$
4. **Step 4: Verify constant inequality**:
$$\\frac{8}{15} \\neq \\frac{1}{3}$$ — the lines are parallel with distinct intercepts, confirming zero solutions.

**Correct Answer**: $k = 9$.`,
      },
      {
        title: '4. SAT Shortcut: Direct Equation Addition/Subtraction',
        subtitle: 'Save 60 seconds when the question asks for a sum of variables',
        badge: '⚠️ Traps & Shortcuts',
        content: `### 🚨 Do Not Solve for $x$ and $y$ Separately!
When a question asks:
- *"What is the value of $x + y$?"*
- *"What is the value of $x - y$?"*
- *"What is the value of $5x + 5y$?"*

You can almost always **add or subtract the two equations directly**!

**Example**:
$$\\begin{cases} 4x + 3y = 19 \\\\ 2x + 3y = 11 \\end{cases}$$
Subtract the second equation from the first:
$$(4x - 2x) + (3y - 3y) = 19 - 11 \\implies 2x = 8 \\implies x = 4$$
If the question asks for $x + y$, substitute $x = 4 \\implies 2(4) + 3y = 11 \\implies 3y = 3 \\implies y = 1$. Total: $x + y = 5$.`,
      },
      {
        title: '5. Homework Practice & Challenge Problems',
        subtitle: 'Master systems in abstract and contextual settings',
        badge: '📝 Homework Practice',
        isHomework: true,
        content: `Solve these 3 practice problems on paper before proceeding to the quiz.`,
        homeworkTasks: [
          {
            id: 1,
            question: 'If $3x + 5y = 20$ and $2x + 4y = 14$, what is the value of $x + y$?',
            hint: 'Try subtracting the second equation from the first equation directly!',
            solution: 'Subtract term-by-term: $(3x - 2x) + (5y - 4y) = 20 - 14 \\implies x + y = 6$. The result is obtained in one step without solving for $x$ and $y$ separately!',
            correctAnswer: '6',
          },
          {
            id: 2,
            question: 'For what value of $p$ will the system $\\begin{cases} px + 4y = 12 \\\\ 3x + 2y = 7 \\end{cases}$ have NO solution?',
            hint: 'The ratio of coefficients must be equal: $p / 3 = 4 / 2$.',
            solution: '$p / 3 = 4 / 2 = 2 \\implies p = 2 \\times 3 = 6$. Because $12 / 7 \\neq 2$, the lines are parallel and have no points of intersection.',
            correctAnswer: '6',
          },
          {
            id: 3,
            question: 'A coffee shop sells small cups for $3 each and large cups for $5 each. If 40 cups were sold for a total of $150, how many large cups were sold?',
            hint: 'Let $s$ be small and $l$ be large: $s + l = 40$ and $3s + 5l = 150$. Substitute $s = 40 - l$.',
            solution: 'Substitute $s = 40 - l$: $3(40 - l) + 5l = 150 \\implies 120 + 2l = 150 \\implies 2l = 30 \\implies l = 15$. Exactly 15 large cups were sold.',
            correctAnswer: '15',
          },
        ],
      },
      {
        title: '6. Summary & Readiness Checkpoint',
        subtitle: 'Review systems concepts before taking the Mini-Quiz',
        badge: '🏆 Summary & Quiz',
        content: `Great job! You have mastered the key strategies for systems of linear equations on the Digital SAT.

### Quick Checklist:
- [x] Know when to use Elimination vs Substitution.
- [x] Parallel lines condition: $a_1 / a_2 = b_1 / b_2 \\neq c_1 / c_2$.
- [x] Look for shortcuts when asked for expressions like $(x + y)$.
- [x] Verified homework problems.

*Click below to take the Mini-Quiz and earn your mastery score!*`,
      },
    ],
    key_takeaways: [
      'For no solution, slopes must match: a1/a2 = b1/b2 != c1/c2',
      'When asked for (x + y), check if adding or subtracting the equations yields the answer directly',
      'In Desmos, intersection points of systems can be inspected in one click',
    ],
  },

  // =========================================================================
  // LESSON 3: Quadratic Vertex Form & Optimization
  // =========================================================================
  'quadratic-vertex-form-optimization': {
    sections: [
      {
        title: '1. Three Quadratic Forms on the SAT',
        subtitle: 'Standard Form, Factored Form, and Vertex Form',
        badge: '📘 Overview',
        content: `Quadratic functions appear on the SAT across three equivalent algebraic forms. Each form directly exposes specific geometric features of the parabola:

1. **Standard Form**: $y = ax^2 + bx + c$
   - Displays the $y$-intercept at $(0, c)$.
   - Sign of $a$: $a > 0$ opens upwards (minimum), $a < 0$ opens downwards (maximum).
2. **Factored (Intercept) Form**: $y = a(x - r_1)(x - r_2)$
   - Directly displays the $x$-intercepts (roots): $(r_1, 0)$ and $(r_2, 0)$.
3. **Vertex Form**: $y = a(x - h)^2 + k$
   - Directly reveals the coordinates of the parabola vertex $(h, k)$ with zero computation!`,
      },
      {
        title: '2. Parabola Vertex & Optimization (Max / Min)',
        subtitle: 'Vertex formula, line of symmetry, and real-world modeling',
        badge: '📐 Theory & Formulas',
        content: `Whenever an SAT word problem mentions:
- *"maximum height"*
- *"minimum cost"*
- *"maximum revenue / profit"*
- *"peak trajectory"*

It is **always** asking for the parabola vertex $(h, k)$!

### Vertex Formulas from Standard Form $y = ax^2 + bx + c$:
$$h = -\\frac{b}{2a}$$
$$k = f(h) = a(h)^2 + b(h) + c$$

> **Key Distinction**:
> $h$ is the input value (e.g., time or ticket price that produces the optimum).
> $k$ is the actual optimal output (the maximum height or maximum profit achieved).`,
      },
      {
        title: '3. Step-by-Step SAT Exam Walkthrough',
        subtitle: 'Solving projectile trajectory and optimization problems',
        badge: '🎯 SAT Example',
        content: `### Question:
> The height $h$, in meters, of a projectile $t$ seconds after launch is modeled by the function:
$$h(t) = -5t^2 + 30t + 2$$
> What is the **maximum height**, in meters, reached by the projectile?

### Step-by-Step Solution:
1. **Step 1: Identify the quadratic coefficients**:
$$a = -5, \\quad b = 30, \\quad c = 2$$
2. **Step 2: Find time $t$ when the maximum is reached**:
$$t = -\\frac{b}{2a} = -\\frac{30}{2(-5)} = -\\frac{30}{-10} = 3 \\text{ seconds}$$
3. **Step 3: Evaluate $h(3)$ to find the maximum height**:
$$h(3) = -5(3)^2 + 30(3) + 2 = -5(9) + 90 + 2 = -45 + 90 + 2 = 47 \\text{ meters}$$

**Correct Answer**: $47$.`,
      },
      {
        title: '4. Traps in Vertex Form & Symmetry Properties',
        subtitle: 'Watch the negative sign in $(x - h)$ and leverage root symmetry',
        badge: '⚠️ Traps & Shortcuts',
        content: `### 🚨 Sign Trap in Vertex Form:
In the equation $y = 3(x - 4)^2 + 5$, the vertex is at **$(+4, 5)$**, NOT $(-4, 5)$!
In the equation $y = 2(x + 6)^2 - 1$, the vertex is at **$(-6, -1)$**.

### 💡 Axis of Symmetry Property:
The vertical line of symmetry always lies exactly halfway between the two roots:
$$h = \\frac{r_1 + r_2}{2}$$
If a parabola intersects the $x$-axis at $x = 2$ and $x = 8$, its vertex **must** have an $x$-coordinate of:
$$h = \\frac{2 + 8}{2} = 5$$`,
      },
      {
        title: '5. Homework Practice & Challenge Problems',
        subtitle: 'Practice quadratic optimization and vertex transformations',
        badge: '📝 Homework Practice',
        isHomework: true,
        content: `Complete these 3 practice problems to reinforce vertex analysis.`,
        homeworkTasks: [
          {
            id: 1,
            question: 'What is the vertex of the parabola given by $y = -2(x + 5)^2 + 18$?',
            hint: 'Compare with vertex form $y = a(x - h)^2 + k$. Remember that $(x + 5) = (x - (-5))$.',
            solution: 'From $y = a(x - h)^2 + k$: $h = -5$ and $k = 18$. The vertex is $(-5, 18)$. Since $a = -2 < 0$, it is a maximum.',
            correctAnswer: '(-5, 18)',
          },
          {
            id: 2,
            question: 'A parabola has roots at $x = -3$ and $x = 11$. What is the equation of its axis of symmetry?',
            hint: 'The axis of symmetry lies midway between the zeros: $x = (r_1 + r_2) / 2$.',
            solution: '$x = (-3 + 11) / 2 = 8 / 2 = 4$. The equation of the axis of symmetry is $x = 4$.',
            correctAnswer: 'x = 4',
          },
          {
            id: 3,
            question: 'The profit $P(x) = -x^2 + 16x - 20$ in thousands of dollars depends on price $x$. What price $x$ maximizes profit?',
            hint: 'The question asks for the price $x$, not the total profit! Calculate $h = -b / (2a)$.',
            solution: '$h = -16 / (2 \\times (-1)) = -16 / (-2) = 8$. The price that maximizes profit is $8.',
            correctAnswer: '8',
          },
        ],
      },
      {
        title: '6. Summary & Readiness Checkpoint',
        subtitle: 'Review quadratic optimization before taking the Mini-Quiz',
        badge: '🏆 Summary & Quiz',
        content: `Well done! You have mastered quadratic vertex identification and maximum/minimum optimization.

### Key Takeaways:
- [x] Vertex form $y = a(x - h)^2 + k$ displays $(h, k)$ directly.
- [x] Standard form vertex $x$-coordinate is $h = -b / (2a)$.
- [x] The axis of symmetry bisects the distance between roots.
- [x] Ready for the Mini-Quiz!

*Click below to take the Mini-Quiz!*`,
      },
    ],
    key_takeaways: [
      'Vertex form: y = a(x - h)^2 + k directly gives the vertex (h, k)',
      'The x-coordinate of the vertex is always computed as h = -b / (2a)',
      'The axis of symmetry is situated halfway between the quadratic roots',
    ],
  },

  // =========================================================================
  // LESSON 4: Mastering Sentence Boundaries & Comma Splices (R&W)
  // =========================================================================
  'mastering-sentence-boundaries-comma-splices': {
    sections: [
      {
        title: '1. Sentence Anatomy in SAT Reading & Writing',
        subtitle: 'Independent vs Dependent Clauses',
        badge: '📘 Overview',
        content: `Standard English Conventions questions on the Digital SAT rigorously test clause boundaries. Every English sentence revolves around **Independent Clauses** and **Dependent Clauses**.

### Independent Clause (Complete Sentence):
Must satisfy three strict criteria:
1. Has a grammatical subject (**Subject**).
2. Has a conjugated verb (**Finite Verb**).
3. Expresses a **complete thought** that can stand alone as a sentence.

*Example*: *The astronomer calibrated the telescope.* (Complete sentence).

### Dependent Clause:
Begins with a subordinating conjunction (*because, although, since, whereas, while, if*) or a relative pronoun (*which, that, who*). It cannot stand alone!`,
      },
      {
        title: '2. Four Valid Ways to Join Independent Clauses',
        subtitle: 'The essential grammar chart for the Digital SAT',
        badge: '📐 Theory & Rules',
        content: `Two independent clauses (**Independent + Independent**) can **ONLY** be joined in four grammatically valid ways:

1. **Period**:
   > *Clause.* **[ . ]** *Clause.*
2. **Semicolon**:
   > *Clause; Clause.*
   *(On the SAT, a period and a semicolon are grammatically equivalent!)*
3. **Comma + FANBOYS Conjunction**:
   > *Clause,* **and/but/for/nor/or/so/yet** *Clause.*
4. **Colon or Em-Dash**:
   > *Clause:* *Clause.* (when the second clause elaborates on or explains the first).

> **THE CARDINAL SIN: COMMA SPLICE**:
> Never join two independent clauses with only a comma:
> ❌ *The galaxy is expanding, scientists detected new radiation.*
> ✔️ *The galaxy is expanding; scientists detected new radiation.*`,
      },
      {
        title: '3. Step-by-Step SAT Exam Walkthrough',
        subtitle: 'Analyzing a Standard English Conventions question',
        badge: '🎯 SAT Example',
        content: `### Question:
> Marine biologist Sylvia Earle has spent thousands of hours underwater exploring ocean ecosystems ______ she has advocated tirelessly for the establishment of protected marine reserves.
>
> Which choice completes the text so that it conforms to the conventions of Standard English?
> - **A)** ecosystems, furthermore,
> - **B)** ecosystems; furthermore,
> - **C)** ecosystems,
> - **D)** ecosystems furthermore

### Structural Analysis:
- Clause 1: *"Marine biologist Sylvia Earle has spent thousands of hours..."* — **Independent Clause**.
- Clause 2: *"she has advocated tirelessly..."* — **Independent Clause**.
- Joining them with a comma alone (A, C) creates a comma splice because *furthermore* is a **Conjunctive Adverb**, not a FANBOYS conjunction!
- The only valid boundary punctuation is a semicolon followed by a comma after the adverb.

**Correct Answer**: **B**.`,
      },
      {
        title: '4. Conjunctive Adverbs & The Synonym Elimination Trick',
        subtitle: 'Why however, therefore, and moreover cannot join clauses alone',
        badge: '⚠️ Traps & Shortcuts',
        content: `### 🚨 Conjunctive Adverb Trap:
College Board tests these transition adverbs continuously:
*however, therefore, moreover, furthermore, consequently, nevertheless, nonetheless*.

They look like conjunctions, but grammatically they are **adverbs**!
They **CANNOT** join two complete sentences with a simple comma:
- ❌ *It was raining, however, we went hiking.* (Comma Splice!)
- ✔️ *It was raining; however, we went hiking.*
- ✔️ *It was raining. However, we went hiking.*

### 💡 Elimination Trick:
If one answer choice has a period and another choice in the exact same spot has a semicolon (with identical surrounding words), **eliminate both immediately!** They are grammatically identical, and there can only be one correct answer.`,
      },
      {
        title: '5. Homework Practice & Challenge Problems',
        subtitle: 'Test your boundary punctuation mastery',
        badge: '📝 Homework Practice',
        isHomework: true,
        content: `Identify the correct punctuation pattern in these 3 questions.`,
        homeworkTasks: [
          {
            id: 1,
            question: 'Identify the error: "The telescope captured distant galaxies, they formed shortly after the Big Bang."',
            hint: 'Count the independent clauses. How are they punctuated?',
            solution: 'This is a textbook comma splice: two independent clauses separated only by a comma. Fix with a semicolon (;) or comma + and.',
            correctAnswer: 'Comma splice',
          },
          {
            id: 2,
            question: 'Which punctuation mark can be placed between two independent clauses when the second directly elaborates on the first?',
            hint: 'Colons and single dashes introduce explanations.',
            solution: 'A colon (:) or single em-dash (—). The clause before the colon must be a complete independent clause.',
            correctAnswer: 'Colon (:)',
          },
          {
            id: 3,
            question: 'Can you use a semicolon before the coordinating conjunction "and" when joining two simple clauses without internal commas?',
            hint: 'Standard rule: comma + FANBOYS. Semicolons stand alone without coordinating conjunctions.',
            solution: 'No. Standard compound sentences use comma + and. A semicolon does not require a coordinating conjunction.',
            correctAnswer: 'No',
          },
        ],
      },
      {
        title: '6. Summary & Readiness Checkpoint',
        subtitle: 'Sentence boundary rules are locked in!',
        badge: '🏆 Summary & Quiz',
        content: `Great work! Sentence boundaries will now be a reliable source of points on your test.

### Checklist:
- [x] Reliably identify independent clauses.
- [x] Never allow a comma splice.
- [x] Semicolons before conjunctive adverbs (; however,).
- [x] Completed homework problems.

*Start the Mini-Quiz to earn your mastery badge!*`,
      },
    ],
    key_takeaways: [
      'Two independent clauses require a period, semicolon, or comma + FANBOYS',
      'A comma alone between two independent clauses is always an error (Comma Splice)',
      'Words like however, therefore, and furthermore require a semicolon before them (; however,)',
    ],
  },

  // =========================================================================
  // LESSON 5: Rhetorical Transitions & Logical Flow (R&W)
  // =========================================================================
  'rhetorical-transitions-logical-flow': {
    sections: [
      {
        title: '1. Logical Transitions on the Digital SAT',
        subtitle: 'The four semantic categories of transition words',
        badge: '📘 Overview',
        content: `Transitions questions test your ability to recognize the precise logical relationship between consecutive sentences.

Every transition belongs to one of 4 distinct categories:

1. **Contrast / Opposition**:
   *however, nevertheless, nonetheless, on the other hand, conversely, regardless*.
2. **Cause & Effect**:
   *therefore, consequently, thus, as a result, accordingly, hence*.
3. **Addition & Continuation**:
   *furthermore, moreover, in addition, additionally, also*.
4. **Exemplification / Restatement**:
   *for example, for instance, specifically, in other words, that is*.`,
      },
      {
        title: '2. The Blind Reading Strategy',
        subtitle: 'Predict the relationship before looking at the choices',
        badge: '📐 Theory & Rules',
        content: `### 3-Step Blind Reading Method:
1. **Step 1: Mentally cross out the underlined transition word.**
   Never read the choices first—they will all sound plausible!
2. **Step 2: Read Sentence 1 and Sentence 2 independently.**
   Summarize the core meaning of each sentence in 3-4 words.
3. **Step 3: Determine the logical connection:**
   - Does Sentence 2 contradict Sentence 1? $\\implies$ **Contrast**.
   - Is Sentence 2 the outcome of Sentence 1? $\\implies$ **Cause & Effect**.
   - Does Sentence 2 provide a specific illustration? $\\implies$ **Exemplification**.
   - Does Sentence 2 simply add another supporting fact? $\\implies$ **Addition**.
4. **Step 4: Match your predicted category to the answer choices.**`,
      },
      {
        title: '3. Step-by-Step SAT Exam Walkthrough',
        subtitle: 'Distinguishing between Cause & Effect and Addition',
        badge: '🎯 SAT Example',
        content: `### Question:
> In the late 19th century, urban expansion drastically reduced natural wetlands around Chicago. ______ local engineers developed an extensive stormwater canal network to prevent chronic municipal flooding.
>
> Which choice completes the text with the most logical transition?
> - **A)** In contrast,
> - **B)** Consequently,
> - **C)** Furthermore,
> - **D)** For instance,

### Logical Analysis:
- **Sentence 1**: Wetlands were depleted, creating flooding problems (Cause).
- **Sentence 2**: Engineers constructed canals to mitigate flooding (Direct Effect / Reaction).
- There is no opposition (eliminate A).
- This is not an unrelated additional point (eliminate C).
- It is a direct cause-and-effect consequence: *"As a result / Consequently"*.

**Correct Answer**: **B (Consequently)**.`,
      },
      {
        title: '4. The Synonym Elimination Rule',
        subtitle: 'When two choices mean the same thing, eliminate both',
        badge: '⚠️ Traps & Shortcuts',
        content: `### 🚨 Synonym Elimination Rule:
If two answer choices belong to the exact same category and serve the same grammatical role, **eliminate both immediately**!

*Example*:
- Choice A: *Furthermore* (Addition)
- Choice B: *Moreover* (Addition)
- Choice C: *Therefore* (Cause & Effect)
- Choice D: *Specifically* (Exemplification)

Because *furthermore* and *moreover* perform identical rhetorical functions, neither can be the single correct answer! The answer must be C or D.`,
      },
      {
        title: '5. Homework Practice & Challenge Problems',
        subtitle: 'Practice determining transition relationships',
        badge: '📝 Homework Practice',
        isHomework: true,
        content: `Classify the logical transitions for these sentences.`,
        homeworkTasks: [
          {
            id: 1,
            question: 'Sentence 1: "The rare mineral was believed to exist only in volcanic craters." Sentence 2: "Geologists recently discovered deposits deep within sedimentary limestone." Which category fits?',
            hint: 'Believed to exist only in volcanoes vs found in limestone. Is this continuity or contradiction?',
            solution: 'This is a direct contrast (Contrast). Transitions like however, nevertheless, or yet are appropriate.',
            correctAnswer: 'Contrast (However)',
          },
          {
            id: 2,
            question: 'If Choice A is "Consequently" and Choice B is "Therefore", what should you suspect?',
            hint: 'Both mean cause and effect. Can both be right?',
            solution: 'Both belong to the same category. If both mean the exact same thing, eliminate both and re-evaluate the actual relationship.',
            correctAnswer: 'Eliminate both synonyms',
          },
          {
            id: 3,
            question: 'Which transition indicates moving from a broad claim to a specific instance: "Moreover" or "Specifically"?',
            hint: 'Narrowing down from general to particular is exemplification.',
            solution: '"Specifically" (or For instance) illustrates a broader assertion with a specific case.',
            correctAnswer: 'Specifically',
          },
        ],
      },
      {
        title: '6. Summary & Readiness Checkpoint',
        subtitle: 'Transition mastery achieved!',
        badge: '🏆 Summary & Quiz',
        content: `Outstanding! You now possess the most reliable methodology for SAT transition questions.

### Checklist:
- [x] Use Blind Reading before looking at options.
- [x] Classify: Contrast, Cause, Addition, Exemplification.
- [x] Eliminate synonymous answer choices.
- [x] Ready for the Mini-Quiz.

*Start the Mini-Quiz below!*`,
      },
    ],
    key_takeaways: [
      'Always determine the logical relationship before viewing the choices',
      'Synonymous choices in the same category (furthermore and moreover) eliminate each other',
      'Rely on logical semantics rather than what "sounds good"',
    ],
  },

  // =========================================================================
  // LESSON 6: Cross-Text Connections & Paired Passages (R&W)
  // =========================================================================
  'cross-text-connections-paired-passages': {
    sections: [
      {
        title: '1. Paired Passages on the Digital SAT',
        subtitle: 'Structure of Text 1 and Text 2 relationship patterns',
        badge: '📘 Overview',
        content: `**Cross-Text Connections** questions present two short academic excerpts discussing the same scientific study, historical event, or literary debate.

### 3 Primary Author Relationship Types:
1. **Qualification / Nuance**:
   The author of Text 2 agrees with the broad premise of Text 1, but points out an unmeasured variable, methodological limitation, or restricted sample size.
2. **Direct Rebuttal / Disagreement**:
   The author of Text 2 presents new empirical evidence that challenges or disproves Text 1's hypothesis.
3. **Extension / Alternative Explanation**:
   The author of Text 2 accepts the observed data from Text 1, but proposes a different causal explanation.`,
      },
      {
        title: '2. Strategic Argument Mapping Method',
        subtitle: 'How to read paired passages without running out of time',
        badge: '📐 Theory & Rules',
        content: `### 2-Phase Reading Algorithm:
1. **Phase 1: Read Text 1**:
   - Identify the primary claim (**Claim**) of Text 1.
   - Summarize in your mind: *"Author 1 argues that X causes Y."*
2. **Phase 2: Read Text 2**:
   - Locate the exact point where Author 2 touches on Author 1's claim.
   - Ask: **"What would Author 2 say to Author 1?"**
   - *"Yes, but only under condition Z..."* (Qualification)
   - *"No, because recent data shows the opposite..."* (Rebuttal)

> **Golden Rule**: Most questions ask: *"Based on the texts, how would the author of Text 2 respond to the claim in Text 1?"* Always adopt the perspective of **Author 2**!`,
      },
      {
        title: '3. Step-by-Step SAT Exam Walkthrough',
        subtitle: 'Navigating a scientific debate passage',
        badge: '🎯 SAT Example',
        content: `### Question:
> **Text 1**: Paleontologists long assumed that *Spinosaurus* was a terrestrial hunter that occasionally waded in shallows, citing its dense bone structure as inconsistent with sustained underwater locomotion.
>
> **Text 2**: Recent biomechanical modeling of *Spinosaurus* tail vertebrae demonstrates an undulating, paddle-like structure capable of generating substantial aquatic thrust. Researchers conclude that bone density alone cannot disprove active swimming behavior.
>
> *Based on the texts, how would the author of Text 2 respond to the assumption described in Text 1?*

### Analysis:
- **Text 1 Claim**: Did not swim actively; relied solely on bone density evidence.
- **Text 2 Evidence**: Tail structure produced powerful swimming propulsion; bone density alone is inconclusive.
- **Author 2 Response**: Author 1's conclusion is premature because it relied solely on bone density while overlooking locomotive adaptations.

**Correct Answer**: Notes that relying exclusively on skeletal density overlooks essential propulsive adaptations.`,
      },
      {
        title: '4. Traps of Extreme Language & Distorted Claims',
        subtitle: 'Beware of always, completely, and overly assertive choices',
        badge: '⚠️ Traps & Shortcuts',
        content: `### 🚨 Beware of Extreme Vocabulary:
Academic writing tested on the SAT is almost always measured, cautious, and nuanced. Choices containing extreme assertions are almost always **WRONG**:
- ❌ *Text 2 author completely rejects all findings of Text 1.*
- ❌ *Text 1 author entirely misunderstood the concept.*
- ❌ *The phenomenon is always caused by X.*

Correct choices typically use moderate academic phrases:
- ✔️ *Suggests that the conclusion may be premature...*
- ✔️ *Notes an overlooked variable...*
- ✔️ *Qualifies the scope of the claim...*`,
      },
      {
        title: '5. Homework Practice & Challenge Problems',
        subtitle: 'Evaluate arguments across paired perspectives',
        badge: '📝 Homework Practice',
        isHomework: true,
        content: `Analyze the author relationships in these 3 questions.`,
        homeworkTasks: [
          {
            id: 1,
            question: 'If Text 1 argues that tax cuts always stimulate job growth, and Text 2 shows this only occurred in 2 out of 10 studied regions, how does Text 2 relate to Text 1?',
            hint: 'Does Text 2 reject everything, or does it restrict the applicability of the claim?',
            solution: 'Text 2 qualifies and limits the scope of Text 1 by showing the effect is not universal.',
            correctAnswer: 'Qualifies / Limits the scope',
          },
          {
            id: 2,
            question: 'Why are choices containing "completely disproves" or "wholly dismisses" typically incorrect on the SAT?',
            hint: 'Consider academic norms of debate and evidence.',
            solution: 'Scholars rarely reject an entire body of research wholesale; they usually critique specific assumptions or data sets.',
            correctAnswer: 'Extreme language is rarely supported by academic texts',
          },
          {
            id: 3,
            question: 'When asked "How would the author of Text 1 respond to Text 2?", whose perspective must you adopt?',
            hint: 'Pay close attention to which author is named first in the question!',
            solution: 'The question asks for Author 1\'s perspective on Author 2. Do not reverse the authors!',
            correctAnswer: 'Author of Text 1',
          },
        ],
      },
      {
        title: '6. Summary & Readiness Checkpoint',
        subtitle: 'Cross-text connections mastered!',
        badge: '🏆 Summary & Quiz',
        content: `Congratulations! You have completed the comprehensive guide to Cross-Text Connections.

### Checklist:
- [x] Identify the core claim of Text 1 and Text 2.
- [x] Pinpoint the exact point of agreement or contention.
- [x] Avoid extreme answer choices (*completely, never*).
- [x] Completed homework practice.

*Click below to take the Mini-Quiz!*`,
      },
    ],
    key_takeaways: [
      'Identify Text 1 claim and how Text 2 positions itself relative to that claim',
      'Avoid extreme options containing absolute terms like completely or wholly',
      'Confirm which author perspective the prompt asks you to adopt',
    ],
  },
};

/**
 * Returns enriched 6-slide content for a given lesson slug, or synthesizes a 6-slide lesson
 * if the lesson only has basic 2-3 sections in the database.
 */
export function getEnrichedLessonContent(
  slug: string,
  rawContent: any,
  lessonTitle: string,
  subject: string
): EnrichedLessonContent {
  // 1. Direct match with our pre-built rich 6-slide database
  if (slug && ENRICHED_LESSONS[slug]) {
    return ENRICHED_LESSONS[slug];
  }

  // Also check if any key matches partially (e.g. slug contains keyword)
  for (const key of Object.keys(ENRICHED_LESSONS)) {
    if (slug && slug.includes(key)) {
      return ENRICHED_LESSONS[key];
    }
  }

  // 2. Dynamic 6-Slide Synthesis: If a lesson in database only has 2-3 sections,
  // we expand it into a full 6-slide master lesson with Homework and Mini-Quiz!
  const rawSections: Array<{ title: string; content: string }> = Array.isArray(rawContent?.sections)
    ? rawContent.sections
    : [];
  const rawTakeaways: string[] = Array.isArray(rawContent?.key_takeaways)
    ? rawContent.key_takeaways
    : [
        'Analyze each problem statement methodically on the Digital SAT',
        'Use strategic process of elimination to rule out distractor choices',
        'Reinforce tested concepts with regular spaced-repetition practice',
      ];

  const slides: LessonSectionSlide[] = [];

  // Slide 1: Introduction
  slides.push({
    title: rawSections[0]?.title || `1. Introduction: ${lessonTitle}`,
    subtitle: 'Core principles and fundamental concepts',
    badge: '📘 Overview',
    content:
      rawSections[0]?.content ||
      `In this lesson, we break down **${lessonTitle}**, a high-yield topic tested in Digital SAT ${
        subject === 'math' ? 'Math' : 'Reading & Writing'
      }. Mastering these principles will save you valuable time and ensure precision on exam day.`,
  });

  // Slide 2: Core Concepts & Formulas
  slides.push({
    title: rawSections[1]?.title || `2. Theoretical Framework & Rules`,
    subtitle: 'Official College Board standards and problem-solving algorithms',
    badge: '📐 Theory & Rules',
    content:
      rawSections[1]?.content ||
      `When approaching **${lessonTitle}**, focus on these core patterns:\n\n1. Analyze given constraints and identify key target variables.\n2. Apply established College Board formulas and algebraic shortcuts.\n3. Verify intermediate calculations for reasonableness.`,
  });

  // Slide 3: Worked Example
  slides.push({
    title: rawSections[2]?.title || `3. Step-by-Step SAT Exam Walkthrough`,
    subtitle: 'Real test question breakdown and strategic execution',
    badge: '🎯 SAT Example',
    content:
      rawSections[2]?.content ||
      `### Example SAT Question on ${lessonTitle}:
> Review the question prompt carefully and execute the multi-step strategy:

1. **Step 1**: Identify what the prompt is ultimately asking for (e.g., $x$ vs an algebraic expression).
2. **Step 2**: Transform the given data into standard mathematical or grammatical form.
3. **Step 3**: Check for speed shortcuts to complete the problem in under 45 seconds.`,
  });

  // Slide 4: Traps & Strategy
  slides.push({
    title: `4. College Board Traps & Time Management`,
    subtitle: 'How to avoid common distractors and pacing errors',
    badge: '⚠️ Traps & Shortcuts',
    content: `### 🚨 What to Watch Out for on Exam Day:
- **Premature Choice Trap**: Test writers frequently place intermediate calculation results as attractive distractor options.
- **Process of Elimination**: When uncertain between two choices, aggressively eliminate options that violate core mathematical or grammatical principles.
- **Pacing**: Spend no more than 60 seconds on initial problem setup. If not immediately solvable, flag and return during review.`,
  });

  // Slide 5: Homework & Practice Challenge
  slides.push({
    title: `5. Homework Practice & Challenge Problems`,
    subtitle: 'Solve these practice exercises before taking the Mini-Quiz',
    badge: '📝 Homework Practice',
    isHomework: true,
    content: `Complete these practical exercises on your scratch pad to solidify the lesson concepts. Reveal solutions once finished to verify your work.`,
    homeworkTasks: [
      {
        id: 1,
        question: `Practice Exercise 1 on "${lessonTitle}": Apply the primary rules covered in this lesson to find the correct answer.`,
        hint: 'Review the theoretical steps outlined in Slides 1 and 2.',
        solution: 'Step-by-step analysis shows that applying standard methodology eliminates distractor assumptions and leads directly to the solution.',
        correctAnswer: 'Verified',
      },
      {
        id: 2,
        question: `Practice Exercise 2: Check boundary conditions and verify that you have answered the exact question asked by the prompt.`,
        hint: 'Ensure your final value matches the requested variable or relationship.',
        solution: 'Direct substitution and algebraic verification confirm the result meets all required constraints.',
        correctAnswer: 'Verified',
      },
      {
        id: 3,
        question: `Practice Exercise 3: Challenge Problem testing edge cases and speed efficiency.`,
        hint: 'Look for shortcuts that bypass full manual expansion.',
        solution: 'Applying the pro shortcut reduces solving time to under 30 seconds with complete accuracy.',
        correctAnswer: 'Verified',
      },
    ],
  });

  // Slide 6: Summary & Quiz
  slides.push({
    title: `6. Lesson Summary & Mini-Quiz Readiness`,
    subtitle: 'Final review and skill mastery verification',
    badge: '🏆 Summary & Quiz',
    content: `You have completed the instruction for **${lessonTitle}**! Review the key takeaways below and proceed to the Mini-Quiz to record your mastery score on your personal Roadmap.`,
  });

  return {
    sections: slides,
    key_takeaways: rawTakeaways,
  };
}
