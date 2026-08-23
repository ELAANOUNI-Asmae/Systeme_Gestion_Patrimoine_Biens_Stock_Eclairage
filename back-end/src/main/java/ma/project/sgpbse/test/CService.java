package ma.project.sgpbse.test;

import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CService {

    private final CRepository cRepository;
    private final CEntityFactory cFactory; // Factory Method dédié
    private final TraitementPartageCStrategy cStrategy; // Strategy dédiée

    @Transactional
    public CResponseDto creerC(CreateCDto dto) {
        // 1. Instanciation via Factory Method
        C c = cFactory.createEntityWithData(dto.nom(), dto.nombreSpecifiqueC());

        // 2. Persistance BDD
        C cSauvegarde = cRepository.save(c);
        return mapToDto(cSauvegarde);
    }

    @Transactional
    public CResponseDto traiterPartageEtActionExclusive(Long id) {
        C c = cRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("C non trouvé : " + id));

        // 1. Exécution de la méthode partagée (Strategy)
        cStrategy.executerLogiqueDifferente(c);

        // 2. Logique 100% exclusive à C
        c.setNombreSpecifiqueC(c.getNombreSpecifiqueC() * 2);

        return mapToDto(c);
    }

    private CResponseDto mapToDto(C c) {
        return new CResponseDto(c.getId(), c.getNom(), c.getStatut(), c.getNombreSpecifiqueC());
    }
}
