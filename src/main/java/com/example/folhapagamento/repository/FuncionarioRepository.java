package com.example.folhapagamento.repository;

import com.example.folhapagamento.model.Funcionario;
import org.springframework.data.jpa.repository.JpaRepository;

import java.math.BigDecimal;
import java.util.List;

public interface FuncionarioRepository extends JpaRepository<Funcionario, Long> {

    List<Funcionario> findByCargoIgnoreCaseOrderByIdAsc(String cargo);

    List<Funcionario> findBySalarioBaseLessThanOrderByIdAsc(BigDecimal limite);
}
