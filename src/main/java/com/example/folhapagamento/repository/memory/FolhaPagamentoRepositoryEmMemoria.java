package com.example.folhapagamento.repository.memory;

import com.example.folhapagamento.model.FolhaPagamento;
import com.example.folhapagamento.repository.FolhaPagamentoRepository;
import org.springframework.stereotype.Repository;

import java.time.YearMonth;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicLong;

@Repository
public class FolhaPagamentoRepositoryEmMemoria implements FolhaPagamentoRepository {

    private final Map<Long, FolhaPagamento> folhas = new ConcurrentHashMap<>();
    private final AtomicLong sequencia = new AtomicLong();

    @Override
    public FolhaPagamento salvar(FolhaPagamento folha) {
        Long id = folha.id() == null ? sequencia.incrementAndGet() : folha.id();
        sequencia.accumulateAndGet(id, Math::max);
        FolhaPagamento salva = new FolhaPagamento(id, folha.funcionario(), folha.periodo(),
                folha.salarioBruto(), folha.descontoInss(), folha.descontoImpostoRenda(), folha.salarioLiquido());
        folhas.put(id, salva);
        return salva;
    }

    @Override
    public Optional<FolhaPagamento> buscarPorId(Long id) {
        return Optional.ofNullable(folhas.get(id));
    }

    @Override
    public List<FolhaPagamento> buscarPorFuncionarioId(Long funcionarioId) {
        return folhas.values().stream()
                .filter(folha -> folha.funcionario().id().equals(funcionarioId))
                .sorted(Comparator.comparing(FolhaPagamento::id))
                .toList();
    }

    @Override
    public List<FolhaPagamento> buscarPorPeriodo(YearMonth periodo) {
        return folhas.values().stream()
                .filter(folha -> folha.periodo().equals(periodo))
                .sorted(Comparator.comparing(FolhaPagamento::id))
                .toList();
    }
}
