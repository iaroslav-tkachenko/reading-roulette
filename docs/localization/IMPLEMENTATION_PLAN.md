# План реализации EN/RU

План от 2026-10-11 реализован и опубликован в составе v10. Ниже сохранены исходная последовательность и handoff; текущий результат и проверки — в [IMPLEMENTATION.md](IMPLEMENTATION.md). [Навигация](README.md).

## Архитектура

Для двух языков достаточно статических типизированных словарей без новой зависимости. Язык интерфейса хранится отдельно от ReadingSettings, но вместе с промптом в согласованном snapshot контроллера. Проверка совместимости и случайный выбор используют канонические данные. Локализованные инструкции извлекаются по ID после валидации; числовые ограничения рассчитываются общим кодом.

Предлагаемая структура новых файлов; уточнить по фактической версии checkout:

```text
src/i18n/
  types.ts                 InterfaceLocale = 'en' | 'ru', контракты сообщений
  en.ts                    Английские UI-тексты
  ru.ts                    Русские UI-тексты
  catalogs.en.ts           EN-поля по ID или адаптер текущих полей
  catalogs.ru.ts           Полные RU-тексты по тем же ID
  prompt.en.ts             Общие/условные шаблоны, CEFR, оформление длины
  prompt.ru.ts             Эквивалентные RU-шаблоны
  localePreference.ts      Защищённое чтение/запись интерфейсной локали
src/components/
  InterfaceLanguageSelect.tsx
  SceneActions.tsx          Общая группа справки и выбора языка
src/types/
  readingFailure.ts         Коды и параметры пользовательских ошибок
```

Разделение по файлам — рекомендация по поддержке, не требование создать универсальный фреймворк. Использовать Record/satisfies для ключей и параметров, дополнив проверкой точных наборов ID. Текущие каталоги аннотированы интерфейсами с `id: string`, поэтому один `Record<string, ...>` не докажет полноту перевода.

## Карта изменений

| Файл / группа | Предстоящее изменение |
| --- | --- |
| src/App.tsx | Группа действий, locale, локализованные объявления SPIN, locale-пропсы |
| src/motion/drumSpinController.ts | locale в ReadingSnapshot, changeInterfaceLocale, build с locale, атомарность перехода, structured failure |
| src/motion/useDrumSpin.ts | Начальный locale/snapshot из предпочтения, экспорт смены locale; прежние finish/cleanup |
| src/components/scene/initialReading.ts | Сохранить начальные settings/IDs; не переиспользовать единственный module-level EN-промпт для сохранённого RU |
| src/prompt/buildPrompt.ts | Третий аргумент locale; тексты после canonical check; vocabulary/return/status/visual/sourced |
| src/data/cefrLevels.ts | Число и порядок уровней сохранить; localized instruction отдельно от ключей |
| src/data/textLengths.ts | Общий расчёт отделить от localized description/instruction либо добавить locale без копирования числовых правил |
| src/data/languages.ts | Коды/lengthUnit сохранить; UI-названия и формы промпта брать по коду |
| src/random/compatibility.ts | Eligibility, pool/cache и веса сохранить; добавить к причинам код/параметры |
| src/components/HelpButton.tsx | Локализованная подпись, гибкая ширина, прежние ref/focus/aria-связи |
| src/components/HowToUse.tsx | Все тексты из словаря, пояснение двух языковых настроек; прежние dialog/Escape/focus/scroll-lock |
| src/components/scene/MachineScene.tsx | Слоган, колонки, meaningful title/desc и локаль дочерних контролов |
| src/components/scene/CompactMachine.tsx | Те же тексты, compact SPIN и labels; сверить финальный API при старте |
| src/components/scene/MachineSettings.tsx | 11 языков, длины, helper/tooltip/доступные имена в обеих раскладках |
| src/components/scene/drumData.ts | Canonical ID отдельно от подписи; локализация blank и соседей |
| src/motion/svgDrumMotion.ts | Все начальные/пролетающие/конечные строки в locale запуска, прежние порядок/тайминг |
| src/components/scene/DrumTypography.tsx, DrumLabel.tsx, MovingDrums.tsx | Локализованные строки, кириллица, переносы, совпадение последнего кадра с idle |
| src/components/scene/SpinControl.tsx | КРУТИТЬ/КРУТИТСЯ и доступное имя; сохранить hit target и механику |
| src/components/scene/PromptSheet.tsx | Заголовок, Copy, пустые состояния, статусы, tooltip, aria-label и скрытые reserve-строки |
| src/clipboard/promptCopier.ts, usePromptCopy.ts | Enum-статусы и epoch сохранить; copyMessages отделить от логики; сброс по revision |
| src/prompt/promptUpdateFeedback.ts | Механизм/длительность сохранить; текст из словаря, updateCount при изменении непустого промпта |
| src/App.css, src/index.css | Общая группа действий, список, русские ширины, шрифт и responsive |
| index.html и инициализация | EN в статическом HTML; document.lang и description активной локали; title Reading Roulette |
| docs/validation и проверки step 9/10/11 | Дополнить локализацией; сохранить прежний охват, EN-fixtures вызывать явно |

