from moviepy.editor import *
from moviepy.editor import VideoFileClip, concatenate_videoclips
import random
min_video_time = 10000
change_time = 10
set_clip = []
pad_time = 4
video_path = "C:/Users/aero0/Desktop/urop/영상 소스"
origin_videopath = os.listdir(video_path)
for i in range(len(origin_videopath)):
    clip = os.path.join(video_path, sorted(os.listdir(video_path))[i])
    clip = VideoFileClip(clip)
    if min_video_time > clip.duration:
        min_video_time = clip.duration
    clip.subclip(0,clip.duration)
    set_clip.append(clip)

cur_video=0
mix_clip = []
t = 3
mix_clip.append(set_clip[cur_video].subclip(0,min(t,min_video_time)))
while t < min_video_time:
    cur_t = t
    next_t = min(t+change_time, min_video_time)
    reference_clip = set_clip[cur_video].subclip(cur_t, next_t)
    next_video = (cur_video + 1) % len(set_clip)
    for video_idx in range(len(set_clip)):
        if video_idx == cur_video:
            continue
        clip = set_clip[random.randrange(0,len(set_clip))].subclip(cur_t, next_t)
        print(cur_video,cur_t)
        t = next_t
        mix_clip.append(clip.set_start(cur_t-1).crossfadein(1))
    cur_video = next_video
    # t = min(min_video_time, t + pad_time)
    # pad_video = set_clip[cur_video].subclip(t,min(min_video_time, t + pad_time))
    # mix_clip.append(pad_video)
result_video = concatenate(mix_clip)
result_video.write_videofile("real_final_video.mp4")




