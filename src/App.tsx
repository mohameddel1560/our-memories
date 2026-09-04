import {
  type ChangeEvent,
  type CSSProperties,
  type FormEvent,
  type ReactNode,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  CalendarDays,
  Check,
  ChevronLeft,
  Clock3,
  Heart,
  ImagePlus,
  Languages,
  LockKeyhole,
  MapPin,
  NotebookPen,
  Pencil,
  Plus,
  Send,
  Settings2,
  Sparkles,
  Trash2,
  Upload,
  X,
} from 'lucide-react';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import { Route, Switch, useLocation, Router as WouterRouter } from 'wouter';

const queryClient = new QueryClient();
const MEMORY_KEY = 'our-memories:memories';
const SETTINGS_KEY = 'our-memories:settings';
const NOTE_KEY = 'our-memories:love-note';
const LANGUAGE_KEY = 'our-memories:language';

type Language = 'uk' | 'ar';
type MemoryTranslation = { title: string; note: string };

type Memory = {
  id: string;
  title: string;
  date: string;
  note: string;
  color: string;
  image?: string;
  translations?: { uk: MemoryTranslation; ar: MemoryTranslation };
};

type CoupleSettings = {
  names: [string, string];
  togetherSince: string;
  nextMeeting: string;
};

type LoveNote = {
  text: string;
  savedOn: string;
};

const accentColors = [
  { value: '#e9a081', label: 'Абрикосовий / مشمشي' },
  { value: '#8ea8a0', label: 'Шавлієвий / ساج' },
  { value: '#c1a0bd', label: 'Лавандовий / موف' },
  { value: '#e4c06b', label: 'Золотий / ذهبي' },
];

const ui = {
  uk: {
    appName: 'Наша маленька таємниця',
    appTagline: 'тільки для нас двох',
    privatePlace: 'Наш особливий простір',
    language: 'العربية',
    heroEyebrow: 'Далеко, але завжди поруч',
    heroTitle: ['Усе, що між нами,', 'збережено тут.'],
    heroBody:
      'Від першого сміху до останнього дзвінка — залишаємо маленькі знаки любові, щоб повертатися до них, коли сумуємо одне за одним.',
    browse: 'Відкрити спогади',
    nextTogether: 'Наступного разу ми будемо разом',
    countdownLive: 'лічильник оновлюється щосекунди',
    countdownDone: 'Сьогодні наш день',
    days: 'днів',
    hours: 'год',
    minutes: 'хв',
    seconds: 'сек',
    dailyNote: 'Повідомлення дня',
    today: 'сьогодні',
    noteSaved: 'Збережено для нас',
    noteWaiting: 'Чекає на збереження',
    notePlaceholder: 'Напиши щось тепле...',
    saveNote: 'Зберегти',
    coupleSince: 'Відтоді, як ми стали нами',
    closeness: 'днів близькості',
    memoriesEyebrow: 'Наш теплий архів',
    memoriesTitle: 'Нитка спогадів',
    memoryCountOne: 'спогад',
    memoryCountMany: 'спогадів',
    stillToCome: 'і ще багато попереду',
    newMemory: 'Новий спогад',
    add: 'Додати',
    nextMeeting: 'Наступна зустріч',
    meetingBody: 'Рахуємо дні по одному, поки відстань не зникне.',
    counterAbove: 'Точний час залишився у лічильнику вище',
    littleNote: 'Наша маленька записка',
    littleNoteQuote: 'Відстань не вимірює близькість — її створюють деталі.',
    firstDay: 'написано в перший день',
    footerLeft: 'Маленьке місце для великої історії.',
    footerRight: 'Те, що між нами, залишається між нами',
    formEyebrow: 'Нова сторінка нашої історії',
    editFormTitle: 'Повернути спогад у світло',
    addFormTitle: 'Додати новий спогад',
    memoryTitle: 'Назва спогаду',
    titlePlaceholder: 'Наприклад: захід сонця біля вікна',
    date: 'Дата',
    story: 'Що хочемо про нього пам’ятати?',
    storyPlaceholder: 'Деталь, яку не хочемо забути...',
    photo: 'Фото спогаду',
    changePhoto: 'Замінити фото',
    addPhoto: 'Додати фото',
    photoHint: 'JPG, PNG або WEBP · фото залишиться тут після перезавантаження',
    chooseColor: 'Колір сторінки',
    saveEdit: 'Зберегти зміни',
    saveMemory: 'Зберегти спогад',
    cancel: 'Не зараз',
    close: 'Закрити',
    edit: 'Редагувати спогад',
    remove: 'Видалити спогад',
    removeQuestion: 'Видалити цей спогад з архіву?',
    removeBody: 'Після цього його не можна буде повернути.',
    yesRemove: 'Так, видалити',
    keep: 'Залишити',
    emptyTitle: 'Ця сторінка ще порожня',
    emptyBody: 'Перший спогад чекає на вас. Розкажіть про маленьку мить і залиште її жити тут.',
    firstMemory: 'Створити перший',
    savedToast: 'Спогад збережено назавжди у цьому браузері.',
    editedToast: 'Спогад оновлено і знову на своєму місці.',
    deletedToast: 'Спогад видалено з архіву.',
    noteToast: 'Ваше повідомлення збережено.',
    meetingToast: 'Дату зустрічі збережено. Відлік почався.',
    settingsToast: 'Ваші імена збережено.',
    settings: 'Налаштування',
    settingsEyebrow: 'Тільки для нас',
    settingsTitle: 'Налаштувати нашу сторінку',
    firstName: 'Перше ім’я',
    secondName: 'Друге ім’я',
    togetherDate: 'Ми разом від',
    saveSettings: 'Зберегти налаштування',
    meetingFormEyebrow: 'Точка призначення',
    meetingFormTitle: 'Змінити дату зустрічі',
    meetingDate: 'Ми будемо разом',
    saveDate: 'Зберегти дату',
    imageRequired: 'Додайте фото, щоб зберегти цей спогад.',
    storageError: 'Фото занадто велике. Спробуйте інше або менше фото.',
  },
  ar: {
    appName: 'سرّنا الصغير',
    appTagline: 'لينا إحنا الاتنين بس',
    privatePlace: 'مكاننا الخاص',
    language: 'Українська',
    heroEyebrow: 'بعيدين، بس دايمًا قريبين',
    heroTitle: ['كل اللي بينا،', 'محفوظ هنا.'],
    heroBody:
      'من أول ضحكة لآخر مكالمة، بنسيب للحب علامة صغيرة عشان نرجعلها وقت ما نوحش بعض.',
    browse: 'نفتح الذكريات',
    nextTogether: 'المرة الجاية هنكون سوا',
    countdownLive: 'العداد بيتحدّث كل ثانية',
    countdownDone: 'النهارده يومنا',
    days: 'يوم',
    hours: 'ساعة',
    minutes: 'دقيقة',
    seconds: 'ثانية',
    dailyNote: 'رسالة النهارده',
    today: 'النهارده',
    noteSaved: 'متسجلة عندنا',
    noteWaiting: 'لسه مستنية الحفظ',
    notePlaceholder: 'اكتب حاجة حلوة...',
    saveNote: 'احفظ الرسالة',
    coupleSince: 'من يوم ما بقينا إحنا',
    closeness: 'يوم من القرب',
    memoriesEyebrow: 'الأرشيف الحلو',
    memoriesTitle: 'خيط الذكريات',
    memoryCountOne: 'ذكرى',
    memoryCountMany: 'ذكريات',
    stillToCome: 'ولسه في كتير جاي',
    newMemory: 'ذكرى جديدة',
    add: 'إضافة',
    nextMeeting: 'اللقاء الجاي',
    meetingBody: 'هنعدّي الأيام واحدة واحدة، لحد ما المسافة تخلص.',
    counterAbove: 'العداد فوق بيقول الباقي بالظبط',
    littleNote: 'ملاحظة مننا لينا',
    littleNoteQuote: 'المسافة مش مقياس للقرب؛ التفاصيل هي اللي بتقربنا.',
    firstDay: 'مكتوبة في أول يوم',
    footerLeft: 'مكان صغير لحكاية كبيرة.',
    footerRight: 'اللي بينا يفضل بينا',
    formEyebrow: 'صفحة جديدة في الحكاية',
    editFormTitle: 'نرجّع الذكرى للواجهة',
    addFormTitle: 'نضيف ذكرى جديدة',
    memoryTitle: 'عنوان الذكرى',
    titlePlaceholder: 'مثلاً: غروب من شباك الطيارة',
    date: 'التاريخ',
    story: 'نحكي عنها بإيه؟',
    storyPlaceholder: 'التفصيلة اللي مش عايزين ننساها...',
    photo: 'صورة الذكرى',
    changePhoto: 'نغيّر الصورة',
    addPhoto: 'نضيف صورة',
    photoHint: 'JPG أو PNG أو WEBP · الصورة هتفضل هنا بعد ما نقفل الموقع',
    chooseColor: 'لون الصفحة',
    saveEdit: 'حفظ التعديل',
    saveMemory: 'نحفظها هنا',
    cancel: 'مش دلوقتي',
    close: 'إغلاق',
    edit: 'تعديل الذكرى',
    remove: 'حذف الذكرى',
    removeQuestion: 'نشيل الذكرى دي من الأرشيف؟',
    removeBody: 'مش هتقدروا ترجعوها بعد كده.',
    yesRemove: 'آه، نشيلها',
    keep: 'خلّيها',
    emptyTitle: 'الصفحة دي لسه فاضية',
    emptyBody: 'أول ذكرى بتستنى تتكتب. احكوا عن لحظة صغيرة، وسيبوها تعيش هنا.',
    firstMemory: 'نكتب أول واحدة',
    savedToast: 'الذكرى اتحفظت هنا ومش هتتشال غير بإيدكم.',
    editedToast: 'الذكرى اتعدّلت ولسه مكانها محفوظ.',
    deletedToast: 'الذكرى اتشالت من الأرشيف.',
    noteToast: 'رسالتك اليومية اتحفظت.',
    meetingToast: 'الموعد الجديد اتثبت. العدّ التنازلي بدأ.',
    settingsToast: 'الأسماء اتحفظت.',
    settings: 'إعداداتنا',
    settingsEyebrow: 'لينا إحنا الاتنين',
    settingsTitle: 'نظبط صفحتنا',
    firstName: 'الاسم الأول',
    secondName: 'الاسم الثاني',
    togetherDate: 'إحنا مع بعض من',
    saveSettings: 'احفظ الإعدادات',
    meetingFormEyebrow: 'نقطة الوصول',
    meetingFormTitle: 'نعدّل يوم اللقاء',
    meetingDate: 'هنكون سوا يوم',
    saveDate: 'ثبّت الموعد',
    imageRequired: 'ضيفوا صورة عشان نحفظ الذكرى.',
    storageError: 'الصورة كبيرة قوي. جرّبوا صورة أصغر.',
  },
} as const;

