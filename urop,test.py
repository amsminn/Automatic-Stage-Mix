from moviepy.editor import VideoFileClip, concatenate_videoclips, vfx


def editvideo(videopath1,videopath2,first_stime,first_etime,second_stime,second_etime,fadetime,x1size,y1size,x2size,y2size):
    clip1 = VideoFileClip(videopath1).subclip(first_stime,first_etime).fx(vfx.fadein,fadetime).fx(vfx.fadeout,fadetime)
    clip2 = VideoFileClip(videopath2).subclip(second_stime,second_etime).fx(vfx.fadein,fadetime).fx(vfx.fadeout,fadetime)
    clip2 = clip2.crop(x1=x1size, y1=y1size, x2=x2size, y2=y2size)
    final_video = concatenate_videoclips([clip1,clip2])
    final_video.write_videofile("final_video.mp4")
    return final_video
editvideo("C:/Users/aero0/Desktop/urop/one.mp4","C:/Users/aero0/Desktop/urop/two.mp4",30,49,49.01,80,0.01,0,0,0,0)