Старые ReadingSettingsForm/RouletteReel/MachineArtwork и motion-прототипы классифицировать по фактическому графу импортов. Активные ветки переводятся полностью. Архивные дизайн-материалы не переписываются; остающийся живой старый компонент получает locale. Наличие файла в src не означает, что он отображается.

## Контроллер

ReadingSnapshot получает `interfaceLocale`; ReadingSettings не получает locale. Selector по-прежнему зависит только от предметных настроек.

`changeInterfaceLocale(next)`:

1. Проверить en/ru, активность и синхронную блокировку preparing/run. Для прежнего значения выйти без изменений.
2. При combination собрать промпт из прежних settings/IDs в next locale. При combination=null сохранить пустой prompt и код текущей причины.
3. Одной публикацией применить locale, prompt и новую revision; spinCount сохранить. Повысить updateCount только при изменении непустого промпта. Не вызывать selector или prepareSvgDrums.
4. В браузерном слое сохранить успешный выбор, обновить document.lang/description и закрыть список. DOM/storage не помещать в чистую сборку промпта.
5. При сбое до публикации оставить прежний snapshot и показать locale-rebuild-failed на прежнем языке. Ошибка записи storage после публикации не откатывает рабочую локаль текущей вкладки.

В start сохранить locale в prepared from/to, передать её в build и подготовку рядов. ChangeSettings использует текущую locale и прежнюю семантику preserve/reset. Коды ошибок позволяют перевести уже показанную причину, включая combination=null.

Clipboard writer остаётся в пользовательском обработчике. Новая revision и prompt инвалидируют ответы прежней epoch, включая EN → RU → EN. Старый успех не подтверждает новый preview; автоматического копирования при смене языка нет.

## Этапы

| Этап | Работа | Критерий завершения |
| --- | --- | --- |
| 0. Сверка | Dirty checkout, compact/help, импорты и audits | Актуальная база понятна, чужие изменения сохранены |
| 1. Переводы | UI, 100 labels, остальные 319 catalog-полей, 15 CEFR, длина и prompt-ветки | Полнота по ID/полям/слотам, грамматическая редактура |
| 2. Сборщик | BuildPrompt с locale, общие расчёты, EN-регрессия | Два полных промпта с одинаковыми ограничениями |
| 3. Состояние | Начальная локаль, storage, атомарная смена, busy/empty/copy | Нет скрытой выборки и рассогласования preview/Copy |
| 4. Интерфейс | Переключатель возле help, desktop/compact/help | Полный EN/RU-цикл с клавиатурой |
| 5. Визуальная проверка | Кириллица, длинные labels, SVG/HTML, mobile/zoom | Читаемость без потери смысла и перекрытия контролов |
| 6. Приёмка | Регрессии, production build, реальный Browser/clipboard/доступность | Матрица QA выполнена, ограничения перечислены |
| 7. Выпуск | По отдельному поручению: commit/push, Actions/Pages, публичная проверка | Подтверждённая опубликованная версия; текущая задача этап не запускает |

Главный объём работы — редактура полных переводов, затем controller/clipboard и визуальная проверка RU. Кнопка сама по себе не означает готовность мультиязычности.

## Риски