const dateToday = (offset = 0) => {
  const value = new Date();
  value.setHours(12, 0, 0, 0);
  value.setDate(value.getDate() + offset);
  return value.toISOString().slice(0, 10);
};

const readStorage = <T,>(key: string, fallback: T): T => {
  if (typeof window === 'undefined') return fallback;
  try {
    const stored = window.localStorage.getItem(key);
    return stored ? (JSON.parse(stored) as T) : fallback;
  } catch {
    return fallback;
  }
};

const saveStorage = (key: string, value: unknown) => {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
};

const makeIllustration = (title: string, from: string, to: string) =>
  `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 560"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop stop-color="${from}"/><stop offset="1" stop-color="${to}"/></linearGradient></defs><rect width="900" height="560" fill="url(#g)"/><circle cx="720" cy="100" r="82" fill="#fff" opacity=".25"/><path d="M0 465c150-90 260-45 390-120 155-88 230 42 510-45v260H0Z" fill="#27243b" opacity=".28"/><path d="M440 222c-30-45-102-25-102 30 0 62 102 120 102 120s102-58 102-120c0-55-72-75-102-30Z" fill="#fff" opacity=".86"/><text x="48" y="490" fill="#fff" opacity=".92" font-size="25" font-family="Georgia,serif">${title}</text></svg>`)}`;

const seededMemories: Memory[] = [
  {
    id: 'memory-bookshop',
    title: 'Книгарня, де ми загубили час',
    date: dateToday(-31),
    note: 'Ми зайшли за однією книжкою, а вийшли з двома пакетами й історіями про кожну полицю.',
    color: '#e9a081',
    image: makeIllustration('наша книгарня', '#8b5960', '#efb083'),
    translations: {
      uk: {
        title: 'Книгарня, де ми загубили час',
        note: 'Ми зайшли за однією книжкою, а вийшли з двома пакетами й історіями про кожну полицю.',
      },
      ar: {
        title: 'المكتبة اللي ضيعنا فيها الوقت',
        note: 'دخلنا نشتري كتاب واحد، وخرجنا ومعانا كيسين وحكايات عن كل رف.',
      },
    },
  },
  {
    id: 'memory-window',
    title: 'Дзвінок біля відкритого вікна',
    date: dateToday(-19),
    note: 'Кожен у своєму місті, але майже під тим самим небом. Нам навіть не треба було багато говорити.',
    color: '#8ea8a0',
    image: makeIllustration('одне небо', '#456b70', '#9bbba7'),
    translations: {
      uk: {
        title: 'Дзвінок біля відкритого вікна',
        note: 'Кожен у своєму місті, але майже під тим самим небом. Нам навіть не треба було багато говорити.',
      },
      ar: {
        title: 'مكالمة الشباك المفتوح',
        note: 'كل واحد في مدينة، بس نفس الهوا تقريبًا. سكتنا شوية وبصينا للسما، وده كان كفاية.',
      },
    },
  },
  {
    id: 'memory-pancakes',
    title: 'Наші перші панкейки',
    date: dateToday(-8),
    note: 'Не найкраща форма у світі, але найтепліший сніданок. Наступного разу додамо корицю.',
    color: '#e4c06b',
    image: makeIllustration('сніданок для двох', '#bd7355', '#e9c76f'),
    translations: {
      uk: {
        title: 'Наші перші панкейки',
        note: 'Не найкраща форма у світі, але найтепліший сніданок. Наступного разу додамо корицю.',
      },
      ar: {
        title: 'أول بان كيك سوا',
        note: 'مش أحلى شكل في الدنيا، لكنه كان أحلى فطار. المرة الجاية نزود قرفة.',
      },
    },
  },
];

const defaultSettings: CoupleSettings = {
  names: ['Я', 'Ти'],
  togetherSince: '2022-09-18',
  nextMeeting: dateToday(24),
};

const defaultNote: LoveNote = {
  text: 'Твоя присутність у моєму дні, навіть здалеку, робить маленькі речі важливими.',
  savedOn: dateToday(),
};

const formatDate = (date: string, language: Language, withYear = true) =>
  new Intl.DateTimeFormat(language === 'uk' ? 'uk-UA' : 'ar-EG', {
    day: 'numeric',
    month: 'long',
    ...(withYear ? { year: 'numeric' } : {}),
  }).format(new Date(`${date}T12:00:00`));

const formatDigits = (value: number | string, language: Language) =>
  language === 'ar'
    ? String(value).replace(/\d/g, (digit) => '٠١٢٣٤٥٦٧٨٩'[Number(digit)])
    : String(value);

const daysBetween = (date: string) => {
  const start = new Date(`${date}T12:00:00`).getTime();
  return Math.max(0, Math.floor((Date.now() - start) / 86400000));
};

const getCountdown = (date: string) => {
  const target = new Date(`${date}T23:59:59`).getTime();
  const difference = target - Date.now();
  if (difference <= 0) return { past: true, days: 0, hours: 0, minutes: 0, seconds: 0 };
  const seconds = Math.floor(difference / 1000);
  return {
    past: false,
    days: Math.floor(seconds / 86400),
    hours: Math.floor((seconds % 86400) / 3600),
    minutes: Math.floor((seconds % 3600) / 60),
    seconds: seconds % 60,
  };
};

function Countdown({ date, language }: { date: string; language: Language }) {
  const [countdown, setCountdown] = useState(() => getCountdown(date));
  const t = ui[language];

  useEffect(() => {
    setCountdown(getCountdown(date));
    const interval = window.setInterval(() => setCountdown(getCountdown(date)), 1000);
    return () => window.clearInterval(interval);
  }, [date]);

  if (countdown.past) {
    return <p className="font-arabic text-2xl text-[hsl(var(--accent))]">{t.countdownDone}</p>;
  }

  const units = [
    { value: countdown.days, label: t.days },
    { value: countdown.hours, label: t.hours },
    { value: countdown.minutes, label: t.minutes },
    { value: countdown.seconds, label: t.seconds },
  ];

  return (
    <div className="flex items-end gap-2" data-testid="countdown-meeting">
      {units.map((unit, index) => (
        <div className="flex items-end gap-2" key={unit.label}>
          <div className="text-center">
            <div className="font-ui text-2xl font-semibold leading-none tracking-tight text-[#f7eee1] sm:text-3xl">
              {formatDigits(String(unit.value).padStart(2, '0'), language)}
            </div>
            <div className="mt-1 text-[10px] text-[#b9b2c3]">{unit.label}</div>
          </div>
          {index < units.length - 1 && <span className="mb-4 text-lg text-[#8f8a9d]">:</span>}
        </div>
      ))}
    </div>
  );
}

function MemoryCard({
  memory,
  language,
  onEdit,
  onDelete,
}: {
  memory: Memory;
  language: Language;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const t = ui[language];
  const translation = memory.translations?.[language];
  const cardStyle = { '--memory-color': memory.color } as CSSProperties;
  return (
    <article className="relative mb-6 flex gap-4 entrance" style={cardStyle} data-testid={`card-memory-${memory.id}`}>
      <div className="relative z-10 mt-7 h-3 w-3 shrink-0 rounded-full border-[3px] border-[hsl(var(--background))] bg-[var(--memory-color)] shadow-[0_0_0_3px_var(--memory-color)]" aria-hidden="true" />
      <div className="soft-lift group min-w-0 flex-1 overflow-hidden rounded-[1.35rem] border border-[hsl(var(--card-border))] border-r-[5px] bg-[hsl(var(--card))] shadow-[0_8px_22px_-18px_hsl(235_32%_20%_/_0.45)]" style={{ borderRightColor: memory.color }}>
        <div className="grid md:grid-cols-[minmax(0,1fr)_260px]">
          <div className="order-2 p-5 sm:p-6 md:order-1">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="mb-2 flex items-center gap-2 text-xs font-medium text-[hsl(var(--muted-foreground))]" data-testid={`text-memory-date-${memory.id}`}>
                  <CalendarDays size={14} strokeWidth={1.8} />
                  {formatDate(memory.date, language, false)}
                </p>
                <h3 className="font-arabic text-2xl font-bold leading-tight text-[hsl(var(--foreground))]" data-testid={`text-memory-title-${memory.id}`}>
                  {translation?.title ?? memory.title}
                </h3>
              </div>
              <div className="flex shrink-0 gap-1 opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100">
                <button className="focus-ring rounded-full p-2 text-[hsl(var(--muted-foreground))] transition-colors hover:bg-[hsl(var(--secondary))] hover:text-[hsl(var(--foreground))]" onClick={onEdit} aria-label={t.edit} title={t.edit} data-testid={`button-edit-memory-${memory.id}`}>
                  <Pencil size={16} />
                </button>
                <button className="focus-ring rounded-full p-2 text-[hsl(var(--muted-foreground))] transition-colors hover:bg-[#f9e4df] hover:text-[hsl(var(--destructive))]" onClick={onDelete} aria-label={t.remove} title={t.remove} data-testid={`button-delete-memory-${memory.id}`}>
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
            <p className="mt-4 max-w-2xl font-arabic text-lg leading-8 text-[hsl(var(--muted-foreground))]" data-testid={`text-memory-note-${memory.id}`}>
              {translation?.note ?? memory.note}
            </p>
            <Heart size={17} className="mt-5 text-[hsl(var(--accent))]" fill="currentColor" strokeWidth={1.5} aria-hidden="true" />
          </div>
          <div className="relative order-1 min-h-[190px] overflow-hidden bg-[#e9ded3] md:order-2 md:min-h-full">
            {memory.image ? (
              <img src={memory.image} alt={translation?.title ?? memory.title} className="h-full min-h-[190px] w-full object-cover transition-transform duration-500 group-hover:scale-105" />
            ) : (
              <div className="flex h-full min-h-[190px] items-center justify-center bg-[var(--memory-color)]/30 text-[hsl(var(--foreground))]">
                <ImagePlus size={30} strokeWidth={1.5} />
              </div>
            )}
            <div className="pointer-events-none absolute right-4 top-4 rounded-full bg-[#f7eee1]/80 p-2 text-[#8d655b] backdrop-blur-sm">
              <Heart size={16} fill="currentColor" />
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}

function compressImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('read'));
    reader.onload = () => {
      const image = new Image();
      image.onerror = () => reject(new Error('image'));
      image.onload = () => {
        const maxSize = 1400;
        const ratio = Math.min(1, maxSize / Math.max(image.width, image.height));
        const canvas = document.createElement('canvas');
        canvas.width = Math.max(1, Math.round(image.width * ratio));
        canvas.height = Math.max(1, Math.round(image.height * ratio));
        const context = canvas.getContext('2d');
        if (!context) {
          reject(new Error('canvas'));
          return;
        }
        context.drawImage(image, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', 0.84));
      };
      image.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  });
}

function MemoryForm({
  draft,
  editing,
  language,
  onChange,
  onImage,
  onSubmit,
  onClose,
}: {
  draft: Memory;
  editing: boolean;
  language: Language;
  onChange: (draft: Memory) => void;
  onImage: (event: ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onClose: () => void;
}) {
  const t = ui[language];
  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-[#23233b]/45 p-0 backdrop-blur-sm sm:items-center sm:p-6" role="dialog" aria-modal="true" aria-labelledby="memory-form-title">
      <form className="entrance max-h-[94dvh] w-full max-w-xl overflow-y-auto rounded-t-[2rem] bg-[hsl(var(--card))] p-6 shadow-2xl sm:rounded-[2rem] sm:p-8" onSubmit={onSubmit}>
        <div className="mb-7 flex items-start justify-between">
          <div>
            <p className="mb-1 flex items-center gap-2 text-xs font-semibold tracking-[.18em] text-[hsl(var(--accent))]"><Heart size={13} fill="currentColor" />{t.formEyebrow}</p>
            <h2 id="memory-form-title" className="font-arabic text-3xl font-bold">{editing ? t.editFormTitle : t.addFormTitle}</h2>
          </div>
          <button className="focus-ring rounded-full p-2 text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--secondary))]" type="button" onClick={onClose} aria-label={t.close}><X size={20} /></button>
        </div>
        <div className="space-y-5">
          <label className="block">
            <span className="mb-2 block text-sm font-semibold">{t.memoryTitle}</span>
            <input className="focus-ring w-full rounded-xl border border-[hsl(var(--input))] bg-[hsl(var(--background))] px-4 py-3 font-arabic text-lg outline-none transition-colors focus:border-[hsl(var(--accent))]" value={draft.title} onChange={(event) => onChange({ ...draft, title: event.target.value })} placeholder={t.titlePlaceholder} required data-testid="input-memory-title" />
          </label>
          <div className="grid gap-5 sm:grid-cols-[160px_1fr]">
            <label className="block">
              <span className="mb-2 block text-sm font-semibold">{t.date}</span>
              <input type="date" className="focus-ring w-full rounded-xl border border-[hsl(var(--input))] bg-[hsl(var(--background))] px-3 py-3 text-sm outline-none focus:border-[hsl(var(--accent))]" value={draft.date} onChange={(event) => onChange({ ...draft, date: event.target.value })} required data-testid="input-memory-date" />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-semibold">{t.story}</span>
              <textarea className="focus-ring min-h-[104px] w-full resize-none rounded-xl border border-[hsl(var(--input))] bg-[hsl(var(--background))] px-4 py-3 font-arabic text-lg leading-7 outline-none focus:border-[hsl(var(--accent))]" value={draft.note} onChange={(event) => onChange({ ...draft, note: event.target.value })} placeholder={t.storyPlaceholder} required data-testid="input-memory-note" />
            </label>
          </div>
          <div>
            <span className="mb-2 block text-sm font-semibold">{t.photo}</span>
            <label className="group relative flex min-h-[180px] cursor-pointer items-center justify-center overflow-hidden rounded-2xl border border-dashed border-[hsl(var(--accent))] bg-[#f8eadf]/60 transition-colors hover:bg-[#f8eadf]" htmlFor="memory-image-upload">
              {draft.image ? (
                <>
                  <img src={draft.image} alt="" className="absolute inset-0 h-full w-full object-cover opacity-90" />
                  <span className="relative flex items-center gap-2 rounded-xl bg-[#27243b]/80 px-4 py-2.5 text-sm font-semibold text-white backdrop-blur-sm"><Upload size={16} />{t.changePhoto}</span>
                </>
              ) : (
                <span className="flex flex-col items-center gap-2 text-center text-[hsl(var(--muted-foreground))]"><span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f1dcc7] text-[#9b6559]"><ImagePlus size={24} /></span><strong className="font-arabic text-lg text-[hsl(var(--foreground))]">{t.addPhoto}</strong><small>{t.photoHint}</small></span>
              )}
              <input id="memory-image-upload" type="file" accept="image/png,image/jpeg,image/webp" className="sr-only" onChange={onImage} data-testid="input-memory-image" />
            </label>
          </div>
          <fieldset>
            <legend className="mb-2 block text-sm font-semibold">{t.chooseColor}</legend>
            <div className="flex gap-3">
              {accentColors.map((color) => (
                <button type="button" key={color.value} className={`focus-ring h-9 w-9 rounded-full border-2 transition-transform hover:scale-110 ${draft.color === color.value ? 'border-[hsl(var(--foreground))] ring-2 ring-[hsl(var(--card))] ring-offset-2 ring-offset-[hsl(var(--foreground))]' : 'border-transparent'}`} style={{ backgroundColor: color.value }} onClick={() => onChange({ ...draft, color: color.value })} aria-label={color.label}>
                  {draft.color === color.value && <Check size={16} className="mx-auto text-[#27243b]" />}
                </button>
              ))}
            </div>
          </fieldset>
        </div>
        <div className="mt-8 flex gap-3">
          <button className="focus-ring flex flex-1 items-center justify-center gap-2 rounded-xl bg-[hsl(var(--primary))] px-5 py-3 font-semibold text-[hsl(var(--primary-foreground))] transition-transform hover:-translate-y-0.5 active:translate-y-0" type="submit" data-testid="button-save-memory"><Check size={17} /> {editing ? t.saveEdit : t.saveMemory}</button>
          <button className="focus-ring rounded-xl border border-[hsl(var(--border))] px-5 py-3 font-semibold text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--secondary))]" type="button" onClick={onClose}>{t.cancel}</button>
        </div>
      </form>
    </div>
  );
}

function Home() {
  const [language, setLanguage] = useState<Language>(() => readStorage(LANGUAGE_KEY, 'uk' as Language));
  const t = ui[language];
  const [memories, setMemories] = useState<Memory[]>(() => readStorage(MEMORY_KEY, seededMemories));
  const [settings, setSettings] = useState<CoupleSettings>(() => {
    const stored = readStorage(SETTINGS_KEY, defaultSettings);
    return stored.names[0] === 'سلمى' || stored.names[1] === 'ياسين' ? defaultSettings : stored;
  });
  const [loveNote, setLoveNote] = useState<LoveNote>(() => readStorage(NOTE_KEY, defaultNote));
  const [noteDraft, setNoteDraft] = useState(loveNote.text);
  const [noteSaved, setNoteSaved] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [memoryDraft, setMemoryDraft] = useState<Memory>({ id: '', title: '', date: dateToday(), note: '', color: accentColors[0].value });
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [meetingOpen, setMeetingOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settingsDraft, setSettingsDraft] = useState(settings);
  const [meetingDraft, setMeetingDraft] = useState(settings.nextMeeting);
  const [toast, setToast] = useState('');

  const orderedMemories = useMemo(() => [...memories].sort((a, b) => b.date.localeCompare(a.date)), [memories]);
  const daysTogether = useMemo(() => daysBetween(settings.togetherSince), [settings.togetherSince]);

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = language === 'uk' ? 'ltr' : 'rtl';
    saveStorage(LANGUAGE_KEY, language);
  }, [language]);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(''), 2800);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const showToast = (message: string) => setToast(message);

  const openNewMemory = () => {
    setEditingId(null);
    setMemoryDraft({ id: `memory-${Date.now()}`, title: '', date: dateToday(), note: '', color: accentColors[0].value });
    setFormOpen(true);
  };

  const openEditMemory = (memory: Memory) => {
    setEditingId(memory.id);
    setMemoryDraft(memory);
    setFormOpen(true);
  };

  const handleImage = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const image = await compressImage(file);
      setMemoryDraft((current) => ({ ...current, image }));
    } catch {
      showToast(t.storageError);
    }
    event.target.value = '';
  };

  const saveMemory = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!memoryDraft.image) {
      showToast(t.imageRequired);
      return;
    }
    const next = editingId ? memories.map((memory) => memory.id === editingId ? memoryDraft : memory) : [memoryDraft, ...memories];
    if (!saveStorage(MEMORY_KEY, next)) {
      showToast(t.storageError);
      return;
    }
    setMemories(next);
    setFormOpen(false);
    showToast(editingId ? t.editedToast : t.savedToast);
  };

  const deleteMemory = () => {
    if (!confirmDelete) return;
    const next = memories.filter((memory) => memory.id !== confirmDelete);
    setMemories(next);
    saveStorage(MEMORY_KEY, next);
    setConfirmDelete(null);
    showToast(t.deletedToast);
  };

  const saveNote = () => {
    const next = { text: noteDraft.trim(), savedOn: dateToday() };
    setLoveNote(next);
    saveStorage(NOTE_KEY, next);
    setNoteSaved(true);
    showToast(t.noteToast);
  };

  const saveMeeting = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const next = { ...settings, nextMeeting: meetingDraft };
    setSettings(next);
    saveStorage(SETTINGS_KEY, next);
    setMeetingOpen(false);
    showToast(t.meetingToast);
  };

  const saveSettings = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const next: CoupleSettings = {
      ...settingsDraft,
      names: [settingsDraft.names[0].trim() || 'Я', settingsDraft.names[1].trim() || 'Ти'],
    };
    setSettings(next);
    setSettingsDraft(next);
    saveStorage(SETTINGS_KEY, next);
    setSettingsOpen(false);
    showToast(t.settingsToast);
  };

  const toggleLanguage = () => setLanguage((current) => current === 'uk' ? 'ar' : 'uk');

  return (
    <main dir={language === 'uk' ? 'ltr' : 'rtl'} className="paper-grain min-h-[100dvh] overflow-hidden text-[hsl(var(--foreground))]">
      <div className="mx-auto max-w-[1340px] px-5 pb-20 pt-5 sm:px-8 lg:px-12">
        <header className="entrance mb-7 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="heart-mark relative flex h-11 w-11 items-center justify-center rounded-[15px] bg-[hsl(var(--primary))] text-[hsl(var(--accent))] shadow-[4px_4px_0_hsl(var(--accent))]" aria-hidden="true"><Heart size={21} fill="currentColor" strokeWidth={1.7} /><Heart className="heart-spark absolute -right-2 -top-2 text-[hsl(var(--accent))]" size={12} fill="currentColor" /></div>
            <div>
              <p className="font-arabic text-xl font-bold leading-none" data-testid="text-app-name">{t.appName}</p>
              <p className="mt-1 text-[10px] font-semibold tracking-[.18em] text-[hsl(var(--muted-foreground))]">{t.appTagline}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="focus-ring language-toggle flex items-center gap-2 rounded-full border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-3 py-2 text-xs font-semibold text-[hsl(var(--muted-foreground))] transition-transform hover:-translate-y-0.5" onClick={toggleLanguage} data-testid="button-language-toggle"><Languages size={15} /> {t.language}</button>
            <button className="focus-ring flex items-center gap-2 rounded-full border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-3 py-2 text-xs font-semibold text-[hsl(var(--muted-foreground))] transition-transform hover:-translate-y-0.5" onClick={() => { setSettingsDraft(settings); setSettingsOpen(true); }} aria-label={t.settings} title={t.settings}><Settings2 size={15} /><span className="hidden sm:inline">{t.settings}</span></button>
            <div className="hidden items-center gap-2 text-xs text-[hsl(var(--muted-foreground))] sm:flex"><LockKeyhole size={14} /><span>{t.privatePlace}</span></div>
          </div>
        </header>

        <section className="entrance entrance-1 relative overflow-hidden rounded-[2.2rem] bg-[hsl(var(--primary))] px-6 py-8 text-[hsl(var(--primary-foreground))] shadow-[0_22px_50px_-28px_hsl(235_32%_20%_/_0.7)] sm:px-10 sm:py-11 lg:px-14 lg:py-14">
          <Heart className="pointer-events-none absolute -right-3 top-7 text-[#f7eee1]/10" size={100} fill="currentColor" strokeWidth={1} />
          <Heart className="pointer-events-none absolute bottom-8 left-[43%] text-[hsl(var(--accent))]/10" size={46} fill="currentColor" strokeWidth={1} />
          <div className="pointer-events-none absolute -left-12 -top-20 h-64 w-64 rounded-full border-[1px] border-[#f7eee1]/10 sm:h-80 sm:w-80" />
          <div className="pointer-events-none absolute -left-24 -top-32 h-80 w-80 rounded-full border-[1px] border-[#f7eee1]/10 sm:h-[26rem] sm:w-[26rem]" />
          <div className="relative grid gap-10 lg:grid-cols-[1fr_360px] lg:items-end">
            <div className="max-w-2xl">
              <div className="mb-6 flex items-center gap-2 text-xs font-semibold text-[#b9b2c3]"><Sparkles size={15} className="text-[hsl(var(--accent))]" /> {t.heroEyebrow} <Heart size={12} className="text-[hsl(var(--accent))]" fill="currentColor" /></div>
              <h1 className="font-arabic text-[3rem] font-bold leading-[1.08] tracking-tight text-[#f7eee1] sm:text-[4.5rem] lg:text-[5.3rem]" data-testid="text-hero-title">{t.heroTitle[0]}<br /><span className="text-[hsl(var(--accent))]">{t.heroTitle[1]}</span></h1>
              <p className="mt-6 max-w-lg font-arabic text-xl leading-9 text-[#d5ccd5] sm:text-2xl">{t.heroBody}</p>
              <a className="focus-ring mt-8 inline-flex items-center gap-2 border-b border-[hsl(var(--accent))] pb-1 font-semibold text-[#f7eee1] transition-colors hover:text-[hsl(var(--accent))]" href="#memories" data-testid="link-browse-memories">{t.browse} <ChevronLeft size={17} /></a>
            </div>
            <div className="relative rounded-[1.6rem] border border-[#f7eee1]/15 bg-[#373750]/70 p-6 backdrop-blur-sm sm:p-7">
              <div className="mb-6 flex items-start justify-between">
                <div><p className="text-xs font-medium text-[#b9b2c3]">{t.nextTogether}</p><p className="mt-1 font-arabic text-2xl font-bold text-[#f7eee1]" data-testid="text-next-meeting-date">{formatDate(settings.nextMeeting, language)}</p></div>
                <Clock3 size={20} className="mt-1 text-[hsl(var(--accent))]" />
              </div>
              <Countdown date={settings.nextMeeting} language={language} />
              <div className="mt-6 flex items-center justify-between border-t border-[#f7eee1]/10 pt-4">
                <span className="text-xs text-[#b9b2c3]">{t.countdownLive}</span>
                <button className="focus-ring rounded-lg p-1.5 text-[#d5ccd5] transition-colors hover:bg-[#f7eee1]/10 hover:text-[hsl(var(--accent))]" onClick={() => { setMeetingDraft(settings.nextMeeting); setMeetingOpen(true); }} aria-label={t.meetingFormTitle}><Settings2 size={17} /></button>
              </div>
            </div>
          </div>
        </section>

        <section className="entrance entrance-2 my-8 grid gap-5 md:grid-cols-[1fr_1.45fr]">
          <div className="relative overflow-hidden rounded-[1.8rem] border border-[hsl(var(--card-border))] bg-[#f1dcc7] p-7 sm:p-8">
            <Heart className="pointer-events-none absolute -left-3 bottom-2 text-[#c68c76]/15" size={92} fill="currentColor" strokeWidth={1} />
            <div className="absolute -left-8 -top-8 h-28 w-28 rounded-full border border-[#c68c76]/25" />
            <div className="absolute -left-2 top-5 h-16 w-16 rounded-full border border-[#c68c76]/20" />
            <div className="relative">
              <div className="mb-6 flex items-center justify-between"><span className="flex items-center gap-2 text-xs font-semibold tracking-wide text-[#76524b]"><NotebookPen size={15} /> {t.dailyNote}</span><span className="rounded-full bg-[#f7eee1]/70 px-3 py-1 text-[10px] font-semibold text-[#76524b]" data-testid="status-note-date">{loveNote.savedOn === dateToday() ? t.today : formatDate(loveNote.savedOn, language, false)}</span></div>
              <textarea value={noteDraft} onChange={(event) => { setNoteDraft(event.target.value); setNoteSaved(false); }} className="min-h-[112px] w-full resize-none border-0 bg-transparent p-0 font-arabic text-[1.55rem] font-bold leading-9 text-[#3e3040] outline-none placeholder:text-[#8b6e68]" placeholder={t.notePlaceholder} aria-label={t.dailyNote} data-testid="input-daily-love-note" />
              <div className="mt-5 flex items-center justify-between"><span className="text-xs text-[#76524b]">{noteSaved ? t.noteSaved : t.noteWaiting}</span><button className="focus-ring flex items-center gap-2 rounded-xl bg-[#3e3040] px-4 py-2.5 text-sm font-semibold text-[#f7eee1] transition-transform hover:-translate-y-0.5 active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-50" onClick={saveNote} disabled={noteSaved} data-testid="button-save-love-note"><Send size={15} /> {t.saveNote}</button></div>
            </div>
          </div>
          <div className="relative flex flex-col justify-between overflow-hidden rounded-[1.8rem] border border-[hsl(var(--card-border))] bg-[hsl(var(--card))] p-7 shadow-[0_8px_30px_-25px_hsl(235_32%_20%_/_0.6)] sm:p-8">
            <Heart className="pointer-events-none absolute -left-4 -top-5 text-[#e9a081]/10" size={130} fill="currentColor" strokeWidth={1} />
            <div className="relative flex items-start justify-between gap-4"><div><p className="mb-3 text-xs font-semibold tracking-[.16em] text-[hsl(var(--muted-foreground))]">{t.coupleSince}</p><p className="font-arabic text-3xl font-bold leading-tight sm:text-4xl" data-testid="text-couple-names">{settings.names[0]} <span className="text-[hsl(var(--accent))]">♥</span> {settings.names[1]}</p></div><div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#e7edf0] text-[#59717c]"><MapPin size={20} /></div></div>
            <div className="relative mt-8 flex items-end justify-between gap-4 border-t border-[hsl(var(--border))] pt-5"><div><span className="font-ui text-4xl font-semibold tracking-tight text-[hsl(var(--primary))]" data-testid="text-days-together">{formatDigits(daysTogether, language)}</span><span className="mx-2 font-arabic text-lg text-[hsl(var(--muted-foreground))]">{t.closeness}</span></div><span className="text-xs text-[hsl(var(--muted-foreground))]">{formatDate(settings.togetherSince, language, false)}</span></div>
          </div>
        </section>

        <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_310px] lg:gap-20">
          <section id="memories" className="entrance entrance-3 scroll-mt-6" aria-labelledby="memories-title">
            <div className="mb-8 flex items-end justify-between gap-4"><div><p className="mb-2 flex items-center gap-2 text-xs font-semibold tracking-[.16em] text-[hsl(var(--accent))]"><Heart size={13} fill="currentColor" />{t.memoriesEyebrow}</p><h2 id="memories-title" className="font-arabic text-4xl font-bold" data-testid="text-memories-heading">{t.memoriesTitle}</h2><p className="mt-2 text-sm text-[hsl(var(--muted-foreground))]" data-testid="text-memory-count">{formatDigits(memories.length, language)} {memories.length === 1 ? t.memoryCountOne : t.memoryCountMany}، {t.stillToCome}</p></div><button className="focus-ring flex shrink-0 items-center gap-2 rounded-xl bg-[hsl(var(--primary))] px-4 py-3 text-sm font-semibold text-[hsl(var(--primary-foreground))] shadow-[3px_3px_0_hsl(var(--accent))] transition-transform hover:-translate-y-0.5 active:translate-y-0" onClick={openNewMemory} data-testid="button-add-memory"><Plus size={18} /> <span className="hidden sm:inline">{t.newMemory}</span><span className="sm:hidden">{t.add}</span></button></div>
            {orderedMemories.length > 0 ? (
              <div className="relative pl-1 pr-1">
                <div className="dashed-line absolute top-7 h-[calc(100%-3rem)] w-px" style={language === 'uk' ? { left: '6px' } : { right: '6px' }} aria-hidden="true" />
                {orderedMemories.map((memory, index) => <div key={memory.id} style={{ animationDelay: `${index * 70}ms` }}><MemoryCard memory={memory} language={language} onEdit={() => openEditMemory(memory)} onDelete={() => setConfirmDelete(memory.id)} />{confirmDelete === memory.id && <div className="mb-6 mr-7 rounded-2xl border border-[#ecc7bf] bg-[#fff4f0] p-4 entrance" role="alert" data-testid={`alert-delete-memory-${memory.id}`}><p className="flex items-center gap-2 font-arabic text-lg font-bold text-[#643f3a]"><Heart size={16} fill="currentColor" />{t.removeQuestion}</p><p className="mt-1 text-xs text-[#8d6560]">{t.removeBody}</p><div className="mt-3 flex gap-2"><button className="focus-ring rounded-lg bg-[hsl(var(--destructive))] px-3 py-2 text-xs font-semibold text-white" onClick={deleteMemory} data-testid={`button-confirm-delete-memory-${memory.id}`}>{t.yesRemove}</button><button className="focus-ring rounded-lg px-3 py-2 text-xs font-semibold text-[#643f3a] hover:bg-[#f7dfd9]" onClick={() => setConfirmDelete(null)}>{t.keep}</button></div></div>}</div>)}
              </div>
            ) : <div className="rounded-[1.8rem] border border-dashed border-[hsl(var(--accent))] bg-[#f8eadf]/70 px-7 py-14 text-center" data-testid="empty-memory-state"><div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#f1dcc7] text-[#9b6559]"><Heart size={25} fill="currentColor" /></div><h3 className="mt-5 font-arabic text-2xl font-bold">{t.emptyTitle}</h3><p className="mx-auto mt-2 max-w-sm font-arabic text-lg leading-7 text-[hsl(var(--muted-foreground))]">{t.emptyBody}</p><button className="focus-ring mt-6 rounded-xl bg-[hsl(var(--primary))] px-5 py-3 text-sm font-semibold text-[hsl(var(--primary-foreground))]" onClick={openNewMemory}>{t.firstMemory}</button></div>}
          </section>

          <aside className="entrance entrance-4 space-y-5 lg:pt-16">
            <div className="relative overflow-hidden rounded-[1.8rem] bg-[#dbe5df] p-6 sm:p-7"><Heart className="pointer-events-none absolute -left-2 bottom-3 text-[#59766d]/10" size={90} fill="currentColor" strokeWidth={1} /><div className="relative"><div className="mb-6 flex items-center justify-between"><span className="flex items-center gap-2 text-xs font-semibold tracking-wide text-[#49645b]"><CalendarDays size={15} /> {t.nextMeeting}</span><button className="focus-ring rounded-lg p-1.5 text-[#49645b] hover:bg-[#c9d9d0]" onClick={() => { setMeetingDraft(settings.nextMeeting); setMeetingOpen(true); }} aria-label={t.meetingFormTitle}><Pencil size={15} /></button></div><p className="font-arabic text-3xl font-bold text-[#29473e]" data-testid="text-meeting-card-date">{formatDate(settings.nextMeeting, language)}</p><p className="mt-3 font-arabic text-lg leading-7 text-[#59766d]">{t.meetingBody}</p><div className="mt-6 flex items-center gap-2 border-t border-[#b5cbbf] pt-4 text-xs text-[#59766d]"><Clock3 size={14} /> <span>{t.counterAbove}</span></div></div></div>
            <div className="relative overflow-hidden rounded-[1.8rem] border border-[hsl(var(--card-border))] bg-[hsl(var(--card))] p-6"><Heart className="pointer-events-none absolute -bottom-5 -left-3 text-[hsl(var(--accent))]/10" size={80} fill="currentColor" strokeWidth={1} /><p className="relative mb-4 flex items-center gap-2 text-xs font-semibold tracking-[.15em] text-[hsl(var(--muted-foreground))]"><Heart size={13} fill="currentColor" className="text-[hsl(var(--accent))]" />{t.littleNote}</p><p className="relative font-arabic text-xl font-bold leading-9">“{t.littleNoteQuote}”</p><div className="relative mt-5 flex items-center gap-2 text-xs text-[hsl(var(--muted-foreground))]"><Heart size={13} className="text-[hsl(var(--accent))]" fill="currentColor" /> {t.firstDay}</div></div>
          </aside>
        </div>

        <footer className="mt-20 flex flex-col items-center justify-between gap-3 border-t border-[hsl(var(--border))] pt-6 text-xs text-[hsl(var(--muted-foreground))] sm:flex-row"><span className="flex items-center gap-2"><Heart size={13} className="text-[hsl(var(--accent))]" fill="currentColor" />{t.footerLeft}</span><span className="flex items-center gap-2"><LockKeyhole size={13} /> {t.footerRight} <Heart size={13} className="text-[hsl(var(--accent))]" fill="currentColor" /></span></footer>
      </div>

      {formOpen && <MemoryForm draft={memoryDraft} editing={Boolean(editingId)} language={language} onChange={setMemoryDraft} onImage={handleImage} onSubmit={saveMemory} onClose={() => setFormOpen(false)} />}

      {meetingOpen && <div className="fixed inset-0 z-[60] flex items-end justify-center bg-[#23233b]/45 p-0 backdrop-blur-sm sm:items-center sm:p-6" role="dialog" aria-modal="true" aria-labelledby="meeting-form-title"><form className="entrance w-full max-w-md rounded-t-[2rem] bg-[hsl(var(--card))] p-6 shadow-2xl sm:rounded-[2rem] sm:p-8" onSubmit={saveMeeting}><div className="mb-7 flex items-start justify-between"><div><p className="mb-1 flex items-center gap-2 text-xs font-semibold tracking-[.16em] text-[hsl(var(--accent))]"><Heart size={13} fill="currentColor" />{t.meetingFormEyebrow}</p><h2 id="meeting-form-title" className="font-arabic text-3xl font-bold">{t.meetingFormTitle}</h2></div><button className="focus-ring rounded-full p-2 text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--secondary))]" type="button" onClick={() => setMeetingOpen(false)} aria-label={t.close}><X size={20} /></button></div><label className="block"><span className="mb-2 block text-sm font-semibold">{t.meetingDate}</span><input type="date" className="focus-ring w-full rounded-xl border border-[hsl(var(--input))] bg-[hsl(var(--background))] px-4 py-3 outline-none focus:border-[hsl(var(--accent))]" value={meetingDraft} onChange={(event) => setMeetingDraft(event.target.value)} required /></label><div className="mt-8 flex gap-3"><button className="focus-ring flex-1 rounded-xl bg-[hsl(var(--primary))] px-5 py-3 font-semibold text-[hsl(var(--primary-foreground))]" type="submit">{t.saveDate}</button><button className="focus-ring rounded-xl border border-[hsl(var(--border))] px-5 py-3 font-semibold text-[hsl(var(--muted-foreground))]" type="button" onClick={() => setMeetingOpen(false)}>{t.cancel}</button></div></form></div>}

      {settingsOpen && <div className="fixed inset-0 z-[60] flex items-end justify-center bg-[#23233b]/45 p-0 backdrop-blur-sm sm:items-center sm:p-6" role="dialog" aria-modal="true" aria-labelledby="settings-form-title"><form className="entrance w-full max-w-md rounded-t-[2rem] bg-[hsl(var(--card))] p-6 shadow-2xl sm:rounded-[2rem] sm:p-8" onSubmit={saveSettings}><div className="mb-7 flex items-start justify-between"><div><p className="mb-1 flex items-center gap-2 text-xs font-semibold tracking-[.16em] text-[hsl(var(--accent))]"><Heart size={13} fill="currentColor" />{t.settingsEyebrow}</p><h2 id="settings-form-title" className="font-arabic text-3xl font-bold">{t.settingsTitle}</h2></div><button className="focus-ring rounded-full p-2 text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--secondary))]" type="button" onClick={() => setSettingsOpen(false)} aria-label={t.close}><X size={20} /></button></div><div className="space-y-4"><label className="block"><span className="mb-2 block text-sm font-semibold">{t.firstName}</span><input className="focus-ring w-full rounded-xl border border-[hsl(var(--input))] bg-[hsl(var(--background))] px-4 py-3 font-arabic text-lg outline-none focus:border-[hsl(var(--accent))]" value={settingsDraft.names[0]} onChange={(event) => setSettingsDraft({ ...settingsDraft, names: [event.target.value, settingsDraft.names[1]] })} /></label><label className="block"><span className="mb-2 block text-sm font-semibold">{t.secondName}</span><input className="focus-ring w-full rounded-xl border border-[hsl(var(--input))] bg-[hsl(var(--background))] px-4 py-3 font-arabic text-lg outline-none focus:border-[hsl(var(--accent))]" value={settingsDraft.names[1]} onChange={(event) => setSettingsDraft({ ...settingsDraft, names: [settingsDraft.names[0], event.target.value] })} /></label><label className="block"><span className="mb-2 block text-sm font-semibold">{t.togetherDate}</span><input type="date" className="focus-ring w-full rounded-xl border border-[hsl(var(--input))] bg-[hsl(var(--background))] px-4 py-3 outline-none focus:border-[hsl(var(--accent))]" value={settingsDraft.togetherSince} onChange={(event) => setSettingsDraft({ ...settingsDraft, togetherSince: event.target.value })} /></label></div><div className="mt-8 flex gap-3"><button className="focus-ring flex flex-1 items-center justify-center gap-2 rounded-xl bg-[hsl(var(--primary))] px-5 py-3 font-semibold text-[hsl(var(--primary-foreground))]" type="submit"><Check size={17} />{t.saveSettings}</button><button className="focus-ring rounded-xl border border-[hsl(var(--border))] px-5 py-3 font-semibold text-[hsl(var(--muted-foreground))]" type="button" onClick={() => setSettingsOpen(false)}>{t.cancel}</button></div></form></div>}

      {toast && <div className="fixed bottom-5 left-1/2 z-[70] flex -translate-x-1/2 items-center gap-2 rounded-full bg-[hsl(var(--primary))] px-5 py-3 text-sm font-semibold text-[hsl(var(--primary-foreground))] shadow-xl entrance" role="status" data-testid="status-toast"><Heart size={16} className="text-[hsl(var(--accent))]" fill="currentColor" /> {toast}</div>}
    </main>
  );
}

function Router() {
  return <RoutedErrorBoundary><Switch><Route path="/" component={Home} /><Route component={NotFound} /></Switch></RoutedErrorBoundary>;
}

function RoutedErrorBoundary({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>;
}

function App() {
  return <QueryClientProvider client={queryClient}><TooltipProvider><WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}><Router /></WouterRouter><Toaster /></TooltipProvider></QueryClientProvider>;
}

export default App;