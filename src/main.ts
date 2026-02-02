import { Plugin, Notice, WorkspaceLeaf, TFile } from 'obsidian';
import { DiscogsSettings, DEFAULT_SETTINGS, DiscogsData, CachedAlbum } from './types';
import { DiscogsSettingTab } from './settings';
import { DiscogsAPI } from './api';
import { DiscogsCache } from './cache';
import { DiscogsCollectionView, DISCOGS_VIEW_TYPE } from './view';
import { createDiscogsNote } from './note-creator';
import { t } from './i18n';

export default class DiscogsPlugin extends Plugin {
	settings: DiscogsSettings;
	data: DiscogsData;
	api: DiscogsAPI;
	cache: DiscogsCache;
	isSyncing = false;
	private abortController: AbortController | null = null;

	async onload() {
		await this.loadSettings();
		this.api = new DiscogsAPI(this.settings);
		this.cache = new DiscogsCache(this.data);

		this.registerView(
			DISCOGS_VIEW_TYPE,
			(leaf) => new DiscogsCollectionView(leaf, this)
		);

		const ribbonIconEl = this.addRibbonIcon('disc-3', t('main.ribbon.tooltip'), (evt: MouseEvent) => {
			void this.activateView();
		});
		ribbonIconEl.addClass('discogs-plugin-ribbon-class');

		this.addCommand({
			id: 'open-discogs-collection',
			name: t('main.commands.openCollection'),
			callback: () => {
				void this.activateView();
			}
		});

		this.addCommand({
			id: 'sync-discogs-collection',
			name: t('main.commands.syncCollection'),
			callback: () => {
				void this.syncCollection();
			}
		});

		this.addSettingTab(new DiscogsSettingTab(this.app, this));
	}

	onunload() {
		if (this.isSyncing && this.abortController) {
			this.abortController.abort();
		}
	}

	async activateView() {
		const { workspace } = this.app;

		let leaf: WorkspaceLeaf | null = null;
		const leaves = workspace.getLeavesOfType(DISCOGS_VIEW_TYPE);

		if (leaves.length > 0) {
			// Fix: explicit check or cast to satisfy TS
			leaf = leaves[0] as WorkspaceLeaf;
		} else {
			leaf = workspace.getLeaf(false);
			await leaf.setViewState({ type: DISCOGS_VIEW_TYPE, active: true });
		}

		if (leaf) {
			void workspace.revealLeaf(leaf);
		}
	}

	async syncCollection() {
		if (!this.settings.username) {
			new Notice(t('main.notice.configureUsername'));
			return;
		}

		const notice = new Notice(t('main.notice.startingSync'), 0);

		this.isSyncing = true;
		this.abortController = new AbortController();

		try {
			const startTime = Date.now();
			const releases = await this.api.fetchCollection(
				this.settings.username,
				(progress) => {
					notice.setMessage(t('main.notice.syncingPage', String(progress.page), String(progress.totalPages), String(progress.itemsLoaded)));
				},
				this.abortController.signal
			);

			const { newItems, removedItems } = this.cache.updateCache(releases);

			this.settings.lastSync = new Date().toLocaleString();
			this.data.metadata.lastSyncDuration = Date.now() - startTime;

			await this.saveSettings();

			notice.setMessage(t('main.notice.syncComplete', String(releases.length), String(newItems), String(removedItems)));
			setTimeout(() => notice.hide(), 5000);

			// Refresh view if open
			const leaves = this.app.workspace.getLeavesOfType(DISCOGS_VIEW_TYPE);
			leaves.forEach(leaf => {
				if (leaf.view instanceof DiscogsCollectionView) {
					leaf.view.render();
				}
			});

		} catch (error: any) {
			if (error.name === 'AbortError' || error.message === 'AbortError') {
				notice.setMessage(t('main.notice.syncCancelled'));
			} else {
				notice.setMessage(t('main.notice.syncFailed', (error as Error).message));
			}
			setTimeout(() => notice.hide(), 5000);
		} finally {
			this.isSyncing = false;
			this.abortController = null;
		}
	}

	async createNoteForAlbum(album: CachedAlbum) {
		const file = await createDiscogsNote(this.app, album, this.settings);

		if (file) {
			// Update cache
			album.hasNote = true;
			album.notePath = file.path;

			await this.saveSettings();

			// Refresh view to show Badge
			const leaves = this.app.workspace.getLeavesOfType(DISCOGS_VIEW_TYPE);
			leaves.forEach(leaf => {
				if (leaf.view instanceof DiscogsCollectionView) {
					leaf.view.refreshGrid(); // Or partial update
				}
			});

			// Open the note
			const leaf = this.app.workspace.getLeaf(false);
			if (leaf) {
				await leaf.openFile(file);
			}
		}
	}

	async loadSettings() {
		const loadedData = (await this.loadData()) as any;

		if (!loadedData) {
			this.settings = Object.assign({}, DEFAULT_SETTINGS);
			this.data = {
				settings: this.settings,
				cache: [],
				metadata: {
					totalCount: 0,
					discsWithNotes: 0,
					lastSyncDuration: 0
				}
			};
		} else {
			this.settings = {
				username: loadedData?.username ?? DEFAULT_SETTINGS.username,
				notesFolder: loadedData?.notesFolder ?? DEFAULT_SETTINGS.notesFolder,
				itemsPerPage: loadedData?.itemsPerPage ?? DEFAULT_SETTINGS.itemsPerPage,
				lastSync: loadedData?.lastSync ?? DEFAULT_SETTINGS.lastSync,
			};

			this.data = {
				settings: this.settings,
				cache: (loadedData?.cachedCollection as CachedAlbum[]) || [],
				metadata: (loadedData?.collectionMetadata as any) || { totalCount: 0, discsWithNotes: 0, lastSyncDuration: 0 }
			}
		}
	}

	async saveSettings() {
		const dataToSave = {
			...this.settings,
			cachedCollection: this.data.cache,
			collectionMetadata: this.data.metadata
		};
		await this.saveData(dataToSave);
	}

	async clearCache() {
		this.data.cache = [];
		this.data.metadata = { totalCount: 0, discsWithNotes: 0, lastSyncDuration: 0 };
		this.settings.lastSync = null;
		await this.saveSettings();

		const leaves = this.app.workspace.getLeavesOfType(DISCOGS_VIEW_TYPE);
		leaves.forEach(leaf => {
			if (leaf.view instanceof DiscogsCollectionView) {
				leaf.view.render();
			}
		});
	}
}
