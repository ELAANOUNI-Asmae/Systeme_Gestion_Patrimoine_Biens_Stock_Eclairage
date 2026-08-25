package ma.project.sgpbse.test;

// Fabrique Abstraite
public abstract class AEntityFactory<T extends A> {
    public abstract T createEntity(String nom);
}