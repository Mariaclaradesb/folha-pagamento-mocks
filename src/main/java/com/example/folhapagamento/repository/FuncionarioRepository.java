package com.example.folhapagamento.repository;

import com.example.folhapagamento.model.Funcionario;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

public interface FuncionarioRepository {

    Funcionario salvar(Funcionario funcionario);

    Optional<Funcionario> buscarPorId(Long id);

    List<Funcionario> listar();

    List<Funcionario> buscarPorCargo(String cargo);

    List<Funcionario> buscarPorSalarioAbaixoDe(BigDecimal limite);

    void remover(Long id);
}
