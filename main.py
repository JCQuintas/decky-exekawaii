import os
import json
import subprocess
import uuid
from typing import Any

import decky

# Configuration directory for JSON command files
COMMANDS_DIR_NAME = "commands"
INPUT_DIR_NAME = "inputs"


class Plugin:
    commands: dict[str, dict] = {}
    commands_dir: str = ""
    input_dir: str = ""

    def _get_commands_dir(self) -> str:
        """Get the commands directory path, creating it if necessary."""
        if not self.commands_dir:
            self.commands_dir = os.path.join(decky.DECKY_PLUGIN_SETTINGS_DIR, COMMANDS_DIR_NAME)
        if not os.path.exists(self.commands_dir):
            os.makedirs(self.commands_dir, exist_ok=True)
        return self.commands_dir

    def _get_input_dir(self) -> str:
        """Get the input directory path, creating it if necessary."""
        if not self.input_dir:
            self.input_dir = os.path.join(decky.DECKY_PLUGIN_SETTINGS_DIR, INPUT_DIR_NAME)
        if not os.path.exists(self.input_dir):
            os.makedirs(self.input_dir, exist_ok=True)
        return self.input_dir

    def _load_commands_from_files(self) -> None:
        """Load all command configurations from JSON files in the commands directory."""
        commands_dir = self._get_commands_dir()
        self.commands = {}

        if not os.path.exists(commands_dir):
            return

        for filename in os.listdir(commands_dir):
            if filename.endswith(".json"):
                filepath = os.path.join(commands_dir, filename)
                try:
                    with open(filepath, "r") as f:
                        command_data = json.load(f)
                        # Use filename (without .json) as ID if not present
                        if "id" not in command_data:
                            command_data["id"] = filename[:-5]
                        self.commands[command_data["id"]] = command_data
                        decky.logger.info(f"Loaded command: {command_data.get('title', filename)}")
                except Exception as e:
                    decky.logger.error(f"Failed to load command from {filename}: {e}")

    def _save_command_to_file(self, command: dict) -> bool:
        """Save a command configuration to a JSON file."""
        commands_dir = self._get_commands_dir()
        filepath = os.path.join(commands_dir, f"{command['id']}.json")
        try:
            with open(filepath, "w") as f:
                json.dump(command, f, indent=2)
            return True
        except Exception as e:
            decky.logger.error(f"Failed to save command {command['id']}: {e}")
            return False

    def _delete_command_file(self, command_id: str) -> bool:
        """Delete a command configuration file."""
        commands_dir = self._get_commands_dir()
        filepath = os.path.join(commands_dir, f"{command_id}.json")
        try:
            if os.path.exists(filepath):
                os.remove(filepath)
            return True
        except Exception as e:
            decky.logger.error(f"Failed to delete command {command_id}: {e}")
            return False

    async def get_commands(self) -> dict[str, Any]:
        """Get all configured commands."""
        self._load_commands_from_files()
        return {"commands": list(self.commands.values())}

    async def get_command(self, command_id: str) -> dict | None:
        """Get a specific command by ID."""
        self._load_commands_from_files()
        return self.commands.get(command_id)

    async def save_command(self, command: dict) -> dict:
        """Save a command configuration (create or update)."""
        # Generate ID if not present (new command)
        if "id" not in command or not command["id"]:
            command["id"] = str(uuid.uuid4())

        # Validate required fields
        if "title" not in command or not command["title"]:
            return {"success": False, "error": "Title is required"}
        if "command" not in command or not command["command"]:
            return {"success": False, "error": "Command is required"}

        # Save to file
        if self._save_command_to_file(command):
            self.commands[command["id"]] = command
            return {"success": True, "command": command}
        else:
            return {"success": False, "error": "Failed to save command"}

    async def delete_command(self, command_id: str) -> dict:
        """Delete a command configuration."""
        if self._delete_command_file(command_id):
            if command_id in self.commands:
                del self.commands[command_id]
            # Also delete the input file if it exists
            input_dir = self._get_input_dir()
            input_filepath = os.path.join(input_dir, f"{command_id}.json")
            if os.path.exists(input_filepath):
                try:
                    os.remove(input_filepath)
                except Exception as e:
                    decky.logger.error(f"Failed to delete input file for {command_id}: {e}")
            return {"success": True}
        else:
            return {"success": False, "error": "Failed to delete command"}

    async def get_all_input_values(self) -> dict[str, dict]:
        """Load all input values from JSON files in the input directory."""
        input_dir = self._get_input_dir()
        all_values = {}

        if not os.path.exists(input_dir):
            return all_values

        for filename in os.listdir(input_dir):
            if filename.endswith(".json"):
                filepath = os.path.join(input_dir, filename)
                try:
                    with open(filepath, "r") as f:
                        values = json.load(f)
                        command_id = filename[:-5]  # Remove .json extension
                        all_values[command_id] = values
                except Exception as e:
                    decky.logger.error(f"Failed to load input values from {filename}: {e}")

        return all_values

    async def save_input_values(self, command_id: str, values: dict) -> dict:
        """Save input values for a command to a JSON file."""
        input_dir = self._get_input_dir()
        filepath = os.path.join(input_dir, f"{command_id}.json")
        try:
            with open(filepath, "w") as f:
                json.dump(values, f, indent=2)
            return {"success": True}
        except Exception as e:
            decky.logger.error(f"Failed to save input values for {command_id}: {e}")
            return {"success": False, "error": str(e)}

    def _prepare_clean_env(self, env_vars: dict | None = None) -> dict:
        env = os.environ.copy()

        # Remove Decky's LD_LIBRARY_PATH - it breaks system libraries for some commands
        env.pop("LD_LIBRARY_PATH", None)
        env.pop("LD_PRELOAD", None)

        # Ensure proper user environment
        uid = os.getuid()
        home_dir = os.path.expanduser("~")

        env["HOME"] = home_dir
        env["PWD"] = home_dir
        env["XDG_RUNTIME_DIR"] = f"/run/user/{uid}"

        # Add user-provided environment variables
        if env_vars:
            for key, value in env_vars.items():
                # Convert booleans and numbers to strings
                if isinstance(value, bool):
                    env[key] = "1" if value else "0"
                else:
                    env[key] = str(value)

        return env

    async def execute_command(self, command_id: str, env_vars: dict | None = None) -> dict:
        """Execute a command with optional environment variables."""
        self._load_commands_from_files()

        command = self.commands.get(command_id)
        if not command:
            return {
                "success": False,
                "output": f"Command not found: {command_id}",
                "exitCode": -1
            }

        cmd = command["command"]
        decky.logger.info(f"Executing command: {cmd}")

        env = self._prepare_clean_env(env_vars)

        # Expand ~ in command path
        cmd = os.path.expanduser(cmd)

        try:
            # Use bash login shell to ensure proper environment
            result = subprocess.run(
                ["/bin/bash", "-l", "-c", cmd],
                capture_output=True,
                text=True,
                env=env,
                cwd=os.path.expanduser("~"),
                timeout=300  # 5 minute timeout
            )

            output = result.stdout
            if result.stderr:
                output += "\n" + result.stderr if output else result.stderr

            return {
                "success": result.returncode == 0,
                "output": output,
                "exitCode": result.returncode
            }
        except subprocess.TimeoutExpired:
            return {
                "success": False,
                "output": "Command timed out after 5 minutes",
                "exitCode": -1
            }
        except Exception as e:
            decky.logger.error(f"Failed to execute command: {e}")
            return {
                "success": False,
                "output": str(e),
                "exitCode": -1
            }

    async def get_commands_dir_path(self) -> str:
        """Get the path to the commands directory."""
        return self._get_commands_dir()

    async def _main(self):
        """Plugin initialization."""
        decky.logger.info("ExeKawaii plugin starting...")
        self._load_commands_from_files()
        decky.logger.info(f"Loaded {len(self.commands)} commands")

    async def _unload(self):
        """Plugin unload handler."""
        decky.logger.info("ExeKawaii plugin unloading...")

    async def _uninstall(self):
        """Plugin uninstall handler."""
        decky.logger.info("ExeKawaii plugin uninstalling...")

    async def _migration(self):
        """Handle migrations from previous versions."""
        decky.logger.info("ExeKawaii migration check...")
        # Ensure commands directory exists
        self._get_commands_dir()
