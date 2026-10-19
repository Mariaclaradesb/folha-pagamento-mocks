package com.example.folhapagamento.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;

import java.math.BigDecimal;

@Entity
public class Funcionario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nome;

    @Column(nullable = false)
    private String cargo;

    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal salarioBase;

    protected Funcionario() {
    }

    public Funcionario(Long id, String nome, String cargo, BigDecimal salarioBase) {
        this.id = id;
        this.nome = nome;
        this.cargo = cargo;
        this.salarioBase = salarioBase;
    }

    public Long getId() {
        return id;
    }

    public String getNome() {
        return nome;
    }

    public String getCargo() {
        return cargo;
    }

    public BigDecimal getSalarioBase() {
        return salarioBase;
    }
}
