package ma.project.sgpbse.test;

// Interface Strategy
public interface TraitementPartageStrategy<T extends A> {
    void executerLogiqueDifferente(T entite);
}
