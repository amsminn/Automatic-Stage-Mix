import cv2
import mediapipe as mp
import numpy as np  
import time

cap = cv2.VideoCapture("./aaaa.mp4")
pTime = 0
mpDraw = mp.solutions.drawing_utils
mpFaceMesh = mp.solutions.face_mesh
faceMesh = mpFaceMesh.FaceMesh(max_num_faces=10)
drawSpec = mpDraw.DrawingSpec(thickness=1, circle_radius=1)

LEFT_EYE = [33, 133]
RIGHT_EYE = [362, 263]
EYES = LEFT_EYE + RIGHT_EYE

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
            mpDraw.draw_landmarks(img, faceLms, mpFaceMesh.FACEMESH_CONTOURS, drawSpec, drawSpec)

            # draw eyes' end points
            # for id in EYES:
            #     lm = faceLms.landmark[id]
            #     cv2.circle(img, (int(lm.x * img_w), int(lm.y * img_h)), 5, (255, 0, 0), cv2.FILLED)


    cTime = time.time()
    fps = 1 / (cTime - pTime)
    pTime = cTime
    cv2.putText(img, f'FPS: {int(fps)}', (20, 70), cv2.FONT_HERSHEY_PLAIN,
                3, (255, 0, 0), 3)
    cv2.imshow("Image", img)
    cv2.waitKey(1)

cv2.destroyAllWindows()
cap.release()