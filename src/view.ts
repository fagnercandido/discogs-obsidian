import { ItemView, WorkspaceLeaf, setIcon } from 'obsidian';
import DiscogsPlugin from './main';
import { CachedAlbum } from './types';
import { t } from './i18n';

export const DISCOGS_VIEW_TYPE = 'discogs-collection-view';

export class DiscogsCollectionView extends ItemView {
    plugin: DiscogsPlugin;

    // States
    searchQuery = '';
    sortOption = 'added-new-old'; // Default sort
    filterGenre = '';
    filterFormat = '';
    filterState = 'all'; // all, notes, no-notes
    private observer: IntersectionObserver | null = null;
    private searchDebounceTimer: NodeJS.Timeout | null = null;

    // UI Elements
    gridContainer: HTMLElement;

    constructor(leaf: WorkspaceLeaf, plugin: DiscogsPlugin) {
        super(leaf);
        this.plugin = plugin;
    }

    getViewType() {
        return DISCOGS_VIEW_TYPE;
    }

    getDisplayText() {
        return t('main.ribbon.tooltip');
    }

    getIcon() {
        return 'disc-3';
    }

    async onOpen() {
        this.render();
    }

    async onClose() {
        if (this.observer) {
            this.observer.disconnect();
            this.observer = null;
        }
    }

    render() {
        const container = this.containerEl.children[1] as HTMLElement;
        if (!container) return;

        container.empty();
        container.addClass('discogs-view-container');

        this.renderHeader(container);
        this.renderToolbar(container);

        this.gridContainer = container.createDiv({ cls: 'discogs-grid' });
        this.renderGrid();
    }

    renderHeader(container: HTMLElement) {
        const header = container.createDiv({ cls: 'discogs-header' });
        header.createEl('h2', { text: t('view.header.title', this.plugin.settings.username) });

        const controls = header.createDiv({ cls: 'discogs-header-controls' });

        // Refresh Button
        const refreshBtn = controls.createEl('button', { cls: 'clickable-icon', title: t('view.header.refresh') });
        setIcon(refreshBtn, 'refresh-cw');
        refreshBtn.onclick = async () => {
            await this.plugin.syncCollection();
            this.render(); // Re-render after sync
        };

        // Settings Button
        const settingsBtn = controls.createEl('button', { cls: 'clickable-icon', title: t('view.header.settings') });
        setIcon(settingsBtn, 'settings');
        settingsBtn.onclick = () => {
            // @ts-ignore - Private API
            // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
            (this.app as any).setting.open();
            // @ts-ignore
            // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
            (this.app as any).setting.openTabById(this.plugin.manifest.id);
        };
    }

    renderToolbar(container: HTMLElement) {
        const toolbar = container.createDiv({ cls: 'discogs-toolbar' });

        // Search
        const searchInput = toolbar.createEl('input', { type: 'text', placeholder: t('view.search.placeholder') });
        searchInput.value = this.searchQuery;
        searchInput.oninput = (e) => {
            const value = (e.target as HTMLInputElement).value;

            if (this.searchDebounceTimer) {
                clearTimeout(this.searchDebounceTimer);
            }

            this.searchDebounceTimer = setTimeout(() => {
                this.searchQuery = value;
                this.refreshGrid();
            }, 300); // 300ms debounce
        };

        // Sort
        const sortSelect = toolbar.createEl('select');
        const sorts: { [key: string]: string } = {
            'added-new-old': t('view.sort.addedNewOld'),
            'added-old-new': t('view.sort.addedOldNew'),
            'title-az': t('view.sort.titleAz'),
            'title-za': t('view.sort.titleZa'),
            'artist-az': t('view.sort.artistAz'),
            'year-new-old': t('view.sort.yearNewOld'),
        };
        for (const [key, label] of Object.entries(sorts)) {
            const opt = sortSelect.createEl('option', { value: key, text: label });
            if (key === this.sortOption) opt.selected = true;
        }
        sortSelect.onchange = (e) => {
            this.sortOption = (e.target as HTMLSelectElement).value;
            this.refreshGrid();
        };

        // Note Status Filter
        const filterSelect = toolbar.createEl('select');
        filterSelect.createEl('option', { value: 'all', text: t('view.filter.all') });
        filterSelect.createEl('option', { value: 'notes', text: t('view.filter.withNotes') });
        filterSelect.createEl('option', { value: 'no-notes', text: t('view.filter.withoutNotes') });
        filterSelect.value = this.filterState;
        filterSelect.onchange = (e) => {
            this.filterState = (e.target as HTMLSelectElement).value;
            this.refreshGrid();
        };
    }

