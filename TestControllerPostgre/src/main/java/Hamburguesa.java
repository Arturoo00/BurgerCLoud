package com.example.model;

import java.util.Arrays;

public class Hamburguesa {
    private int id;
    private String nombre;
    private String descripcion;
    private double precio;
    private String imageUrl; // Corresponds to image_url
    private String type;     // Corresponds to type
    private String[] ingredients; // Corresponds to ingredients (TEXT[])
    private int totalScore;   // Corresponds to total_score
    private int ratingCount;  // Corresponds to rating_count

    // Constructor vacío
    public Hamburguesa() {
    }

    // Constructor con campos (ajustado)
    public Hamburguesa(int id, String nombre, String descripcion, double precio, String imageUrl, String type, String[] ingredients, int totalScore, int ratingCount) {
        this.id = id;
        this.nombre = nombre;
        this.descripcion = descripcion;
        this.precio = precio;
        this.imageUrl = imageUrl;
        this.type = type;
        this.ingredients = ingredients;
        this.totalScore = totalScore;
        this.ratingCount = ratingCount;
    }

    // Getters y Setters
    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public String getDescripcion() {
        return descripcion;
    }

    public void setDescripcion(String descripcion) {
        this.descripcion = descripcion;
    }

    public double getPrecio() {
        return precio;
    }

    public void setPrecio(double precio) {
        this.precio = precio;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String[] getIngredients() {
        return ingredients;
    }

    public void setIngredients(String[] ingredients) {
        this.ingredients = ingredients;
    }

    public int getTotalScore() {
        return totalScore;
    }

    public void setTotalScore(int totalScore) {
        this.totalScore = totalScore;
    }

    public int getRatingCount() {
        return ratingCount;
    }

    public void setRatingCount(int ratingCount) {
        this.ratingCount = ratingCount;
    }

    @Override
    public String toString() {
        return "Hamburguesa{" +
                "id=" + id +
                ", nombre='" + nombre + '\'' +
                ", descripcion='" + descripcion + '\'' +
                ", precio=" + precio +
                ", imageUrl='" + imageUrl + '\'' +
                ", type='" + type + '\'' +
                ", ingredients=" + Arrays.toString(ingredients) +
                ", totalScore=" + totalScore +
                ", ratingCount=" + ratingCount +
                '}';
    }
}