import os
import time
import sys
import socket
import threading

class FileWatcher:
    def __init__(self, filepath: str) -> None:
        self._filepath = filepath
        if (os.path.exists(filepath)):
            self._last_modified = os.path.getmtime(filepath)
        else:
            print(f"File {os.path.abspath(filepath)} does not exist")
            self._last_modified = 0

    def check(self) -> bool:
        if not os.path.exists(self._filepath):
            return False
        
        modified = os.path.getmtime(self._filepath)
        
        if modified != self._last_modified:
            self._last_modified = modified
            return True
        
        return False
    
    def wait(self) -> None:
        """
        Blocking function that checks if the file has been modified
        """
        
        while True:
            if self.check():
                break
            time.sleep(200 / 1000)

class ParamReader:
    def __init__(self, filepath: str) -> None:
        self._filepath = filepath
        self._params = {}
    
    def read_params(self) -> None:
        self._params = {}

        with open(self._filepath, "r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if line == "" or line.startswith("#"):
                    continue
                key, value = line.split("=")
                self._params[key.strip()] = value.strip()
    
    def get(self, key: str) -> str:
        return self._params[key]
    
    def get_float(self, key: str) -> float:
        return float(self._params[key])
    
class ProcessPingServer:
    def __init__(self, port: int) -> None:
        self._port = port
        self._socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        self._socket.bind(("localhost", port))
        self._socket.listen(1)
        self._thread = threading.Thread(target=self._run, daemon=True)
        self._thread.start()
    
    def _run(self) -> None:
        while True:
            conn, addr = self._socket.accept()
            conn.close()

if __name__ == "__main__":
    ProcessPingServer(int(sys.argv[1]))
    watchFile = sys.argv[2]
    responseFile = sys.argv[3]

    watcher = FileWatcher(watchFile)
    reader = ParamReader(watchFile)
    while True:
        reader.read_params()
        print(f"video1Path = {reader.get('video1Path')}")
        print(f"video2Path = {reader.get('video2Path')}")
        print(f"video1Offset = {reader.get('video1Offset')}")
        print(f"video2Offset = {reader.get('video2Offset')}")
        print(f"transitionIn = {reader.get('transitionIn')}")
        print(f"transitionOut = {reader.get('transitionOut')}")

        # make response

        with open(responseFile, "w", encoding="utf-8") as f:
            f.write(f"currentTime: {time.time()}\n")
        
        watcher.wait()
        print("File modified")
