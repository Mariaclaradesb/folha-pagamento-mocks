package com.example.folhapagamento.model;

import jakarta.persistence.Column;
import jakarta.persistence.Convert;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;

import java.math.BigDecimal;
import java.time.YearMonth;

@Entity
public class FolhaPagamento {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn(name = "funcionario_id", nullable = false)
    private Funcionario funcionario;

    @Convert(converter = YearMonthConverter.class)
    @Column(nullable = false, length = 7)
    private YearMonth periodo;

    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal salarioBruto;

    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal descontoInss;

    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal descontoImpostoRenda;

    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal salarioLiquido;

    protected FolhaPagamento() {
    }

    public FolhaPagamento(Long id, Funcionario funcionario, YearMonth periodo, BigDecimal salarioBruto,
                          BigDecimal descontoInss, BigDecimal descontoImpostoRenda, BigDecimal salarioLiquido) {
        this.id = id;
        this.funcionario = funcionario;
        this.periodo = periodo;
        this.salarioBruto = salarioBruto;
        this.descontoInss = descontoInss;
        this.descontoImpostoRenda = descontoImpostoRenda;
        this.salarioLiquido = salarioLiquido;
    }

    public Long getId() {
        return id;
    }

    public Funcionario getFuncionario() {
        return funcionario;
    }

    public YearMonth getPeriodo() {
        return periodo;
    }

    public BigDecimal getSalarioBruto() {
        return salarioBruto;
    }

    public BigDecimal getDescontoInss() {
        return descontoInss;
    }

    public BigDecimal getDescontoImpostoRenda() {
        return descontoImpostoRenda;
    }

    public BigDecimal getSalarioLiquido() {
        return salarioLiquido;
    }
}
