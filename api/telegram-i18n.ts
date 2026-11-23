export type BotLanguage = 'en' | 'ru' | 'uz';

export interface BotStrings {
  langCode: BotLanguage;
  langName: string;
  langFlag: string;

  // Commands & Buttons
  btnDashboard: string;
  btnStartLearning: string;
  btnContinueStudying: string;
  btnConnectSettings: string;
  btnOpenLesson: string;
  btnViewRoadmap: string;
  btnSettings: string;
  btnAITutor: string;
  btnChangeLang: string;
  btnLearnVocab: string;
  btnMyProgress: string;

  // Messages
  welcomeLinked: (name: string, target: number, pathway: string) => string;
  welcomeBack: (name: string) => string;
  welcomeUnlinked: string;
  invalidToken: string;
  tokenUsed: string;
  tokenExpired: string;
  statusNotLinked: string;
  statusReport: (name: string, target: number, pathway: string, nextLesson: string) => string;
  settingsNotLinked: string;
  settingsReport: (enabled: boolean, time: string, timezone: string, days: string, advanceMins: number, langName: string) => string;
  disconnectSuccess: string;
  helpMessage: string;
  chooseLanguage: string;
  languageChanged: string;

  // Reminders
  reminderHeader: string;
  reminderGreeting: (name: string, timeRemaining: string) => string;
  reminderGreetingLate: (name: string, lessonTime: string) => string;
  reminderTopic: (title: string) => string;
  reminderEstTime: (mins: number) => string;
  reminderVocabDue: (count: number) => string;
  reminderFooter: string;
  timeRemainingNow: (time: string) => string;
  timeRemainingMins: (mins: number, time: string) => string;
  timeRemainingBefore: (mins: number, time: string) => string;
  timeRemainingScheduled: (time: string) => string;
}

