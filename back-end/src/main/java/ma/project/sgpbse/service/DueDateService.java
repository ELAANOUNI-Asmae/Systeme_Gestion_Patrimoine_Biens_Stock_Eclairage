package ma.project.sgpbse.service;

import lombok.RequiredArgsConstructor;
import ma.project.sgpbse.entity.DueDate;
import ma.project.sgpbse.entity.asset.Document;
import ma.project.sgpbse.repository.DueDateRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;

@Service
@RequiredArgsConstructor
public class DueDateService {

    private final DueDateRepository dueDateRepository;

    @Transactional
    public DueDate createDueDate(LocalDate endDate, String objectMessage, Document document, Integer thresholdDays, String targetPermission) {
        DueDate dueDate = new DueDate();
        LocalDate today = LocalDate.now();

        long margeJours = ChronoUnit.DAYS.between(today, endDate);

        String message;
        if (margeJours < 0) {
            message = "CRITIQUE : Le document " + objectMessage + " est expiré depuis " + Math.abs(margeJours) + " jour(s) !";
        } else if (margeJours == 0) {
            message = "URGENT : Le document " + objectMessage + " expire aujourd'hui !";
        } else {
            message = "ATTENTION : Le document " + objectMessage + " expire dans " + margeJours + " jour(s).";
        }

        dueDate.setEndDate(endDate);
        dueDate.setMargin(margeJours);
        dueDate.setMessage(message);
        dueDate.setDocument(document);

        // Seuil et permission unique
        dueDate.setThresholdDays(thresholdDays != null ? thresholdDays : 30);
        dueDate.setTargetPermission(targetPermission);

        return dueDateRepository.save(dueDate);
    }
}