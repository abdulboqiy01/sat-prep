/**
 * Rich 6-Slide Curriculum Data for SAT Prep Lessons.
 * Guarantees every lesson has 5-6 comprehensive pedagogical slides:
 * 1. Introduction & Overview
 * 2. Core Concepts & Formulas/Rules
 * 3. Step-by-Step SAT Worked Example
 * 4. SAT Traps & Pro Shortcuts
 * 5. Homework & Practice Challenge (Домашнее задание с решениями)
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
        title: '1. Анатомия линейного уравнения в Digital SAT',
        subtitle: 'Фундаментальная структура и симметричные преобразования',
        badge: '📘 Введение',
        content: `Линейное уравнение с одной переменной — это фундамент математического блока Digital SAT. Любое такое уравнение можно привести к каноническому виду:
$$ax + b = c$$

### Главные принципы решения:
1. **Симметричность операций**: любое действие (прибавление, вычитание, умножение, деление), совершаемое с левой частью, **обязательно** применяется к правой части.
2. **Раскрытие скобок (Distributive Property)**:
$$p(qx + r) = pqx + pr$$
*Частая ошибка*: не забывайте умножать знак минус на каждый член внутри скобок, например: $-(3x - 5) = -3x + 5$.
3. **Группировка подобных слагаемых**: соберите все члены с переменной $x$ на одной стороне, а все числовые константы — на противоположной:
$$(a - c)x = d - b$$`,
      },
      {
        title: '2. Три типа решений: формулы и критерии College Board',
        subtitle: 'Как мгновенно определить количество решений без полного решения',
        badge: '📐 Теория и формулы',
        content: `На реальном SAT постоянно встречаются вопросы о количестве решений уравнения вида $ax + b = cx + d$. Запомните эти 3 фундаментальных правила:

| Тип решения | Критерий коэффициентов | Геометрический смысл (Графики) |
|---|---|---|
| **Ровно 1 решение** | $a \\neq c$ | Прямые с разными наклонами пересекаются в 1 точке |
| **Нет решений (No solution)** | $a = c$, но $b \\neq d$ | Параллельные прямые с одинаковым наклоном, но разными $y$-перехватами (никогда не пересекутся) |
| **Бесконечно много решений (Identity)** | $a = c$ и $b = d$ | Обе части тождественны; прямые полностью совпадают |

> **SAT Pro-Tip**: Если в вопросе написано *"The equation has infinitely many solutions"*, сразу раскройте обе части и приравняйте коэффициент перед $x$ к коэффициенту перед $x$, а свободный член — к свободному члену!`,
      },
      {
        title: '3. Пошаговый разбор реального задания SAT',
        subtitle: 'Алгоритм быстрого решения задачи уровня 650–750 за 30 секунд',
        badge: '🎯 Пример SAT',
        content: `### Условие задачи (Digital SAT Hard Module):
> For what value of constant $k$ does the equation below have **infinitely many solutions**?
$$3(2x - 4) + 5 = kx - 7$$

### Пошаговое решение:
1. **Шаг 1: Раскрываем скобки в левой части**:
$$6x - 12 + 5 = kx - 7$$
2. **Шаг 2: Приводим подобные слагаемые**:
$$6x - 7 = kx - 7$$
3. **Шаг 3: Применяем правило бесконечного числа решений ($a = c$ и $b = d$)**:
   - Свободные члены уже равны: $-7 = -7$.
   - Приравниваем коэффициенты при $x$:
$$6 = k \\implies k = 6$$

**Правильный ответ**: $k = 6$.
*Время решения по данной стратегии: не более 20 секунд!*`,
      },
      {
        title: '4. Ловушки College Board и экспресс-лайфхаки',
        subtitle: 'Чего опасаться и как использовать встроенный калькулятор Desmos',
        badge: '⚠️ Ловушки и хаки',
        content: `### 🚨 Главная ловушка SAT: Вопрос не про $x$!
В 35% задач College Board спрашивает **не значение $x$**, а выражение от него:
- *"What is the value of $2x - 3$?"*
- *"What is the value of $4x + 1$?"*

**Пример**:
Если $3x + 2 = 14$, то $3x = 12$. Не спешите делить на 3, если вопрос просит найти $6x$!
$$6x = 2 \\times (3x) = 2 \\times 12 = 24$$
*Всегда подчеркивайте в черновике, что именно требует найти вопрос!*

### 💡 Лайфхак Desmos на Digital SAT:
Если уравнение сложное, введите левую часть как $y = 3(2x - 4) + 5$, а правую как $y = kx - 7$. Добавьте ползунок (slider) для $k$. Чтобы прямые совпали, $k$ должно равняться 6!`,
      },
      {
        title: '5. Домашнее задание для закрепления (Homework Practice)',
        subtitle: 'Решите задачи самостоятельно перед переходом к Mini-Quiz',
        badge: '📝 Домашнее задание',
        isHomework: true,
        content: `Выполните эти 3 практические задачи в черновике. Когда решите, нажмите **«Показать решение»**, чтобы сверить свой ход мысли с идеальным SAT-алгоритмом.`,
        homeworkTasks: [
          {
            id: 1,
            question: 'If $4(x - 3) + 2 = ax + b$ has infinitely many real solutions for all values of $x$, what is the value of $a + b$?',
            hint: 'Раскройте скобки слева и приравняйте $a$ к коэффициенту перед $x$, а $b$ — к константе.',
            solution: 'Раскрываем левую часть: $4x - 12 + 2 = 4x - 10$. Так как решений бесконечно много: $ax + b = 4x - 10$, следовательно $a = 4$ и $b = -10$. Итого: $a + b = 4 + (-10) = -6$.',
            correctAnswer: '-6',
          },
          {
            id: 2,
            question: 'For what value of $m$ does the equation $7x - 9 = mx + 4$ have NO solution?',
            hint: 'Чтобы не было решений, прямые должны быть параллельны (коэффициенты при $x$ равны, а константы различны).',
            solution: 'Для отсутствия решений необходимо, чтобы коэффициент при $x$ слева равнялся коэффициенту при $x$ справа ($7 = m$), при этом константы $-9 \\neq 4$ уже различны. Значит, $m = 7$.',
            correctAnswer: '7',
          },
          {
            id: 3,
            question: 'If $2(3x + 1) - 5 = 15$, what is the value of $6x - 3$?',
            hint: 'Заметьте, что $2 \\times 3x = 6x$. Не вычисляйте отдельный $x$!',
            solution: 'Раскроем скобки: $6x + 2 - 5 = 15 \\implies 6x - 3 = 15$. Вопрос просит найти именно значение выражения $6x - 3$, значит ответ уже готов: 15!',
            correctAnswer: '15',
          },
        ],
      },
      {
        title: '6. Итоги урока и готовность к Mini-Quiz',
        subtitle: 'Финальный чек-лист и запуск проверочного тестирования',
        badge: '🏆 Итоги и Mini-Quiz',
        content: `Поздравляем! Вы прошли полный разбор темы **Solving Single-Variable Linear Equations**.

### Чек-лист готовности к Mini-Quiz:
- [x] Вы умеете раскрывать скобки и безошибочно учитывать знаки.
- [x] Вы знаете условия для 1 решения, отсутствия решений и $\\infty$ решений.
- [x] Вы внимательно читаете, что именно спрашивает задача (значение $x$ или выражение).
- [x] Вы успешно разобрали задачи домашнего задания.

*Нажмите кнопку ниже, чтобы начать проверочный Mini-Quiz и закрепить навык в вашем учебном плане!*`,
      },
    ],
    key_takeaways: [
      'Всегда раскрывайте скобки и группируйте подобные слагаемые перед анализом',
      'Бесконечно много решений: коэффициенты при x равны И свободные константы равны',
      'Нет решений: коэффициенты при x равны, но свободные константы различны',
      'Внимательно читайте вопрос: часто спрашивается значение выражения, а не x',
    ],
  },

  // =========================================================================
  // LESSON 2: Systems of Linear Equations in SAT Contexts
  // =========================================================================
  'systems-linear-equations-sat-contexts': {
    sections: [
      {
        title: '1. Системы линейных уравнений в Digital SAT',
        subtitle: 'Два метода решения: сложение (Elimination) и подстановка (Substitution)',
        badge: '📘 Введение',
        content: `Системы уравнений на SAT моделируют как абстрактные алгебраические задачи, так и прикладные текстовые сценарии (стоимость билетов, смешивание растворов, дистанция и скорость).

### Выбор оптимального метода:
- **Метод сложения/вычитания (Elimination)**: идеален, когда оба уравнения записаны в стандартном виде $Ax + By = C$. Вы умножаете одно или оба уравнения на множители, чтобы коэффициенты при одной из переменных стали противоположными.
- **Метод подстановки (Substitution)**: идеален, когда в одном из уравнений переменная уже выражена (например, $y = 2x - 3$) или имеет коэффициент $1$ или $-1$.`,
      },
      {
        title: '2. Геометрическая интерпретация систем',
        subtitle: 'Пересекающиеся, параллельные и совпадающие прямые',
        badge: '📐 Теория и формулы',
        content: `Решение системы — это точка пересечения $(x, y)$ двух прямых на координатной плоскости.

Для системы:
$$\\begin{cases} a_1 x + b_1 y = c_1 \\\\ a_2 x + b_2 y = c_2 \\end{cases}$$

1. **Одно решение**: наклоны прямых различны ($m_1 \\neq m_2$).
$$\\frac{a_1}{a_2} \\neq \\frac{b_1}{b_2}$$
2. **Нет решений (No solution)**: прямые параллельны (наклоны равны, но $y$-intercepts разные).
$$\\frac{a_1}{a_2} = \\frac{b_1}{b_2} \\neq \\frac{c_1}{c_2}$$
3. **Бесконечно много решений**: прямые совпадают.
$$\\frac{a_1}{a_2} = \\frac{b_1}{b_2} = \\frac{c_1}{c_2}$$`,
      },
      {
        title: '3. Пошаговый разбор реального задания SAT',
        subtitle: 'Задача на отсутствие решений в системе с параметром',
        badge: '🎯 Пример SAT',
        content: `### Условие задачи:
> In the system of equations below, $k$ is a constant. If the system has **no solution**, what is the value of $k$?
$$\\begin{cases} 3x - 2y = 8 \\\\ kx - 6y = 15 \\end{cases}$$

### Пошаговое решение:
1. **Шаг 1: Запишем условие отсутствия решений**:
Коэффициенты при $x$ и $y$ должны быть пропорциональны:
$$\\frac{3}{k} = \\frac{-2}{-6}$$
2. **Шаг 2: Упрощаем отношение по $y$**:
$$\\frac{-2}{-6} = \\frac{1}{3}$$
3. **Шаг 3: Находим $k$ методом перекрестного умножения**:
$$\\frac{3}{k} = \\frac{1}{3} \\implies k = 3 \\times 3 = 9$$
4. **Шаг 4: Проверяем отношение констант**:
$$\\frac{8}{15} \\neq \\frac{1}{3}$$ — условие отсутствия решений полностью соблюдено!

**Ответ**: $k = 9$.`,
      },
      {
        title: '4. Экспресс-хак SAT: Прямое сложение/вычитание',
        subtitle: 'Как сэкономить 1 минуту, когда просят найти сумму переменных',
        badge: '⚠️ Ловушки и хаки',
        content: `### 🚨 Не находите $x$ и $y$ по отдельности!
Когда вопрос спрашивает:
- *"What is the value of $x + y$?"*
- *"What is the value of $x - y$?"*
- *"What is the value of $5x + 5y$?"*

Почти всегда достаточно **просто сложить или вычесть два уравнения напрямую**!

**Пример**:
$$\\begin{cases} 4x + 3y = 19 \\\\ 2x + 3y = 11 \\end{cases}$$
Вычитаем второе уравнение из первого:
$$(4x - 2x) + (3y - 3y) = 19 - 11 \\implies 2x = 8 \\implies x = 4$$
Если вопрос просит $x + y$: подставляем $x = 4 \\implies 2(4) + 3y = 11 \\implies 3y = 3 \\implies y = 1$. Итого: $x + y = 5$.`,
      },
      {
        title: '5. Домашнее задание для закрепления (Homework Practice)',
        subtitle: 'Практические задания для самостоятельной проработки',
        badge: '📝 Домашнее задание',
        isHomework: true,
        content: `Решите 3 задачи в черновике, затем раскройте подсказки и решения.`,
        homeworkTasks: [
          {
            id: 1,
            question: 'If $3x + 5y = 20$ and $2x + 4y = 14$, what is the value of $x + y$?',
            hint: 'Попробуйте вычесть второе уравнение из первого напрямую!',
            solution: 'Вычитаем почленно: $(3x - 2x) + (5y - 4y) = 20 - 14 \\implies x + y = 6$. За одну секунду получен ответ без нахождения отдельных $x$ и $y$!',
            correctAnswer: '6',
          },
          {
            id: 2,
            question: 'For what value of $p$ will the system $\\begin{cases} px + 4y = 12 \\\\ 3x + 2y = 7 \\end{cases}$ have NO solution?',
            hint: 'Коэффициенты при $x$ и $y$ должны образовать равные отношения: $p / 3 = 4 / 2$.',
            solution: '$p / 3 = 4 / 2 = 2 \\implies p = 2 \\times 3 = 6$. При этом $12 / 7 \\neq 2$, поэтому прямые строго параллельны и решений нет.',
            correctAnswer: '6',
          },
          {
            id: 3,
            question: 'A coffee shop sells small cups for $3 each and large cups for $5 each. If 40 cups were sold for a total of $150, how many large cups were sold?',
            hint: 'Пусть $s$ — маленькие, $l$ — большие. $s + l = 40$ и $3s + 5l = 150$. Выразите $s = 40 - l$.',
            solution: 'Подставим $s = 40 - l$ во второе: $3(40 - l) + 5l = 150 \\implies 120 + 2l = 150 \\implies 2l = 30 \\implies l = 15$. Было продано 15 больших чашек.',
            correctAnswer: '15',
          },
        ],
      },
      {
        title: '6. Итоги урока и готовность к Mini-Quiz',
        subtitle: 'Закрепление систем уравнений и переход к тестированию',
        badge: '🏆 Итоги и Mini-Quiz',
        content: `Отличная работа! Вы освоили все ключевые приемы решения систем линейных уравнений для Digital SAT.

### Чек-лист:
- [x] Вы умеете выбирать между Elimination и Substitution.
- [x] Вы помните условие параллельности: отношения коэффициентов при $x$ и $y$ равны.
- [x] Вы ищете прямой путь к $x + y$ через сложение уравнений.
- [x] Вы проверили себя в домашнем задании.

*Нажмите кнопку ниже, чтобы подтвердить мастерство в Mini-Quiz!*`,
      },
    ],
    key_takeaways: [
      'Для отсутствия решений наклоны должны совпадать: a1/a2 = b1/b2 != c1/c2',
      'Если вопрос спрашивает (x + y), проверьте прямое сложение или вычитание уравнений',
      'В Desmos точки пересечения систем находятся в один клик мыши',
    ],
  },

  // =========================================================================
  // LESSON 3: Quadratic Vertex Form & Optimization
  // =========================================================================
  'quadratic-vertex-form-optimization': {
    sections: [
      {
        title: '1. Три формы квадратичной функции на SAT',
        subtitle: 'Standard Form, Factored Form и Vertex Form',
        badge: '📘 Введение',
        content: `Квадратичные функции встречаются на SAT в виде 3 эквивалентных алгебраических записей. Каждая форма мгновенно раскрывает определенное геометрическое свойство параболы:

1. **Standard Form**: $y = ax^2 + bx + c$
   - Показывает $y$-перехват в точке $(0, c)$.
   - Знак $a$: $a > 0$ — ветви вверх (минимум), $a < 0$ — ветви вниз (максимум).
2. **Factored (Intercept) Form**: $y = a(x - r_1)(x - r_2)$
   - Мгновенно показывает нули функции (корни): $(r_1, 0)$ и $(r_2, 0)$.
3. **Vertex Form**: $y = a(x - h)^2 + k$
   - Напрямую отображает координаты вершины параболы $(h, k)$ без каких-либо вычислений!`,
      },
      {
        title: '2. Вершина и оптимизация (Max / Min)',
        subtitle: 'Формула вершины и ось симметрии',
        badge: '📐 Теория и формулы',
        content: `Когда в текстовой задаче SAT встречаются слова:
- *"maximum height"* (максимальная высота)
- *"minimum cost"* (минимальная стоимость)
- *"maximum profit"* (максимальная прибыль)
- *"peak value"* (пиковое значение)

Это **всегда** задача на нахождение вершины параболы $(h, k)$!

### Формулы вершины из стандартного вида $y = ax^2 + bx + c$:
$$h = -\\frac{b}{2a}$$
$$k = f(h) = a(h)^2 + b(h) + c$$

> **Важно**: $h$ — это входная величина (например, время или цена товара, при которой достигается оптимум).
> $k$ — это сам результат оптимума (максимальная высота или максимальная прибыль).`,
      },
      {
        title: '3. Пошаговый разбор реального задания SAT',
        subtitle: 'Разбор задачи на моделирование траектории броска',
        badge: '🎯 Пример SAT',
        content: `### Условие задачи:
> The height $h$, in meters, of a projectile $t$ seconds after launch is modeled by the function:
$$h(t) = -5t^2 + 30t + 2$$
> What is the **maximum height**, in meters, reached by the projectile?

### Пошаговое решение:
1. **Шаг 1: Идентифицируем коэффициенты**:
$$a = -5, \\quad b = 30, \\quad c = 2$$
2. **Шаг 2: Находим время $t$, когда достигается максимум**:
$$t = -\\frac{b}{2a} = -\\frac{30}{2(-5)} = -\\frac{30}{-10} = 3 \\text{ секунды}$$
3. **Шаг 3: Находим саму максимальную высоту $h(3)$**:
$$h(3) = -5(3)^2 + 30(3) + 2 = -5(9) + 90 + 2 = -45 + 90 + 2 = 47 \\text{ метров}$$

**Ответ**: $47$.`,
      },
      {
        title: '4. Ловушки формы вершины и ось симметрии',
        subtitle: 'Знак минус в $(x - h)$ и поиск середины между корнями',
        badge: '⚠️ Ловушки и хаки',
        content: `### 🚨 Ошибка со знаком в $(x - h)^2$:
В уравнении $y = 3(x - 4)^2 + 5$, вершина находится в точке **$(+4, 5)$**, а НЕ $(-4, 5)$!
В уравнении $y = 2(x + 6)^2 - 1$, вершина находится в точке **$(-6, -1)$**.

### 💡 Свойство симметрии параболы:
Ось симметрии параболы всегда проходит ровно посередине между двумя корнями:
$$h = \\frac{r_1 + r_2}{2}$$
Если парабола пересекает ось $x$ в точках $x = 2$ и $x = 8$, ее вершина **гарантированно** имеет $x$-координату:
$$h = \\frac{2 + 8}{2} = 5$$`,
      },
      {
        title: '5. Домашнее задание для закрепления (Homework Practice)',
        subtitle: 'Практические задачи на квадратичную оптимизацию',
        badge: '📝 Домашнее задание',
        isHomework: true,
        content: `Выполните 3 упражнения в тетради и проверьте решения.`,
        homeworkTasks: [
          {
            id: 1,
            question: 'What is the vertex of the parabola given by $y = -2(x + 5)^2 + 18$?',
            hint: 'Сравните с формулой $y = a(x - h)^2 + k$. Помните, что $(x + 5) = (x - (-5))$.',
            solution: 'Из вида $y = a(x - h)^2 + k$: $h = -5$, $k = 18$. Вершина находится в точке $(-5, 18)$. Так как $a = -2 < 0$, это точка максимума.',
            correctAnswer: '(-5, 18)',
          },
          {
            id: 2,
            question: 'A parabola has zeros at $x = -3$ and $x = 11$. What is the equation of its axis of symmetry?',
            hint: 'Ось симметрии находится посередине между корнями: $x = (r_1 + r_2) / 2$.',
            solution: '$x = (-3 + 11) / 2 = 8 / 2 = 4$. Уравнение оси симметрии: $x = 4$.',
            correctAnswer: 'x = 4',
          },
          {
            id: 3,
            question: 'The profit $P(x) = -x^2 + 16x - 20$ in thousands of dollars depends on price $x$. What price $x$ maximizes the profit?',
            hint: 'Вопрос спрашивает цену $x$, а не саму прибыль! Найдите $h = -b / (2a)$.',
            solution: '$h = -16 / (2 \\times (-1)) = -16 / (-2) = 8$. Цена, максимизирующая прибыль, равна 8 долларам.',
            correctAnswer: '8',
          },
        ],
      },
      {
        title: '6. Итоги урока и готовность к Mini-Quiz',
        subtitle: 'Квадратичные функции освоены — пора на Mini-Quiz!',
        badge: '🏆 Итоги и Mini-Quiz',
        content: `Поздравляем! Теперь задачи на вершины параболы и нахождение экстремумов будут приносить вам легкие баллы.

### Ключевые правила:
- [x] Форма вершины $y = a(x - h)^2 + k$ дает точку $(h, k)$ без счета.
- [x] Формула вершины из стандартного вида: $h = -b / (2a)$.
- [x] Ось симметрии делит расстояние между корнями пополам.
- [x] Вы успешно завершили домашнее задание.

*Запустите Mini-Quiz, чтобы зафиксировать высокий результат!*`,
      },
    ],
    key_takeaways: [
      'Vertex form: y = a(x - h)^2 + k сразу дает вершину (h, k)',
      'x-координата вершины всегда вычисляется как h = -b / (2a)',
      'Ось симметрии параболы проходит строго посередине между корнями',
    ],
  },

  // =========================================================================
  // LESSON 4: Mastering Sentence Boundaries & Comma Splices (R&W)
  // =========================================================================
  'mastering-sentence-boundaries-comma-splices': {
    sections: [
      {
        title: '1. Анатомия предложения в SAT Reading & Writing',
        subtitle: 'Независимые и зависимые предикативные части (Clauses)',
        badge: '📘 Введение',
        content: `Модуль грамматики Digital SAT строго проверяет знание структуры предложения. Каждое английское предложение строится вокруг понятий **Independent Clause** (независимое) и **Dependent Clause** (зависимое).

### Independent Clause (Полноценное предложение):
Должно удовлетворять трем строгим критериям:
1. Иметь подлежащее (**Subject**).
2. Иметь личный спрягаемый глагол (**Finite Verb**).
3. Выражать **законченную мысль** (Complete Thought) и мочь стоять отдельно.

*Пример*: *The astronomer calibrated the telescope.* (Полное предложение).

### Dependent Clause (Зависимое предложение):
Начинается с подчинительного союза (*because, although, since, whereas, while, if*) или относительного местоимения (*which, that, who*). Не может стоять отдельно!`,
      },
      {
        title: '2. Четыре законных способа объединения предложений',
        subtitle: 'Главная грамматическая таблица Digital SAT',
        badge: '📐 Теория и правила',
        content: `Два независимых предложения (**Independent Clause + Independent Clause**) можно соединить **ТОЛЬКО** четырьмя способами:

1. **Точка (Period)**:
   > *Clause.* **[ . ]** *Clause.*
2. **Точка с запятой (Semicolon)**:
   > *Clause; Clause.*
   *(На SAT точка и точка с запятой грамматически абсолютно эквивалентны!)*
3. **Запятая + сочинительный союз FANBOYS**:
   > *Clause,* **and/but/for/nor/or/so/yet** *Clause.*
4. **Двоеточие или тире (Colon / Dash)**:
   > *Clause:* *Clause.* (когда вторая часть поясняет или раскрывает первую).

> **ГЛАВНЫЙ ГРЕХ SAT — COMMA SPLICE**:
> Нельзя соединять два независимых предложения одной лишь запятой:
> ❌ *The galaxy is expanding, scientists detected new radiation.*
> ✔️ *The galaxy is expanding; scientists detected new radiation.*`,
      },
      {
        title: '3. Пошаговый разбор реального задания SAT Writing',
        subtitle: 'Анализ типичного вопроса Module 1/2',
        badge: '🎯 Пример SAT',
        content: `### Условие задания:
> Marine biologist Sylvia Earle has spent thousands of hours underwater exploring ocean ecosystems ______ she has advocated tirelessly for the establishment of protected marine reserves.
>
> Which choice completes the text so that it conforms to the conventions of Standard English?
> - **A)** ecosystems, furthermore,
> - **B)** ecosystems; furthermore,
> - **C)** ecosystems,
> - **D)** ecosystems furthermore

### Анализ структуры:
- Часть 1: *"Marine biologist Sylvia Earle has spent thousands of hours..."* — **Independent Clause**.
- Часть 2: *"she has advocated tirelessly..."* — **Independent Clause**.
- Соединять их просто запятой (A, C) — грубый Comma Splice, так как *furthermore* — наречие (**Conjunctive Adverb**), а не союз FANBOYS!
- Правильный разделитель между двумя полными предложениями — точка с запятой с последующей запятой после наречия.

**Правильный ответ**: **B**.`,
      },
      {
        title: '4. Ловушки transition words и слов-обманщиков',
        subtitle: 'Почему however, therefore и moreover не являются союзами',
        badge: '⚠️ Ловушки и хаки',
        content: `### 🚨 Слова-обманщики (Conjunctive Adverbs):
College Board обожает ловить студентов на таких словах:
*however, therefore, moreover, furthermore, consequently, nevertheless, nonetheless*.

Они выглядят как союзы, но грамматически являются **наречиями**!
Они **НЕ МОГУТ** соединять предложения с помощью одной запятой:
- ❌ *It was raining, however, we went hiking.* (Comma Splice!)
- ✔️ *It was raining; however, we went hiking.*
- ✔️ *It was raining. However, we went hiking.*

### 💡 Лайфхак исключения ответов на SAT:
Если в одном варианте ответа стоит точка, а в другом варианте на том же самом месте стоит точка с запятой (и текст вокруг одинаков) — **вычеркивайте оба варианта сразу!** Они грамматически идентичны, а правильный ответ может быть только один!`,
      },
      {
        title: '5. Домашнее задание для закрепления (Homework Practice)',
        subtitle: 'Пунктуационные упражнения для самостоятельной проверки',
        badge: '📝 Домашнее задание',
        isHomework: true,
        content: `Определите правильный способ пунктуации в трех заданиях, затем проверьте ответы.`,
        homeworkTasks: [
          {
            id: 1,
            question: 'Identify the error: "The telescope captured distant galaxies, they formed shortly after the Big Bang."',
            hint: 'Посчитайте количество независимых предложений. Как они разделены?',
            solution: 'Это классический Comma Splice: "The telescope captured distant galaxies" (полное) и "they formed shortly after the Big Bang" (полное) разделены лишь запятой. Исправление: заменить запятую на точку с запятой (;) или поставить запятую с союзом and.',
            correctAnswer: 'Comma splice',
          },
          {
            id: 2,
            question: 'Which punctuation mark can be placed between two independent clauses when the second clause directly explains the first?',
            hint: 'Двоеточие используется для пояснения или раскрытия предшествующей мысли.',
            solution: 'Двоеточие (Colon :) или тире (Dash —). Перед двоеточием обязательно должно стоять полное независимое предложение.',
            correctAnswer: 'Colon (:)',
          },
          {
            id: 3,
            question: 'Can you use a semicolon before the conjunction "and" if both sides are simple independent clauses without internal commas?',
            hint: 'Стандартный шаблон: запятая + FANBOYS. Точка с запятой используется сама по себе без союза.',
            solution: 'Нет, для обычных предложений используется запятая + and. Точка с запятой ставится без союза: Clause; clause.',
            correctAnswer: 'No',
          },
        ],
      },
      {
        title: '6. Итоги урока и готовность к Mini-Quiz',
        subtitle: 'Пунктуация границ предложений освоена!',
        badge: '🏆 Итоги и Mini-Quiz',
        content: `Отличная работа! Теперь пунктуация Digital SAT Sentence Boundaries станет для вас источником легких 100% правильных ответов.

### Чек-лист:
- [x] Вы безошибочно находите Independent Clauses.
- [x] Вы никогда не допустите Comma Splice.
- [x] Вы помните, что *however* и *therefore* требуют точки с запятой перед собой.
- [x] Вы отработали домашнее задание.

*Запустите Mini-Quiz, чтобы подтвердить свой высокий уровень!*`,
      },
    ],
    key_takeaways: [
      'Два независимых предложения разделяются точкой, точкой с запятой или запятой + FANBOYS',
      'Запятая сама по себе между двумя полноценными предложениями — грубая ошибка (Comma Splice)',
      'Слова however, furthermore, therefore требуют точки с запятой перед собой (; however,)',
    ],
  },

  // =========================================================================
  // LESSON 5: Rhetorical Transitions & Logical Flow (R&W)
  // =========================================================================
  'rhetorical-transitions-logical-flow': {
    sections: [
      {
        title: '1. Логические переходы в SAT Reading & Writing',
        subtitle: 'Четыре семантические категории связующих слов',
        badge: '📘 Введение',
        content: `Вопросы на переходы (**Transitions**) тестируют ваше понимание логической связи между соседними предложениями.

Каждое связующее слово относится к одной из 4 четких категорий:

1. **Контраст (Contrast / Opposition)**:
   *however, nevertheless, nonetheless, on the other hand, conversely, regardless*.
2. **Причинно-следственная связь (Cause & Effect)**:
   *therefore, consequently, thus, as a result, accordingly, hence*.
3. **Добавление и продолжение (Addition / Continuation)**:
   *furthermore, moreover, in addition, additionally, also*.
4. **Иллюстрация и конкретизация (Exemplification / Restatement)**:
   *for example, for instance, specifically, in other words, that is*.`,
      },
      {
        title: '2. Стратегия «Слепого чтения» (Blind Reading)',
        subtitle: 'Как находить верный ответ без взгляда на варианты',
        badge: '📐 Теория и правила',
        content: `### Алгоритм Blind Reading в 3 шага:
1. **Шаг 1: Мысленно вычеркните подчеркнутое слово.**
   Никогда не читайте варианты ответа первыми! Они сбивают вас с толку и звучат «красиво».
2. **Шаг 2: Прочитайте Предложение 1 и Предложение 2 независимо.**
   Сформулируйте суть каждого предложения своими словами в 3-4 словах.
3. **Шаг 3: Задайте себе вопрос о взаимосвязи:**
   - Предложение 2 противоречит первому? $\\implies$ **Контраст**.
   - Предложение 2 является результатом первого? $\\implies$ **Следствие**.
   - Предложение 2 приводит пример или подробность? $\\implies$ **Иллюстрация**.
   - Предложение 2 просто добавляет новый факт? $\\implies$ **Добавление**.
4. **Шаг 4: Найдите в вариантах слово, совпадающее с вашей предсказанной категорией.**`,
      },
      {
        title: '3. Пошаговый разбор сложного задания SAT',
        subtitle: 'Разбор нюанса между Cause & Effect и Addition',
        badge: '🎯 Пример SAT',
        content: `### Условие задания:
> In the late 19th century, urban expansion drastically reduced natural wetlands around Chicago. ______ local engineers developed an extensive stormwater canal network to prevent chronic municipal flooding.
>
> Which choice completes the text with the most logical transition?
> - **A)** In contrast,
> - **B)** Consequently,
> - **C)** Furthermore,
> - **D)** For instance,

### Анализ логики:
- **Предложение 1**: Заболоченные территории осушили (проблема/причина).
- **Предложение 2**: Инженеры построили каналы для защиты от наводнений (прямая реакция / следствие проблемы).
- Здесь нет противоречия (вычеркиваем A).
- Здесь не просто новый факт (вычеркиваем C).
- Это прямое следствие: *«Вследствие этого / В результате»*.

**Правильный ответ**: **B (Consequently)**.`,
      },
      {
        title: '4. Хак исключения синонимичных вариантов',
        subtitle: 'Золотое правило College Board: синонимы убивают друг друга',
        badge: '⚠️ Ловушки и хаки',
        content: `### 🚨 Правило синонимов (Synonym Elimination):
Если среди 4 вариантов ответов присутствуют **два слова из одной и той же логической категории** (например, два слова добавления или два слова контраста без смысловых нюансов) — **вычеркивайте оба сразу!**

*Например*:
- Вариант A: *Furthermore* (Добавление)
- Вариант B: *Moreover* (Добавление)
- Вариант C: *Therefore* (Следствие)
- Вариант D: *Specifically* (Иллюстрация)

Так как *furthermore* и *moreover* выполняют абсолютно одинаковую грамматическую функцию, правильным ответом не может быть ни один из них! Ответ обязан быть либо C, либо D.`,
      },
      {
        title: '5. Домашнее задание для закрепления (Homework Practice)',
        subtitle: 'Практические задания на определение логических связей',
        badge: '📝 Домашнее задание',
        isHomework: true,
        content: `Определите верный логический переход для предложений и проверьте свои ответы.`,
        homeworkTasks: [
          {
            id: 1,
            question: 'Sentence 1: "The rare mineral was believed to exist only in volcanic craters." Sentence 2: "Geologists recently discovered deposits deep within sedimentary limestone." Which category fits?',
            hint: 'Считалось, что только в вулканах $\\leftrightarrow$ нашли в известняке. Это совпадение или противоречие?',
            solution: 'Это прямой смысловой контраст (Contrast). Подходят transitions вроде however, nevertheless, yet.',
            correctAnswer: 'Contrast (However)',
          },
          {
            id: 2,
            question: 'If choice A is "Consequently" and choice B is "Therefore", what should you do if the context requires a Cause-and-Effect transition?',
            hint: 'Внимательно перечитайте! Если оба слова подходят идеально, возможно, логическая связь на самом деле не Cause-and-Effect, а Exemplification?',
            solution: 'College Board никогда не делает два идентичных синонима в правильных ответах. Если оба слова означают одно и то же, логика вопроса наверняка другая (например, пояснение или контраст).',
            correctAnswer: 'Re-evaluate the relationship',
          },
          {
            id: 3,
            question: 'Which transition indicates that the second sentence narrows down a general statement to a concrete case: "Moreover" or "Specifically"?',
            hint: 'Сужение от общего к частному — это конкретизация.',
            solution: '"Specifically" (или For example) указывает на конкретизацию общего утверждения.',
            correctAnswer: 'Specifically',
          },
        ],
      },
      {
        title: '6. Итоги урока и готовность к Mini-Quiz',
        subtitle: 'Тема логических переходов усвоена на 100%!',
        badge: '🏆 Итоги и Mini-Quiz',
        content: `Превосходно! Вы овладели самым надежным инструментом для решения Transition Questions на Digital SAT.

### Чек-лист:
- [x] Вы используете Blind Reading: сначала предсказание, потом варианты.
- [x] Вы четко различаете Contrast, Cause, Addition и Exemplification.
- [x] Вы используете правило взаимного уничтожения синонимов.
- [x] Вы закрепили навык на домашнем задании.

*Нажмите кнопку ниже, чтобы пройти Mini-Quiz!*`,
      },
    ],
    key_takeaways: [
      'Всегда определяйте логическую категорию до чтения вариантов ответа',
      'Синонимичные варианты из одной категории (furthermore и moreover) взаимно исключаются',
      'Опирайтесь на смысл высказывания, а не на то, какое слово звучит привычнее',
    ],
  },

  // =========================================================================
  // LESSON 6: Cross-Text Connections & Paired Passages (R&W)
  // =========================================================================
  'cross-text-connections-paired-passages': {
    sections: [
      {
        title: '1. Спаренные тексты в Digital SAT Reading',
        subtitle: 'Структура Text 1 и Text 2 и типы взаимоотношений',
        badge: '📘 Введение',
        content: `Задания на **Cross-Text Connections** представляют собой два коротких академических отрывка (Text 1 и Text 2), посвященных одному научному эксперименту, историческому событию или литературному спору.

### 3 основных типа взаимоотношений между авторами:
1. **Квалификация / Уточнение (Nuance / Qualification)**:
   Автор Текста 2 согласен с общим тезисом Текста 1, но указывает на неучтенную переменную, погрешность в методологии или ограниченность выборки.
2. **Прямое опровержение (Rebuttal / Disagreement)**:
   Автор Текста 2 приводит новые эмпирические данные, опровергающие гипотезу Текста 1.
3. **Расширение и дополнение (Extension / Alternative Explanation)**:
   Автор Текста 2 предлагает другое объяснение тому же явлению.`,
      },
      {
        title: '2. Стратегия чтения и картирования аргументов',
        subtitle: 'Как читать два текста без потери времени',
        badge: '📐 Теория и правила',
        content: `### Двухэтапный алгоритм:
1. **Чтение Текста 1**:
   - Найдите главное утверждение (**Claim**) автора Текста 1.
   - Сформулируйте его в уме: *«Автор 1 считает, что X вызывает Y»*.
2. **Чтение Текста 2**:
   - Найдите точное место, где автор Текста 2 упоминает объект спора.
   - Задайте вопрос: **«Что автор Текста 2 сказал бы автору Текста 1?»**
   - *«Да, но только если...»* (Квалификация)
   - *«Нет, потому что новые данные показывают обратное»* (Опровержение).

> **Золотое правило**: Вопрос почти всегда звучит так: *«Based on the texts, how would the author of Text 2 respond to the claim made in Text 1?»* Ищите точку зрения именно **Второго автора**!`,
      },
      {
        title: '3. Пошаговый разбор задания Cross-Text Connections',
        subtitle: 'Разбор задания на научную дискуссию',
        badge: '🎯 Пример SAT',
        content: `### Условие:
> **Text 1**: Paleontologists long assumed that Spinosaurus was a terrestrial hunter that occasionally waded in shallows, citing its dense bone structure as inconsistent with sustained underwater locomotion.
>
> **Text 2**: Recent biomechanical modeling of Spinosaurus tail vertebrae demonstrates an undulating, paddle-like structure capable of generating substantial aquatic thrust. Researchers conclude that bone density alone cannot disprove active swimming behavior.
>
> *Based on the texts, how would the author of Text 2 respond to the assumption described in Text 1?*

### Анализ:
- **Текст 1**: Считали, что не плавал, опираясь на плотность костей.
- **Текст 2**: Хвост создавал мощную тягу в воде. Вывод: одна лишь плотность костей недостаточна для опровержения плавания.
- **Реакция Автора 2**: Автор 2 утверждает, что вывод Текста 1 основан на неполных данных и игнорирует функцию хвоста.

**Правильный ответ**: Подчеркивает, что опора исключительно на плотность костей игнорирует ключевые двигательные адаптации.`,
      },
      {
        title: '4. Ловушки крайних формулировок и подмены понятий',
        subtitle: 'Опасные слова always, completely и distorted claims',
        badge: '⚠️ Ловушки и хаки',
        content: `### 🚨 Остерегайтесь радикальных слов:
Академический язык в тестах College Board всегда взвешен и осторожен. Варианты ответов, содержащие крайности, почти всегда **НЕВЕРНЫ**:
- ❌ *Text 2 author completely rejects all findings of Text 1.*
- ❌ *Text 1 author entirely misunderstood the concept.*
- ❌ *The phenomenon is always caused by X.*

Правильные варианты обычно используют умеренные академические формулировки:
- ✔️ *Suggests that the conclusion may be premature...*
- ✔️ *Notes an overlooked factor...*
- ✔️ *Qualifies the scope of the claim...*`,
      },
      {
        title: '5. Домашнее задание для закрепления (Homework Practice)',
        subtitle: 'Практические задания на сопоставление аргументов',
        badge: '📝 Домашнее задание',
        isHomework: true,
        content: `Проанализируйте взаимосвязи и проверьте решения.`,
        homeworkTasks: [
          {
            id: 1,
            question: 'If Text 1 argues that a tax cuts always stimulate job growth, and Text 2 shows it only occurred in 2 out of 10 studied regions, how does Text 2 relate to Text 1?',
            hint: 'Текст 2 полностью отрицает рост или показывает, что он происходит не всегда?',
            solution: 'Текст 2 уточняет (qualifies) границы применимости тезиса, показывая, что эффект не является универсальным.',
            correctAnswer: 'Qualifies / Limits the scope',
          },
          {
            id: 2,
            question: 'Why are choices containing "completely disproves" or "wholly dismisses" typically incorrect on SAT Reading?',
            hint: 'Подумайте об академической культуре вежливости и доказательности.',
            solution: 'В научном дискурсе ученые редко полностью отвергают всю работу коллег; чаще они критикуют отдельную предпосылку или метод.',
            correctAnswer: 'Extreme language is rarely supported by academic texts',
          },
          {
            id: 3,
            question: 'When asked "How would the author of Text 1 respond to Text 2?", whose perspective must you adopt?',
            hint: 'Обратите внимание на имя первого автора в вопросе!',
            solution: 'Внимательно смотрите на порядок: вопрос просит реакцию Автора 1 на Автора 2! Не перепутайте авторов.',
            correctAnswer: 'Author of Text 1',
          },
        ],
      },
      {
        title: '6. Итоги урока и готовность к Mini-Quiz',
        subtitle: 'Парные тексты и аргументация пройдены!',
        badge: '🏆 Итоги и Mini-Quiz',
        content: `Поздравляем! Вы полностью изучили тему Cross-Text Connections.

### Чек-лист:
- [x] Вы определяете главные тезисы Текста 1 и Текста 2.
- [x] Вы находите точную точку соприкосновения аргументов.
- [x] Вы остерегаетесь экстремальных вариантов со словами *completely* и *never*.
- [x] Вы успешно выполнили домашнее задание.

*Запустите Mini-Quiz, чтобы завершить урок в вашем учебном плане!*`,
      },
    ],
    key_takeaways: [
      'Определите тезис Текста 1 и отношение Текста 2 к этому тезису',
      'Избегайте экстремальных вариантов ответов со словами completely или wholly',
      'Внимательно читайте, чью именно реакцию спрашивает задание (Автора 1 или Автора 2)',
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
        'Внимательно разбирайте каждое условие задачи на Digital SAT',
        'Используйте методы исключения неверных вариантов ответа',
        'Закрепляйте пройденный материал регулярным повторением',
      ];

  const slides: LessonSectionSlide[] = [];

  // Slide 1: Introduction
  slides.push({
    title: rawSections[0]?.title || `1. Введение: ${lessonTitle}`,
    subtitle: 'Фундаментальная структура и ключевые понятия темы',
    badge: '📘 Введение',
    content: rawSections[0]?.content || `В этом уроке мы разберем ключевые аспекты темы **${lessonTitle}**, часто встречающейся в модулях Digital SAT ${subject === 'math' ? 'Math' : 'Reading & Writing'}. Освоение этих принципов позволит вам стабильно экономить время и безошибочно решать задачи любого уровня сложности.`,
  });

  // Slide 2: Core Concepts & Formulas
  slides.push({
    title: rawSections[1]?.title || `2. Теоретическая база и правила SAT`,
    subtitle: 'Базовые алгоритмы и формулы для решения',
    badge: '📐 Теория и правила',
    content: rawSections[1]?.content || `При работе с темой **${lessonTitle}** важно обращать внимание на следующие закономерности:\n\n1. Анализ условия и выделение ключевых переменных.\n2. Применение утвержденных алгоритмов и формул College Board.\n3. Проверка промежуточных результатов на реалистичность.`,
  });

  // Slide 3: Worked Example
  slides.push({
    title: rawSections[2]?.title || `3. Пошаговый разбор типичного задания SAT`,
    subtitle: 'Практический анализ задачи из реального теста',
    badge: '🎯 Пример SAT',
    content: rawSections[2]?.content || `### Пример экзаменационного задания по теме:
> Изучите условие вопроса и примените изученную теоретическую модель для поэтапного решения.

1. **Шаг 1**: Прочитайте вопрос до конца и определите, какая величина является целевой.
2. **Шаг 2**: Преобразуйте исходные данные в стандартный вид.
3. **Шаг 3**: Проверьте, можно ли применить экспресс-метод или сокращение вычислений.`,
  });

  // Slide 4: Traps & Strategy
  slides.push({
    title: `4. Типичные ловушки College Board и стратегия времени`,
    subtitle: 'Как не потерять баллы на дистракторах',
    badge: '⚠️ Ловушки и хаки',
    content: `### 🚨 На что обращать внимание на экзамене:
- **Ловушка поспешности**: составители теста часто помещают в варианты ответа результат промежуточного действия.
- **Метод исключения**: если сомневаетесь между вариантами, сначала отбросьте те, которые явно нарушают математические или грамматические законы.
- **Тайм-менеджмент**: тратьте не более 60 секунд на первичный анализ вопроса. Если решение не очевидно, отметьте флажком и вернитесь позже.`,
  });

  // Slide 5: Homework & Practice Challenge (ДЗ)
  slides.push({
    title: `5. Домашнее задание для закрепления (Homework Practice)`,
    subtitle: 'Решите задачи перед переходом к Mini-Quiz',
    badge: '📝 Домашнее задание',
    isHomework: true,
    content: `Закрепите материал урока, решив предложенные практические упражнения в черновике. Затем нажмите кнопку решения для сверки.`,
    homeworkTasks: [
      {
        id: 1,
        question: `Практическое упражнение 1 по теме "${lessonTitle}": примените основные правила урока для нахождения верного решения.`,
        hint: 'Опирайтесь на теоретические шаги, разобранные на слайдах 1 и 2.',
        solution: 'Пошаговый разбор показывает, что последовательное применение правила исключает ложные предположения и ведет к точному ответу.',
        correctAnswer: 'Проверено',
      },
      {
        id: 2,
        question: `Практическое упражнение 2: проверьте граничные условия и убедитесь, что вы нашли именно то, что требует вопрос.`,
        hint: 'Обратите внимание на слайд 4 с разбором типичных ловушек.',
        solution: 'Внимательное чтение вопроса предотвращает выбор промежуточного значения.',
        correctAnswer: 'Проверено',
      },
    ],
  });

  // Slide 6: Summary & Mini-Quiz Checkpoint
  slides.push({
    title: `6. Итоги урока и переход к Mini-Quiz`,
    subtitle: 'Финальная готовность к проверке знаний',
    badge: '🏆 Итоги и Mini-Quiz',
    content: `Поздравляем! Вы завершили все теоретические и практические этапы урока **${lessonTitle}**.

### Готовность к тестированию:
- [x] Вы изучили фундаментальную концепцию.
- [x] Вы разобрали пример решения и ознакомились с типичными ловушками.
- [x] Вы выполнили домашнее задание.

*Теперь вы полностью готовы продемонстрировать отличный результат в Mini-Quiz!*`,
  });

  return {
    sections: slides,
    key_takeaways: rawTakeaways,
  };
}

