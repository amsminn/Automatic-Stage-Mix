import cv2
import dlib

landmark_model_path = 'shape_predictor_68_face_landmarks.dat'

detector = dlib.get_frontal_face_detector()

predictor = dlib.shape_predictor(landmark_model_path)

video_path = 'newjeans1080.mp4'

video = cv2.VideoCapture(video_path)

while True:

    ret, frame = video.read()

    if not ret:
        break


    frame = cv2.resize(frame, (640, 480))

    # 얼굴 감지
    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
    faces = detector(gray)

    # 얼굴 랜드마크 추출
    for face in faces:
        landmarks = predictor(gray, face)
        # 눈 양끝점 추출
        left_eye_end_point = (landmarks.part(36).x, landmarks.part(36).y)
        right_eye_end_point = (landmarks.part(45).x, landmarks.part(45).y)

        # 얼굴 랜드마크 및 눈 양끝점 시각화
        for i in range(68):
            x, y = landmarks.part(i).x, landmarks.part(i).y
            cv2.circle(frame, (x, y), 1, (0, 255, 0), -1)

        cv2.circle(frame, left_eye_end_point, 3, (255, 0, 0), -1)
        cv2.circle(frame, right_eye_end_point, 3, (255, 0, 0), -1)

    # 프레임 출력
    cv2.imshow('Facelandmark Detection', frame)

    # q를 누르면 종료
    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

video.release()
cv2.destroyAllWindows()
