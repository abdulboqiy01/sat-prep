// 28 Lessons for Pre-SAT Pathway (14 Math + 14 Reading & Writing)
// Combined with 2 existing lessons = 30 Pre-SAT lessons total!

export const preSatLessons = [
  // --- MATH (14 lessons) ---
  {
    title: 'Solving Systems by Elimination and Addition Shortcuts',
    slug: 'systems-elimination-addition-shortcuts',
    subject: 'math',
    pathway: 'pre_sat',
    module_id: '20000000-0000-0000-0000-000000000002',
    skill_id: '11000000-0000-0000-0000-000000000002',
    difficulty: 'medium',
    estimated_duration_minutes: 20,
    order_index: 3,
    summary: 'Solve systems of equations rapidly and spot SAT shortcuts where solving for individual variables is unnecessary.',
    content: {
      sections: [
        {
          title: '1. The Direct Combination Shortcut',
          content: 'Whenever the SAT asks for an expression like $(x + y)$ or $(2x - y)$ rather than just $x$ or $y$, do NOT solve for each variable! Try adding or subtracting the two equations directly. Example: $3x + 2y = 14$ and $2x + 3y = 16$. Add them: $5x + 5y = 30 \\implies x + y = 6$. Solved in 5 seconds!'
        },
        {
          title: '2. Systematic Elimination Mechanics',
          content: 'Multiply one or both equations by constants so that the coefficients of one variable become opposite in sign (e.g., $+6y$ and $-6y$). Then add equations vertically to eliminate that variable.'
        },
        {
          title: '3. Digital SAT Desmos Method',
          content: 'Type both equations into Desmos exactly as written (even in standard form $Ax + By = C$). Desmos draws both lines immediately. Click the gray dot at the intersection to see $(x, y)$.'
        }
      ],
      key_takeaways: [
        'Check if adding or subtracting both equations directly produces the requested target',
        'In Desmos, click the intersection point to view coordinates immediately',
        'Parallel lines with different intercepts = no solution; identical lines = infinitely many'
      ]
    }
  },
  {
    title: 'No Solution vs Infinitely Many Solutions in Systems',
    slug: 'no-solution-infinitely-many-systems',
    subject: 'math',
    pathway: 'pre_sat',
    module_id: '20000000-0000-0000-0000-000000000002',
    skill_id: '11000000-0000-0000-0000-000000000002',
    difficulty: 'medium',
    estimated_duration_minutes: 20,
    order_index: 4,
    summary: 'Master finding unknown constants k for no solution and infinite solutions in linear systems.',
    content: {
      sections: [
        {
          title: '1. The Ratio Rule for Standard Form',
          content: 'Given the system: $A_1 x + B_1 y = C_1$ and $A_2 x + B_2 y = C_2$. 1) NO SOLUTION (parallel): $\\frac{A_1}{A_2} = \\frac{B_1}{B_2} \\ne \\frac{C_1}{C_2}$. 2) INFINITELY MANY (same line): $\\frac{A_1}{A_2} = \\frac{B_1}{B_2} = \\frac{C_1}{C_2}$. 3) ONE SOLUTION: $\\frac{A_1}{A_2} \\ne \\frac{B_1}{B_2}$.'
        },
        {
          title: '2. Solving for Constant k in "No Solution"',
          content: 'Example: $4x - 6y = 10$ and $kx - 9y = 12$ has no solution. Set the slopes equal: $\\frac{4}{k} = \\frac{-6}{-9} = \\frac{2}{3} \\implies 2k = 12 \\implies k = 6$. Done!'
        },
        {
          title: '3. Quick Visual Verification',
          content: 'No solution means parallel lines (same slope, different y-intercept). Infinitely many solutions means the second equation is just a multiple of the first.'
        }
      ],
      key_takeaways: [
        'For no solution: x and y ratios are equal, but constant ratio differs',
        'For infinitely many: all three ratios are equal',
        'Cross-multiply coefficients to solve for unknown constant k'
      ]
    }
  },
  {
    title: 'Quadratic Factoring and Zero Product Property',
    slug: 'quadratic-factoring-zero-product-property',
    subject: 'math',
    pathway: 'pre_sat',
    module_id: '20000000-0000-0000-0000-000000000002',
    skill_id: '11000000-0000-0000-0000-000000000003',
    difficulty: 'medium',
    estimated_duration_minutes: 20,
    order_index: 5,
    summary: 'Factor trinomials, recognize special products, and apply the zero product property.',
    content: {
      sections: [
        {
          title: '1. Factoring x^2 + bx + c',
          content: 'Find two numbers $p$ and $q$ that multiply to $c$ and add to $b$: $x^2 + bx + c = (x + p)(x + q) = 0$. By the zero product property, solutions are $x = -p$ and $x = -q$.'
        },
        {
          title: '2. Special Products Must Be Recognized on Sight',
          content: 'Difference of Squares: $a^2 - b^2 = (a - b)(a + b)$. Perfect Square Trinomials: $(a + b)^2 = a^2 + 2ab + b^2$ and $(a - b)^2 = a^2 - 2ab + b^2$. Spotting these saves 1 minute per problem.'
        },
        {
          title: '3. Difference of Squares Trap: 4x^2 - 49',
          content: '$4x^2 - 49 = (2x - 7)(2x + 7) = 0 \\implies x = 7/2$ or $x = -7/2$. Always check for coefficient before $x^2$.'
        }
      ],
      key_takeaways: [
        'Multiply to c and add to b',
        'Difference of squares: a^2 - b^2 = (a-b)(a+b)',
        'In Desmos: type the quadratic equation to see the x-intercepts immediately'
      ]
    }
  },
  {
    title: 'The Quadratic Formula and Discriminant Analysis',
    slug: 'quadratic-formula-discriminant-analysis',
    subject: 'math',
    pathway: 'pre_sat',
    module_id: '20000000-0000-0000-0000-000000000002',
    skill_id: '11000000-0000-0000-0000-000000000003',
    difficulty: 'medium',
    estimated_duration_minutes: 20,
    order_index: 6,
    summary: 'Master the discriminant b^2 - 4ac to count solutions without graphing or solving.',
    content: {
      sections: [
        {
          title: '1. The Quadratic Formula',
          content: 'For $ax^2 + bx + c = 0$, $x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$. Use this whenever quadratic terms cannot be easily factored with whole numbers.'
        },
        {
          title: '2. The Discriminant: b^2 - 4ac',
          content: '1) If $b^2 - 4ac > 0$: Two distinct real solutions (parabola crosses x-axis twice). 2) If $b^2 - 4ac = 0$: Exactly ONE real solution (parabola touches x-axis at vertex). 3) If $b^2 - 4ac < 0$: Zero real solutions (parabola does not touch x-axis).'
        },
        {
          title: '3. Solving for Constants with "Exactly One Solution"',
          content: 'When the SAT states that $2x^2 - 8x + c = 0$ has exactly one real solution: set $b^2 - 4ac = 0 \\implies (-8)^2 - 4(2)(c) = 0 \\implies 64 - 8c = 0 \\implies c = 8$.'
        }
      ],
      key_takeaways: [
        'Discriminant D = b^2 - 4ac determines the number of real roots',
        'D > 0: 2 solutions; D = 0: 1 solution; D < 0: 0 real solutions',
        'If a line intersects a parabola at 1 point, set them equal and use b^2 - 4ac = 0'
      ]
    }
  },
  {
    title: 'Exponential Growth and Decay Models',
    slug: 'exponential-growth-decay-models',
    subject: 'math',
    pathway: 'pre_sat',
    module_id: '20000000-0000-0000-0000-000000000002',
    skill_id: '11000000-0000-0000-0000-000000000004',
    difficulty: 'medium',
    estimated_duration_minutes: 20,
    order_index: 7,
    summary: 'Construct and interpret y = a * b^x models, annual percentage yields, and half-life decay.',
    content: {
      sections: [
        {
          title: '1. The General Exponential Formula: y = a(b)^x',
          content: '$a$ is the initial starting value at $x = 0$. $b$ is the growth or decay factor per unit of $x$. If $b > 1$, it is exponential growth: $b = 1 + r$. If $0 < b < 1$, it is exponential decay: $b = 1 - r$.'
        },
        {
          title: '2. Identifying the Rate of Growth r',
          content: 'In $P(t) = 500(1.08)^t$, $a = 500$ is initial population, and $1.08 = 1 + 0.08$ means an $8\\%$ growth rate per year. In $V(t) = 24000(0.85)^t$, $0.85 = 1 - 0.15$ means a $15\\%$ depreciation rate per year.'
        },
        {
          title: '3. Non-Annual Compounding Intervals',
          content: 'If an interest rate compounds every $k$ months or years, the exponent is modified: $y = a(b)^{t/k}$. For doubling time $d$: $y = a(2)^{t/d}$. For half-life $h$: $y = a(0.5)^{t/h}$.'
        }
      ],
      key_takeaways: [
        'y = a * b^x: a is initial value, b is the multiplier',
        'Growth rate r: b = 1 + r; Decay rate r: b = 1 - r',
        'Linear models add a constant amount; exponential models multiply by a constant factor'
      ]
    }
  },
  {
    title: 'Interpreting Data: Standard Deviation and Range',
    slug: 'interpreting-data-standard-deviation-range',
    subject: 'math',
    pathway: 'pre_sat',
    module_id: '20000000-0000-0000-0000-000000000002',
    skill_id: '11000000-0000-0000-0000-000000000006',
    difficulty: 'medium',
    estimated_duration_minutes: 20,
    order_index: 8,
    summary: 'Evaluate spread, compare standard deviations visually, and calculate interquartile ranges.',
    content: {
      sections: [
        {
          title: '1. Standard Deviation: Measure of Spread',
          content: 'You NEVER need to calculate standard deviation by hand on the SAT! You only need to know what it means: standard deviation measures how spread out data points are from the mean. More spread out = larger standard deviation. Clustered near mean = smaller standard deviation.'
        },
        {
          title: '2. Range and Interquartile Range (IQR)',
          content: '$\\text{Range} = \\text{Maximum} - \\text{Minimum}$. $\\text{IQR} = Q_3 - Q_1$ (the spread of the middle $50\\%$ of data). Both measure variability.'
        },
        {
          title: '3. Adding vs Multiplying Data Constants',
          content: 'If you ADD a constant $c$ to every value in a dataset: Mean and median increase by $c$, but standard deviation and range DO NOT CHANGE! If you MULTIPLY every value by $k$: Mean, median, standard deviation, and range ALL multiply by $k$.'
        }
      ],
      key_takeaways: [
        'Do not compute standard deviation by hand; judge spread visually',
        'Adding a constant shifts the center but does not change standard deviation',
        'Multiplying all data multiplies the standard deviation by that factor'
      ]
    }
  },
  {
    title: 'Circle Equations: Center-Radius Form and Completing the Square',
    slug: 'circle-equations-center-radius-completing-square',
    subject: 'math',
    pathway: 'pre_sat',
    module_id: '20000000-0000-0000-0000-000000000002',
    skill_id: '11000000-0000-0000-0000-000000000007',
    difficulty: 'medium',
    estimated_duration_minutes: 20,
    order_index: 9,
    summary: 'Transform general quadratic circle equations into (x - h)^2 + (y - k)^2 = r^2.',
    content: {
      sections: [
        {
          title: '1. Standard Circle Equation',
          content: '$(x - h)^2 + (y - k)^2 = r^2$. Center is $(h, k)$ — notice the signs flip! Radius is $r = \\sqrt{r^2}$. Example: $(x + 3)^2 + (y - 5)^2 = 49 \\implies$ Center $(-3, 5)$, Radius $7$.'
        },
        {
          title: '2. Completing the Square for Circles',
          content: 'When given $x^2 + y^2 - 6x + 8y = 11$: Group terms: $(x^2 - 6x + \\underline{\\quad}) + (y^2 + 8y + \\underline{\\quad}) = 11$. Take half the middle coefficient and square it: $(-6/2)^2 = 9$; $(8/2)^2 = 16$. Add both to right side: $(x - 3)^2 + (y + 4)^2 = 11 + 9 + 16 = 36$. Center $(3, -4)$, Radius $r = 6$.'
        },
        {
          title: '3. Digital SAT Desmos Life-Saver',
          content: 'Type the general equation $x^2 + y^2 - 6x + 8y = 11$ directly into Desmos. It graphs the circle immediately! Click the leftmost and rightmost points to measure diameter.'
        }
      ],
      key_takeaways: [
        'Center is (h, k) with signs inverted; radius is sqrt of right side',
        'Add (b/2)^2 to both sides when completing the square',
        'Desmos plots circle equations in any format without conversion'
      ]
    }
  },
  {
    title: 'Radians, Arc Length, and Sector Area',
    slug: 'radians-arc-length-sector-area',
    subject: 'math',
    pathway: 'pre_sat',
    module_id: '20000000-0000-0000-0000-000000000002',
    skill_id: '11000000-0000-0000-0000-000000000007',
    difficulty: 'medium',
    estimated_duration_minutes: 20,
    order_index: 10,
    summary: 'Master radian-degree conversions and calculate fractional arc lengths and sector areas.',
    content: {
      sections: [
        {
          title: '1. Radians to Degrees and Back',
          content: '$\\pi \\text{ radians} = 180^\\circ$. To convert degrees to radians: multiply by $\\frac{\\pi}{180^\\circ}$. To convert radians to degrees: replace $\\pi$ with $180^\\circ$. Example: $\\frac{5\\pi}{6} = \\frac{5(180^\\circ)}{6} = 150^\\circ$.'
        },
        {
          title: '2. The Arc Length Formula',
          content: 'When central angle $\\theta$ is in radians: $s = r\\theta$. When $\\theta$ is in degrees: $s = \\frac{\\theta}{360^\\circ} \\cdot 2\\pi r$.'
        },
        {
          title: '3. Sector Area Formula',
          content: 'When $\\theta$ is in radians: $A = \\frac{1}{2}r^2 \\theta$. When $\\theta$ is in degrees: $A = \\frac{\\theta}{360^\\circ} \\cdot \\pi r^2$. Notice it is simply the fraction of the full circle multiplied by total area.'
        }
      ],
      key_takeaways: [
        'pi radians = 180 degrees',
        'Arc length s = r * theta (when theta is in radians)',
        'Sector area is (theta / 360) * (pi * r^2)'
      ]
    }
  },
  {
    title: 'Similar Triangles and Side-Length Proportions',
    slug: 'similar-triangles-side-length-proportions',
    subject: 'math',
    pathway: 'pre_sat',
    module_id: '20000000-0000-0000-0000-000000000002',
    skill_id: '11000000-0000-0000-0000-000000000008',
    difficulty: 'medium',
    estimated_duration_minutes: 20,
    order_index: 11,
    summary: 'Identify AA similarity, set up consistent ratios, and handle nested triangle diagrams.',
    content: {
      sections: [
        {
          title: '1. Angle-Angle (AA) Similarity Criterion',
          content: 'Two triangles are similar if they share two equal angles. In similar triangles: 1) Corresponding angles are EQUAL. 2) Corresponding sides are PROPORTIONAL: $\\frac{a_1}{a_2} = \\frac{b_1}{b_2} = \\frac{c_1}{c_2} = k$.'
        },
        {
          title: '2. Nested Triangles Trap',
          content: 'A smaller triangle drawn inside a larger triangle sharing a top angle has parallel base lines. REDRAW THE TWO TRIANGLES SEPARATELY! The side of the big triangle is $(x + y)$, NOT just $y$.'
        },
        {
          title: '3. Ratio of Areas vs Ratio of Sides',
          content: 'If the scale factor between side lengths is $k$, the ratio of their areas is $k^2$. If triangle sides are in ratio $1:3$, their areas are in ratio $1:9$.'
        }
      ],
      key_takeaways: [
        'Redraw nested triangles separately to avoid partial-side mistakes',
        'Corresponding side lengths share the same scale factor',
        'Area ratio is always side ratio squared (k^2)'
      ]
    }
  },
  {
    title: 'Right Triangle Trigonometry: SOH CAH TOA and Complementary Angles',
    slug: 'right-triangle-trigonometry-soh-cah-toa',
    subject: 'math',
    pathway: 'pre_sat',
    module_id: '20000000-0000-0000-0000-000000000002',
    skill_id: '11000000-0000-0000-0000-000000000008',
    difficulty: 'medium',
    estimated_duration_minutes: 20,
    order_index: 12,
    summary: 'Apply sine, cosine, and tangent definitions and master the cofunction identity sin(x) = cos(90 - x).',
    content: {
      sections: [
        {
          title: '1. SOH CAH TOA Definitions',
          content: '$\\sin(\\theta) = \\frac{\\text{Opposite}}{\\text{Hypotenuse}}$, $\\cos(\\theta) = \\frac{\\text{Adjacent}}{\\text{Hypotenuse}}$, $\\tan(\\theta) = \\frac{\\text{Opposite}}{\\text{Adjacent}}$. Remember: $\\tan(\\theta) = \\frac{\\sin(\\theta)}{\\cos(\\theta)}$.'
        },
        {
          title: '2. The Most Tested Identity on the SAT: Complementary Angle Rule',
          content: 'In any right triangle, the two acute angles sum to $90^\\circ$ ($x + y = 90^\\circ$). Therefore: $\\sin(x) = \\cos(90^\\circ - x)$ and $\\cos(x) = \\sin(90^\\circ - x)$. If $\\sin(x) = \\cos(y)$, then $x + y = 90^\\circ$ (or $\\pi/2$).'
        },
        {
          title: '3. Pythagorean Triples to Memorize',
          content: 'Frequent triples: $3-4-5$ (and $6-8-10$), $5-12-13$, $7-24-25$, $8-15-17$. Recognizing these allows instant calculation of hypotenuse without computing square roots.'
        }
      ],
      key_takeaways: [
        'sin(x) = cos(90 - x); whenever sin(A) = cos(B), A + B = 90 degrees',
        'tan = opposite / adjacent = sin / cos',
        'Recognize 3-4-5 and 5-12-13 right triangles on sight'
      ]
    }
  },
  {
    title: 'Probability of Independent and Mutually Exclusive Events',
    slug: 'probability-independent-mutually-exclusive',
    subject: 'math',
    pathway: 'pre_sat',
    module_id: '20000000-0000-0000-0000-000000000002',
    skill_id: '11000000-0000-0000-0000-000000000006',
    difficulty: 'medium',
    estimated_duration_minutes: 20,
    order_index: 13,
    summary: 'Multiply independent probabilities, add mutually exclusive outcomes, and use the 1 - P(none) rule.',
    content: {
      sections: [
        {
          title: '1. "AND" Rule vs "OR" Rule',
          content: 'AND (Independent events both occurring): Multiply: $P(A \\text{ and } B) = P(A) \\times P(B)$. OR (Mutually exclusive events): Add: $P(A \\text{ or } B) = P(A) + P(B) - P(A \\text{ and } B)$.'
        },
        {
          title: '2. The Complement Rule: 1 - P(None)',
          content: 'Whenever an SAT problem asks for "the probability of at least one", NEVER calculate all positive scenarios! Use the complement: $P(\\text{at least one}) = 1 - P(\\text{none})$.'
        },
        {
          title: '3. Sampling With vs Without Replacement',
          content: 'Without replacement: the denominator decreases by 1 for each subsequent draw! Drawing 2 red marbles from 5 red and 5 blue: $P = \\frac{5}{10} \\times \\frac{4}{9} = \\frac{2}{9}$.'
        }
      ],
      key_takeaways: [
        'AND = Multiply probabilities; OR = Add probabilities',
        'P(at least one) = 1 - P(none)',
        'Check whether items are replaced or drawn without replacement'
      ]
    }
  },
  {
    title: 'Function Notation, Composition, and Transformations',
    slug: 'function-notation-composition-transformations',
    subject: 'math',
    pathway: 'pre_sat',
    module_id: '20000000-0000-0000-0000-000000000002',
    skill_id: '11000000-0000-0000-0000-000000000004',
    difficulty: 'medium',
    estimated_duration_minutes: 20,
    order_index: 14,
    summary: 'Evaluate composite functions f(g(x)), interpret graphs, and predict horizontal/vertical shifts.',
    content: {
      sections: [
        {
          title: '1. Function Composition: Inside-Out Rule',
          content: 'For $f(g(x))$, evaluate the inside function $g(x)$ first, then plug that resulting value into $f$. If $g(3) = 7$, then $f(g(3)) = f(7)$.'
        },
        {
          title: '2. Function Transformations',
          content: '$f(x) + c$: Shifts up by $c$. $f(x) - c$: Shifts down by $c$. $f(x + c)$: Shifts LEFT by $c$ (counter-intuitive!). $f(x - c)$: Shifts RIGHT by $c$. $-f(x)$: Reflects over the x-axis.'
        },
        {
          title: '3. Desmos Shortcut for Functions',
          content: 'In Desmos, you can define $f(x) = 2x^2 - 3x + 1$ on line 1, and on line 2 simply type $f(5)$. Desmos will evaluate the number instantly without manual arithmetic mistakes.'
        }
      ],
      key_takeaways: [
        'Evaluate inside functions first: f(g(x))',
        'f(x + c) moves LEFT; f(x - c) moves RIGHT',
        'Define functions directly by name in Desmos to evaluate composite inputs'
      ]
    }
  },
  {
    title: 'Absolute Value Equations and Distance Graphs',
    slug: 'absolute-value-equations-graphs',
    subject: 'math',
    pathway: 'pre_sat',
    module_id: '20000000-0000-0000-0000-000000000002',
    skill_id: '11000000-0000-0000-0000-000000000002',
    difficulty: 'medium',
    estimated_duration_minutes: 20,
    order_index: 15,
    summary: 'Solve |ax + b| = c equations, isolate the absolute value bar, and identify extraneous solutions.',
    content: {
      sections: [
        {
          title: '1. The Two-Case Split',
          content: 'Step 1: Isolate the absolute value expression on one side: $|ax + b| = c$. Step 2: Split into two separate linear equations: $ax + b = c$ OR $ax + b = -c$. Step 3: Solve each case independently.'
        },
        {
          title: '2. Negative Distance Trap',
          content: 'If an isolated absolute value equals a negative number, e.g., $|2x - 5| = -3$, there are ZERO SOLUTIONS immediately! Absolute value represents distance and can never be negative.'
        },
        {
          title: '3. Vertex of Absolute Value Graph',
          content: 'The graph of $y = a|x - h| + k$ is a V-shape. The vertex (turning point) is $(h, k)$.'
        }
      ],
      key_takeaways: [
        'Always isolate the absolute value bar before splitting into +/- cases',
        '|expression| = negative has no real solution',
        'Graph of |x - h| + k has its minimum/maximum at vertex (h, k)'
      ]
    }
  },
  {
    title: 'Polynomial Division and Remainder Theorem',
    slug: 'polynomial-division-remainder-theorem',
    subject: 'math',
    pathway: 'pre_sat',
    module_id: '20000000-0000-0000-0000-000000000002',
    skill_id: '11000000-0000-0000-0000-000000000004',
    difficulty: 'medium',
    estimated_duration_minutes: 20,
    order_index: 16,
    summary: 'Find polynomial quotients and use the remainder theorem f(c) = remainder for instant answers.',
    content: {
      sections: [
        {
          title: '1. The Remainder Theorem (SAT Miracle Shortcut)',
          content: 'When a polynomial $P(x)$ is divided by $(x - c)$, the remainder is simply $P(c)$! You do NOT need to do long polynomial division. Example: What is the remainder when $2x^3 - 5x + 7$ is divided by $(x - 2)$? Just evaluate at $x = 2$: $2(2)^3 - 5(2) + 7 = 16 - 10 + 7 = 13$.'
        },
        {
          title: '2. Factor Theorem',
          content: '$(x - c)$ is a factor of $P(x)$ if and only if $P(c) = 0$ (meaning remainder is 0 and $c$ is an x-intercept).'
        },
        {
          title: '3. Rational Fraction Form',
          content: '$\\frac{P(x)}{x - c} = Q(x) + \\frac{R}{x - c}$, where $Q(x)$ is the quotient polynomial and $R$ is the constant remainder.'
        }
      ],
      key_takeaways: [
        'Remainder when dividing by (x - c) is simply P(c)',
        'If P(c) = 0, then (x - c) is an exact factor',
        'Plug in test numbers for x (like x = 0 or x = 10) to verify equivalent fractions'
      ]
    }
  },

  // --- READING & WRITING (14 lessons) ---
  {
    title: 'Logical Inferences: The Most Direct Step Forward',
    slug: 'logical-inferences-most-direct-step',
    subject: 'reading_writing',
    pathway: 'pre_sat',
    module_id: '20000000-0000-0000-0000-000000000005',
    skill_id: '11000000-0000-0000-0000-000000000010',
    difficulty: 'medium',
    estimated_duration_minutes: 20,
    order_index: 17,
    summary: 'Solve "Which choice most logically completes the text?" by making the smallest unstated leap.',
    content: {
      sections: [
        {
          title: '1. The Minimal Leap Rule',
          content: 'The correct inference on the SAT is NEVER a bold prediction or grand philosophical leap. It is the most conservative, boring, logically airtight next sentence that MUST be true if the passage premises are true.'
        },
        {
          title: '2. Contrast and Pivot Transitions',
          content: 'Pay extreme attention to transition words in the final sentence right before the blank. If the final sentence begins with "However,", the blank must complete an objection to the preceding research finding.'
        },
        {
          title: '3. Beware of Extreme Language',
          content: 'Eliminate choices with words like "all", "impossible", "universally", "proves definitively", or "only". Correct inferences use moderate language: "may suggest", "is consistent with", "tends to indicate".'
        }
      ],
      key_takeaways: [
        'The right inference is conservative and introduces zero new assumptions',
        'Check the transition word right before the blank',
        'Moderate claims (suggests, indicates) are overwhelmingly more likely to be correct than absolute claims (proves, ensures)'
      ]
    }
  },
  {
    title: 'Scientific Hypotheses and Controlled Experiment Passages',
    slug: 'scientific-hypotheses-controlled-experiments',
    subject: 'reading_writing',
    pathway: 'pre_sat',
    module_id: '20000000-0000-0000-0000-000000000005',
    skill_id: '11000000-0000-0000-0000-000000000010',
    difficulty: 'medium',
    estimated_duration_minutes: 20,
    order_index: 18,
    summary: 'Dissect experimental controls, independent/dependent variables, and data interpretations.',
    content: {
      sections: [
        {
          title: '1. Isolating the Three Scientific Elements',
          content: 'As you read, identify: 1) The Researcher\'s Hypothesis (what they expected). 2) The Experimental vs Control Group (the baseline condition). 3) The Measured Result (did the data support or weaken the hypothesis?).'
        },
        {
          title: '2. "Which Finding, If True, Would WEAKEN the Hypothesis?"',
          content: 'To weaken a claim, you must find a result where the experimental variable was present, but the expected outcome DID NOT occur, or where an alternative variable explained the difference.'
        },
        {
          title: '3. "Which Finding Would SUPPORT the Hypothesis?"',
          content: 'The answer must demonstrate a statistically significant difference between the test group and control group that aligns with the researcher\'s predicted mechanism.'
        }
      ],
      key_takeaways: [
        'Identify what the scientists predicted vs what they measured',
        'A control group provides the baseline for comparison',
        'To weaken a claim, show the effect occurs even without the proposed cause'
      ]
    }
  },
  {
    title: 'Tone, Stance, and Author Perspective',
    slug: 'tone-stance-author-perspective',
    subject: 'reading_writing',
    pathway: 'pre_sat',
    module_id: '20000000-0000-0000-0000-000000000005',
    skill_id: '11000000-0000-0000-0000-000000000010',
    difficulty: 'medium',
    estimated_duration_minutes: 20,
    order_index: 19,
    summary: 'Detect nuanced attitudes, academic neutrality, and skeptical versus enthusiastic stances.',
    content: {
      sections: [
        {
          title: '1. Academic Neutrality is King',
          content: 'SAT informational passages almost never express extreme emotional rage, sarcastic mockery, or blind devotion. The tone is typically "objective", "measured", "cautious", or "scholarly".'
        },
        {
          title: '2. Adjective and Adverb Fingerprints',
          content: 'Look at word choices: If an author calls a theory "promising yet preliminary", the stance is cautiously optimistic. If they call an assumption "unwarranted", the stance is critical/skeptical.'
        },
        {
          title: '3. Distinguishing Author\'s Stance from Cited Scholars',
          content: 'Passages frequently quote other scientists whose opinions differ from the author\'s own conclusion. Make sure you answer for the author\'s perspective, not a researcher mentioned in passing.'
        }
      ],
      key_takeaways: [
        'Academic authors use measured, nuanced vocabulary',
        'Distinguish what the author argues from what historical figures/scholars argue',
        'Eliminate overly dramatic or extreme emotional tone words'
      ]
    }
  },
  {
    title: 'Words in Context: Secondary Meanings of Common Words',
    slug: 'words-in-context-secondary-meanings',
    subject: 'reading_writing',
    pathway: 'pre_sat',
    module_id: '20000000-0000-0000-0000-000000000005',
    skill_id: '11000000-0000-0000-0000-000000000011',
    difficulty: 'medium',
    estimated_duration_minutes: 20,
    order_index: 20,
    summary: 'Master words with obscure secondary definitions: reservations, champion, plastic, compromise.',
    content: {
      sections: [
        {
          title: '1. The Secondary Meaning Trap',
          content: 'The SAT loves common words used in scholarly or uncommon ways: "Champion" = to advocate or support. "Plastic" = malleable or flexible. "Reservations" = doubts or hesitations. "Compromise" = to endanger or undermine (e.g., compromised security). "Qualify" = to limit or make less absolute.'
        },
        {
          title: '2. The Primary Definition is Often the Distractor',
          content: 'If the primary definition of the word appears as choice A (e.g., "reservation = hotel booking"), BE HIGHLY SKEPTICAL! Check if the context calls for the secondary meaning.'
        },
        {
          title: '3. Substitution Verification',
          content: 'Plug the definition back into the full sentence. Does it fit the grammatical syntax and logical context seamlessly?'
        }
      ],
      key_takeaways: [
        'Watch for secondary academic definitions of everyday words',
        'The most common everyday meaning is often an intentional trap',
        'Always read the full sentence with the replacement word in place'
      ]
    }
  },
  {
    title: 'Cross-Text Comparison: Points of Agreement and Disagreement',
    slug: 'cross-text-comparison-agreement-disagreement',
    subject: 'reading_writing',
    pathway: 'pre_sat',
    module_id: '20000000-0000-0000-0000-000000000005',
    skill_id: '11000000-0000-0000-0000-000000000012',
    difficulty: 'medium',
    estimated_duration_minutes: 20,
    order_index: 21,
    summary: 'Map relationships between Text 1 and Text 2: direct rebuttals, nuance additions, and shared premises.',
    content: {
      sections: [
        {
          title: '1. Reading Two Short Passages Strategically',
          content: 'Read Text 1 first: Summarize its main claim in 3 words. Read Text 2: Ask yourself: Does Text 2 AGREE, DISAGREE, or MODIFY Text 1?'
        },
        {
          title: '2. The "Both Authors Agree That..." Question',
          content: 'To find common ground, look for background facts or assumptions both texts accept before their divergent arguments begin.'
        },
        {
          title: '3. Perspective Perspective Questions',
          content: '"Based on the texts, how would Author 2 respond to Author 1\'s claim about X?" Find Author 1\'s exact claim about X, then find Author 2\'s specific stance on X.'
        }
      ],
      key_takeaways: [
        'Summarize the core claim of Text 1 before reading Text 2',
        'Identify whether Text 2 is an attack, an expansion, or an alternative perspective',
        'Keep both authors viewpoints clearly separated'
      ]
    }
  },
  {
    title: 'Rhetorical Transitions: Placement in the Middle of Sentences',
    slug: 'rhetorical-transitions-middle-sentence-placement',
    subject: 'reading_writing',
    pathway: 'pre_sat',
    module_id: '20000000-0000-0000-0000-000000000005',
    skill_id: '11000000-0000-0000-0000-000000000013',
    difficulty: 'medium',
    estimated_duration_minutes: 20,
    order_index: 22,
    summary: 'Handle transitional adverbs placed between commas inside a sentence.',
    content: {
      sections: [
        {
          title: '1. Transitions as Parenthetical Interrupters',
          content: 'Transitional adverbs do not always start a sentence. They often sit between two commas: "The experiment, however, yielded unexpected results." The transition STILL connects the current sentence back to the PREVIOUS sentence!'
        },
        {
          title: '2. The Mental Move-to-Front Trick',
          content: 'To test which transition fits best, mentally move the word to the very beginning of the sentence: "However, the experiment yielded unexpected results." This makes the logical relationship instantly clear.'
        },
        {
          title: '3. Punctuation with Parenthetical Transitions',
          content: 'Clause; therefore, Clause. VS Clause, however, Verb (parenthetical). Notice the difference between joining two independent clauses with semicolon + transition vs interrupting a single clause with commas.'
        }
      ],
      key_takeaways: [
        'A transition inside commas still connects the sentence to the one before it',
        'Mentally shift the transition word to the start of the sentence to test logic',
        'Do not join two sentences with just commas around a transition (comma splice)'
      ]
    }
  },
  {
    title: 'Rhetorical Synthesis: Audience and Context Customization',
    slug: 'rhetorical-synthesis-audience-context',
    subject: 'reading_writing',
    pathway: 'pre_sat',
    module_id: '20000000-0000-0000-0000-000000000005',
    skill_id: '11000000-0000-0000-0000-000000000014',
    difficulty: 'medium',
    estimated_duration_minutes: 20,
    order_index: 23,
    summary: 'Select synthesis sentences customized for specific audiences (unfamiliar readers, experts, comparative essays).',
    content: {
      sections: [
        {
          title: '1. The "Unfamiliar Audience" Prompt',
          content: 'When the prompt states: "The student wants to introduce [Author/Subject] to an audience unfamiliar with their work", the correct answer MUST define what the subject is or what field they belong to. An answer that only lists awards without defining their occupation is WRONG.'
        },
        {
          title: '2. The "Emphasize Contrast" Prompt',
          content: 'The sentence must use a contrastive structure (while, whereas, unlike, but) and explicitly name both items being contrasted.'
        },
        {
          title: '3. Strict Elimination of Outside Information',
          content: 'Every single factual detail in the correct answer choice must be verifiable from the bulleted notes. The SAT never rewards information assumed from outside knowledge.'
        }
      ],
      key_takeaways: [
        'An unfamiliar audience needs foundational context and definitions',
        'Check that both subjects are mentioned in comparative goals',
        'Never pick a choice containing details absent from the provided notes'
      ]
    }
  },
  {
    title: 'Verb Tense Consistency and Aspect (Past Perfect vs Simple Past)',
    slug: 'verb-tense-consistency-past-perfect',
    subject: 'reading_writing',
    pathway: 'pre_sat',
    module_id: '20000000-0000-0000-0000-000000000005',
    skill_id: '11000000-0000-0000-0000-000000000016',
    difficulty: 'medium',
    estimated_duration_minutes: 20,
    order_index: 24,
    summary: 'Maintain temporal consistency and use "had + past participle" only when an earlier past action is indicated.',
    content: {
      sections: [
        {
          title: '1. The Default: Keep Tenses Consistent',
          content: 'Unless the text contains a clear time shift (e.g., "In 1890... but today..."), verbs in the surrounding sentences indicate the required tense. If surrounding sentences are in the simple present, keep the verb in simple present.'
        },
        {
          title: '2. Past Perfect: "Had + Verb"',
          content: 'Past perfect ("had finished") is ONLY correct when describing an action that happened BEFORE another action in the past: "Before she published her second novel in 1950, she had worked as a journalist." If there is no second past event, past perfect is WRONG.'
        },
        {
          title: '3. Present Perfect: "Has/Have + Verb"',
          content: 'Present perfect ("has researched") describes an action that began in the past and continues into the present, or whose effects remain relevant today.'
        }
      ],
      key_takeaways: [
        'Look at surrounding verbs to determine the passage timeline',
        'Past perfect (had done) requires two past events to establish chronological order',
        'Do not switch tenses without an explicit time transition indicator'
      ]
    }
  },
  {
    title: 'Who vs Whom and Relative Pronoun Rules',
    slug: 'who-vs-whom-relative-pronouns',
    subject: 'reading_writing',
    pathway: 'pre_sat',
    module_id: '20000000-0000-0000-0000-000000000005',
    skill_id: '11000000-0000-0000-0000-000000000016',
    difficulty: 'medium',
    estimated_duration_minutes: 20,
    order_index: 25,
    summary: 'Master who (subject) vs whom (object) and relative pronouns for people, things, and places.',
    content: {
      sections: [
        {
          title: '1. The He / Him Substitution Hack',
          content: 'Who = He (Subject: performs action). Whom = Him (Object: receives action). Ask yourself: would you say "he did it" or "him did it"? If HE -> WHO. If HIM -> WHOM. Example: "The scientist [who/whom] discovered the element." HE discovered it -> WHO!'
        },
        {
          title: '2. Preposition + Whom',
          content: 'After a preposition (to, for, with, by, from), always use WHOM: "To whom it may concern", "The colleagues with whom she collaborated".'
        },
        {
          title: '3. That vs Which vs Where',
          content: 'People = Who/Whom (NEVER "which" or "that" on the SAT). Things = Which/That. Places = Where (ONLY if a physical physical location where an action takes place; for an era, book, or study, use "in which").'
        }
      ],
      key_takeaways: [
        'Who = Subject (he); Whom = Object (him)',
        'Prepositions take whom: with whom, by whom',
        'Never use "where" to describe books, time periods, or studies — use "in which"'
      ]
    }
  },
  {
    title: 'Conciseness: Eliminating Redundancy and Wordiness',
    slug: 'conciseness-eliminating-redundancy',
    subject: 'reading_writing',
    pathway: 'pre_sat',
    module_id: '20000000-0000-0000-0000-000000000005',
    skill_id: '11000000-0000-0000-0000-000000000015',
    difficulty: 'medium',
    estimated_duration_minutes: 20,
    order_index: 26,
    summary: 'The shortest answer is almost always right: cut repetitive phrasing and filler words.',
    content: {
      sections: [
        {
          title: '1. The SAT Loves Brevity',
          content: 'If two or more choices are grammatically correct and convey the exact same meaning, THE SHORTEST CHOICE IS ALMOST ALWAYS CORRECT. The SAT penalizes unnecessary wordiness.'
        },
        {
          title: '2. Redundancy (Double Phrasing)',
          content: 'Look out for repeating ideas in different words: "annually every year" (redundant), "past history" (redundant), "reverted back" (redundant), "collaborated together" (redundant). Eliminate the repetition.'
        },
        {
          title: '3. Passive Voice Bloat',
          content: 'Replace passive wordy constructions like "was an illustration of" with direct active verbs: "illustrated".'
        }
      ],
      key_takeaways: [
        'When multiple choices are grammatical, pick the most concise choice',
        'Watch out for repeating synonyms (e.g., annual vs every year)',
        'Active verbs are preferred over wordy noun constructions'
      ]
    }
  },
  {
    title: 'Commas with Coordinate vs Cumulative Adjectives',
    slug: 'commas-coordinate-cumulative-adjectives',
    subject: 'reading_writing',
    pathway: 'pre_sat',
    module_id: '20000000-0000-0000-0000-000000000005',
    skill_id: '11000000-0000-0000-0000-000000000015',
    difficulty: 'medium',
    estimated_duration_minutes: 20,
    order_index: 27,
    summary: 'Use the "AND" and reversal test to know exactly when to put a comma between adjectives.',
    content: {
      sections: [
        {
          title: '1. Coordinate Adjectives (Comma Required)',
          content: 'Coordinate adjectives independently modify the noun with equal weight. Put a comma between them: "a bright, sunny day".'
        },
        {
          title: '2. The Two Tests for Coordinate Adjectives',
          content: '1) The "And" Test: Can you put "and" between the adjectives? ("a bright and sunny day" -> YES). 2) The Reverse Test: Can you reverse the order? ("a sunny, bright day" -> YES). If YES to both, USE A COMMA!'
        },
        {
          title: '3. Cumulative Adjectives (NO Comma)',
          content: 'Cumulative adjectives build on each other in a specific order: "three large green apples". You cannot say "green large three apples" or "three and large apples". NO COMMAS allowed!'
        }
      ],
      key_takeaways: [
        'Put a comma between adjectives only if "and" sounds natural between them',
        'If the order cannot be reversed without sounding weird, DO NOT use a comma',
        'Never put a comma between the final adjective and the noun'
      ]
    }
  },
  {
    title: 'Semicolons with Conjunctive Adverbs (However, Therefore)',
    slug: 'semicolons-conjunctive-adverbs',
    subject: 'reading_writing',
    pathway: 'pre_sat',
    module_id: '20000000-0000-0000-0000-000000000005',
    skill_id: '11000000-0000-0000-0000-000000000015',
    difficulty: 'medium',
    estimated_duration_minutes: 20,
    order_index: 28,
    summary: 'Master the standard punctuation formula: Independent Clause; transition, Independent Clause.',
    content: {
      sections: [
        {
          title: '1. The Golden Semicolon Formula',
          content: 'Independent Clause ; however , Independent Clause . When joining two complete sentences with a transitional adverb (however, therefore, consequently, moreover), you MUST use a semicolon before the transition and a comma after it.'
        },
        {
          title: '2. The Comma Splice Trap',
          content: 'Independent Clause , however , Independent Clause (FATAL COMMA SPLICE!). A comma alone cannot join two sentences even if followed by "however".'
        },
        {
          title: '3. Period as an Alternative',
          content: 'Independent Clause . However , Independent Clause . A period is 100% grammatically equivalent to a semicolon here.'
        }
      ],
      key_takeaways: [
        'Sentence; however, Sentence (semicolon before, comma after)',
        'Never use a comma before "however" when connecting two sentences',
        'A semicolon and a period are interchangeable on punctuation questions'
      ]
    }
  },
  {
    title: 'Poetry Analysis: Meter, Rhyme, and Figurative Imagery',
    slug: 'poetry-analysis-figurative-imagery',
    subject: 'reading_writing',
    pathway: 'pre_sat',
    module_id: '20000000-0000-0000-0000-000000000005',
    skill_id: '11000000-0000-0000-0000-000000000009',
    difficulty: 'medium',
    estimated_duration_minutes: 20,
    order_index: 29,
    summary: 'Decode figurative language, metaphors, and shifts in poetic speakers on Digital SAT poems.',
    content: {
      sections: [
        {
          title: '1. Unpacking Archaic Syntax',
          content: 'Digital SAT poems (Emily Dickinson, Shakespeare, Claude McKay) often invert subject and verb for rhyme: "Down fell the silver rain." Untangle inverted syntax: "The silver rain fell down."'
        },
        {
          title: '2. Focus on the Emotional Shift',
          content: 'Most poems on the SAT feature a turn (volta) where the speaker transitions from describing a bleak landscape to realizing an internal emotional truth. Look for words like "yet", "still", or "now".'
        },
        {
          title: '3. Metaphor Translation',
          content: 'Identify the vehicle (what is described) and the tenor (the real meaning). When a poet describes a caged bird singing, ask: what human condition of longing or restriction does this represent?'
        }
      ],
      key_takeaways: [
        'Untangle inverted poetic word order into normal Subject-Verb-Object',
        'Watch for emotional turning points marked by "yet", "but", or "still"',
        'Translate poetic metaphors into concrete human themes'
      ]
    }
  },
  {
    title: 'Evaluating Historical Arguments and Primary Sources',
    slug: 'evaluating-historical-arguments-primary-sources',
    subject: 'reading_writing',
    pathway: 'pre_sat',
    module_id: '20000000-0000-0000-0000-000000000005',
    skill_id: '11000000-0000-0000-0000-000000000010',
    difficulty: 'medium',
    estimated_duration_minutes: 20,
    order_index: 30,
    summary: 'Analyze 18th- and 19th-century speeches, philosophical tracts, and foundational political debates.',
    content: {
      sections: [
        {
          title: '1. Dealing with Dense 19th-Century Prose',
          content: 'Speeches by figures like Frederick Douglass, Elizabeth Cady Stanton, or Edmund Burke feature long sentences with multiple semicolons. Strategy: Read for the VERBS and NOUNS, ignoring rhetorical flourishes and elaborate metaphors.'
        },
        {
          title: '2. Identifying the Central Thesis of an Address',
          content: 'Ask: What specific injustice or policy is the speaker demanding be changed? The central claim is almost always a call to action or a moral defense of rights.'
        },
        {
          title: '3. Contextualizing Concessions',
          content: 'Skilled orators often concede a small point to their opponents before crushing their main argument: "Granted, the constitution does not explicitly state X; nevertheless, its underlying principles guarantee Y."'
        }
      ],
      key_takeaways: [
        'Cut through elaborate oratorical prose by isolating core nouns and verbs',
        'Identify what action the speaker is advocating for',
        'Recognize concessions: "Granted..." followed by the real argument: "Nevertheless..."'
      ]
    }
  }
];
