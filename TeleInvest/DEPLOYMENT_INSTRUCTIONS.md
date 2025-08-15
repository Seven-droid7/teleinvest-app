# Инструкция по развертыванию TeleInvest

## Шаг 1: Создание GitHub репозитория

1. Перейдите на [github.com](https://github.com) и войдите в аккаунт (или создайте новый)
2. Нажмите зеленую кнопку **"New"** или **"Create repository"**
3. Заполните форму:
   - Repository name: `teleinvest-app`
   - Description: `Платформа для инвестирования в Telegram-каналы`
   - Выберите **Public**
   - Поставьте галочку **"Add a README file"**
4. Нажмите **"Create repository"**

## Шаг 2: Загрузка кода в GitHub

1. В созданном репозитории нажмите **"uploading an existing file"** или **"Add file" → "Upload files"**
2. Перетащите все файлы проекта в окно браузера (кроме README.md, который уже есть)
3. В поле "Commit changes" напишите: `Initial commit - TeleInvest app`
4. Нажмите **"Commit changes"**

## Шаг 3: Подключение к Cloudflare

1. Перейдите в [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Выберите **"Workers & Pages"**
3. Нажмите **"Create" → "Import a repository"**
4. Авторизуйтесь в GitHub и выберите репозиторий `teleinvest-app`
5. Настройте параметры:
   - Project name: `teleinvest`
   - Build command: `npm run build`
   - Build output directory: `dist`
6. Нажмите **"Deploy"**

## Шаг 4: Создание базы данных D1

1. В Cloudflare Dashboard перейдите в **"Workers & Pages" → "D1"**
2. Нажмите **"Create database"**
3. Название: `teleinvest-db`
4. Нажмите **"Create"**

## Шаг 5: Привязка базы данных к проекту

1. Перейдите в настройки вашего проекта TeleInvest
2. Выберите вкладку **"Settings" → "Variables"**
3. В разделе **"D1 database bindings"** нажмите **"Add binding"**
4. Variable name: `DB`
5. D1 database: выберите `teleinvest-db`
6. Нажмите **"Save"**

## Шаг 6: Настройка секретов

В разделе **"Environment variables"** добавьте:

1. `MOCHA_USERS_SERVICE_API_URL` = `https://users-service.getmocha.com`
2. `MOCHA_USERS_SERVICE_API_KEY` = (будет предоставлен отдельно)

## Шаг 7: Повторное развертывание

1. Перейдите в **"Deployments"**
2. Нажмите **"Retry deployment"** для последнего деплоймента

## Готово!

Ваше приложение будет доступно по адресу, который покажет Cloudflare после успешного развертывания.

### Полезные ссылки:
- [Документация Cloudflare Pages](https://developers.cloudflare.com/pages/)
- [Документация Cloudflare D1](https://developers.cloudflare.com/d1/)
- [GitHub Help](https://help.github.com/)
