package no.kantega.labs.internetvideo;

import com.xuggle.mediatool.IMediaReader;
import com.xuggle.mediatool.IMediaWriter;
import com.xuggle.mediatool.MediaToolAdapter;
import com.xuggle.mediatool.ToolFactory;
import com.xuggle.mediatool.event.IVideoPictureEvent;

import java.awt.*;
import java.awt.image.BufferedImage;
import java.io.File;
import java.io.IOException;
import java.util.concurrent.atomic.AtomicInteger;

/**
 *
 */
public class AvgColor {


    public static void main(String[] args) throws IOException {
        new AvgColor().consumeVideo();
    }

    private void consumeVideo() throws IOException {


        IMediaReader reader = ToolFactory.makeReader(new File("src/main/webapp/heist.mp4").getAbsolutePath());

        IMediaWriter writer = ToolFactory.makeWriter(new File("movies/heist-avg.mp4").getAbsolutePath(), reader);


        reader.setBufferedImageTypeToGenerate(BufferedImage.TYPE_3BYTE_BGR);

        final AtomicInteger c = new AtomicInteger();

        MediaToolAdapter averager = new MediaToolAdapter() {

            @Override
            public void onVideoPicture(IVideoPictureEvent event) {
                System.out.println("Frame " + c.incrementAndGet());

                long red = 0;
                long green = 0;
                long blue = 0;

                int[] pixels = event.getImage().getRGB(0, 0, 640, 360, new int[640 * 360], 0, 640);

                int numPixels = 0;

                for (int rgb : pixels) {
                    int r = rgb >> 16 & 0xff;
                    int g = (rgb >> 8) & 0xFF;
                    int b = rgb & 0xFF;
                    if(r +g+b != 0) {
                        red +=r;
                        green += g;
                        blue += b;
                        numPixels++;
                    }
                }

                Graphics g = event.getImage().getGraphics();

                if (numPixels > 0) {
                    red /= numPixels;
                    green /= numPixels;
                    blue /= numPixels;
                    g.setColor(new Color((int) red, (int) green, (int) blue));
                } else {
                    g.setColor(Color.BLACK);
                }

                g.fillArc(20, 20, 150, 150, 0, 360);

                g.setColor(Color.WHITE);

                g.drawArc(20, 20, 150, 150, 0, 360);

                g.dispose();

                super.onVideoPicture(event);
            }
        };


        reader.addListener(averager);

        averager.addListener(writer);


        while (reader.readPacket() == null && c.get() < 25*20) {

        }

        reader.close();

        System.exit(0);
    }
}
