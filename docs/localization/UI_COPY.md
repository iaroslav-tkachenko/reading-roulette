# EN/RU: тексты интерфейса

Дата: 2026-10-11. Реализовано 2026-10-12 в src/i18n/messages.ts; таблицы сохраняют основу спецификации. [Навигация](README.md).

Ключи ниже — предлагаемый стабильный контракт будущего словаря. Значения в фигурных скобках подставляются целиком через типизированные параметры. Знак галочки и иконки можно рисовать отдельно. CEFR-коды, бренд и названия экзаменов не переводятся. Для uppercase SVG-подписей использовать тот же перевод с предусмотренным оформлением, а не второй независимый словарь.

## Основной экран и переключатель

| Ключ | English | Русский |
| --- | --- | --- |
| brand.name | Reading Roulette | Reading Roulette |
| brand.tagline | Try your luck. Find your next great read. | Испытайте удачу. Найдите новую идею для чтения. |
| page.description | Build a reading prompt for your language, level, and curiosity. | Создайте промпт для чтения на интересную тему с учётом языка и уровня. |
| locale.label | Interface language | Язык интерфейса |
| locale.trigger | Interface language: {language} | Язык интерфейса: {language} |
| locale.english | English | English |
| locale.russian | Русский | Русский |
| locale.busy | Change the language after the drums stop. | Язык можно изменить после остановки барабанов. |
| locale.changed | Interface and prompt language changed to English. | Интерфейс и промпт переведены на русский. |
| help.open | How to use | Как пользоваться |
| help.button | How to use | Инструкция |
| settings.language | Text language | Язык текста |
| settings.level | CEFR level | Уровень CEFR |
| settings.length | Text length | Длина текста |
| length.short | Short | Короткая |
| length.medium | Medium | Средняя |
| length.long | Long | Длинная |
| reel.topic | Topic | Тема |
| reel.format | Format | Формат |
| reel.angle | Angle | Ракурс |
| reel.blank | Press SPIN | Нажмите «Крутить» |
| reel.group | Topic, format and angle | Тема, формат и ракурс |
| reel.description | Current result and neighboring entries from the real catalogs | Текущий результат и соседние варианты из каталогов |
| spin.action | SPIN | Крутить |
| spin.busy | SPINNING… | Крутим… |
| spin.wait | Roulette is spinning. Please wait for all three drums to stop. | Барабаны крутятся. Дождитесь остановки всех трёх. |
| spin.result | Spin {count}: {topic}; {format}; {angle}. | Результат {count}: {topic}; {format}; {angle}. |
| scene.instructions | Choose a language, CEFR level and text length, then press SPIN for a random result. | Выберите язык текста, уровень CEFR и длину, затем нажмите «Крутить», чтобы получить случайную идею. |
| scene.result | Current combination: {topic}, {format}, {angle}. | Текущая комбинация: {topic}, {format}, {angle}. |
| prompt.heading | Prompt preview | Готовый промпт |
| prompt.accessibleName | Reading prompt | Промпт для чтения |
| prompt.updated | Prompt updated | Промпт обновлён |
| prompt.empty | Press SPIN to prepare a text for these settings. | Нажмите «Крутить», чтобы подготовить промпт с этими настройками. |
| copy.action | Copy prompt | Копировать промпт |
| copy.title | Copy the full prompt | Скопировать промпт целиком |
| copy.idle | Paste into your preferred AI chat. | Вставьте промпт в удобный вам ИИ-чат. |
| copy.pending | Copying prompt… | Копируем промпт… |
| copy.success | Prompt copied. Paste it into your AI chat. | Промпт скопирован. Вставьте его в ИИ-чат. |
| copy.error | Could not copy automatically. Select the prompt and copy it manually. | Не удалось скопировать автоматически. Выделите промпт и скопируйте вручную. |
| copy.spinning | Roulette is spinning… Copy will be available when it stops. | Барабаны крутятся… Копирование станет доступно после остановки. |
| copy.empty | Press SPIN to prepare a valid prompt. | Нажмите «Крутить», чтобы подготовить промпт. |

