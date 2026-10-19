package com.example.folhapagamento.repository;

import com.example.folhapagamento.model.FolhaPagamento;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.YearMonth;
import java.util.List;

public interface FolhaPagamentoRepository extends JpaRepository<FolhaPagamento, Long> {

    List<FolhaPagamento> findByFuncionarioIdOrderByIdAsc(Long funcionarioId);

    List<FolhaPagamento> findByPeriodoOrderByIdAsc(YearMonth periodo);
}
