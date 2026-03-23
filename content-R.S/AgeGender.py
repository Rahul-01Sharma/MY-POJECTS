import cv2 as cv
import time
from youtube_transcript_api import YouTubeTranscriptApi, TranscriptsDisabled
import os
import webbrowser

# Function to detect faces and predict age
def getFaceBox(net, frame, conf_threshold=0.7):
    frameOpencvDnn = frame.copy()
    frameHeight, frameWidth = frameOpencvDnn.shape[:2]
    blob = cv.dnn.blobFromImage(frameOpencvDnn, 1.0, (300, 300), [104, 117, 123], True, False)

    net.setInput(blob)
    detections = net.forward()
    bboxes = []
    for i in range(detections.shape[2]):
        confidence = detections[0, 0, i, 2]
        if confidence > conf_threshold:
            x1 = int(detections[0, 0, i, 3] * frameWidth)
            y1 = int(detections[0, 0, i, 4] * frameHeight)
            x2 = int(detections[0, 0, i, 5] * frameWidth)
            y2 = int(detections[0, 0, i, 6] * frameHeight)
            bboxes.append([x1, y1, x2, y2])
            cv.rectangle(frameOpencvDnn, (x1, y1), (x2, y2), (0, 255, 0), int(round(frameHeight / 150)), 8)
    return frameOpencvDnn, bboxes

# Age recognition setup
faceProto = "opencv_face_detector.pbtxt"
faceModel = "opencv_face_detector_uint8.pb"
ageProto = "age_deploy.prototxt"
ageModel = "age_net.caffemodel"

MODEL_MEAN_VALUES = (78.4263377603, 87.7689143744, 114.895847746)
ageList = ['(0-2)', '(4-6)', '(8-12)', '(15-20)', '(25-32)', '(38-43)', '(48-53)', '(60-100)']
ageNet = cv.dnn.readNet(ageModel, ageProto)
faceNet = cv.dnn.readNet(faceModel, faceProto)

cap = cv.VideoCapture(0)  # Open default camera
padding = 20

def check_file_safety(filename, bad_words_file):
    with open(bad_words_file, 'r') as f:
        unsafe_words = [line.strip() for line in f]

    with open(filename, 'r') as file:
        text = file.read()

    for word in unsafe_words:
        if word in text:
            return False  # Unsafe for children
    return True  # Safe for children

while cv.waitKey(1) < 0:
    hasFrame, frame = cap.read()
    if not hasFrame:
        cv.waitKey()
        break

    frameFace, bboxes = getFaceBox(faceNet, frame)
    if not bboxes:
        print("No face Detected, Checking next frame")
        continue

    for bbox in bboxes:
        face = frame[max(0, bbox[1] - padding):min(bbox[3] + padding, frame.shape[0] - 1),
                     max(0, bbox[0] - padding):min(bbox[2] + padding, frame.shape[1] - 1)]

        blob = cv.dnn.blobFromImage(face, 1.0, (227, 227), MODEL_MEAN_VALUES, swapRB=False)
        ageNet.setInput(blob)
        agePreds = ageNet.forward()
        age = ageList[agePreds[0].argmax()]
        print("Age : {}, conf = {:.3f}".format(age, agePreds[0].max()))

        label = "{}".format(age)
        cv.putText(frameFace, label, (bbox[0], bbox[1] - 10), cv.FONT_HERSHEY_SIMPLEX, 0.8, (0, 255, 255), 2, cv.LINE_AA)
        cv.imshow("Age Detection", frameFace)

        # Check for "15+" age group
        if "(15-20)" in age or "(25-32)" in age or "(38-43)" in age:
            print("15+ detected. Running second task...")
            cap.release()
            cv.destroyAllWindows()

            # Fetch YouTube transcript
            url = "https://youtu.be/ppJy5uGZLi4?si=HCFS3Usx-DQvyqIHj"  # Example video URL
            script = url.split("=")
            try:
                srt = YouTubeTranscriptApi.get_transcript(script[-1])  # Get transcript
                text = ""

                with open("caption.txt", "w") as file:
                    for i in srt:
                        text += i["text"] + "\n"  # Add newline for better readability
                        file.write(text)
                        text = ""  # Reset for next line

                os.startfile("caption.txt")  # Open the caption file

                # Check the safety of the file
                bad_words_file = "BadWords.txt"  # File containing unsafe words
                is_safe = check_file_safety("caption.txt", bad_words_file)

                # Play appropriate video
                if is_safe:
                    print("Content is safe for children. Playing the original video.")
                    webbrowser.open("https://youtu.be/ppJy5uGZLi4?si=HCFS3Usx-DQvyqIHj")  # Safe video URL
                else:
                    print("Content is not safe for children. Playing an alternate video.")
                    webbrowser.open("https://youtu.be/dQw4w9WgXcQ")  # Unsafe video URL (example)

            except TranscriptsDisabled:
                print("Subtitles are disabled for this video.")
                print("Playing alternate video for 15+ category.")
                webbrowser.open("https://youtu.be/dQw4w9WgXcQ")  # Alternate video URL
            exit()

