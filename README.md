# Discogs Obsidian Plugin

[![Languages](https://img.shields.io/badge/Languages-English%20%7C%20Portuguese-blue)](README.md)

This plugin allows you to integrate your Discogs collection directly into Obsidian, offering visualization features, local caching, and automatic note creation for your albums.

*Select your language / Escolha seu idioma:*
- [🇺🇸 English Documentation](#-english-documentation)
- [🇧🇷 Documentação em Português](#-documentação-em-português)

---

## 🌍 Internationalization (i18n)

This plugin is available in multiple languages! It automatically detects your Obsidian language locale.

**Supported Languages:**
- 🇺🇸 English (`en`)
- 🇧🇷 Portuguese (`pt`)
- 🇪🇸 Spanish (`es`)
- 🇫🇷 French (`fr`)
- 🇮🇹 Italian (`it`)
- 🇷🇺 Russian (`ru`)

---

## 🇺🇸 English Documentation

### 🚀 How to Run

To develop and run this project locally, follow the steps below:

#### Prerequisites
- **Node.js**: Version 16 or higher.
- **Obsidian**: Installation of the app to test the plugin.

#### Installation

1.  Clone the repository into your development vault's plugin folder:
    ```bash
    cd <YourVault>/.obsidian/plugins/
    git clone https://github.com/your-username/discogs-obsidian.git
    cd discogs-obsidian
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```

#### Running in Development
To start development mode with *watch* (automatic recompilation):
```bash
npm run dev
```
This will generate the `main.js` file in the project root. After running, reload the plugin in Obsidian to see changes.

#### Production Build
To generate the optimized version for distribution:
```bash
npm run build
```

### 🧪 How to Test

Currently, the project focuses on static and manual testing:

#### Linting
To check code quality and common errors:
```bash
npm run lint
```

#### Manual Testing
1.  Enable the plugin in Obsidian settings ("Community Plugins").
2.  Configure your **Username** and **Personal Access Token** from Discogs in the plugin settings.
3.  Use the command `Discogs: Open Collection View` to open the album grid.
4.  Test note creation by clicking on an album.

### 🏗 Architecture and Key Components

The project follows a modular architecture focused on separation of concerns. Source files are located in `src/`.

#### Directory Structure (`src/`)

- **`main.ts`**:
    - **Function**: Plugin entry point (`DiscogsPlugin`).
    - **Responsibility**: Manages the lifecycle (`onload`, `onunload`), registers commands, views (`View`), and the settings tab.
    - **Key Details**: Initializes the API and Cache services on load. Registers the `DiscogsCollectionView` and the ribbon icon to open it.

- **`api.ts`**:
    - **Function**: Discogs communication layer.
    - **Responsibility**: Encapsulates HTTP calls to the Discogs API, handles authentication and pagination.
    - **Key Details**:
        - `fetchCollection`: Main method that iterates through all pages of the user's collection until all items are retrieved.
        - Uses `requestUrl` from Obsidian API to avoid CORS issues.
        - Handles API rate limits and errors gracefully.

- **`cache.ts`**:
    - **Function**: Local state management.
    - **Responsibility**: Stores collection data locally to avoid excessive API requests and improve performance.
    - **Key Details**:
        - `updateCache`: Compares the fetched data with the local cache to identify new and removed items.
        - Persists data to the plugin's `data.json` file automatically via Obsidian's `saveData`.

- **`view.ts`**:
    - **Function**: User Interface (UI).
    - **Responsibility**: Renders the grid view of the collection.
    - **Key Details**:
        - `DiscogsCollectionView`: A custom `ItemView` that renders the HTML structure.
        - `renderGrid`: Dynamically builds the album cards based on the cached data.
        - Implements filtering (search, note status) and sorting (date, title, artist) logic entirely on the client side for speed.
        - Uses `IntersectionObserver` for lazy loading album cover images.

- **`note-creator.ts`**:
    - **Function**: Business Logic (Content Generation).
    - **Responsibility**: Creates Markdown files for albums.
    - **Key Details**:
        - `createDiscogsNote`: Generates the file content with YAML Frontmatter and a body template.
        - Checks if the file already exists to avoid overwriting (unless specified).
        - Sanitizes filenames to prevent filesystem errors.

- **`settings.ts`**:
    - **Function**: Configuration UI.
    - **Responsibility**: Renders the plugin settings tab.
    - **Key Details**:
        - Validates the Discogs username before saving.
        - Provides options for "Items per Page" and "Notes Folder".
        - Includes action buttons for "Load Collection" and "Clear Cache".

- **`types.ts`**:
    - **Function**: Type Definitions.
    - **Responsibility**: Centralizes TypeScript interfaces.
    - **Key Details**:
        - `DiscogsRelease`: Matches the JSON structure returned by the Discogs API.
        - `CachedAlbum`: A simplified internal structure used for the UI and Cache, decoupling the app from the specific API response format.

- **`i18n/`**:
    - **Function**: Internationalization.
    - **Responsibility**: Manages translations for supported languages.
    - **Key Details**:
        - `locales.ts`: Contains the dictionary of translation strings for all languages.
        - `index.ts`: Exports the `t()` helper function which detects the current Obsidian locale and returns the appropriate string.

### 🔧 Maintenance and Evolution

To maintain or evolve the plugin, consider the following guidelines:

1.  **Add Fields to Note**:
    - Edit `note-creator.ts`. Modify the function that assembles the file content (`content`) or the `frontmatter`.

2.  **Change Visual Interface**:
    - Edit `view.ts`. The `onOpen` and `render()` methods control what is displayed. Associated CSS is in `styles.css` in the root.

3.  **New API Endpoints**:
    - Add new methods in `api.ts`. Create corresponding response interfaces in `types.ts`.

4.  **Update Dependencies**:
    - The plugin depends on the Obsidian API (`obsidian`). Keep it updated in `package.json` to access new editor features.

---

### 🧪 Development and Testing

This project uses **Jest** for unit testing critical business logic.

#### Running Tests
To run all tests:
```bash
npm test
```

#### Test Coverage
- **Internationalization (`i18n.test.ts`)**: Validates language detection, fallbacks, and string interpolation.
- **Cache Logic (`cache.test.ts`)**: Ensures the sync process correctly identifies new, updated, and removed items without data loss.
- **Note Content (`note-creator.test.ts`)**: Verifies that the generated Markdown and Frontmatter follow the expected templates.

### 🌟 Publishing to the Community

To release this plugin officially on the Obsidian Community Plugins list:
1. Ensure `manifest.json` and `package.json` versions are aligned.
2. Run `npm run build` to generate `main.js`.
3. Create a new Release on GitHub with `manifest.json`, `main.js`, and `styles.css`.
4. Submit a Pull Request to the [obsidianmd/obsidian-releases](https://github.com/obsidianmd/obsidian-releases) repository.

---

## 🇧🇷 Documentação em Português

### 🌍 Internacionalização (i18n)

O plugin suporta múltiplos idiomas! Ele detecta automaticamente o idioma do seu Obsidian.

**Idiomas Suportados:**
- 🇺🇸 Inglês (`en`)
- 🇧🇷 Português (`pt`)
- 🇪🇸 Espanhol (`es`)
- 🇫🇷 Francês (`fr`)
- 🇮🇹 Italiano (`it`)
- 🇷🇺 Russo (`ru`)

### 🚀 Como Rodar

...

### 🏗 Arquitetura e Principais Componentes

...

### 🧪 Desenvolvimento e Testes

Este projeto utiliza **Jest** para testes unitários da lógica de negócio.

#### Executando Testes
Para rodar todos os testes:
```bash
npm test
```

#### Cobertura de Testes
- **Internacionalização (`i18n.test.ts`)**: Valida detecção de idioma, fallbacks e interpolação.
- **Lógica de Cache (`cache.test.ts`)**: Garante que o processo de sincronização identifica corretamente itens novos e removidos.
- **Conteúdo de Notas (`note-creator.test.ts`)**: Verifica se o Markdown e Frontmatter gerados seguem os templates.

### 🌟 Publicando na Comunidade

Para lançar este plugin oficialmente:
1. Alinhe as versões no `manifest.json` e `package.json`.
2. Rode `npm run build`.
3. Crie um Release no GitHub com `manifest.json`, `main.js` e `styles.css`.
4. Envie um PR para [obsidianmd/obsidian-releases](https://github.com/obsidianmd/obsidian-releases).


### 🚀 Como Rodar

Para desenvolver e executar este projeto localmente, siga os passos abaixo:

#### Pré-requisitos
- **Node.js**: Versão 16 ou superior.
- **Obsidian**: Instalação do aplicativo para testar o plugin.

#### Instalação

1.  Clone o repositório para a pasta de plugins do seu cofre (Vault) de desenvolvimento:
    ```bash
    cd <SeuVault>/.obsidian/plugins/
    git clone https://github.com/seu-usuario/discogs-obsidian.git
    cd discogs-obsidian
    ```
2.  Instale as dependências:
    ```bash
    npm install
    ```

#### Execução em Desenvolvimento
Para iniciar o modo de desenvolvimento com *watch* (recompilação automática):
```bash
npm run dev
```
Isso irá gerar o arquivo `main.js` na raiz do projeto. Após rodar, re-carregue o plugin no Obsidian para ver as alterações.

#### Build de Produção
Para gerar a versão otimizada para distribuição:
```bash
npm run build
```

### 🧪 Como Testar

Atualmente, o projeto foca em testes estáticos e manuais:

#### Linting
Para verificar a qualidade do código e erros comuns:
```bash
npm run lint
```

#### Testes Manuais
1.  Habilite o plugin nas configurações do Obsidian ("Community Plugins").
2.  Configure seu **Username** e **Personal Access Token** do Discogs nas configurações do plugin.
3.  Use o comando `Discogs: Open Collection View` para abrir a grade de álbuns.
4.  Teste a criação de notas clicando em um álbum.

### 🏗 Arquitetura e Principais Componentes

O projeto segue uma arquitetura modular focada em separação de responsabilidades. Os arquivos fonte estão localizados em `src/`.

#### Estrutura de Diretórios (`src/`)

- **`main.ts`**:
    - **Função**: Ponto de entrada do plugin (`DiscogsPlugin`).
    - **Responsabilidade**: Gerencia o ciclo de vida (`onload`, `onunload`), registra comandos, vistas (`View`) e a aba de configurações.
    - **Detalhes**: Inicializa os serviços de API e Cache ao carregar. Registra a `DiscogsCollectionView` e o ícone na barra lateral.

- **`api.ts`**:
    - **Função**: Camada de comunicação com o Discogs.
    - **Responsabilidade**: Encapsula chamadas HTTP à API do Discogs, trata autenticação e paginação.
    - **Detalhes**:
        - `fetchCollection`: Método principal que itera por todas as páginas da coleção do usuário até recuperar todos os itens.
        - Usa `requestUrl` da API do Obsidian para evitar problemas de CORS.
        - Trata limites de taxa da API e erros de forma graciosa.

- **`cache.ts`**:
    - **Função**: Gerenciamento de estado local.
    - **Responsabilidade**: Armazena os dados da coleção localmente para evitar requisições excessivas.
    - **Detalhes**:
        - `updateCache`: Compara os dados buscados com o cache local para identificar itens novos e removidos.
        - Persiste os dados no arquivo `data.json` do plugin automaticamente via `saveData` do Obsidian.

- **`view.ts`**:
    - **Função**: Interface de Usuário (UI).
    - **Responsabilidade**: Renderiza a visualização em grade da coleção.
    - **Detalhes**:
        - `DiscogsCollectionView`: Uma `ItemView` customizada que renderiza a estrutura HTML.
        - `renderGrid`: Constrói dinamicamente os cartões de álbum baseados nos dados em cache.
        - Implementa lógica de filtro (busca, status de nota) e ordenação (data, título, artista) inteiramente no cliente para velocidade.
        - Usa `IntersectionObserver` para carregamento lazy das imagens de capa.

- **`note-creator.ts`**:
    - **Função**: Lógica de Negócio (Geração de Conteúdo).
    - **Responsabilidade**: Cria arquivos Markdown para os álbuns.
    - **Detalhes**:
        - `createDiscogsNote`: Gera o conteúdo do arquivo com Frontmatter YAML e um template de corpo.
        - Verifica se o arquivo já existe para evitar sobrescrita (a menos que especificado).
        - Sanitiza nomes de arquivo para evitar erros no sistema de arquivos.

- **`settings.ts`**:
    - **Função**: Interface de Configuração.
    - **Responsabilidade**: Renderiza a aba de configurações do plugin.
    - **Detalhes**:
        - Valida o nome de usuário do Discogs antes de salvar.
        - Fornece opções para "Itens por Página" e "Pasta de Notas".
        - Inclui botões de ação para "Carregar Coleção" e "Limpar Cache".

- **`types.ts`**:
    - **Função**: Definições de Tipos.
    - **Responsabilidade**: Centraliza interfaces TypeScript.
    - **Detalhes**:
        - `DiscogsRelease`: Corresponde à estrutura JSON retornada pela API do Discogs.
        - `CachedAlbum`: Uma estrutura interna simplificada usada para a UI e Cache, desacoplando o app do formato específico da resposta da API.

- **`i18n/`**:
    - **Função**: Internacionalização.
    - **Responsabilidade**: Gerencia traduções para os idiomas suportados.
    - **Detalhes**:
        - `locales.ts`: Contém o dicionário de strings de tradução para todos os idiomas.
        - `index.ts`: Exporta a função auxiliar `t()` que detecta o local atual do Obsidian e retorna a string apropriada.

### 🔧 Manutenção e Evolução

Para manter ou evoluir o plugin, considere as seguintes diretrizes:

1.  **Adicionar Campos na Nota**:
    - Edite `note-creator.ts`. Modifique a função que monta o conteúdo do arquivo (`content`) ou o `frontmatter`.

2.  **Alterar a Interface Visual**:
    - Edite `view.ts`. O método `onOpen` e `render()` controlam o que é exibido. O CSS associado está em `styles.css` na raiz.

3.  **Novos Endpoints da API**:
    - Adicione novos métodos em `api.ts`. Crie as interfaces de resposta correspondentes em `types.ts`.

4.  **Atualização de Dependências**:
    - O plugin depende da API do Obsidian (`obsidian`). Mantenha-a atualizada no `package.json` para acessar novas funcionalidades do editor.