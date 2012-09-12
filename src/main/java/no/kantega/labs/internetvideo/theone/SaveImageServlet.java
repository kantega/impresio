package no.kantega.labs.internetvideo.theone;


import org.apache.commons.codec.binary.Base64;
import org.apache.commons.io.IOUtils;

import javax.mail.*;
import javax.mail.internet.InternetAddress;
import javax.mail.internet.MimeBodyPart;
import javax.mail.internet.MimeMessage;
import javax.mail.internet.MimeMultipart;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.util.Date;
import java.util.Properties;

/**
 *
 */
public class SaveImageServlet extends HttpServlet {


    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        String data = req.getParameter("data");
        String email = req.getParameter("email");


        String base64 = data.substring(data.indexOf(",")+1);

        byte[] bytes = Base64.decodeBase64(base64.getBytes("utf-8"));

        saveFile(bytes);

        if(email != null) {
            sendMail(email, bytes);
        }
    }

    private void sendMail(String email, byte[] bytes) {
        try {


            Properties props = new Properties();
            props.setProperty("mail.smtp.host", System.getProperty("mail.smtp.host", "arthur.aksess.no"));
            Session session = Session.getInstance(props);


            MimeMessage message = new MimeMessage(session);
            InternetAddress fromAddress = new InternetAddress("eirbjo@kantega.no");
            InternetAddress toAddress[] = InternetAddress.parse(email);

            message.setFrom(fromAddress);

            message.setRecipients(Message.RecipientType.TO, toAddress);
            message.setSubject("Er du brikken vi leter etter?", "ISO-8859-1");
            message.setSentDate(new Date());

            Multipart mp = new MimeMultipart();

            {
                MimeBodyPart part = new MimeBodyPart();
                part.setContent("<h1>Hei!</h1><p>Hyggelig &aring; treffe deg p&aring; JavaZone!<p>"
                        +"Husk at vi i Kantega leter etter flere utviklere og testere.</p>" +
                        "<p>Kanskje du er brikken vi mangler?</p> <p>Se <a href=\"http://kantega.no/\">http://kantega.no/</p>" +
                        "<img src=\"cid:image\">", "text/html");
                mp.addBodyPart(part);
            }
            {
                MimeBodyPart part = new MimeBodyPart();
                part.setContent(bytes, "image/jpg");
                part.setFileName("brikken.png");
                part.setHeader("Content-ID","<image>");
                mp.addBodyPart(part);

            }

            message.setContent(mp);
            Transport.send(message);
        } catch (MessagingException e) {
            throw new RuntimeException(e);

        }
    }

    private void saveFile(byte[] bytes) throws IOException {
        File file = new File("images", System.currentTimeMillis() + ".png");

        file.getParentFile().mkdirs();

        FileOutputStream out = new FileOutputStream(file);
        IOUtils.write(bytes, out);

        out.close();
    }
}
