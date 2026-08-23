package ma.project.sgpbse.test;

import org.springframework.stereotype.Component;

// Stratégie B
@Component
public class TraitementPartageBStrategy implements TraitementPartageStrategy<B> {
    @Override
    public void executerLogiqueDifferente(B b) {
        b.setStatut("PROCESSED_BY_STRATEGY_B");
        System.out.println("Traitement B sur : " + b.getDonneeSpecifiqueB());
    }
}
