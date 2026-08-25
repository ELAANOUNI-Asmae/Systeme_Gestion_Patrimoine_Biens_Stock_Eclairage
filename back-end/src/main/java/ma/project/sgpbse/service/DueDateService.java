package ma.project.sgpbse.service;

import jakarta.transaction.Transactional;
import lombok.AllArgsConstructor;
import ma.project.sgpbse.entity.DueDate;
import ma.project.sgpbse.entity.asset.Document;
import ma.project.sgpbse.repository.DueDateRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;

@AllArgsConstructor
@Service
public class DueDateService {

    @Autowired
    private final DueDateRepository dueDateRepository;


    @Transactional
    public DueDate createDueDate(LocalDate endDate, String ObjectMessage, Document document){
        DueDate dueDate = new DueDate();
        LocalDate today = LocalDate.now();

        // Calcul de la marge (dateFin - date d'aujourd'hui en jours)
        long margeJours = ChronoUnit.DAYS.between(today, endDate);

        // Génération du message d'alerte selon l'état de la marge
        String message;
        if (margeJours < 0) {
            message = "CRITIQUE : Le document "+ ObjectMessage +"est expiré depuis " + Math.abs(margeJours) + " jour(s) !";
        } else if (margeJours == 0) {
            message = "URGENT : Le document "+ ObjectMessage +"expire aujourd'hui !";
        } else {
            message = "ATTENTION : Le document "+ ObjectMessage +"expire dans " + margeJours + " jour(s).";
        }

        dueDate.setEndDate(endDate);
        dueDate.setMargin(margeJours);
        dueDate.setMessage(message);
        dueDate.setDocument(document);

        dueDateRepository.save(dueDate);

        return dueDate;
    }
}
