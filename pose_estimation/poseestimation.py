import cv2
import numpy as np
import mediapipe as mp

def visualize_pose(frame, results):
    if results.pose_landmarks:
        for connection in mp_pose.POSE_CONNECTIONS:
            part_from = connection[0]
            part_to = connection[1]

            h, w, c = frame.shape
            from_x, from_y = int(results.pose_landmarks.landmark[part_from].x * w), int(results.pose_landmarks.landmark[part_from].y * h)
            to_x, to_y = int(results.pose_landmarks.landmark[part_to].x * w), int(results.pose_landmarks.landmark[part_to].y * h)

            color = (0, 255, 0)
            cv2.line(frame, (from_x, from_y), (to_x, to_y), color, 3)

        for landmark in results.pose_landmarks.landmark:
            cx, cy = int(landmark.x * w), int(landmark.y * h)
            cv2.circle(frame, (cx, cy), 5, (0, 0, 255), -1)

    return frame

mp_pose = mp.solutions.pose
pose = mp_pose.Pose(static_image_mode=False, min_detection_confidence=0.6, min_tracking_confidence=0.6)

video_path = "test1.mp4"
cap = cv2.VideoCapture(video_path)

while cap.isOpened():
    ret, frame = cap.read()
    if not ret:
        break

    rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)

    results = pose.process(rgb_frame)

    output_frame = visualize_pose(frame.copy(), results)

    cv2.imshow("Pose Estimation", output_frame)

    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

cap.release()
cv2.destroyAllWindows()
