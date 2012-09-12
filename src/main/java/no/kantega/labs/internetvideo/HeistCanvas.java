package no.kantega.labs.internetvideo;

import com.xuggle.mediatool.IMediaReader;
import com.xuggle.mediatool.MediaToolAdapter;
import com.xuggle.mediatool.ToolFactory;
import com.xuggle.mediatool.event.IVideoPictureEvent;

import javax.imageio.ImageIO;
import java.awt.*;
import java.awt.image.BufferedImage;
import java.io.File;
import java.io.IOException;

/**
 *
 */
public class HeistCanvas {


    public static void main(String[] args) throws IOException {
        new HeistCanvas().consumeVideo();
    }

    private void consumeVideo() throws IOException {

        final int rate = 50;
        final int w = 138;
        final int h = 78;
        final int cols = 10;
        int cw = w*cols;
        int ch = h*12;

        final BufferedImage buffer = new BufferedImage(cw, ch, BufferedImage.TYPE_3BYTE_BGR);

        IMediaReader reader = ToolFactory.makeReader(new File("heist.mp4").getAbsolutePath());

        reader.setBufferedImageTypeToGenerate(BufferedImage.TYPE_3BYTE_BGR);

        reader.addListener(new MediaToolAdapter() {
            int c;

            @Override
            public void onVideoPicture(IVideoPictureEvent event) {
                if(c++ % rate == 0) {
                    int i = c/rate;

                    int cellX = i % cols;
                    int cellY = i /cols;

                    int x = cellX * w;
                    int y = cellY * h;

                    Graphics g = buffer.getGraphics();

                    g.drawImage(event.getImage(), x, y, w, h, null);

                    g.dispose();
                }
            }
        });
        while(reader.readPacket() == null) {

        }

        reader.close();

        ImageIO.write(buffer, "png", new File("heist.png"));

        System.exit(0);
    }
}