export const I18N: Record<BotLanguage, BotStrings> = {
  en: {
    langCode: 'en',
    langName: 'English',
    langFlag: '🇬🇧',

    btnDashboard: '🚀 Open SATPrep Dashboard',
    btnStartLearning: '📚 Start Learning',
    btnContinueStudying: '📚 Continue Studying',
    btnConnectSettings: '🌐 Connect on SATPrep',
    btnOpenLesson: '📖 Open Current Lesson',
    btnViewRoadmap: '🗺️ View Roadmap',
    btnSettings: '⚙️ Edit Reminder Settings',
    btnAITutor: '🤖 Open AI Tutor',
    btnChangeLang: '🌐 Change Language',
    btnLearnVocab: '🔤 Learn SAT Words',
    btnMyProgress: '📊 My Progress',

    welcomeLinked: (name, target, pathway) =>
      `🎉 *Welcome to SATPrep, ${name}!* 🎓\n\n` +
      `Your Telegram account is now successfully linked to your SATPrep dashboard!\n\n` +
      `📋 *Your Profile Overview:*\n` +
      `• Target Score: *${target}*\n` +
      `• Pathway: *${pathway}*\n` +
      `• Reminders: *Active*\n` +
      `• Language: *🇬🇧 English*\n\n` +
      `You will receive personalized daily study schedules with direct lesson links! 🚀\n\n` +
      `💡 *Commands:*\n` +
      `/status - Check your next SAT lesson & roadmap\n` +
      `/settings - View reminder schedule & timezone\n` +
      `/language - Switch language (English / Русский / O'zbekcha)\n` +
      `/disconnect - Unlink this Telegram account\n` +
      `/help - View command list`,

    welcomeBack: (name) =>
      `👋 *Welcome back, ${name}!*\n\n` +
      `Your account is actively linked to SATPrep.\n\n` +
      `Use /status to see your next scheduled study lesson, /language to change language, or /settings to view your schedule.`,

    welcomeUnlinked:
      `👋 *Welcome to SATPrep Reminder Bot!* 🎯\n\n` +
      `To connect your account and receive study reminders:\n\n` +
      `1. Sign in to your SATPrep account.\n` +
      `2. Go to **Settings**.\n` +
      `3. Click **Connect Telegram**.\n\n` +
      `Use /language anytime to change your language.`,

    invalidToken:
      `⚠️ *Invalid Linking Link*\n\nThis connection link was not found. Please log in to SATPrep, go to **Settings**, and generate a fresh link.`,

    tokenUsed:
      `⚠️ *Token Already Used*\n\nThis single-use code has already been redeemed. If you need to re-link, click "Connect Telegram" in Settings.`,

    tokenExpired:
      `⏳ *Token Expired*\n\nLinking tokens expire after 10 minutes for your security. Please click "Connect Telegram" again in SATPrep.`,

    statusNotLinked:
      `⚠️ You haven't linked a SATPrep account yet.\n\nPlease log in at your SATPrep Settings page and click **Connect Telegram**.`,

    statusReport: (name, target, pathway, nextLesson) =>
      `📊 *Your SAT Study Status*\n\n` +
      `👤 Student: *${name}*\n` +
      `🎯 Target Score: *${target}*\n` +
      `🛣️ Pathway: *${pathway}*\n\n` +
      `📖 *Next Up on Your Roadmap:*\n${nextLesson}\n\n` +
      `Keep up the momentum towards your dream score! 🚀`,

    settingsNotLinked:
      `⚠️ You haven't linked a SATPrep account yet.\nPlease visit SATPrep Settings to connect.`,

    settingsReport: (enabled, time, timezone, days, advanceMins, langName) =>
      `⚙️ *Your Reminder Settings*\n\n` +
      `• Reminders: *${enabled ? '✅ Enabled' : '⏸️ Paused'}*\n` +
      `• Preferred Time: *${time}*\n` +
      `• Timezone: *${timezone}*\n` +
      `• Study Days: *${days}*\n` +
      `• Advance Notice: *${advanceMins} minutes*\n` +
      `• Language: *${langName}*\n\n` +
      `To change language, send /language.\nTo modify other settings, visit your SATPrep web settings:`,

    disconnectSuccess:
      `👋 *Telegram Disconnected*\n\n` +
      `Your Telegram account has been unlinked from SATPrep. You will no longer receive study reminders here.\n\n` +
      `You can reconnect at any time from your SATPrep Settings page.`,

    helpMessage:
      `🤖 *SATPrep Reminder Bot Commands*\n\n` +
      `• /status - Check your current roadmap & next study lesson\n` +
      `• /language - Switch language (English, Русский, O'zbekcha)\n` +
      `• /settings - View your reminder schedule & notification days\n` +
      `• /disconnect - Unlink this Telegram account\n` +
      `• /help - Display this command overview\n\n` +
      `Need help with SAT concepts? Chat with your Socratic AI Tutor on the platform! 🦉`,

    chooseLanguage:
      `🌐 *Choose your preferred language / Tilni tanlang / Выберите язык:*\n\n` +
      `Select which language the bot should use to communicate with you:`,

    languageChanged:
      `✅ *Language updated successfully!* 🇬🇧\n\nThe bot will now send all reminders, notifications, and commands in **English**.`,

    reminderHeader: `⏰ *SAT Study Reminder!* 📖`,
    reminderGreeting: (name, timeRemaining) => `Hello, ${name}! Your SAT study session begins ${timeRemaining}.`,
    reminderGreetingLate: (name, lessonTime) => `Hello, ${name}! Reminder for today's SAT study session (scheduled for ${lessonTime}).`,
    reminderTopic: (title) => `🎯 *Today's Lesson:* ${title}`,
    reminderEstTime: (mins) => `⏱ *Estimated Time:* ${mins} minutes`,
    reminderVocabDue: (count) => `🔤 *SRS Vocabulary:* ${count} words are due for review today!`,
    reminderFooter: `Dedicate time today to stay consistent and reach your target score! 💪`,
    timeRemainingNow: (time) => `*right now* (at *${time}*)`,
    timeRemainingMins: (mins, time) => `in *${mins} mins* (at *${time}*)`,
    timeRemainingBefore: (mins, time) => `in *${mins} minutes* (at *${time}*)`,
    timeRemainingScheduled: (time) => `today (scheduled for *${time}*)`,
  },

  ru: {
    langCode: 'ru',
    langName: 'Русский',
    langFlag: '🇷🇺',

    btnDashboard: '🚀 Открыть SATPrep Dashboard',
    btnStartLearning: '📚 Начать обучение',
    btnContinueStudying: '📚 Продолжить занятия',
    btnConnectSettings: '🌐 Подключить на сайте SATPrep',
    btnOpenLesson: '📖 Открыть текущий урок',
    btnViewRoadmap: '🗺️ Мой Roadmap',
    btnSettings: '⚙️ Настройки напоминаний',
    btnAITutor: '🤖 Открыть ИИ-тьютора',
    btnChangeLang: '🌐 Сменить язык',
    btnLearnVocab: '🔤 Учить слова SAT',
    btnMyProgress: '📊 Мой прогресс',

    welcomeLinked: (name, target, pathway) =>
      `🎉 *Добро пожаловать в SATPrep, ${name}!* 🎓\n\n` +
      `Ваш Telegram-аккаунт успешно подключен к платформе SATPrep!\n\n` +
      `📋 *Ваш профиль:*\n` +
      `• Целевой балл: *${target}*\n` +
      `• Уровень: *${pathway}*\n` +
      `• Напоминания: *Активны*\n` +
      `• Язык: *🇷🇺 Русский*\n\n` +
      `Бот будет присылать персональные напоминания о занятиях со ссылками на уроки! 🚀\n\n` +
      `💡 *Команды бота:*\n` +
      `/status - Узнать следующий запланированный урок\n` +
      `/settings - Расписание и часовой пояс\n` +
      `/language - Сменить язык (English / Русский / O'zbekcha)\n` +
      `/disconnect - Отключить этот Telegram-аккаунт\n` +
      `/help - Список всех команд`,

    welcomeBack: (name) =>
      `👋 *С возвращением, ${name}!*\n\n` +
      `Ваш аккаунт активно подключен к SATPrep.\n\n` +
      `Используйте /status для просмотра следующего урока, /language для смены языка или /settings для просмотра расписания.`,

    welcomeUnlinked:
      `👋 *Добро пожаловать в бот напоминаний SATPrep!* 🎯\n\n` +
      `Чтобы подключить аккаунт и получать напоминания об уроках:\n\n` +
      `1. Войдите в свой аккаунт на SATPrep.\n` +
      `2. Перейдите в **Settings** (Настройки).\n` +
      `3. Нажмите кнопку **Connect Telegram**.\n\n` +
      `Используйте команду /language для выбора языка бота в любое время.`,

    invalidToken:
      `⚠️ *Недействительная ссылка подключения*\n\nСсылка устарела или не найдена. Пожалуйста, откройте **Settings** на сайте SATPrep и нажмите «Connect Telegram» снова.`,

    tokenUsed:
      `⚠️ *Код уже использован*\n\nЭтот одноразовый код уже был активирован. Для повторного подключения сгенерируйте новую ссылку в Settings.`,

    tokenExpired:
      `⏳ *Срок действия ссылки истек*\n\nВ целях безопасности ссылка действует 10 минут. Нажмите «Connect Telegram» в настройках SATPrep еще раз.`,

    statusNotLinked:
      `⚠️ Вы еще не подключили аккаунт SATPrep.\n\nПожалуйста, перейдите в Settings на сайте SATPrep и нажмите **Connect Telegram**.`,

    statusReport: (name, target, pathway, nextLesson) =>
      `📊 *Ваш статус обучения SAT*\n\n` +
      `👤 Студент: *${name}*\n` +
      `🎯 Целевой балл: *${target}*\n` +
      `🛣️ Уровень: *${pathway}*\n\n` +
      `📖 *Следующий урок по плану:*\n${nextLesson}\n\n` +
      `Двигайтесь вперед к целевому баллу! 🚀`,

    settingsNotLinked:
      `⚠️ Ваш аккаунт SATPrep еще не подключен.\nПожалуйста, откройте Settings на сайте SATPrep.`,

    settingsReport: (enabled, time, timezone, days, advanceMins, langName) =>
      `⚙️ *Ваши настройки напоминаний*\n\n` +
      `• Напоминания: *${enabled ? '✅ Включены' : '⏸️ Приостановлены'}*\n` +
      `• Время урока: *${time}*\n` +
      `• Часовой пояс: *${timezone}*\n` +
      `• Дни занятий: *${days}*\n` +
      `• Оповещение за: *${advanceMins} минут*\n` +
      `• Язык: *${langName}*\n\n` +
      `Чтобы сменить язык, отправьте команду /language.\nДля изменения времени перейдите в веб-настройки:`,

    disconnectSuccess:
      `👋 *Telegram отключен*\n\n` +
      `Ваш Telegram-аккаунт успешно отвязан от SATPrep. Вы больше не будете получать здесь напоминания.\n\n` +
      `Вы можете подключиться заново в любой момент на странице Settings.`,

    helpMessage:
      `🤖 *Команды бота SATPrep*\n\n` +
      `• /status - Текущий план и следующий урок\n` +
      `• /language - Сменить язык бота (English, Русский, O'zbekcha)\n` +
      `• /settings - Расписание и дни уведомлений\n` +
      `• /disconnect - Отвязать Telegram-аккаунт\n` +
      `• /help - Показать эту справку\n\n` +
      `Нужна помощь по заданиям SAT? На платформе вас ждет персональный ИИ-тьютор! 🦉`,

    chooseLanguage:
      `🌐 *Выберите язык бота / Choose language / Tilni tanlang:*\n\n` +
      `Выберите удобный язык для сообщений и ежедневных напоминаний:`,

    languageChanged:
      `✅ *Язык успешно изменен!* 🇷🇺\n\nТеперь все сообщения, напоминания и команды бота будут приходить на **русском языке**.`,

    reminderHeader: `⏰ *Напоминание о занятии SAT!* 📖`,
    reminderGreeting: (name, timeRemaining) => `Привет, ${name}! Твой урок SAT начнется ${timeRemaining}.`,
    reminderGreetingLate: (name, lessonTime) => `Привет, ${name}! Напоминаем о сегодняшнем занятии SAT (запланировано на ${lessonTime}).`,
    reminderTopic: (title) => `🎯 *Тема сегодняшнего урока:* ${title}`,
    reminderEstTime: (mins) => `⏱ *Ориентировочное время:* ${mins} минут`,
    reminderVocabDue: (count) => `🔤 *Слов на повторение (SRS):* ${count} слов ждут тебя!`,
    reminderFooter: `Удели время сегодня, чтобы стабильно набрать свой целевой балл! 💪`,
    timeRemainingNow: (time) => `*прямо сейчас* (в *${time}*)`,
    timeRemainingMins: (mins, time) => `через *${mins} мин.* (в *${time}*)`,
    timeRemainingBefore: (mins, time) => `через *${mins} минут* (в *${time}*)`,
    timeRemainingScheduled: (time) => `на сегодня (запланировано на *${time}*)`,
  },

  uz: {
    langCode: 'uz',
    langName: "O'zbekcha",
    langFlag: '🇺🇿',

    btnDashboard: '🚀 SATPrep Dashboardni ochish',
    btnStartLearning: "📚 O'qishni boshlash",
    btnContinueStudying: "📚 O'qishni davom ettirish",
    btnConnectSettings: '🌐 SATPrep saytida ulash',
    btnOpenLesson: '📖 Joriy darsni ochish',
    btnViewRoadmap: '🗺️ O‘quv rejam (Roadmap)',
    btnSettings: '⚙️ Eslatma sozlamalari',
    btnAITutor: '🤖 AI Tyutorni ochish',
    btnChangeLang: '🌐 Tilni o‘zgartirish',
    btnLearnVocab: '🔤 SAT so‘zlarini yodlash',
    btnMyProgress: '📊 Mening natijalarim',

    welcomeLinked: (name, target, pathway) =>
      `🎉 *SATPrep-ga xush kelibsiz, ${name}!* 🎓\n\n` +
      `Telegram akkauntingiz SATPrep profilingizga muvaffaqiyatli ulandi!\n\n` +
      `📋 *Sizning ma'lumotlaringiz:*\n` +
      `• Maqsadli ball: *${target}*\n` +
      `• O'quv darajasi: *${pathway}*\n` +
      `• Eslatmalar: *Faol*\n` +
      `• Til: *🇺🇿 O'zbekcha*\n\n` +
      `Endi bot darslaringizdan oldin shaxsiy eslatmalar va dars havolalarini yuboradi! 🚀\n\n` +
      `💡 *Mavjud buyruqlar:*\n` +
      `/status - Keyingi dars va rejani bilish\n` +
      `/settings - Eslatma vaqti va sozlamalar\n` +
      `/language - Tilni almashtirish (English / Русский / O'zbekcha)\n` +
      `/disconnect - Telegram akkauntni uzish\n` +
      `/help - Barcha buyruqlar ro'yxati`,

    welcomeBack: (name) =>
      `👋 *Qaytganingiz bilan, ${name}!* \n\n` +
      `Akkauntingiz SATPrep-ga ulangan holatda.\n\n` +
      `Keyingi darsni ko'rish uchun /status, tilni o'zgartirish uchun /language yoki sozlamalar uchun /settings buyrug'idan foydalaning.`,

    welcomeUnlinked:
      `👋 *SATPrep eslatma botiga xush kelibsiz!* 🎯\n\n` +
      `Profilingizni ulash va dars eslatmalarini olish uchun:\n\n` +
      `1. SATPrep saytiga kiring.\n` +
      `2. **Settings** (Sozlamalar) bo'limiga o'ting.\n` +
      `3. **Connect Telegram** tugmasini bosing.\n\n` +
      `Tilni o'zgartirish uchun /language buyrug'idan foydalanishingiz mumkin.`,

    invalidToken:
      `⚠️ *Yaroqsiz ulanish havolasi*\n\nUlanish kodi topilmadi. Iltimos, SATPrep saytiga kirib, **Settings** bo'limida qayta "Connect Telegram" tugmasini bosing.`,

    tokenUsed:
      `⚠️ *Kod avval ishlatilgan*\n\nBu bir martalik havola allaqachon ishlatilgan. Qayta ulash uchun Settings bo'limidan yangi havola oling.`,

    tokenExpired:
      `⏳ *Havola muddati tugagan*\n\nXavfsizlik uchun havola 10 daqiqa amal qiladi. Iltimos, saytdan qayta havola yarating.`,

    statusNotLinked:
      `⚠️ Siz hali SATPrep profilingizni ulamagansiz.\n\nIltimos, SATPrep saytidagi Settings bo'limidan **Connect Telegram** tugmasini bosing.`,

    statusReport: (name, target, pathway, nextLesson) =>
      `📊 *Sizning SAT o'quv holatingiz*\n\n` +
      `👤 Talaba: *${name}*\n` +
      `🎯 Maqsadli ball: *${target}*\n` +
      `🛣️ Yo'nalish: *${pathway}*\n\n` +
      `📖 *Rejadagi keyingi darsingiz:*\n${nextLesson}\n\n` +
      `Maqsadingiz sari harakatni davom ettiring! 🚀`,

    settingsNotLinked:
      `⚠️ Siz hali SATPrep profilingizni ulamagansiz.\nIltimos, SATPrep Settings bo'limiga kiring.`,

    settingsReport: (enabled, time, timezone, days, advanceMins, langName) =>
      `⚙️ *Sizning eslatma sozlamalaringiz*\n\n` +
      `• Eslatmalar: *${enabled ? '✅ Yoqilgan' : '⏸️ To‘xtatilgan'}*\n` +
      `• Dars vaqti: *${time}*\n` +
      `• Vaqt mintaqasi: *${timezone}*\n` +
      `• O'qish kunlari: *${days}*\n` +
      `• Oldindan ogohlantirish: *${advanceMins} daqiqa*\n` +
      `• Til: *${langName}*\n\n` +
      `Tilni o'zgartirish uchun /language buyrug'ini yuboring.\nBoshqa sozlamalarni o'zgartirish uchun saytga o'ting:`,

    disconnectSuccess:
      `👋 *Telegram akkaunt uzildi*\n\n` +
      `Sizning Telegram akkauntingiz SATPrep platformasidan uzildi. Endi sizga eslatmalar kelmaydi.\n\n` +
      `Xohlagan vaqtingizda yana Settings bo'limidan qayta ulanishingiz mumkin.`,

    helpMessage:
      `🤖 *SATPrep Bot buyruqlari*\n\n` +
      `• /status - O'quv rejasi va keyingi dars\n` +
      `• /language - Tilni almashtirish (English, Русский, O'zbekcha)\n` +
      `• /settings - Eslatma jadvali va kunlari\n` +
      `• /disconnect - Akkauntni uzish\n` +
      `• /help - Ushbu yordam oynasini ko'rsatish\n\n` +
      `SAT mavzulari bo'yicha yordam kerakmi? Saytimizda sizni AI Tyutor kutmoqda! 🦉`,

    chooseLanguage:
      `🌐 *Tilni tanlang / Choose language / Выберите язык:*\n\n` +
      `Bot siz bilan muloqot qiladigan qulay tilni tanlang:`,

    languageChanged:
      `✅ *Til muvaffaqiyatli almashtirildi!* 🇺🇿\n\nEndi bot barcha xabarlar, eslatmalar va buyruqlarni **o'zbek tilida** yuboradi.`,

    reminderHeader: `⏰ *SAT darsingiz haqida eslatma!* 📖`,
    reminderGreeting: (name, timeRemaining) => `Salom, ${name}! Sizning SAT darsingiz ${timeRemaining} boshlanadi.`,
    reminderGreetingLate: (name, lessonTime) => `Salom, ${name}! Bugungi SAT darsingiz haqida eslatamiz (soat ${lessonTime} ga rejalashtirilgan).`,
    reminderTopic: (title) => `🎯 *Bugungi dars mavzusi:* ${title}`,
    reminderEstTime: (mins) => `⏱ *Mo'ljallangan vaqt:* ${mins} daqiqa`,
    reminderVocabDue: (count) => `🔤 *SRS so'zlari:* ${count} ta so'z takrorlash uchun kutmoqda!`,
    reminderFooter: `Maqsadli ballingizga erishish uchun bugun albatta darsni bajaring! 💪`,
    timeRemainingNow: (time) => `*hozir* (soat *${time}* da)`,
    timeRemainingMins: (mins, time) => `*${mins} daqiqadan keyin* (soat *${time}* da)`,
    timeRemainingBefore: (mins, time) => `*${mins} daqiqa ichida* (soat *${time}* da)`,
    timeRemainingScheduled: (time) => `bugunga rejalashtirilgan (soat *${time}* da)`,
  },
};

export function parseTimezoneAndLang(rawTz: string | null | undefined): { timezone: string; language: BotLanguage } {
  if (!rawTz) return { timezone: 'Asia/Tashkent', language: 'en' };
  const parts = rawTz.split('#');
  const timezone = parts[0] || 'Asia/Tashkent';
  const rawLang = (parts[1] || 'en').toLowerCase().trim();
  const language: BotLanguage = rawLang === 'ru' || rawLang === 'uz' ? rawLang : 'en';
  return { timezone, language };
}

export function formatTimezoneWithLang(timezone: string, language: BotLanguage): string {
  const cleanTz = (timezone || 'Asia/Tashkent').split('#')[0];
  return `${cleanTz}#${language}`;
}

export function getLanguageKeyboard() {
  return {
    inline_keyboard: [
      [
        { text: '🇬🇧 English (Primary)', callback_data: 'set_lang_en' },
      ],
      [
        { text: '🇷🇺 Русский', callback_data: 'set_lang_ru' },
        { text: "🇺🇿 O'zbekcha", callback_data: 'set_lang_uz' },
      ],
    ],
  };
}
