"""
Mirror System - Integration with TypeScript mirror service.
This module provides a Python interface for the mirroring functionality.
"""
import os
import json
from typing import Dict, Any, Optional
from pathlib import Path
from .mirror_core import MirrorSystem

def get_mirror_system(config_path: Optional[str] = None) -> MirrorSystem:
    """Get or create a singleton instance of MirrorSystem"""
    if not hasattr(get_mirror_system, '_instance'):
        get_mirror_system._instance = MirrorSystem(config_path)
    return get_mirror_system._instance

def start_mirror(config_path: Optional[str] = None) -> Dict[str, Any]:
    """Start the mirror system with the given configuration"""
    try:
        mirror = get_mirror_system(config_path)
        mirror.start()
        return {"status": "success", "message": "Mirror system started"}
    except Exception as e:
        return {"status": "error", "message": str(e)}

def stop_mirror() -> Dict[str, Any]:
    """Stop the mirror system"""
    try:
        if hasattr(get_mirror_system, '_instance'):
            get_mirror_system._instance.stop()
            delattr(get_mirror_system, '_instance')
        return {"status": "success", "message": "Mirror system stopped"}
    except Exception as e:
        return {"status": "error", "message": str(e)}

def sync_file(source: str, destination: str) -> Dict[str, Any]:
    """Synchronize a single file"""
    try:
        mirror = get_mirror_system()
        # Find the matching rule
        for rule in mirror.mirrors.values():
            if source.startswith(rule.source):
                success = mirror.sync_file(source, destination, rule)
                if success:
                    return {"status": "success", "message": f"Synced {source} to {destination}"}
        return {"status": "error", "message": "No matching mirror rule found"}
    except Exception as e:
        return {"status": "error", "message": str(e)}

if __name__ == "__main__":
    # Example usage
    import sys
    if len(sys.argv) > 1:
        if sys.argv[1] == "start":
            config = sys.argv[2] if len(sys.argv) > 2 else None
            print(json.dumps(start_mirror(config)))
        elif sys.argv[1] == "stop":
            print(json.dumps(stop_mirror()))
        elif sys.argv[1] == "sync" and len(sys.argv) > 3:
            print(json.dumps(sync_file(sys.argv[2], sys.argv[3])))
        else:
            print(json.dumps({"status": "error", "message": "Invalid command"}))
    else:
        print("Usage: python -m src.ci.mirror.mirror_system [start [config]|stop|sync source destination]")
