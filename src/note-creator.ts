import { App, TFile, Notice, normalizePath } from 'obsidian';
import { CachedAlbum, DiscogsSettings } from './types';

export async function createDiscogsNote(
    app: App,
    album: CachedAlbum,
    settings: DiscogsSettings
): Promise<TFile | null> {
    const { vault } = app;

    // 1. Sanitize Filename
    const safeArtist = sanitizeFileName(album.artist);
    const safeTitle = sanitizeFileName(album.title);
    const fileName = `${safeArtist} - ${safeTitle} (${album.year}).md`;

    // 2. Prepare Path
    const folderPath = settings.notesFolder || 'Discogs/Albums';
    const filePath = normalizePath(`${folderPath}/${fileName}`);

    // check if folder exists
    if (!await vault.adapter.exists(folderPath)) {
        try {
            await vault.createFolder(folderPath);
        } catch (e) {
            new Notice(`Failed to create folder: ${folderPath}`);
            return null;
        }
    }

    // 3. Check for existing file

    if (await vault.adapter.exists(filePath)) {
        const file = vault.getAbstractFileByPath(filePath);
        if (file instanceof TFile) {
            return file;
        }
        // If it's a folder or something else, we have a problem.
        new Notice(`Path exists but is not a file: ${filePath}`);
        return null;
    }

    // 4. Generate Content
    const frontmatter = `---
discogs_id: ${album.id}
instance_id: ${album.instance_id}
title: "${escapeQuotes(album.title)}"
artist: "${escapeQuotes(album.artist)}"
year: ${album.year}
format: "${escapeQuotes(album.format)}"
genres: [${album.genres.map(g => `"${escapeQuotes(g)}"`).join(', ')}]
styles: [${album.styles.map(s => `"${escapeQuotes(s)}"`).join(', ')}]
label: "${escapeQuotes(album.label)}"
catalog_number: "${escapeQuotes(album.catalogNumber)}"
date_added: "${album.dateAdded}"
cover: "${album.coverUrl}"
discogs_url: "https://www.discogs.com/release/${album.id}"
---`;

    const content = `${frontmatter}

# ${album.artist} - ${album.title}

![Capa](${album.coverUrl})

## Informações Básicas

- **Artista**: ${album.artist}
- **Ano**: ${album.year}
- **Formato**: ${album.format}
- **Gênero**: ${album.genres.join(', ')}
- **Gravadora**: ${album.label} (${album.catalogNumber})
- **Adicionado em**: ${formatDate(album.dateAdded)}

## Minhas Notas

> Adicione aqui suas anotações sobre este álbum

### Primeira Audição
- **Data**: 
- **Impressões iniciais**: 

### Análise

### Contexto Histórico

### Faixas Favoritas

### Avaliação
- **Nota**: ⭐⭐⭐⭐⭐ ( /5)

## Links

- [Ver no Discogs](https://www.discogs.com/release/${album.id})
- [Buscar no YouTube](https://www.youtube.com/results?search_query=${encodeURIComponent(album.artist + ' ' + album.title)})

## Tags

#discogs #música #${sanitizeTag(album.genres[0] || 'music')} #ano-${album.year}
`;

    // 5. Create File
    try {
        const file = await vault.create(filePath, content);
        new Notice(`Note created: ${file.basename}`);
        return file;
    } catch (e: unknown) {
        new Notice(`Failed to create note: ${(e as any).message}`);
        console.error(e);
        return null;
    }
}

function sanitizeFileName(name: string): string {
    return name
        .replace(/[:\/\\|?*"<>]/g, '-') // Invalid chars
        .replace(/\s+/g, ' ') // Collapse spaces
        .trim();
}

function escapeQuotes(str: string): string {
    return str.replace(/"/g, '\\"');
}

function sanitizeTag(str: string): string {
    return str.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
}

function formatDate(isoString: string): string {
    try {
        return new Date(isoString).toLocaleDateString();
    } catch {
        return isoString;
    }
}
