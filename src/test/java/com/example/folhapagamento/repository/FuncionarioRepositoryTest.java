package com.example.folhapagamento.repository;

import com.example.folhapagamento.model.Funcionario;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;

import java.math.BigDecimal;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

@DataJpaTest
class FuncionarioRepositoryTest {

    @Autowired
    private FuncionarioRepository repository;

    @Test
    void saveGeraIdAutomaticamente() {
        Funcionario salvo = repository.save(
                new Funcionario(null, "Mateus", "Desenvolvedor", new BigDecimal("5000.00")));

        assertNotNull(salvo.getId());
    }

    @Test
    void findByCargoIgnoraMaiusculasEOrdenaPorId() {
        repository.save(new Funcionario(null, "Mateus", "Desenvolvedor", new BigDecimal("5000.00")));
        repository.save(new Funcionario(null, "Bruna", "Analista", new BigDecimal("6000.00")));
        repository.save(new Funcionario(null, "Maria Clara", "desenvolvedor", new BigDecimal("5500.00")));

        List<Funcionario> encontrados = repository.findByCargoIgnoreCaseOrderByIdAsc("DESENVOLVEDOR");

        assertEquals(List.of("Mateus", "Maria Clara"), nomes(encontrados));
    }

    @Test
    void findBySalarioBaseLessThanConsideraApenasSalariosEstritamenteMenores() {
        repository.save(new Funcionario(null, "Mateus", "Desenvolvedor", new BigDecimal("5000.00")));
        repository.save(new Funcionario(null, "Maria Clara", "Analista", new BigDecimal("5500.00")));
        repository.save(new Funcionario(null, "Bruna", "Analista", new BigDecimal("6000.00")));

        List<Funcionario> encontrados = repository.findBySalarioBaseLessThanOrderByIdAsc(new BigDecimal("5500.00"));

        assertEquals(List.of("Mateus"), nomes(encontrados));
    }

    private List<String> nomes(List<Funcionario> funcionarios) {
        return funcionarios.stream().map(Funcionario::getNome).toList();
    }
}
