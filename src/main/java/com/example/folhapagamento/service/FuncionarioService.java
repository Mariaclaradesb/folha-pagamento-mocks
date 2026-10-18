package com.example.folhapagamento.service;

import com.example.folhapagamento.model.Funcionario;
import com.example.folhapagamento.repository.FuncionarioRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.NoSuchElementException;

@Service
public class FuncionarioService {

    private final FuncionarioRepository repository;

    public FuncionarioService(FuncionarioRepository repository) {
        this.repository = repository;
    }

    public Funcionario cadastrar(Funcionario funcionario) {
        return repository.salvar(prepararFuncionario(null, funcionario));
    }

    public Funcionario buscarPorId(Long id) {
        if (id == null || id <= 0) {
            throw new IllegalArgumentException("Identificador deve ser positivo");
        }
        return repository.buscarPorId(id)
                .orElseThrow(() -> new NoSuchElementException("Funcionário não encontrado: " + id));
    }

    public List<Funcionario> listar() {
        return repository.listar();
    }

    public Funcionario editar(Long id, Funcionario funcionario) {
        Funcionario atualizado = prepararFuncionario(id, funcionario);
        buscarPorId(id);
        return repository.salvar(atualizado);
    }

    public void remover(Long id) {
        buscarPorId(id);
        repository.remover(id);
    }

    public Funcionario reajustarSalario(Long id, BigDecimal percentual) {
        if (percentual == null || percentual.signum() <= 0) {
            throw new IllegalArgumentException("Percentual de reajuste deve ser maior que zero");
        }
        Funcionario funcionario = buscarPorId(id);
        BigDecimal fator = BigDecimal.ONE.add(percentual.movePointLeft(2));
        BigDecimal novoSalario = funcionario.salarioBase().multiply(fator).setScale(2, RoundingMode.HALF_UP);
        return repository.salvar(new Funcionario(id, funcionario.nome(), funcionario.cargo(), novoSalario));
    }

    public List<Funcionario> buscarPorCargo(String cargo) {
        if (cargo == null || cargo.isBlank()) {
            throw new IllegalArgumentException("Cargo é obrigatório");
        }
        return repository.buscarPorCargo(cargo.strip());
    }

    public List<Funcionario> buscarPorSalarioAbaixoDe(BigDecimal limite) {
        if (limite == null || limite.signum() <= 0) {
            throw new IllegalArgumentException("Limite salarial deve ser maior que zero");
        }
        return repository.buscarPorSalarioAbaixoDe(limite);
    }

    private Funcionario prepararFuncionario(Long id, Funcionario funcionario) {
        if (funcionario == null || funcionario.nome() == null || funcionario.nome().isBlank()) {
            throw new IllegalArgumentException("Nome é obrigatório");
        }
        if (funcionario.cargo() == null || funcionario.cargo().isBlank()) {
            throw new IllegalArgumentException("Cargo é obrigatório");
        }
        if (funcionario.salarioBase() == null || funcionario.salarioBase().compareTo(new BigDecimal("0.01")) < 0) {
            throw new IllegalArgumentException("Salário-base deve ser de pelo menos R$ 0,01");
        }
        return new Funcionario(id, funcionario.nome().strip(), funcionario.cargo().strip(),
                funcionario.salarioBase().setScale(2, RoundingMode.HALF_UP));
    }
}
