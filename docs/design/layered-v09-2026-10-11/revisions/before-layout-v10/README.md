# Исправление v9: пропорции настольных предметов и выход бумаги

[Открыть макет v9](http://127.0.0.1:5173/docs/design/layered-v09-2026-10-11/?v=9)

- Лампа с вертикальными книгами увеличена пропорционально на 25.9% (ширина 205 → 258). Основание осталось на прежней глубине стола; предмет сдвинут левее, чтобы плафон не касался машины.
- Передняя стопка книг увеличена на 37.8% (225 → 310) и немного приближена к переднему плану.
- Стакан с ручками увеличен на 43.9% (114 → 164). Основание опущено с 744 до 780, что согласует его положение с передней частью машинки. Это визуальная настройка перспективы без заданных физических размеров.
- Ширина листа уменьшена с 918 до 856 (на 6.75%). Верхний край опущен на 9 единиц: щель видна сверху и с боков. Добавлена затухающая тень на верхних 12 единицах бумаги.
- Текст остаётся полным и переносится по новой ширине листа. Масштаб машины, окно, шкаф и глобус сохранены; исходные PNG не менялись.

Предыдущая сборка сохранена в revisions/before-layout-v9/. Новые изображения не генерировались: изменены только размеры и положения существующих слоёв, ширина бумаги и тень.

Проверка: 27 проверок и 43 ресурса HTTP 200. Дополнительно подтверждено совпадение machine.svg и координат окна/шкафа с v8. Просмотрены офлайн-иллюстрации шириной 1536, 1920 и 4608, включая полный промпт. HTML и браузерный зум остаются непроверенными: повторное подключение встроенного Browser завершилось EPERM. Результаты — verification.json.

<details>
<summary>Предыдущие изменения v8 и ранее</summary>

# Исправление v8: полное окно и шкаф по бокам

[Открыть макет v8](http://127.0.0.1:5173/docs/design/layered-v09-2026-10-11/?v=8) · [Отдельные слои](http://127.0.0.1:5173/docs/design/layered-v09-2026-10-11/layers.html)

- Окно с листьями дорисовано влево, шкаф с глобусом — вправо. Это два цельных прозрачных PNG, а не обрезанные участки общего фона. Ближние к машинке края закреплены на x210 и x1364 в её системе координат.
- Новые объекты имеют полные внешние контуры. Они выходят за номинальную ширину машины и показываются целиком, когда ширина окна позволяет, в том числе при отдалении страницы. У них нет маски, которая срезала бы внешний край.
- Стена и стол остаются отдельными слоями. Их граница и все предметы движутся вместе с машинкой при прокрутке.
- Машинка и её подписи не изменились: machine.svg совпадает с сохранённым вариантом v7. Настольные предметы и полный промпт сохранены.

Новые файлы: assets/study-window-wide-v8.png и assets/study-bookcase-wide-v8.png. Созданы встроенным ImageGen, точные запросы — generation-prompts-v8.json. До изменений сохранены файлы сборки в revisions/before-layout-v8/. Всего 14 уникальных PNG и 42 обращения к растровым слоям в HTML; галерея показывает все 14.

Проверка: 27 проверок, 43 ресурса HTTP 200. Проверены прозрачность, пропорциональное масштабирование, запас вокруг контуров и продолжение объектов наружу при закреплённых внутренних краях. Просмотрены офлайн-рендеры шириной 1536, 1920 и 4608; создан полный вид assembly-render-v8.png. Они не являются браузерными скриншотами. Реальная HTML-раскладка и браузерный зум остаются непроверенными: встроенный Browser ранее завершился EPERM.

<details>
<summary>Предыдущие изменения v7 и ранее</summary>

# Исправление v7: цельные предметы и компактная машинка

[Открыть макет v7](http://127.0.0.1:5173/docs/design/layered-v09-2026-10-11/?v=7) · [Посмотреть отдельные детали](http://127.0.0.1:5173/docs/design/layered-v09-2026-10-11/layers.html)

- Стакан с ручками больше не разделён между стеной и столом. Это один прозрачный слой assets/desk-pen-cup-v7.png, полностью видимый, с основанием на столешнице. Из фона прежний стакан удалён.
- Лампа с книгами и передняя стопка книг дорисованы целиком, с полными контурами и прозрачным запасом вокруг: assets/desk-lamp-books-v7.png и assets/desk-books-v7.png. Все три предмета размещаются после слоёв стены и столешницы и не обрезаются их масками.
- Новый фон assets/study-shell-v7.png содержит кабинет и пустой стол без настольных предметов. Окно, растения, полка и глобус сохранены.
- Нижний корпус assets/chassis-v3.png перерисован с менее глубокой красной площадкой. Детали масштабируются пропорционально. Высота SVG машины уменьшена с 805 до 754 единиц (около 6.3%), верхняя часть и ширина сохранены. Лист начинается на 675 вместо 726: поднят на 51 единицу.
- Ряды клавиш подняты на 20 единиц. Зазоры над и под ними теперь около 14 и 16 единиц, вместо прежних 34. Передний бортик отмечен визуально по изображению.
- Круговая стрелка SPIN уменьшена до 80% прежнего размера, её положение согласовано с подписью и новой площадкой.

Пять новых изображений созданы встроенным ImageGen; точные запросы сохранены в generation-prompts-v7.json. Все файлы проекта находятся в assets/, исходные и промежуточные варианты сохранены. Снимок файлов до исправления — revisions/before-layout-v7/.

Всего 12 уникальных PNG: 28 растровых экземпляров машины, 2 бумаги, 8 обращений в комнате и текстурах, 3 цельных предмета; 41 обращение к PNG в HTML. В галерее доступны все 12 исходных деталей. Основной React-интерфейс на этом шаге не менялся; макет статичный.

Проверка: 25 проверок, 38 ресурсов HTTP 200. Проверены пропорции и прозрачность всех отдельных объектов, запас внутри исходных PNG, компактность корпуса, полный промпт, совместная прокрутка и расчёт геометрии для 10 размеров окна. Просмотрены офлайн-рендеры шириной 1536 и 4608; дополнительно создан полный вид assembly-render-v7.png и обычный viewport-render-v7.png. Это иллюстрации SVG с номинальными переносами текста. HTML-раскладка и зум в реальном браузере остаются непроверенными: Browser на предыдущем шаге завершился EPERM.

<details>
<summary>Предыдущие изменения v6 и ранее</summary>

# Исправление v6: декор ближе к машинке

[Открыть макет v6](http://127.0.0.1:5173/docs/design/layered-v09-2026-10-11/?v=6)

Причина: декоративная часть фона имела минимальную ширину 1920 и растягивалась на всё окно. На обычной ширине часть предметов обрезалась, при уменьшенном масштабе браузера предметы расходились далеко от машины.

- Область с предметами теперь масштабируется вместе с машиной: ширина 1612.8 на машину шириной 1536 (1.05), вместо прежних 1920 и расширения до ширины окна.
- Лампа, окно и книги слева, полка, глобус и стакан с ручками справа видны ближе к машине. Верхние детали не закрывают заголовок, вокруг корпуса сохранён зазор.
- По бокам добавлен отдельный слой спокойной стены из середины исходного PNG. Стол заполняется текстурой дерева с зеркальным повтором, без жёстких стыков плитки. Края декоративной области плавно смешиваются с этими слоями.
- Фон и стол продолжают прокручиваться вместе с машиной. Положение столешницы сохраняется при изменении масштаба.
- Новые изображения не генерировались: используются SVG-слои прежнего study-clear-v3.png. По-прежнему 9 разных PNG; с повторениями текстур всего 38 растровых экземпляров.
- Предыдущая версия сохранена в revisions/before-layout-v6/.

Проверка: 22 проверки и 31 ресурс HTTP 200. Расчёт геометрии для 10 размеров окна, включая ширину 4608; офлайн-иллюстрации шириной 1536, 1920 и 4608. Иллюстрация 4608 показывает широкое окно при уменьшенном масштабе концептуально, это не браузерный скриншот с зумом. Реальная HTML-раскладка остаётся непроверенной: на предыдущем шаге Browser был недоступен из-за EPERM.

Основной React-интерфейс не менялся. Комната остаётся отдельными SVG-слоями в документе; машинка не вставлена в фон.

<details>
<summary>Предыдущие изменения v5 и ранее</summary>

# Исправление v5: стол прокручивается вместе с машинкой

[Открыть исправленную сцену](http://127.0.0.1:5173/docs/design/layered-v09-2026-10-11/?v=5)

Причина: фон имел position:fixed, а машина и промпт прокручивались в документе. При прокрутке ножки оказывались над стеной вместо столешницы.

- Фон теперь абсолютный слой в том же документе. Стена, стол, машина и выходной лист движутся вместе.
- Граница стены и стола привязана к масштабу машины: 594 единицы при ширине машины 1536. Высота окна и длина промпта не сдвигают эту границу.
- Фон разделён на стену и столешницу через SVG viewBox исходного PNG. Под длинным промптом стол продолжается текстурой дерева с плавным переходом; вертикальный передний край отсутствует.
- Сохранены подписи настроек и стрелка из v4. CSS подключается с версией v5, чтобы обновление не зависело от старого query в адресе страницы.
- Новые растровые изображения не создавались. В комнате четыре обращения к прежнему фону (два для зеркальной текстуры дерева); всего 34 растровых экземпляра и по-прежнему 9 разных PNG.
- Код комнаты вынесен в room-backdrop.mjs; он используется в HTML и офлайн-иллюстрациях. Предыдущие файлы сохранены в revisions/before-layout-v5/.

Проверка: 21 проверка, 31 ресурс HTTP 200. Рассчитаны положение ножек относительно стола и неизменность этого расстояния при прокрутке 0 / 200 / 600 / 1000 для 9 размеров окна. Это расчёт CSS-геометрии, а не браузерное измерение. Просмотрены офлайн-иллюстрации assembly-render-v5.png и scroll-render-v5.png (сдвиг на 350 единиц).

Повторное подключение встроенного Browser завершилось EPERM realpath browser-client.mjs. Реальная браузерная прокрутка не проверена. Основной React-интерфейс не менялся.

<details>
<summary>Предыдущие изменения v4 и ранее</summary>

# Исправления v4: подписи настроек и указатель прокрутки

[Открыть макет v4](http://127.0.0.1:5173/docs/design/layered-v09-2026-10-11/?v=4)

- LANGUAGE, CEFR LEVEL и TEXT LENGTH опущены на 6 единиц макета: базовая линия 296 вместо 290. Подписи размещены примерно посередине между верхним краем внутренней панели и полями.
- Рядом с Prompt preview добавлена небольшая бордовая стрелка вниз, отдельный SVG-элемент. Она указывает на продолжение полного промпта ниже. Прокручивается вся страница.
- Стрелка включена и в HTML-макет, и в офлайн-иллюстрации. Новый растр не создавался.
- Состояние перед правкой сохранено в revisions/before-layout-v4/.

Проверка: существующие 21 проверки и 31 HTTP-ресурс; офлайн-рендеры viewport-render-v4.png и assembly-render-v4.png. Браузерная раскладка остаётся непроверенной; на предыдущем шаге Browser был недоступен из-за EPERM.

<details>
<summary>Предыдущие изменения v3 и ранее</summary>

# Статичная послойная сборка v09 — исправления v3

[Открыть исправленный макет](http://127.0.0.1:5173/docs/design/layered-v09-2026-10-11/?v=3) · [Отдельные слои](http://127.0.0.1:5173/docs/design/layered-v09-2026-10-11/layers.html)

Изменения по последним двум скриншотам пользователя:

- Открытый попап How to use удалён. Маленькая статичная кнопка справки оставлена справа сверху.
- Общий верхний отступ уменьшен на 64 единицы макета: заголовок, подзаголовок, настройки и барабаны подняты вместе. Пропорции деталей сохранены через viewBox 0 64 1536 805.
- Отдельно перерисован нижний корпус: assets/chassis-v2.png. Площадка клавиатуры стала глубже; изображение масштабируется пропорционально, без растягивания. Её передний бортик перемещён вниз, передняя стенка и бумажная щель сохранены.
- Клавиши и SPIN расставлены внутри новой площадки. Зазор между нижним краем рамы и верхним рядом клавиш — 33.8 единицы, между нижним рядом и передним бортиком — примерно 34.2. Положение бортика определено визуально по растровой детали. Буквы и подпись SPIN остаются отдельными SVG-элементами.
- Фон перерисован как assets/study-clear-v3.png (1585 × 992): лампа и книги сдвинуты влево, глобус и стакан с ручками — вправо, карты и бумаги за заголовком убраны. Центральная стена и стол свободнее. Фон заполняет окно отдельным фиксированным слоем; переднего вертикального края стола нет.
- Полный реальный промпт сохранён: 1088 символов, 9 абзацев. Выходной лист растёт по тексту, вся страница прокручивается естественно.

Новые PNG созданы встроенным ImageGen. Точные запросы и исходные изображения указаны в generation-prompts-v3.json. Старые версии PNG сохранены; состояние перед этой правкой — в revisions/before-layout-v3/. Основной React-интерфейс на этом шаге не изменялся. Макет статичный, без обработчиков и анимации.

Проверено: 21 проверка структуры, пропорций, прозрачности, полного промпта, отсутствия попапа и отступов клавиатуры. 31 ресурс доступен по HTTP. Покрытие фоном рассчитано для 9 размеров окна. Просмотрены офлайн-рендеры viewport-render-v3.png (1920 × 1000) и assembly-render-v3.png (1920 × 1614). Это SVG-иллюстрации той же сборки с номинальными переносами текста, а не браузерные скриншоты.

Встроенный Browser повторно недоступен: EPERM realpath browser-client.mjs. Реальное браузерное расположение HTML, загрузка шрифта и мобильные переносы не проверены. Внешний браузер не запускался.

Повторить сборку и проверки:

~~~powershell
node docs/design/layered-v09-2026-10-11/inspect.mjs
node docs/design/layered-v09-2026-10-11/assemble.mjs
node docs/design/layered-v09-2026-10-11/verify.mjs
~~~

<details>
<summary>Описание предыдущих исправлений v2</summary>

# Статичная послойная сборка v09 — исправления v2

[Открыть текущую сборку](http://127.0.0.1:5173/docs/design/layered-v09-2026-10-11/) · [Все детали](http://127.0.0.1:5173/docs/design/layered-v09-2026-10-11/layers.html)

Исправления по скриншоту пользователя:

- Верхний ряд клавиш поднят на 10 единиц, нижний — на 12. Базовая линия букв внутри клавиш поднята ещё на 4 единицы, размер букв уменьшен с 23 до 21.
- SPIN перерисован по исходному v09 как одна согласованная деталь корпуса и бирюзовой поверхности. Вместо сборки из двух независимо нарисованных частей используется `assets/spin-button-v3.png`; надпись и стрелка остаются отдельными SVG-элементами. Общая кнопка размещена на площадке в координатах 635 / 593, ширина 298.
- Панель настроек поднята на 14 единиц, подписи — на 11. Зазор от базовой линии подписи до верхнего края поля увеличен с 7 до 20 единиц. Оставлено больше пространства сверху и снизу.
- Подзаголовок поднят на 24 единицы: базовая линия 225 вместо 249.
- Добавлен расширенный фон `assets/study-expanded-v2.png`: больше пространства вокруг композиции, столешница продолжается до нижней границы, передней вертикальной стенки стола нет. Фон заполняет окно через отдельный фиксированный слой с `background-size: cover`; масштаб машины больше не зависит от высоты окна. Фактический файл — 1586 × 992, это расширение композиции, а не 4K-мастер. Качество при сильном увеличении не проверено.
- Вместо короткого образца вставлен полный реальный промпт из `src/prompt/buildPrompt.ts`: English / B1+ / Medium, Travel / Short story / Unexpected discovery. 1088 символов, 9 абзацев. Сохранены `real-prompt.txt` и `prompt-fixture.json`.
- Выходной лист теперь растёт по содержимому. Текст находится в HTML, переносится по ширине и прокручивается вместе со страницей. На узких экранах ширина листа увеличивается до 90% окна. Бумага собрана из текстуры середины и отдельного рваного края; короткий лист не растягивается по вертикали.

Страница остаётся статичной: SPIN, Copy, настройки и подсказка не имеют обработчиков. Основной React-интерфейс не изменялся на этом шаге. Предыдущие файлы сборки сохранены в `revisions/before-layout-v2/`, исходные PNG и варианты остаются в `assets/`.

Сейчас используются 9 разных PNG: 28 растровых экземпляров в машине, два слоя бумаги и отдельный фон. Весь интерфейс не вставлен одной картинкой. `machine.svg` — та же прозрачная машина, которая размещена в HTML. `scene.svg` и `viewport.svg` — отдельные иллюстрации для офлайн-проверки, с теми же деталями и реальным промптом; переносы текста в них заданы для номинального десктопного размера.

Проверка: 18 проверок структуры, прозрачности, масштаба, реального промпта и CSS; 30 ресурсов доступны по HTTP. Для 9 размеров окна рассчитано заполнение фоном без открытых полей. Это расчёт CSS-геометрии, а не измерение браузера. Офлайн-рендеры: `viewport-render-v2.png` (1920 × 1000) и `assembly-render-v2.png` (1920 × 1611). Длинная иллюстрация продолжает дерево ниже первого экрана для показа листа; в HTML используется фиксированный фон.

Встроенный Browser снова завершился ошибкой EPERM при подключении. Реальные браузерные скриншоты, переносы HTML и мобильная раскладка не проверены. Внешний браузер не запускался.

Повторить сборку и проверки:

```powershell
node docs/design/layered-v09-2026-10-11/inspect.mjs
node docs/design/layered-v09-2026-10-11/assemble.mjs
node docs/design/layered-v09-2026-10-11/verify.mjs
```

`prompt-fixture.mjs` использует встроенное удаление TypeScript-типов Node и исполняет чистый генератор только во время сборки. Браузерного JavaScript для промпта нет. Новые изображения созданы встроенным ImageGen; точные запросы сохранены в `generation-prompts-v2.json`. Новый код раскладки находится в `layout-v2.mjs`.

<details>
<summary>Историческое описание первой версии сборки</summary>

## Static layered reconstruction of original v09 — initial version

Open the assembled page at:

http://127.0.0.1:5173/docs/design/layered-v09-2026-10-11/

Open the layer gallery at:

http://127.0.0.1:5173/docs/design/layered-v09-2026-10-11/layers.html

This is a separate static design proof requested on 2026-10-11. It contains no product interaction or animation. Existing React app, previous restoration attempt and previous artwork are preserved. There is no commit, publication or deployment as part of this proof.

## What was added

- Empty study background redrawn from the approved original `../references/reading-roulette-evening-study-v09.png`.
- Bare burgundy lower chassis with its front wall, paper slot and feet.
- Separate blank parchment settings panel and antique bronze surround.
- Open bronze mechanical cradle with three genuinely transparent apertures. Side wheels are separate.
- A blank cylindrical paper master, instantiated as three independent drum layers behind the cradle.
- A blank keycap master, instantiated as 19 separate key objects; each letter is separate SVG text.
- A side-view bronze wheel, instantiated twice; the right instance is mirrored.
- Separate stationary SPIN bezel and turquoise insert; SPIN lettering and arrow are independent.
- A separate blank output sheet with independent heading, prompt text, copy appearance and hint.
- Independent heading, ornament, subtitle, settings fields and static open help card.
- A local EB Garamond Bold font for the main heading and prompt heading, with its OFL license.
- The assembled HTML, standalone SVG, layer gallery, reproducible assembly script, placement manifest, ImageGen prompts, alpha inspection and verification report.

## Assembly

The scene uses inline SVG with a 1536 × 1024 coordinate system. Its 31 raster instances refer to 10 distinct PNG artwork files. Each raster uses a nested SVG viewBox to exclude transparent outer margins. Width and height share the same scale; PNG pixels and alpha are not modified. Typography and simple icons are actual SVG text and paths. The scene itself is composed in the page DOM; it does not reference the original screenshot or the flattened QA render.

The artboard fits the available window while preserving its 3:2 composition. This is an illustration review, not a completed responsive mobile product layout. Topic × Format × Angle is retained; the historical Tone label from the original reference is not restored. Prompt preview uses a longer sample suited to the current product contract.

All artwork was made with the built-in ImageGen tool using the original v09 as the edit/reference target, followed by targeted corrections. These are redrawn production layers, not pixel-exact cutouts from an original layered source. Details, lighting and perspective still differ from the original and need visual acceptance. Earlier variants remain alongside the selected assets, with no destructive replacements.

## Reproduce and check

```powershell
node docs/design/layered-v09-2026-10-11/inspect.mjs
node docs/design/layered-v09-2026-10-11/assemble.mjs
node docs/design/layered-v09-2026-10-11/verify.mjs
```

The verification checks the independent layers, transparent apertures, uniform scaling, resource paths and HTTP responses. The gallery uses inline SVG so external PNG artwork can load correctly; its SVG thumbnails are not nested inside HTML image elements.

`assembly-render.png` is an offline render of `scene.svg` with resvg, inspected visually during assembly. It is an output artifact only and is not used as the webpage design. The optional renderer is installed separately under the D: visualization workspace, outside this project's dependencies. To regenerate, pass that tooling directory containing `@resvg/resvg-js`:

```powershell
node docs/design/layered-v09-2026-10-11/render.mjs D:/Dev/CodexHome/visualizations/2026/10/11/01a12a63-3fb3-7ea0-afa4-5ad5a55ed974/renderer
```

Browser QA remains unverified: the in-app Browser failed while resolving `browser-client.mjs` with EPERM. No external browser was launched. HTTP 200 and the offline SVG render do not establish that browser layout and font loading have been checked. The local Vite server serves the actual static page; Vite may inject its development HMR client.

Font provenance: [Google Fonts EB Garamond source and OFL](https://github.com/google/fonts/tree/main/ofl/ebgaramond). The static 700 TTF was fetched through the Google Fonts CSS endpoint. Both the font and license are saved locally in `assets/`.

</details>

</details>

</details>

</details>

</details>

</details>

</details>

</details>
