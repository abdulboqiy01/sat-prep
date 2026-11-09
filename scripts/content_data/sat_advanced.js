// 28 Lessons for SAT Advanced Pathway (14 Math + 14 Reading & Writing)
// Combined with 2 existing lessons = 30 SAT Advanced lessons total!

export const satAdvancedLessons = [
  // --- MATH (14 lessons) ---
  {
    title: 'Vieta\'s Formulas: Sum and Product of Quadratic Roots',
    slug: 'vietas-formulas-sum-product-roots',
    subject: 'math',
    pathway: 'sat_advanced',
    module_id: '20000000-0000-0000-0000-000000000003',
    skill_id: '11000000-0000-0000-0000-000000000003',
    difficulty: 'hard',
    estimated_duration_minutes: 25,
    order_index: 3,
    summary: 'Solve for the sum (-b/a) and product (c/a) of roots in seconds without finding the roots themselves.',
    content: {
      sections: [
        {
          title: '1. Vieta\'s Formulas Explained',
          content: 'For any quadratic equation $ax^2 + bx + c = 0$ with roots $r_1$ and $r_2$: 1) $\\text{Sum of roots} = r_1 + r_2 = -\\frac{b}{a}$. 2) $\\text{Product of roots} = r_1 \\cdot r_2 = \\frac{c}{a}$. You NEVER need to solve for individual roots when asked for their sum or product!'
        },
        {
          title: '2. Classic SAT Advanced Problem',
          content: 'Question: "What is the sum of the solutions to $3x^2 - 12x + 7 = 0$?" Novice approach: Use quadratic formula, calculate ugly radicals, then add them. SAT Master approach: $\\text{Sum} = -\\frac{-12}{3} = 4$. Solved in 2 seconds!'
        },
        {
          title: '3. Higher Degree Polynomials',
          content: 'For a cubic $ax^3 + bx^2 + cx + d = 0$, the sum of roots is STILL $-\\frac{b}{a}$, and the product of roots is $-\\frac{d}{a}$.'
        }
      ],
      key_takeaways: [
        'Sum of roots is always -b / a',
        'Product of roots is always c / a',
        'Never use the quadratic formula when asked only for the sum or product of solutions'
      ]
    }
  },
  {
    title: 'Completing the Square and Vertex Optimization Hacks',
    slug: 'completing-square-vertex-optimization',
    subject: 'math',
    pathway: 'sat_advanced',
    module_id: '20000000-0000-0000-0000-000000000003',
    skill_id: '11000000-0000-0000-0000-000000000003',
    difficulty: 'hard',
    estimated_duration_minutes: 25,
    order_index: 4,
    summary: 'Convert y = ax^2 + bx + c to y = a(x - h)^2 + k and find maximum/minimum in complex scenarios.',
    content: {
      sections: [
        {
          title: '1. The Fast Vertex Formulas',
          content: 'Vertex coordinates $(h, k)$ for $y = ax^2 + bx + c$: 1) $h = -\\frac{b}{2a}$. 2) $k = f(h) = c - \\frac{b^2}{4a}$. If $a > 0$, parabola opens up and $k$ is the absolute MINIMUM. If $a < 0$, parabola opens down and $k$ is the absolute MAXIMUM.'
        },
        {
          title: '2. Completing the Square with a Leading Coefficient',
          content: 'To convert $y = 2x^2 - 12x + 23$: 1) Factor out 2 from the x-terms: $y = 2(x^2 - 6x) + 23$. 2) Half of $-6$ is $-3$, squared is $+9$: add inside parenthesis: $y = 2(x^2 - 6x + 9) + 23 - 2(9)$. 3) Simplify: $y = 2(x - 3)^2 + 5$. Vertex is $(3, 5)$, minimum is $5$.'
        },
        {
          title: '3. Word Problems: Projectile & Profit Optimization',
          content: 'When asked: "At what time does the rocket reach peak altitude?" -> find $h$. When asked: "What IS the peak altitude?" -> find $k$.'
        }
      ],
      key_takeaways: [
        'x-coordinate of vertex is h = -b / (2a)',
        'y-coordinate of vertex is the actual maximum or minimum value',
        'Remember to subtract a * (b/2)^2 when completing the square outside parentheses'
      ]
    }
  },
  {
    title: 'Nonlinear Systems: Parabola-Line and Parabola-Circle Intersections',
    slug: 'nonlinear-systems-parabola-line-intersections',
    subject: 'math',
    pathway: 'sat_advanced',
    module_id: '20000000-0000-0000-0000-000000000003',
    skill_id: '11000000-0000-0000-0000-000000000003',
    difficulty: 'hard',
    estimated_duration_minutes: 25,
    order_index: 5,
    summary: 'Solve systems combining linear and quadratic equations and use discriminant for tangency.',
    content: {
      sections: [
        {
          title: '1. Substitution Mechanics',
          content: 'Given $y = x^2 - 4x + 3$ and $y = 2x - 5$. Substitute $y$: $x^2 - 4x + 3 = 2x - 5 \\implies x^2 - 6x + 8 = 0 \\implies (x - 2)(x - 4) = 0$. Intersections occur at $x = 2$ and $x = 4$. Plug back into $y = 2x - 5$ to get points $(2, -1)$ and $(4, 3)$.'
        },
        {
          title: '2. Tangency Condition: Exactly One Intersection',
          content: 'When a line is tangent to a parabola, they intersect at EXACTLY ONE point. Set equations equal, move all terms to one side ($Ax^2 + Bx + C = 0$), and force the discriminant to zero: $B^2 - 4AC = 0$. Solve for the missing slope or intercept!'
        },
        {
          title: '3. Desmos Power Technique',
          content: 'Type both equations into Desmos. Desmos instantly highlights gray dots at every intersection point. Click the dots to read coordinates directly.'
        }
      ],
      key_takeaways: [
        'Substitute linear y into quadratic equation',
        'Tangency (1 intersection) means discriminant B^2 - 4AC = 0',
        'Verify with Desmos visually in under 10 seconds'
      ]
    }
  },
  {
    title: 'Advanced Polynomial Theorems: Synthetic Division & Multiplicity',
    slug: 'advanced-polynomial-theorems-multiplicity',
    subject: 'math',
    pathway: 'sat_advanced',
    module_id: '20000000-0000-0000-0000-000000000003',
    skill_id: '11000000-0000-0000-0000-000000000004',
    difficulty: 'hard',
    estimated_duration_minutes: 25,
    order_index: 6,
    summary: 'Analyze polynomial behavior at roots: odd multiplicity (crosses x-axis) vs even multiplicity (bounces).',
    content: {
      sections: [
        {
          title: '1. Root Multiplicity and Graph Behavior',
          content: 'For $P(x) = a(x - r_1)^{m_1}(x - r_2)^{m_2}$: 1) If multiplicity $m$ is ODD (e.g., $(x - 3)^1$ or $(x - 3)^3$), the graph CROSSES the x-axis at $r$. 2) If multiplicity $m$ is EVEN (e.g., $(x - 5)^2$), the graph TOUCHES (bounces off) the x-axis at $r$ without crossing.'
        },
        {
          title: '2. End Behavior Determined by Leading Term',
          content: 'For $y = a_n x^n$: Even degree + positive $a$: both ends point UP ($+\\infty, +\\infty$). Even degree + negative $a$: both ends point DOWN ($-\\infty, -\\infty$). Odd degree + positive $a$: down on left, up on right. Odd degree + negative $a$: up on left, down on right.'
        },
        {
          title: '3. Reconstructing Polynomial Equations from Graphs',
          content: 'Identify all x-intercepts and their multiplicity. Write $y = a(x - r_1)(x - r_2)^2...$ then plug in the y-intercept $(0, y_0)$ to solve for the scaling constant $a$.'
        }
      ],
      key_takeaways: [
        'Even multiplicity = graph bounces off x-axis',
        'Odd multiplicity = graph cuts through x-axis',
        'Plug in the y-intercept (0, c) to find the vertical stretch factor a'
      ]
    }
  },
  {
    title: 'Rational Expressions: Asymptotes, Domain Restrictions, and Holes',
    slug: 'rational-expressions-asymptotes-holes',
    subject: 'math',
    pathway: 'sat_advanced',
    module_id: '20000000-0000-0000-0000-000000000003',
    skill_id: '11000000-0000-0000-0000-000000000004',
    difficulty: 'hard',
    estimated_duration_minutes: 25,
    order_index: 7,
    summary: 'Find vertical and horizontal asymptotes, removable discontinuities (holes), and simplify complex fractions.',
    content: {
      sections: [
        {
          title: '1. Vertical Asymptotes vs Removable Holes',
          content: 'Given $f(x) = \\frac{P(x)}{Q(x)}$: Factor numerator and denominator completely. If a factor $(x - c)$ cancels out from top and bottom, there is a HOLE at $x = c$. If a factor remains in the denominator, there is a VERTICAL ASYMPTOTE at $x = c$.'
        },
        {
          title: '2. Horizontal Asymptote Rules',
          content: 'Compare degrees of numerator ($n$) and denominator ($d$): 1) If $n < d$: Horizontal asymptote is $y = 0$. 2) If $n = d$: Horizontal asymptote is $y = \\frac{a}{b}$ (ratio of leading coefficients). 3) If $n > d$: No horizontal asymptote (slant/oblique).'
        },
        {
          title: '3. Simplifying Complex Fractions',
          content: 'To simplify $\\frac{\\frac{1}{x} + \\frac{1}{y}}{\\frac{1}{xy}}$, multiply every term in both numerator and denominator by the common denominator $xy$: $\\frac{y + x}{1} = x + y$.'
        }
      ],
      key_takeaways: [
        'Cancelling factors create holes; non-cancelling denominator roots create vertical asymptotes',
        'Equal degree numerator/denominator -> asymptote is ratio of leading coefficients',
        'Multiply entire complex fraction by common denominator to clear mini-fractions'
      ]
    }
  },
  {
    title: 'Circle Theorems: Inscribed Angles, Secants, and Tangent Lines',
    slug: 'circle-theorems-inscribed-angles-tangents',
    subject: 'math',
    pathway: 'sat_advanced',
    module_id: '20000000-0000-0000-0000-000000000003',
    skill_id: '11000000-0000-0000-0000-000000000007',
    difficulty: 'hard',
    estimated_duration_minutes: 25,
    order_index: 8,
    summary: 'Apply inscribed angle theorems, tangent perpendicularity, and intersecting chord rules.',
    content: {
      sections: [
        {
          title: '1. Central vs Inscribed Angle Theorem',
          content: 'An inscribed angle (vertex on the circle) is ALWAYS HALF the measure of the central angle subtending the exact same arc: $\\angle_{\\text{inscribed}} = \\frac{1}{2} \\angle_{\\text{central}}$. All inscribed angles intercepting the same arc are equal.'
        },
        {
          title: '2. Thales\'s Theorem: Inscribed in a Semicircle',
          content: 'Any angle inscribed in a semicircle (subtended by a diameter) is GUARANTEED to be a right angle: $90^\\circ$. Whenever a triangle is drawn inside a circle with one side as diameter, it is a right triangle!'
        },
        {
          title: '3. Tangent Line Perpendicularity',
          content: 'A line tangent to a circle is perpendicular ($90^\\circ$) to the radius at the point of contact. This immediately forms right triangles with the circle center, enabling Pythagorean theorem.'
        }
      ],
      key_takeaways: [
        'Inscribed angle = 1/2 of central angle on the same arc',
        'An angle subtended by a diameter is always 90 degrees',
        'Radius to tangent line creates a 90-degree right angle'
      ]
    }
  },
  {
    title: 'The Unit Circle, Special Right Triangles, and Radians',
    slug: 'unit-circle-special-triangles-radians',
    subject: 'math',
    pathway: 'sat_advanced',
    module_id: '20000000-0000-0000-0000-000000000003',
    skill_id: '11000000-0000-0000-0000-000000000008',
    difficulty: 'hard',
    estimated_duration_minutes: 25,
    order_index: 9,
    summary: 'Master 30-60-90, 45-45-90 triangles, unit circle coordinates (cos theta, sin theta), and reference angles.',
    content: {
      sections: [
        {
          title: '1. Special Right Triangle Ratios',
          content: '1) $45^\\circ-45^\\circ-90^\\circ$: Side ratio is $x : x : x\\sqrt{2}$. 2) $30^\\circ-60^\\circ-90^\\circ$: Side ratio is $x : x\\sqrt{3} : 2x$. The short leg opposite $30^\\circ$ is $x$, long leg opposite $60^\\circ$ is $x\\sqrt{3}$, and hypotenuse opposite $90^\\circ$ is $2x$.'
        },
        {
          title: '2. Unit Circle Coordinate Definitions',
          content: 'On the unit circle ($r = 1$): $x = \\cos(\\theta)$ and $y = \\sin(\\theta)$. Since $x^2 + y^2 = 1$, we get the Pythagorean trigonometric identity: $\\sin^2(\\theta) + \\cos^2(\\theta) = 1$.'
        },
        {
          title: '3. Trig Signs by Quadrant (ASTC Rule)',
          content: 'All Students Take Calculus: Quadrant I: All positive. Quadrant II: Sin positive. Quadrant III: Tan positive. Quadrant IV: Cos positive.'
        }
      ],
      key_takeaways: [
        '30-60-90 triangle sides: 1, sqrt(3), 2',
        'Unit circle point coordinates: (cos theta, sin theta)',
        'sin^2(theta) + cos^2(theta) = 1'
      ]
    }
  },
  {
    title: 'Trigonometric Identities and Modeling Periodic Functions',
    slug: 'trig-identities-modeling-periodic',
    subject: 'math',
    pathway: 'sat_advanced',
    module_id: '20000000-0000-0000-0000-000000000003',
    skill_id: '11000000-0000-0000-0000-000000000008',
    difficulty: 'hard',
    estimated_duration_minutes: 25,
    order_index: 10,
    summary: 'Graph y = A sin(Bx - C) + D, calculate amplitude, period, and vertical midline shifts.',
    content: {
      sections: [
        {
          title: '1. Anatomy of Sinusoidal Graphs',
          content: '$y = A \\sin(B(x - C)) + D$ or $y = A \\cos(B(x - C)) + D$. 1) Amplitude $|A| = \\frac{\\text{Max} - \\text{Min}}{2}$. 2) Midline $D = \\frac{\\text{Max} + \\text{Min}}{2}$. 3) Period $T = \\frac{2\\pi}{B} \\implies B = \\frac{2\\pi}{T}$.'
        },
        {
          title: '2. Ferris Wheel and Tide Modeling Problems',
          content: 'When modeling cyclical phenomena (height of a Ferris wheel carriage, ocean tides), the midline $D$ is the center axle height, and the amplitude $A$ is the wheel radius!'
        },
        {
          title: '3. Tangent Values and Asymptotes',
          content: '$\\tan(\\theta) = \\frac{\\sin(\\theta)}{\\cos(\\theta)}$. Tangent has vertical asymptotes wherever $\\cos(\\theta) = 0$, which occurs at $\\theta = \\frac{\\pi}{2}, \\frac{3\\pi}{2}, \\dots$'
        }
      ],
      key_takeaways: [
        'Amplitude = (Max - Min) / 2',
        'Midline = (Max + Min) / 2',
        'Period T = 2 * pi / B'
      ]
    }
  },
  {
    title: 'Complex Numbers: Arithmetic, Powers of i, and Conjugates',
    slug: 'complex-numbers-powers-of-i-conjugates',
    subject: 'math',
    pathway: 'sat_advanced',
    module_id: '20000000-0000-0000-0000-000000000003',
    skill_id: '11000000-0000-0000-0000-000000000004',
    difficulty: 'hard',
    estimated_duration_minutes: 25,
    order_index: 11,
    summary: 'Master the 4-step cycle of powers of i and divide complex numbers using the complex conjugate.',
    content: {
      sections: [
        {
          title: '1. The 4-Step Cycle of Powers of i',
          content: '$i = \\sqrt{-1}$. $i^2 = -1$. $i^3 = -i$. $i^4 = 1$. The powers repeat every 4! To evaluate $i^n$, divide $n$ by 4 and check the REMAINDER: Remainder 1 -> $i$. Remainder 2 -> $-1$. Remainder 3 -> $-i$. Remainder 0 -> $1$. Example: $i^{75} \\implies 75 / 4 = 18$ with remainder $3 \\implies i^{75} = -i$.'
        },
        {
          title: '2. Complex Number Division with Conjugates',
          content: 'To simplify $\\frac{a + bi}{c + di}$, multiply top and bottom by the complex conjugate $(c - di)$: $\\frac{3 + 2i}{1 - 4i} \\cdot \\frac{1 + 4i}{1 + 4i} = \\frac{3 + 12i + 2i + 8i^2}{1^2 - (4i)^2} = \\frac{3 + 14i - 8}{1 - (-16)} = \\frac{-5 + 14i}{17}$.'
        },
        {
          title: '3. Real and Imaginary Part Separation',
          content: 'Always format final results in standard form $a + bi$.'
        }
      ],
      key_takeaways: [
        'i^2 = -1 (replace i^2 with -1 immediately)',
        'Powers of i repeat in a 4-step cycle: divide exponent by 4 and look at remainder',
        'Multiply by complex conjugate (c - di) to eliminate i from denominator'
      ]
    }
  },
  {
    title: '3D Geometry: Cylinders, Cones, Spheres, and Scaling Volumes',
    slug: '3d-geometry-cylinders-cones-spheres-volume',
    subject: 'math',
    pathway: 'sat_advanced',
    module_id: '20000000-0000-0000-0000-000000000003',
    skill_id: '11000000-0000-0000-0000-000000000007',
    difficulty: 'hard',
    estimated_duration_minutes: 25,
    order_index: 12,
    summary: 'Solve composite 3D volume problems and master the cubic scaling rule k^3.',
    content: {
      sections: [
        {
          title: '1. Formulas from the Reference Sheet',
          content: 'Cylinder Volume: $V = \\pi r^2 h$. Cone Volume: $V = \\frac{1}{3}\\pi r^2 h$. Sphere Volume: $V = \\frac{4}{3}\\pi r^3$. Sphere Surface Area: $A = 4\\pi r^2$. Rectangular Prism: $V = lwh$.'
        },
        {
          title: '2. The 3D Scaling Factor: k^3 Rule',
          content: 'If all linear dimensions of a 3D solid are multiplied by scale factor $k$: Surface Area is multiplied by $k^2$. VOLUME IS MULTIPLIED BY $k^3$! Example: If the radius of a sphere is multiplied by 3, its volume increases by $3^3 = 27$ times!'
        },
        {
          title: '3. Volume Density Word Problems',
          content: '$\\text{Density} = \\frac{\\text{Mass}}{\\text{Volume}} \\implies \\text{Mass} = \\text{Density} \\times \\text{Volume}$. Watch out for mixed unit conversions (e.g., cubic centimeters vs cubic meters).'
        }
      ],
      key_takeaways: [
        'Linear dimension * k -> Area * k^2 -> Volume * k^3',
        'A cone is exactly 1/3 the volume of a cylinder with same base and height',
        'Mass = Density * Volume'
      ]
    }
  },
  {
    title: 'Statistical Inference: Confidence Intervals and Margin of Error',
    slug: 'statistical-inference-confidence-intervals',
    subject: 'math',
    pathway: 'sat_advanced',
    module_id: '20000000-0000-0000-0000-000000000003',
    skill_id: '11000000-0000-0000-0000-000000000006',
    difficulty: 'hard',
    estimated_duration_minutes: 25,
    order_index: 13,
    summary: 'Interpret margins of error, sample size effects, and valid generalizability of surveys.',
    content: {
      sections: [
        {
          title: '1. Margin of Error Relationship with Sample Size',
          content: 'Margin of error is inversely proportional to the square root of sample size: $\\text{MoE} \\propto \\frac{1}{\\sqrt{n}}$. To cut the margin of error in HALF, sample size must QUADRUPLE ($4\\times$). LARGER sample size = SMALLER margin of error (more precise estimate).'
        },
        {
          title: '2. Interpreting the Confidence Range',
          content: 'If a poll shows $54\\%$ support with a margin of error of $\\pm 3\\%$, the plausible range for the population is between $51\\%$ and $57\\%$. You CANNOT conclude that support is definitely $54\\%$.'
        },
        {
          title: '3. Generalizability of Studies',
          content: '1) Results from a random sample can ONLY be generalized to the POPULATION FROM WHICH THE SAMPLE WAS DRAWN. A survey of college students cannot generalize to all adults! 2) Random assignment is required to establish CAUSE AND EFFECT.'
        }
      ],
      key_takeaways: [
        'Larger sample size -> smaller margin of error',
        'Random sampling = generalizability; Random assignment = causality',
        'Never generalize beyond the specific population surveyed'
      ]
    }
  },
  {
    title: 'Experimental Design: Random Assignment vs Random Sampling',
    slug: 'experimental-design-random-assignment',
    subject: 'math',
    pathway: 'sat_advanced',
    module_id: '20000000-0000-0000-0000-000000000003',
    skill_id: '11000000-0000-0000-0000-000000000006',
    difficulty: 'hard',
    estimated_duration_minutes: 25,
    order_index: 14,
    summary: 'Distinguish observational studies from experiments and identify confounding variables.',
    content: {
      sections: [
        {
          title: '1. Observational Study vs Controlled Experiment',
          content: 'In an observational study, researchers merely observe without intervening. In an experiment, researchers randomly assign participants to treatment and control groups.'
        },
        {
          title: '2. The Two Golden Criteria of SAT Statistics',
          content: 'Criterion 1: Was there RANDOM SAMPLING? If YES -> conclusions generalize to the population. Criterion 2: Was there RANDOM ASSIGNMENT to treatments? If YES -> CAUSE-AND-EFFECT can be concluded. If NO random assignment, you can only claim CORRELATION/ASSOCIATION, not causation!'
        },
        {
          title: '3. Confounding Variables and Bias',
          content: 'Voluntary response surveys (e.g., online reviews) suffer from severe selection bias because only people with extreme opinions respond.'
        }
      ],
      key_takeaways: [
        'Cause and effect REQUIRES random assignment to treatments',
        'Observational studies show correlation, never causation',
        'Voluntary surveys are heavily biased'
      ]
    }
  },
  {
    title: 'Absolute Value Inequalities and Number Line Ranges',
    slug: 'absolute-value-inequalities-ranges',
    subject: 'math',
    pathway: 'sat_advanced',
    module_id: '20000000-0000-0000-0000-000000000003',
    skill_id: '11000000-0000-0000-0000-000000000003',
    difficulty: 'hard',
    estimated_duration_minutes: 25,
    order_index: 15,
    summary: 'Solve "less than" (sandwich -c < ax+b < c) and "greater than" (two tails) absolute value inequalities.',
    content: {
      sections: [
        {
          title: '1. "Less Than" Case: The Sandwich Compound',
          content: 'For $|ax + b| < c$: It means the distance from zero is LESS than $c$. Rewrite as a contiguous sandwich: $-c < ax + b < c$. Solve simultaneously by performing reverse operations to all three parts.'
        },
        {
          title: '2. "Greater Than" Case: The Two-Tails Split',
          content: 'For $|ax + b| > c$: It means distance from zero is GREATER than $c$. Split into two disconnected rays: $ax + b > c$ OR $ax + b < -c$. Notice the flipped sign and negated value on the second tail!'
        },
        {
          title: '3. Modeling Real-World Tolerance Problems',
          content: 'A bolt manufacturer specifies length $L = 5.00$ cm with tolerance $\\pm 0.04$ cm. The inequality is: $|L - \\text{target}| \\le \\text{tolerance} \\implies |L - 5.00| \\le 0.04$.'
        }
      ],
      key_takeaways: [
        '|x| < c is a sandwich: -c < x < c',
        '|x| > c is two outside tails: x > c OR x < -c',
        'Tolerance formula: |actual - ideal| <= tolerance'
      ]
    }
  },
  {
    title: 'Advanced Desmos Regression and Non-Standard Modeling',
    slug: 'advanced-desmos-regression-modeling',
    subject: 'math',
    pathway: 'sat_advanced',
    module_id: '20000000-0000-0000-0000-000000000003',
    skill_id: '11000000-0000-0000-0000-000000000004',
    difficulty: 'hard',
    estimated_duration_minutes: 25,
    order_index: 16,
    summary: 'Use Desmos regression ~ syntax to instantly fit linear, quadratic, and exponential models.',
    content: {
      sections: [
        {
          title: '1. The Tilde (~) Regression Syntax',
          content: 'In Desmos, enter a data table with columns $x_1$ and $y_1$. Then on the next line, type the model using tilde ($\\\\sim$) instead of equal sign ($=$): 1) Linear: $y_1 \\sim m x_1 + b$. 2) Quadratic: $y_1 \\sim a x_1^2 + b x_1 + c$. 3) Exponential: $y_1 \\sim a(b)^{x_1}$. Desmos fits the curve and gives parameters immediately!'
        },
        {
          title: '2. Solving Impossible Multi-Parameter Equations',
          content: 'When an SAT problem asks for constant $k$ in $f(x) = k(x-2)(x+4)$ passing through $(3, 14)$: Just type $14 = k(3-2)(3+4)$ into Desmos! A slider for $k$ appears, or Desmos directly plots a vertical line at the exact value of $k$.'
        },
        {
          title: '3. Visual Extrema Inspection',
          content: 'Clicking any curve in Desmos highlights all local maxima, minima, and intercepts with clickable gray dots showing coordinate numbers.'
        }
      ],
      key_takeaways: [
        'Use ~ for regression: y1 ~ m*x1 + b',
        'Desmos finds constants k, a, b without manual algebra',
        'Click the gray dots to inspect coordinates with 100% precision'
      ]
    }
  },

  // --- READING & WRITING (14 lessons) ---
  {
    title: 'Cross-Text Synthesis: Nuanced Critiques and Methodological Objections',
    slug: 'cross-text-synthesis-methodological-objections',
    subject: 'reading_writing',
    pathway: 'sat_advanced',
    module_id: '20000000-0000-0000-0000-000000000006',
    skill_id: '11000000-0000-0000-0000-000000000012',
    difficulty: 'hard',
    estimated_duration_minutes: 25,
    order_index: 17,
    summary: 'Master paired texts where Text 2 identifies an unexamined confounding variable in Text 1.',
    content: {
      sections: [
        {
          title: '1. The Classic Digital SAT Paired Pattern',
          content: 'Text 1: Proposes an exciting bold hypothesis (e.g., prehistoric cave paintings served exclusively as hunting rituals). Text 2: Points out that cave paintings also depict geometric symbols and flora, cautioning that attributing all art to a single hunting motive ignores crucial archaeological data.'
        },
        {
          title: '2. The "Qualify Rather Than Dismiss" Distinction',
          content: 'Author 2 almost NEVER completely rejects Author 1 as "fraudulent" or "completely mistaken". Instead, Author 2 QUALIFIES Author 1\'s findings: pointing out a limitation, a sample size bias, or an overlooked variable.'
        },
        {
          title: '3. Eliminating Binary Polar Choices',
          content: 'Reject extreme answer choices that claim Author 2 believes Author 1 is "ignorant" or that Author 1\'s research has "no value". The correct choice uses academic precision: "Author 2 would argue that Author 1\'s conclusion is overly broad."'
        }
      ],
      key_takeaways: [
        'Text 2 usually provides a nuance, limitation, or caveat — not a complete rejection',
        'Look for the specific confounding variable Text 2 introduces',
        'Eliminate choices with harsh non-academic insults or total dismissals'
      ]
    }
  },
  {
    title: 'Complex Textual Inferences: Null Results and Ambiguous Evidence',
    slug: 'complex-inferences-null-results',
    subject: 'reading_writing',
    pathway: 'sat_advanced',
    module_id: '20000000-0000-0000-0000-000000000006',
    skill_id: '11000000-0000-0000-0000-000000000010',
    difficulty: 'hard',
    estimated_duration_minutes: 25,
    order_index: 18,
    summary: 'Handle passages where data fails to show the predicted correlation (null results).',
    content: {
      sections: [
        {
          title: '1. Understanding Null Hypothesis Outcomes',
          content: 'In difficult SAT passages, researchers test a hypothesis and find NO statistically significant difference between groups. The inference must conclude that the hypothesized mechanism CANNOT account for the observed phenomenon.'
        },
        {
          title: '2. The "Does Not Support" Distractor Trap',
          content: 'Students often choose an answer claiming the opposite theory is proven true. A null result does NOT prove the opposite; it merely fails to support the tested hypothesis!'
        },
        {
          title: '3. Matching the Causal Mechanism',
          content: 'Make sure the inference addresses the exact causal pathway proposed in the opening sentences.'
        }
      ],
      key_takeaways: [
        'A null result fails to confirm a theory; it does not prove the opposite theory',
        'Pay attention to whether the data showed no effect vs a reverse effect',
        'Anchor your inference to the specific experimental mechanism'
      ]
    }
  },
  {
    title: 'Advanced Vocabulary: Academic Register and Obscure Connotations',
    slug: 'advanced-vocabulary-academic-register',
    subject: 'reading_writing',
    pathway: 'sat_advanced',
    module_id: '20000000-0000-0000-0000-000000000006',
    skill_id: '11000000-0000-0000-0000-000000000011',
    difficulty: 'hard',
    estimated_duration_minutes: 25,
    order_index: 19,
    summary: 'Dissect high-tier words: ephemeral, equivocal, fastidious, polemical, and tendentious.',
    content: {
      sections: [
        {
          title: '1. Words with Subtle Negative Connotations',
          content: 'Equivocal = intentionally ambiguous or evasive. Tendentious = biased toward a particular controversial viewpoint. Polemical = aggressively attacking an established view. Fastidious = excessively particular or demanding. Specious = superficially plausible, but actually wrong.'
        },
        {
          title: '2. Collocation and Academic Context',
          content: 'Certain words naturally collocate with academic concepts: "corroborate a finding", "substantiate an assertion", "delineate a methodology", "preclude a possibility".'
        },
        {
          title: '3. Root Word Deconstruction',
          content: 'If an unknown word appears: break it into roots, prefixes, and suffixes. "In-explic-able" (not able to be explained). "Equi-vocal" (equal voices -> undecided/ambiguous).'
        }
      ],
      key_takeaways: [
        'Learn precise definitions for high-frequency academic words',
        'Distinguish neutral descriptions from critical words (e.g., persuasive vs specious)',
        'Break unfamiliar multisyllabic words into roots and prefixes'
      ]
    }
  },
  {
    title: 'Punctuation with Parenthetical Appositives and Restrictive Clauses',
    slug: 'parenthetical-appositives-restrictive-clauses',
    subject: 'reading_writing',
    pathway: 'sat_advanced',
    module_id: '20000000-0000-0000-0000-000000000006',
    skill_id: '11000000-0000-0000-0000-000000000015',
    difficulty: 'hard',
    estimated_duration_minutes: 25,
    order_index: 20,
    summary: 'Untangle sentences with nested appositives, title-name combinations, and zero-comma rules.',
    content: {
      sections: [
        {
          title: '1. Profession / Title + Name: The Zero-Comma Rule',
          content: 'When an occupational description or title immediately precedes a proper name without an article ("a" or "the"), DO NOT PUT ANY COMMAS: "Novelist Chimamanda Ngozi Adichie published..." (CORRECT). "Novelist, Chimamanda Ngozi Adichie, published..." (INCORRECT).'
        },
        {
          title: '2. The Article Change ("The" triggers commas)',
          content: 'If there IS a definite article "The": "The Nigerian novelist, Chimamanda Ngozi Adichie, published..." (Here, the name is an appositive framed by commas because "The Nigerian novelist" already specifies the role).'
        },
        {
          title: '3. Nested Modifiers',
          content: 'When a modifier contains another modifier inside it, ensure all bracketed punctuation closes in the correct reverse order.'
        }
      ],
      key_takeaways: [
        'No commas between title and name when no article is present: "Physicist Marie Curie"',
        'Commas ARE used when "The" precedes the title: "The physicist, Marie Curie,"',
        'Verify that lifting the modifier leaves a grammatically complete sentence'
      ]
    }
  },
  {
    title: 'Semicolons in Complex Lists with Internal Punctuation',
    slug: 'semicolons-complex-lists-internal-punctuation',
    subject: 'reading_writing',
    pathway: 'sat_advanced',
    module_id: '20000000-0000-0000-0000-000000000006',
    skill_id: '11000000-0000-0000-0000-000000000015',
    difficulty: 'hard',
    estimated_duration_minutes: 25,
    order_index: 21,
    summary: 'Use "super-semicolons" to separate list items that already contain internal commas.',
    content: {
      sections: [
        {
          title: '1. The "Super-Comma" Semicolon Function',
          content: 'Beyond connecting independent clauses, semicolons are used to separate items in a series when the items themselves already contain internal commas (such as city-state pairs or names with titles).'
        },
        {
          title: '2. Example of a Super-Semicolon List',
          content: '"The delegation included Dr. Aris Thorne, a biochemist ; Dr. Elena Rostova, a geneticist ; and Marcus Vance, an ethicist." If commas were used instead of semicolons, the reader could not tell where one person\'s entry ends and the next begins!'
        },
        {
          title: '3. Parallel Punctuation Requirement',
          content: 'All items in such a list MUST be separated by semicolons. You cannot use a semicolon between items 1 and 2, and then switch to a comma between items 2 and 3.'
        }
      ],
      key_takeaways: [
        'Semicolons separate list items that already contain internal commas',
        'Maintains clarity between complex credentials, cities, or dates',
        'All delimiters in the list must be consistent semicolons'
      ]
    }
  },
  {
    title: 'Rhetorical Transitions: Categorical Shift and Contrast Fine Points',
    slug: 'rhetorical-transitions-categorical-shift',
    subject: 'reading_writing',
    pathway: 'sat_advanced',
    module_id: '20000000-0000-0000-0000-000000000006',
    skill_id: '11000000-0000-0000-0000-000000000013',
    difficulty: 'hard',
    estimated_duration_minutes: 25,
    order_index: 22,
    summary: 'Master obscure transitions: that is, by contrast, regardless, to that end, in short.',
    content: {
      sections: [
        {
          title: '1. "To that end" (Purpose / Goal Connector)',
          content: '"To that end" means "in order to achieve that goal". Sentence 1 must state an objective or goal, and Sentence 2 must describe an action taken specifically to achieve that objective.'
        },
        {
          title: '2. "That is" (Restatement / Clarification)',
          content: '"That is" (id est) means "in other words" or "specifically speaking". It introduces a reformulation of Sentence 1 in more precise terms. It does NOT introduce an example or a result.'
        },
        {
          title: '3. "Regardless" vs "Nevertheless"',
          content: '"Regardless" means "ignoring what was said". "Nevertheless" means "in spite of what was said, the following remains true".'
        }
      ],
      key_takeaways: [
        '"To that end" connects a stated goal to an action taken to achieve it',
        '"That is" restates the preceding idea with greater clarity',
        'Predict the required relationship category before inspecting answer choices'
      ]
    }
  },
  {
    title: 'Rhetorical Synthesis: Multi-Variable Constraints and Nuance Goals',
    slug: 'rhetorical-synthesis-multi-variable-constraints',
    subject: 'reading_writing',
    pathway: 'sat_advanced',
    module_id: '20000000-0000-0000-0000-000000000006',
    skill_id: '11000000-0000-0000-0000-000000000014',
    difficulty: 'hard',
    estimated_duration_minutes: 25,
    order_index: 23,
    summary: 'Solve the hardest student-notes questions requiring 2 or more simultaneous criteria.',
    content: {
      sections: [
        {
          title: '1. Compound Prompt Goals',
          content: 'Hard synthesis questions combine two distinct requirements: "The student wants to EMPHASIZE A SIMILARITY while also INTRODUCING THE COMMON SPECIES." The winning answer choice MUST accomplish BOTH requirements. If an answer only shows similarity without naming the species, it is eliminated!'
        },
        {
          title: '2. The Checklist Verification Technique',
          content: 'Underline each constraint in the prompt: [Constraint 1: similarity] + [Constraint 2: introduction]. Go through choices A, B, C, D and put a checkmark next to each requirement. Only the correct answer earns both checks.'
        },
        {
          title: '3. Elimination of Stylistic Flaws',
          content: 'If an answer satisfies both constraints but contains a comma splice or run-on, eliminate it. Correct answers are always grammatically flawless.'
        }
      ],
      key_takeaways: [
        'Compound goals require satisfying two separate criteria simultaneously',
        'Make a two-item checklist for the question prompt',
        'Reject answers that achieve one goal but omit the second'
      ]
    }
  },
  {
    title: 'Scientific Data Synthesis: Complex Charts with Multiple Lines & Subgroups',
    slug: 'scientific-data-synthesis-multiline-charts',
    subject: 'reading_writing',
    pathway: 'sat_advanced',
    module_id: '20000000-0000-0000-0000-000000000006',
    skill_id: '11000000-0000-0000-0000-000000000009',
    difficulty: 'hard',
    estimated_duration_minutes: 25,
    order_index: 24,
    summary: 'Dissect charts with two Y-axes, error bars, crossover points, and conflicting subgroup trends.',
    content: {
      sections: [
        {
          title: '1. Charts with Dual Y-Axes',
          content: 'Some advanced graphs feature two vertical axes (e.g., Temperature on the left in Celsius, Rainfall on the right in mm). Verify WHICH axis corresponds to solid lines vs dashed lines in the legend before reading numbers!'
        },
        {
          title: '2. Error Bars (Standard Error of the Mean)',
          content: 'If error bars of two bars OVERLAP significantly, the difference between the two treatments is likely NOT statistically significant! If error bars do not overlap, there is a statistically credible difference.'
        },
        {
          title: '3. Simpson\'s Paradox / Disaggregated Trends',
          content: 'Watch out for trends that hold true across the whole population, but reverse when broken down by individual subgroups (e.g., age or income brackets).'
        }
      ],
      key_takeaways: [
        'Check which axis and unit applies to each line or bar',
        'Overlapping error bars mean no statistically significant difference',
        'Subgroup data can contradict overall aggregate averages'
      ]
    }
  },
  {
    title: 'Deductive vs Inductive Arguments in Academic Essays',
    slug: 'deductive-vs-inductive-academic-arguments',
    subject: 'reading_writing',
    pathway: 'sat_advanced',
    module_id: '20000000-0000-0000-0000-000000000006',
    skill_id: '11000000-0000-0000-0000-000000000010',
    difficulty: 'hard',
    estimated_duration_minutes: 25,
    order_index: 25,
    summary: 'Evaluate syllogisms, underlying assumptions, and logical validity in philosophical passages.',
    content: {
      sections: [
        {
          title: '1. Deductive Reasoning (General -> Specific)',
          content: 'Deductive arguments move from general principles to a guaranteed specific conclusion. If the premises are true, the conclusion MUST be true (e.g., Major premise: All enzymes are proteins. Minor premise: Lactase is an enzyme. Conclusion: Lactase is a protein).'
        },
        {
          title: '2. Identifying Necessary Unstated Assumptions',
          content: '"The author\'s argument assumes which of the following?" The correct assumption is the missing bridge between the premise and the conclusion. Use the NEGATION TEST: If you negate the assumption, does the author\'s argument completely collapse? If yes, it is the correct assumption!'
        },
        {
          title: '3. Correlation vs Causation Fallacy',
          content: 'Just because two historical events occurred together does not prove one caused the other. Always check if a third factor (a confounding economic or social variable) drove both.'
        }
      ],
      key_takeaways: [
        'Deductive reasoning guarantees conclusions if premises are true',
        'Use the Negation Test: negating the correct assumption destroys the argument',
        'Beware of assuming chronological order proves causality'
      ]
    }
  },
  {
    title: 'Archaic and Historical Vocabulary: 18th & 19th Century Contexts',
    slug: 'archaic-historical-vocabulary-18th-19th-century',
    subject: 'reading_writing',
    pathway: 'sat_advanced',
    module_id: '20000000-0000-0000-0000-000000000006',
    skill_id: '11000000-0000-0000-0000-000000000011',
    difficulty: 'hard',
    estimated_duration_minutes: 25,
    order_index: 26,
    summary: 'Decode historical vocabulary: usurpation, despotism, franchise, sentiment, and posterity.',
    content: {
      sections: [
        {
          title: '1. Political and Legal Terminology in Historical Documents',
          content: 'Franchise = the legal right to vote. Usurpation = wrongful seizure of power. Posterity = future generations. Despotism = tyrannical rule. Prudence = careful caution and wisdom.'
        },
        {
          title: '2. Sentimental and Psychological Shifts',
          content: '"Sentiment" in the 1700s did not mean cheesy emotion; it meant a reasoned OPINION or philosophical conviction. "Disinterested" meant IMPARTIAL and unbiased, NOT bored or uninterested!'
        },
        {
          title: '3. Decoding Formal Rhetorical Inversions',
          content: '"Nor did he hesitate to declare..." = "He immediately declared..." Translate archaic double negatives into direct assertions.'
        }
      ],
      key_takeaways: [
        'Franchise = voting rights; Posterity = future generations',
        '"Disinterested" = unbiased/objective, NOT uninterested',
        'Translate archaic double negatives into simple positive statements'
      ]
    }
  },
  {
    title: 'Faulty Comparisons: Apples to Apples in Complex Clauses',
    slug: 'faulty-comparisons-apples-to-apples',
    subject: 'reading_writing',
    pathway: 'sat_advanced',
    module_id: '20000000-0000-0000-0000-000000000006',
    skill_id: '11000000-0000-0000-0000-000000000015',
    difficulty: 'hard',
    estimated_duration_minutes: 25,
    order_index: 27,
    summary: 'Catch subtle illogical comparisons between an entity and an attribute.',
    content: {
      sections: [
        {
          title: '1. Singular Comparison: "That of"',
          content: '"The skull capacity of Neanderthals was larger than modern humans" (INCORRECT - comparing a skull capacity to human beings). Correct: "The skull capacity of Neanderthals was larger than THAT OF modern humans" (or "than modern humans\' skull capacity").'
        },
        {
          title: '2. Plural Comparison: "Those of"',
          content: '"The novels of Virginia Woolf, unlike James Joyce, feature stream-of-consciousness" (INCORRECT - comparing novels to an author). Correct: "The novels of Virginia Woolf, unlike THOSE OF James Joyce, feature..."'
        },
        {
          title: '3. Possessive Apostrophe as a Comparison Fix',
          content: 'Another valid way the SAT fixes comparisons is with a possessive noun: "Her painting was more vivid than Leonardo\'s" (where "Leonardo\'s" stands for "Leonardo\'s painting").'
        }
      ],
      key_takeaways: [
        'Use "that of" when comparing singular characteristics',
        'Use "those of" when comparing plural characteristics',
        'Never compare an attribute (size, speed, brain, painting) directly to a person'
      ]
    }
  },
  {
    title: 'Correlative Conjunctions and Inverted Sentence Structure',
    slug: 'correlative-conjunctions-inverted-structure',
    subject: 'reading_writing',
    pathway: 'sat_advanced',
    module_id: '20000000-0000-0000-0000-000000000006',
    skill_id: '11000000-0000-0000-0000-000000000015',
    difficulty: 'hard',
    estimated_duration_minutes: 25,
    order_index: 28,
    summary: 'Master negative inversions: Not only did she [verb], but she also [verb].',
    content: {
      sections: [
        {
          title: '1. Negative Inversion Mechanics',
          content: 'When a sentence opens with a negative or restrictive adverbial phrase ("Not only", "Seldom", "Rarely", "Scarcely", "Under no circumstances"), the subject and auxiliary verb MUST INVERT: "Rarely does a comet come this close." "Not only did the team win the championship, but they also set a record."'
        },
        {
          title: '2. Subject-Verb Agreement in Correlative Conjunctions',
          content: 'When using "Neither... nor" or "Either... or", the verb agrees with the subject CLOSER to it! Example: "Neither the teacher nor the students were present." (Students is plural -> were). BUT: "Neither the students nor the teacher was present." (Teacher is singular -> was).'
        },
        {
          title: '3. Both... and Rule',
          content: '"Both [X] and [Y]" always takes a PLURAL verb because two elements are linked together.'
        }
      ],
      key_takeaways: [
        'Negative adverbs at the start of sentences trigger verb-subject inversion: "Seldom have we..."',
        'Neither... nor verbs agree with the subject closest to the verb',
        'Both... and is always plural'
      ]
    }
  },
  {
    title: 'Synthesis of Quantitative and Literary Arguments',
    slug: 'synthesis-quantitative-literary-arguments',
    subject: 'reading_writing',
    pathway: 'sat_advanced',
    module_id: '20000000-0000-0000-0000-000000000006',
    skill_id: '11000000-0000-0000-0000-000000000009',
    difficulty: 'hard',
    estimated_duration_minutes: 25,
    order_index: 29,
    summary: 'Integrate humanities passages with empirical data and sociological tables.',
    content: {
      sections: [
        {
          title: '1. Digital SAT Humanities Data Questions',
          content: 'Modern Digital SAT questions frequently pair a literary or artistic discussion (e.g., shifts in translation styles or museum visitor demographics) with a quantitative table. You must connect the artistic claim with the numerical trend.'
        },
        {
          title: '2. Beware of Unfounded Causal Extrapolations',
          content: 'If the text discusses a decline in theater attendance, and the table shows ticket prices rose by 40%, the data SUPPORTS the claim that cost may be a barrier, but does NOT prove ticket price was the SOLE cause.'
        },
        {
          title: '3. Precise Column-Row Cross-Referencing',
          content: 'Always double-check both the row heading and column heading. Confusing the "18-24 age group" with the "25-34 age group" is a common trap on speed-pressured questions.'
        }
      ],
      key_takeaways: [
        'Connect the textual artistic thesis directly to the empirical table row',
        'Distinguish correlation between prices and attendance from exclusive causation',
        'Triple-check row and column intersections before submitting answers'
      ]
    }
  },
  {
    title: 'The Digital SAT 800-Scorer Mindset and Time Optimization',
    slug: 'digital-sat-800-scorer-mindset-optimization',
    subject: 'reading_writing',
    pathway: 'sat_advanced',
    module_id: '20000000-0000-0000-0000-000000000006',
    skill_id: '11000000-0000-0000-0000-000000000010',
    difficulty: 'hard',
    estimated_duration_minutes: 25,
    order_index: 30,
    summary: 'Triage question order, use the mark-for-review flag strategically, and eliminate pacing panic.',
    content: {
      sections: [
        {
          title: '1. The Reverse Order Attack for Reading & Writing',
          content: 'In Digital SAT R&W modules, questions 1–15 are mostly Reading (words in context, central ideas, inferences) which take 60–90 seconds each. Questions 16–27 are Grammar, Transitions, and Notes, which can be answered in 20–35 seconds each! Master strategy: Jump straight to question 16, rack up all easy grammar points in 8 minutes, then spend the remaining 24 minutes on Reading with zero time pressure!'
        },
        {
          title: '2. The 90-Second Rule and Flagging',
          content: 'If you have worked on any question for 90 seconds without a clear path to the answer: 1) Pick your best educated guess immediately. 2) Click the "Mark for Review" flag. 3) MOVE ON. Never let one stubborn question steal time from 3 easy questions waiting at the end.'
        },
        {
          title: '3. Desmos-First in Math Module 2',
          content: 'In Math Module 2 (the hard adaptive module), every 800-scorer uses Desmos for at least 8 to 12 questions. Systems, regressions, circle graphs, and intersections should be checked visually to achieve 100% accuracy.'
        }
      ],
      key_takeaways: [
        'Consider starting at Q16 for R&W to lock in fast grammar points first',
        'Never spend more than 90 seconds on a single question without flagging and moving on',
        'Use Desmos to verify all algebraic systems and intersection problems'
      ]
    }
  }
];
