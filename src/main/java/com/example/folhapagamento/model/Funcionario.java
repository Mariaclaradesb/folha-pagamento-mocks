package com.example.folhapagamento.model;

import java.math.BigDecimal;

public record Funcionario(Long id, String nome, String cargo, BigDecimal salarioBase) {
}
