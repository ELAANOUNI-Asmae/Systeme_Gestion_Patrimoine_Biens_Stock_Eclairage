package ma.project.sgpbse.test;

import org.springframework.stereotype.Component;

// Fabrique pour C
@Component
public class CEntityFactory extends AEntityFactory<C> {
    public C createEntityWithData(String nom, Integer nombreSpecifiqueC) {
        C c = createEntity(nom);
        c.setNombreSpecifiqueC(nombreSpecifiqueC);
        return c;
    }

    @Override
    public C createEntity(String nom) {
        C c = new C();
        c.setNom(nom);
        c.setStatut("NOUVEAU");
        return c;
    }
}
