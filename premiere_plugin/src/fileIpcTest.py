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

import cv2
from math import *
import mediapipe as mp
import numpy as np

LEFT_EYE = [33, 133]
RIGHT_EYE = [362, 263]
EYES = LEFT_EYE + RIGHT_EYE
mpDraw = mp.solutions.drawing_utils
mpFaceMesh = mp.solutions.face_mesh
faceMesh = mpFaceMesh.FaceMesh(max_num_faces=1)
drawSpec = mpDraw.DrawingSpec(thickness=1, circle_radius=1)

def getV(img):
    imgRGB = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
    results = faceMesh.process(imgRGB)
    if results.multi_face_landmarks:
        faceLms = results.multi_face_landmarks[0]
        a = faceLms.landmark[LEFT_EYE[0]]
        b = faceLms.landmark[RIGHT_EYE[1]]
        return ((a.x / img.shape[0], a.y / img.shape[1]), (b.x / img.shape[0], b.y / img.shape[1]))
    else:
        return None

def length(v : tuple):
    return sqrt((v[0][0] - v[1][0]) ** 2 + (v[0][1] - v[1][1]) ** 2)

def getTan(v : tuple):
    if v[0][0] == v[1][0]:
        if v[0][1] < v[1][1]: return -100000
        else: return 100000
    else: 
        return (v[0][1] - v[1][1]) / (v[0][0] - v[1][0])
    
def ff(a : tuple, b : tuple, img_h : int):
    t1, t2 = getTan(a), getTan(b)
    t = atan((t1 - t2) / (1 + t1 * t2))
    if t < 0: t += pi
    a_ = (a[0][0] - b[0][0]) ** 2 + (a[0][1] - b[0][1]) ** 2
    c = abs(sqrt((a[0][0] - a[1][0]) ** 2 + (a[0][1] - a[1][1]) ** 2) - sqrt((b[0][0] - b[1][0]) ** 2 + (b[0][1] - b[1][1]) ** 2))
    return a_ + t / 100 + c

def compare(name1 : str, name2 : str, time1 : float, time2 : float):
    tmp1 = cv2.VideoCapture(name1); tmp1.set(cv2.CAP_PROP_POS_MSEC, time1 * 1000)
    tmp2 = cv2.VideoCapture(name2); tmp2.set(cv2.CAP_PROP_POS_MSEC, time2 * 1000)
    success1, img1 = tmp1.read()
    success2, img2 = tmp2.read()
    if not success1 or not success2: return False
    a = getV(img1)
    b = getV(img2)
    if a == None or b == None: return False
    return (ff(a, b, img1.shape[0]), a, b)

def face_landmarks(path : str, start : float, end : float, offset : float):
    cap = cv2.VideoCapture("path")
    fps = cap.get(cv2.CAP_PROP_FPS)
    cap.set(cv2.CAP_PROP_POS_MSEC, (start - offset) * 1000)
    pTime = 0
    for _ in range(int(fps * (end - start))):
        success, img = cap.read()
        if not success: break
        img_h, img_w, _ = img.shape
        imgRGB = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
        results = faceMesh.process(imgRGB)
        # print(None != results.multi_face_landmarks)
        if results.multi_face_landmarks:
            for faceLms in results.multi_face_landmarks:
                # draw eyes' end points
                for id in EYES:
                    lm = faceLms.landmark[id]
                    cv2.circle(img, (int(lm.x * img_w), int(lm.y * img_h)), 5, (255, 0, 0), cv2.FILLED)

        cTime = time.time()
        fps = 1 / (cTime - pTime)
        pTime = cTime
        cv2.putText(img, f'FPS: {int(fps)}', (20, 70), cv2.FONT_HERSHEY_PLAIN,
                    3, (255, 0, 0), 3)
        cv2.imshow("Image", img)
        cv2.waitKey(1)

    cv2.destroyAllWindows()
    cap.release()

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
        video1Offset = reader.get_float('video1Offset')
        video2Offset = reader.get_float('video2Offset')
        transitionIn = reader.get_float('transitionIn')
        transitionOut = reader.get_float('transitionOut')
        # face_landmarks(reader.get('video1Path'), transitionIn, transitionOut, video1Offset)
        # face_landmarks(reader.get('video2Path'), transitionIn, transitionOut, video2Offset)

        with open(responseFile, "w", encoding="utf-8") as f:
            ret = (0, 0, 0, 1, (0, 0), (0, 0)) # (x, y, angle, scale, Va, Vb)
            l = (transitionIn + 2 * transitionOut) / 3
            r = l
            while l <= transitionOut:
                cost = compare(reader.get('video1Path'), reader.get('video2Path'), -video1Offset + l, -video2Offset + l)
                if cost != False and cost[0] < 1:
                    r = l
                    while r <= transitionOut:
                        tmp = compare(reader.get('video1Path'), reader.get('video2Path'), -video1Offset + r + 0.033, -video2Offset + r + 0.033)
                        if tmp == False or tmp[0] >= 1: break
                        cost = tmp
                        r += 0.033
                    T1, T2 = getTan(cost[1]), getTan(cost[2])
                    ret = (cost[2][0][0] - cost[1][0][0], cost[2][0][1] - cost[1][0][1], atan((T2 - T1) / (1 + T1 * T2)), len(cost[2]) / len(cost[1]), cost[1], cost[2])
                    break
                l += 0.3
                r = l
            result = ""
            result += f"flag = {ret[0] < 1}\n"
            ret = list(ret)
            if ret[3] >= 1:
                result += f"object = a\n"
                result += f"axisX = {ret[4][0]}\n"
                result += f"axisY = {ret[4][1]}\n"
            else:
                result += f"object = b\n"
                result += f"axisX = {ret[5][0]}\n"
                result += f"axisY = {ret[5][1]}\n"
                ret[0] = -ret[0]
                ret[1] = -ret[1]
                ret[2] = -ret[2]
                ret[3] = 1 / ret[3]
            result += f"rangeL = {l}\n"
            result += f"rangeR = {r}\n"
            result += f"time = {(l + r) / 2}\n"
            result += f"vectorX = {ret[0]}\n"
            result += f"vectorY = {ret[1]}\n"
            result += f"counterclockwise_angle = {ret[2]}\n"
            result += f"scale = {ret[3]}\n"
            f.write(result)
        
        watcher.wait()
        print("File modified")
