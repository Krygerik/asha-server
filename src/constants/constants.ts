
/**
 * Название схемы в базе данных
 */
const getDatabaseName = () => {
    if (process.env.NODE_ENV === 'production') {
        return 'production';
    }

    if (process.env.NODE_ENV === 'unittests') {
        return 'unittests';
    }

    return 'test';
}

/**
 * Урл до бд с учетом среды
 */
export const mongoUrl = 'mongodb://AdminSokratik:HEr0EsF!ve@localhost:27017/' + getDatabaseName();

/**
 * Возможные значения окружения среды, в которых работает приложение
 */
enum ENVIRONMENT {
    DEVELOP = 'development',
    PRODUCTION = 'production',
    TEST = 'test',
}

/**
 * Соотношение окружения среды на главные страницы клиентского приложения
 */
const MAP_ENV_TO_CLIENT_ROOT_URL = {
    [ENVIRONMENT.DEVELOP]: 'http://localhost:3000',
    [ENVIRONMENT.PRODUCTION]: process.env.APP_PRODUCTION_CLIENT_ROOT_PAGE,
    [ENVIRONMENT.TEST]: process.env.APP_DEVELOP_CLIENT_ROOT_PAGE,
};

/**
 * Соотношение окружения среды на текущее приложение
 */
const MAP_ENV_TO_APPLICATION_URL = {
    [ENVIRONMENT.DEVELOP]: 'http://localhost:4000',
    [ENVIRONMENT.PRODUCTION]: process.env.APP_PRODUCTION_CLIENT_ROOT_PAGE + ':3001',
    [ENVIRONMENT.TEST]: process.env.APP_PRODUCTION_CLIENT_ROOT_PAGE + ':4001',
};

/**
 * Главная страница клиентского приложения
 */
export const CLIENT_ROOT_URL = MAP_ENV_TO_CLIENT_ROOT_URL[process.env.NODE_ENV];

/**
 * Урл на текущее приложение
 */
export const APPLICATION_URL = MAP_ENV_TO_APPLICATION_URL[process.env.NODE_ENV];
