package ma.project.sgpbse.test;

import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class BService {

    private final BRepository bRepository;
    private final BEntityFactory bFactory; // Factory Method dédié
    private final TraitementPartageBStrategy bStrategy; // Strategy dédiée

    @Transactional
    public BResponseDto creerB(CreateBDto dto) {
        // 1. Instanciation via Factory Method
        B b = bFactory.createEntityWithData(dto.nom(), dto.donneeSpecifiqueB());

        // 2. Persistance BDD
        B bSauvegarde = bRepository.save(b);
        return mapToDto(bSauvegarde);
    }

    @Transactional
    public BResponseDto traiterPartageEtActionExclusive(Long id) {
        B b = bRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("B non trouvé : " + id));

        // 1. Exécution de la méthode partagée (Strategy)
        bStrategy.executerLogiqueDifferente(b);

        // 2. Logique 100% exclusive à B (directement dans le service B)
        b.setDonneeSpecifiqueB(b.getDonneeSpecifiqueB() + "_MODIFIE_PAR_SERVICE_B");

        return mapToDto(b);
    }

    private BResponseDto mapToDto(B b) {
        return new BResponseDto(b.getId(), b.getNom(), b.getStatut(), b.getDonneeSpecifiqueB());
    }
}