`locale.changed` используется только для фактического перехода в соответствующую локаль. Не озвучивать одновременно несколько почти одинаковых live-region сообщений: одно объявление должно сообщить, что интерфейс и промпт обновлены; полное содержимое промпта не читать автоматически.

## Языки чтения

Порядок и коды сохраняются по [LANGUAGES.md](../LANGUAGES.md). Полное название используется в tooltip и инструкциях промпта; компактное — в select.

| Код | EN: поле / полное название | RU: поле / полное название |
| --- | --- | --- |
| en | English | Английский |
| es | Spanish | Испанский |
| fr | French | Французский |
| ja | Japanese | Японский |
| de | German | Немецкий |
| ko | Korean | Корейский |
| it | Italian | Итальянский |
| zh | Chinese / Chinese (Mandarin) | Китайский / Китайский (мандаринский) |
| ru | Russian | Русский |
| pt | Portuguese | Португальский |
| sr | Serbian | Сербский |

Для русского предложения первой строки промпта нужны готовые формы: «на английском языке», «на испанском языке», «на французском языке», «на японском языке», «на немецком языке», «на корейском языке», «на итальянском языке», «на китайском языке (мандаринском)», «на русском языке», «на португальском языке», «на сербском языке». Хранить их по коду; не строить формы заменой окончания в UI-label.

## Helper длины

| Ключ | English | Русский |
| --- | --- | --- |
| length.unavailable | {length} · unavailable for this format | {length} · недоступна для этого формата |
| length.fields | Short · 4–8 fields | Короткая · 4–8 полей |
| length.items | {length} · {range} items | {length} · {range} позиций |
| length.compact | Short · one compact message | Короткая · одно краткое сообщение |
| length.compactWords | Short · 20–60 words | Короткая · 20–60 слов |
| length.structure | {length} · structured text for {level} | {length} · структурированный текст уровня {level} |
| length.words | {length} · {range} words | {length} · {range} слов |
| length.needsSpin | {length} · press SPIN to find a text | {length} · нажмите «Крутить», чтобы получить идею |

Ни один перевод helper не изменяет диапазон или модель измерения. Вариант Short в field-model остаётся единственным разрешённым вариантом, а китайский/японский не получают придуманный пересчёт в слова или знаки.

## Справка целиком

| Ключ | English | Русский |
| --- | --- | --- |
| help.title | Read with confidence | Читайте увереннее |
| help.close | Close instructions | Закрыть инструкцию |
| help.region | Reading guide | Руководство по чтению |
| help.lead | Preparing for a language exam like IELTS, Goethe-Zertifikat, DELE or DELF? Or just working on your reading skills? | Готовитесь к языковому экзамену — IELTS, Goethe-Zertifikat, DELE или DELF? Или просто хотите лучше понимать тексты на иностранном языке? |
| help.body | Find fresh ideas for stories, articles, letters and dialogues at your level. Practise understanding the main idea, noticing details and learning words in context. | Находите новые идеи для рассказов, статей, писем и диалогов вашего уровня. Учитесь понимать главную мысль, замечать детали и запоминать слова в контексте. |
| help.factLanguages | Languages | Языков для чтения |
| help.factLevels | Levels | Уровни |
| help.factLevelsValue | A1 to C2 | От A1 до C2 |
| help.factIdeas | Reading ideas | Идей для чтения |
| help.factIdeasValue | {readingIdeaCount} | {readingIdeaCount} |
| help.stepsTitle | How to use | Как пользоваться |
| help.step1 | Choose your reading language, level and text length. | Выберите язык учебного текста, уровень и длину. |
| help.step2 | Press SPIN for a reading idea. | Нажмите «Крутить», чтобы получить идею для чтения. |
| help.step3 | Press Copy prompt and paste it into an AI chat to create your practice text. | Нажмите «Копировать промпт» и вставьте его в ИИ-чат, чтобы создать учебный текст. |
| help.localeNote | The language button changes the interface and prompt. Choose the reading language on the machine. | Кнопка языка переводит интерфейс и промпт. Язык учебного текста выбирается на машине. |

