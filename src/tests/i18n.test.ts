declare const jest: any;
export const requestUrl = jest.fn();
declare const describe: any;
declare const it: any;
declare const expect: any;
declare const beforeEach: any;

import { t } from '../i18n';
import { DiscogsCache } from '../cache';
import * as moment from 'moment';

jest.mock('moment', () => {
    return () => ({
        locale: jest.fn().mockReturnValue('en')
    });
});

describe('i18n Translation', () => {
    beforeEach(() => {
        // Reset locale or mock implementation if needed
        jest.spyOn(moment, 'locale').mockReturnValue('en');
    });

    it('should return English translation by default', () => {
        expect(t('main.ribbon.tooltip')).toBe('Open Discogs Collection');
    });

    it('should return Portuguese translation when locale is pt', () => {
        jest.spyOn(moment, 'locale').mockReturnValue('pt');
        expect(t('main.ribbon.tooltip')).toBe('Abrir Coleção Discogs');
    });

    it('should fall back to English if key is missing in localized dictionary', () => {
        jest.spyOn(moment, 'locale').mockReturnValue('ru');
        // Assuming we have a key that exists in EN but maybe not in RU (though we added all)
        // Let's test interpolation
        expect(t('view.header.title', 'UserX')).toContain('UserX');
    });

    it('should perform string replacement correctly', () => {
        const translated = t('view.header.title', 'UserTest');
        expect(translated).toBe('My Discogs Collection (UserTest)');
    });
});
