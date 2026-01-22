# ExeKawaii - Decky Plugin

A [Decky Loader](https://github.com/SteamDeckHomebrew/decky-loader) plugin that allows you to run user-configurable CLI commands on your Steam Deck.

## Features

- Create and manage shell commands from the Steam Deck UI
- Configure environment variables using an intuitive UI
- Support for multiple input types: boolean switches, number sliders, and dropdown selects
- Load commands from JSON configuration files
- Visual dividers to organize configuration panels

## Usage

### Creating Commands via UI

1. Open the plugin from the Decky menu
2. Click "New Command" to create a new command
3. Fill in the title, description, and command
4. Optionally add configuration fields for environment variables
5. Click "Save"

### Creating Commands via JSON Files

You can also create commands by placing JSON files in the commands directory:

```
~/.local/share/decky/decky-exekawaii/commands/
```

The plugin will automatically load all `.json` files from this directory.

### JSON Configuration Format

```json
{
  "id": "unique-command-id",
  "title": "Command Title",
  "description": "Description of what the command does",
  "command": "your-shell-command --with $ENV_VAR",
  "configFields": [
    {
      "type": "boolean",
      "title": "Enable Feature",
      "description": "Toggle this feature on/off",
      "envVar": "FEATURE_ENABLED",
      "initialValue": false
    },
    {
      "type": "number",
      "title": "Count",
      "description": "Set a numeric value",
      "envVar": "COUNT",
      "initialValue": 10,
      "min": 0,
      "max": 100,
      "step": 5
    },
    {
      "type": "select",
      "title": "Mode",
      "description": "Select an option",
      "envVar": "MODE",
      "initialValue": "default",
      "options": [
        { "label": "Default", "value": "default" },
        { "label": "Fast", "value": "fast" },
        { "label": "Safe", "value": "safe" }
      ]
    },
    {
      "type": "divider",
      "title": "Section Title",
      "description": "Visual separator for organizing options"
    }
  ]
}
```

### Configuration Field Types

#### Boolean (Switch)

```json
{
  "type": "boolean",
  "title": "Field Title",
  "description": "Optional description",
  "envVar": "ENV_VAR_NAME",
  "initialValue": false
}
```

- Renders as an on/off toggle switch
- Environment variable will be set to "1" (on) or "0" (off)

#### Number (Slider)

```json
{
  "type": "number",
  "title": "Field Title",
  "description": "Optional description",
  "envVar": "ENV_VAR_NAME",
  "initialValue": 50,
  "min": 0,
  "max": 100,
  "step": 1
}
```

- Renders as a slider control
- `min`, `max`: Define the range
- `step`: Optional increment value (default: 1)

#### Select (Dropdown)

```json
{
  "type": "select",
  "title": "Field Title",
  "description": "Optional description",
  "envVar": "ENV_VAR_NAME",
  "initialValue": "option1",
  "options": [
    { "label": "Display Text 1", "value": "option1" },
    { "label": "Display Text 2", "value": "option2" }
  ]
}
```

- Renders as a dropdown menu
- `options`: Array of label/value pairs

#### Divider

```json
{
  "type": "divider",
  "title": "Section Title",
  "description": "Optional description"
}
```

- Creates a visual separator
- No environment variable (purely visual)
