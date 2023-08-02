import os
import time
from typing import Callable

class FileWatcher:
    def __init__(self, filepath) -> None:
        self._filepath = filepath
        self._last_modified = os.path.getmtime(filepath)
        self._on_modified: Callable[[str], None] = None

    def check(self) -> bool:
        modified = os.path.getmtime(self._filepath)
        
        if modified != self._last_modified:
            self._last_modified = modified
            return True
        
        return False
        
    def on_modified(self, callback: Callable[[str], None]) -> None:
        self._on_modified = callback
    
    def run(self) -> None:
        """
        Blocking function that checks if the file has been modified
        """
        
        while True:
            if self.check():
                self._on_modified(self._filepath)
            time.sleep(1)

if __name__ == "__main__":
    watcher = FileWatcher("res/params.txt")
    watcher.on_modified(lambda path: print(f"File {path} has been modified"))
    watcher.run()
