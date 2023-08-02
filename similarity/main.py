import cv2
from math import *
import mediapipe as mp
import numpy as np  
import time

LEFT_EYE = [33, 133]
RIGHT_EYE = [362, 263]
EYES = LEFT_EYE + RIGHT_EYE
mpDraw = mp.solutions.drawing_utils
mpFaceMesh = mp.solutions.face_mesh
faceMesh = mpFaceMesh.FaceMesh(max_num_faces=10)
drawSpec = mpDraw.DrawingSpec(thickness=1, circle_radius=1)

def getV(img):
    imgRGB = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
    results = faceMesh.process(imgRGB)
    if results.multi_face_landmarks:
        faceLms = results.multi_face_landmarks[0]
        a = faceLms.landmark[LEFT_EYE[0]]
        b = faceLms.landmark[RIGHT_EYE[1]]
        return ((a.x, a.y), (b.x, b.y))
    else:
        return None

def getTan(v : tuple):
    if v[0][0] == v[1][0]:
        if v[0][1] < v[1][1]: return -100000
        else: return 100000
    else: 
        return (v[0][1] - v[1][1]) / (v[0][0] - v[1][0])
    
def f(a : tuple, b : tuple, img_h : int):
    t1, t2 = getTan(a), getTan(b)
    t = atan((t1 - t2) / (1 + t1 * t2))
    if t < 0: t += pi
    a = (a[0][0] - b[0][0]) ** 2 + (a[0][1] - b[0][1]) ** 2
    c = abs(sqrt((a[0][0] - a[1][0]) ** 2 + (a[0][1] - a[1][1]) ** 2) - sqrt((b[0][0] - b[1][0]) ** 2 + (b[0][1] - b[1][1]) ** 2))
    return a + t * img_h / 10 + c

def compare():
    img1 = cv2.imread("./1.jpg")
    img2 = cv2.imread("./2.jpg")
    a = getV(img1)
    b = getV(img2)
    if a == None or b == None: return False
    return f(a, b, img1.shape[0])

def face_landmarks():
    cap = cv2.VideoCapture("./aaaa.mp4")
    pTime = 0
    while True:
        success, img = cap.read()
        if not success: break
        img_h, img_w, _ = img.shape
        imgRGB = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
        results = faceMesh.process(imgRGB)
        # print(None != results.multi_face_landmarks)
        if results.multi_face_landmarks:
            for faceLms in results.multi_face_landmarks:
                # draw full face mesh
                # mpDraw.draw_landmarks(img, faceLms, mpFaceMesh.FACEMESH_CONTOURS, drawSpec, drawSpec)

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
    print(compare()) # under 300 is similar