package ma.project.sgpbse.service.user;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    public void sendPasswordResetEmail(
            String recipientEmail,
            String resetLink
    ) {
        try {
            MimeMessage message = mailSender.createMimeMessage();

            MimeMessageHelper helper = new MimeMessageHelper(
                    message,
                    true,
                    "UTF-8"
            );

            helper.setTo(recipientEmail);

            helper.setSubject(
                    "Réinitialisation du mot de passe - SGPBSE"
            );

            String plainText = """
                    Bonjour,

                    Vous avez demandé la réinitialisation de votre mot de passe SGPBSE.

                    Utilisez le lien suivant :

                    %s

                    Ce lien est valable pendant 15 minutes.

                    Si vous n'êtes pas à l'origine de cette demande,
                    ignorez simplement cet e-mail.

                    Cordialement,
                    L'équipe SGPBSE
                    """.formatted(resetLink);

            String htmlText = """
                    <!DOCTYPE html>
                    <html lang="fr">
                    <head>
                        <meta charset="UTF-8">
                        <meta name="viewport"
                              content="width=device-width, initial-scale=1.0">
                    </head>

                    <body style="
                        margin: 0;
                        padding: 0;
                        background: #f8fafc;
                        font-family: Arial, sans-serif;
                        color: #1e293b;
                    ">

                        <div style="
                            max-width: 600px;
                            margin: 30px auto;
                            background: white;
                            border-radius: 12px;
                            padding: 30px;
                            box-shadow: 0 4px 12px rgba(0,0,0,0.08);
                        ">

                            <h2 style="
                                margin-top: 0;
                                color: #0f172a;
                            ">
                                Réinitialisation du mot de passe
                            </h2>

                            <p>
                                Bonjour,
                            </p>

                            <p>
                                Vous avez demandé la réinitialisation
                                de votre mot de passe SGPBSE.
                            </p>

                            <p style="
                                margin: 30px 0;
                                text-align: center;
                            ">
                                <a
                                    href="%s"
                                    style="
                                        display: inline-block;
                                        background: #f97316;
                                        color: white;
                                        padding: 13px 24px;
                                        border-radius: 8px;
                                        text-decoration: none;
                                        font-weight: bold;
                                    "
                                >
                                    Réinitialiser mon mot de passe
                                </a>
                            </p>

                            <p>
                                Ce lien est valable pendant
                                <strong>15 minutes</strong>.
                            </p>

                            <p>
                                Si vous utilisez l'application mobile,
                                vous pouvez copier le lien ci-dessous
                                et le coller dans l'écran de
                                réinitialisation :
                            </p>

                            <div style="
                                padding: 12px;
                                background: #f1f5f9;
                                border-radius: 8px;
                                word-break: break-all;
                                font-size: 13px;
                            ">
                                %s
                            </div>

                            <p style="margin-top: 24px;">
                                Si vous n'êtes pas à l'origine de cette
                                demande, ignorez simplement cet e-mail.
                            </p>

                            <p>
                                Cordialement,<br>
                                <strong>L'équipe SGPBSE</strong>
                            </p>

                        </div>

                    </body>
                    </html>
                    """.formatted(
                    resetLink,
                    resetLink
            );

            helper.setText(
                    plainText,
                    htmlText
            );

            mailSender.send(message);

        } catch (MessagingException exception) {
            throw new IllegalStateException(
                    "Impossible de préparer l'e-mail de réinitialisation.",
                    exception
            );
        }
    }
}