package ma.project.sgpbse.service.user;

import lombok.RequiredArgsConstructor;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    public void sendPasswordResetEmail(
            String recipientEmail,
            String resetLink
    ) {

        SimpleMailMessage message = new SimpleMailMessage();

        message.setTo(recipientEmail);

        message.setSubject("Réinitialisation du mot de passe");

        message.setText("""
                Bonjour,

                Vous avez demandé la réinitialisation de votre mot de passe.

                Cliquez sur le lien ci-dessous :

                %s

                Ce lien expirera dans 15 minutes.

                Si vous n'êtes pas à l'origine de cette demande, ignorez simplement cet email.

                Cordialement,
                L'équipe SGPBSE
                """.formatted(resetLink));

        mailSender.send(message);
    }
}