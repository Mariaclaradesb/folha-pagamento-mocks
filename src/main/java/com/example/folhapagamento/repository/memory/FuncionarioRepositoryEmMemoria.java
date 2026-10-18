package com.example.folhapagamento.repository.memory;

import com.example.folhapagamento.model.Funcionario;
import com.example.folhapagamento.repository.FuncionarioRepository;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicLong;

@Repository
public class FuncionarioRepositoryEmMemoria implements FuncionarioRepository {

    private final Map<Long, Funcionario> funcionarios = new ConcurrentHashMap<>();
    private final AtomicLong sequencia = new AtomicLong();

    @Override
    public Funcionario salvar(Funcionario funcionario) {
        Long id = funcionario.id() == null ? sequencia.incrementAndGet() : funcionario.id();
        sequencia.accumulateAndGet(id, Math::max);
        Funcionario salvo = new Funcionario(id, funcionario.nome(), funcionario.cargo(), funcionario.salarioBase());
        funcionarios.put(id, salvo);
        return salvo;
    }

    @Override
    public Optional<Funcionario> buscarPorId(Long id) {
        return Optional.ofNullable(funcionarios.get(id));
    }

    @Override
    public List<Funcionario> listar() {
        return funcionarios.values().stream()
                .sorted(Comparator.comparing(Funcionario::id))
                .toList();
    }

    @Override
    public List<Funcionario> buscarPorCargo(String cargo) {
        return listar().stream()
                .filter(funcionario -> funcionario.cargo().equalsIgnoreCase(cargo))
                .toList();
    }

    @Override
    public List<Funcionario> buscarPorSalarioAbaixoDe(BigDecimal limite) {
        return listar().stream()
                .filter(funcionario -> funcionario.salarioBase().compareTo(limite) < 0)
                .toList();
    }

    @Override
    public void remover(Long id) {
        funcionarios.remove(id);
    }
}
