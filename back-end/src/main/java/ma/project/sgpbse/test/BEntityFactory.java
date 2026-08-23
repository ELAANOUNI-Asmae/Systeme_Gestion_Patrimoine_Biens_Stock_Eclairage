package ma.project.sgpbse.test;

import org.springframework.stereotype.Component;

// Fabrique pour B
@Component
public class BEntityFactory extends AEntityFactory<B> {
    public B createEntityWithData(String nom, String donneeSpecifiqueB) {
        B b = createEntity(nom);
        b.setDonneeSpecifiqueB(donneeSpecifiqueB);
        return b;
    }

    @Override
    public B createEntity(String nom) {
        B b = new B();
        b.setNom(nom);
        b.setStatut("NOUVEAU");
        return b;
    }
}
