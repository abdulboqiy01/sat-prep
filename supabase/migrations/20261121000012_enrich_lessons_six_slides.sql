-- Migration 12: Enrich All SAT Lessons with 6-Slide Pedagogy & Homework (ДЗ)
-- Expands every lesson to 6 comprehensive slides:
-- 1. Introduction & Overview
-- 2. Core Concepts, Formulas & Rules
-- 3. Step-by-Step SAT Worked Example
-- 4. SAT Traps & Pro Shortcuts
-- 5. Homework & Practice Challenge (ДЗ с решениями)
-- 6. Summary, Key Takeaways & Mini-Quiz Checkpoint

-- Lesson 1: Solving Single-Variable Linear Equations
UPDATE public.lessons
SET content = jsonb_build_object(
    'sections', jsonb_build_array(
        jsonb_build_object(
            'title', '1. Анатомия линейного уравнения в Digital SAT',
            'subtitle', 'Фундаментальная структура и симметричные преобразования',
            'badge', '📘 Введение',
            'content', 'Линейное уравнение с одной переменной — это фундамент математического блока Digital SAT. Любое такое уравнение можно привести к виду ax + b = c. Симметричные операции: любое действие, совершаемое с левой частью, обязательно применяется к правой. При раскрытии скобок p(qx + r) = pqx + pr всегда внимательно следите за знаком минус: -(3x - 5) = -3x + 5.'
        ),
        jsonb_build_object(
            'title', '2. Три типа решений: формулы и критерии College Board',
            'subtitle', 'Как мгновенно определить количество решений без полного решения',
            'badge', '📐 Теория и формулы',
            'content', 'Для уравнения вида ax + b = cx + d: (1) Одно решение, если a != c (прямые пересекаются в 1 точке); (2) Нет решений (No solution), если a = c, но b != d (параллельные прямые с одинаковым наклоном, но разными y-перехватами); (3) Бесконечно много решений (Identity), если a = c и b = d (обе части тождественны, прямые совпадают).'
        ),
        jsonb_build_object(
            'title', '3. Пошаговый разбор реального задания SAT',
            'subtitle', 'Алгоритм быстрого решения задачи уровня 650–750 за 30 секунд',
            'badge', '🎯 Пример SAT',
            'content', 'Пример: For what value of constant k does 3(2x - 4) + 5 = kx - 7 have infinitely many solutions? Шаг 1: Раскрываем скобки: 6x - 12 + 5 = kx - 7. Шаг 2: Приводим подобные: 6x - 7 = kx - 7. Шаг 3: Так как свободные члены равны (-7 = -7), приравниваем коэффициенты при x: k = 6. Ответ: k = 6.'
        ),
        jsonb_build_object(
            'title', '4. Ловушки College Board и экспресс-лайфхаки',
            'subtitle', 'Чего опасаться и как использовать встроенный калькулятор Desmos',
            'badge', '⚠️ Ловушки и хаки',
            'content', 'В 35% задач College Board спрашивает не x, а выражение (например, 2x - 3 или 4x + 1). Если 3x + 2 = 14, то 3x = 12. Не делите на 3, если вопрос просит 6x — просто умножьте на 2: 6x = 24! В Desmos можно ввести левую часть как y = 3(2x - 4) + 5, правую как y = kx - 7 и найти ползунком k точку совпадения прямых.'
        ),
        jsonb_build_object(
            'title', '5. Домашнее задание для закрепления (Homework Practice)',
            'subtitle', 'Решите задачи самостоятельно перед переходом к Mini-Quiz',
            'badge', '📝 Домашнее задание',
            'isHomework', true,
            'content', 'Выполните 3 практические задачи в черновике перед сдачей теста.',
            'homeworkTasks', jsonb_build_array(
                jsonb_build_object('id', 1, 'question', 'If 4(x - 3) + 2 = ax + b has infinitely many real solutions, what is the value of a + b?', 'hint', 'Раскройте скобки слева: 4x - 10.', 'solution', '4x - 12 + 2 = 4x - 10. Приравниваем: a = 4, b = -10. a + b = -6.', 'correctAnswer', '-6'),
                jsonb_build_object('id', 2, 'question', 'For what value of m does the equation 7x - 9 = mx + 4 have NO solution?', 'hint', 'Коэффициенты при x должны совпадать: 7 = m.', 'solution', 'Прямые параллельны при m = 7.', 'correctAnswer', '7'),
                jsonb_build_object('id', 3, 'question', 'If 2(3x + 1) - 5 = 15, what is the value of 6x - 3?', 'hint', 'Заметьте: 2 * 3x = 6x.', 'solution', '6x + 2 - 5 = 15 => 6x - 3 = 15. Ответ уже равен 15!', 'correctAnswer', '15')
            )
        ),
        jsonb_build_object(
            'title', '6. Итоги урока и готовность к Mini-Quiz',
            'subtitle', 'Финальный чек-лист и запуск проверочного тестирования',
            'badge', '🏆 Итоги и Mini-Quiz',
            'content', 'Вы освоили тему линейных уравнений. Переходите к Mini-Quiz, чтобы закрепить прогресс в Roadmap!'
        )
    ),
    'key_takeaways', jsonb_build_array(
        'Всегда раскрывайте скобки и группируйте подобные слагаемые',
        'Бесконечно много решений: коэффициенты при x равны И свободные константы равны',
        'Нет решений: коэффициенты при x равны, но свободные константы различны',
        'Внимательно читайте вопрос: часто спрашивается значение выражения, а не x'
    )
)
WHERE slug = 'solving-single-variable-linear-equations';
