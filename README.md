# AI Presentation Generator

A static frontend + Azure Functions backend that generates styled, standalone HTML presentations using OpenAI GPT-4o.

## Features

- **5 presentation themes** — Formal, Professional, Fun, Creative, Minimalist — each with a unique navigation style, font pairing, and color palette
- **Interactive editor** — Edit slide content, reorder/add/delete slides, change fonts, colors, background patterns, gradients, navigation style, and transitions — all with live preview
- **Standalone output** — Download a single `.html` file with zero external dependencies (except Google Fonts) that works offline
- **Azure Functions proxy** — Your OpenAI API key stays server-side; the frontend calls `/api/generate`

## Project Structure

```
presentation-generator/
├── index.html                      # App UI: form + preview iframe + editor sidebar
├── css/style.css                   # Glassmorphic design system
├── js/
│   ├── app.js                      # Orchestration, events, validation
│   ├── ai.js                       # Calls /api/generate
│   ├── generator.js                # Standalone HTML builder + slide engine
│   ├── themes.js                   # 5 themes with nav styles, fonts, colors
│   └── editor.js                   # Interactive preview editor controls
├── api/
│   ├── generate/
│   │   ├── index.js                # Azure Function: OpenAI proxy
│   │   └── function.json           # HTTP trigger binding
│   ├── host.json
│   ├── local.settings.json         # OPENAI_API_KEY (gitignored)
│   └── package.json                # openai SDK dependency
├── staticwebapp.config.json
├── .gitignore
└── README.md
```

## Local Development

### Prerequisites

- [Node.js 18+](https://nodejs.org/)
- [Azure Functions Core Tools v4](https://learn.microsoft.com/azure/azure-functions/functions-run-local)
- [Azure Static Web Apps CLI](https://github.com/Azure/static-web-apps-cli)

### Setup

1. **Install API dependencies:**
   ```bash
   cd api
   npm install
   ```

2. **Configure your OpenAI API key:**
   Edit `api/local.settings.json`:
   ```json
   {
     "IsEncrypted": false,
     "Values": {
       "FUNCTIONS_WORKER_RUNTIME": "node",
       "OPENAI_API_KEY": "sk-your-actual-key-here"
     }
   }
   ```

3. **Start the dev server:**
   ```bash
   swa start . --api-location api
   ```

4. Open `http://localhost:4280` in your browser.

## Azure Deployment

### Option A: Azure CLI

1. **Create an Azure Static Web App:**
   ```bash
   az staticwebapp create \
     --name presentation-generator \
     --resource-group <your-rg> \
     --location <region>
   ```

2. **Set the API key in App Settings:**
   ```bash
   az staticwebapp appsettings set \
     --name presentation-generator \
     --resource-group <your-rg> \
     --setting-names OPENAI_API_KEY=sk-your-key-here
   ```

3. **Deploy:**
   ```bash
   swa deploy --app-location . --api-location api
   ```

### Option B: GitHub Actions

Connect your repo to Azure Static Web Apps via the Azure Portal. It auto-generates a GitHub Actions workflow. Add `OPENAI_API_KEY` as an Application Setting in the Azure Portal.

## Usage

1. Enter a **topic** and optional **detailed prompt**
2. Select **style**, **audience**, and **slide count**
3. Click **Generate** — AI creates the slide content
4. Use the **editor sidebar** to customize:
   - Edit slide text (first line = heading, lines starting with `•`/`-`/`*` = bullets)
   - Drag to reorder, delete, or add slides
   - Switch font pairs, colors, gradients, background patterns
   - Override navigation style and transitions
5. **Download** the final `.html` file or **Open in New Tab**

## Keyboard Shortcuts (in generated presentation)

| Key | Action |
|---|---|
| `→` / `Space` | Next slide |
| `←` | Previous slide |
| `F` | Toggle fullscreen |
| `Esc` | Close slide index |
| Click | Next slide (outside nav) |

## License

MIT
