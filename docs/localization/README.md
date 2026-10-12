# Локализация Reading Roulette: English / Русский

> **Текущий релиз:** English/Russian для интерфейса и инструкций промпта доступны в опубликованной версии v10 на [GitHub Pages](https://iaroslav-tkachenko.github.io/reading-roulette/). [GitHub Actions завершился успешно 12 октября 2026 года](https://github.com/iaroslav-tkachenko/reading-roulette/actions/runs/38276444762). Реализация и проверки описаны в [IMPLEMENTATION.md](IMPLEMENTATION.md).

## Продуктовое поведение

Выбор Русский сразу переводит интерфейс, текущую комбинацию и инструкции промпта, сохраняя язык изучаемого текста, уровень, длину и ID идеи. Повторный SPIN нужен только для новой идеи или уже пустого результата. Промпт собирается локально из подготовленных переводов; запрос к переводчику или модели не требуется.

## Документы

| Документ | Содержание |
| --- | --- |
| [SPECIFICATION.md](SPECIFICATION.md) | Продуктовые решения, языки, сохранение выбора, состояния, границы задачи |
| [Дизайн переключателя](../design/LOCALIZATION_EN_RU.md) | Место возле How to use, флаги, мобильная версия, клавиатура, типографика |
| [UI_COPY.md](UI_COPY.md) | EN/RU-тексты интерфейса, справки, статусов и ошибок |
| [CATALOG_TRANSLATIONS.md](CATALOG_TRANSLATIONS.md) | 100 пар подписей: 26 тем, 44 формата, 30 ракурсов; объём перевода данных |
| [PROMPT_LOCALIZATION.md](PROMPT_LOCALIZATION.md) | Русский шаблон промпта, все условные блоки, словарик и разделение языков |
| [IMPLEMENTATION_PLAN.md](IMPLEMENTATION_PLAN.md) | Архивный план и handoff исходного этапа |
| [QA.md](QA.md) | Критерии локализации и ссылка на выполненные проверки |
| [IMPLEMENTATION.md](IMPLEMENTATION.md) | Реализация, проверки и артефакты |

## Основание и актуальность

Спецификация и отчёты сопоставляют EN/RU-поведение с опубликованным приложением и текущими исходниками. Датированные планы и QA-заметки сохраняют контекст своих этапов; текущий статус релиза приведён вверху этой страницы и в [DEPLOYMENT.md](../DEPLOYMENT.md).

Изученные точки входа: [App.tsx](../../src/App.tsx), [buildPrompt.ts](../../src/prompt/buildPrompt.ts), [контроллер SPIN](../../src/motion/drumSpinController.ts), [MachineSettings.tsx](../../src/components/scene/MachineSettings.tsx), [PromptSheet.tsx](../../src/components/scene/PromptSheet.tsx), [HowToUse.tsx](../../src/components/HowToUse.tsx), [совместимость](../../src/random/compatibility.ts), [языки чтения](../LANGUAGES.md).

UI-словарь, 100 подписей и все 419 текстовых полей каталогов подключены в [src/i18n](../../src/i18n). Русский общий шаблон и условные sourced/visual/training/length/vocabulary-блоки используются сборщиком промпта. Английские канонические данные и предметные правила сохраняются; переводы проверены отдельно от совместимости.

Разделение интерфейсного языка, языка чтения и языка промпта сохраняет единый сценарий на широких экранах и телефонах. Текущий релиз и проверки описаны в [DEPLOYMENT.md](../DEPLOYMENT.md) и [IMPLEMENTATION.md](IMPLEMENTATION.md); исходный план оставлен как историческая запись.