| Риск | Решение |
| --- | --- |
| Canonical check возвращает EN-объекты | Переводы по возвращённым ID после проверки |
| В RU остались EN-инструкции | Проверить все 419 catalog-полей и условные блоки |
| Locale изменяет язык чтения/комбинацию | Отдельный тип, проверки settings/IDs и отсутствия RNG |
| Переведена лишь итоговая строка | Единая подготовка всех rows в locale запуска |
| Смена языка нарушает prepared run | UI- и controller-блокировка, locale зафиксирована в run |
| Старый copy-success подтверждает новый preview | Revision + epochs, включая EN → RU → EN |
| Русский help обрезан | Гибкий HTML-контрол и responsive-просмотр |
| В ошибке raw английский reason | Машинные коды/параметры и локализованный fallback |
| Перед сохранённым RU мелькает EN | Начальный snapshot сразу собирается с locale |
| Checkout меняется параллельно | Повторная сверка перед работой, без перезаписи чужих правок |

## Архивный промпт исходного этапа

Подготовлен для копирования после поручения на реализацию. Наличие текста не запускает работу.

```text
Работай в D:\Dev\Projects\Reading-Roulette. Реализуй локально EN/RU по docs/localization/README.md и связанным спецификациям, включая docs/design/LOCALIZATION_EN_RU.md. Публикация не входит в этап.

Прочитай действующие AGENTS.md и git status. Сохрани существующие незакоммиченные изменения; проверь актуальные compact/help и импорты. Не используй reset/clean/stash или операции, способные потерять изменения/историю. Перед потенциально разрушительными действиями требуется подтверждение по AGENTS.md. Commit/push и deployment выполняются только при соответствующем поручении.

Первый визит EN, второй язык RU. Явный выбор сохраняется локально с безопасным fallback, без автоопределения браузера. Возле How to use создай кнопку с локальным флагом, EN/RU и списком English / Русский в стиле v10. Переведи весь активный интерфейс, справку, доступные имена, ошибки, обе раскладки и все подписи барабанов. Reading Roulette и декоративные буквы сохраняются.

Язык интерфейса определяет язык инструкций промпта и объяснений словарика. 11 языков учебного текста остаются отдельной настройкой. Смена locale сразу пересобирает текущий промпт и labels по тем же canonical ID, без RNG, SPIN, смены settings и прокрутки. На пустом результате оставь явную просьбу SPIN; во время подготовки/анимации выбор locale заблокирован в UI и контроллере. Сохрани атомарность prepared result/prompt, reduced motion, механику и вероятности.

Подготовь статический перевод всех 419 catalog-полей, повторно сверив количество, 15 CEFR-инструкций, восьми моделей объёма, статусов, sources/visual/partial-result/vocabulary. Переводы по ID получай после canonical check; allowlists и числовые правила не меняй. RU-инструкции целиком русские. При RU + English основной текст английский, meanings русские; при RU + Russian нужны простые русские определения.

Сохрани preview/Copy равными. Инвалидируй устаревшие copy-ответы по revision/epoch, включая EN → RU → EN. Пользовательские ошибки отображай по кодам/параметрам. Backend/API/переводчики/роутинг/новые зависимости не нужны.

Выполни docs/localization/QA.md: EN-регрессия, полнота переводов, TypeScript, production build с /reading-roulette/, реальные UI/clipboard/keyboard-проверки. Существующие аудиты пишут артефакты — проверь diff.

Dev: pnpm dev --host 127.0.0.1 --port 5173 --strictPort; ожидаемый URL http://127.0.0.1:5173/. Если порт занят, проверь процесс и выбери свободный порт, не останавливая чужой сервер. Сообщи фактически работающий URL. Deployment build: pnpm build --base=/reading-roulette/. Preview с соответствующим сервером/свободным портом: http://127.0.0.1:4173/reading-roulette/.

Используй встроенный Browser. Не запускай Edge или другой внешний браузер без согласованного выбора. Если Browser недоступен, перечисли непроверенные сценарии; HTTP 200 и SVG-render не считать интерактивной приёмкой.

Обнови документацию по фактическому результату. Сообщи изменения, выполненные проверки, рабочий URL и ограничения. Не утверждай, что RU опубликован.
```
