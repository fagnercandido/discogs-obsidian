import { moment } from 'obsidian';
import { resources } from './locales';

export function t(key: string, ...args: unknown[]): string {
    const locale = moment.locale();
    // Fallback order: current locale -> generic locale (e.g. pt-br -> pt) -> english
    let lang = locale || 'en';

    if (!resources[lang]) {
        if (lang.includes('-')) {
            lang = lang.split('-')[0];
        }
        if (!resources[lang]) {
            lang = 'en';
        }
    }

    const currentResource = resources[lang];
    const defaultResource = resources['en'];

    // Safety check
    if (!currentResource && !defaultResource) {
        return key;
    }

    let text = (currentResource && currentResource[key]) || (defaultResource && defaultResource[key]) || key;

    if (args.length > 0) {
        args.forEach((arg, index) => {
            text = text.replace(`{${index}}`, String(arg));
        });
    }

    return text;
}
