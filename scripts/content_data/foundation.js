// 28 Lessons for Foundation Pathway (14 Math + 14 Reading & Writing)
// Combined with 2 existing lessons = 30 Foundation lessons total!

export const foundationLessons = [
  // --- MATH (14 lessons) ---
  {
    title: 'Linear Slope Formula and Rate of Change',
    slug: 'linear-slope-formula-rate-of-change',
    subject: 'math',
    pathway: 'foundation',
    module_id: '20000000-0000-0000-0000-000000000001',
    skill_id: '11000000-0000-0000-0000-000000000001',
    difficulty: 'easy',
    estimated_duration_minutes: 15,
    order_index: 3,
    summary: 'Master computing slope m = (y2 - y1) / (x2 - x1) and interpreting it in real-world word problems.',
    content: {
      sections: [
        {
          title: '1. The Core Formula & Visual Intuition',
          content: 'Slope is the constant rate of change: $m = \\frac{y_2 - y_1}{x_2 - x_1} = \\frac{\\Delta y}{\\Delta x}$. A positive slope rises from left to right, a negative slope falls, a horizontal line has $m = 0$, and a vertical line has an undefined slope.'
        },
        {
          title: '2. SAT Context: Interpreting Slope in Word Problems',
          content: 'In linear models $y = mx + b$, the slope $m$ ALWAYS represents the unit rate of change: "for each additional unit of $x$, $y$ increases by $m$". If a question asks "What is the meaning of 4.5 in $C = 4.5t + 12$?", the answer is: the cost increases by $4.50 for each additional hour $t$.'
        },
        {
          title: '3. Digital SAT Desmos Hack',
          content: 'When given two coordinates like $(3, 14)$ and $(7, 30)$, enter a table in Desmos with these points. Then write $y_1 \\sim m x_1 + b$. Desmos will instantly calculate $m = 4$ and $b = 2$ without algebraic calculation errors!'
        }
      ],
      key_takeaways: [
        'Slope is always (change in y) / (change in x)',
        'In context: slope is the per-unit increase or decrease',
        'Parallel lines have identical slopes; perpendicular lines have negative reciprocal slopes: m1 * m2 = -1'
      ]
    }
  },
  {
    title: 'Slope-Intercept Form and Finding the Y-Intercept',
    slug: 'slope-intercept-form-y-intercept',
    subject: 'math',
    pathway: 'foundation',
    module_id: '20000000-0000-0000-0000-000000000001',
    skill_id: '11000000-0000-0000-0000-000000000001',
    difficulty: 'easy',
    estimated_duration_minutes: 15,
    order_index: 4,
    summary: 'Translate between equations and graphs using y = mx + b with instant y-intercept recognition.',
    content: {
      sections: [
        {
          title: '1. The Anatomy of y = mx + b',
          content: 'In slope-intercept form, $m$ is the slope and $b$ is the y-coordinate where the line crosses the y-axis, $(0, b)$. The y-intercept represents the initial value or baseline cost when $x = 0$.'
        },
        {
          title: '2. Converting from Standard Form Ax + By = C',
          content: 'To quickly find the y-intercept from $Ax + By = C$, simply set $x = 0$ and solve for $y = C / B$. To find the x-intercept, set $y = 0$ and solve $x = C / A$. The slope is always $-A / B$.'
        },
        {
          title: '3. Common SAT Traps',
          content: 'Beware when an equation is written with reversed terms, e.g., $y = 15 - 3x$. The slope is $-3$, NOT $15$! The number multiplying $x$ is always the slope.'
        }
      ],
      key_takeaways: [
        'The y-intercept represents the starting / fixed amount at time zero',
        'To find any intercept, plug in zero for the other variable',
        'Slope is always the coefficient of x, not whichever number appears first'
      ]
    }
  },
  {
    title: 'Linear Inequalities and Shaded Solution Regions',
    slug: 'linear-inequalities-shaded-regions',
    subject: 'math',
    pathway: 'foundation',
    module_id: '20000000-0000-0000-0000-000000000001',
    skill_id: '11000000-0000-0000-0000-000000000001',
    difficulty: 'easy',
    estimated_duration_minutes: 15,
    order_index: 5,
    summary: 'Master graphing inequalities, boundary lines, and determining which coordinate pairs satisfy systems.',
    content: {
      sections: [
        {
          title: '1. Solid vs Dashed Boundary Lines',
          content: 'Inequalities with $\\le$ or $\\ge$ use a solid line (boundary is included in the solution). Inequalities with $<$ or $>$ use a dashed line (boundary is NOT included).'
        },
        {
          title: '2. The Origin Test (0, 0)',
          content: 'To know which side to shade: plug in $(0, 0)$. If the resulting inequality is true, shade the side containing $(0, 0)$. If false, shade the opposite side. (If the line passes through the origin, test $(0, 1)$ or $(1, 0)$ instead).'
        },
        {
          title: '3. Reversing the Inequality Sign',
          content: 'CRITICAL RULE: When multiplying or dividing both sides by a negative number, you MUST reverse the direction of the inequality sign: $-2x < 10 \\implies x > -5$.'
        }
      ],
      key_takeaways: [
        'Always flip the inequality sign when dividing or multiplying by a negative',
        'Test point (0, 0) immediately confirms the shaded region',
        'On Digital SAT: type the inequality straight into Desmos to see the shaded area'
      ]
    }
  },
  {
    title: 'Percentages, Base Values, and Percent Change',
    slug: 'percentages-base-values-percent-change',
    subject: 'math',
    pathway: 'foundation',
    module_id: '20000000-0000-0000-0000-000000000001',
    skill_id: '11000000-0000-0000-0000-000000000005',
    difficulty: 'easy',
    estimated_duration_minutes: 15,
    order_index: 6,
    summary: 'Calculate percent increases, decreases, and avoid the most common base-value traps on the SAT.',
    content: {
      sections: [
        {
          title: '1. The Percent Multiplier Method',
          content: 'Never do percentage problems in two steps. Use multipliers: An increase of $25\\%$ means multiplying by $1.25$. A decrease of $30\\%$ means multiplying by $(1 - 0.30) = 0.70$.'
        },
        {
          title: '2. The Percent Change Formula',
          content: 'Percent change is always calculated relative to the ORIGINAL starting value: $\\text{Percent Change} = \\frac{\\text{New} - \\text{Old}}{\\text{Old}} \\times 100\\%$. Dividing by the new value is the #1 distractor choice on the SAT!'
        },
        {
          title: '3. Successive Percentage Traps',
          content: 'If an item increases by $20\\%$ and then decreases by $20\\%$, the price does NOT return to the original! Let original = $100$. After increase: $100 \\times 1.20 = 120$. After decrease: $120 \\times 0.80 = 96$ (a net $4\\%$ decrease).'
        }
      ],
      key_takeaways: [
        'Multiply directly: 15% increase is * 1.15; 15% decrease is * 0.85',
        'Denominator of percent change is always the ORIGINAL (old) value',
        'Consecutive percent changes cannot be added together directly'
      ]
    }
  },
  {
    title: 'Ratios, Proportions, and Unit Conversions',
    slug: 'ratios-proportions-unit-conversions',
    subject: 'math',
    pathway: 'foundation',
    module_id: '20000000-0000-0000-0000-000000000001',
    skill_id: '11000000-0000-0000-0000-000000000005',
    difficulty: 'easy',
    estimated_duration_minutes: 15,
    order_index: 7,
    summary: 'Solve multi-step proportions and master dimensional analysis for complex unit conversions.',
    content: {
      sections: [
        {
          title: '1. Setting Up Equivalent Fractions',
          content: 'When two quantities are directly proportional: $\\frac{a_1}{b_1} = \\frac{a_2}{b_2}$. Always keep identical units in corresponding positions (e.g., miles on top, hours on bottom).'
        },
        {
          title: '2. Dimensional Analysis (Cancel Units)',
          content: 'To convert units reliably, multiply by conversion factors where units cancel out diagonally: $60 \\text{ miles/hr} \\times \\frac{5280 \\text{ ft}}{1 \\text{ mile}} \\times \\frac{1 \\text{ hr}}{3600 \\text{ sec}} = 88 \\text{ ft/sec}$.'
        },
        {
          title: '3. Ratio Parts to Total Method',
          content: 'If the ratio of boys to girls in a class is $3:5$, the total parts is $3 + 5 = 8$. If there are 32 students in total, each part is $32 / 8 = 4$. Number of boys = $3 \\times 4 = 12$; number of girls = $5 \\times 4 = 20$.'
        }
      ],
      key_takeaways: [
        'Set up matching units: top-to-top and bottom-to-bottom',
        'Use dimensional analysis so unwanted units cancel out',
        'Add ratio components together to find the fractional share of the whole'
      ]
    }
  },
  {
    title: 'Arithmetic Mean, Median, and Mode Fundamentals',
    slug: 'arithmetic-mean-median-mode-fundamentals',
    subject: 'math',
    pathway: 'foundation',
    module_id: '20000000-0000-0000-0000-000000000001',
    skill_id: '11000000-0000-0000-0000-000000000005',
    difficulty: 'easy',
    estimated_duration_minutes: 15,
    order_index: 8,
    summary: 'Calculate center metrics and understand how outliers distort the mean versus the median.',
    content: {
      sections: [
        {
          title: '1. Mean Formula and the Sum Trick',
          content: '$\\text{Mean} = \\frac{\\text{Sum of values}}{n}$. SAT SHORTCUT: $\\text{Sum} = \\text{Mean} \\times n$. If the average of 5 test scores is 84, their sum is $5 \\times 84 = 420$. If a 6th test brings the average to 86, the new sum is $6 \\times 86 = 516$. The 6th score was $516 - 420 = 96$.'
        },
        {
          title: '2. Median: Finding the Center',
          content: 'Sort the dataset in ascending order. If $n$ is odd, median is the exact middle value: $(n+1)/2$. If $n$ is even, take the arithmetic average of the two middle values.'
        },
        {
          title: '3. Outlier Impact on Skewed Distributions',
          content: 'Outliers heavily pull the MEAN in their direction, while having little to no impact on the MEDIAN. If a dataset has an extreme high outlier, $\\text{Mean} > \\text{Median}$. If it has an extreme low outlier, $\\text{Mean} < \\text{Median}$.'
        }
      ],
      key_takeaways: [
        'Sum = Mean * count — this solves 80% of average problems',
        'Always sort values in order before finding the median',
        'The median is resistant to outliers; the mean is heavily affected'
      ]
    }
  },
  {
    title: 'Scatterplots and Lines of Best Fit',
    slug: 'scatterplots-lines-best-fit',
    subject: 'math',
    pathway: 'foundation',
    module_id: '20000000-0000-0000-0000-000000000001',
    skill_id: '11000000-0000-0000-0000-000000000005',
    difficulty: 'easy',
    estimated_duration_minutes: 15,
    order_index: 9,
    summary: 'Interpret trends, residuals (actual vs predicted), and regression lines on scatterplots.',
    content: {
      sections: [
        {
          title: '1. Correlation: Positive, Negative, or None',
          content: 'A positive association means as $x$ increases, $y$ tends to increase. A negative association means as $x$ increases, $y$ tends to decrease. A line of best fit models the central trend of the data points.'
        },
        {
          title: '2. Residuals: Actual vs Predicted',
          content: '$\\text{Residual} = \\text{Actual } y - \\text{Predicted } y$. A point ABOVE the line of best fit has an actual value greater than predicted (positive residual). A point BELOW the line has an actual value less than predicted.'
        },
        {
          title: '3. SAT Question: Estimating Intercepts & Slopes',
          content: 'Pick two distinct points directly on the line of best fit (NOT original data dots that fall off the line) to calculate the slope. Use that slope to verify model accuracy.'
        }
      ],
      key_takeaways: [
        'Points above the line of best fit have actual > predicted',
        'Use points on the drawn line, not random data points, to find the slope',
        'Correlation does not imply causation in SAT experiment questions'
      ]
    }
  },
  {
    title: 'Two-Way Frequency Tables and Conditional Probability',
    slug: 'two-way-frequency-tables-probability',
    subject: 'math',
    pathway: 'foundation',
    module_id: '20000000-0000-0000-0000-000000000001',
    skill_id: '11000000-0000-0000-0000-000000000005',
    difficulty: 'easy',
    estimated_duration_minutes: 15,
    order_index: 10,
    summary: 'Master reading contingency tables and identifying the correct restricted denominator.',
    content: {
      sections: [
        {
          title: '1. Finding the Target Group (Denominator)',
          content: 'In probability questions, look for conditional phrasing: "Given that", "Of the students who", or "If a female participant is chosen at random". The phrase that defines the subset is your DENOMINATOR, NOT the grand total of the entire table!'
        },
        {
          title: '2. Finding the Numerator',
          content: 'The numerator is the cell that satisfies BOTH the condition and the characteristic of interest.'
        },
        {
          title: '3. Real SAT Example',
          content: 'Table of 100 students: 40 Boys (10 Seniors, 30 Juniors), 60 Girls (20 Seniors, 40 Juniors). "Given that a student is a Senior, what is the probability they are a boy?" Total Seniors = $10 + 20 = 30$. Boy Seniors = $10$. Answer: $10 / 30 = 1/3$, NOT $10 / 100$.'
        }
      ],
      key_takeaways: [
        'The phrase "Given that..." or "Of the..." shrinks your denominator',
        'Do not automatically divide by the grand total in the bottom right corner',
        'Highlight the relevant row or column before calculating'
      ]
    }
  },
  {
    title: 'Angles, Parallel Lines, and Transversals',
    slug: 'angles-parallel-lines-transversals',
    subject: 'math',
    pathway: 'foundation',
    module_id: '20000000-0000-0000-0000-000000000001',
    skill_id: '11000000-0000-0000-0000-000000000001',
    difficulty: 'easy',
    estimated_duration_minutes: 15,
    order_index: 11,
    summary: 'Solve angle puzzles with parallel lines, vertical angles, and supplementary relationships.',
    content: {
      sections: [
        {
          title: '1. Vertical Angles and Supplementary Angles',
          content: 'Vertical angles formed by two intersecting lines are equal. Angles along a straight line add up to $180^\\circ$ (supplementary). Angles forming a right angle add up to $90^\\circ$ (complementary).'
        },
        {
          title: '2. Parallel Lines Cut by a Transversal: Big / Small Rule',
          content: 'When two parallel lines are crossed by a transversal, only TWO angle measurements are created: Acute angles (small) and Obtuse angles (big). All small angles are equal to each other! All big angles are equal to each other! Any small angle + any big angle = $180^\\circ$.'
        },
        {
          title: '3. Alternate Interior and Corresponding Angles',
          content: 'Z-angles (alternate interior) are equal. F-angles (corresponding) are equal. C-angles (consecutive interior) sum to $180^\\circ$.'
        }
      ],
      key_takeaways: [
        'Parallel lines + transversal = all acute angles equal, all obtuse angles equal',
        'Any acute + any obtuse = 180 degrees',
        'Angles in a triangle always sum to 180 degrees'
      ]
    }
  },
  {
    title: 'Triangles: Isosceles, Equilateral, and Exterior Angle Theorem',
    slug: 'triangles-isosceles-equilateral-exterior-angle',
    subject: 'math',
    pathway: 'foundation',
    module_id: '20000000-0000-0000-0000-000000000001',
    skill_id: '11000000-0000-0000-0000-000000000001',
    difficulty: 'easy',
    estimated_duration_minutes: 15,
    order_index: 12,
    summary: 'Apply triangle properties, angle-side relationships, and the powerful exterior angle theorem.',
    content: {
      sections: [
        {
          title: '1. Isosceles & Equilateral Triangle Rules',
          content: 'An equilateral triangle has 3 equal sides and three $60^\\circ$ angles. An isosceles triangle has at least 2 equal sides, and the angles opposite those sides are equal (base angles).'
        },
        {
          title: '2. The Exterior Angle Theorem (SAT Speed Weapon)',
          content: 'An exterior angle of a triangle is equal to the sum of the two remote (opposite) interior angles: $d = a + b$. Using this saves you 30 seconds compared to calculating the third interior angle and subtracting from $180^\\circ$.'
        },
        {
          title: '3. Triangle Inequality Theorem',
          content: 'The sum of the lengths of any two sides of a triangle must be strictly greater than the third side: $a + b > c$. If two sides are 4 and 9, the third side $x$ must satisfy $9 - 4 < x < 9 + 4 \\implies 5 < x < 13$.'
        }
      ],
      key_takeaways: [
        'Exterior angle = sum of two opposite interior angles',
        'Angles opposite equal sides are equal',
        'Third side must be between difference and sum of the other two sides'
      ]
    }
  },
  {
    title: 'Perimeter, Area of Polygons, and Basic Circles',
    slug: 'perimeter-area-polygons-basic-circles',
    subject: 'math',
    pathway: 'foundation',
    module_id: '20000000-0000-0000-0000-000000000001',
    skill_id: '11000000-0000-0000-0000-000000000001',
    difficulty: 'easy',
    estimated_duration_minutes: 15,
    order_index: 13,
    summary: 'Calculate area of rectangles, trapezoids, circles, and master the relationship between radius and circumference.',
    content: {
      sections: [
        {
          title: '1. Essential Formulas Given on the SAT Reference Sheet',
          content: 'Rectangle Area: $A = l \\cdot w$. Triangle Area: $A = \\frac{1}{2}bh$. Circle Area: $A = \\pi r^2$. Circle Circumference: $C = 2\\pi r = \\pi d$. The reference sheet is on your screen in the Digital SAT app, but knowing them by heart saves valuable time.'
        },
        {
          title: '2. Trapezoid Area Shortcut',
          content: 'Trapezoid Area: $A = \\frac{b_1 + b_2}{2} \\cdot h$. It is the average of the two parallel bases multiplied by the perpendicular height.'
        },
        {
          title: '3. Scaling Area vs Length',
          content: 'If the linear dimensions of a 2D shape are multiplied by scale factor $k$, the perimeter is multiplied by $k$, but the AREA is multiplied by $k^2$! If radius doubles, area quadruples ($2^2 = 4$).'
        }
      ],
      key_takeaways: [
        'If side length doubles, area increases by 4x (factor of k^2)',
        'Circumference = 2 * pi * r; Area = pi * r^2',
        'Height in triangle/trapezoid formulas is always perpendicular (at 90 degrees)'
      ]
    }
  },
  {
    title: 'Rules of Exponents and Negative Exponents',
    slug: 'rules-exponents-negative-exponents',
    subject: 'math',
    pathway: 'foundation',
    module_id: '20000000-0000-0000-0000-000000000001',
    skill_id: '11000000-0000-0000-0000-000000000001',
    difficulty: 'easy',
    estimated_duration_minutes: 15,
    order_index: 14,
    summary: 'Simplify algebraic terms with product, quotient, power-of-a-power, and negative exponent laws.',
    content: {
      sections: [
        {
          title: '1. The Core Exponential Rules',
          content: 'Product Rule: $x^a \\cdot x^b = x^{a+b}$. Quotient Rule: $\\frac{x^a}{x^b} = x^{a-b}$. Power of a Power: $(x^a)^b = x^{ab}$. Power of a Product: $(xy)^a = x^a y^a$.'
        },
        {
          title: '2. Negative and Zero Exponents',
          content: 'Zero Power: Any nonzero number to the 0 power is 1: $x^0 = 1$. Negative Power: A negative exponent means the reciprocal: $x^{-n} = \\frac{1}{x^n}$ and $\\frac{1}{x^{-n}} = x^n$. Example: $2^{-3} = \\frac{1}{2^3} = \\frac{1}{8}$.'
        },
        {
          title: '3. Fractional (Rational) Exponents',
          content: '$x^{m/n} = \\sqrt[n]{x^m} = (\\sqrt[n]{x})^m$. The bottom denominator is the root index, and the top numerator is the power. Example: $8^{2/3} = (\\sqrt[3]{8})^2 = 2^2 = 4$.'
        }
      ],
      key_takeaways: [
        'Same base multiplied -> add exponents; divided -> subtract exponents',
        'Negative exponent flips fraction across the division bar',
        'x^(m/n) -> n-th root of x raised to power m'
      ]
    }
  },
  {
    title: 'Radicals, Rationalizing Denominators, and Simplification',
    slug: 'radicals-rationalizing-denominators',
    subject: 'math',
    pathway: 'foundation',
    module_id: '20000000-0000-0000-0000-000000000001',
    skill_id: '11000000-0000-0000-0000-000000000001',
    difficulty: 'easy',
    estimated_duration_minutes: 15,
    order_index: 15,
    summary: 'Simplify square roots, combine like radical terms, and rationalize surds in denominators.',
    content: {
      sections: [
        {
          title: '1. Factoring Out Perfect Squares',
          content: 'To simplify $\\sqrt{n}$, factor out the largest perfect square ($4, 9, 16, 25, 36, 49, 64, 81, 100$). Example: $\\sqrt{72} = \\sqrt{36 \\cdot 2} = 6\\sqrt{2}$.'
        },
        {
          title: '2. Combining Like Radicals',
          content: 'You can only add or subtract radicals with identical radicands: $3\\sqrt{5} + 7\\sqrt{5} = 10\\sqrt{5}$. But $3\\sqrt{2} + 2\\sqrt{3}$ cannot be combined further.'
        },
        {
          title: '3. Rationalizing Denominators with Conjugates',
          content: 'Single radical: $\\frac{5}{\\sqrt{3}} \\cdot \\frac{\\sqrt{3}}{\\sqrt{3}} = \\frac{5\\sqrt{3}}{3}$. Binomial radical denominator: multiply by the conjugate $(a - \\sqrt{b})$: $\\frac{2}{3 + \\sqrt{5}} \\cdot \\frac{3 - \\sqrt{5}}{3 - \\sqrt{5}} = \\frac{2(3-\\sqrt{5})}{9 - 5} = \\frac{3 - \\sqrt{5}}{2}$.'
        }
      ],
      key_takeaways: [
        'Always look for the largest perfect square factor',
        'Radicals act like variables when adding: only like terms combine',
        'Multiply numerator and denominator by conjugate (a - sqrt(b)) to eliminate radical from bottom'
      ]
    }
  },
  {
    title: 'Coordinate Midpoint, Distance, and Collinear Points',
    slug: 'coordinate-midpoint-distance-collinear',
    subject: 'math',
    pathway: 'foundation',
    module_id: '20000000-0000-0000-0000-000000000001',
    skill_id: '11000000-0000-0000-0000-000000000001',
    difficulty: 'easy',
    estimated_duration_minutes: 15,
    order_index: 16,
    summary: 'Calculate geometric midpoints, distances using Pythagorean logic, and check for collinearity.',
    content: {
      sections: [
        {
          title: '1. The Midpoint Formula: Average the Coordinates',
          content: 'Midpoint is simply the average of $x$ and average of $y$: $M = \\left( \\frac{x_1 + x_2}{2}, \\frac{y_1 + y_2}{2} \\right)$. If midpoint is given and you need an endpoint: Endpoint $x_2 = 2M_x - x_1$.'
        },
        {
          title: '2. Distance Formula: Just Pythagorean Theorem',
          content: '$d = \\sqrt{(x_2 - x_1)^2 + (y_2 - y_1)^2}$. Rather than memorizing the long formula, draw a right triangle where $\\Delta x$ is base and $\\Delta y$ is height: $d^2 = (\\Delta x)^2 + (\\Delta y)^2$.'
        },
        {
          title: '3. Checking Collinearity',
          content: 'Three points $A, B, C$ lie on the same straight line if and only if the slope between $A$ and $B$ equals the slope between $B$ and $C$: $m_{AB} = m_{BC}$.'
        }
      ],
      key_takeaways: [
        'Midpoint = average of the x-values, average of the y-values',
        'Distance is just Pythagorean theorem on the coordinate plane',
        'Points on the same line have identical slopes between all pairs'
      ]
    }
  },

  // --- READING & WRITING (14 lessons) ---
  {
    title: 'Apostrophes: Singular, Plural, and Its vs It\'s',
    slug: 'apostrophes-singular-plural-possessive',
    subject: 'reading_writing',
    pathway: 'foundation',
    module_id: '20000000-0000-0000-0000-000000000004',
    skill_id: '11000000-0000-0000-0000-000000000015',
    difficulty: 'easy',
    estimated_duration_minutes: 15,
    order_index: 17,
    summary: 'Never miss an apostrophe question: singular possessive, plural possessive, and contraction rules.',
    content: {
      sections: [
        {
          title: '1. Singular vs Plural Possessives',
          content: 'Singular noun possession: add "\'s" (the student\'s desk). Plural noun ending in s: add only an apostrophe after s (the students\' desks). Irregular plural not ending in s: add "\'s" (the children\'s toys, the women\'s coats).'
        },
        {
          title: '2. The Big Three: It\'s vs Its vs Its\'',
          content: '1) it\'s = contraction for "it is" or "it has". 2) its = possessive pronoun (belonging to it). 3) its\' = DOES NOT EXIST IN THE ENGLISH LANGUAGE! Never pick its\' on the SAT.'
        },
        {
          title: '3. The Substitution Test',
          content: 'Whenever you see it\'s or they\'re, replace it in the sentence with "it is" or "they are". If the sentence still makes grammatical sense, keep the apostrophe. If not, pick the possessive without the apostrophe (its, their).'
        }
      ],
      key_takeaways: [
        'its\' is always fake; eliminate it immediately',
        'it\'s = it is; its = possessive',
        'Plural nouns ending in s take an apostrophe at the very end: dogs\''
      ]
    }
  },
  {
    title: 'Subject-Verb Agreement: Cutting Out Prepositional Preposition Clutter',
    slug: 'subject-verb-agreement-prepositional-phrases',
    subject: 'reading_writing',
    pathway: 'foundation',
    module_id: '20000000-0000-0000-0000-000000000004',
    skill_id: '11000000-0000-0000-0000-000000000016',
    difficulty: 'easy',
    estimated_duration_minutes: 15,
    order_index: 18,
    summary: 'Identify the true grammatical subject by physically crossing out intervening prepositional phrases.',
    content: {
      sections: [
        {
          title: '1. The Golden Rule of Subject-Verb Agreement',
          content: 'A singular subject requires a singular verb (ends in -s, like "runs", "is", "has"). A plural subject requires a plural verb (no -s, like "run", "are", "have").'
        },
        {
          title: '2. The Prepositional Phrase Disguise Trap',
          content: 'The SAT inserts long prepositional phrases between the subject and the verb to trick your ear. Example: "The collection of rare postage stamps from European countries (is / are) valuable." Cross out "of rare postage stamps" and "from European countries". True subject is "The collection" (singular) -> IS valuable!'
        },
        {
          title: '3. Inverted Sentences',
          content: 'When sentences begin with a prepositional phrase, the subject comes AFTER the verb: "Behind the building (stands / stand) two delivery trucks." Subject is "two delivery trucks" (plural) -> STAND!'
        }
      ],
      key_takeaways: [
        'A noun inside a prepositional phrase (of, in, to, for, with) can NEVER be the subject',
        'Cross out descriptive clutter to isolate subject and verb',
        'Singular verbs end in "s" (he writes); plural verbs do not (they write)'
      ]
    }
  },
  {
    title: 'Pronoun-Antecedent Agreement and Ambiguous References',
    slug: 'pronoun-antecedent-agreement-ambiguity',
    subject: 'reading_writing',
    pathway: 'foundation',
    module_id: '20000000-0000-0000-0000-000000000004',
    skill_id: '11000000-0000-0000-0000-000000000016',
    difficulty: 'easy',
    estimated_duration_minutes: 15,
    order_index: 19,
    summary: 'Match pronouns to their antecedents in number and eliminate vague pronouns like "this" and "which".',
    content: {
      sections: [
        {
          title: '1. Number Agreement (Singular vs Plural)',
          content: 'A pronoun must match the noun it replaces: A singular noun takes "it", "he", or "she". A plural noun takes "they" or "them". A company, team, country, or committee is SINGULAR: "Apple released its (not their) new phone."'
        },
        {
          title: '2. The Ambiguous Pronoun Error',
          content: 'Every pronoun must clearly refer to exactly one specific antecedent. If a sentence mentions "Maria and Elena discussed her grades", whose grades? It is ambiguous! The SAT will correct this by replacing the pronoun with the specific noun: "Maria\'s grades".'
        },
        {
          title: '3. Bare Pronoun "This" at the Start of Sentences',
          content: 'On the SAT, starting a sentence with a bare "This shows..." is often considered informal or vague. The preferred answer supplies a clarifying noun: "This finding shows..." or "This disparity indicates...".'
        }
      ],
      key_takeaways: [
        'Collective nouns (jury, school, corporation) are singular -> use "it/its"',
        'If a pronoun could refer to more than one noun, replace it with the noun itself',
        'Check what noun the pronoun replaces before choosing singular or plural'
      ]
    }
  },
  {
    title: 'Nonessential Clauses and Parenthetical Punctuation',
    slug: 'nonessential-clauses-parenthetical-punctuation',
    subject: 'reading_writing',
    pathway: 'foundation',
    module_id: '20000000-0000-0000-0000-000000000004',
    skill_id: '11000000-0000-0000-0000-000000000015',
    difficulty: 'easy',
    estimated_duration_minutes: 15,
    order_index: 20,
    summary: 'Master matching pairs of commas, dashes, and parentheses around nonrestrictive elements.',
    content: {
      sections: [
        {
          title: '1. The Removal Test for Nonessential Information',
          content: 'A nonessential modifier provides extra description that can be completely lifted out of the sentence without changing its core grammatical structure or meaning. If removed, the sentence must still be a complete, coherent independent clause.'
        },
        {
          title: '2. Punctuation Matching Rule',
          content: 'A nonessential clause in the middle of a sentence MUST be framed by matching punctuation: two commas ( , ... , ) OR two dashes ( — ... — ) OR parentheses ( ( ... ) ). You CANNOT mix and match a comma with a dash!'
        },
        {
          title: '3. Essential Elements (No Commas)',
          content: 'If the information is essential to identify WHICH specific person or thing is meant, do NOT use commas: "The author Toni Morrison won the Nobel Prize." Since "Toni Morrison" identifies which author, no commas around her name.'
        }
      ],
      key_takeaways: [
        'Punctuation around nonessential clauses must match: comma with comma, dash with dash',
        'Cross out the bracketed information to verify the remaining sentence stands alone',
        'No commas before or after restrictive identifiers like specific titles or names'
      ]
    }
  },
  {
    title: 'Colons and Single Em-Dashes: Rules for Introducing Explanations',
    slug: 'colons-single-em-dashes-rules',
    subject: 'reading_writing',
    pathway: 'foundation',
    module_id: '20000000-0000-0000-0000-000000000004',
    skill_id: '11000000-0000-0000-0000-000000000015',
    difficulty: 'easy',
    estimated_duration_minutes: 15,
    order_index: 21,
    summary: 'Learn the strict independent clause requirement before a colon or single explanatory em-dash.',
    content: {
      sections: [
        {
          title: '1. The Mandatory Independent Clause Before a Colon',
          content: 'The #1 rule of the colon on the SAT: Everything BEFORE the colon MUST be a complete independent clause (capable of standing alone as a sentence). The information AFTER the colon can be a list, an explanation, a single word, or another clause.'
        },
        {
          title: '2. Single Em-Dash as a Colon Substitute',
          content: 'A single em-dash (—) can function exactly like a colon to create dramatic emphasis or introduce an explanation. Like a colon, it must be preceded by a complete independent clause.'
        },
        {
          title: '3. Forbidden Colon Patterns',
          content: 'Never put a colon after a verb: "The ingredients include: flour, sugar, and eggs" (INCORRECT). Never put a colon after "such as", "for example", or prepositions.'
        }
      ],
      key_takeaways: [
        'Before a colon or single dash, you MUST have a full independent sentence',
        'Never place a colon after "include", "such as", or a preposition',
        'What follows a colon explains, illustrates, or lists what was introduced before it'
      ]
    }
  },
  {
    title: 'Words in Context: Finding Contrast and Synonym Clues',
    slug: 'words-in-context-contrast-synonym-clues',
    subject: 'reading_writing',
    pathway: 'foundation',
    module_id: '20000000-0000-0000-0000-000000000004',
    skill_id: '11000000-0000-0000-0000-000000000011',
    difficulty: 'easy',
    estimated_duration_minutes: 15,
    order_index: 22,
    summary: 'Solve vocabulary questions by using text clues and predicting your own word before reading options.',
    content: {
      sections: [
        {
          title: '1. The Blank Guess Technique',
          content: 'Do NOT look at the 4 answer choices first! When reading the passage, cover the blank and read the surrounding text. Find the clue word or phrase that defines the blank. Fill in the blank with your own simple everyday word (e.g., "difficult", "rare", "clear").'
        },
        {
          title: '2. Contrast Clues (Pivot Words)',
          content: 'Words like "although", "whereas", "while", "unlike", and "despite" signal that the word in the blank is the OPPOSITE of another stated idea in the passage.'
        },
        {
          title: '3. Connotation: Positive, Negative, or Neutral',
          content: 'Determine the tone of the sentence. If the author is praising an artist\'s work, eliminate choices with negative connotations (like "ostentatious" or "redundant") immediately.'
        }
      ],
      key_takeaways: [
        'Predict your own simple word before looking at the choices',
        'Anchor your choice to a specific clue word in the text',
        'Filter choices by positive, negative, or neutral tone'
      ]
    }
  },
  {
    title: 'Central Idea and Main Purpose in Informational Texts',
    slug: 'central-idea-main-purpose-informational',
    subject: 'reading_writing',
    pathway: 'foundation',
    module_id: '20000000-0000-0000-0000-000000000004',
    skill_id: '11000000-0000-0000-0000-000000000009',
    difficulty: 'easy',
    estimated_duration_minutes: 15,
    order_index: 23,
    summary: 'Differentiate between the overall main idea and overly narrow supporting details.',
    content: {
      sections: [
        {
          title: '1. Main Idea vs Supporting Detail Trap',
          content: 'The most tempting wrong answer on "main idea" questions is a statement that is 100% TRUE according to the passage, but only covers a single sentence or supporting detail rather than the overarching thesis.'
        },
        {
          title: '2. The Thesis Location Rule',
          content: 'In Digital SAT short passages (25–150 words), the central claim or thesis almost always appears in the first sentence (introductory claim) or the final sentence (conclusion or synthesis).'
        },
        {
          title: '3. Purpose Verbs to Look For',
          content: 'Pay close attention to the verb in the answer choices: "critique", "advocate", "summarize", "reconcile", "illustrate". Ask yourself: Is the author trying to explain a phenomenon or argue for a change?'
        }
      ],
      key_takeaways: [
        'Do not pick a true statement that only describes a minor detail',
        'Check the first and last sentence of the passage for the thesis',
        'Ensure the active verb (describe, dispute, suggest) matches the author\'s tone'
      ]
    }
  },
  {
    title: 'Textual Evidence: Direct Claims and Quote Matching',
    slug: 'textual-evidence-direct-claims-quotes',
    subject: 'reading_writing',
    pathway: 'foundation',
    module_id: '20000000-0000-0000-0000-000000000004',
    skill_id: '11000000-0000-0000-0000-000000000009',
    difficulty: 'easy',
    estimated_duration_minutes: 15,
    order_index: 24,
    summary: 'Select quotation choices that directly substantiate an explicit academic hypothesis.',
    content: {
      sections: [
        {
          title: '1. The Specific Hypothesis Test',
          content: 'The question will state: "Which quotation most effectively illustrates the claim that [X]?" You must find the answer choice that directly proves [X], not just something generally related to the topic.'
        },
        {
          title: '2. Literary Quotation Questions',
          content: 'In literary passages, quotations often contain archaic language. Translate the quote into plain English: Who is doing what, and what emotion or trait is shown?'
        },
        {
          title: '3. Eliminating "Topic Drift" Distractors',
          content: 'Distractor choices will quote interesting lines from the poem or story that describe the setting or another character, but completely fail to address the specific claim in the prompt.'
        }
      ],
      key_takeaways: [
        'Re-read the exact claim in the question stem before evaluating quotes',
        'The correct quote directly substantiates the claim without requiring outside assumptions',
        'Reject quotes that merely mention the character or setting without proving the thesis'
      ]
    }
  },
  {
    title: 'Interpreting Graphs and Tables in Reading Modules',
    slug: 'interpreting-graphs-tables-reading-modules',
    subject: 'reading_writing',
    pathway: 'foundation',
    module_id: '20000000-0000-0000-0000-000000000004',
    skill_id: '11000000-0000-0000-0000-000000000009',
    difficulty: 'easy',
    estimated_duration_minutes: 15,
    order_index: 25,
    summary: 'Synthesize quantitative data from bar charts and tables with textual arguments.',
    content: {
      sections: [
        {
          title: '1. The Two-Step Verification Checklist',
          content: 'To be correct, an answer choice must satisfy TWO criteria: 1) It must be FACTUALLY ACCURATE according to the graph/table. 2) It must SUPPORT OR COMPLETE the author\'s argument in the passage. Many wrong choices have true graph data that is irrelevant to the argument!'
        },
        {
          title: '2. Read the Graph Labels First',
          content: 'Check the graph title, axis labels, units (thousands vs millions, percentages vs raw counts), and the legend before reading the answer choices.'
        },
        {
          title: '3. Identifying Relative Extremes',
          content: 'Look for the highest bar, lowest bar, steepest slope, or categories that cross over each other. SAT questions almost always center on these focal comparison points.'
        }
      ],
      key_takeaways: [
        'An answer must be BOTH true on the chart AND relevant to the text argument',
        'Always check the units on both axes (percentages vs dollars/counts)',
        'Look at the highest, lowest, or crossover data points'
      ]
    }
  },
  {
    title: 'Rhetorical Transitions: Cause and Effect Connectors',
    slug: 'rhetorical-transitions-cause-effect-connectors',
    subject: 'reading_writing',
    pathway: 'foundation',
    module_id: '20000000-0000-0000-0000-000000000004',
    skill_id: '11000000-0000-0000-0000-000000000013',
    difficulty: 'easy',
    estimated_duration_minutes: 15,
    order_index: 26,
    summary: 'Distinguish true cause-and-effect transitions (therefore, consequently) from simple continuation.',
    content: {
      sections: [
        {
          title: '1. The Cause -> Effect Test',
          content: 'Transitions like "Consequently", "Therefore", "As a result", and "Thus" require that Sentence 1 is the direct direct cause of Sentence 2. If Sentence 2 is just an additional fact, "therefore" is wrong!'
        },
        {
          title: '2. Addition vs Causation',
          content: 'If sentence A says "The bridge was built in 1920" and sentence B says "It spans 1,500 meters", this is ADDITION ("Furthermore"), NOT causation ("Therefore")!'
        },
        {
          title: '3. Twin Choices Elimination Trick',
          content: 'If both "Consequently" and "Therefore" are among the four choices, NEITHER CAN BE CORRECT! Since they are exact synonyms, having both means neither is the unique correct answer.'
        }
      ],
      key_takeaways: [
        'Causation words require that sentence 2 happened BECAUSE of sentence 1',
        'Synonymous answer choices eliminate each other',
        'Do not confuse providing more details (furthermore) with causing a result (therefore)'
      ]
    }
  },
  {
    title: 'Rhetorical Transitions: Contrast and Concession Words',
    slug: 'rhetorical-transitions-contrast-concession',
    subject: 'reading_writing',
    pathway: 'foundation',
    module_id: '20000000-0000-0000-0000-000000000004',
    skill_id: '11000000-0000-0000-0000-000000000013',
    difficulty: 'easy',
    estimated_duration_minutes: 15,
    order_index: 27,
    summary: 'Master contrast words: however, nonetheless, conversely, on the other hand, and in contrast.',
    content: {
      sections: [
        {
          title: '1. Pure Contrast vs Concession',
          content: 'Pure contrast ("In contrast", "Conversely") compares two opposite things. Concession ("However", "Nevertheless", "Still") acknowledges a surprising unexpected turn between two ideas.'
        },
        {
          title: '2. The Polarity Check (+ / -)',
          content: 'Assign a positive (+) or negative (-) vibe to both sentences. If Sentence 1 is positive and Sentence 2 is negative, you MUST use a contrast transition.'
        },
        {
          title: '3. "In fact" and "Indeed" Are NOT Contrast',
          content: 'Students often mistake "In fact" or "Indeed" for contrast. In reality, they are EMPHASIS words that double down on the preceding statement!'
        }
      ],
      key_takeaways: [
        'Contrast transitions link a positive idea to a negative idea (or vice versa)',
        'Nevertheless / Still = "in spite of what was just said"',
        '"In fact" is an intensifier, NOT a contrast word'
      ]
    }
  },
  {
    title: 'Rhetorical Synthesis: The Goal-Oriented Note Strategy',
    slug: 'rhetorical-synthesis-goal-oriented-strategy',
    subject: 'reading_writing',
    pathway: 'foundation',
    module_id: '20000000-0000-0000-0000-000000000004',
    skill_id: '11000000-0000-0000-0000-000000000014',
    difficulty: 'easy',
    estimated_duration_minutes: 15,
    order_index: 28,
    summary: 'Solve bullet-point student notes questions in under 45 seconds by focusing solely on the prompt goal.',
    content: {
      sections: [
        {
          title: '1. The Golden Rule: Read the Goal First!',
          content: 'DO NOT read the bullet points first! Scroll straight to the prompt question at the bottom: "The student wants to [accomplish a specific goal]. Which choice most effectively accomplishes this goal?"'
        },
        {
          title: '2. Common Goals on the Digital SAT',
          content: 'Common goals: 1) "Emphasize a similarity between X and Y" (Answer must mention both and say how they are alike). 2) "Introduce X to an unfamiliar audience" (Answer must state what X is, not just its accomplishments). 3) "Emphasize the study\'s methodology" (Answer must explain HOW the study was conducted).'
        },
        {
          title: '3. Filtering Without Reading the Notes',
          content: 'Most wrong choices are factually true according to the bullet points, but completely fail to fulfill the specific goal requested. If the goal is "contrast", eliminate choices that don\'t compare two things!'
        }
      ],
      key_takeaways: [
        'Read the goal sentence at the bottom before reading the bullets',
        'The correct answer directly achieves the specified goal',
        'Reject choices that state true facts from the bullets but miss the prompt objective'
      ]
    }
  },
  {
    title: 'Dangling and Misplaced Modifiers',
    slug: 'dangling-misplaced-modifiers',
    subject: 'reading_writing',
    pathway: 'foundation',
    module_id: '20000000-0000-0000-0000-000000000004',
    skill_id: '11000000-0000-0000-0000-000000000015',
    difficulty: 'easy',
    estimated_duration_minutes: 15,
    order_index: 29,
    summary: 'Ensure introductory descriptive clauses immediately touch the noun they actually describe.',
    content: {
      sections: [
        {
          title: '1. The Introductory Modifier Rule',
          content: 'When a sentence opens with a descriptive phrase followed by a comma, the noun IMMEDIATELY AFTER the comma MUST be the person or thing performing the action: "Walking into the room, the painting caught my eye" (INCORRECT - the painting was not walking into the room!). Correct: "Walking into the room, I noticed the painting."'
        },
        {
          title: '2. Passive Voice Traps',
          content: 'Watch out for introductory phrases followed by passive verbs: "Having finished the report, the computer was shut down by Sarah" (INCORRECT - the computer did not finish the report). Correct: "Having finished the report, Sarah shut down the computer."'
        },
        {
          title: '3. The Comma Touch Rule',
          content: 'Ask: "WHO is doing the action in the intro phrase?" That exact word MUST touch the comma.'
        }
      ],
      key_takeaways: [
        'The noun right after the comma must be the one performing the action',
        'Beware of inanimate objects "walking", "hoping", or "studying"',
        'Look for the real actor immediately following the introductory comma'
      ]
    }
  },
  {
    title: 'Parallel Structure in Lists and Comparisons',
    slug: 'parallel-structure-lists-comparisons',
    subject: 'reading_writing',
    pathway: 'foundation',
    module_id: '20000000-0000-0000-0000-000000000004',
    skill_id: '11000000-0000-0000-0000-000000000015',
    difficulty: 'easy',
    estimated_duration_minutes: 15,
    order_index: 30,
    summary: 'Balance grammatical forms across coordinating conjunctions, lists, and comparative structures.',
    content: {
      sections: [
        {
          title: '1. Parallelism in Lists',
          content: 'Items in a series must share the exact same grammatical pattern: "She likes hiking, swimming, and to ride bicycles" (INCORRECT). Correct: "She likes hiking, swimming, and biking" (all -ing gerunds).'
        },
        {
          title: '2. Parallelism in Comparisons',
          content: 'You can only compare like things with like things: "The climate of Florida is warmer than Alaska" (INCORRECT - comparing a climate to a state!). Correct: "The climate of Florida is warmer than that of Alaska" (or "than Alaska\'s climate").'
        },
        {
          title: '3. Correlative Conjunction Pairs',
          content: 'Paired conjunctions require identical structures following both halves: not only [X] but also [Y]; either [X] or [Y]; neither [X] nor [Y]; both [X] and [Y].'
        }
      ],
      key_takeaways: [
        'All items in a list must match in grammatical form (-ing, infinitive, noun)',
        'Compare apples to apples: use "that of" (singular) or "those of" (plural)',
        'Not only... but also must be followed by parallel phrasing'
      ]
    }
  }
];

