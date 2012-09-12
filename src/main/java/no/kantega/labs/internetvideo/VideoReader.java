package no.kantega.labs.internetvideo;

import com.xuggle.mediatool.IMediaReader;
import com.xuggle.mediatool.MediaToolAdapter;
import com.xuggle.mediatool.ToolFactory;
import com.xuggle.mediatool.event.IVideoPictureEvent;

import java.io.File;
import java.io.IOException;

import static java.lang.String.format;

/**
 *
 */
public class VideoReader {


    public static void main(String[] args) throws IOException {
        new VideoReader().consumeVideo();
    }

    private void consumeVideo() throws IOException {

        IMediaReader reader = ToolFactory.makeReader(new File("src/main/webapp/heist.mp4").getAbsolutePath());

        reader.addListener(new MediaToolAdapter() {

            int c;

            @Override
            public void onVideoPicture(IVideoPictureEvent event) {
                System.out.println(format("Frame %s at %s",
                                c++,
                                event.getPicture().getFormattedTimeStamp()));
            }
        });

        while(reader.readPacket() == null) {

        }

        reader.close();
    }
}
