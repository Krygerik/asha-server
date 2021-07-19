
/**
 * Название схемы в базе данных
 */
const database = process.env.NODE_ENV == 'production' ? 'production' : 'test';

/**
 * Урл до бд с учетом среды
 */
export const mongoUrl = 'mongodb://AdminSokratik:Her0EsF!ve@localhost:27017/' + database;