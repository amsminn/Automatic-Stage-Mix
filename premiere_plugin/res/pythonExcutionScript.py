
import sys
import socket
import subprocess

def ping(port: int) -> bool:
    try:
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
            s.connect(("localhost", port))
            s.close()
    except ConnectionRefusedError:
        return False
    
    return True

if __name__ == "__main__":
    if (ping(int(29381))):
        sys.exit(0)
    else:
        subprocess.Popen('''python "D:/noname/Projects/GitHub/Automatic-Stage-Mix/premiere_plugin/src/fileIpcTest.py" "29381" "D:/noname/Projects/GitHub/Automatic-Stage-Mix/premiere_plugin/res/params.txt" "D:/noname/Projects/GitHub/Automatic-Stage-Mix/premiere_plugin/res/result.txt"''', cwd="D:/noname/Projects/GitHub/Automatic-Stage-Mix/premiere_plugin/src/")
