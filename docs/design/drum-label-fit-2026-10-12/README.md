# Посадка подписей барабанов перед выпуском

2026-10-12. Первый пункт подготовки к выпуску, добавленный по шести скриншотам пользователя. Исправлено локально; commit/push/deploy этим этапом не выполнялись.

`DrumLabel` переносит длинные выбранные подписи desktop раньше, сохраняя полный текст. До первого отображения измеряет фактический SVG bounding box и при необходимости немного уменьшает шрифт. Повторное измерение после готовности шрифтов учитывает их загрузку. Безопасная ширина выбранной строки — 184 SVG px для Topic/Format и 164 для Angle: правый наконечник Angle выступает дальше внутрь окна. Для соседних строк — 210, для компактной компоновки — 312. Дополнительные 2 px при уменьшении учитывают округление и hinting. Размер машины и геометрия механики сохранены. Тот же renderer используется в покое и в движущихся лентах; измерение выполняется при смене подписи/режима и готовности шрифтов, а не на каждом кадре.

## Проверка

В headless Chromium проверены все 100 подписей на двух языках в трёх режимах: выбранные desktop, соседние desktop и выбранные compact. **600 вариантов, 0 выходов за безопасные границы**, не больше двух строк. Дополнительно измерены 66 выбранных строк движущихся лент, проверены полный SPIN и соответствие финальных подписей промпту. 14 EN/RU-конфигураций ширины 320/390/900/901/1366/1536/1920 не имеют горизонтального переполнения. Ошибок страницы нет. [Отчёт](verification.json).

TypeScript приложения и production build с `/reading-roulette/` проходят. Шесть сцен с подписями со скриншотов пользователя собраны из настоящих React-компонентов для визуальной проверки: [пример 1](example-1.png), [2](example-2.png), [3](example-3.png), [4](example-4.png), [5](example-5.png), [6](example-6.png). Это проверочные сцены, соседние строки зависят от начальной комбинации; они не являются случайно выпавшими результатами приложения. Встроенный Browser не подключился из-за EPERM; проверка выполнена в отдельном headless Chromium без видимого окна и доступа к системному буферу. Safari/Firefox и физические телефоны этим этапом не проверены.

## Повторный запуск

Собрать основное приложение и отдельную проверочную страницу:

```powershell
pnpm build --base=/reading-roulette/ --outDir=node_modules/.cache/project-review-2026-10-12/dist
node --input-type=module -e 'import { build } from "vite"; await build({build:{outDir:"node_modules/.cache/drum-fit-fixtures",rollupOptions:{input:"docs/design/drum-label-fit-2026-10-12/fixtures.html"}}});'
```

В отдельных терминалах запустить preview основного приложения и проверочных сцен:

```powershell
pnpm preview --host 127.0.0.1 --port 5178 --strictPort --base=/reading-roulette/ --outDir=node_modules/.cache/project-review-2026-10-12/dist
pnpm preview --host 127.0.0.1 --port 5179 --strictPort --outDir=node_modules/.cache/drum-fit-fixtures
```

Проверка использует уже установленный Playwright Core и Chromium:

```powershell
$env:READING_PLAYWRIGHT_MODULE='D:\Dev\Projects\Language Tracker\node_modules\.pnpm\playwright-core@1.63.0\node_modules\playwright-core\index.mjs'
$env:PLAYWRIGHT_BROWSERS_PATH='D:\Dev\Caches\ms-playwright'
node docs/design/drum-label-fit-2026-10-12/verify.mjs
```

`READING_TEST_URL`, `READING_FIXTURE_URL` и `READING_TEST_OUTPUT_DIR` позволяют выбрать другие адреса/каталог отчёта. Проверочная HTML-страница и исходники в docs не входят в основную production-сборку.
