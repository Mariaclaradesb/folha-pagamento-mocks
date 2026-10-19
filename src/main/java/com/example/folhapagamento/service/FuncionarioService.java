package com.example.folhapagamento.service;

import com.example.folhapagamento.model.Funcionario;
import com.example.folhapagamento.repository.FuncionarioRepository;
import org.springframework.data.domain.Sort;
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
        return repository.save(prepararFuncionario(null, funcionario));
    }

    public Funcionario buscarPorId(Long id) {
        if (id == null || id <= 0) {
            throw new IllegalArgumentException("Identificador deve ser positivo");
        }
        return repository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Funcionário não encontrado: " + id));
    }

    public List<Funcionario> listar() {
        return repository.findAll(Sort.by("id"));
    }

    public Funcionario editar(Long id, Funcionario funcionario) {
        Funcionario atualizado = prepararFuncionario(id, funcionario);
        buscarPorId(id);
        return repository.save(atualizado);
    }

    public void remover(Long id) {
        buscarPorId(id);
        repository.deleteById(id);
    }

    public Funcionario reajustarSalario(Long id, BigDecimal percentual) {
        if (percentual == null || percentual.signum() <= 0) {
            throw new IllegalArgumentException("Percentual de reajuste deve ser maior que zero");
        }
        Funcionario funcionario = buscarPorId(id);
        BigDecimal fator = BigDecimal.ONE.add(percentual.movePointLeft(2));
        BigDecimal novoSalario = funcionario.getSalarioBase().multiply(fator).setScale(2, RoundingMode.HALF_UP);
        return repository.save(new Funcionario(id, funcionario.getNome(), funcionario.getCargo(), novoSalario));
    }

    public List<Funcionario> buscarPorCargo(String cargo) {
        if (cargo == null || cargo.isBlank()) {
            throw new IllegalArgumentException("Cargo é obrigatório");
        }
        return repository.findByCargoIgnoreCaseOrderByIdAsc(cargo.strip());
    }

    public List<Funcionario> buscarPorSalarioAbaixoDe(BigDecimal limite) {
        if (limite == null || limite.signum() <= 0) {
            throw new IllegalArgumentException("Limite salarial deve ser maior que zero");
        }
        return repository.findBySalarioBaseLessThanOrderByIdAsc(limite);
    }

    private Funcionario prepararFuncionario(Long id, Funcionario funcionario) {
        if (funcionario == null || funcionario.getNome() == null || funcionario.getNome().isBlank()) {
            throw new IllegalArgumentException("Nome é obrigatório");
        }
        if (funcionario.getCargo() == null || funcionario.getCargo().isBlank()) {
            throw new IllegalArgumentException("Cargo é obrigatório");
        }
        if (funcionario.getSalarioBase() == null || funcionario.getSalarioBase().compareTo(new BigDecimal("0.01")) < 0) {
            throw new IllegalArgumentException("Salário-base deve ser de pelo menos R$ 0,01");
        }
        return new Funcionario(id, funcionario.getNome().strip(), funcionario.getCargo().strip(),
                funcionario.getSalarioBase().setScale(2, RoundingMode.HALF_UP));
    }
}
