package no.kantega.labs.internetvideo;

import com.xuggle.mediatool.IMediaWriter;
import com.xuggle.mediatool.ToolFactory;
import com.xuggle.xuggler.Configuration;
import com.xuggle.xuggler.ICodec;
import com.xuggle.xuggler.IStreamCoder;

import javax.imageio.ImageIO;
import java.awt.*;
import java.awt.image.BufferedImage;
import java.io.File;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.TimeUnit;

/**
 *
 *
 */
public class VideoProducer
{
    private static String[] frames = new String[] {"frame1.jpg", "frame2.jpg", "frame3.jpg"};

    public static void main( String[] args )
    {
        new VideoProducer().produceVideo();
    }

    private void produceVideo() {


        BufferedImage[] frames = loadFrames();

        IMediaWriter writer = createWriter();

        BufferedImage buffer = new BufferedImage(150, 180,
                                                 BufferedImage.TYPE_3BYTE_BGR);

        long time = 0;

        for(int i = 0; i < 100; i++ , time += 100) {


            Graphics2D g = (Graphics2D) buffer.getGraphics();

            g.drawImage(frames[i%3], 0, 0, null);

            g.dispose();

            writer.encodeVideo(0, buffer, time, TimeUnit.MILLISECONDS);

        }

        writer.close();
        System.exit(0);

    }

    private IMediaWriter createWriter() {

        File outputFile = new File("movie.mp4");

        final IMediaWriter writer = ToolFactory.makeWriter(outputFile.getAbsolutePath());

        writer.addVideoStream(0,
                0,
                ICodec.ID.CODEC_ID_H264,
                150,
                180);

        final IStreamCoder coder = writer.getContainer().getStream(0).getStreamCoder();
        File presetFile = new File("preset.txt");
        Configuration.configure(presetFile.getAbsolutePath(), coder);
        coder.setBitRate(500000);
        coder.setBitRateTolerance(500000);
        return writer;
    }

    private BufferedImage[] loadFrames() {

        try {
            List<BufferedImage> images = new ArrayList();

            for(String name : frames) {

                images.add(ImageIO.read(getClass().getResource(name)));

            }

            return images.toArray(new BufferedImage[images.size()]);
        } catch (IOException e) {
            throw new RuntimeException(e);
        }

    }
}
