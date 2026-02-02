import { App, PluginSettingTab, Setting, Notice } from 'obsidian';
import DiscogsPlugin from './main';
import { DiscogsAPI } from './api';
import { t } from './i18n';

export class DiscogsSettingTab extends PluginSettingTab {
	plugin: DiscogsPlugin;

	constructor(app: App, plugin: DiscogsPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		new Setting(containerEl)
			.setName(t('settings.username.name'))
			.setDesc(t('settings.username.desc'))
			.addText(text => text
				.setPlaceholder(t('settings.username.placeholder'))
				.setValue(this.plugin.settings.username)
				.onChange(async (value) => {
					this.plugin.settings.username = value.trim();
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName(t('settings.notesFolder.name'))
			.setDesc(t('settings.notesFolder.desc'))
			.addText(text => text
				.setPlaceholder(t('settings.notesFolder.placeholder'))
				.setValue(this.plugin.settings.notesFolder)
				.onChange(async (value) => {
					this.plugin.settings.notesFolder = value.trim();
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName(t('settings.itemsPerPage.name'))
			.setDesc(t('settings.itemsPerPage.desc'))
			.addDropdown(dropdown => dropdown
				.addOption('25', '25')
				.addOption('50', '50')
				.addOption('75', '75')
				.addOption('100', '100')
				.setValue(this.plugin.settings.itemsPerPage.toString())
				.onChange(async (value) => {
					this.plugin.settings.itemsPerPage = parseInt(value) as 25 | 50 | 75 | 100;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl).setName("").setHeading();

		new Setting(containerEl)
			.setName(t('settings.loadCollection.name'))
			.setDesc(t('settings.loadCollection.desc'))
			.addButton(button => button
				.setButtonText(t('settings.loadCollection.button'))
				.onClick(async () => {
					if (!this.plugin.settings.username) {
						new Notice(t('settings.notices.enterUsername'));
						return;
					}

					// Simple validation check before starting
					const api = new DiscogsAPI(this.plugin.settings);
					const isValid = await api.validateUser(this.plugin.settings.username);
					if (!isValid) {
						new Notice(t('settings.notices.userNotFound', this.plugin.settings.username));
						return;
					}

					const confirm = window.confirm(t('settings.warning.longSync')); // eslint-disable-line no-alert
					if (confirm) {
						// TODO: trigger sync
						new Notice(t('settings.warning.startingSync'));
						// await this.plugin.syncCollection();
					}
				}));

		new Setting(containerEl)
			.setName(t('settings.clearCache.name'))
			.setDesc(t('settings.clearCache.desc'))
			.addButton(button => button
				.setButtonText(t('settings.clearCache.button'))
				.setWarning()
				.onClick(async () => {
					const confirm = window.confirm(t('settings.warning.clearCache')); // eslint-disable-line no-alert
					if (confirm) {
						await this.plugin.clearCache();
						new Notice(t('settings.notices.cacheCleared'));
						this.display(); // Refresh to update stats
					}
				}));

		if (this.plugin.data && this.plugin.data.metadata) {
			containerEl.createEl('hr');
			new Setting(containerEl).setName("").setHeading();
			containerEl.createDiv({ text: `${t('settings.stats.totalAlbums')}: ${this.plugin.data.metadata.totalCount}` });
			containerEl.createDiv({ text: `${t('settings.stats.notesCreated')}: ${this.plugin.data.metadata.discsWithNotes}` });
			containerEl.createDiv({ text: `${t('settings.stats.lastSync')}: ${this.plugin.settings.lastSync || t('settings.stats.never')}` });
		}
	}
}