    applyFilters(items: CachedAlbum[]): CachedAlbum[] {
        return items.filter(item => {
            // Text Search
            const q = this.searchQuery.toLowerCase();
            const matchesSearch = !q ||
                item.title.toLowerCase().includes(q) ||
                item.artist.toLowerCase().includes(q) ||
                (item.genres && item.genres.some(g => g.toLowerCase().includes(q)));

            if (!matchesSearch) return false;

            // Note Filter
            if (this.filterState === 'notes' && !item.hasNote) return false;
            if (this.filterState === 'no-notes' && item.hasNote) return false;

            return true;
        });
    }

    sortItems(items: CachedAlbum[]): CachedAlbum[] {
        return items.sort((a, b) => {
            switch (this.sortOption) {
                case 'added-new-old':
                    return new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime();
                case 'added-old-new':
                    return new Date(a.dateAdded).getTime() - new Date(b.dateAdded).getTime();
                case 'title-az':
                    return a.title.localeCompare(b.title);
                case 'title-za':
                    return b.title.localeCompare(a.title);
                case 'artist-az':
                    return a.artist.localeCompare(b.artist);
                case 'year-new-old':
                    return b.year - a.year;
                default:
                    return 0;
            }
        });
    }

    refreshGrid() {
        this.gridContainer.empty();
        this.renderGrid();
    }

    renderGrid() {
        let items = this.plugin.data.cache;

        if (!items || items.length === 0) {
            this.gridContainer.createDiv({ cls: 'discogs-empty' }).setText(t('view.empty'));
            return;
        }

        items = this.applyFilters(items);
        items = this.sortItems(items);

        const statsBar = this.containerEl.querySelector('.discogs-search-stats');
        if (statsBar) statsBar.remove();

        items.forEach(album => {
            this.renderCard(album);
        });

        this.observeImages();
    }

    renderCard(album: CachedAlbum) {
        const card = this.gridContainer.createDiv({ cls: 'discogs-card' });

        // Image Container
        const imgContainer = card.createDiv({ cls: 'discogs-card-img-container' });

        // Badges
        if (album.isNew) {
            imgContainer.createDiv({ cls: 'discogs-badge new-badge' }).setText(t('view.badge.new'));
        }
        if (album.hasNote) {
            imgContainer.createDiv({ cls: 'discogs-badge note-badge' }).setText(t('view.badge.note'));
        }

        // Image
        const img = imgContainer.createEl('img', { cls: 'discogs-card-img' });
        img.src = album.thumbUrl || ''; // Use thumb initially
        img.dataset.src = album.coverUrl || album.thumbUrl || ''; // Store full res
        img.alt = `${album.artist} - ${album.title}`;

        // Info Overlay
        const overlay = imgContainer.createDiv({ cls: 'discogs-card-overlay' });
        overlay.createDiv({ cls: 'overlay-info' }).setText(`${album.year} • ${album.format}`);

        // Text Info
        const info = card.createDiv({ cls: 'discogs-card-info' });
        info.createDiv({ cls: 'discogs-card-title' }).setText(album.title);
        info.createDiv({ cls: 'discogs-card-artist' }).setText(album.artist);

        card.onclick = async () => {
            await this.plugin.createNoteForAlbum(album);
        };
    }

    observeImages() {
        if (this.observer) {
            this.observer.disconnect();
        }

        this.observer = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target as HTMLImageElement;
                    if (img.dataset.src) {
                        img.src = img.dataset.src;
                        img.removeAttribute('data-src');
                    }
                    observer.unobserve(img);
                }
            });
        }, { rootMargin: '50px' });

        this.gridContainer.querySelectorAll('img[data-src]').forEach(img => this.observer?.observe(img));
    }
}
