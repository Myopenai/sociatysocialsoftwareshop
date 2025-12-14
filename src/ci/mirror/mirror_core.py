"""
Core Mirror System Implementation
"""
import os
import json
import yaml
import logging
import shutil
import hashlib
from pathlib import Path
from typing import Dict, List, Optional, Any
from dataclasses import dataclass, field
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler

# Default configuration
DEFAULT_CONFIG = {
    "rules": [
        {
            "name": "Default Mirror Rule",
            "source": "./source",
            "destination": "./mirror",
            "recursive": True,
            "file_rules": [
                {
                    "pattern": "*",
                    "fix_errors": False,
                    "backup": True,
                    "max_size": 10485760  # 10MB
                }
            ]
        }
    ],
    "logging": {
        "level": "INFO",
        "file": "mirror_system.log",
        "max_size": 10485760,  # 10MB
        "backup_count": 5
    }
}

class FileRule:
    """Rule for handling specific file patterns"""
    def __init__(self, pattern: str = "*", **kwargs):
        self.pattern = pattern
        self.fix_errors = kwargs.get('fix_errors', False)
        self.backup = kwargs.get('backup', True)
        self.max_size = kwargs.get('max_size', 10 * 1024 * 1024)  # 10MB default
        self.allowed_extensions = kwargs.get('allowed_extensions', ['*'])

class MirrorRule:
    """Rule defining how to mirror a source to a destination"""
    def __init__(self, name: str, source: str, destination: str, **kwargs):
        self.name = name
        self.source = str(Path(source).resolve())
        self.destination = str(Path(destination).resolve())
        self.recursive = kwargs.get('recursive', True)
        self.file_rules = [FileRule(**rule) if isinstance(rule, dict) else rule 
                         for rule in kwargs.get('file_rules', [])]
        self.conflict_resolution = kwargs.get('conflict_resolution', 'source')

class MirrorSystem:
    """Main mirror system class"""
    
    def __init__(self, config_path: str = None):
        self.mirrors: Dict[str, MirrorRule] = {}
        self.observer = Observer()
        self.setup_logging()
        self.load_config(config_path)
        self.setup_directories()

    def setup_logging(self):
        """Configure logging"""
        self.logger = logging.getLogger('MirrorSystem')
        self.logger.setLevel(logging.INFO)
        
        formatter = logging.Formatter(
            '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
        )
        
        # Console handler
        ch = logging.StreamHandler()
        ch.setFormatter(formatter)
        self.logger.addHandler(ch)
        
        self.logger.info("Mirror system initialized")

    def load_config(self, config_path: str = None) -> None:
        """Load configuration from file or use defaults"""
        self.config = DEFAULT_CONFIG.copy()
        
        if config_path and os.path.exists(config_path):
            try:
                with open(config_path, 'r') as f:
                    if config_path.endswith('.json'):
                        config = json.load(f)
                    else:  # Assume YAML
                        config = yaml.safe_load(f) or {}
                self.config.update(config)
                self.logger.info(f"Loaded configuration from {config_path}")
            except Exception as e:
                self.logger.error(f"Error loading config: {e}")
                self.logger.info("Using default configuration")
        
        # Initialize mirror rules
        for rule_config in self.config.get('rules', []):
            try:
                rule = MirrorRule(**rule_config)
                self.mirrors[rule.source] = rule
                self.logger.info(f"Added mirror rule: {rule.name}")
            except Exception as e:
                self.logger.error(f"Error creating mirror rule: {e}")

    def setup_directories(self) -> None:
        """Ensure all required directories exist"""
        for rule in self.mirrors.values():
            os.makedirs(rule.source, exist_ok=True)
            os.makedirs(rule.destination, exist_ok=True)
            self.logger.debug(f"Ensured directories exist: {rule.source} -> {rule.destination}")

    def sync_file(self, source: str, destination: str, rule: MirrorRule) -> bool:
        """Synchronize a single file with error handling"""
        try:
            # Check if source exists
            if not os.path.exists(source):
                if os.path.exists(destination):
                    os.remove(destination)
                    self.logger.info(f"Removed {destination} (source deleted)")
                return True

            # Check file size
            file_size = os.path.getsize(source)
            file_rule = next(
                (r for r in rule.file_rules if Path(source).match(r.pattern)),
                FileRule()
            )

            if file_size > file_rule.max_size:
                self.logger.warning(f"File {source} exceeds maximum size limit")
                return False

            # Create backup if needed
            if file_rule.backup and os.path.exists(destination):
                self.backup_file(destination)

            # Perform the copy
            shutil.copy2(source, destination)
            self.logger.debug(f"Synced {source} -> {destination}")

            return True

        except Exception as e:
            self.logger.error(f"Error syncing {source}: {e}")
            return False

    def backup_file(self, file_path: str) -> bool:
        """Create a backup of a file"""
        try:
            if not os.path.exists(file_path):
                return False
            backup_path = f"{file_path}.bak"
            shutil.copy2(file_path, backup_path)
            self.logger.debug(f"Created backup: {backup_path}")
            return True
        except Exception as e:
            self.logger.error(f"Error creating backup for {file_path}: {e}")
            return False

    def start(self) -> None:
        """Start the mirror system"""
        self.logger.info("Starting mirror system...")
        
        # Initial sync
        for rule in self.mirrors.values():
            self.sync_directory(rule.source, rule)

        # Set up file system event handler
        event_handler = MirrorEventHandler(self)
        
        # Watch all source directories
        for rule in self.mirrors.values():
            self.observer.schedule(
                event_handler,
                rule.source,
                recursive=rule.recursive
            )
            self.logger.info(f"Watching directory: {rule.source} -> {rule.destination}")

        self.observer.start()
        self.logger.info("Mirror system is running")

    def stop(self) -> None:
        """Stop the mirror system"""
        self.observer.stop()
        self.observer.join()
        self.logger.info("Mirror system stopped")

    def sync_directory(self, source_dir: str, rule: MirrorRule) -> None:
        """Synchronize an entire directory"""
        try:
            for root, _, files in os.walk(source_dir):
                for file in files:
                    source_path = os.path.join(root, file)
                    rel_path = os.path.relpath(source_path, rule.source)
                    dest_path = os.path.join(rule.destination, rel_path)
                    
                    # Ensure destination directory exists
                    os.makedirs(os.path.dirname(dest_path), exist_ok=True)
                    
                    # Sync the file
                    self.sync_file(source_path, dest_path, rule)
        except Exception as e:
            self.logger.error(f"Error syncing directory {source_dir}: {e}")

class MirrorEventHandler(FileSystemEventHandler):
    """Handle file system events for mirroring"""
    
    def __init__(self, mirror_system: MirrorSystem):
        self.mirror_system = mirror_system
        self.logger = mirror_system.logger

    def on_any_event(self, event):
        if event.is_directory:
            return

        # Find matching mirror rule
        for rule in self.mirror_system.mirrors.values():
            try:
                src_path = Path(event.src_path)
                if src_path.is_relative_to(rule.source):
                    rel_path = src_path.relative_to(rule.source)
                    dest_path = Path(rule.destination) / rel_path
                    
                    if event.event_type in ('created', 'modified'):
                        self.mirror_system.sync_file(
                            str(src_path),
                            str(dest_path),
                            rule
                        )
                    elif event.event_type == 'deleted':
                        if dest_path.exists():
                            os.remove(dest_path)
                            self.logger.info(f"Removed {dest_path}")
                    
            except Exception as e:
                self.logger.error(f"Error handling {event.event_type} event for {event.src_path}: {e}")
