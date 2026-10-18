package com.example.folhapagamento.dto;

import java.time.YearMonth;

public record GerarFolhaPagamentoRequest(Long funcionarioId, YearMonth periodo) {
}
