package com.example.folhapagamento.model;

import java.math.BigDecimal;
import java.time.YearMonth;

public record FolhaPagamento(
        Long id,
        Funcionario funcionario,
        YearMonth periodo,
        BigDecimal salarioBruto,
        BigDecimal descontoInss,
        BigDecimal descontoImpostoRenda,
        BigDecimal salarioLiquido) {
}
