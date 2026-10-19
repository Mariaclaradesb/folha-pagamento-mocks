package com.example.folhapagamento.repository;

import com.example.folhapagamento.model.FolhaPagamento;
import com.example.folhapagamento.model.Funcionario;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;

import java.math.BigDecimal;
import java.time.YearMonth;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;

@DataJpaTest
class FolhaPagamentoRepositoryTest {

    private static final YearMonth MARCO = YearMonth.of(2025, 3);
    private static final YearMonth ABRIL = YearMonth.of(2025, 4);

    @Autowired
    private FolhaPagamentoRepository repository;

    @Autowired
    private FuncionarioRepository funcionarioRepository;

    @Test
    void findByPeriodoFiltraPeloMesEOrdenaPorId() {
        Funcionario mateus = salvarFuncionario("Mateus");
        Funcionario bruna = salvarFuncionario("Bruna");
        Funcionario mariaClara = salvarFuncionario("Maria Clara");
        repository.save(folha(mateus, MARCO));
        repository.save(folha(bruna, ABRIL));
        repository.save(folha(mariaClara, MARCO));

        List<FolhaPagamento> encontradas = repository.findByPeriodoOrderByIdAsc(MARCO);

        assertEquals(List.of("Mateus", "Maria Clara"),
                encontradas.stream().map(folha -> folha.getFuncionario().getNome()).toList());
    }

    @Test
    void findByFuncionarioIdFiltraPeloFuncionarioEOrdenaPorId() {
        Funcionario mateus = salvarFuncionario("Mateus");
        Funcionario bruna = salvarFuncionario("Bruna");
        repository.save(folha(mateus, MARCO));
        repository.save(folha(bruna, MARCO));
        repository.save(folha(mateus, ABRIL));

        List<FolhaPagamento> encontradas = repository.findByFuncionarioIdOrderByIdAsc(mateus.getId());

        assertEquals(List.of(MARCO, ABRIL), encontradas.stream().map(FolhaPagamento::getPeriodo).toList());
    }

    private Funcionario salvarFuncionario(String nome) {
        return funcionarioRepository.save(new Funcionario(null, nome, "Analista", new BigDecimal("5000.00")));
    }

    private FolhaPagamento folha(Funcionario funcionario, YearMonth periodo) {
        return new FolhaPagamento(null, funcionario, periodo, new BigDecimal("5000.00"),
                new BigDecimal("500.00"), new BigDecimal("125.00"), new BigDecimal("4375.00"));
    }
}
