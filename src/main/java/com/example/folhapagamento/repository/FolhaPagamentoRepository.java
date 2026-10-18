package com.example.folhapagamento.repository;

import com.example.folhapagamento.model.FolhaPagamento;

import java.time.YearMonth;
import java.util.List;
import java.util.Optional;

public interface FolhaPagamentoRepository {

    FolhaPagamento salvar(FolhaPagamento folha);

    Optional<FolhaPagamento> buscarPorId(Long id);

    List<FolhaPagamento> buscarPorFuncionarioId(Long funcionarioId);

    List<FolhaPagamento> buscarPorPeriodo(YearMonth periodo);
}