Количество языков сейчас 11. Справка показывает согласованные `4,300+ / Reading ideas` и `4 300+ / Идей для чтения`: аудит подтверждает 4 310 уникальных допустимых троек Topic × Format × Angle по всем настройкам CEFR/длины, без умножения на языки. На узком экране счётчик идей занимает отдельную строку; языки и уровни расположены ниже. Исторический ключ help.factTopics в справке не отображается.

## Пользовательские ошибки

Переводить по машинному коду и параметрам, без сравнения английских строк и без показа raw `Error.message` в RU. Техническая детализация остаётся в диагностике. Текущие причины в compatibility/controller требуют такого адаптера.

| Предлагаемый код | English | Русский |
| --- | --- | --- |
| needs-higher-profile | This combination needs a higher content profile than {profile}. Press SPIN to find another text. | Эта комбинация требует более сложного содержания, чем допускает профиль {profile}. Нажмите «Крутить», чтобы получить другую идею. |
| missing-disclosure | This topic has no approved disclosure for {profile}. Press SPIN to find another text. | Для этой темы нет сценария профиля {profile}. Нажмите «Крутить», чтобы получить другую идею. |
| unsupported-length | This format is unavailable for {length}. Press SPIN to find another text. | Для этого формата недоступна выбранная длина: {length}. Нажмите «Крутить», чтобы получить другую идею. |
| unavailable-family | This reading family is unavailable at this level. Press SPIN to find another text. | Эта группа форматов недоступна на выбранном уровне. Нажмите «Крутить», чтобы получить другую идею. |
| incompatible-scenario | This topic, format and angle do not have an approved shared scenario. Press SPIN to find another text. | Для этой темы, формата и ракурса нет совместимого сценария. Нажмите «Крутить», чтобы получить другую идею. |
| short-structure | The required structure does not fit Short for this angle. Press SPIN to find another text. | Для этого ракурса нужная структура не помещается в короткий текст. Нажмите «Крутить», чтобы получить другую идею. |
| unknown-catalog-id | Unknown catalog entry. Press SPIN to find another text. | Не удалось найти вариант в каталоге. Нажмите «Крутить», чтобы получить другую идею. |
| no-combinations | No compatible reading combinations for these settings. Change the settings and press SPIN. | Для этих настроек нет совместимых комбинаций. Измените настройки и нажмите «Крутить». |
| needs-spin | Press SPIN to find a text for these settings. | Нажмите «Крутить», чтобы получить идею с этими настройками. |
| prepare-failed | Could not prepare a reading prompt. Please try SPIN again. | Не удалось подготовить промпт. Нажмите «Крутить» ещё раз. |
| update-failed | Could not update the reading settings. Please press SPIN again. | Не удалось обновить настройки чтения. Нажмите «Крутить» ещё раз. |
| unknown-level | Unknown difficulty. Choose a level and press SPIN. | Неизвестный уровень сложности. Выберите уровень и нажмите «Крутить». |
| unknown-length | Unknown text length. Choose a length and press SPIN. | Неизвестная длина текста. Выберите длину и нажмите «Крутить». |
| unknown-reading-language | Unknown reading language. Choose a language and press SPIN. | Неизвестный язык текста. Выберите язык и нажмите «Крутить». |
| locale-rebuild-failed | Could not change the interface and prompt language. Please try again. | Не удалось изменить язык интерфейса и промпта. Попробуйте ещё раз. |

## Редакторские правила

«Промпт» употребляется одинаково на кнопке, в справке и статусах. Angle переводится как «Ракурс», без возвращения Tone. «Крутить» — видимая подпись SPIN; в справке и ошибках используется то же действие. Русский текст сохраняет вежливое обращение и не требует объяснять пользователю устройство каталогов или локализации.

Декоративные SVG title с названиями технических слоёв не нужно выводить пользователю: пометить соответствующий декор скрытым для assistive technology. Содержательные title/desc и aria-label активных групп переводить. Проверить также скрытые строки, резервирующие место для copy.error и prompt.updated: они должны брать значения текущего языка.
