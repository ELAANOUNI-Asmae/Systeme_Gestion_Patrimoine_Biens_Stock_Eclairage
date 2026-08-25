package ma.project.sgpbse.test;

import org.springframework.stereotype.Component;

// Stratégie C
@Component
public class TraitementPartageCStrategy implements TraitementPartageStrategy<C> {
    @Override
    public void executerLogiqueDifferente(C c) {
        c.setStatut("PROCESSED_BY_STRATEGY_C");
        System.out.println("Traitement C avec nombre : " + c.getNombreSpecifiqueC());
    }
}
