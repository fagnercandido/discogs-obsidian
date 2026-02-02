import { createDiscogsNote } from '../note-creator';
import { App, TFile } from 'obsidian';

// Mock Obsidian modules
jest.mock('obsidian');

describe('Note Creator', () => {
    let mockApp: any;
    let mockSettings: any;

    beforeEach(() => {
        mockApp = {
            vault: {
                getAbstractFileByPath: jest.fn(),
                create: jest.fn(),
                adapter: { exists: jest.fn().mockResolvedValue(false), mkdir: jest.fn().mockResolvedValue(true) }
            },
            fileManager: {
                createNewFile: jest.fn()
            }
        };
        mockSettings = {
            notesFolder: 'Music/Discogs',
            username: 'UserTest'
        };
    });

    it('should create a note with correct frontmatter', async () => {
        const album = {
            title: 'Kind of Blue',
            artist: 'Miles Davis',
            year: 1959,
            id: 12345,
            format: 'Vinyl',
            label: 'Columbia',
            catalogNumber: 'CS 8163',
            genres: ['Jazz'],
            styles: ['Modal'],
            coverUrl: 'http://image.com'
        } as any;

        const mockFile = {} as TFile;
        (mockApp.vault.create as jest.Mock).mockResolvedValue(mockFile);

        const result = await createDiscogsNote(mockApp as unknown as App, album, mockSettings);

        expect(mockApp.vault.create).toHaveBeenCalled();
        const callArgs = (mockApp.vault.create as jest.Mock).mock.calls[0];
        const content = callArgs[1];

        expect(content).toContain('title: Kind of Blue');
        expect(content).toContain('artist: Miles Davis');
        expect(content).toContain('jazz'); // Tags are lowercased
    });
});
